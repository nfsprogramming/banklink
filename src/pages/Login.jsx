import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message.includes('auth/invalid-credential') 
        ? 'Invalid email or password' 
        : err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-12rem)] items-center justify-center py-10">
      <div className="card w-full max-w-md bg-white shadow-2xl p-10 ring-1 ring-slate-950/5 border-inherit">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-500/20 mb-6 group transition-all duration-300">
            <ShieldCheck size={32} className="transition-transform group-hover:scale-110" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-slate-500 font-medium tracking-tight">Login to your account to manage loans</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 ring-1 ring-red-900/5 animate-shimmer">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label-text">Email address</label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700">Forgot?</a>
            </div>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base font-bold tracking-tight mt-2">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <LogIn size={20} />
                Sign in to continue
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-primary-200">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
