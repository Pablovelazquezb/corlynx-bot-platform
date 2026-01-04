import OpenAI from 'openai';

export async function generateResponse(
    systemPrompt: string,
    history: { role: 'user' | 'assistant' | 'system'; content: string }[],
    userMessage: string,
    apiKey?: string | null
) {
    try {
        const openai = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY || 'dummy-key',
        });

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role as 'user' | 'assistant' | 'system', content: msg.content })),
            { role: 'user', content: userMessage },
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Cost-effective model
            messages: messages as any,
        });

        return completion.choices[0].message.content || 'No response generated.';
    } catch (error) {
        console.error('Error generating response:', error);
        return 'Sorry, I am having trouble thinking right now.';
    }
}
