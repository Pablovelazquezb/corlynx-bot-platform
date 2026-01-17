
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const botId = searchParams.get('botId');

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const payload = await req.json();
        const { message } = payload;

        // Vapi sends different types of messages. We are interested in 'conversation-update' or 'call-end' mostly,
        // but for real-time chat logs, we might want 'function-call' or just the specific messages.
        // Actually, Vapi sends a 'message' object which can be of type 'conversation-update' containing the conversation.
        // Or we can rely on 'transcript' events if configured.
        // For simplicity, let's look for 'message' type 'transcript' or 'conversation-update'.

        // Review Vapi docs (simulated): Vapi sends `message` with `type` property.
        // Common types: 'call-status-update', 'transcript', 'function-call', 'speech-update'.
        // `transcript` contains `transcriptType`: 'provisional' | 'final', and `transcript`: string.

        // We want to save 'final' transcripts to the messages table.

        if (message?.type === 'transcript' && message.transcriptType === 'final') {
            const role = message.role === 'assistant' ? 'assistant' : 'user';
            const content = message.transcript;

            await prisma.message.create({
                data: {
                    content,
                    role,
                    botId,
                },
            });
        }

        if (message?.type === 'end-of-call-report' && message.analysis?.summary) {
            await prisma.message.create({
                data: {
                    content: `[Call Summary] ${message.analysis.summary}`,
                    role: 'system',
                    botId,
                },
            });
        }
        // Also handle 'end-of-call-report' which gives the summary, if we want.
        // For now, saving transcripts is enough to show the chat.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error handling Vapi webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
