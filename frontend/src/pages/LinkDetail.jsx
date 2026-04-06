import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLinkAnalytics } from '../api/linkra';
import Sidebar from '../components/Sidebar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointer2, ExternalLink, ArrowLeft, Shield, Globe, Terminal, Activity, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#0f172a', '#4f46e5', '#818cf8', '#c7d2fe', '#e2e8f0'];

const LinkDetail = () => {
    const { id } = useParams();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getLinkAnalytics(id).then(res => setStats(res.data));
    }, [id]);

    if (!stats) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#fafafa]">
            <div className="flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[10px]">Accessing Node Logs...</span>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#fafafa] selection:bg-indigo-100">
            <Sidebar />
            
            <main className="flex-1 p-10 max-w-6xl mx-auto w-full">
                {/* Technical Breadcrumb */}
                <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 mb-8 transition-colors group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to Infrastructure
                </Link>

                {/* Node Header Console */}
                <section className="bg-white border border-slate-200 rounded-2xl p-8 mb-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-mono font-bold text-slate-900 tracking-tighter">
                                    /<span className="text-indigo-600">{stats.short_code}</span>
                                </h1>
                                <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-500 border border-slate-200 uppercase">
                                    ID: {id.slice(-6)}
                                </div>
                            </div>
                            <p className="text-xs font-mono text-slate-400 truncate max-w-xl flex items-center gap-2">
                                <ExternalLink size={12} /> {stats.long_url}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Traffic</p>
                            <div className="flex items-center gap-3 justify-end text-slate-900">
                                <MousePointer2 size={20} className="text-indigo-600" />
                                <span className="text-3xl font-mono font-bold tracking-tighter">{stats.total_clicks}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Device Distribution Console */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Environment Mix</h3>
                            <Activity size={14} className="text-slate-300" />
                        </div>
                        <div className="h-48 mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.devices} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                                        {stats.devices.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* 📊 Legend with Percentages */}
                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            {stats.devices.map((d, i) => {
                                const percentage = ((d.value / stats.total_clicks) * 100).toFixed(1);
                                return (
                                    <div key={i} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                                            <span>{d.name || "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-900 font-mono">{d.value}</span>
                                            <span className="text-slate-300 font-mono w-10 text-right">{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity Log */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Recent Redirection Logs</h3>
                            <Terminal size={14} className="text-slate-300" />
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-400px pr-2 custom-scrollbar">
                            {stats.history && stats.history.length > 0 ? (
                                stats.history.map((click, i) => (
                                    <div key={i} className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                <Globe size={14} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {click.city && click.city !== "Unknown" ? `${click.city}, ` : ""} {click.country || "Global"}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-300">IST // HUB_01</span>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">
                                                    {new Date(click.timestamp + "Z").toLocaleString('en-IN', {
                                                        timeZone: 'Asia/Kolkata',
                                                        hour12: true,
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                                            {click.browser ? click.browser.split(' ')[0] : "NODE"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 border border-dashed border-slate-100 rounded-2xl">
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Awaiting Initial Traffic...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="mt-20 pt-10 border-t border-slate-100">
                    <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest text-center">
                        Linkra Production Infrastructure // Node Detailed Analytics
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default LinkDetail;