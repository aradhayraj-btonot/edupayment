import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Home,
  CreditCard,
  History,
  Bell,
  Settings,
  LogOut,
  IndianRupee,
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Phone,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ParentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentInfo = {
    name: "Arjun Sharma",
    class: "10-A",
    rollNo: "2024-10A-042",
    admissionNo: "ADM-2024-1042",
  };

  const feesSummary = {
    total: "₹1,25,000",
    paid: "₹75,000",
    pending: "₹50,000",
    dueDate: "15 Jan 2025",
  };

  const pendingFees = [
    {
      id: 1,
      name: "Tuition Fee (Q3)",
      amount: "₹25,000",
      dueDate: "15 Jan 2025",
      status: "due",
    },
    {
      id: 2,
      name: "Transport Fee (Q3)",
      amount: "₹8,000",
      dueDate: "15 Jan 2025",
      status: "due",
    },
    {
      id: 3,
      name: "Lab Fee",
      amount: "₹5,000",
      dueDate: "20 Jan 2025",
      status: "upcoming",
    },
    {
      id: 4,
      name: "Annual Activity Fee",
      amount: "₹12,000",
      dueDate: "31 Jan 2025",
      status: "upcoming",
    },
  ];

  const paymentHistory = [
    {
      id: 1,
      description: "Tuition Fee (Q2)",
      amount: "₹25,000",
      date: "15 Oct 2024",
      method: "UPI",
      receiptNo: "RCP-2024-1542",
    },
    {
      id: 2,
      description: "Transport Fee (Q2)",
      amount: "₹8,000",
      date: "15 Oct 2024",
      method: "Card",
      receiptNo: "RCP-2024-1543",
    },
    {
      id: 3,
      description: "Tuition Fee (Q1)",
      amount: "₹25,000",
      date: "15 Jul 2024",
      method: "Net Banking",
      receiptNo: "RCP-2024-0892",
    },
    {
      id: 4,
      description: "Admission Fee",
      amount: "₹17,000",
      date: "01 Apr 2024",
      method: "UPI",
      receiptNo: "RCP-2024-0245",
    },
  ];

  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: CreditCard, label: "Pay Fees" },
    { icon: History, label: "Payment History" },
    { icon: Bell, label: "Notifications" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                EduPay
              </span>
            </Link>
          </div>

          {/* Student Info Card */}
          <div className="p-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {studentInfo.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Class {studentInfo.class}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Roll No: {studentInfo.rollNo}</p>
                <p>Adm No: {studentInfo.admissionNo}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-accent font-semibold">PS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Pradeep Sharma
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  parent@email.com
                </p>
              </div>
            </div>
            <Link to="/login">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-secondary"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Parent Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage fees and payments for {studentInfo.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral text-coral-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  2
                </span>
              </Button>
              <a href="tel:+911234567890">
                <Button variant="outline" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Support
                </Button>
              </a>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Fee Summary */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Annual Fee
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {feesSummary.total}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    Amount Paid
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {feesSummary.paid}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-l-4 border-l-coral">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    Pending Amount
                  </p>
                  <p className="text-2xl font-bold text-coral">
                    {feesSummary.pending}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    Next Due Date
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {feesSummary.dueDate}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending Fees */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">
                  Pending Fees
                </CardTitle>
                <Badge variant="secondary" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />4 items
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{fee.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Due: {fee.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {fee.amount}
                      </p>
                      <Badge
                        variant={
                          fee.status === "due" ? "destructive" : "secondary"
                        }
                        className="mt-1"
                      >
                        {fee.status === "due" ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" /> Due Now
                          </>
                        ) : (
                          "Upcoming"
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="success" className="w-full mt-4" size="lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay All Pending (₹50,000)
                </Button>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">
                  Payment History
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.date} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {payment.amount}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">
                Quick Pay - Multiple Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "UPI",
                    icon: "📱",
                    desc: "GPay, PhonePe, Paytm",
                  },
                  {
                    name: "Credit/Debit Card",
                    icon: "💳",
                    desc: "Visa, Mastercard, RuPay",
                  },
                  {
                    name: "Net Banking",
                    icon: "🏦",
                    desc: "All major banks",
                  },
                  {
                    name: "EMI Options",
                    icon: "📅",
                    desc: "3, 6, 12 month plans",
                  },
                ].map((method) => (
                  <button
                    key={method.name}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <span className="text-3xl mb-2 block">{method.icon}</span>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {method.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.desc}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
