import { useState, useRef } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CardListSkeleton, StatGridSkeleton } from "@/components/ui/dashboard-skeleton";
import { Link, useNavigate } from "react-router-dom";
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
  Upload,
  Image,
  Moon,
  Sun,
  Lock,
  MessageSquare,
  ChevronRight,
  Wallet,
  TrendingUp,
  BarChart3,
  Smartphone,
  Share,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useParentStudents } from "@/hooks/useStudents";
import { useParentPayments, useCreatePayment, useUploadScreenshot } from "@/hooks/usePayments";
import { useStudentFees, useFeeStructures } from "@/hooks/useFees";
import { useSchools } from "@/hooks/useSchools";
import { useParentNotifications, useNotificationReads, useMarkNotificationRead } from "@/hooks/useNotifications";
import { PushNotificationToggle } from "@/components/notifications/PushNotificationToggle";
import { useIsSubscriptionActive } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { QrCode, Copy, ExternalLink } from "lucide-react";
import { UPIPaymentDialog } from "@/components/payment/UPIPaymentDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { downloadReceipt, ReceiptData } from "@/lib/generateReceipt";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionBlocker } from "@/components/subscription/SubscriptionBlocker";
import { CreateTicketDialog } from "@/components/support/CreateTicketDialog";
import { TicketList } from "@/components/support/TicketList";
import { useMyTickets } from "@/hooks/useSupportTickets";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<any>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);

  // Data hooks
  const { data: students = [], isLoading: studentsLoading } = useParentStudents();
  const { data: payments = [], isLoading: paymentsLoading } = useParentPayments();
  const { data: schools = [] } = useSchools();
  const selectedStudent = students[0];
  const { data: studentFees = [] } = useStudentFees(selectedStudent?.id);
  const { data: notifications = [], isLoading: notificationsLoading } = useParentNotifications();
  const { data: notificationReads = [] } = useNotificationReads();
  const markAsRead = useMarkNotificationRead();
  const createPayment = useCreatePayment();
  const uploadScreenshot = useUploadScreenshot();
  const { data: myTickets = [], isLoading: myTicketsLoading } = useMyTickets();
  
  // Ref for file input (unused now but kept for potential future use)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate unread count
  const readNotificationIds = new Set(notificationReads.map(r => r.notification_id));
  const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

  // Get school details for payment info
  const studentSchool = schools.find(s => s.id === selectedStudent?.school_id);
  
  // Check subscription status
  const { isActive: isSubscriptionActive, isLoading: subscriptionLoading } = useIsSubscriptionActive(selectedStudent?.school_id);

  // Fetch fee structures for the student's school
  const { data: schoolFeeStructures = [] } = useFeeStructures(selectedStudent?.school_id);

  // Show blocker if subscription is expired
  if (!subscriptionLoading && selectedStudent && !isSubscriptionActive) {
    return <SubscriptionBlocker type="parent" schoolName={studentSchool?.name} />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handlePayFee = (fee: any) => {
    setSelectedFeeForPayment(fee);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async (amount: number) => {
    if (!selectedFeeForPayment || !selectedStudent || !user) return { id: "" };
    
    const result = await createPayment.mutateAsync({
      student_id: selectedStudent.id,
      student_fee_id: selectedFeeForPayment.id,
      amount: amount,
      payment_method: "UPI",
      parent_id: user.id,
    });
    
    return result;
  };

  const handleUploadScreenshotNew = async (file: File, paymentId: string) => {
    if (!user) return;
    await uploadScreenshot.mutateAsync({
      file: file,
      paymentId: paymentId,
      userId: user.id,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Calculate totals from real data
  const completedPayments = payments.filter(p => p.status === 'completed');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingFromFees = studentFees.reduce((sum, f) => sum + (Number(f.amount) - Number(f.discount || 0)), 0);
  const totalPending = pendingFromFees;

  const feesSummary = {
    total: `₹${(totalPaid + totalPending).toLocaleString('en-IN')}`,
    paid: `₹${totalPaid.toLocaleString('en-IN')}`,
    pending: `₹${totalPending.toLocaleString('en-IN')}`,
    dueDate: studentFees.length > 0 ? format(new Date(studentFees[0].due_date), 'dd MMM yyyy') : 'N/A',
  };

  const navItems = [
    { icon: Home, label: "Home", key: "dashboard" },
    { icon: CreditCard, label: "Pay", key: "pay" },
    { icon: History, label: "History", key: "history" },
    { icon: BarChart3, label: "Fees", key: "fees" },
    { icon: Bell, label: "Alerts", key: "notifications", badge: unreadCount },
    { icon: MessageSquare, label: "Support", key: "support" },
    { icon: Settings, label: "Settings", key: "settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Horizontal Swipeable Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom shadow-lg">
        <div 
          ref={navScrollRef}
          className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {navItems.map((item, index) => (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(item.key)}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] px-3 py-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
                activeTab === item.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary active:scale-95"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.key ? "scale-110" : ""}`} />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
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
              {studentsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No students linked to your account yet.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedStudent?.first_name} {selectedStudent?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Class {selectedStudent?.class}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {selectedStudent?.roll_number && <p>Roll No: {selectedStudent.roll_number}</p>}
                    {selectedStudent?.section && <p>Section: {selectedStudent.section}</p>}
                  </div>
                  {/* Linked School Info */}
                  {studentSchool && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <p className="text-xs font-medium text-primary mb-1">School</p>
                      <p className="text-sm font-semibold text-foreground">{studentSchool.name}</p>
                      {studentSchool.phone && (
                        <p className="text-xs text-muted-foreground">{studentSchool.phone}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.key
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
                <span className="text-accent font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Parent
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
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
      <main className="flex-1 overflow-auto pb-24 lg:pb-0">
        {/* Header - Mobile App Style */}
        <header className="sticky top-0 z-30 bg-gradient-to-b from-primary/10 to-background px-4 lg:px-6 pt-4 pb-3 lg:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                className="lg:hidden p-2.5 -ml-2 rounded-xl bg-secondary/80 hover:bg-secondary transition-colors flex-shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <div className="min-w-0 lg:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-foreground">EduPay</span>
                </div>
              </div>
              <div className="min-w-0 hidden lg:block">
                <h1 className="text-2xl font-display font-bold text-foreground truncate">
                  {navItems.find(n => n.key === activeTab)?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedStudent 
                    ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
                    : "View your fee details"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant={unreadCount > 0 ? "default" : "outline"}
                size="icon" 
                className={`relative w-10 h-10 rounded-xl ${unreadCount > 0 ? 'animate-pulse' : ''}`}
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile Student Quick Card */}
          <motion.div 
            className="lg:hidden mt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedStudent && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Class {selectedStudent.class} {selectedStudent.section && `• Sec ${selectedStudent.section}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant="secondary" className="text-[10px] px-2">
                    {studentSchool?.name?.split(' ')[0] || 'School'}
                  </Badge>
                  {totalPending > 0 && (
                    <span className="text-xs font-semibold text-coral">
                      ₹{totalPending.toLocaleString('en-IN')} due
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {activeTab === "dashboard" && (
            <>
              {/* Quick Actions - App Style */}
              <div className="grid grid-cols-4 gap-2 lg:hidden">
                {[
                  { icon: CreditCard, label: "Pay Now", key: "pay", color: "bg-primary" },
                  { icon: History, label: "History", key: "history", color: "bg-success" },
                  { icon: Bell, label: "Alerts", key: "notifications", color: "bg-warning" },
                  { icon: Phone, label: "Help", key: "support", color: "bg-info" },
                ].map((action, index) => (
                  <motion.button
                    key={action.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveTab(action.key)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 active:scale-95 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{action.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Balance Card - App Style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg">
                  <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4 lg:p-6 text-primary-foreground">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-primary-foreground/70 text-xs lg:text-sm font-medium mb-1">Total Balance</p>
                        <p className="text-2xl lg:text-4xl font-bold">{feesSummary.total}</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div className="bg-primary-foreground/10 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                          <span className="text-[10px] lg:text-xs text-primary-foreground/70">Paid</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold">{feesSummary.paid}</p>
                      </div>
                      <div className="bg-primary-foreground/10 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-300" />
                          <span className="text-[10px] lg:text-xs text-primary-foreground/70">Pending</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold">{feesSummary.pending}</p>
                      </div>
                    </div>
                  </div>
                  {studentFees.length > 0 && (
                    <div className="p-3 lg:p-4 bg-coral/10 border-t border-coral/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-coral" />
                          <span className="text-xs lg:text-sm text-foreground">Next due: <strong>{feesSummary.dueDate}</strong></span>
                        </div>
                        <Button size="sm" className="h-8 px-3 text-xs" onClick={() => setActiveTab("pay")}>
                          Pay Now <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Pending Fees - App Style */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-coral" />
                        </div>
                        <CardTitle className="text-sm lg:text-base font-semibold">
                          Pending Fees
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {studentFees.length} items
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {studentFees.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-success/50" />
                          <p className="text-sm">All fees paid! 🎉</p>
                        </div>
                      ) : (
                        studentFees.slice(0, 3).map((fee, index) => (
                          <motion.div
                            key={fee.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                          >
                            <div className={`w-2 h-10 rounded-full ${new Date(fee.due_date) < new Date() ? 'bg-destructive' : 'bg-warning'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {fee.fee_structures?.name || 'Fee'}
                              </p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(fee.due_date), 'dd MMM')}
                                {new Date(fee.due_date) < new Date() && (
                                  <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4 ml-1">Overdue</Badge>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">
                                ₹{(Number(fee.amount) - Number(fee.discount || 0)).toLocaleString('en-IN')}
                              </span>
                              <Button size="sm" className="h-7 px-2.5 text-xs rounded-lg" onClick={() => handlePayFee(fee)}>
                                Pay
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                      {totalPending > 0 && (
                        <Button 
                          variant="default" 
                          className="w-full mt-2 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80" 
                          onClick={() => setActiveTab("pay")}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay All • {feesSummary.pending}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Payments - App Style */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <CardTitle className="text-sm lg:text-base font-semibold">
                          Recent Activity
                        </CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setActiveTab("history")}>
                        View All <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {paymentsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : completedPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No transactions yet</p>
                        </div>
                      ) : (
                        completedPayments.slice(0, 3).map((payment, index) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                          >
                            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {payment.payment_method} Payment
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM, HH:mm') : 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-success">
                                +₹{Number(payment.amount).toLocaleString('en-IN')}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1 text-[9px] gap-0.5 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const receiptData: ReceiptData = {
                                    paymentId: payment.id,
                                    studentName: `${payment.students?.first_name || ''} ${payment.students?.last_name || ''}`,
                                    studentClass: payment.students?.class || '',
                                    schoolName: studentSchool?.name || 'School',
                                    amount: Number(payment.amount),
                                    paymentDate: payment.payment_date || payment.created_at,
                                    paymentMethod: payment.payment_method,
                                    transactionId: payment.transaction_id || undefined,
                                  };
                                  downloadReceipt(receiptData);
                                }}
                              >
                                <Download className="w-3 h-3" />
                                Receipt
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Pay Options - Hidden on mobile since we have quick actions */}
              <Card className="hidden lg:block">
                <CardHeader className="pb-2 lg:pb-4">
                  <CardTitle className="text-base lg:text-lg font-display">
                    Quick Pay Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: "UPI", icon: "📱", desc: "GPay, PhonePe" },
                      { name: "Card", icon: "💳", desc: "Credit/Debit" },
                      { name: "Net Banking", icon: "🏦", desc: "All banks" },
                      { name: "EMI", icon: "📅", desc: "Easy EMI" },
                    ].map((method) => (
                      <button
                        key={method.name}
                        className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                        onClick={() => setActiveTab("pay")}
                      >
                        <span className="text-3xl mb-2 block">{method.icon}</span>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {method.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {method.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader className="pb-2 lg:pb-4">
                <CardTitle className="text-base lg:text-lg font-display">All Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex justify-center py-6 lg:py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-6 lg:py-8 text-muted-foreground text-sm">
                    No payment history yet.
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-3 lg:p-4 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              payment.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                            }`}>
                              {payment.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-success" />
                              ) : (
                                <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-warning" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm lg:text-base">
                                {payment.payment_method}
                              </p>
                              <p className="text-xs lg:text-sm text-muted-foreground">
                                {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM, HH:mm') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className="font-bold text-foreground text-sm lg:text-base">
                                ₹{Number(payment.amount).toLocaleString('en-IN')}
                              </p>
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] lg:text-xs">
                                {payment.status}
                              </Badge>
                            </div>
                            {payment.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8 lg:w-9 lg:h-9"
                                onClick={() => {
                                  const receiptData: ReceiptData = {
                                    paymentId: payment.id,
                                    studentName: `${payment.students?.first_name || ''} ${payment.students?.last_name || ''}`,
                                    studentClass: payment.students?.class || '',
                                    schoolName: studentSchool?.name || 'School',
                                    amount: Number(payment.amount),
                                    paymentDate: payment.payment_date || payment.created_at,
                                    paymentMethod: payment.payment_method,
                                    transactionId: payment.transaction_id || undefined,
                                  };
                                  downloadReceipt(receiptData);
                                }}
                              >
                                <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "pay" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg lg:text-2xl font-display font-bold text-foreground">Pay Fees</h2>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {studentFees.length} pending {studentFees.length === 1 ? 'fee' : 'fees'} • Total: <span className="font-semibold text-coral">₹{totalPending.toLocaleString('en-IN')}</span>
                  </p>
                </div>
                {totalPending > 0 && (
                  <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-coral" />
                  </div>
                )}
              </div>

              {/* Pending Fees List */}
              {studentFees.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">All Clear! 🎉</p>
                  <p className="text-sm text-muted-foreground">No pending fees. You're all caught up.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {studentFees.map((fee, index) => {
                    const feeAmount = Number(fee.amount) - Number(fee.discount || 0);
                    const isOverdue = new Date(fee.due_date) < new Date();
                    const isSelected = selectedFeeForPayment?.id === fee.id && !paymentDialogOpen;

                    return (
                      <motion.div
                        key={fee.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                      >
                        {/* Fee Card */}
                        <button
                          onClick={() => setSelectedFeeForPayment(isSelected ? null : fee)}
                          className={`w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-lg'
                              : 'border-border bg-card hover:border-primary/30 hover:shadow-md active:scale-[0.98]'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Status Indicator */}
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isOverdue ? 'bg-destructive/10' : 'bg-warning/10'
                              }`}>
                                {isOverdue ? (
                                  <AlertTriangle className="w-5 h-5 text-destructive" />
                                ) : (
                                  <Clock className="w-5 h-5 text-warning" />
                                )}
                              </div>

                              {/* Fee Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-semibold text-foreground text-sm truncate">
                                    {fee.fee_structures?.name || 'Fee'}
                                  </p>
                                  {isOverdue && (
                                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0">
                                      Overdue
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due {format(new Date(fee.due_date), 'dd MMM yyyy')}</span>
                                </div>
                                {fee.fee_structures?.fee_type && (
                                  <Badge variant="outline" className="text-[10px] mt-1.5 capitalize">
                                    {fee.fee_structures.fee_type}
                                  </Badge>
                                )}
                              </div>

                              {/* Amount + Arrow */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-foreground">
                                    ₹{feeAmount.toLocaleString('en-IN')}
                                  </p>
                                  {Number(fee.discount || 0) > 0 && (
                                    <p className="text-[10px] text-success">
                                      -₹{Number(fee.discount).toLocaleString('en-IN')} off
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded Payment Section */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 rounded-2xl border border-primary/20 bg-card p-4 space-y-4">
                                {/* Amount Summary */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5">
                                  <span className="text-sm font-medium text-foreground">Amount to Pay</span>
                                  <span className="text-xl font-bold text-primary">₹{feeAmount.toLocaleString('en-IN')}</span>
                                </div>

                                {/* QR Code */}
                                {studentSchool?.upi_id && (
                                  <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/50">
                                    <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                                      <QrCode className="w-32 h-32 text-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">Scan with any UPI app</p>
                                    <div className="flex items-center gap-2 w-full">
                                      <code className="flex-1 bg-background px-3 py-2 rounded-lg text-xs font-mono text-foreground text-center truncate">
                                        {studentSchool.upi_id}
                                      </code>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-8 h-8 flex-shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyToClipboard(studentSchool.upi_id!);
                                        }}
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* UPI App Buttons */}
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Pay directly via</p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {[
                                      { name: "GPay", icon: "💳", color: "bg-blue-500/10 hover:bg-blue-500/20" },
                                      { name: "PhonePe", icon: "📱", color: "bg-purple-500/10 hover:bg-purple-500/20" },
                                      { name: "Paytm", icon: "💰", color: "bg-sky-500/10 hover:bg-sky-500/20" },
                                      { name: "BHIM", icon: "🏦", color: "bg-green-500/10 hover:bg-green-500/20" },
                                    ].map((app) => (
                                      <button
                                        key={app.name}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePayFee(fee);
                                        }}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl ${app.color} transition-all active:scale-95`}
                                      >
                                        <span className="text-xl">{app.icon}</span>
                                        <span className="text-[10px] font-medium text-foreground">{app.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Pay Button */}
                                <Button
                                  className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePayFee(fee);
                                  }}
                                >
                                  <CreditCard className="w-5 h-5 mr-2" />
                                  Pay ₹{feeAmount.toLocaleString('en-IN')}
                                </Button>

                                {!studentSchool?.upi_id && (
                                  <p className="text-xs text-center text-muted-foreground">
                                    School has not configured UPI payments yet. Please contact the school.
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  School Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount} new</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notif) => {
                      const isRead = readNotificationIds.has(notif.id);
                      return (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                            isRead 
                              ? "bg-secondary/30 border-border" 
                              : "bg-primary/5 border-primary/20"
                          }`}
                          onClick={() => !isRead && markAsRead.mutate(notif.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {!isRead && (
                                  <span className="w-2 h-2 bg-primary rounded-full" />
                                )}
                                <p className={`font-medium ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
                                  {notif.title}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(notif.created_at), 'MMM dd, yyyy • HH:mm')}
                              </p>
                            </div>
                            <Badge variant={
                              notif.type === "urgent" ? "destructive" :
                              notif.type === "warning" ? "secondary" : "default"
                            }>
                              {notif.type}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Push Notifications */}
              <PushNotificationToggle schoolId={selectedStudent?.school_id} variant="card" />

              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Sun className="w-5 h-5" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-muted-foreground" />
                      <Switch
                        checked={document.documentElement.classList.contains('dark')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            document.documentElement.classList.add('dark');
                            localStorage.setItem('theme', 'dark');
                          } else {
                            document.documentElement.classList.remove('dark');
                            localStorage.setItem('theme', 'light');
                          }
                        }}
                      />
                      <Moon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Password</p>
                      <p className="text-sm text-muted-foreground">••••••••</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
                          redirectTo: `${window.location.origin}/login`,
                        });
                        if (error) {
                          toast.error(error.message);
                        } else {
                          toast.success('Password reset email sent! Check your inbox.');
                        }
                      }}
                    >
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="font-medium text-foreground mb-1">Need Help?</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Contact your school administration for any fee-related queries.
                      </p>
                      {studentSchool && (
                        <div className="space-y-1 text-sm">
                          <p><strong>School:</strong> {studentSchool.name}</p>
                          {studentSchool.email && <p><strong>Email:</strong> {studentSchool.email}</p>}
                          {studentSchool.phone && <p><strong>Phone:</strong> {studentSchool.phone}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Install App */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Install App
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Install EduPay on your device for quick access, offline support, and instant notifications.
                  </p>

                  {/* Android / Desktop Install */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Android / Desktop</p>
                        <p className="text-xs text-muted-foreground">Add to Home Screen via browser</p>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        const deferredPrompt = (window as any).__pwaInstallPrompt;
                        if (deferredPrompt) {
                          deferredPrompt.prompt();
                          deferredPrompt.userChoice.then((choice: any) => {
                            (window as any).__pwaInstallPrompt = null;
                            if (choice.outcome === 'accepted') {
                              toast.success('✅ App installed! Open from your home screen.');
                            }
                          });
                        } else if (window.matchMedia('(display-mode: standalone)').matches) {
                          toast.info('App is already installed!');
                        } else {
                          // Auto-detect platform and give one-step instruction
                          const ua = navigator.userAgent;
                          const isIOS = /iPad|iPhone|iPod/.test(ua);
                          if (isIOS) {
                            toast.info('Tap Safari Share button (📤) → "Add to Home Screen"');
                          } else {
                            toast.info('Tap browser menu (⋮) → "Add to Home Screen"');
                          }
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  </div>

                  {/* iOS Instructions */}
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Share className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">iPhone / iPad</p>
                        <p className="text-xs text-muted-foreground">Add via Safari</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                        <span>Open this page in <strong className="text-foreground">Safari</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                        <span>Tap the <strong className="text-foreground">Share</strong> button <Share className="w-3 h-3 inline" /></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                        <span>Select <strong className="text-foreground">"Add to Home Screen"</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Already installed hint */}
                  {window.matchMedia('(display-mode: standalone)').matches && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">App is already installed!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Fee Structures Tab */}
          {activeTab === "fees" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Fee Structure</h2>
                <p className="text-sm text-muted-foreground">
                  View all fees applicable to your child's school
                </p>
              </div>

              {schoolFeeStructures.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No fee structures available.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {schoolFeeStructures.filter(f => f.is_active).map((fee, index) => {
                    const appliesTo = (fee as any).target_class
                      ? `Class ${(fee as any).target_class}`
                      : "All Classes";
                    const isRelevant = !(fee as any).target_class || (fee as any).target_class === selectedStudent?.class;

                    return (
                      <motion.div
                        key={fee.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card className={`border ${isRelevant ? 'border-primary/20' : 'border-border opacity-60'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-foreground">{fee.name}</p>
                                  {isRelevant && (
                                    <Badge variant="default" className="text-[10px]">Applies to you</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {fee.fee_type} • {fee.academic_year} • {appliesTo}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {(fee as any).recurrence_type === 'monthly' ? 'Monthly (29th)' : (fee as any).recurrence_type === 'annually' ? 'Annually' : 'One-time'}
                                  </Badge>
                                  {fee.due_date && (fee as any).recurrence_type === 'annually' && (
                                    <Badge variant="secondary" className="text-xs">
                                      Due: {format(new Date(fee.due_date), 'dd MMM')}
                                    </Badge>
                                  )}
                                </div>
                                {fee.description && (
                                  <p className="text-xs text-muted-foreground mt-2">{fee.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-foreground">
                                  ₹{Number(fee.amount).toLocaleString('en-IN')}
                                </p>
                                {(fee as any).recurrence_type === 'monthly' && (
                                  <p className="text-[10px] text-muted-foreground">/month</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Support</h2>
                  <p className="text-muted-foreground">Submit and track your support tickets</p>
                </div>
                <CreateTicketDialog schoolId={selectedStudent?.school_id} />
              </div>
              <TicketList tickets={myTickets} isLoading={myTicketsLoading} />
            </div>
          )}
        </div>
      </main>

      {/* UPI Payment Dialog */}
      <UPIPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        fee={selectedFeeForPayment}
        school={studentSchool ? { upi_id: studentSchool.upi_id, name: studentSchool.name } : null}
        studentName={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ""}
        onConfirmPayment={handleConfirmPayment}
        onUploadScreenshot={handleUploadScreenshotNew}
        isCreatingPayment={createPayment.isPending}
        isUploadingScreenshot={uploadScreenshot.isPending}
      />
    </div>
  );
};

export default ParentDashboard;
