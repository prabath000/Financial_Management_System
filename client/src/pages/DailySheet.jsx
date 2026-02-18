import React, { useState, useEffect } from 'react';
import { Plus, Calendar, FileSpreadsheet, Save, X, Trash2, Pencil } from 'lucide-react';
import api from '../api/api';

const DailySheet = () => {
    const [records, setRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormState());
    const [error, setError] = useState(null);

    function initialFormState() {
        return {
            date: new Date().toISOString().split('T')[0],
            grossSale: '',
            discount: '',
            netReturn: '',
            chequeSale: '',
            creditSale: '',
            cashSale: '',
            expenses: {
                delivery: '',
                fuel: '',
                other: ''
            },
            note: ''
        };
    }

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const { data } = await api.get('/daily-records');
            setRecords(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const payload = {
            ...formData,
            grossSale: Number(formData.grossSale) || 0,
            discount: Number(formData.discount) || 0,
            netReturn: Number(formData.netReturn) || 0,
            chequeSale: Number(formData.chequeSale) || 0,
            creditSale: Number(formData.creditSale) || 0,
            cashSale: Number(formData.cashSale) || 0,
            expenses: {
                delivery: Number(formData.expenses.delivery) || 0,
                fuel: Number(formData.expenses.fuel) || 0,
                other: Number(formData.expenses.other) || 0
            }
        };

        try {
            if (editingId) {
                await api.patch(`/daily-records/${editingId}`, payload);
            } else {
                await api.post('/daily-records', payload);
            }
            setIsModalOpen(false);
            setEditingId(null);
            fetchRecords();
            setFormData(initialFormState());
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message);
        }
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        setFormData({
            date: new Date(record.date).toISOString().split('T')[0],
            grossSale: record.grossSale || '',
            discount: record.discount || '',
            netReturn: record.netReturn || '',
            chequeSale: record.chequeSale || '',
            creditSale: record.creditSale || '',
            cashSale: record.cashSale || '',
            expenses: {
                delivery: record.expenses?.delivery || '',
                fuel: record.expenses?.fuel || '',
                other: record.expenses?.other || ''
            },
            note: record.note || ''
        });
        setIsModalOpen(true);
    };

    const handleExpenseChange = (field, value) => {
        setFormData({
            ...formData,
            expenses: { ...formData.expenses, [field]: value }
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this daily record?')) return;
        try {
            await api.delete(`/daily-records/${id}`);
            fetchRecords();
        } catch (err) {
            console.error(err);
            alert('Failed to delete record: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete ALL daily records? This action CANNOT be undone.')) return;
        const password = prompt('Please type "DELETE" to confirm:');
        if (password !== 'DELETE') return;

        try {
            await api.delete('/daily-records/delete-all');
            fetchRecords();
        } catch (err) {
            console.error(err);
            alert('Failed to delete all daily records: ' + (err.response?.data?.error || err.message));
        }
    };

    // Calculations
    const totalIncome = records.reduce((sum, r) => sum + (r.cashSale || 0) + (r.creditSale || 0) + (r.chequeSale || 0), 0);
    const totalExpenses = records.reduce((sum, r) => sum + (r.expenses?.delivery || 0) + (r.expenses?.fuel || 0) + (r.expenses?.other || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    return (
        <div className="space-y-12 animate-fade-in font-['Inter']">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <FileSpreadsheet className="text-emerald-600" size={32} />
                        </div>
                        Business Journal
                    </h1>
                    <p className="text-slate-500 font-medium italic">Chronological record of daily operations and cash flow</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleDeleteAll}
                        className="btn bg-white text-rose-600 border border-slate-100 hover:border-rose-200 hover:bg-rose-50 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all"
                    >
                        <Trash2 size={16} />
                        Clear Journal
                    </button>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData(initialFormState());
                            setIsModalOpen(true);
                        }}
                        className="btn bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-emerald-600 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        New Entry
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Cumulative Revenue', value: totalIncome, color: 'emerald', icon: Save },
                    { label: 'Operating Expenses', value: totalExpenses, color: 'rose', icon: Trash2 },
                    { label: 'Net Efficiency', value: netProfit, color: 'indigo', icon: FileSpreadsheet },
                ].map((card, i) => (
                    <div key={i} className={`premium-card p-10 bg-white border-${card.color}-50 group hover:border-${card.color}-100 transition-all duration-500`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${card.color}-600/50`}>Live Ledger</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <h3 className={`text-3xl font-black text-slate-900 tracking-tight`}>
                            LKR {card.value.toLocaleString()}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Data Table */}
            <div className="premium-card bg-white border-slate-50 shadow-2xl shadow-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-400">Return</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlements</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-400">Expense</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Daily</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Auth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {records.map((r) => {
                                const dailyTotal = (r.cashSale || 0) + (r.creditSale || 0) + (r.chequeSale || 0);
                                const dailyExpense = (r.expenses?.delivery || 0) + (r.expenses?.fuel || 0) + (r.expenses?.other || 0);
                                return (
                                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={14} className="text-indigo-400" />
                                                <span className="text-xs font-black text-slate-900 uppercase">
                                                    {new Date(r.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-xs font-bold text-slate-600">{r.grossSale?.toLocaleString()}</td>
                                        <td className="px-6 py-6 text-xs font-bold text-rose-400">{r.discount > 0 ? `(${r.discount?.toLocaleString()})` : '—'}</td>
                                        <td className="px-6 py-6 text-xs font-bold text-rose-500">{r.netReturn > 0 ? `(${r.netReturn?.toLocaleString()})` : '—'}</td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                                    <span className="text-[10px] font-black text-emerald-600">CASH: {r.cashSale?.toLocaleString()}</span>
                                                </div>
                                                {(r.creditSale > 0 || r.chequeSale > 0) && (
                                                    <span className="text-[9px] font-bold text-slate-400 pl-2.5">
                                                        OTHER: {((r.creditSale || 0) + (r.chequeSale || 0)).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-xs font-bold text-rose-600 italic">
                                            {dailyExpense > 0 ? `—${dailyExpense?.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="text-sm font-black text-slate-900 tabular-nums">
                                                {dailyTotal.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(r)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all"
                                                >
                                                    <Pencil size={16} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-50 hover:bg-rose-500 rounded-xl shadow-sm transition-all"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                                                <FileSpreadsheet size={32} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No journal entries found for this period.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-slate-800">
                            {editingId ? 'Edit Daily Entry' : 'New Daily Entry'}
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1: Date & Metadata */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 border-b pb-2">General</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Date</label>
                                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Note</label>
                                    <textarea rows="3" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Optional notes..."></textarea>
                                </div>
                            </div>

                            {/* Column 2: Sales Data */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 border-b pb-2">Sales Breakdown</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase">Gross Sale</label>
                                        <input type="number" value={formData.grossSale} onChange={e => setFormData({ ...formData, grossSale: e.target.value })} className="font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase">Discount</label>
                                        <input type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} className="font-mono text-red-600" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase">Net Return</label>
                                        <input type="number" value={formData.netReturn} onChange={e => setFormData({ ...formData, netReturn: e.target.value })} className="font-mono text-red-600" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-dashed">
                                    <div>
                                        <label className="block text-xs font-medium text-emerald-600 uppercase">Cash Sale</label>
                                        <input type="number" value={formData.cashSale} onChange={e => setFormData({ ...formData, cashSale: e.target.value })} className="font-bold font-mono" />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-xs font-medium text-blue-600 uppercase">Credit Sale</label>
                                        <input type="number" value={formData.creditSale} onChange={e => setFormData({ ...formData, creditSale: e.target.value })} className="font-mono" />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-xs font-medium text-blue-600 uppercase">Cheque Sale</label>
                                        <input type="number" value={formData.chequeSale} onChange={e => setFormData({ ...formData, chequeSale: e.target.value })} className="font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Expenses */}
                            <div className="space-y-4 bg-red-50/50 p-4 rounded-xl">
                                <h3 className="font-semibold text-red-900 border-b border-red-200 pb-2">Expenses</h3>
                                <div>
                                    <label className="block text-xs font-medium text-red-800 uppercase">Delivery / Fuel</label>
                                    <input type="number" value={formData.expenses.delivery} onChange={e => handleExpenseChange('delivery', e.target.value)} className="font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-red-800 uppercase">Ref. Fuel</label>
                                    <input type="number" value={formData.expenses.fuel} onChange={e => handleExpenseChange('fuel', e.target.value)} className="font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-red-800 uppercase">Other Expenses</label>
                                    <input type="number" value={formData.expenses.other} onChange={e => handleExpenseChange('other', e.target.value)} className="font-mono" />
                                </div>
                            </div>

                            <div className="md:col-span-3 flex justify-end gap-4 mt-6 pt-6 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                                    {editingId ? 'Update Record' : 'Save Daily Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySheet;
