'use client';

import { useState } from 'react';
import { adminLogin } from '@/app/actions/auth';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await adminLogin(username, password);

    if (result.success) {
      localStorage.setItem('isAdmin', 'true');
      window.location.href = '/admin';
    } else {
      setError(result.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-brand-charcoal border border-white/10 p-4 text-white uppercase tracking-widest text-xs focus:border-brand-green outline-none transition-colors"
          required
        />
      </div>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-brand-charcoal border border-white/10 p-4 pr-12 text-white text-xs tracking-wider focus:border-brand-green outline-none transition-colors"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-brand-green p-1 transition-colors"
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed text-left">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-white text-brand-charcoal font-black uppercase tracking-widest text-sm hover:bg-brand-green transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
        Log In
      </button>
    </form>
  );
}
