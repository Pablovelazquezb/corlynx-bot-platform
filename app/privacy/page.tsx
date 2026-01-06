
import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow sm:rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Corlynx ("we," "our," or "us"). We are committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, and safeguard your information when you use our WhatsApp Bot Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Messages:</strong> We process messages sent to our bots to generate AI responses.</li>
                            <li><strong>Phone Numbers:</strong> We receive phone numbers from WhatsApp to facilitate communication.</li>
                            <li><strong>Usage Data:</strong> We may collect anonymous analytics to improve our service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <p>
                            We use the collected information solely to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Provide and maintain the chatbot service.</li>
                            <li>Process and generate AI responses via third-party providers (e.g., OpenAI).</li>
                            <li>Communicate with you via WhatsApp.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
                        <p>
                            We do not sell your personal data. We share data only with:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Meta (WhatsApp):</strong> To send and receive messages.</li>
                            <li><strong>AI Providers (e.g., OpenAI):</strong> To generate intelligent responses.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
