import { useQuery } from '@tanstack/react-query';
import {
  Target, Flame, TrendingUp, Zap, ArrowUp,
  Code2, Trophy, Calendar, Sparkles, ChevronRight,
} from 'lucide-react';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';

const StatCard = ({ label, value, sub, icon: Icon, accent, rank }) => (
  <div className="relative overflow-hidden rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group cursor-default"
    style={{ background: 'linear-gradient(135deg, #141420 0%, #1a1a2e 100%)' }}>
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
      style={{ background: accent, transform: 'translate(30%, -30%)' }} />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {rank && <span className="text-xs text-slate-600 font-mono">#{rank}</span>}
      </div>
      <div className="text-4xl font-black text-white mb-1 tracking-tight">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      {sub && <div className="text-xs mt-2 font-semibold" style={{ color: accent }}>{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics/stats').then((r) => r.data),
  });

  const { data: heatmap } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => api.get('/analytics/heatmap').then((r) => r.data),
  });

  const solved = data?.solved || {};
  const streak = data?.streak || {};
  const topics = data?.byTopic || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅 Good morning';
    if (h < 17) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A14]">
        <Sidebar />
        <div style={{ marginLeft: '208px' }} className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalSolved = Number(solved.total) || 0;
  const easySolved = Number(solved.easy) || 0;
  const mediumSolved = Number(solved.medium) || 0;
  const hardSolved = Number(solved.hard) || 0;

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar streak={streak.current_streak || 0} />

      <div style={{ marginLeft: '208px' }} className="flex-1 min-w-0 pt-16 lg:pt-0">

        {/* Top Banner */}
        <div className="relative overflow-hidden border-b border-white/5 px-8 py-8"
          style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #141428 50%, #0f0f1a 100%)' }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#6C63FF] rounded-full blur-3xl opacity-5" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#00C896] rounded-full blur-3xl opacity-5" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">{greeting()}</p>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {user?.username || 'Coder'}
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                {totalSolved === 0
                  ? 'Start solving problems to track your progress'
                  : `You've solved ${totalSolved} problems — keep going!`}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black text-[#00C896]">{streak.current_streak || 0}</div>
                <div className="text-xs text-slate-500 mt-0.5">day streak 🔥</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black text-[#6C63FF]">{streak.longest_streak || 0}</div>
                <div className="text-xs text-slate-500 mt-0.5">best streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Solved" value={totalSolved} sub="Keep grinding 💪" icon={Target} accent="#6C63FF" />
            <StatCard label="Easy Solved" value={easySolved} sub={`out of 300`} icon={Zap} accent="#00C896" />
            <StatCard label="Medium Solved" value={mediumSolved} sub={`out of 400`} icon={TrendingUp} accent="#F5A623" />
            <StatCard label="Hard Solved" value={hardSolved} sub={`out of 150`} icon={ArrowUp} accent="#FF5F7E" />
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Progress — takes 2 cols */}
            <div className="lg:col-span-2 rounded-2xl border border-white/5 p-6"
              style={{ background: 'linear-gradient(135deg, #141420 0%, #1a1a2e 100%)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Code2 size={16} className="text-[#6C63FF]" />
                  Difficulty breakdown
                </h2>
                <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                  {totalSolved} total
                </span>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Easy', count: easySolved, total: 300, color: '#00C896', bg: '#00C89615' },
                  { label: 'Medium', count: mediumSolved, total: 400, color: '#F5A623', bg: '#F5A62315' },
                  { label: 'Hard', count: hardSolved, total: 150, color: '#FF5F7E', bg: '#FF5F7E15' },
                ].map(({ label, count, total, color, bg }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: bg, color }}>
                          {label[0]}
                        </div>
                        <span className="text-sm font-semibold text-white">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black" style={{ color }}>{count}</span>
                        <span className="text-slate-600 text-xs">/ {total}</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((count / total) * 100, 100)}%`,
                          background: `linear-gradient(90deg, ${color}80, ${color})`,
                        }}
                      />
                    </div>
                    <div className="text-right text-xs text-slate-600 mt-1">
                      {Math.round((count / total) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="rounded-2xl border border-white/5 p-6"
              style={{ background: 'linear-gradient(135deg, #141420 0%, #1a1a2e 100%)' }}>
              <h2 className="text-white font-bold flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-[#6C63FF]" />
                Top topics
              </h2>
              {topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-3 border border-white/5">
                    <Sparkles size={24} className="text-slate-700" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No data yet</p>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Solve problems to see your strong topics
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics.slice(0, 6).map((t, i) => (
                    <div key={t.topic} className="flex items-center gap-3 group">
                      <div className="w-6 h-6 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center text-xs font-bold text-[#6C63FF]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm truncate">{t.topic}</span>
                          <span className="text-xs font-bold text-white ml-2">{t.count}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1 mt-1.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6C63FF]/50 to-[#6C63FF]"
                            style={{ width: `${(t.count / (topics[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-slate-600" />
                  <span className="text-slate-600 text-xs">Last solved</span>
                </div>
                <span className="text-white text-xs font-bold">
                  {streak.last_solved_date
                    ? new Date(streak.last_solved_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="rounded-2xl border border-white/5 p-6"
            style={{ background: 'linear-gradient(135deg, #141420 0%, #1a1a2e 100%)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Flame size={16} className="text-[#6C63FF]" />
                Activity heatmap
              </h2>
              <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">last 3 months</span>
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
              {Array.from({ length: 91 }).map((_, i) => {
                const hasActivity = heatmap?.some((h) => {
                  const diff = Math.floor(
                    (Date.now() - new Date(h.date).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return diff === 90 - i;
                });
                return (
                  <div
                    key={i}
                    title={hasActivity ? 'Active' : 'No activity'}
                    className="aspect-square rounded-md cursor-default transition-transform hover:scale-110"
                    style={{ background: hasActivity ? '#00C896' : 'rgba(255,255,255,0.04)' }}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-slate-600 text-xs">Less</span>
              {['rgba(255,255,255,0.04)', '#0d6e4a', '#0d9450', '#00C896'].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-slate-600 text-xs">More</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}