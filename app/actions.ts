'use server';

import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createVapiAssistant, updateVapiAssistant, importTwilioNumberToVapi } from '@/lib/vapi';

export async function createBot(formData: FormData) {
    const name = formData.get('name') as string;
    const prompt = formData.get('prompt') as string;

    if (!name || !prompt) {
        throw new Error('Name and prompt are required');
    }

    const vapiPrivacyApiKey = (formData.get('vapiPrivacyApiKey') as string) || null;
    const twilioAccountSid = (formData.get('twilioAccountSid') as string) || null;
    const twilioAuthToken = (formData.get('twilioAuthToken') as string) || null;
    const twilioPhoneNumber = (formData.get('twilioPhoneNumber') as string) || null;

    let vapiAssistantId: string | null = null;

    // Create Vapi Assistant if API Key provided
    if (vapiPrivacyApiKey) {
        try {
            const assistant = await createVapiAssistant({
                name,
                prompt,
                apiKey: vapiPrivacyApiKey,
            });
            vapiAssistantId = assistant.id;

            // If Twilio Creds provided, import number
            if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
                await importTwilioNumberToVapi({
                    phoneNumber: twilioPhoneNumber,
                    twilioAccountSid,
                    twilioAuthToken,
                    assistantId: vapiAssistantId!,
                    apiKey: vapiPrivacyApiKey,
                });
            }
        } catch (error) {
            console.error("Failed to sync with Vapi:", error);
            // Optionally throw or just log? For now let's log so we don't block DB creation if Vapi fails,
            // but ideally we should probably surface this to user.
        }
    }

    const bot = await prisma.bot.create({
        data: {
            name,
            prompt,
            openaiApiKey: (formData.get('openaiApiKey') as string) || null,
            whatsappAccessToken: (formData.get('whatsappAccessToken') as string) || null,
            whatsappPhoneNumberId: (formData.get('whatsappPhoneNumberId') as string) || null,
            whatsappVerifyToken: (formData.get('whatsappVerifyToken') as string) || null,
            // Vapi fields
            vapiPrivacyApiKey,
            vapiAssistantId,
            twilioAccountSid,
            twilioAuthToken,
            twilioPhoneNumber,
        },
    });

    revalidatePath('/');
    redirect(`/bots/${bot.id}`);
}

export async function updateBot(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const prompt = formData.get('prompt') as string;

    const vapiPrivacyApiKey = (formData.get('vapiPrivacyApiKey') as string) || null;
    const twilioAccountSid = (formData.get('twilioAccountSid') as string) || null;
    const twilioAuthToken = (formData.get('twilioAuthToken') as string) || null;
    const twilioPhoneNumber = (formData.get('twilioPhoneNumber') as string) || null;

    // Fetch existing bot to see if we need to create or update Vapi assistant
    const existingBot = await prisma.bot.findUnique({ where: { id } });

    let vapiAssistantId = existingBot?.vapiAssistantId;

    if (vapiPrivacyApiKey) {
        try {
            if (vapiAssistantId) {
                // Update existing assistant
                await updateVapiAssistant({
                    assistantId: vapiAssistantId,
                    name,
                    prompt,
                    apiKey: vapiPrivacyApiKey,
                });
            } else {
                // Create new assistant
                const assistant = await createVapiAssistant({
                    name,
                    prompt,
                    apiKey: vapiPrivacyApiKey,
                });
                vapiAssistantId = assistant.id;
            }

            // If Twilio Creds provided and changed/new, import number
            // Optimistic check: if we have all twilio fields
            if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
                await importTwilioNumberToVapi({
                    phoneNumber: twilioPhoneNumber,
                    twilioAccountSid,
                    twilioAuthToken,
                    assistantId: vapiAssistantId!,
                    apiKey: vapiPrivacyApiKey,
                });
            }
        } catch (error) {
            console.error("Failed to sync with Vapi:", error);
        }
    }

    await prisma.bot.update({
        where: { id },
        data: {
            name,
            prompt,
            openaiApiKey: (formData.get('openaiApiKey') as string) || null,
            whatsappAccessToken: (formData.get('whatsappAccessToken') as string) || null,
            whatsappPhoneNumberId: (formData.get('whatsappPhoneNumberId') as string) || null,
            whatsappVerifyToken: (formData.get('whatsappVerifyToken') as string) || null,
            // Vapi fields
            vapiPrivacyApiKey,
            vapiAssistantId,
            twilioAccountSid,
            twilioAuthToken,
            twilioPhoneNumber,
        },
    });

    revalidatePath(`/bots/${id}`);
    revalidatePath('/');
}
