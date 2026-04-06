import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Link as LinkIcon, Zap, Command, Circle } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="w-68 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0 z-50 selection:bg-indigo-100">
            {/* Minimalist Logo & System Status */}
            <div className="p-8 pb-12">
                <div className="flex items-center gap-3 mb-2 group cursor-default">
                    <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-white transition-all group-hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] group-hover:bg-indigo-600">
                        <LinkIcon size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-slate-900">Linkra</span>
                </div>
                <div className="flex items-center gap-2 ml-1">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
                </div>
            </div>
            
            <nav className="px-4 space-y-1 flex-1">
                <p className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management</p>
                
                {/* Dashboard Link */}
                <Link 
                    to="/" 
                    className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                        isActive('/') 
                        ? 'bg-slate-50 text-indigo-600 border border-slate-100 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <LayoutDashboard size={18} className={isActive('/') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} /> 
                        <span className="text-sm font-semibold tracking-tight">Infrastructure</span>
                    </div>
                    {isActive('/') && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </Link>

                {/* Analytics Link */}
                <Link 
                    to="/analytics" 
                    className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                        isActive('/analytics') 
                        ? 'bg-slate-50 text-indigo-600 border border-slate-100 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <BarChart3 size={18} className={isActive('/analytics') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} /> 
                        <span className="text-sm font-semibold tracking-tight">Global Insights</span>
                    </div>
                    {isActive('/analytics') && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </Link>

                <div className="pt-8 px-4 pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tools</div>
                <button className="w-full group flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
                    <Command size={18} className="text-slate-400 group-hover:text-slate-600" />
                    <span className="text-sm font-semibold tracking-tight">API Keys (Coming Soon...)</span>
                </button>
            </nav>

            {/* Developer ID Badge */}
            <div className="p-4">
                <a 
                    href="https://devom-ai.vercel.app/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-slate-950 p-4 rounded-2xl flex items-center gap-4 border border-slate-800 shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] hover:border-slate-700 cursor-pointer group/badge"
                >
                    <div className="w-10 h-10 bg-linear-to-tr from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shadow-inner group-hover/badge:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                        O
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Developer</p>
                        <p className="text-xs font-bold text-white truncate w-24 tracking-tight">Om Shete</p>
                        <p className="text-[9px] text-indigo-400 font-mono mt-0.5 uppercase">Pune</p>
                    </div>
                </a>
            </div>
        </div>
    );
};

export default Sidebar;