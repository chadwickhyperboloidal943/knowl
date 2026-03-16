import React from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserBooks } from '@/lib/actions/book.actions';
import BookCard from '@/components/BookCard';
import BookStaggeredGrid from '@/components/BookStaggeredGrid';
import { BookOpen, Calendar, Mail, Shield, Sparkles } from 'lucide-react';
import BookPageAnimator from '@/components/BookPageAnimator';

const ProfilePage = async () => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect('/sign-in');
    }

    const userBooksResponse = await getUserBooks(userId);
    const books = userBooksResponse.success ? userBooksResponse.data ?? [] : [];

    const stats = [
        { label: 'Total Books', value: books.length, icon: BookOpen, color: 'text-blue-500' },
        { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar, color: 'text-indigo-500' },
    ];

    return (
        <BookPageAnimator>
            <main className="wrapper container py-24 min-h-screen">
                <div className="flex flex-col gap-12">
                    {/* Identity Hero */}
                    <section className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative premium-card p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 md:gap-16 border-white/50 dark:border-white/5 shadow-2xl">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-indigo-500 rounded-full blur opacity-20 animate-pulse"></div>
                                <img
                                    src={user.imageUrl}
                                    alt="Profile"
                                    className="relative w-40 h-40 rounded-full border-4 border-white dark:border-[#141414] shadow-xl object-cover"
                                />
                                <div className="absolute bottom-2 right-2 size-8 bg-emerald-500 rounded-full border-4 border-white dark:border-[#141414] flex items-center justify-center shadow-lg">
                                    <div className="size-2 bg-white rounded-full animate-ping"></div>
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div>
                                    <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                                        {user.firstName} <span className="text-indigo-600 dark:text-indigo-400">{user.lastName}</span>
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 dark:text-gray-400 font-medium text-lg">
                                        <div className="flex items-center gap-2">
                                            <Mail size={18} className="text-indigo-500" />
                                            {user.emailAddresses[0]?.emailAddress}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 hover:border-indigo-500/30 transition-all group/stat">
                                            <stat.icon size={20} className={`${stat.color} mb-2 group-hover/stat:scale-110 transition-transform`} />
                                            <div className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">{stat.value}</div>
                                            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Book Grid */}
                    <section>
                        <div className="flex justify-between items-end mb-10 px-2">
                            <div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white tracking-tight">Your Digital <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4 font-black">Archive</span></h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and explore your uploaded knowledge base</p>
                            </div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                                {books.length} Manuscripts Found
                            </div>
                        </div>

                        {books.length > 0 ? (
                            <BookStaggeredGrid>
                                {books.map((book: any) => (
                                    <BookCard
                                        key={book._id}
                                        _id={book._id.toString()}
                                        title={book.title}
                                        author={book.author}
                                        coverURL={book.coverURL}
                                        slug={book.slug}
                                    />
                                ))}
                            </BookStaggeredGrid>
                        ) : (
                            <div className="premium-card p-20 text-center border-dashed bg-transparent border-gray-200 dark:border-white/10">
                                <div className="size-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">The archive is empty</h3>
                                <p className="text-gray-500 mt-2 mb-8">Ready to expand your library? Start by uploading your first manuscript.</p>
                                <a href="/nodes/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                                    Upload Now →
                                </a>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </BookPageAnimator>
    );
}

export default ProfilePage;