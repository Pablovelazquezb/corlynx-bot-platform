import Link from 'next/link';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ChatPlayground from '@/components/ChatPlayground';
import { updateBot } from '@/app/actions';

export default async function BotPage({ params }: { params: { id: string } }) {
    const { id } = await params; // Next.js 15 params are async
    const bot = await prisma.bot.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 20,
            },
        },
    });

    if (!bot) {
        notFound();
    }

    // Reverse messages for display
    const initialMessages = bot.messages.reverse().map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
    }));

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        ← Back to Menu
                    </Link>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{bot.name}</h1>
                    <span className="text-sm text-gray-500">ID: {bot.id}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Configuration Column */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Configuration</h2>
                        <form action={updateBot.bind(null, bot.id)} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Bot Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={bot.name}
                                    required
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                                    System Prompt
                                </label>
                                <textarea
                                    id="prompt"
                                    name="prompt"
                                    rows={6}
                                    defaultValue={bot.prompt}
                                    required
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-md font-medium text-gray-900 mb-4">API Configuration</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700">
                                            OpenAI API Key
                                        </label>
                                        <input
                                            id="openaiApiKey"
                                            name="openaiApiKey"
                                            type="password"
                                            defaultValue={bot.openaiApiKey || ''}
                                            placeholder="sk-..."
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="whatsappAccessToken" className="block text-sm font-medium text-gray-700">
                                            WhatsApp Access Token
                                        </label>
                                        <input
                                            id="whatsappAccessToken"
                                            name="whatsappAccessToken"
                                            type="password"
                                            defaultValue={bot.whatsappAccessToken || ''}
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="whatsappPhoneNumberId" className="block text-sm font-medium text-gray-700">
                                            WhatsApp Phone Number ID
                                        </label>
                                        <input
                                            id="whatsappPhoneNumberId"
                                            name="whatsappPhoneNumberId"
                                            type="text"
                                            defaultValue={bot.whatsappPhoneNumberId || ''}
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="whatsappVerifyToken" className="block text-sm font-medium text-gray-700">
                                            WhatsApp Verify Token
                                        </label>
                                        <input
                                            id="whatsappVerifyToken"
                                            name="whatsappVerifyToken"
                                            type="text"
                                            defaultValue={bot.whatsappVerifyToken || ''}
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-md font-medium text-gray-900 mb-4">Voice Integration (Vapi + Twilio)</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="vapiPrivacyApiKey" className="block text-sm font-medium text-gray-700">
                                            Vapi Private API Key
                                        </label>
                                        <input
                                            id="vapiPrivacyApiKey"
                                            name="vapiPrivacyApiKey"
                                            type="password"
                                            defaultValue={bot.vapiPrivacyApiKey || ''}
                                            placeholder="Private Key..."
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700">
                                            Twilio Account SID
                                        </label>
                                        <input
                                            id="twilioAccountSid"
                                            name="twilioAccountSid"
                                            type="text"
                                            defaultValue={bot.twilioAccountSid || ''}
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700">
                                            Twilio Auth Token
                                        </label>
                                        <input
                                            id="twilioAuthToken"
                                            name="twilioAuthToken"
                                            type="password"
                                            defaultValue={bot.twilioAuthToken || ''}
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="twilioPhoneNumber" className="block text-sm font-medium text-gray-700">
                                            Twilio Phone Number
                                        </label>
                                        <input
                                            id="twilioPhoneNumber"
                                            name="twilioPhoneNumber"
                                            type="text"
                                            defaultValue={bot.twilioPhoneNumber || ''}
                                            placeholder="+1234567890"
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                        />
                                    </div>

                                    {bot.vapiAssistantId && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            Linked to Vapi Assistant: <span className="font-mono">{bot.vapiAssistantId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-md font-medium text-gray-900 mb-2">WhatsApp Integration</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    To connect this bot to WhatsApp, you need to configure the Webhook URL in your Meta App settings.
                                </p>
                                <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
                                    {process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/webhook/whatsapp?botId={bot.id}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Playground Column */}
                    <div>
                        <ChatPlayground botId={bot.id} initialMessages={initialMessages} />
                    </div>
                </div>
            </div>
        </div>
    );
}
