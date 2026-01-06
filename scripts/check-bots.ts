
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database connection...');
    try {
        const bots = await prisma.bot.findMany();
        console.log(`Found ${bots.length} bots.`);
        bots.forEach(bot => {
            console.log(`- Bot: ${bot.name} (ID: ${bot.id})`);
            console.log(`  Phone ID: ${bot.whatsappPhoneNumberId || 'Not Set'}`);
            console.log(`  OpenAI Key: ${bot.openaiApiKey ? 'Set' : 'Not Set'}`);
        });

        if (bots.length === 0) {
            console.log('\nWARNING: No bots found! The webhook needs at least one bot to function.');
        }
    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
