
const VAPI_API_URL = 'https://api.vapi.ai';

interface CreateAssistantParams {
    name: string;
    prompt: string;
    apiKey: string;
}

interface UpdateAssistantParams {
    assistantId: string;
    name: string;
    prompt: string;
    apiKey: string;
}

interface ImportTwilioParams {
    phoneNumber: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    assistantId: string;
    apiKey: string;
}

export async function createVapiAssistant({ name, prompt, apiKey }: CreateAssistantParams) {
    const response = await fetch(`${VAPI_API_URL}/assistant`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            model: {
                provider: 'openai',
                model: 'gpt-3.5-turbo', // Cost effective default
                messages: [
                    {
                        role: 'system',
                        content: prompt,
                    },
                ]
            },
            voice: {
                provider: '11labs',
                voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - Default voice
            },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create Vapi assistant: ${error}`);
    }

    return response.json();
}

export async function updateVapiAssistant({ assistantId, name, prompt, apiKey }: UpdateAssistantParams) {
    const response = await fetch(`${VAPI_API_URL}/assistant/${assistantId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            model: {
                messages: [
                    {
                        role: 'system',
                        content: prompt,
                    },
                ]
            }
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update Vapi assistant: ${error}`);
    }

    return response.json();
}

export async function importTwilioNumberToVapi({
    phoneNumber,
    twilioAccountSid,
    twilioAuthToken,
    assistantId,
    apiKey
}: ImportTwilioParams) {

    // 1. Create/Import phone number in Vapi
    const response = await fetch(`${VAPI_API_URL}/phone-number`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            provider: 'twilio',
            number: phoneNumber,
            twilioAccountSid,
            twilioAuthToken,
            assistantId, // Link immediately to the assistant
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        // It might error if number already exists, so we might want to try updating it or just logging
        console.warn(`Warning importing phone number to Vapi: ${error}`);

        // If it exists, we might need to update it to point to the new assistant
        // But for now let's assume it throws if it fails.
        // If the error says "already exists", we should probably search for it and update.
        // simpler for MVP: throw.
        throw new Error(`Failed to import Twilio number: ${error}`);
    }

    return response.json();
}
