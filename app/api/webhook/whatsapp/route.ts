import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateResponse } from '@/lib/agent';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

// Verify webhook (GET)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'my-verify-token';

    if (mode === 'subscribe' && token === verifyToken) {
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
}

// Handle messages (POST)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Check if it's a WhatsApp status update or message
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];
            const phoneNumberId = value?.metadata?.phone_number_id;

            if (message && message.type === 'text') {
                const from = message.from; // User's phone number
                const text = message.text.body;

                // Find bot by phone number ID, or fallback to first bot (legacy/dev support)
                let bot = null;
                if (phoneNumberId) {
                    bot = await prisma.bot.findFirst({
                        where: { whatsappPhoneNumberId: phoneNumberId }
                    });
                }

                if (!bot) {
                    bot = await prisma.bot.findFirst({
                        orderBy: { updatedAt: 'desc' },
                    });
                }

                if (bot) {
                    // Save user message
                    await prisma.message.create({
                        data: {
                            content: text,
                            role: 'user',
                            botId: bot.id,
                        },
                    });

                    // Get history
                    const history = await prisma.message.findMany({
                        where: { botId: bot.id },
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    });

                    const formattedHistory = history.reverse().map(msg => ({
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content,
                    }));

                    // Generate response
                    const responseText = await generateResponse(bot.prompt, formattedHistory, text, bot.openaiApiKey);

                    // Save assistant message
                    await prisma.message.create({
                        data: {
                            content: responseText,
                            role: 'assistant',
                            botId: bot.id,
                        },
                    });

                    // Send back to WhatsApp
                    await sendWhatsAppMessage(from, responseText, bot.whatsappAccessToken, bot.whatsappPhoneNumberId);
                }
            }
        }

        return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
