import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  Circle,
  RotateCcw,
  ExternalLink,
  Lightbulb,
  Filter,
  Search,
} from 'lucide-react';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const STATUSES = ['All', 'solved', 'attempted', 'to_review'];

const diffColor = {
  Easy: 'text-[#00C896] bg-[#00C896]/10',
  Medium: 'text-[#F5A623] bg-[#F5A623]/10',
  Hard: 'text-[#FF5F7E] bg-[#FF5F7E]/10',
};

export default function Problems() {
  const [difficulty, setDifficulty] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [hintModal, setHintModal] = useState(null);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['problems', difficulty, status],
    queryFn: () =>
      api.get('/problems', {
        params: {
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          status: status !== 'All' ? status : undefined,
        },
      }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.put(`/problems/${id}/solution`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['problems']),
  });

  const getHint = async (problem) => {
    setHintModal(problem);
    setHint('');
    setHintLevel(1);
    setHintLoading(true);
    try {
      const res = await api.post('/ai/hint', {
        problemId: problem.id,
        hintLevel: 1,
      });
      setHint(res.data.hint);
    } catch {
      setHint('Could not load hint. Please try again.');
    } finally {
      setHintLoading(false);
    }
  };

  const getNextHint = async () => {
    const next = hintLevel + 1;
    if (next > 3) return;
    setHintLevel(next);
    setHintLoading(true);
    try {
      const res = await api.post('/ai/hint', {
        problemId: hintModal.id,
        hintLevel: next,
      });
      setHint(res.data.hint);
    } catch {
      setHint('Could not load hint.');
    } finally {
      setHintLoading(false);
    }
  };

  const filtered = data?.problems?.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar />

      <main className="lg:ml-52 flex-1 pt-16 lg:pt-0">
        <div className="p-4 md:p-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-white text-xl font-bold">Problems</h1>
            <p className="text-slate-500 text-sm mt-1">
              {data?.total || 0} problems total
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#141420] border border-[#6C63FF]/20 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6C63FF] transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1 bg-[#141420] border border-[#6C63FF]/20 rounded-xl p-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      difficulty === d
                        ? 'bg-[#6C63FF] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex gap-1 bg-[#141420] border border-[#6C63FF]/20 rounded-xl p-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      status === s
                        ? 'bg-[#6C63FF] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s === 'All' ? 'All' : s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-[#141420] border border-[#6C63FF]/20 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#6C63FF]/10 text-xs text-slate-500 font-medium uppercase tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-1">#</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Topic</div>
              <div className="col-span-2">Actions</div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Loading problems...</p>
              </div>
            ) : filtered?.length === 0 || !filtered ? (
              <div className="p-12 text-center">
                <Circle size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No problems found</p>
                <p className="text-slate-600 text-xs mt-1">Try changing your filters</p>
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-[#6C63FF]/10 hover:bg-white/[0.02] transition-colors items-center group"
                >
                  <div className="col-span-1">
                    {p.user_status === 'solved' ? (
                      <CheckCircle size={16} className="text-[#00C896]" />
                    ) : p.user_status === 'attempted' ? (
                      <RotateCcw size={16} className="text-[#F5A623]" />
                    ) : (
                      <Circle size={16} className="text-slate-700" />
                    )}
                  </div>
                  <div className="col-span-1 text-slate-600 text-xs font-mono">
                    {p.leetcode_number || '-'}
                  </div>
                  <div className="col-span-4 text-white text-sm font-medium truncate group-hover:text-[#6C63FF] transition-colors">
                    {p.title}
                  </div>
                  <div className="col-span-2">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${diffColor[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <div className="col-span-2 text-slate-500 text-xs truncate">
                    {p.topic || '-'}
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <button
                      onClick={() => updateMutation.mutate({ id: p.id, status: 'solved' })}
                      className="text-xs text-[#00C896] hover:underline font-medium"
                    >
                      Mark solved
                    </button>
                    <button
                      onClick={() => getHint(p)}
                      className="text-slate-500 hover:text-[#6C63FF] transition-colors"
                      title="AI Hint"
                    >
                      <Lightbulb size={15} />
                    </button>
                    {p.url && (
                      
                       <a href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filtered?.length === 0 || !filtered ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">No problems found</p>
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#141420] border border-[#6C63FF]/20 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {p.user_status === 'solved' ? (
                        <CheckCircle size={15} className="text-[#00C896] flex-shrink-0" />
                      ) : (
                        <Circle size={15} className="text-slate-700 flex-shrink-0" />
                      )}
                      <span className="text-white text-sm font-medium truncate">{p.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium flex-shrink-0 ${diffColor[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                  </div>

                  {p.topic && (
                    <p className="text-slate-500 text-xs mb-3 ml-5">{p.topic}</p>
                  )}

                  <div className="flex items-center gap-3 ml-5">
                    <button
                      onClick={() => updateMutation.mutate({ id: p.id, status: 'solved' })}
                      className="text-xs text-[#00C896] font-medium"
                    >
                      Mark solved
                    </button>
                    <button
                      onClick={() => getHint(p)}
                      className="text-xs text-[#6C63FF] flex items-center gap-1"
                    >
                      <Lightbulb size={12} /> Hint
                    </button>
                    {p.url && (
                      
                       <a href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Open
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      {/* AI Hint Modal */}
      {hintModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141420] border border-[#6C63FF]/30 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={16} className="text-[#6C63FF]" />
                  <h3 className="text-white font-semibold text-sm">{hintModal.title}</h3>
                </div>
                <div className="flex gap-1.5 ml-6">
                  {[1, 2, 3].map((l) => (
                    <div
                      key={l}
                      className="w-8 h-1 rounded-full transition-colors"
                      style={{ background: l <= hintLevel ? '#6C63FF' : 'rgba(255,255,255,0.1)' }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setHintModal(null)}
                className="text-slate-500 hover:text-white w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
              >
                x
              </button>
            </div>

            <div className="bg-[#0A0A14] border border-white/5 rounded-xl p-4 min-h-[120px] mb-4">
              {hintLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm h-full">
                  <div className="w-4 h-4 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  AI is thinking...
                </div>
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">{hint}</p>
              )}
            </div>

            <div className="flex gap-3">
              {hintLevel < 3 && (
                <button
                  onClick={getNextHint}
                  disabled={hintLoading}
                  className="flex-1 bg-[#6C63FF]/15 hover:bg-[#6C63FF]/25 text-[#6C63FF] text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 font-medium"
                >
                  Bigger hint
                </button>
              )}
              <button
                onClick={() => setHintModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 text-sm py-2.5 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
