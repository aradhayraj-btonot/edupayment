import { useState, useRef } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useParentStudents } from "@/hooks/useStudents";
import { useParentPayments, useCreatePayment, useUploadScreenshot } from "@/hooks/usePayments";
import { useStudentFees } from "@/hooks/useFees";
import { useSchools } from "@/hooks/useSchools";
import { useParentNotifications, useNotificationReads, useMarkNotificationRead } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { QrCode, Copy, ExternalLink } from "lucide-react";
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

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<any>(null);

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
  
  // Screenshot upload state
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'qr' | 'upload'>('qr');
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate unread count
  const readNotificationIds = new Set(notificationReads.map(r => r.notification_id));
  const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

  // Get school details for payment info
  const studentSchool = schools.find(s => s.id === selectedStudent?.school_id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handlePayFee = (fee: any) => {
    setSelectedFeeForPayment(fee);
    setPaymentStep('qr');
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setCreatedPaymentId(null);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFeeForPayment || !selectedStudent || !user) return;
    
    const result = await createPayment.mutateAsync({
      student_id: selectedStudent.id,
      student_fee_id: selectedFeeForPayment.id,
      amount: Number(selectedFeeForPayment.amount) - Number(selectedFeeForPayment.discount || 0),
      payment_method: "UPI",
      parent_id: user.id,
    });
    
    // Move to upload step
    setCreatedPaymentId(result.id);
    setPaymentStep('upload');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshotFile || !createdPaymentId || !user) return;
    
    await uploadScreenshot.mutateAsync({
      file: screenshotFile,
      paymentId: createdPaymentId,
      userId: user.id,
    });
    
    // Close dialog and reset
    setPaymentDialogOpen(false);
    setSelectedFeeForPayment(null);
    setPaymentStep('qr');
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setCreatedPaymentId(null);
    toast.success("Payment submitted for verification!");
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentStep('qr');
    setScreenshotFile(null);
    setScreenshotPreview(null);
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
    { icon: Home, label: "Dashboard", key: "dashboard" },
    { icon: CreditCard, label: "Pay Fees", key: "pay" },
    { icon: History, label: "Payment History", key: "history" },
    { icon: Bell, label: "Notifications", key: "notifications" },
    { icon: Settings, label: "Settings", key: "settings" },
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
                  {selectedStudent 
                    ? `Manage fees and payments for ${selectedStudent.first_name} ${selectedStudent.last_name}`
                    : "View your fee details and payment history"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="relative"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
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
          {activeTab === "dashboard" && (
            <>
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
                      <AlertTriangle className="w-3 h-3" />{studentFees.length} items
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {studentFees.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No pending fees at the moment.
                      </div>
                    ) : (
                      studentFees.map((fee) => (
                        <div
                          key={fee.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                        >
                          <div>
                            <p className="font-medium text-foreground">{fee.fee_structures?.name || 'Fee'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Due: {format(new Date(fee.due_date), 'dd MMM yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="font-semibold text-foreground">
                                ₹{(Number(fee.amount) - Number(fee.discount || 0)).toLocaleString('en-IN')}
                              </p>
                              <Badge
                                variant={new Date(fee.due_date) < new Date() ? "destructive" : "secondary"}
                                className="mt-1"
                              >
                                {new Date(fee.due_date) < new Date() ? (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" /> Overdue
                                  </>
                                ) : (
                                  "Upcoming"
                                )}
                              </Badge>
                            </div>
                            <Button size="sm" onClick={() => handlePayFee(fee)}>
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    {totalPending > 0 && (
                      <Button 
                        variant="default" 
                        className="w-full mt-4 bg-success hover:bg-success/90" 
                        size="lg"
                        onClick={() => setActiveTab("pay")}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay All Pending ({feesSummary.pending})
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-display">
                      Payment History
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {paymentsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : completedPayments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No payment history yet.
                      </div>
                    ) : (
                      completedPayments.slice(0, 4).map((payment) => (
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
                                Payment
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy') : 'N/A'} • {payment.payment_method}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ₹{Number(payment.amount).toLocaleString('en-IN')}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs gap-1"
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
                        </div>
                      ))
                    )}
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
            </>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">All Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment history yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payment.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                          }`}>
                            {payment.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : (
                              <Clock className="w-5 h-5 text-warning" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Payment via {payment.payment_method}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy, HH:mm') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-foreground">
                              ₹{Number(payment.amount).toLocaleString('en-IN')}
                            </p>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </div>
                          {payment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
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
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "pay" && (
            <div className="space-y-6">
              {/* School Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Pay School Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!studentSchool ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No school linked to your student yet.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* QR Code Section */}
                      <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-xl">
                        {studentSchool.upi_qr_code_url ? (
                          <img 
                            src={studentSchool.upi_qr_code_url} 
                            alt="Payment QR Code" 
                            className="w-48 h-48 rounded-lg mb-4"
                          />
                        ) : (
                          <div className="w-48 h-48 bg-secondary rounded-lg flex items-center justify-center mb-4">
                            <QrCode className="w-24 h-24 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground text-center">
                          Scan this QR code with any UPI app
                        </p>
                      </div>

                      {/* UPI Details Section */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">School Name</p>
                          <p className="text-lg font-semibold text-foreground">{studentSchool.name}</p>
                        </div>
                        
                        {studentSchool.upi_id && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">UPI ID</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 bg-secondary px-4 py-3 rounded-lg text-foreground font-mono">
                                {studentSchool.upi_id}
                              </code>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => copyToClipboard(studentSchool.upi_id!)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground mb-2">Total Pending Amount</p>
                          <p className="text-3xl font-bold text-coral">{feesSummary.pending}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Pay using:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                              <button 
                                key={app}
                                className="p-3 bg-secondary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
                              >
                                {app}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Fees List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">Select Fee to Pay</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {studentFees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending fees.
                    </div>
                  ) : (
                    studentFees.map((fee) => (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground">{fee.fee_structures?.name || 'Fee'}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {format(new Date(fee.due_date), 'dd MMM yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-lg">
                            ₹{(Number(fee.amount) - Number(fee.discount || 0)).toLocaleString('en-IN')}
                          </p>
                          <Button onClick={() => handlePayFee(fee)}>
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
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
            </div>
          )}
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={handleClosePaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentStep === 'qr' ? 'Complete Payment' : 'Upload Payment Screenshot'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedFeeForPayment && studentSchool && (
            <div className="space-y-6">
              {/* Amount */}
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{(Number(selectedFeeForPayment.amount) - Number(selectedFeeForPayment.discount || 0)).toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedFeeForPayment.fee_structures?.name}
                </p>
              </div>

              {paymentStep === 'qr' ? (
                <>
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    {studentSchool.upi_qr_code_url ? (
                      <img 
                        src={studentSchool.upi_qr_code_url} 
                        alt="Payment QR Code" 
                        className="w-40 h-40 rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-secondary rounded-lg flex items-center justify-center mb-3">
                        <QrCode className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">Scan with any UPI app</p>
                  </div>

                  {/* UPI ID */}
                  {studentSchool.upi_id && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Or pay to UPI ID:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-secondary px-3 py-2 rounded-lg text-sm font-mono">
                          {studentSchool.upi_id}
                        </code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(studentSchool.upi_id!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleConfirmPayment}
                    disabled={createPayment.isPending}
                  >
                    {createPayment.isPending ? "Processing..." : "I've Completed the Payment"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    After making payment via UPI, click above to confirm. Your payment will be verified by the school.
                  </p>
                </>
              ) : (
                <>
                  {/* Screenshot Upload Step */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Payment recorded! Please upload your payment screenshot for verification.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Upload Payment Screenshot</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                      >
                        {screenshotPreview ? (
                          <img 
                            src={screenshotPreview} 
                            alt="Screenshot preview" 
                            className="max-h-48 mx-auto rounded-lg"
                          />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleUploadScreenshot}
                      disabled={!screenshotFile || uploadScreenshot.isPending}
                    >
                      {uploadScreenshot.isPending ? "Uploading..." : "Submit for Verification"}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Your payment will be verified by the school admin. You'll receive a receipt notification once approved.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentDashboard;
