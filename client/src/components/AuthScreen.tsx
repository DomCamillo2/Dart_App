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

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
                {info && <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-sm mb-4 text-center">{info}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'reset' && (
                         <div>
                            <input 
                                value={resetToken}
                                onChange={e => setResetToken(e.target.value)}
                                placeholder="Reset Token"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors"
                                required
                            />
                        </div>
                    )}

                    {(view === 'login' || view === 'register') && (
                        <div>
                            <input 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors placeholder:text-slate-400"
                                required
                            />
                        </div>
                    )}

                    {(view === 'register' || view === 'forgot') && (
                         <div>
                            <input 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors placeholder:text-slate-400"
                                required
                            />
                        </div>
                    )}

                    {(view !== 'forgot') && (
                        <div>
                            <input 
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={view === 'reset' ? "New Password" : "Password (min 8 chars)"}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 p-4 rounded-xl text-white outline-none transition-colors placeholder:text-slate-400"
                                required
                            />
                        </div>
                    )}
                    
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20 uppercase tracking-wider">
                        {view === 'login' && 'Login'}
                        {view === 'register' && 'Register'}
                        {view === 'forgot' && 'Send Reset Link'}
                        {view === 'reset' && 'Update Password'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-4 text-center">
                    {view === 'login' && (
                        <>
                            <button onClick={() => { setView('register'); setError(''); }} className="text-slate-500 hover:text-white transition-colors text-sm">
                                Don't have an account? Register
                            </button>
                            <button onClick={() => { setView('forgot'); setError(''); }} className="text-slate-600 hover:text-slate-400 transition-colors text-xs">
                                Forgot password?
                            </button>
                        </>
                    )}
                    
                    {view === 'register' && (
                        <button onClick={() => { setView('login'); setError(''); }} className="text-slate-500 hover:text-white transition-colors text-sm">
                            Already have an account? Login
                        </button>
                    )}

                   {(view === 'forgot' || view === 'reset') && (
                        <button onClick={() => { setView('login'); setError(''); }} className="text-slate-500 hover:text-white transition-colors text-sm">
                            Back to Login
                        </button>
                    )}

                    
                    <div className="border-t border-slate-800 pt-4">
                        <button 
                            onClick={onGuest}
                            className="text-slate-400 hover:text-green-400 transition-colors font-bold uppercase tracking-wider text-xs"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
