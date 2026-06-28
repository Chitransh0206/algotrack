import { useQuery } from '@tanstack/react-query';
import { Trophy, Flame, Medal, Crown } from 'lucide-react';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';

const rankColors = {
  1: { bg: '#FFD700', text: '#000' },
  2: { bg: '#C0C0C0', text: '#000' },
  3: { bg: '#CD7F32', text: '#fff' },
};

const RankIcon = ({ rank }) => {
  if (rank === 1) return <Crown size={16} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={16} className="text-slate-400" />;
  if (rank === 3) return <Medal size={16} className="text-orange-400" />;
  return <span className="text-slate-500 text-sm font-mono w-4 text-center">{rank}</span>;
};

export default function Leaderboard() {
  const { user } = useAuthStore();

  const { data: friendsData, isLoading } = useQuery({
    queryKey: ['leaderboard-friends'],
    queryFn: () => api.get('/leaderboard/friends').then((r) => r.data),
  });

  const leaderboard = friendsData?.leaderboard || [];

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar />

      <div style={{ marginLeft: '208px' }} className="flex-1 min-w-0 pt-16 lg:pt-0">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/5 px-8 py-8"
          style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #141428 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full blur-3xl opacity-5" />
          <div className="relative">
            <h1 className="text-3xl font-black text-white tracking-tight">Leaderboard</h1>
            <p className="text-slate-500 text-sm mt-2">
              Compete with your friends and stay motivated
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center text-xl font-black text-slate-300 mb-2">
                  {leaderboard[1]?.user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="text-slate-300 text-xs font-semibold mb-1 truncate max-w-[80px] text-center">
                  {leaderboard[1]?.user?.username}
                </div>
                <div className="text-slate-400 text-xs mb-2">{leaderboard[1]?.solved} solved</div>
                <div className="w-20 h-16 bg-slate-500/20 border border-slate-500/20 rounded-t-xl flex items-center justify-center">
                  <Medal size={20} className="text-slate-400" />
                </div>
              </div>

              {/* 1st */}
              <div className="flex flex-col items-center">
                <Crown size={20} className="text-yellow-400 mb-1" />
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-2xl font-black text-yellow-300 mb-2">
                  {leaderboard[0]?.user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="text-yellow-300 text-xs font-bold mb-1 truncate max-w-[80px] text-center">
                  {leaderboard[0]?.user?.username}
                </div>
                <div className="text-yellow-400/70 text-xs mb-2">{leaderboard[0]?.solved} solved</div>
                <div className="w-20 h-24 bg-yellow-500/10 border border-yellow-500/20 rounded-t-xl flex items-center justify-center">
                  <Trophy size={24} className="text-yellow-400" />
                </div>
              </div>

              {/* 3rd */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl font-black text-orange-300 mb-2">
                  {leaderboard[2]?.user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="text-orange-300 text-xs font-semibold mb-1 truncate max-w-[80px] text-center">
                  {leaderboard[2]?.user?.username}
                </div>
                <div className="text-orange-400/70 text-xs mb-2">{leaderboard[2]?.solved} solved</div>
                <div className="w-20 h-10 bg-orange-500/10 border border-orange-500/20 rounded-t-xl flex items-center justify-center">
                  <Medal size={18} className="text-orange-400" />
                </div>
              </div>
            </div>
          )}

          {/* Full List */}
          <div className="rounded-2xl border border-white/5 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #141420 0%, #1a1a2e 100%)' }}>
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Trophy size={15} className="text-yellow-400" />
                Friends ranking
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No data yet</p>
                <p className="text-slate-600 text-xs mt-1">Add friends to see the leaderboard</p>
              </div>
            ) : (
              leaderboard.map((entry, i) => {
                const isYou = entry.user?.id === user?.id || entry.isYou;
                const rank = i + 1;

                return (
                  <div
                    key={entry.user?.id || i}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 transition-colors ${
                      isYou ? 'bg-[#6C63FF]/5 border-l-2 border-l-[#6C63FF]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center">
                      <RankIcon rank={rank} />
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{
                        background: isYou ? '#6C63FF20' : 'rgba(255,255,255,0.05)',
                        color: isYou ? '#6C63FF' : '#94a3b8',
                        border: isYou ? '1px solid #6C63FF40' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {entry.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isYou ? 'text-[#6C63FF]' : 'text-white'}`}>
                          {entry.user?.username || 'Unknown'}
                        </span>
                        {isYou && (
                          <span className="text-xs bg-[#6C63FF]/15 text-[#6C63FF] px-2 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Flame size={11} className="text-[#00C896]" />
                        <span className="text-xs text-slate-500">{entry.current_streak || 0} day streak</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`text-xl font-black ${isYou ? 'text-[#6C63FF]' : 'text-white'}`}>
                        {entry.solved}
                      </div>
                      <div className="text-xs text-slate-500">solved</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}