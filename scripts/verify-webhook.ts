import { prisma } from '../lib/db';

async function main() {
    // 1. Get a bot to test with
    const bot = await prisma.bot.findFirst();
    if (!bot) {
        console.error('No bot found. Please create one first.');
        process.exit(1);
    }

    console.log(`Testing webhook with bot: ${bot.name} (${bot.id})`);

    // 2. Mock WhatsApp Payload
    // We use a fake phone number ID. If you updated the bot with a real one, use that.
    // The webhook logic tries to find a bot by phone_number_id, or falls back to the latest one.
    const payload = {
        object: 'whatsapp_business_account',
        entry: [
            {
                id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
                changes: [
                    {
                        value: {
                            messaging_product: 'whatsapp',
                            metadata: {
                                display_phone_number: '1234567890',
                                phone_number_id: bot.whatsappPhoneNumberId || '123456789',
                            },
                            messages: [
                                {
                                    from: '529212236568',
                                    id: 'wamid.HBgLM...',
                                    timestamp: '1689876543',
                                    text: {
                                        body: 'Hello from verification script!',
                                    },
                                    type: 'text',
                                },
                            ],
                        },
                        field: 'messages',
                    },
                ],
            },
        ],
    };

    // 3. Send POST request to localhost
    try {
        const response = await fetch('http://localhost:3000/api/webhook/whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log(`Webhook Response Status: ${response.status}`);
        const text = await response.text();
        console.log(`Webhook Response Body: ${text}`);

        if (response.ok) {
            console.log('Webhook processed successfully. Check the dashboard or database for the new message.');
        } else {
            console.error('Webhook failed.');
        }

    } catch (error) {
        console.error('Error sending request to webhook:', error);
        console.log('Make sure the Next.js server is running (npm run dev) on port 3000.');
    }
}

main();
