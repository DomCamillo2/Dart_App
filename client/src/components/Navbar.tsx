import React from 'react'
import { twMerge } from 'tailwind-merge'
import { useThemeStore } from '../store/themeStore'

interface NavbarProps {
    currentView: string;
    setView: (view: string) => void;
    user?: { username: string } | null;
    isGuest: boolean;
    onLogout: () => void;
    onShowRules: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, isGuest, onLogout, onShowRules }) => {
    const { theme, toggleTheme } = useThemeStore()
    
    const NavItem = ({ view, label, icon }: { view: string, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setView(view)}
            className={twMerge(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all focus:ring-2 focus:ring-green-500 outline-none",
                currentView === view 
                    ? "bg-slate-800 text-white shadow-lg dark:bg-slate-800" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
            aria-current={currentView === view ? 'page' : undefined}
        >
            {icon}
            {label}
        </button>
    )

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 mb-6 transition-colors">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo Area */}
                <button 
                    className="flex items-center group focus:ring-2 focus:ring-green-500 rounded-lg outline-none px-2 -ml-2"
                    onClick={() => setView('home')}
                    aria-label="Dart X01 Home"
                >
                    <div className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
                        DART <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">X01</span>
                    </div>
                </button>

                {/* Main Navigation - Desktop */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                    <NavItem 
                        view="home" 
                        label="New Match" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                    />
                    <NavItem 
                        view="history" 
                        label="History" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>

                {/* Right Side: Profile / Rules */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={onShowRules}
                        className="p-2 text-slate-400 hover:text-green-500 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 focus:ring-2 focus:ring-green-500 outline-none"
                        title="How to Play"
                        aria-label="Game Rules"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

                     {user ? (
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 pr-2 pl-4 py-1.5 rounded-full border border-slate-200 dark:border-white/5 transition-colors">
                             <div className="flex flex-col items-end leading-tight">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Player</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{user.username}</span>
                             </div>
                             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center font-bold text-slate-900 text-xs shadow-lg text-white">
                                 {user.username[0].toUpperCase()}
                             </div>
                             <button 
                                onClick={onLogout}
                                className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-1 rounded focus:ring-2 focus:ring-red-500 outline-none"
                                title="Sign Out"
                                aria-label="Sign Out"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                             </button>
                        </div>
                    ) : (
                        <button 
                            onClick={onLogout}
                            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase tracking-wider flex items-center gap-2 focus:ring-2 focus:ring-green-500 rounded-lg p-2 outline-none"
                        >
                            Guest <span className="opacity-50">(Exit)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Bar (Bottom) */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full p-1.5 shadow-2xl flex items-center gap-1 z-50">
                <NavItem 
                    view="home" 
                    label="Match" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <NavItem 
                    view="history" 
                    label="History" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </nav>
        </nav>
    )
}

export default Navbar