'use server';

import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createBot(formData: FormData) {
    const name = formData.get('name') as string;
    const prompt = formData.get('prompt') as string;

    if (!name || !prompt) {
        throw new Error('Name and prompt are required');
    }

    const bot = await prisma.bot.create({
        data: {
            name,
            prompt,
            openaiApiKey: (formData.get('openaiApiKey') as string) || null,
            whatsappAccessToken: (formData.get('whatsappAccessToken') as string) || null,
            whatsappPhoneNumberId: (formData.get('whatsappPhoneNumberId') as string) || null,
            whatsappVerifyToken: (formData.get('whatsappVerifyToken') as string) || null,
        },
    });

    revalidatePath('/');
    redirect(`/bots/${bot.id}`);
}

export async function updateBot(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const prompt = formData.get('prompt') as string;

    await prisma.bot.update({
        where: { id },
        data: {
            name,
            prompt,
            openaiApiKey: (formData.get('openaiApiKey') as string) || null,
            whatsappAccessToken: (formData.get('whatsappAccessToken') as string) || null,
            whatsappPhoneNumberId: (formData.get('whatsappPhoneNumberId') as string) || null,
            whatsappVerifyToken: (formData.get('whatsappVerifyToken') as string) || null,
        },
    });

    revalidatePath(`/bots/${id}`);
    revalidatePath('/');
}
