import React, { useEffect, useState } from 'react';
import { getAnalyticsOverview } from '../api/linkra';
import Sidebar from '../components/Sidebar'; // 🛡️ Added Sidebar Import
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
    MousePointer2, Link as LinkIcon, Activity, 
    Terminal, Globe, Zap, ArrowUpRight 
} from 'lucide-react';

const COLORS = ['#0f172a', '#4f46e5', '#818cf8', '#c7d2fe', '#e2e8f0'];

const Analytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        getAnalyticsOverview().then(res => setData(res.data));
    }, []);

    if (!data) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#fafafa]">
            <div className="flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[10px]">Initialising Analytics Hub...</span>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#fafafa] selection:bg-indigo-100">
            {/* 🛡️ Sidebar Integrated */}
            <Sidebar />

            <main className="flex-1 p-10 max-w-6xl mx-auto w-full">
                {/* Minimalist Header */}
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
                            <Activity className="text-indigo-600" size={24} />
                            Global Insights
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">
                            Network Traffic & Redirection Intelligence
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-4 py-2 rounded-lg">
                        <span className="flex items-center gap-1.5"><Zap size={10} className="text-amber-500" /> Real-time Feed</span>
                        <span className="w-px h-3 bg-slate-200" />
                        <span>User: Om Shete</span>
                    </div>
                </header>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard 
                        icon={<MousePointer2 size={18} />} 
                        title="Total Traffic" 
                        val={data.total_clicks} 
                        label="Active Clicks" 
                    />
                    <StatCard 
                        icon={<LinkIcon size={18} />} 
                        title="Path Count" 
                        val={data.total_links} 
                        label="Registered Nodes" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Line Chart: Clicks Over Time */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Traffic Velocity (7D)</h3>
                            <Terminal size={14} className="text-slate-300" />
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="clicks" 
                                        stroke="#4f46e5" 
                                        strokeWidth={3} 
                                        dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} 
                                        activeDot={{r: 6, strokeWidth: 0}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart: Devices */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Environment Mix</h3>
                            <Globe size={14} className="text-slate-300" />
                        </div>
                        <div className="h-48 mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data.devices} 
                                        innerRadius={55} 
                                        outerRadius={75} 
                                        paddingAngle={8} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.devices.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            {data.devices.map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                                        <span>{d.name || "Unknown"}</span>
                                    </div>
                                    <span className="text-slate-900 font-mono">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">
                        Linkra Analytics Core // Hub: Pune, India
                    </p>
                    <div className="flex gap-4">
                        <div className="w-8 h-px bg-slate-200" />
                        <div className="w-8 h-px bg-slate-200" />
                        <div className="w-8 h-px bg-slate-200" />
                    </div>
                </footer>
            </main>
        </div>
    );
};

const StatCard = ({ icon, title, val, label }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-indigo-600 transition-all duration-300">
        <div className="flex items-center gap-5">
            <div className="p-3 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <h2 className="text-2xl font-mono font-bold text-slate-900 tracking-tighter mt-0.5">{val}</h2>
            </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
            <ArrowUpRight size={16} />
        </div>
    </div>
);

export default Analytics;