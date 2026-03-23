import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, DollarSign, TextQuote, Calendar, CheckCircle2 } from 'lucide-react';

const LoanForm = ({ userId, onLoanApplied }) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tenure, setTenure] = useState('12'); // in months
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'loans'), {
        userId,
        amount: parseFloat(amount),
        purpose,
        tenure: parseInt(tenure),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      setSuccess(true);
      setAmount('');
      setPurpose('');
      
      if (onLoanApplied) onLoanApplied();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error applying for loan:', error);
      alert('Failed to apply for loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card relative overflow-hidden">
      {success && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4 scale-110">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Application Sent!</h3>
          <p className="text-slate-500 font-medium">We'll review it shortly.</p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">Apply for a New Loan</h3>
        <p className="text-sm font-medium text-slate-400">Fill out the details below to submit your application.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-text">Requested Amount</label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors">
              <DollarSign size={18} />
            </span>
            <input
              type="number"
              required
              min="1000"
              step="100"
              className="input-field pl-10"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label-text">Loan Purpose</label>
          <div className="relative group">
            <span className="absolute left-3 top-[1.15rem] text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors">
              <TextQuote size={18} />
            </span>
            <select
              required
              className="input-field pl-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="" disabled>Select a purpose</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Home Loan">Home Loan</option>
              <option value="Education Loan">Education Loan</option>
              <option value="Business Loan">Business Loan</option>
              <option value="Car Loan">Car Loan</option>
              <option value="Emergency Fund">Emergency Fund</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label-text">Tenure (Months)</label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors">
              <Calendar size={18} />
            </span>
            <select
              required
              className="input-field pl-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
            >
              <option value="6">6 Months</option>
              <option value="12">12 Months (1 Year)</option>
              <option value="24">24 Months (2 Years)</option>
              <option value="36">36 Months (3 Years)</option>
              <option value="60">60 Months (5 Years)</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base font-bold tracking-tight">
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <Send size={18} />
              Submit Application
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoanForm;
