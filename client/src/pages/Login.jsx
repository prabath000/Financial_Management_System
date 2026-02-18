import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden font-['Inter']">
            {/* Premium background effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] -ml-64 -mb-64" />

            <div className="max-w-md w-full glass-card p-12 rounded-[2.5rem] border-white/10 shadow-2xl relative z-10 backdrop-blur-3xl bg-white/5 group">
                {/* Logo Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-[2rem] shadow-2xl overflow-hidden mb-8 transform group-hover:scale-105 transition-transform duration-700 p-2">
                        <img
                            src="./logo.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<span class="text-4xl font-black text-indigo-600">J</span>';
                            }}
                        />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Systems Login</h2>
                    <p className="text-indigo-200 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Access Terminal</p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-rose-500/10 text-rose-200 rounded-2xl text-xs font-bold border border-rose-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <ShieldCheck size={18} className="text-rose-400" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-1">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Terminal ID"
                            className="w-full bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/10 focus:border-indigo-500 rounded-2xl py-4 px-6 transition-all outline-none font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-1">Security Key</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/10 focus:border-indigo-500 rounded-2xl py-4 px-6 transition-all outline-none font-bold"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-2xl premium-gradient text-white font-black text-lg shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn disabled:opacity-50 disabled:translate-y-0"
                    >
                        <span className="relative z-10">
                            {loading ? 'Authenticating...' : 'Authorize Access'}
                        </span>
                        {!loading && <ArrowRight size={20} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <a
                        href="https://prabath000.github.io/Prabaththilina/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]"
                    >
                        Design Integrity by Prabath Thilina
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
