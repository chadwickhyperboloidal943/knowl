import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getUserPublicNodes } from '@/lib/actions/book.actions';
import { getUserProfile, getFollowInfo } from '@/lib/actions/user.actions';
import BookCard from '@/components/BookCard';
import BookStaggeredGrid from '@/components/BookStaggeredGrid';
import { BookOpen, Calendar, Mail, Users, Sparkles } from 'lucide-react';
import BookPageAnimator from '@/components/BookPageAnimator';
import FollowButton from '@/components/FollowButton';

interface Props {
    params: Promise<{ id: string }>;
}

const PublicProfilePage = async ({ params }: Props) => {
    const { id: profileClerkId } = await params;
    const { userId: currentUserId } = await auth();

    // If viewing own profile, redirect to private profile
    if (currentUserId === profileClerkId) {
        redirect('/profile');
    }

    const userProfileResponse = await getUserProfile(profileClerkId);
    if (!userProfileResponse.success || !userProfileResponse.data) {
        notFound();
    }

    const user = userProfileResponse.data;
    const followInfo = await getFollowInfo(profileClerkId, currentUserId || undefined);
    const nodesResponse = await getUserPublicNodes(profileClerkId);
    const nodes = nodesResponse.success ? nodesResponse.data ?? [] : [];

    const stats = [
        { label: 'Public Nodes', value: nodes.length, icon: BookOpen, color: 'text-blue-500' },
        { label: 'Followers', value: followInfo.success ? followInfo.followersCount : 0, icon: Users, color: 'text-emerald-500' },
        { label: 'Following', value: followInfo.success ? followInfo.followingCount : 0, icon: Users, color: 'text-purple-500' },
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
                                {nodes.length > 5 && (
                                    <div className="absolute top-0 right-0 size-10 bg-amber-400 rounded-full border-4 border-white dark:border-[#141414] flex items-center justify-center shadow-lg -rotate-12">
                                        <Sparkles size={20} className="text-white fill-white" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 text-center md:text-left space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
                                                {user.firstName} <span className="text-indigo-600 dark:text-indigo-400">{user.lastName}</span>
                                            </h1>
                                            {user.username && (
                                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                                    @{user.username}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 dark:text-gray-400 font-medium text-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={18} className="text-indigo-500" />
                                                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {currentUserId && (
                                        <div className="flex justify-center md:justify-end">
                                            <FollowButton 
                                                followerClerkId={currentUserId} 
                                                followedClerkId={profileClerkId} 
                                                initialIsFollowing={followInfo.success ? followInfo.isFollowing : false} 
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="flex flex-col items-center md:items-start">
                                            <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                                            <div className="text-[10px] uppercase font-black tracking-widest text-gray-400">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Nodes Grid */}
                    <section>
                        <div className="flex justify-between items-end mb-10 px-2">
                            <div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white tracking-tight">Public <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4 font-black">Nodes</span></h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Explore the nodes shared by this curator</p>
                            </div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                                {nodes.length} Items Shared
                            </div>
                        </div>

                        {nodes.length > 0 ? (
                            <BookStaggeredGrid>
                                {nodes.map((node: any) => (
                                    <BookCard
                                        key={node._id}
                                        _id={node._id.toString()}
                                        title={node.title}
                                        author={node.author}
                                        coverURL={node.coverURL}
                                        slug={node.slug}
                                    />
                                ))}
                            </BookStaggeredGrid>
                        ) : (
                            <div className="premium-card p-20 text-center border-dashed bg-transparent border-gray-200 dark:border-white/10">
                                <div className="size-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Nothing shared yet</h3>
                                <p className="text-gray-500 mt-2">This user hasn't published any knowledge nodes yet.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </BookPageAnimator>
    );
}

export default PublicProfilePage;
