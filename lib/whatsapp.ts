export async function sendWhatsAppMessage(
    to: string,
    text: string,
    accessToken?: string | null,
    phoneNumberId?: string | null
) {
    const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
        console.error('Missing WhatsApp credentials');
        return;
    }

    try {
        const res = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to,
                text: { body: text },
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            console.error('Error sending WhatsApp message:', error);
        }
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
}
