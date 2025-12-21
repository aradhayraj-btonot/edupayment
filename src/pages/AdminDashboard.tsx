import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Home,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: "Total Collections",
      value: "₹24,56,890",
      change: "+12.5%",
      trend: "up",
      icon: IndianRupee,
      color: "bg-success/10 text-success",
    },
    {
      title: "Pending Fees",
      value: "₹8,45,000",
      change: "-5.2%",
      trend: "down",
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Total Students",
      value: "1,248",
      change: "+48",
      trend: "up",
      icon: Users,
      color: "bg-info/10 text-info",
    },
    {
      title: "Payment Rate",
      value: "74.5%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
    },
  ];

  const recentPayments = [
    {
      id: 1,
      student: "Rahul Sharma",
      class: "10-A",
      amount: "₹15,000",
      status: "completed",
      date: "Today, 2:30 PM",
    },
    {
      id: 2,
      student: "Priya Patel",
      class: "8-B",
      amount: "₹12,500",
      status: "completed",
      date: "Today, 1:15 PM",
    },
    {
      id: 3,
      student: "Amit Kumar",
      class: "12-A",
      amount: "₹18,000",
      status: "pending",
      date: "Today, 11:00 AM",
    },
    {
      id: 4,
      student: "Sneha Reddy",
      class: "9-C",
      amount: "₹14,000",
      status: "completed",
      date: "Yesterday",
    },
    {
      id: 5,
      student: "Vikram Singh",
      class: "11-B",
      amount: "₹16,500",
      status: "failed",
      date: "Yesterday",
    },
  ];

  const feeCategories = [
    { name: "Tuition Fee", collected: 75, total: "₹18,00,000" },
    { name: "Transport Fee", collected: 68, total: "₹4,50,000" },
    { name: "Lab Fee", collected: 82, total: "₹1,20,000" },
    { name: "Activities", collected: 45, total: "₹85,000" },
  ];

  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Users, label: "Students" },
    { icon: CreditCard, label: "Payments" },
    { icon: BarChart3, label: "Reports" },
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
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">SA</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  School Admin
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  admin@school.edu
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
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back! Here's your school's financial overview.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral text-coral-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </Button>
              <Button variant="default" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
                      >
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        vs last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Payments */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">
                  Recent Payments
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {payment.student
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {payment.student}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Class {payment.class} • {payment.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {payment.amount}
                        </p>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className="mt-1"
                        >
                          {payment.status === "completed" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {payment.status === "pending" && (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {payment.status === "failed" && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Payments
                </Button>
              </CardContent>
            </Card>

            {/* Fee Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">
                  Fee Collection by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {feeCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">
                        {category.name}
                      </span>
                      <span className="text-muted-foreground">
                        {category.collected}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.collected}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total: {category.total}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
