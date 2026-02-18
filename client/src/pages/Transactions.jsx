import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, Trash2, Pencil, CheckCircle, Clock, ReceiptText } from 'lucide-react';
import api from '../api/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        type: 'Cash',
        customer: '',
        chequeNumber: '',
        chequeDate: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transRes, custRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/customers')
            ]);
            setTransactions(transRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Clean up formData before sending
        const payload = {
            ...formData,
            amount: Number(formData.amount) || 0
        };
        // Customer ID is now always kept, as per instruction.
        if (payload.type !== 'Cheque') {
            delete payload.chequeNumber;
            delete payload.chequeDate;
        }

        try {
            if (editingId) {
                await api.patch(`/transactions/${editingId}`, payload);
            } else {
                await api.post('/transactions', payload);
            }
            setIsModalOpen(false);
            setEditingId(null);
            fetchData();
            setFormData({ amount: '', type: 'Cash', customer: '', chequeNumber: '', chequeDate: '', description: '' });
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message;
            if (errorMessage) {
                setError(errorMessage);
            } else if (err.response?.data) {
                // Fallback: Show raw data if structure doesn't match
                setError(JSON.stringify(err.response.data));
            } else {
                setError(err.message || 'Failed to save transaction');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction? If it is a credit transaction, the customer balance will be automatically adjusted.')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete transaction: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleEdit = (t) => {
        setEditingId(t._id);
        setFormData({
            amount: t.amount,
            type: t.type,
            customer: t.customer?._id || t.customer || '',
            chequeNumber: t.chequeNumber || '',
            chequeDate: t.chequeDate ? new Date(t.chequeDate).toISOString().split('T')[0] : '',
            description: t.description || ''
        });
        setIsModalOpen(true);
    };

    const handleConfirm = async (id) => {
        if (!window.confirm('Confirm this transaction? This will update the customer balance and move it to the Financial Overview.')) return;
        try {
            await api.patch(`/transactions/${id}/confirm`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to confirm transaction: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('CRITICAL: Are you sure you want to delete ALL transactions? This will reset all customer balances. This action CANNOT be undone.')) return;
        const password = prompt('Please type "DELETE" to confirm:');
        if (password !== 'DELETE') return;

        try {
            await api.delete('/transactions/delete-all');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete all transactions: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="space-y-10 animate-fade-in font-['Inter']">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Transactions</h1>
                    <p className="text-slate-500 font-medium">Financial record management system</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleDeleteAll}
                        className="btn bg-white text-rose-600 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all"
                    >
                        <Trash2 size={18} />
                        Clear All Records
                    </button>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ amount: '', type: 'Cash', customer: '', chequeNumber: '', chequeDate: '', description: '' });
                            setIsModalOpen(true);
                        }}
                        className="btn premium-gradient text-white px-8 py-3 rounded-2xl text-sm font-black shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        New Transaction
                    </button>
                </div>
            </header>

            {/* Transaction Totals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Volume', value: transactions.reduce((sum, t) => sum + t.amount, 0), color: 'indigo', icon: <ReceiptText /> },
                    { title: 'Cash Payments', value: transactions.filter(t => t.type === 'Cash').reduce((sum, t) => sum + t.amount, 0), color: 'emerald', icon: <Plus /> },
                    { title: 'Credit Sales', value: transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0), color: 'blue', icon: <ArrowUpRight /> },
                    { title: 'Cheques', value: transactions.filter(t => t.type === 'Cheque').reduce((sum, t) => sum + t.amount, 0), color: 'amber', icon: <Clock /> },
                ].map((card, i) => (
                    <div key={i} className="premium-card p-6 bg-white group hover:border-indigo-100">
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>
                                {React.cloneElement(card.icon, { size: 18, strokeWidth: 3 })}
                            </div>
                            <div className={`h-1 w-12 rounded-full bg-slate-100 group-hover:bg-${card.color}-200 transition-colors`} />
                        </div>
                        <p className="stat-label mb-1">{card.title}</p>
                        <h3 className="stat-value text-xl">LKR {card.value.toLocaleString()}</h3>
                    </div>
                ))}
            </div>

            <div className="premium-card overflow-hidden border-none shadow-xl bg-white">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Universal search..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-[1.25rem] transition-all font-bold placeholder:text-slate-400 outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 rounded-2xl bg-white border border-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                            <Filter size={16} />
                            Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Narration</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Value</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {transactions.map((t) => (
                                <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-10 py-7">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800">{new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(t.date).getFullYear()}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <span className="text-sm font-bold text-slate-600 tracking-tight">{t.description || 'General Transaction'}</span>
                                    </td>
                                    <td className="px-10 py-7">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${t.type === 'Cash' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            t.type === 'Credit' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'Cash' ? 'bg-emerald-500' :
                                                t.type === 'Credit' ? 'bg-indigo-500' :
                                                    'bg-amber-500'
                                                }`} />
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-10 py-7">
                                        {t.customer ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                    {t.customer.name[0]}
                                                </div>
                                                <span className="text-sm font-black text-slate-700">{t.customer.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Walk-in</span>
                                        )}
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-base font-black text-slate-900">+ {(t.amount || 0).toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LKR</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${t.status === 'Confirmed' ? 'text-emerald-500 bg-emerald-50/50' : 'text-amber-500 bg-amber-50/50 animate-pulse'
                                            }`}>
                                            {t.status === 'Confirmed' ? 'Live' : 'Auth Req'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {t.status === 'Pending' && (
                                                <button onClick={() => handleConfirm(t._id)} className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Confirm">
                                                    <CheckCircle size={18} strokeWidth={2.5} />
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(t)} className="p-2.5 text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all" title="Edit">
                                                <Pencil size={18} strokeWidth={2.5} />
                                            </button>
                                            <button onClick={() => handleDelete(t._id)} className="p-2.5 text-rose-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all" title="Delete">
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] max-w-xl w-full p-12 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 premium-gradient" />

                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingId ? 'Edit Record' : 'New Entry'}
                                </h2>
                                <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-1">Transaction Terminal</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all font-black">×</button>
                        </div>

                        {error && (
                            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (LKR)</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 px-6 transition-all outline-none font-black text-xl text-slate-900 placeholder:text-slate-200"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">LKR</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 px-6 transition-all outline-none font-black text-sm text-slate-700 appearance-none cursor-pointer"
                                    >
                                        <option value="Cash">Cash / Payment</option>
                                        <option value="Credit">Credit Sale</option>
                                        <option value="Cheque">Cheque Pay</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Customer Account {formData.type === 'Credit' ? '(Required)' : '(Optional)'}
                                </label>
                                <select
                                    required={formData.type === 'Credit'}
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 px-6 transition-all outline-none font-black text-sm text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Select Ledger Account</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            {formData.type === 'Cheque' && (
                                <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-top-4">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cheque Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.chequeNumber}
                                            onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                                            placeholder="CX-880099"
                                            className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 px-6 transition-all outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.chequeDate}
                                            onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                                            className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 px-6 transition-all outline-none font-bold"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Remarks</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter transaction details..."
                                    className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] py-4 px-6 transition-all outline-none font-bold placeholder:text-slate-300 resize-none"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-5 rounded-2xl premium-gradient text-white font-black text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all">
                                {editingId ? 'Confirm Update' : 'Auth Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
