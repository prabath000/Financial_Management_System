import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { TrendingUp, CreditCard, Wallet, Landmark, ArrowUpRight, Download, Calendar, Plus, UserPlus, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';
import api from '../api/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Gradient Helper for Chart.js
const createGradient = (ctx, area, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
};

const Dashboard = () => {


    const [stats, setStats] = useState({
        total: 0,
        cash: 0,
        credit: 0,
        cheque: 0
    });
    const [chartData, setChartData] = useState(null);
    const [inventoryChartData, setInventoryChartData] = useState(null);
    const [dailySheetChartData, setDailySheetChartData] = useState(null);
    const [creditChartData, setCreditChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('year'); // 'year' or 'month'

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Always fetch summary for cards
                const summaryRes = await api.get('/analytics/summary');
                const summary = summaryRes.data;

                setStats({
                    total: summary.total,
                    cash: summary.cash,
                    credit: summary.credit,
                    cheque: summary.cheque,
                    outstanding: summary.outstandingCredit
                });

                // Fetch chart data based on view mode
                let chartRes;
                if (viewMode === 'month') {
                    const now = new Date();
                    chartRes = await api.get(`/analytics/daily?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
                } else {
                    chartRes = await api.get('/analytics/monthly');
                }

                const data = chartRes.data;

                // Fetch new analysis data
                const [invRes, dsRes, creditRes] = await Promise.all([
                    api.get('/analytics/inventory'),
                    api.get('/analytics/daily-sheet'),
                    api.get('/analytics/credit')
                ]);

                // 1. Main Income Chart
                if (data.length > 0) {
                    let labels, cashData, creditData, chequeData;

                    if (viewMode === 'month') {
                        labels = data.map(d => d.day);
                        cashData = data.map(d => d.cash);
                        creditData = data.map(d => d.credit);
                        chequeData = data.map(d => d.cheque);
                    } else {
                        labels = data.map(d => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return months[d.month - 1];
                        });
                        cashData = data.map(d => d.cash);
                        creditData = data.map(d => d.credit);
                        chequeData = data.map(d => d.cheque);
                    }

                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: 'Cash',
                                data: cashData,
                                borderColor: '#10b981',
                                backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return null;
                                    return createGradient(ctx, chartArea, 'rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.1)');
                                },
                                fill: true,
                                tension: 0.4,
                                borderWidth: 3
                            },
                            {
                                label: 'Credit',
                                data: creditData,
                                borderColor: '#6366f1',
                                backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return null;
                                    return createGradient(ctx, chartArea, 'rgba(99, 102, 241, 0)', 'rgba(99, 102, 241, 0.2)');
                                },
                                fill: true,
                                tension: 0.4,
                                borderWidth: 3
                            },
                            {
                                label: 'Cheque',
                                data: chequeData,
                                borderColor: '#f59e0b',
                                backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return null;
                                    return createGradient(ctx, chartArea, 'rgba(245, 158, 11, 0)', 'rgba(245, 158, 11, 0.1)');
                                },
                                fill: true,
                                tension: 0.4,
                                borderWidth: 3
                            }
                        ]
                    });
                }

                // 2. Inventory Chart
                if (invRes.data && invRes.data.length > 0) {
                    setInventoryChartData({
                        labels: invRes.data.map(p => p.name),
                        datasets: [
                            {
                                label: 'Current Quantity',
                                data: invRes.data.map(p => p.quantity),
                                backgroundColor: '#8b5cf6',
                            },
                            {
                                label: 'Alert Level',
                                data: invRes.data.map(p => p.alertLevel),
                                backgroundColor: '#f87171',
                            }
                        ]
                    });
                }

                // 3. Daily Business Sheet
                if (dsRes.data && dsRes.data.length > 0) {
                    setDailySheetChartData({
                        labels: dsRes.data.map(r => new Date(r.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })),
                        datasets: [
                            {
                                label: 'Total Income',
                                data: dsRes.data.map(r => r.income),
                                borderColor: '#6366f1',
                                backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return null;
                                    return createGradient(ctx, chartArea, 'rgba(99, 102, 241, 0)', 'rgba(99, 102, 241, 0.2)');
                                },
                                fill: true,
                                tension: 0.4
                            },
                            {
                                label: 'Expenses',
                                data: dsRes.data.map(r => r.expenses),
                                borderColor: '#f43f5e',
                                backgroundColor: (context) => {
                                    const chart = context.chart;
                                    const { ctx, chartArea } = chart;
                                    if (!chartArea) return null;
                                    return createGradient(ctx, chartArea, 'rgba(244, 63, 94, 0)', 'rgba(244, 63, 94, 0.1)');
                                },
                                fill: true,
                                tension: 0.4
                            }
                        ]
                    });
                }

                // 4. Credit Management Chart
                if (creditRes.data && creditRes.data.length > 0) {
                    setCreditChartData({
                        labels: creditRes.data.map(c => c.name),
                        datasets: [{
                            data: creditRes.data.map(c => c.creditBalance),
                            backgroundColor: [
                                '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff',
                                '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'
                            ],
                            borderWidth: 0
                        }]
                    });
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
                setStats({ ...stats, error: err.message || 'Unknown Error' });
            }
        };
        fetchAnalytics();
    }, [viewMode]);

    const handleDownloadReport = async () => {
        try {
            const now = new Date();
            const monthName = now.toLocaleString('default', { month: 'long' });
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            // Fetch all required data in parallel
            const [dailyTransactions, dailyRecords, customers, inventory] = await Promise.all([
                api.get(`/analytics/daily?month=${month}&year=${year}`),
                api.get('/daily-records'),
                api.get('/customers'),
                api.get('/products')
            ]);

            const transactionData = dailyTransactions.data;
            const dailyRecordsData = dailyRecords.data.filter(r => {
                const recordDate = new Date(r.date);
                return recordDate.getMonth() + 1 === month && recordDate.getFullYear() === year;
            });
            const customersData = customers.data;
            const inventoryData = inventory.data;

            const doc = new jsPDF();
            let yPosition = 22;

            // ===== BACKGROUND & PAGE STYLING =====
            // Add subtle background color
            doc.setFillColor(250, 251, 255); // Very light blue-gray
            doc.rect(0, 0, 210, 297, 'F');

            // ===== HEADER WITH GRADIENT EFFECT =====
            // Create header background with gradient simulation
            doc.setFillColor(79, 70, 229); // Indigo
            doc.rect(0, 0, 210, 50, 'F');

            // Add decorative elements
            doc.setFillColor(124, 58, 237); // Purple accent
            doc.circle(190, 15, 8, 'F');
            doc.circle(185, 35, 5, 'F');
            doc.setFillColor(99, 102, 241); // Lighter indigo
            doc.circle(15, 40, 6, 'F');

            // Header text
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255); // White
            doc.setFont(undefined, 'bold');
            doc.text("JANKA AGENCY", 14, yPosition);

            yPosition += 8;
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text("Comprehensive Monthly Business Report", 14, yPosition);

            yPosition += 6;
            doc.setFontSize(9);
            doc.setTextColor(200, 200, 255); // Light purple-white
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition);

            // Reset position after header
            yPosition = 60;
            doc.setFontSize(18);
            doc.setTextColor(79, 70, 229); // Indigo
            doc.setFont(undefined, 'bold');
            doc.text(`${monthName} ${year} - Full Business Report`, 14, yPosition);

            // ===== SECTION 1: TRANSACTION SUMMARY =====
            yPosition += 10;
            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text("1. Transaction Summary", 14, yPosition);

            yPosition += 5;
            doc.setDrawColor(200);
            doc.setFillColor(248, 250, 252);
            doc.rect(14, yPosition, 180, 20, 'F');

            yPosition += 7;
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("Total Revenue", 20, yPosition);
            doc.text("Cash", 70, yPosition);
            doc.text("Credit", 110, yPosition);
            doc.text("Cheque", 150, yPosition);

            yPosition += 6;
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');

            const total = transactionData.reduce((sum, d) => sum + (d.cash || 0) + (d.credit || 0) + (d.cheque || 0), 0);
            const totalCash = transactionData.reduce((sum, d) => sum + (d.cash || 0), 0);
            const totalCredit = transactionData.reduce((sum, d) => sum + (d.credit || 0), 0);
            const totalCheque = transactionData.reduce((sum, d) => sum + (d.cheque || 0), 0);

            doc.text(`${total.toLocaleString()}`, 20, yPosition);
            doc.text(`${totalCash.toLocaleString()}`, 70, yPosition);
            doc.text(`${totalCredit.toLocaleString()}`, 110, yPosition);
            doc.text(`${totalCheque.toLocaleString()}`, 150, yPosition);

            doc.setFont(undefined, 'normal');

            // Daily Transactions Table
            yPosition += 10;
            const transTableRows = [];
            transactionData.forEach(record => {
                if ((record.cash + record.credit + record.cheque) > 0) {
                    const dailyTotal = record.cash + record.credit + record.cheque;
                    transTableRows.push([
                        record.day,
                        record.cash.toLocaleString(),
                        record.credit.toLocaleString(),
                        record.cheque.toLocaleString(),
                        dailyTotal.toLocaleString()
                    ]);
                }
            });

            autoTable(doc, {
                head: [["Day", "Cash", "Credit", "Cheque", "Total"]],
                body: transTableRows,
                startY: yPosition,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
                alternateRowStyles: { fillColor: [245, 247, 255] }
            });

            // ===== SECTION 2: DAILY SHEET RECORDS =====
            yPosition = doc.lastAutoTable.finalY + 15;

            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text("2. Daily Business Sheet", 14, yPosition);

            yPosition += 5;
            const dailySheetRows = [];
            let totalIncome = 0;
            let totalExpenses = 0;

            dailyRecordsData.forEach(record => {
                const income = (record.cashSales || 0) + (record.creditSales || 0) + (record.chequeSales || 0);
                const expenses = record.expenses || 0;
                totalIncome += income;
                totalExpenses += expenses;

                dailySheetRows.push([
                    new Date(record.date).toLocaleDateString(),
                    income.toLocaleString(),
                    expenses.toLocaleString(),
                    (income - expenses).toLocaleString(),
                    record.notes || '-'
                ]);
            });

            // Add totals row
            dailySheetRows.push([
                'TOTAL',
                totalIncome.toLocaleString(),
                totalExpenses.toLocaleString(),
                (totalIncome - totalExpenses).toLocaleString(),
                ''
            ]);

            autoTable(doc, {
                head: [["Date", "Income", "Expenses", "Net Profit", "Notes"]],
                body: dailySheetRows,
                startY: yPosition,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
                alternateRowStyles: { fillColor: [245, 247, 255] },
                columnStyles: {
                    4: { cellWidth: 50 }
                },
                didParseCell: function (data) {
                    if (data.row.index === dailySheetRows.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [230, 230, 250];
                    }
                }
            });

            // ===== SECTION 3: CUSTOMER BALANCES =====
            yPosition = doc.lastAutoTable.finalY + 15;

            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text("3. Customer Credit Balances", 14, yPosition);

            yPosition += 5;
            const customerRows = [];
            let totalPending = 0;
            let totalConfirmed = 0;

            customersData.forEach(customer => {
                const pending = customer.pendingBalance || 0;
                const confirmed = customer.creditBalance || 0;
                totalPending += pending;
                totalConfirmed += confirmed;

                if (pending > 0 || confirmed > 0) {
                    customerRows.push([
                        customer.name,
                        customer.phone || '-',
                        confirmed.toLocaleString(),
                        pending.toLocaleString(),
                        (confirmed + pending).toLocaleString()
                    ]);
                }
            });

            // Add totals row
            customerRows.push([
                'TOTAL OUTSTANDING',
                '',
                totalConfirmed.toLocaleString(),
                totalPending.toLocaleString(),
                (totalConfirmed + totalPending).toLocaleString()
            ]);

            autoTable(doc, {
                head: [["Customer", "Phone", "Confirmed", "Pending", "Total"]],
                body: customerRows,
                startY: yPosition,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2, font: 'Inter' },
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 247, 255] },
                didParseCell: function (data) {
                    if (data.row.index === customerRows.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [230, 230, 250];
                    }
                }
            });

            // ===== SECTION 4: INVENTORY STATUS =====
            yPosition = doc.lastAutoTable.finalY + 15;

            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text("4. Inventory Status", 14, yPosition);

            yPosition += 5;
            const inventoryRows = [];
            let totalInventoryValue = 0;
            let lowStockCount = 0;

            inventoryData.forEach(item => {
                const value = (item.quantity || 0) * (item.price || 0);
                totalInventoryValue += value;
                const isLowStock = item.quantity <= (item.alertLevel || 10);
                if (isLowStock) lowStockCount++;

                inventoryRows.push([
                    item.name,
                    item.category || '-',
                    item.quantity.toString(),
                    item.price.toLocaleString(),
                    value.toLocaleString(),
                    isLowStock ? '⚠ LOW' : 'OK'
                ]);
            });

            autoTable(doc, {
                head: [["Product", "Category", "Qty", "Price", "Value", "Status"]],
                body: inventoryRows,
                startY: yPosition,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
                alternateRowStyles: { fillColor: [245, 247, 255] },
                didParseCell: function (data) {
                    if (data.column.index === 5 && data.cell.raw === '⚠ LOW') {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            // ===== FOOTER SUMMARY =====
            yPosition = doc.lastAutoTable.finalY + 10;

            if (yPosition > 260) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setDrawColor(79, 70, 229);
            doc.setLineWidth(0.5);
            doc.line(14, yPosition, 196, yPosition);

            yPosition += 8;
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.text("Report Summary:", 14, yPosition);

            yPosition += 6;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.text(`• Total Revenue: LKR ${total.toLocaleString()}`, 14, yPosition);
            yPosition += 5;
            doc.text(`• Net Profit (Daily Sheet): LKR ${(totalIncome - totalExpenses).toLocaleString()}`, 14, yPosition);
            yPosition += 5;
            doc.text(`• Outstanding Credit: LKR ${(totalConfirmed + totalPending).toLocaleString()}`, 14, yPosition);
            yPosition += 5;
            doc.text(`• Inventory Value: LKR ${totalInventoryValue.toLocaleString()}`, 14, yPosition);
            yPosition += 5;
            doc.text(`• Low Stock Items: ${lowStockCount}`, 14, yPosition);

            doc.save(`Janka_Agency_Full_Report_${monthName}_${year}.pdf`);
        } catch (err) {
            console.error("Report generation failed:", err);
            alert(`Failed to generate report: ${err.message || err}`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (stats.error) {
        const isUnauthorized = stats.error.includes('401') || stats.error.toLowerCase().includes('unauthorized');
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl m-8 border border-red-200">
                <h3 className="font-bold text-lg">{isUnauthorized ? 'Session Expired' : 'Connection Error'}</h3>
                <p>{stats.error}</p>
                <p className="text-sm mt-2 text-slate-600">
                    {isUnauthorized
                        ? 'Your session has expired. Please log in again.'
                        : 'Please check if the backend server is running.'}
                </p>
                {isUnauthorized && (
                    <button
                        onClick={() => window.location.href = '#/login'}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go to Login
                    </button>
                )}
            </div>
        );
    }

    const cards = [
        { title: 'Total Revenue', value: stats.total, icon: <TrendingUp size={20} />, trend: '+2.45%', color: 'from-indigo-600 to-violet-600', isMain: true },
        { title: 'Liquid Assets', value: (stats.cash || 0) + (stats.cheque || 0), icon: <ArrowUpRight size={20} />, trend: 'Healthy', color: 'emerald' },
        { title: 'Cash Income', value: stats.cash, icon: <Wallet size={20} />, trend: 'Daily', color: 'blue' },
        { title: 'Credit Sales', value: stats.credit, icon: <CreditCard size={20} />, trend: 'Active', color: 'rose' },
        { title: 'System Risk', value: stats.outstanding || 0, icon: <Landmark size={20} />, trend: 'Review', color: 'amber' },
    ];

    return (
        <div className="space-y-10 animate-fade-in p-4 lg:p-6 bg-[#f8f9fc]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Financial Overview</h1>
                    <p className="text-slate-500 font-medium">Real-time business intelligence for Janka Agency</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleDownloadReport}
                        className="btn bg-white text-indigo-600 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-sm flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all"
                    >
                        <Download size={18} />
                        Monthly Report
                    </button>
                    <div className="text-sm text-slate-500 font-bold bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <Calendar size={16} className="text-indigo-500" />
                        {new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={`premium-card p-6 flex flex-col justify-between group h-full ${card.isMain ? `bg-gradient-to-br ${card.color} text-white border-none shadow-indigo-200` : 'bg-white'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${card.isMain ? 'bg-white/20 backdrop-blur-md' : `bg-${card.color}-50 text-${card.color}-600`}`}>
                                {card.icon}
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${card.isMain ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <div>
                            <p className={`stat-label mb-1 ${card.isMain ? 'text-indigo-100' : ''}`}>{card.title}</p>
                            <h3 className={`text-2xl font-black ${card.isMain ? 'text-white' : 'text-slate-900'}`}>
                                LKR {(card.value || 0).toLocaleString()}
                            </h3>
                        </div>
                        {/* Subtle sparkline-like background element */}
                        <div className={`absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform ${card.isMain ? 'text-white' : `text-${card.color}-600`}`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Income Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 premium-card p-8 bg-white">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Income Analytics</h3>
                            <p className="text-sm text-slate-400 font-medium">Monthly revenue distribution</p>
                        </div>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="bg-slate-50 border-slate-200 text-sm font-bold text-slate-600 px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors focus:ring-4 focus:ring-indigo-500/10 outline-none"
                        >
                            <option value="year">Yearly Overview</option>
                            <option value="month">Monthly Detail</option>
                        </select>
                    </div>
                    <div className="h-[380px]">
                        {chartData ? (
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: { mode: 'index', intersect: false },
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            align: 'end',
                                            labels: {
                                                usePointStyle: true,
                                                pointStyle: 'circle',
                                                padding: 20,
                                                font: { family: 'Outfit', size: 12, weight: 'bold' },
                                                boxWidth: 6,
                                                boxHeight: 6
                                            }
                                        },
                                        tooltip: {
                                            backgroundColor: '#1e293b',
                                            padding: 16,
                                            titleFont: { family: 'Inter', size: 14, weight: 'bold' },
                                            bodyFont: { family: 'Inter', size: 13 },
                                            cornerRadius: 12,
                                            displayColors: true,
                                            boxPadding: 6
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: '#f1f5f9', drawBorder: false },
                                            ticks: {
                                                font: { family: 'Inter', size: 11, weight: '600' },
                                                color: '#94a3b8',
                                                padding: 12,
                                                callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value
                                            }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#94a3b8', padding: 10 }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                                <div className="p-6 bg-slate-50 rounded-full">
                                    <TrendingUp size={40} className="text-slate-200" />
                                </div>
                                <p className="font-bold">No transaction data available yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="premium-card p-10 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="mb-10">
                            <h3 className="text-3xl font-black mb-2 tracking-tight">Management</h3>
                            <p className="text-indigo-300 font-medium">Core system actions</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'New Transaction', icon: <Plus size={18} />, path: '/transactions' },
                                { label: 'Register Client', icon: <UserPlus size={18} />, path: '/customers' },
                                { label: 'Daily Ledger', icon: <FileText size={18} />, path: '/daily-sheet' }
                            ].map((action, idx) => (
                                <Link
                                    to={action.path}
                                    key={idx}
                                    className="w-full py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 transition-all flex items-center justify-between group active:scale-[0.98]"
                                >
                                    <span className="font-black tracking-tight text-xs uppercase text-indigo-100">{action.label}</span>
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg shadow-indigo-500/10">
                                        {action.icon}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-white/10">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400 relative"></div>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-0.5">Database Status</h4>
                                <p className="text-sm font-bold text-white">Live Connection: data.db</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                {/* Inventory Management */}
                <div className="premium-card p-8 bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Inventory Management</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Stock vs Alerts</p>
                        </div>
                    </div>
                    <div className="h-[320px]">
                        {inventoryChartData ? (
                            <Bar
                                data={inventoryChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            align: 'end',
                                            labels: {
                                                usePointStyle: true,
                                                font: { family: 'Outfit', weight: 'bold', size: 10 }
                                            }
                                        }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
                                        x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#64748b' } }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 font-bold">Loading inventory data...</div>
                        )}
                    </div>
                </div>

                {/* Daily Business Sheet */}
                <div className="premium-card p-8 bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Financial Performance</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Daily Sales vs Expenses</p>
                        </div>
                    </div>
                    <div className="h-[320px]">
                        {dailySheetChartData ? (
                            <Line
                                data={dailySheetChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    elements: {
                                        point: { radius: 0, hoverRadius: 6, hitRadius: 20 },
                                        line: { tension: 0.4, borderWidth: 3 }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            align: 'end',
                                            labels: { usePointStyle: true, font: { family: 'Outfit', weight: 'bold', size: 10 } }
                                        }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
                                        x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#64748b' } }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 font-bold">Loading performance data...</div>
                        )}
                    </div>
                </div>

                {/* Customer Credit Management */}
                <div className="premium-card p-10 lg:col-span-2 bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Credit Exposure Analysis</h3>
                            <p className="text-indigo-500 font-bold text-sm tracking-wide">Top Debtors Breakdown</p>
                        </div>
                        <div className="px-5 py-2.5 bg-rose-50 rounded-2xl border border-rose-100">
                            <span className="text-rose-600 font-black text-xs tracking-widest uppercase">System Risk: High</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="h-[340px] md:col-span-4 relative flex items-center justify-center">
                            {creditChartData ? (
                                <>
                                    <Pie
                                        data={creditChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            cutout: '75%',
                                            plugins: {
                                                legend: { display: false }
                                            }
                                        }}
                                    />
                                    <div className="absolute flex flex-col items-center">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Credit</p>
                                        <p className="text-xl font-black text-slate-800">
                                            {creditChartData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 font-bold">Loading credit data...</div>
                            )}
                        </div>
                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {creditChartData?.labels.map((label, i) => (
                                <div key={i} className="flex flex-col p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">{label}</span>
                                    <span className="text-lg font-black text-slate-800 shrink-0">LKR {creditChartData.datasets[0].data[i].toLocaleString()}</span>
                                    <div className="w-full h-1 bg-slate-200 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(creditChartData.datasets[0].data[i] / creditChartData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
