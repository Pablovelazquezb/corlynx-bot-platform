import { prisma } from '../lib/db';
import { generateResponse } from '../lib/agent';

async function main() {
    console.log('Creating test bot...');
    const bot = await prisma.bot.create({
        data: {
            name: 'Test Bot',
            prompt: 'You are a helpful test assistant.',
        },
    });
    console.log('Bot created:', bot.id);

    console.log('Testing agent generation...');
    const response = await generateResponse(
        bot.prompt,
        [],
        'Hello, are you working?'
    );
    console.log('Agent response:', response);

    if (response && response.length > 0) {
        console.log('SUCCESS: Agent generated a response.');
    } else {
        console.error('FAILURE: Agent did not generate a response.');
    }

    console.log('Cleaning up...');
    await prisma.bot.delete({ where: { id: bot.id } });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
