import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, ExternalLink, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';

const diffColor = {
  Easy: 'text-[#00C896] bg-[#00C896]/10',
  Medium: 'text-[#F5A623] bg-[#F5A623]/10',
  Hard: 'text-[#FF5F7E] bg-[#FF5F7E]/10',
};

const companyColors = {
  amazon: '#FF9900',
  google: '#4285F4',
  microsoft: '#00A4EF',
  meta: '#0082FB',
};

export default function CompanyDetail() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [hintModal, setHintModal] = useState(null);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => api.get(`/companies/${slug}/problems`).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.put(`/problems/${id}/solution`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['company', slug]),
  });

  const getHint = async (problem) => {
    setHintModal(problem);
    setHint('');
    setHintLevel(1);
    setHintLoading(true);
    try {
      const res = await api.post('/ai/hint', { problemId: problem.id, hintLevel: 1 });
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
      const res = await api.post('/ai/hint', { problemId: hintModal.id, hintLevel: next });
      setHint(res.data.hint);
    } catch {
      setHint('Could not load hint.');
    } finally {
      setHintLoading(false);
    }
  };

  const accent = companyColors[slug] || '#6C63FF';
  const solved = data?.solved || 0;
  const total = data?.total || 0;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar />

      <div style={{ marginLeft: '208px' }} className="flex-1 min-w-0 pt-16 lg:pt-0">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/5 px-8 py-8"
          style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #141428 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-5"
            style={{ background: accent }} />
          <div className="relative">
            <Link to="/companies"
              className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-4 transition-colors w-fit">
              <ArrowLeft size={14} /> Back to companies
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight capitalize">
                  {data?.company?.name || slug}
                </h1>
                <p className="text-slate-500 text-sm mt-1">{total} curated problems</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black" style={{ color: accent }}>{pct}%</div>
                <div className="text-slate-500 text-xs">{solved}/{total} solved</div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4 w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}80, ${accent})` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #141420 0%, #1a1a2e 100%)' }}>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-xs text-slate-500 font-medium uppercase tracking-wider">
                <div className="col-span-1"></div>
                <div className="col-span-1">#</div>
                <div className="col-span-4">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2">Topic</div>
                <div className="col-span-2">Actions</div>
              </div>

              {data?.problems?.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 text-sm">No problems found</p>
                </div>
              ) : (
                data?.problems?.map((p) => (
                  <div key={p.id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center group">
                    <div className="col-span-1">
                      {p.user_status === 'solved' ? (
                        <CheckCircle size={16} className="text-[#00C896]" />
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
                        className="text-xs font-medium text-[#00C896] hover:underline"
                      >
                        Solved
                      </button>
                      <button
                        onClick={() => getHint(p)}
                        className="text-slate-500 hover:text-[#6C63FF] transition-colors"
                        title="AI Hint"
                      >
                        <Lightbulb size={15} />
                      </button>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noreferrer"
                          className="text-slate-500 hover:text-white transition-colors">
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hint Modal */}
      {hintModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-[#6C63FF]/30 p-6 w-full max-w-lg"
            style={{ background: '#141420' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-[#6C63FF]" />
                  <h3 className="text-white font-semibold text-sm">{hintModal.title}</h3>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((l) => (
                    <div key={l} className="w-8 h-1 rounded-full transition-colors"
                      style={{ background: l <= hintLevel ? '#6C63FF' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>
              <button onClick={() => setHintModal(null)}
                className="text-slate-500 hover:text-white w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                x
              </button>
            </div>

            <div className="bg-[#0A0A14] border border-white/5 rounded-xl p-4 min-h-[120px] mb-4">
              {hintLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-4 h-4 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  AI is thinking...
                </div>
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">{hint}</p>
              )}
            </div>

            <div className="flex gap-3">
              {hintLevel < 3 && (
                <button onClick={getNextHint} disabled={hintLoading}
                  className="flex-1 bg-[#6C63FF]/15 hover:bg-[#6C63FF]/25 text-[#6C63FF] text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 font-medium">
                  Bigger hint
                </button>
              )}
              <button onClick={() => setHintModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 text-sm py-2.5 rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}