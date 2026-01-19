import React, { useState } from 'react';
import { API_URL } from '../config';

interface AuthScreenProps {
    onLogin: (token: string, username: string, userId: string) => void;
    onGuest: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuest }) => {
    const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        
        try {
            if (view === 'forgot') {
                const res = await fetch(`${API_URL}/api/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail);
                
                // Switch to reset view so user can enter the token
                setView('reset');
                setInfo("If an account exists with this email, a reset token has been sent.");
                return;
            }

            if (view === 'reset') {
                 const res = await fetch(`${API_URL}/api/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: resetToken, new_password: password })
                });
                if (!res.ok) throw new Error('Reset failed');
                setInfo("Password reset successful. Please login.");
                setView('login');
                setPassword('');
                return;
            }

            const endpoint = view === 'login' ? '/api/login' : '/api/register';
            const body = view === 'login' 
                ? { username, password }
                : { username, password, email }; // register includes email

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.detail || 'Authentication failed');
            }

            if (view === 'login') {
                onLogin(data.access_token, data.username, data.id);
            } else {
                setView('login');
                setInfo('Registration successful! Please login.');
                setPassword('');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getTitle = () => {
        if (view === 'login') return 'Login to your Account';
        if (view === 'register') return 'Create New Account';
        if (view === 'forgot') return 'Reset Password';
        if (view === 'reset') return 'Set New Password';
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-black text-white text-center mb-8 italic">
                     DART <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">X01</span>
                </h2>
                
                <h3 className="text-xl font-bold text-slate-300 mb-6 text-center">
                    {getTitle()}
                </h3>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-4 text-center flex items-center justify-center gap-2" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}
                {info && <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-sm mb-4 text-center">{info}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {view === 'reset' && (
                         <div>
                            <label htmlFor="resetToken" className="block text-slate-400 text-sm font-bold mb-2 ml-1">Reset Token</label>
                            <input 
                                id="resetToken"
                                value={resetToken}
                                onChange={e => setResetToken(e.target.value)}
                                placeholder="Paste token from email"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors"
                                required
                            />
                        </div>
                    )}

                    {(view === 'login' || view === 'register') && (
                        <div>
                            <label htmlFor="username" className="block text-slate-400 text-sm font-bold mb-2 ml-1">Username</label>
                            <input 
                                id="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="e.g. MasterDart"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors placeholder:text-slate-600"
                                required
                            />
                        </div>
                    )}

                    {(view === 'register' || view === 'forgot') && (
                         <div>
                            <label htmlFor="email" className="block text-slate-400 text-sm font-bold mb-2 ml-1">Email Address</label>
                            <input 
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors placeholder:text-slate-600"
                                required
                            />
                        </div>
                    )}

                    {(view !== 'forgot') && (
                        <div>
                            <label htmlFor="password" className="block text-slate-400 text-sm font-bold mb-2 ml-1">
                                {view === 'reset' ? "New Password" : "Password"}
                            </label>
                            <input 
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                aria-describedby="password-hint"
                                placeholder="••••••••"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors placeholder:text-slate-600"
                                required
                                minLength={8}
                            />
                            <p id="password-hint" className="text-slate-500 text-xs mt-1 ml-1">
                                Must be at least 8 characters long.
                            </p>
                        </div>
                    )}
                    
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20 uppercase tracking-wider mt-6">
                        {view === 'login' && 'Sign In'}
                        {view === 'register' && 'Register Account'}
                        {view === 'forgot' && 'Send Reset Link'}
                        {view === 'reset' && 'Update Password'}
                    </button>
                </form>

                <div className="mt-8 flex flex-col gap-3">
                    {/* Primary Actions Group */}
                    <div className="bg-slate-800/30 rounded-2xl p-4 flex flex-col gap-3 border border-slate-800/50">
                        {view === 'login' && (
                            <>
                                <div className="text-center text-slate-400 text-sm mb-1">New to Dart X01?</div>
                                <button onClick={() => { setView('register'); setError(''); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm border border-slate-700">
                                    Create Account
                                </button>
                                <button onClick={() => { setView('forgot'); setError(''); }} className="text-slate-500 hover:text-slate-300 transition-colors text-xs text-center mt-1">
                                    Forgot password?
                                </button>
                            </>
                        )}
                        
                        {view === 'register' && (
                             <>
                                <div className="text-center text-slate-400 text-sm mb-1">Already have an account?</div>
                                <button onClick={() => { setView('login'); setError(''); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm border border-slate-700">
                                    Sign In instead
                                </button>
                            </>
                        )}

                        {(view === 'forgot' || view === 'reset') && (
                            <button onClick={() => { setView('login'); setError(''); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm border border-slate-700">
                                Back to Login
                            </button>
                        )}
                    </div>

                    {/* Guest Option */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        <span className="text-slate-600 text-xs font-bold uppercase">or</span>
                        <div className="h-px bg-slate-800 flex-1"></div>
                    </div>
                    
                    <button 
                        onClick={onGuest}
                        className="w-full py-3 text-slate-400 hover:text-green-400 hover:bg-green-400/5 border border-transparent hover:border-green-500/20 rounded-xl transition-all font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                    >
                        <span>Continue as Guest</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
