import React, { useState, useEffect } from 'react';
import { createLink, getLinks, deleteLink } from '../api/linkra';
import { Plus, Trash2, ExternalLink, Globe, Shield, BarChart3, Command, Link as LinkIcon, Hash } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [links, setLinks] = useState([]);
    const [form, setForm] = useState({ url: '', slug: '', password: '', expiry: '' });

    useEffect(() => { fetchLinks(); }, []);

    const fetchLinks = async () => {
        try {
            const res = await getLinks();
            setLinks(res.data);
        } catch (err) { console.error("CORS or Auth Error:", err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        await createLink({ 
            long_url: form.url, 
            custom_slug: form.slug, 
            link_password: form.password,
            expiry_days: form.expiry ? parseInt(form.expiry) : null 
        });
        setForm({ url: '', slug: '', password: '', expiry: '' });
        fetchLinks();
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this link infrastructure?")) {
            await deleteLink(id);
            fetchLinks();
        }
    };

    return (
        <div className="flex min-h-screen bg-[#fafafa] selection:bg-indigo-100">
            {/* Sidebar Integration */}
            <Sidebar />

            <main className="flex-1 p-10 max-w-6xl mx-auto w-full">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Infrastructure</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage and monitor your active redirection nodes.</p>
                    </div>
                    <div className="px-3 py-1 bg-slate-100 rounded-md border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Total Nodes: {links.length}
                    </div>
                </header>

                {/* Technical Creation Bar */}
                <section className="bg-white border border-slate-200 rounded-xl p-2 mb-12 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <form onSubmit={handleCreate} className="flex flex-wrap md:flex-nowrap gap-2">
                        <div className="flex-1 relative group">
                            <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input 
                                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300" 
                                placeholder="Enter long URL destination..." 
                                value={form.url} 
                                onChange={(e) => setForm({...form, url: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="w-full md:w-48 relative border-l border-slate-100">
                            <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300 font-mono" 
                                placeholder="custom-slug" 
                                value={form.slug} 
                                onChange={(e) => setForm({...form, slug: e.target.value})} 
                            />
                        </div>
                        <button className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0">
                            <Plus size={14} /> Create Link
                        </button>
                    </form>
                </section>

                {/* Active Nodes List */}
                <div className="space-y-3">
                    <div className="flex items-center px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        <span className="flex-1">Active Redirection Paths</span>
                        <span className="w-32 text-right">Analytics</span>
                    </div>

                    {links.length === 0 && (
                        <div className="text-center border-2 border-dashed border-slate-100 rounded-2xl py-20">
                            <Command size={32} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 text-sm font-medium">No active paths found. Initialize your first link above.</p>
                        </div>
                    )}

                    {links.map((link) => (
                        <div 
                            key={link.id} 
                            className="bg-white px-6 py-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-400/50 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-center gap-6 overflow-hidden">
                                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                                    <Globe size={18} />
                                </div>
                                <div className="truncate">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-mono text-sm font-bold text-slate-900 tracking-tight">
                                            linkra.io/<span className="text-indigo-600">{link.short_code}</span>
                                        </h3>
                                        {link.password_hash && (
                                            <Shield size={12} className="text-slate-300" title="Secure Path" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{link.long_url}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-4 shrink-0">
                                <Link 
                                    to={`/stats/${link.id}`} 
                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                    title="View Logs"
                                >
                                    <BarChart3 size={18} />
                                </Link>

                                <a 
                                    href={`http://localhost:8000/${link.short_code}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                    title="Open Path"
                                >
                                    <ExternalLink size={18} />
                                </a>

                                <div className="w-px h-4 bg-slate-100 mx-1" />

                                <button 
                                    onClick={() => handleDelete(link.id)} 
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Terminate Node"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="mt-20 pt-10 border-t border-slate-100">
                    <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest text-center">
                        Linkra Production Environment // Pune Distribution Hub
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;