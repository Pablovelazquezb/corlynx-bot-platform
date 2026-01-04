import Link from 'next/link';
import { MessageSquare, Plus, Settings } from 'lucide-react';
import { prisma } from '@/lib/db';

export default async function Home() {
  const bots = await prisma.bot.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } }
  });

  const totalMessages = await prisma.message.count();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Bot Platform</h1>
          <Link href="/bots/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            <Plus size={20} />
            Create Bot
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Bot List */}
              <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 col-span-2">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Your Bots</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {bots.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">You haven't created any bots yet.</p>
                      <div className="mt-4">
                        <Link href="/bots/new" className="text-blue-600 hover:text-blue-500">Get started &rarr;</Link>
                      </div>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {bots.map((bot) => (
                        <li key={bot.id} className="py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-4">
                              <MessageSquare size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{bot.name}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{bot.prompt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">{bot._count.messages} msgs</span>
                            <Link href={`/bots/${bot.id}`} className="text-gray-400 hover:text-gray-600">
                              <Settings size={20} />
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg h-fit">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Stats</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Messages</span>
                    <span className="font-bold text-2xl">{totalMessages}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-500">Active Bots</span>
                    <span className="font-bold text-2xl">{bots.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
