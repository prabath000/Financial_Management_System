import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Trash2, Pencil, AlertTriangle, ArrowUpDown, Filter } from 'lucide-react';
import api from '../api/api';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: 'Tip Tip',
        quantity: 0,
        price: 0,
        alertLevel: 10
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(`/products/${editingId}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            fetchProducts();
            resetForm();
        } catch (err) {
            console.error(err);
            alert('Failed to save product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Tip Tip',
            quantity: 0,
            price: 0,
            alertLevel: 10
        });
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            category: product.category,
            quantity: product.quantity,
            price: product.price,
            alertLevel: product.alertLevel
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['Tip Tip', 'Massmelos', 'Other'];

    return (
        <div className="space-y-12 animate-fade-in font-['Inter']">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Digital Vault</h1>
                    <p className="text-slate-500 font-medium italic">High-precision inventory control and asset tracking</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="btn premium-gradient text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} />
                    Secure Entry
                </button>
            </header>

            {/* Inventory Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Stock', value: products.reduce((sum, p) => sum + p.quantity, 0), sub: 'Global Units', color: 'indigo', icon: Package },
                    { label: 'Asset Value', value: `LKR ${products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}`, sub: 'Estimated Capital', color: 'emerald', icon: ArrowUpDown },
                    { label: 'Low Reserves', value: products.filter(p => p.quantity <= p.alertLevel).length, sub: 'Critical Alerts', color: 'rose', icon: AlertTriangle },
                    { label: 'Unique SKUs', value: products.length, sub: 'Active Catalog', color: 'slate', icon: Search },
                ].map((stat, i) => (
                    <div key={i} className="premium-card p-8 bg-white border-slate-50 group hover:border-indigo-100 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color}-400 shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 relative w-full group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Query vault database..."
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-sm font-bold placeholder:font-medium placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['All', ...categories].map(c => (
                        <button
                            key={c}
                            onClick={() => setFilterCategory(c)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterCategory === c
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Table */}
            <div className="premium-card bg-white border-slate-50 shadow-2xl shadow-slate-100/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Catalog</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">In-Stock</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all duration-500 shadow-inner">
                                                <Package size={22} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-900 transition-colors">{p.name}</h3>
                                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${p.category === 'Tip Tip' ? 'text-orange-500' :
                                                        p.category === 'Massmelos' ? 'text-pink-500' :
                                                            'text-slate-400'
                                                    }`}>
                                                    {p.category}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900">LKR {p.price.toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`text-sm font-black tabular-nums ${p.quantity <= p.alertLevel ? 'text-rose-500' : 'text-slate-700'}`}>
                                            {p.quantity}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {p.quantity <= p.alertLevel ? (
                                            <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                                                <AlertTriangle size={12} strokeWidth={3} />
                                                Critical
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                Optimized
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-all"
                                            >
                                                <Pencil size={16} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm border border-slate-100 hover:border-rose-100 transition-all"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>

                        <h2 className="text-2xl font-bold mb-6 text-slate-800">
                            {editingId ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Price (LKR)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Low Stock Alert Level</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    value={formData.alertLevel}
                                    onChange={(e) => setFormData({ ...formData, alertLevel: parseInt(e.target.value) })}
                                />
                                <p className="text-xs text-slate-400 mt-1">Alert when quantity falls below this number</p>
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
                                    {editingId ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
