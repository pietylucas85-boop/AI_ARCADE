import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, DollarSign, Zap, Globe, Cpu } from 'lucide-react';

const data = [
  { name: 'Mon', leads: 4000, traffic: 2400, amt: 2400 },
  { name: 'Tue', leads: 3000, traffic: 1398, amt: 2210 },
  { name: 'Wed', leads: 2000, traffic: 9800, amt: 2290 },
  { name: 'Thu', leads: 2780, traffic: 3908, amt: 2000 },
  { name: 'Fri', leads: 1890, traffic: 4800, amt: 2181 },
  { name: 'Sat', leads: 2390, traffic: 3800, amt: 2500 },
  { name: 'Sun', leads: 3490, traffic: 4300, amt: 2100 },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl transition-transform group-hover:scale-150 ${color}`} />
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-white/5 ${color.replace('bg-', 'text-')}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-emerald-400 text-xs font-bold font-mono">+{change}%</span>
      <span className="text-slate-500 text-xs">vs last week</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">MISSION CONTROL</h2>
          <p className="text-slate-400">Welcome back, Commander. Systems are operating at 98% efficiency.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-emerald-500 text-xs font-mono font-bold">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Traffic" value="128.4K" change="12.5" icon={Globe} color="bg-neon-cyan" />
        <StatCard title="Active Leads" value="3,402" change="8.2" icon={Users} color="bg-neon-purple" />
        <StatCard title="Est. Revenue" value="$42.8K" change="24.3" icon={DollarSign} color="bg-neon-pink" />
        <StatCard title="AI Operations" value="842" change="156" icon={Cpu} color="bg-blue-500" />
      </div>

      {/* Main Chart Area */}
      <div className="glass-panel p-6 rounded-2xl h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="text-neon-cyan w-5 h-5" />
            TRAFFIC ACQUISITION
          </h3>
          <select className="bg-black/40 border border-white/10 text-slate-300 text-xs rounded px-3 py-1 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="traffic" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
            <Area type="monotone" dataKey="leads" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};