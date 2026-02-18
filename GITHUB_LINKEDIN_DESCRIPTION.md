# 🏢 Uswaththa TMS - Financial Management System

> A robust, offline-first Desktop ERP and Financial Management System designed for small to medium businesses.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

---

## 📋 Overview

**Uswaththa TMS** is a comprehensive Transaction Management System built to streamline financial operations, inventory tracking, and business analytics. Designed with offline reliability in mind, this desktop application empowers businesses to manage their daily operations without dependency on internet connectivity.

---

## ✨ Key Features

### 📊 Interactive Dashboard
- **Real-time Analytics**: Visual representation of sales data with yearly and monthly views
- **Dynamic Charts**: Bar charts, line graphs, and pie charts powered by Chart.js
- **Key Metrics at a Glance**: Total sales, cash, credit, and cheque summaries
- **Inventory Analysis**: Visual stock level monitoring with low-stock alerts

### 📦 Inventory Management
- Product catalog management with stock tracking
- Automated low-stock alerts and notifications
- Stock level visualization with intuitive charts
- Product-wise sales analytics

### 💰 Financial Ledger
- Daily income and expense recording
- Net profit tracking over time
- Transaction categorization (Cash, Credit, Cheque)
- Complete transaction history with search and filters

### 👥 Customer Credit Management
- Customer profile management
- Outstanding balance tracking
- Payment status monitoring
- Credit limit management

### 📄 PDF Report Generation
- Professional monthly business reports
- Detailed transaction summaries
- Inventory status reports
- One-click report generation with jsPDF

### 🔒 Secure Authentication
- User authentication with JWT tokens
- Password encryption with bcrypt
- Role-based access control

### 💻 Offline-First Architecture
- Full offline functionality using SQLite database
- No internet dependency for core operations
- Data integrity with local storage

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js, Tailwind CSS, Chart.js, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (better-sqlite3) |
| **Desktop** | Electron.js |
| **PDF Engine** | jsPDF, AutoTable |
| **Authentication** | JWT, bcryptjs |

---

## 📸 Screenshots

### Dashboard View
The main dashboard provides a comprehensive overview of business metrics with interactive charts and quick action buttons.

### Inventory Management
Manage products, track stock levels, and receive alerts when inventory runs low.

### Transaction Records
Record and track all financial transactions with detailed categorization and search functionality.

### Customer Management
Maintain customer profiles and track credit balances efficiently.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Windows OS (for desktop application)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/uswaththa-tms.git

# Navigate to project directory
cd uswaththa-tms

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Development

```bash
# Run both server and client in development mode
npm run dev

# Run server only
npm run server

# Run client only
npm run client
```

### Desktop Application

```bash
# Run in Electron development mode
npm run desktop:dev

# Build Windows installer
npm run electron:build
```

---

## 📁 Project Structure

```
uswaththa-tms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── api/            # API configuration
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   └── database.js         # SQLite configuration
├── electron/               # Electron desktop wrapper
│   ├── main.js             # Main process
│   └── preload.js          # Preload scripts
└── dist-electron/          # Built application
```

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | POST | Authentication endpoints |
| `/api/analytics/*` | GET | Business analytics data |
| `/api/customers/*` | CRUD | Customer management |
| `/api/transactions/*` | CRUD | Transaction records |
| `/api/products/*` | CRUD | Inventory management |
| `/api/daily-records/*` | CRUD | Daily sheet entries |

---

## 🎯 Use Cases

- **Retail Stores**: Track daily sales, manage inventory, and generate reports
- **Small Businesses**: Complete financial management solution
- **Agencies**: Client credit tracking and transaction management
- **Wholesale Operations**: Inventory and customer credit management

---

## 🤝 Contributing

This project was developed for specific business requirements. For suggestions or improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software developed for **Uswaththa - Tip Tip & Massmelos**. All rights reserved.

---

## 📧 Contact

**Developer**: Uswaththa  
**Project Link**: [https://github.com/yourusername/uswaththa-tms](https://github.com/yourusername/uswaththa-tms)

---

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/) - Frontend framework
- [Electron.js](https://www.electronjs.org/) - Desktop application framework
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

---

---

# 📱 LinkedIn Post Description

**🚀 Excited to share my latest project: Uswaththa TMS - A Complete Financial Management System!**

After months of development, I'm thrilled to present a comprehensive desktop ERP solution designed for small to medium businesses.

**🎯 What it does:**
✅ Real-time sales analytics with interactive dashboards  
✅ Complete inventory management with low-stock alerts  
✅ Customer credit tracking and payment management  
✅ PDF report generation for monthly business reviews  
✅ Offline-first architecture - works without internet!  

**💻 Tech Stack:**
• Frontend: React.js + Tailwind CSS + Chart.js  
• Backend: Node.js + Express.js  
• Database: SQLite (better-sqlite3)  
• Desktop: Electron.js  

**🌟 Key Highlights:**
- Built with offline reliability in mind using SQLite
- Professional UI with real-time data visualization
- Secure authentication with JWT
- Packaged as a Windows desktop application

This project taught me invaluable lessons about building desktop applications, managing local databases, and creating intuitive user interfaces for business users.

Check out the full project on GitHub: [Your GitHub Link]

#SoftwareDevelopment #ReactJS #ElectronJS #NodeJS #FullStackDeveloper #DesktopApplication #FinancialSoftware #ERP #OpenSource #JavaScript #WebDevelopment #ProjectLaunch

---

## 🐦 Twitter/X Thread

1/3 🚀 Just launched Uswaththa TMS - A complete financial management desktop app!

Built with React, Electron, and SQLite for offline-first reliability.

Features:
📊 Real-time analytics
📦 Inventory management
💰 Transaction tracking
📄 PDF reports

#BuildInPublic #ReactJS #Electron

2/3 The tech stack:
• React + Tailwind for UI
• Chart.js for visualizations
• Node.js + Express backend
• SQLite for offline data
• Electron for desktop packaging

All designed to work without internet connectivity!

3/3 Key learnings from this project:
✅ SQLite is powerful for desktop apps
✅ Electron makes cross-platform easy
✅ Offline-first design requires careful planning
✅ Business users need intuitive UI

Check it out: [GitHub Link]

#SoftwareEngineering #Learning

