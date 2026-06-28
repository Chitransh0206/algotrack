import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronRight, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';

const companyColors = {
  amazon: { accent: '#FF9900', bg: '#FF990015' },
  google: { accent: '#4285F4', bg: '#4285F415' },
  microsoft: { accent: '#00A4EF', bg: '#00A4EF15' },
  meta: { accent: '#0082FB', bg: '#0082FB15' },
};

export default function Companies() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then((r) => r.data),
  });

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar />

      <div style={{ marginLeft: '208px' }} className="flex-1 min-w-0 pt-16 lg:pt-0">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/5 px-8 py-8"
          style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #141428 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C63FF] rounded-full blur-3xl opacity-5" />
          <div className="relative">
            <h1 className="text-3xl font-black text-white tracking-tight">Company Roadmaps</h1>
            <p className="text-slate-500 text-sm mt-2">
              Curated problem sets from top tech companies
            </p>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies?.map((company) => {
                const colors = companyColors[company.slug] || { accent: '#6C63FF', bg: '#6C63FF15' };
                const progress = company.solved || 0;
                const total = parseInt(company.total_problems) || 0;
                const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

                return (
                  <Link
                    key={company.id}
                    to={`/companies/${company.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-white/10 p-6 transition-all hover:shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #141420 0%, #1a1a2e 100%)' }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
                      style={{ background: colors.accent, transform: 'translate(30%, -30%)' }} />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black"
                            style={{ background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}30` }}>
                            {company.name[0]}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{company.name}</h3>
                            <p className="text-slate-500 text-xs">{total} problems</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">Progress</span>
                          <span className="text-xs font-bold" style={{ color: colors.accent }}>{pct}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${colors.accent}80, ${colors.accent})`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Target size={13} style={{ color: colors.accent }} />
                          <span className="text-xs text-slate-400">{progress} solved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trophy size={13} className="text-yellow-500" />
                          <span className="text-xs text-slate-400">{total - progress} remaining</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}