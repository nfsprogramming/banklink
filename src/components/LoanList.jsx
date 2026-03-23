import React from 'react';
import { Clock, CheckCircle2, XCircle, Info, ChevronRight, Calculator, FileText } from 'lucide-react';

const LoanList = ({ loans, isAdmin = false, onAction = null }) => {
  if (!loans || loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
          <FileText size={48} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">No loan applications yet</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {isAdmin ? "There are no pending or history applications in the system." : "Apply for your first loan using the form on the right!"}
        </p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'pending':
      default:
        return <Clock size={16} />;
    }
  };

  // EMI Calculation: (P * r * (1+r)^n) / ((1+r)^n - 1)
  // Simplified for demo: (P + (P * interestRate)) / tenure
  const calculateEMI = (amount, tenure) => {
    const annualRate = 0.12; // 12% annual interest
    const interest = amount * annualRate * (tenure / 12);
    return ((amount + interest) / tenure).toFixed(2);
  };

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <div key={loan.id} className="card group hover:border-primary-200 transition-all duration-300">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getStatusStyle(loan.status)}`}>
                {getStatusIcon(loan.status)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">#{loan.id.slice(0, 6).toUpperCase()}</h4>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusStyle(loan.status)}`}>
                    {loan.status}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Info size={14} /> {loan.purpose}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {loan.tenure} Months</span>
                  {loan.createdAt && (
                    <span className="flex items-center gap-1.5">
                      {new Date(loan.createdAt.seconds * 1000).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-2xl font-black text-slate-900 tracking-tight">${loan.amount.toLocaleString()}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest">
                <Calculator size={12} />
                EMI: ${calculateEMI(loan.amount, loan.tenure)}/mo
              </span>
            </div>
          </div>

          {(isAdmin && loan.status === 'pending') && (
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <button 
                onClick={() => onAction(loan.id, 'rejected')}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                title="Reject Loan"
              >
                <XCircle size={18} />
                Reject
              </button>
              <button 
                onClick={() => onAction(loan.id, 'approved')}
                className="btn-primary"
                title="Approve Loan"
              >
                <CheckCircle2 size={18} />
                Approve Application
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LoanList;
