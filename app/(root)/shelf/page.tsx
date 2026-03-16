import React from 'react'
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import BookStaggeredGrid from "@/components/BookStaggeredGrid";
import { getUserBooks } from "@/lib/actions/book.actions";
import Search from "@/components/Search";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const ShelfPage = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const { query } = await searchParams;

    const bookResults = await getUserBooks(userId);
    let books = bookResults.success ? (bookResults.data ?? []) : []

    if (query) {
        const lowerQuery = query.toLowerCase();
        books = books.filter(b => 
            b.title.toLowerCase().includes(lowerQuery) || 
            b.author.toLowerCase().includes(lowerQuery)
        );
    }

    return (
        <main className="wrapper container">
            <HeroSection />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif font-bold text-[#212a3b] dark:text-white">My Personal Shelf</h2>
                    <p className="text-gray-500 dark:text-gray-400">Your private AI research lab</p>
                </div>
                <Search />
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
                            likes={book.likes}
                            commentsCount={book.commentsCount}
                            visibility={book.visibility}
                            isShelf={true}
                        />
                    ))}
                </BookStaggeredGrid>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="size-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                        <span className="text-4xl text-gray-300">📚</span>
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">No knowledge resources yet</h3>
                    <p className="text-gray-500 max-w-xs">Upload your first book or PDF to start your AI-powered research journey.</p>
                </div>
            )}
        </main>
    )
}

export default ShelfPage
