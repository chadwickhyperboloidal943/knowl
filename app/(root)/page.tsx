import React from 'react'
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import BookStaggeredGrid from "@/components/BookStaggeredGrid";
import {getAllBooks} from "@/lib/actions/book.actions";
import Search from "@/components/Search";

const Page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
    const { query } = await searchParams;

    const bookResults = await getAllBooks(query)
    const books = bookResults.success ? bookResults.data ?? [] : []

    return (
        <main className="wrapper container">
            <HeroSection />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif font-bold text-[#212a3b] dark:text-white">Knowledge Hub</h2>
                    <p className="text-gray-500 dark:text-gray-400">Discover insights shared by the community</p>
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
                    />
                ))}
                </BookStaggeredGrid>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="size-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                        <span className="text-4xl text-gray-300">🔍</span>
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">The Hub is quiet...</h3>
                    <p className="text-gray-500 max-w-xs">Be the first to publish your distilled AI insights from your personal shelf.</p>
                </div>
            )}
        </main>
    )
}

export default Page
