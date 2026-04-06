import React, { useState } from 'react';
import { registerUser } from '../api/linkra';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Link as LinkIcon } from 'lucide-react';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerUser(form);
            alert("Registration successful! Now log in.");
            navigate('/login');
        } catch (err) {
            alert("Registration failed. Email might already be taken.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] p-6 selection:bg-indigo-100">
            {/* Minimalist Logo Header */}
            <div className="flex items-center gap-2 mb-10 group cursor-default">
                <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                    <LinkIcon size={20} />
                </div>
                <span className="text-2xl font-bold tracking-tighter text-slate-900">Linkra</span>
            </div>

            <div className="max-w-420px w-full bg-white border border-slate-200 rounded-2xl p-10">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">Create your account</h2>
                    <p className="text-sm text-slate-500 mt-1">Shorten links. Track clicks. Stay secure.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-0.5">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" required value={form.name} 
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. Om Shete" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-0.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="email" required value={form.email} 
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                                placeholder="name@company.com" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-0.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="password" required value={form.password} 
                                onChange={(e) => setForm({...form, password: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-600 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-slate-950 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group mt-2"
                    >
                        Sign up for free 
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500">
                    Already have an account? 
                    <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Log in</Link>
                </div>
            </div>

            {/* Subtle Footer info */}
            <p className="mt-10 text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em]">
                Linkra Infrastructure & Analytics Core
            </p>
        </div>
    );
};

export default Register;