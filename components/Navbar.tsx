'use client';

import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {cn} from "@/lib/utils";

const navItems = [
    { label: "Discovery Hub", href: "/" },
    { label: "My Shelf", href: "/shelf", authRequired: true },
]

import { Settings, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import SettingsSidebar from "./SettingsSidebar";
import MobileMenu from "./MobileMenu";
import { useState } from "react";

const Navbar = () => {
    const pathName = usePathname();
    const { user } = useUser();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
            <div className="premium-glass dark:premium-glass-dark rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg">
                <Link href="/" className="flex gap-2 items-center group">
                    <div className="relative size-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:rotate-12 transition-transform overflow-hidden">
                        <Image src="/assets/logo.png" alt="Bookified" width={28} height={18} className="object-contain" />
                    </div>
                    <span className="logo-text dark:text-white">Bookified</span>
                </Link>

                <nav className="hidden lg:flex gap-8 items-center bg-black/5 dark:bg-white/5 px-6 py-2 rounded-full border border-black/5 dark:border-white/5">
                    {navItems.map(({ label, href, authRequired }) => {
                        if (authRequired && !user) return null;
                        const isActive = pathName === href || (href !== '/' && pathName.startsWith(href));

                        return (
                            <Link 
                                href={href} 
                                key={label} 
                                className={cn(
                                    'text-sm font-bold transition-all hover:text-indigo-600 dark:hover:text-indigo-400', 
                                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                )}
                            >
                                {label}
                            </Link>
                        )
                    })}
                    <SignedIn>
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-white/10 mx-1" />
                        <Link href="/books/new" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 flex items-center gap-1 transition-all">
                            <span className="text-xl">+</span> Add Knowledge
                        </Link>
                    </SignedIn>
                </nav>

                <div className="flex gap-4 items-center">
                    <ThemeToggle />
                    
                    <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block mx-1" />

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <MobileMenu user={user} pathName={pathName} />
                    </div>

                    <div className="hidden lg:flex gap-3 items-center">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <div className="text-sm font-black bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer">
                                    Sign In
                                </div>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link 
                                href="/profile" 
                                className={cn(
                                    "flex items-center gap-2 group p-1 pr-3 rounded-full transition-all border border-transparent",
                                    pathName === '/profile' ? "bg-indigo-600/10 border-indigo-500/20" : "hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                            >
                                <img 
                                    src={user?.imageUrl} 
                                    alt="Profile" 
                                    className="size-8 rounded-full border-2 border-white dark:border-[#141414] shadow-sm shadow-black/10 group-hover:scale-110 transition-transform" 
                                />
                                <span className={cn(
                                    "text-sm font-bold transition-colors",
                                    pathName === '/profile' ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-200"
                                )}>
                                    {user?.firstName}
                                </span>
                            </Link>

                            <div className="relative group/settings">
                                <button 
                                    onClick={() => setShowSettings(true)}
                                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <Settings size={20} className="group-hover/settings:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </div>
            
            <SettingsSidebar show={showSettings} onClose={() => setShowSettings(false)} />
        </header>
    )
}

export default Navbar
