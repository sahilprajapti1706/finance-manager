import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X
} from 'lucide-react';
import { recordsApi } from '../api/records.api';
import { useAuthStore } from '../store/auth.store';
import type { FinancialRecord } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, FileSpreadsheet } from 'lucide-react';

const Records: React.FC = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    const recordId = searchParams.get('recordId');

    const handleRecordParams = async () => {
      if (action === 'add') {
        const isAllowed = user?.role === 'admin' || user?.role === 'analyst';
        if (isAllowed) {
          setIsModalOpen(true);
          setEditingRecord(null);
        }
        setSearchParams({}, { replace: true });
      } else if (recordId) {
        try {
          setLoading(true);
          const res = await recordsApi.getRecordById(recordId);
          setEditingRecord(res.data.record);
          setIsModalOpen(true);
        } catch (err) {
          console.error('Failed to fetch deep-linked record', err);
        } finally {
          setLoading(false);
          setSearchParams({}, { replace: true });
        }
      }
    };

    handleRecordParams();
  }, [searchParams, setSearchParams, user]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await recordsApi.getRecords({ 
        page, 
        limit, 
        type, 
        category, 
        startDate, 
        endDate 
      });
      setRecords(res.data.records);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type, category, startDate, endDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await recordsApi.deleteRecord(id);
      fetchRecords();
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Generate the PDF right here in the browser to keep our server snappy for everyone else
  const handleExportPDF = async () => {
    try {
      const res = await recordsApi.exportJSON({ type, category, startDate, endDate });
      const records = res.data.records as FinancialRecord[];
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text('Financial Activity Statement', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 30);
      doc.text(`Filters: ${type || 'All'} | ${category || 'All Categories'}`, 14, 35);
      
      const tableData = records.map(r => [
        new Date(r.date).toLocaleDateString('en-IN'),
        r.category,
        r.type.toUpperCase(),
        `₹${Number(r.amount).toLocaleString('en-IN')}`,
        r.notes || '-'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Date', 'Category', 'Type', 'Amount', 'Notes']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        columnStyles: { 3: { halign: 'right' } }
      });

      doc.save(`Finance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export failed:', err);
      alert('PDF Export failed');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await recordsApi.exportCSV({ type, category, startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'analyst';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Records</h1>
          <p className="text-text-secondary mt-1">Manage your income and expense entries in one place.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="glass-card hover:bg-white/10 px-4 py-2 flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-all group"
            title="Download full report as PDF"
          >
            <FileText size={18} className="group-hover:text-amber-400" />
            Export PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="glass-card hover:bg-white/10 px-4 py-2 flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-all group"
            title="Download full report as CSV"
          >
            <FileSpreadsheet size={18} className="group-hover:text-emerald-400" />
            Export CSV
          </button>
          
          {canManage && (
            <button 
              onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Record
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-6 flex flex-wrap items-end gap-4 shadow-2xl">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Search Category</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="text" 
              placeholder="e.g. Salary, Rent..." 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="glass-input pl-10 w-full" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Type</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="glass-input w-40"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
           <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">From</label>
           <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="glass-input" />
        </div>

        <div>
           <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">To</label>
           <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="glass-input" />
        </div>

        <button 
          onClick={() => { setCategory(''); setType(''); setStartDate(''); setEndDate(''); }}
          className="p-2 text-text-secondary hover:text-white transition-colors"
          title="Reset Filters"
        >
          <Filter size={20} />
        </button>
      </div>

      <div className="glass-card overflow-hidden shadow-2xl relative">
        {loading && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-10 flex items-center justify-center">
             <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}
        
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5 uppercase text-[10px] font-black tracking-[0.2em] text-text-secondary">
            <tr>
              <th className="px-6 py-5">Transaction</th>
              <th className="px-6 py-5">Type</th>
              <th className="px-6 py-5">Amount</th>
              <th className="px-6 py-5">Date</th>
              {canManage && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.length > 0 ? records.map((record) => (
              <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                       {record.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{record.category}</span>
                      <span className="text-[10px] text-text-secondary line-clamp-1">{record.notes || 'No description'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     record.type === 'income' ? 'bg-income/10 border-income/20 text-income' : 'bg-expense/10 border-expense/20 text-expense'
                   }`}>
                     {record.type}
                   </span>
                </td>
                <td className={`px-6 py-4 text-sm font-black ${record.type === 'income' ? 'text-income' : 'text-expense'}`}>
                   {record.type === 'income' ? '+' : '-'} ₹{Number(record.amount).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary font-medium">
                  {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </td>
                {canManage && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingRecord(record); setIsModalOpen(true); }}
                        className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={canManage ? 6 : 5} className="px-6 py-12 text-center text-text-secondary italic">
                   No financial records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">
              Showing {records.length} of {total} records
            </span>
            <div className="flex items-center gap-2">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="p-2 glass-card hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
               >
                 <ChevronLeft size={18} />
               </button>
               <span className="text-sm font-bold text-white px-4">Page {page} of {Math.ceil(total/limit) || 1}</span>
               <button 
                 disabled={page >= Math.ceil(total/limit)}
                 onClick={() => setPage(p => p + 1)}
                 className="p-2 glass-card hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
               >
                 <ChevronRight size={18} />
               </button>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <RecordModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={() => { setIsModalOpen(false); fetchRecords(); }}
          record={editingRecord}
        />
      )}
    </div>
  );
};

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Gift', 'Rental Income', 'Consulting'],
  expense: [
    'Rent', 
    'Groceries', 
    'Utilities', 
    'Transport', 
    'Dining Out', 
    'Entertainment', 
    'Healthcare', 
    'Shopping', 
    'Travel', 
    'Education', 
    'Insurance', 
    'Subscriptions'
  ]
};

// --- Record Modal Sub-Component ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  record?: FinancialRecord | null;
}

const RecordModal: React.FC<ModalProps> = ({ onClose, onSubmit, record }) => {
  const [formData, setFormData] = useState({
    amount: record ? record.amount : 0,
    type: record ? record.type : 'expense',
    category: record ? record.category : '',
    date: record 
      ? (() => {
          const d = new Date(record.date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })()
      : new Date().toISOString().split('T')[0],
    notes: record ? (record.notes || '') : ''
  });
  const [loading, setLoading] = useState(false);
  const [showOther, setShowOther] = useState(false);

  // Initialize showOther if the record's category is custom
  useEffect(() => {
    if (record?.category) {
      const list = record.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
      if (!list.includes(record.category)) {
        setShowOther(true);
      }
    }
  }, [record]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setFormData({ ...formData, type: newType, category: '' });
    setShowOther(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (record) {
        await recordsApi.updateRecord(record.id, formData);
      } else {
        await recordsApi.createRecord(formData);
      }
      onSubmit();
    } catch (err) {
      alert('Save failed');
    } finally {
      setLoading(false);
    }
  };

  // We use a portal here so the modal doesn't get messed up by the blur effects on the main page.
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
       <div className="w-full max-w-lg glass-card p-10 relative shadow-2xl border-white/20">
          <button onClick={onClose} className="absolute right-6 top-6 text-text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-black text-white mb-8 tracking-tight uppercase">
            {record ? 'Edit' : 'Create New'} Record
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-3">Type</label>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                       <button 
                         type="button" 
                         onClick={() => handleTypeChange('income')}
                         className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${formData.type === 'income' ? 'bg-income text-white shadow-lg shadow-income/20' : 'text-text-secondary hover:text-white'}`}
                       >
                         INCOME
                       </button>
                       <button 
                         type="button" 
                         onClick={() => handleTypeChange('expense')}
                         className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${formData.type === 'expense' ? 'bg-expense text-white shadow-lg shadow-expense/20' : 'text-text-secondary hover:text-white'}`}
                       >
                         EXPENSE
                       </button>
                    </div>
                 </div>
       <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-3">Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="glass-input w-full font-black text-white py-3 text-lg"
                  />
                </div>
             </div>

              <div className="space-y-4">
                 <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">Category</label>
                 
                 <select 
                   required
                   value={showOther ? 'Other' : formData.category}
                   onChange={(e) => {
                     const val = e.target.value;
                     if (val === 'Other') {
                       setShowOther(true);
                       setFormData({ ...formData, category: '' });
                     } else {
                       setShowOther(false);
                       setFormData({ ...formData, category: val });
                     }
                   }}
                   className="glass-input w-full text-sm font-bold text-white appearance-none cursor-pointer"
                 >
                    <option value="" disabled className="bg-background">Choose a category...</option>
                    {(formData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                      <option key={cat} value={cat} className="bg-background">{cat}</option>
                    ))}
                    <option value="Other" className="bg-background font-black text-primary">Other / Custom...</option>
                 </select>

                 {showOther && (
                   <input 
                     type="text" 
                     placeholder="Type custom category name..."
                     required
                     autoFocus
                     value={formData.category}
                     onChange={(e) => setFormData({...formData, category: e.target.value})}
                     className="glass-input w-full animate-fade-in !bg-primary/5 focus:!bg-primary/10 border-primary/20"
                   />
                 )}
              </div>

             <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-3">Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="glass-input w-full"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-3">Notes & Observations</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="glass-input w-full resize-none p-4"
                  placeholder="Additional context for this transaction..."
                />
             </div>

             <button type="submit" disabled={loading} className="w-full btn-primary !py-5 text-md font-black tracking-widest uppercase flex items-center justify-center gap-3 mt-4">
                {loading && <Loader2 className="animate-spin" size={20} />}
                {record ? 'Save Entry' : 'Add Record'}
             </button>
          </form>
       </div>
    </div>,
    document.body
  );
};

export default Records;
