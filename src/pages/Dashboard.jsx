import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import LoanForm from '../components/LoanForm';
import LoanList from '../components/LoanList';
import { Wallet, CheckCircle2, Clock, XCircle, TrendingUp, Sparkles, LogOut, ChevronRight, Calculator, FileText } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalAmount: 0
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'loans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLoans(loanData);
      
      // Calculate stats
      const newStats = loanData.reduce((acc, loan) => {
        acc.total += 1;
        if (loan.status === 'approved') {
          acc.approved += 1;
          acc.totalAmount += loan.amount;
        } else if (loan.status === 'pending') {
          acc.pending += 1;
        } else if (loan.status === 'rejected') {
          acc.rejected += 1;
        }
        return acc;
      }, { total: 0, approved: 0, pending: 0, rejected: 0, totalAmount: 0 });
      
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">Dashboard</h1>
          <p className="mt-2 text-lg font-medium text-slate-500">Welcome back! Here's your loan status at a glance.</p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-white/50 px-5 py-2.5 ring-1 ring-slate-950/5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 border border-primary-200">
            <Sparkles size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 leading-none">Credit Score</span>
            <span className="text-lg font-black text-slate-900 leading-tight">Good (720)</span>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Loans', value: stats.total, icon: <Wallet className="text-blue-600" />, bgColor: 'bg-blue-100', borderColor: 'border-blue-200', bgColor2: 'bg-blue-50' },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle2 className="text-green-600" />, bgColor: 'bg-green-100', borderColor: 'border-green-200', bgColor2: 'bg-green-50' },
          { label: 'Pending', value: stats.pending, icon: <Clock className="text-amber-600" />, bgColor: 'bg-amber-100', borderColor: 'border-amber-200', bgColor2: 'bg-amber-50' },
          { label: 'Rejected', value: stats.rejected, icon: <XCircle className="text-red-600" />, bgColor: 'bg-red-100', borderColor: 'border-red-200', bgColor2: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="card group relative overflow-hidden p-6 hover:shadow-lg transition-all duration-300">
            <div className={`absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full ${stat.bgColor2} transition-transform group-hover:scale-110 opacity-60`} />
            <div className="relative flex flex-col items-start gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm border ${stat.borderColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  {stat.label === 'Approved' && (
                    <span className="text-sm font-bold text-green-600 flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                      <TrendingUp size={14} className="mr-0.5" />
                      View active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Loan History List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Loan History</h2>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              Refresh <ChevronRight size={14} />
            </button>
          </div>
          <LoanList loans={loans} />
        </div>

        {/* Apply Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-none py-1">New Application</h2>
          <LoanForm userId={user.uid} />
          
          {/* Quick Info Card */}
          <div className="card bg-primary-900 text-white border-0 shadow-xl shadow-primary-900/20 overflow-hidden relative">
            <div className="absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-white/10" />
            <h4 className="flex items-center gap-2 text-lg font-bold tracking-tight mb-4">
              <Calculator size={20} className="text-primary-300" />
              Why BankLink?
            </h4>
            <ul className="space-y-3 text-sm font-medium text-primary-100 relative z-10">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <span>Low interest rates starting from 8.5%</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <span>Zero processing fee for education loans</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <span>Approval within 24-48 business hours</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
