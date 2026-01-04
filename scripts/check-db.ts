import { prisma } from '../lib/db';

async function main() {
    const lastMessage = await prisma.message.findFirst({
        orderBy: { createdAt: 'desc' },
    });
    console.log('Last message:', lastMessage);
}

main();
