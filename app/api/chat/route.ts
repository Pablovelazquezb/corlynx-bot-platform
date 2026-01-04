import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateResponse } from '@/lib/agent';

export async function POST(req: Request) {
    try {
        const { botId, message } = await req.json();

        if (!botId || !message) {
            return NextResponse.json({ error: 'Missing botId or message' }, { status: 400 });
        }

        const bot = await prisma.bot.findUnique({
            where: { id: botId },
        });

        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Save user message
        await prisma.message.create({
            data: {
                content: message,
                role: 'user',
                botId: bot.id,
            },
        });

        // Fetch recent history (last 10 messages)
        const history = await prisma.message.findMany({
            where: { botId: bot.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Reverse to chronological order
        const formattedHistory = history.reverse().map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        }));

        // Generate response
        const responseContent = await generateResponse(bot.prompt, formattedHistory, message, bot.openaiApiKey);

        // Save assistant message
        const assistantMessage = await prisma.message.create({
            data: {
                content: responseContent,
                role: 'assistant',
                botId: bot.id,
            },
        });

        return NextResponse.json({ message: assistantMessage });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
