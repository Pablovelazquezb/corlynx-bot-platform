
const FETCH_URL = 'https://corlynx-bot-platform.vercel.app/api/webhook/whatsapp';

async function main() {
    console.log(`Sending test message to: ${FETCH_URL}`);

    const payload = {
        object: 'whatsapp_business_account',
        entry: [{
            changes: [{
                value: {
                    messaging_product: 'whatsapp',
                    metadata: {
                        display_phone_number: '15550213123',
                        phone_number_id: '911051555422141' // Matches the ID found in DB
                    },
                    messages: [{
                        from: '5215555555555', // Mock User Number
                        id: 'wamid.test',
                        timestamp: Date.now().toString(),
                        text: {
                            body: 'Hello from verification script'
                        },
                        type: 'text'
                    }]
                }
            }]
        }]
    };

    try {
        const res = await fetch(FETCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response Body: ${text}`);

        if (res.status === 200) {
            console.log('✅ Webhook accepted the message. The bot processed it.');
            console.log('If you did NOT receive a reply on WhatsApp, the issue is likely the OUTGOING credentials (Access Token or Phone ID).');
        } else {
            console.log('❌ Webhook rejected the message or crashed.');
        }
    } catch (error) {
        console.error('Error sending request:', error);
    }
}

main();
