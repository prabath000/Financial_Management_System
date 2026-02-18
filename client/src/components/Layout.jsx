import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, LogOut, FileSpreadsheet, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
        { name: 'Daily Sheet', path: '/daily-sheet', icon: <FileSpreadsheet size={20} /> },
        { name: 'Transactions', path: '/transactions', icon: <ReceiptText size={20} /> },
        { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8f9fc] font-['Inter']">
            {/* Sidebar */}
            <aside className="w-72 glass-card border-r-0 flex flex-col z-20 m-4 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                {/* Decorative background for sidebar */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50/50 to-white/50 -z-10" />

                <div className="p-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-indigo-100 overflow-hidden p-1.5 transition-transform hover:scale-105">
                            <img
                                src="./logo.png"
                                alt="J"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerText = 'J';
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">Janka</h1>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Agency</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-1.5 py-4 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Main Navigation</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 relative group overflow-hidden ${isActive
                                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 translate-x-2'
                                    : 'text-slate-500 hover:text-indigo-600 hover:translate-x-1'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-indigo-600 rounded-full" />
                                    )}
                                    <div className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {React.cloneElement(item.icon, {
                                            size: 20,
                                            strokeWidth: isActive ? 3 : 2,
                                            className: isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500 transition-colors'
                                        })}
                                    </div>
                                    <span className={`text-sm tracking-tight transition-all ${isActive ? 'font-black' : 'font-bold'}`}>
                                        {item.name}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-8">
                    <div className="bg-slate-900/5 rounded-3xl p-6 mb-6">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full p-2 text-slate-600 hover:text-rose-600 transition-all font-bold text-sm group"
                        >
                            <div className="p-2 rounded-xl bg-white group-hover:bg-rose-50 transition-colors shadow-sm">
                                <LogOut size={18} />
                            </div>
                            <span>Sign Out</span>
                        </button>
                    </div>

                    <div className="text-center">
                        <a
                            href="https://prabath000.github.io/Prabaththilina/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-black text-slate-300 hover:text-indigo-500 uppercase tracking-widest transition-colors"
                        >
                            © 2026 Prabath Thilina
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="max-w-[1600px] mx-auto p-4 lg:p-10">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
