import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LoanList from '../components/LoanList';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Search, Filter, Mail, User, Info, DollarSign, PieChart, TrendingUp, Sparkles, FilterIcon, Clock } from 'lucide-react';

const AdminPanel = ({ user }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approvedAmount: 0,
    rejected: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'loans'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLoans(loanData);
      
      // Calculate admin stats
      const newStats = loanData.reduce((acc, loan) => {
        acc.total += 1;
        if (loan.status === 'pending') acc.pending += 1;
        if (loan.status === 'approved') acc.approvedAmount += loan.amount;
        if (loan.status === 'rejected') acc.rejected += 1;
        return acc;
      }, { total: 0, pending: 0, approvedAmount: 0, rejected: 0 });
      
      setStats(newStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (loanId, newStatus) => {
    try {
      const loanRef = doc(db, 'loans', loanId);
      await updateDoc(loanRef, {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
    } catch (error) {
      console.error('Error updating loan status:', error);
      alert('Failed to update status.');
    }
  };

  const filteredLoans = activeTab === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === activeTab);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-8">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-900 text-white shadow-xl shadow-primary-900/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Admin Control Panel</h1>
            <p className="mt-1 text-lg font-medium text-slate-500">Manage loan applications and user requests.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-green-700 border border-green-100 shadow-sm ring-1 ring-green-900/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">Live View Active</span>
        </div>
      </header>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Applications', value: stats.total, icon: <FileText className="text-indigo-600" />, bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100' },
          { label: 'Urgent Pending', value: stats.pending, icon: <Clock className="text-amber-600" />, bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
          { label: 'Total Approved Capex', value: `$${stats.approvedAmount.toLocaleString()}`, icon: <TrendingUp className="text-emerald-600" />, bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
          { label: 'Turned Down', value: stats.rejected, icon: <XCircle className="text-rose-600" />, bgColor: 'bg-rose-50', borderColor: 'border-rose-100' },
        ].map((stat, i) => (
          <div key={i} className="card group hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className={`p-3 w-fit rounded-xl ${stat.bgColor} shadow-sm border ${stat.borderColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1 truncate">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200 pb-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {['all', 'pending', 'approved', 'rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab 
                  ? 'bg-white text-primary-600 shadow-sm ring-1 ring-slate-950/5' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search Client ID..." 
                className="rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 w-64"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FilterIcon size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        <LoanList loans={filteredLoans} isAdmin={true} onAction={handleAction} />
      </div>
    </div>
  );
};

export default AdminPanel;
