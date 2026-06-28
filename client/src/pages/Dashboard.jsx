import { useQuery } from '@tanstack/react-query';
import {
  Target,
  Flame,
  TrendingUp,
  Zap,
  ArrowUp,
  Code2,
  Trophy,
  Calendar,
} from 'lucide-react';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';

const StatCard = ({ label, value, sub, icon: Icon, accent }) => (
  <div className="bg-[#141420] border border-[#6C63FF]/20 rounded-xl p-5 hover:border-[#6C63FF]/40 transition-all hover:shadow-lg hover:shadow-[#6C63FF]/5">
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
        <Icon size={16} style={{ color: accent }} />
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    {sub && <div className="text-xs font-medium mt-1" style={{ color: accent }}>{sub}</div>}
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
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A14]">
        <Sidebar />
        <main className="lg:ml-52 flex-1 flex items-center justify-center pt-14 lg:pt-0">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar streak={streak.current_streak || 0} />

      <main className="lg:ml-52 flex-1 pt-16 lg:pt-0 min-w-0 overflow-x-hidden">
        <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-slate-500 text-sm">{greeting()},</p>
              <h1 className="text-white text-2xl font-bold mt-0.5">
                {user?.username || 'Coder'} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-[#141420] border border-[#00C896]/20 rounded-xl px-4 py-2.5">
              <Flame size={16} className="text-[#00C896]" />
              <span className="text-white text-sm font-bold">{streak.current_streak || 0}</span>
              <span className="text-slate-500 text-xs">day streak</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatCard
              label="Total Solved"
              value={solved.total || 0}
              sub="Keep grinding 💪"
              icon={Target}
              accent="#6C63FF"
            />
            <StatCard
              label="Easy"
              value={solved.easy || 0}
              sub="problems solved"
              icon={Zap}
              accent="#00C896"
            />
            <StatCard
              label="Medium"
              value={solved.medium || 0}
              sub="problems solved"
              icon={TrendingUp}
              accent="#F5A623"
            />
            <StatCard
              label="Hard"
              value={solved.hard || 0}
              sub="problems solved"
              icon={ArrowUp}
              accent="#FF5F7E"
            />
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Progress */}
            <div className="bg-[#141420] border border-[#6C63FF]/20 rounded-xl p-5">
              <h2 className="text-white text-sm font-semibold mb-5 flex items-center gap-2">
                <div className="w-6 h-6 bg-[#6C63FF]/15 rounded-lg flex items-center justify-center">
                  <Code2 size={13} className="text-[#6C63FF]" />
                </div>
                Progress by difficulty
              </h2>
              <div className="space-y-5">
                {[
                  { label: 'Easy', count: Number(solved.easy) || 0, total: 300, color: '#00C896' },
                  { label: 'Medium', count: Number(solved.medium) || 0, total: 400, color: '#F5A623' },
                  { label: 'Hard', count: Number(solved.hard) || 0, total: 150, color: '#FF5F7E' },
                ].map(({ label, count, total, color }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-sm font-medium" style={{ color }}>{label}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        <span className="text-white font-medium">{count}</span> / {total}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((count / total) * 100, 100)}%`,
                          background: `linear-gradient(90deg, ${color}99, ${color})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Streak info */}
              <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={13} className="text-yellow-500" />
                  <span className="text-slate-400 text-xs">Longest streak</span>
                </div>
                <span className="text-white text-sm font-bold">{streak.longest_streak || 0} days</span>
              </div>
            </div>

            {/* Top Topics */}
            <div className="bg-[#141420] border border-[#6C63FF]/20 rounded-xl p-5">
              <h2 className="text-white text-sm font-semibold mb-5 flex items-center gap-2">
                <div className="w-6 h-6 bg-[#6C63FF]/15 rounded-lg flex items-center justify-center">
                  <TrendingUp size={13} className="text-[#6C63FF]" />
                </div>
                Top topics
              </h2>
              {topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 text-center">
                  <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-3">
                    <Code2 size={24} className="text-slate-700" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No topics yet</p>
                  <p className="text-slate-600 text-xs mt-1">Solve problems to see your strengths</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.slice(0, 5).map((t, i) => (
                    <div key={t.topic} className="flex items-center gap-3 group">
                      <span className="text-slate-700 text-xs w-4 font-medium">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{t.topic}</span>
                          <span className="text-[#6C63FF] text-xs font-bold">{t.count}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1">
                          <div
                            className="h-full rounded-full bg-[#6C63FF]/60"
                            style={{ width: `${(t.count / (topics[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-[#6C63FF]" />
                  <span className="text-slate-400 text-xs">Last solved</span>
                </div>
                <span className="text-white text-xs font-medium">
                  {streak.last_solved_date
                    ? new Date(streak.last_solved_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-[#141420] border border-[#6C63FF]/20 rounded-xl p-5">
            <h2 className="text-white text-sm font-semibold mb-5 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#6C63FF]/15 rounded-lg flex items-center justify-center">
                <Flame size={13} className="text-[#6C63FF]" />
              </div>
              Activity — last 3 months
            </h2>
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}
            >
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
                    className="aspect-square rounded-sm transition-all hover:scale-110 cursor-default"
                    style={{
                      background: hasActivity
                        ? '#00C896'
                        : 'rgba(255,255,255,0.04)',
                    }}
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
      </main>
    </div>
  );
}