import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCircle, MapPin, Phone, Trash2, Pencil, History, X, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, Download } from 'lucide-react';
import api from '../api/api';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerHistory, setCustomerHistory] = useState([]);
    const [historyMode, setHistoryMode] = useState('pending'); // 'pending' or 'all'
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get('/customers');
            setCustomers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(`/customers/${editingId}`, formData);
            } else {
                await api.post('/customers', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            fetchCustomers();
            setFormData({ name: '', phone: '', address: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (customer) => {
        setEditingId(customer._id);
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            address: customer.address || ''
        });
        setIsModalOpen(true);
    };

    const fetchHistory = async (customer, mode = 'pending') => {
        try {
            setHistoryMode(mode);
            // Fetch both updated customer data and history
            const [custRes, historyRes] = await Promise.all([
                api.get(`/customers/${customer._id}`),
                api.get(`/transactions?customer=${customer._id}`)
            ]);

            setSelectedCustomer(custRes.data);
            setCustomerHistory(historyRes.data);
            setHistoryModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    const totalOutstanding = customers.reduce((sum, c) => sum + (c.pendingBalance || 0), 0);

    const handleConfirm = async (id) => {
        if (!window.confirm('Confirm this transaction?')) return;
        try {
            await api.patch(`/transactions/${id}/confirm`);
            // Re-fetch history to update the modal view
            if (selectedCustomer) {
                fetchHistory(selectedCustomer, historyMode);
            }
            fetchCustomers(); // Update main cards too
        } catch (err) {
            console.error(err);
            alert('Failed to confirm transaction');
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer? This will NOT delete their transaction history.')) return;
        try {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete customer: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('CRITICAL: Are you sure you want to delete ALL customers? This will ALSO delete all their transaction history. This action CANNOT be undone.')) return;
        const password = prompt('Please type "DELETE ALL" to confirm:');
        if (password !== 'DELETE ALL') return;

        try {
            await api.delete('/customers/delete-all');
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete all customers: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDownload = () => {
        if (!selectedCustomer || !customerHistory.length) return;

        const headers = ['Date', 'Description', 'Type', 'Status', 'Amount (LKR)'];
        const rows = customerHistory.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description || (t.type === 'Credit' ? 'Credit Sale' : t.type === 'Cheque' ? 'Cheque Payment' : 'Cash Payment'),
            t.type,
            t.status,
            t.amount
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedCustomer.name}_Transactions_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-12 animate-fade-in font-['Inter']">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Customer Accounts</h1>
                    <p className="text-slate-500 font-medium italic">Credit management and history ledger</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleDeleteAll}
                        className="btn bg-white text-rose-600 border border-slate-100 hover:border-rose-200 hover:bg-rose-50 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm transition-all"
                    >
                        <Trash2 size={16} />
                        Wipe Records
                    </button>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', phone: '', address: '' });
                            setIsModalOpen(true);
                        }}
                        className="btn premium-gradient text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Register Client
                    </button>
                </div>
            </header>

            {/* Total System Credit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5 premium-card p-10 premium-gradient border-none text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <ArrowUpRight size={24} className="text-white" strokeWidth={3} />
                            </div>
                            <p className="font-black uppercase tracking-[0.2em] text-indigo-100 text-[10px]">Active Risk Exposure</p>
                        </div>
                        <h2 className="text-5xl font-black tracking-tight mb-2">
                            LKR {customers.reduce((sum, c) => sum + (c.creditBalance || 0) + (c.pendingBalance || 0), 0).toLocaleString()}
                        </h2>
                        <p className="text-indigo-100/70 font-bold text-xs">Aggregate customer debt spanning all registered ledger accounts.</p>
                    </div>
                </div>
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Clients', value: customers.length, sub: 'Registered Accounts', color: 'indigo' },
                        { label: 'Daily Average', value: `LKR ${(customers.length > 0 ? (customers.reduce((sum, c) => sum + (c.creditBalance || 0) + (c.pendingBalance || 0), 0) / customers.length) : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'Per Active Ledger', color: 'slate' },
                        { label: 'Risk Rating', value: 'HIGH', sub: 'Manual Review Required', color: 'rose' },
                    ].map((stat, i) => (
                        <div key={i} className="premium-card p-8 bg-white flex flex-col justify-center border-slate-50 group hover:border-indigo-100 hover:-translate-y-1 transition-all duration-500">
                            <p className="stat-label mb-1 text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors">{stat.label}</p>
                            <h3 className={`text-2xl font-black ${stat.color === 'rose' ? 'text-rose-500' : 'text-slate-800'} tracking-tight mb-1`}>{stat.value}</h3>
                            <p className="text-[10px] font-bold text-slate-400">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {customers.map((c) => (
                    <div key={c._id} className="premium-card bg-white p-8 group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-all duration-700 ${c.pendingBalance > 0 ? 'bg-rose-500' : 'bg-indigo-500'}`} />

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="w-16 h-16 bg-slate-50 group-hover:bg-indigo-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all duration-500 shadow-inner">
                                <UserCircle size={36} strokeWidth={1.5} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Balance Status</p>
                                <div className="flex flex-col items-end">
                                    <span className={`text-xl font-black ${c.pendingBalance > 0 ? 'text-rose-500' : 'text-slate-900 group-hover:text-indigo-600'} transition-colors`}>
                                        LKR {(c.pendingBalance || 0).toLocaleString()}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mb-8">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-900 transition-colors">{c.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                                    <CheckCircle size={10} strokeWidth={3} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Verified Account</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-10 relative z-10">
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                    <Phone size={14} className="text-slate-400" />
                                </div>
                                {c.phone || 'No direct dial'}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                    <MapPin size={14} className="text-slate-400" />
                                </div>
                                <span className="truncate">{c.address || 'Field not recorded'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10 pt-6 border-t border-slate-50">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => fetchHistory(c, 'pending')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                                >
                                    <Clock size={12} strokeWidth={3} />
                                    Awaiting
                                </button>
                                <button
                                    onClick={() => fetchHistory(c, 'all')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200"
                                >
                                    <History size={12} strokeWidth={3} />
                                    Ledger
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(c)}
                                    className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all flex-1 flex justify-center"
                                    title="Edit Profile"
                                >
                                    <Pencil size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCustomer(c._id)}
                                    className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all flex-1 flex justify-center"
                                    title="Revoke Account"
                                >
                                    <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {customers.length === 0 && (
                    <div className="col-span-full py-24 text-center group bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center transition-all hover:bg-slate-50">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500">
                            <UserCircle size={48} strokeWidth={1} />
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No customer accounts synchronized yet.</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:tracking-[0.2em] transition-all underline underline-offset-8">Register New Account</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>

                        <h2 className="text-2xl font-bold mb-6 text-slate-800">
                            {editingId ? 'Edit Customer' : 'Register Customer'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+94 ..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                                <textarea
                                    rows="2"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Street address..."
                                    className="resize-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-4 mt-8 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn bg-slate-50 text-slate-600 hover:bg-slate-100 flex-1 border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary flex-1 shadow-lg shadow-indigo-500/20">
                                    {editingId ? 'Update Customer' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 animate-slide-up relative overflow-hidden flex flex-col max-h-[90vh]">
                        <button onClick={() => setHistoryModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <UserCircle size={40} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedCustomer?.name}</h2>
                                    <p className="text-slate-500 font-medium">
                                        {historyMode === 'pending' ? 'Pending Transactions Ledger' : 'Full Transaction History'}
                                    </p>
                                </div>
                            </div>
                            {historyMode === 'all' && (
                                <button
                                    onClick={handleDownload}
                                    className="btn bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 px-4 py-2 text-sm font-bold flex items-center gap-2"
                                >
                                    <Download size={18} />
                                    Download CSV
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Auth</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {customerHistory.filter(t => historyMode === 'all' || t.status === 'Pending').map((t) => (
                                        <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-black text-slate-900">{new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-slate-600">{t.description || (t.type === 'Credit' ? 'Credit Purchase' : 'Payment Received')}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.type === 'Cash' ? 'bg-emerald-50 text-emerald-600' :
                                                        t.type === 'Credit' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${t.status === 'Confirmed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={`px-8 py-6 text-right font-black text-sm ${t.type === 'Credit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {t.type === 'Credit' ? '+' : '—'} {t.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center">
                                                    {t.status === 'Pending' ? (
                                                        <button
                                                            onClick={() => handleConfirm(t._id)}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all hover:scale-110"
                                                            title="Authorize"
                                                        >
                                                            <CheckCircle size={18} strokeWidth={2.5} />
                                                        </button>
                                                    ) : (
                                                        <CheckCircle size={18} className="text-slate-100" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 p-6 rounded-2xl gap-6">
                            <div className="flex flex-wrap gap-8 md:gap-12">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                                        Total Outstanding
                                    </p>
                                    <p className="text-xl font-black text-rose-600">
                                        LKR {((selectedCustomer?.creditBalance || 0) + (selectedCustomer?.pendingBalance || 0)).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex gap-8 border-l border-slate-200 pl-8">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Debt (+)</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            LKR {customerHistory.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Paid (—)</p>
                                        <p className="text-sm font-bold text-emerald-600">
                                            LKR {customerHistory.filter(t => t.type !== 'Credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-8 border-l border-slate-200 pl-8">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Confirmed</p>
                                        <p className="text-sm font-bold text-slate-600">LKR {(selectedCustomer?.creditBalance || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Pending</p>
                                        <p className="text-sm font-bold text-amber-600">LKR {(selectedCustomer?.pendingBalance || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setHistoryModalOpen(false)} className="btn btn-primary px-10 whitespace-nowrap">Close Record</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
