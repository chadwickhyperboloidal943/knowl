import React from 'react';

export default function SubscriptionsPage() {
  return (
    <div className="container wrapper py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold font-serif mb-4">Unlimited Platform</h1>
        <p className="text-muted-foreground max-w-2xl">
          Enjoy unlimited books, sessions, and features entirely for free.
        </p>
      </div>

      <div className="grid md:grid-cols-1 gap-8 max-w-lg mx-auto">
        <div className="p-8 border-2 border-indigo-600 rounded-2xl flex flex-col items-center shadow-md relative bg-white">
          <div className="absolute top-0 transform -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">Hackathon Edition</div>
          <h2 className="text-2xl font-bold mb-2">Everything Free</h2>
          <p className="text-4xl font-bold mb-4">$0<span className="text-sm font-normal">/mo forever</span></p>
          <ul className="text-left w-full space-y-3 mb-8 flex-1 font-medium text-lg">
            <li>✓ Unlimited Book Uploads</li>
            <li>✓ Unlimited Session Times</li>
            <li>✓ All Premium Voices</li>
            <li>✓ AI Insights & Flashcards</li>
            <li>✓ Full Conversation History</li>
          </ul>
          <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md">You are on this plan</button>
        </div>
      </div>
    </div>
  );
}
