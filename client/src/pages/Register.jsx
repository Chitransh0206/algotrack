import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Zap } from 'lucide-react';
import api from '../lib/axios';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A14] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#141420] border-r border-[#6C63FF]/20 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6C63FF] rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold">AlgoTrack</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your DSA journey<br />
            <span className="text-[#6C63FF]">starts here.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join thousands of engineers preparing smarter with AI-powered hints and company roadmaps.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Company-wise sheets', desc: 'Amazon, Google, Microsoft & more' },
              { icon: '🤖', title: 'AI hint engine', desc: '3-level progressive hints per problem' },
              { icon: '🔥', title: 'Streak tracking', desc: 'Daily reminders to keep you consistent' },
              { icon: '🏆', title: 'Friends leaderboard', desc: 'Compete with your network' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0A0A14] border border-[#6C63FF]/20 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm">Free to use. No credit card required.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold">AlgoTrack</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-8">Start your AlgoTrack journey today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-[#141420] border border-[#6C63FF]/20 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#6C63FF] transition-colors placeholder:text-slate-600"
                  placeholder="rahulsharma"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#141420] border border-[#6C63FF]/20 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#6C63FF] transition-colors placeholder:text-slate-600"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#141420] border border-[#6C63FF]/20 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#6C63FF] transition-colors placeholder:text-slate-600"
                  placeholder="min. 6 characters"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C63FF] hover:bg-[#4f49c4] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6C63FF] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}