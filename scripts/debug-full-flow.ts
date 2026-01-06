
import { PrismaClient } from '@prisma/client';
import { generateResponse } from '@/lib/agent';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Deep Debug of Bot Flow...');

    try {
        // 1. Fetch Bot
        console.log('1. Fetching Bot from DB...');
        const bot = await prisma.bot.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!bot) {
            console.error('❌ No bot found!');
            return;
        }
        console.log(`✅ Found Bot: ${bot.name} (ID: ${bot.id})`);
        console.log(`   - WhatsApp Phone ID: ${bot.whatsappPhoneNumberId ? 'Present' : 'MISSING'}`);
        console.log(`   - WhatsApp Token: ${bot.whatsappAccessToken ? 'Present (' + bot.whatsappAccessToken.substring(0, 10) + '...)' : 'MISSING'}`);
        console.log(`   - OpenAI Key: ${bot.openaiApiKey ? 'Present (' + bot.openaiApiKey.substring(0, 10) + '...)' : 'MISSING'}`);

        if (!bot.whatsappAccessToken || !bot.whatsappPhoneNumberId) {
            console.error('❌ MISSING CREDENTIALS. Cannot proceed.');
            return;
        }

        // 2. Test OpenAI
        console.log('\n2. Testing OpenAI Generation...');
        const testHistory: any[] = [];
        const userMessage = "Hello, this is a debug test.";

        let responseText = "";
        try {
            responseText = await generateResponse(bot.prompt, testHistory, userMessage, bot.openaiApiKey);
            console.log(`✅ OpenAI Responded: "${responseText}"`);
        } catch (error) {
            console.error('❌ OpenAI Failed:', error);
            return;
        }

        // 3. Test WhatsApp Sending
        console.log('\n3. Testing WhatsApp Sending...');
        // We will send to the user's personal number if they are in the DB messages, otherwise we can't guess it easily.
        // Actually, we can just use the "to" number from a real message in DB if it exists, or ask user.
        // For safety, let's try to look for the last message received to reply to it.

        const lastMessage = await prisma.message.findFirst({
            where: { role: 'user', botId: bot.id },
            orderBy: { createdAt: 'desc' }
        });

        if (lastMessage) {
            // We don't store the phone number in the Message model currently (based on schema view earlier)!
            // Wait, let's check schema/migration.
            // The `Message` model has `content`, `role`, `botId`. It DOES NOT have `from` number.
            // That's a huge bug if true. The app implies it sends back to `from` in route.ts: `const from = message.from;`
            // But `from` is passed directly from the webhook payload to `sendWhatsAppMessage`.
            // It is NOT stored in the DB message.
            // So I cannot find the phone number from the DB.

            console.log('⚠️ Cannot obtain target phone number from DB (Schema limitation).');
            console.log('   Skipping actual WhatsApp send test. But OpenAI worked.');
            console.log('   Configuration appears VALID for AI.');

            // We can try to send to a hardcoded number if we had one.
            // Let's check if the previous logs had one.
            // In Step 366 request, user provided "529212236568" in the screenshot command!
            const targetPhone = "529212236568";
            console.log(`   Attempting to send to ${targetPhone} (from screenshot)...`);

            try {
                await sendWhatsAppMessage(targetPhone, responseText, bot.whatsappAccessToken, bot.whatsappPhoneNumberId);
                console.log('✅ WhatsApp API Call executed (check your phone!).');
            } catch (e) {
                console.error('❌ WhatsApp API Call Failed:', e);
            }

        } else {
            console.log('⚠️ No previous user messages found to grab a phone number from.');
        }

    } catch (error) {
        console.error('❌ Debug Script Crashed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
