import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Plus,
  Building,
  Edit,
  Trash2,
  Moon,
  Sun,
  Lock,
  QrCode,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from "@/hooks/useStudents";
import { usePayments, usePaymentStats, usePendingPayments, useVerifyPayment } from "@/hooks/usePayments";
import { useSchools, useCreateSchool, useUpdateSchool } from "@/hooks/useSchools";
import { useAdminSchool, useUpdateAdminSchool } from "@/hooks/useAdminSchool";
import { useFeeStructures, useCreateFeeStructure, useUpdateFeeStructure, useDeleteFeeStructure, useAllStudentFees } from "@/hooks/useFees";
import { useSchoolNotifications, useSendNotification, useSendReceipt } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ShieldCheck, Eye, XCircle, Calculator, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { useIsSubscriptionActive } from "@/hooks/useSubscription";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addFeeOpen, setAddFeeOpen] = useState(false);

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "info",
  });

  // Data hooks
  const { data: adminSchool, isLoading: adminSchoolLoading } = useAdminSchool();
  const selectedSchool = adminSchool;
  const { data: students = [], isLoading: studentsLoading } = useStudents(selectedSchool?.id);
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: paymentStats } = usePaymentStats();
  const { data: feeStructures = [] } = useFeeStructures(selectedSchool?.id);
  const { data: notifications = [], isLoading: notificationsLoading } = useSchoolNotifications(selectedSchool?.id);
  const { data: pendingPayments = [], isLoading: pendingPaymentsLoading } = usePendingPayments();
  const { data: allStudentFees = [], isLoading: allStudentFeesLoading } = useAllStudentFees(selectedSchool?.id);

  // Mutations
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const updateAdminSchool = useUpdateAdminSchool();
  const createFee = useCreateFeeStructure();
  const updateFee = useUpdateFeeStructure();
  const deleteFee = useDeleteFeeStructure();
  const sendNotification = useSendNotification();
  const sendReceipt = useSendReceipt();
  const verifyPayment = useVerifyPayment();

  // Screenshot preview state
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // Edit states
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFeeOpen, setEditFeeOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [editSchoolOpen, setEditSchoolOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'school' | 'account' | 'appearance' | 'subscription'>('subscription');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [studentForm, setStudentForm] = useState({
    first_name: "",
    last_name: "",
    class: "",
    section: "",
    roll_number: "",
    parent_email: "",
    transport_charge: "",
  });

  const [schoolForm, setSchoolForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    upi_id: "",
    upi_qr_code_url: "",
  });

  const [feeForm, setFeeForm] = useState({
    name: "",
    fee_type: "tuition" as 'tuition' | 'transport' | 'activities' | 'library' | 'laboratory' | 'sports' | 'annually' | 'other',
    amount: "",
    academic_year: "2024-2025",
    description: "",
    recurrence_type: "monthly" as 'monthly' | 'annually' | 'one_time',
    due_date: "",
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    
    await createStudent.mutateAsync({
      school_id: selectedSchool.id,
      first_name: studentForm.first_name,
      last_name: studentForm.last_name,
      class: studentForm.class,
      section: studentForm.section || null,
      roll_number: studentForm.roll_number || null,
      parent_email: studentForm.parent_email || null,
      transport_charge: studentForm.transport_charge ? parseFloat(studentForm.transport_charge) : 0,
    });
    
    setStudentForm({ first_name: "", last_name: "", class: "", section: "", roll_number: "", parent_email: "", transport_charge: "" });
    setAddStudentOpen(false);
  };

  const handleEditSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSchool) return;
    await updateAdminSchool.mutateAsync({
      id: adminSchool.id,
      name: schoolForm.name,
      address: schoolForm.address || null,
      phone: schoolForm.phone || null,
      email: schoolForm.email || null,
      upi_id: schoolForm.upi_id || null,
      upi_qr_code_url: schoolForm.upi_qr_code_url || null,
    });
    setEditSchoolOpen(false);
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    
    await createFee.mutateAsync({
      school_id: selectedSchool.id,
      name: feeForm.name,
      fee_type: feeForm.fee_type,
      amount: parseFloat(feeForm.amount),
      academic_year: feeForm.academic_year,
      description: feeForm.description || null,
      recurrence_type: feeForm.recurrence_type,
      due_date: feeForm.due_date || null,
    });
    
    setFeeForm({ name: "", fee_type: "tuition", amount: "", academic_year: "2024-2025", description: "", recurrence_type: "monthly", due_date: "" });
    setAddFeeOpen(false);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    
    await sendNotification.mutateAsync({
      school_id: selectedSchool.id,
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
    });
    
    setNotificationForm({ title: "", message: "", type: "info" });
  };

  const stats = [
    {
      title: "Total Collections",
      value: `₹${(paymentStats?.totalCollected || 0).toLocaleString('en-IN')}`,
      change: "+12.5%",
      trend: "up",
      icon: IndianRupee,
      color: "bg-success/10 text-success",
    },
    {
      title: "Pending Fees",
      value: `₹${(paymentStats?.pendingAmount || 0).toLocaleString('en-IN')}`,
      change: "-5.2%",
      trend: "down",
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Total Students",
      value: students.length.toString(),
      change: `+${students.length}`,
      trend: "up",
      icon: Users,
      color: "bg-info/10 text-info",
    },
    {
      title: "Payment Rate",
      value: paymentStats?.completedCount && paymentStats?.pendingCount
        ? `${Math.round((paymentStats.completedCount / (paymentStats.completedCount + paymentStats.pendingCount)) * 100)}%`
        : "0%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
    },
  ];

  const navItems = [
    { icon: Home, label: "Dashboard", key: "dashboard" },
    { icon: Calculator, label: "Totals", key: "totals" },
    { icon: ShieldCheck, label: "Verify Payments", key: "verify" },
    { icon: Building, label: "Schools", key: "schools" },
    { icon: Users, label: "Students", key: "students" },
    { icon: CreditCard, label: "Payments", key: "payments" },
    { icon: BarChart3, label: "Fee Structures", key: "fees" },
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
                <span className="flex-1">{item.label}</span>
                {item.key === "verify" && pendingPayments.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingPayments.length}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  School Admin
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
                <h1 className="text-2xl font-display font-bold text-foreground capitalize">
                  {activeTab}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "dashboard" && "Welcome back! Here's your school's financial overview."}
                  {activeTab === "totals" && "View detailed fee totals and student-wise breakdown"}
                  {activeTab === "verify" && `${pendingPayments.length} payments awaiting verification`}
                  {activeTab === "students" && `${students.length} students enrolled`}
                  {activeTab === "payments" && `${payments.length} total payments`}
                  {activeTab === "schools" && (adminSchool ? "Your school details" : "No school assigned")}
                  {activeTab === "fees" && `${feeStructures.length} fee structures`}
                  {activeTab === "notifications" && `${notifications.length} notifications`}
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
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
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
          {activeTab === "dashboard" && (
            <>
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
            </>
          )}

          {activeTab === "totals" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Fees Assigned</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{allStudentFees.reduce((sum, f) => sum + Number(f.amount), 0).toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-success">
                      ₹{allStudentFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount), 0).toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Pending</p>
                    <p className="text-2xl font-bold text-warning">
                      ₹{allStudentFees.filter(f => f.status === 'pending').reduce((sum, f) => sum + Number(f.amount) - Number(f.discount || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Discounts</p>
                    <p className="text-2xl font-bold text-info">
                      ₹{allStudentFees.reduce((sum, f) => sum + Number(f.discount || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Student-wise Fee Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Student-wise Fee Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allStudentFeesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : allStudentFees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No fee assignments found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Class</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fee Type</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Discount</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Net Amount</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allStudentFees.slice(0, 50).map((fee) => (
                            <tr key={fee.id} className="border-b border-border/50 hover:bg-secondary/30">
                              <td className="py-3 px-4">
                                <p className="font-medium text-foreground">
                                  {fee.students?.first_name} {fee.students?.last_name}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {fee.students?.class}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {fee.fee_structures?.name || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-right text-foreground">
                                ₹{Number(fee.amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4 text-right text-info">
                                ₹{Number(fee.discount || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4 text-right font-medium text-foreground">
                                ₹{(Number(fee.amount) - Number(fee.discount || 0)).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant={fee.status === 'paid' ? 'default' : 'secondary'}>
                                  {fee.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {allStudentFees.length > 50 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          Showing first 50 of {allStudentFees.length} records
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "dashboard" && (
            <>
              {/* Recent Payments */}
              <Card>
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
                  {paymentsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No payments recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.slice(0, 5).map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
                                {payment.students?.first_name?.charAt(0)}{payment.students?.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {payment.students?.first_name} {payment.students?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Class {payment.students?.class} • {payment.payment_date ? format(new Date(payment.payment_date), 'MMM dd, yyyy') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ₹{Number(payment.amount).toLocaleString('en-IN')}
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
                  )}
                  <Button variant="ghost" className="w-full mt-4" onClick={() => setActiveTab("payments")}>
                    View All Payments
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "schools" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">My School</CardTitle>
                {adminSchool && (
                  <Dialog open={editSchoolOpen} onOpenChange={(open) => {
                    setEditSchoolOpen(open);
                    if (open && adminSchool) {
                      setSchoolForm({
                        name: adminSchool.name || "",
                        address: adminSchool.address || "",
                        phone: adminSchool.phone || "",
                        email: adminSchool.email || "",
                        upi_id: adminSchool.upi_id || "",
                        upi_qr_code_url: adminSchool.upi_qr_code_url || "",
                      });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" variant="outline">
                        <Edit className="w-4 h-4" />
                        Edit School
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit School Details</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditSchool} className="space-y-4">
                        <div>
                          <Label htmlFor="edit-school-name">School Name *</Label>
                          <Input
                            id="edit-school-name"
                            value={schoolForm.name}
                            onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-school-address">Address</Label>
                          <Textarea
                            id="edit-school-address"
                            value={schoolForm.address}
                            onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-school-phone">Phone</Label>
                          <Input
                            id="edit-school-phone"
                            value={schoolForm.phone}
                            onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-school-email">Email</Label>
                          <Input
                            id="edit-school-email"
                            type="email"
                            value={schoolForm.email}
                            onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                          />
                        </div>
                        <div className="border-t pt-4 mt-4">
                          <p className="text-sm font-medium text-foreground mb-3">Payment Details</p>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-upi-id">UPI ID</Label>
                              <Input
                                id="edit-upi-id"
                                placeholder="e.g., school@upi"
                                value={schoolForm.upi_id}
                                onChange={(e) => setSchoolForm({ ...schoolForm, upi_id: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-qr-url">Payment QR Code URL</Label>
                              <Input
                                id="edit-qr-url"
                                placeholder="https://..."
                                value={schoolForm.upi_qr_code_url}
                                onChange={(e) => setSchoolForm({ ...schoolForm, upi_qr_code_url: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={updateAdminSchool.isPending}>
                          {updateAdminSchool.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {adminSchoolLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !adminSchool ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No school assigned to your account.</p>
                    <p className="text-sm mt-2">Please contact the EduPay team to be assigned to a school.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* School Header */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        {adminSchool.logo_url ? (
                          <img src={adminSchool.logo_url} alt="School logo" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <Building className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">{adminSchool.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {adminSchool.subscription_active ? 
                            <Badge variant="default" className="mt-1">Subscription Active</Badge> : 
                            <Badge variant="destructive" className="mt-1">Subscription Inactive</Badge>
                          }
                        </p>
                      </div>
                    </div>

                    {/* School Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{adminSchool.address || "No address set"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="w-4 h-4 text-muted-foreground text-center">📧</span>
                            <span className="text-sm">{adminSchool.email || "No email set"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="w-4 h-4 text-muted-foreground text-center">📞</span>
                            <span className="text-sm">{adminSchool.phone || "No phone set"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Payment Information */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Payment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
                            <p className="text-sm font-medium">{adminSchool.upi_id || "Not configured"}</p>
                          </div>
                          {adminSchool.upi_qr_code_url && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">QR Code</p>
                              <img 
                                src={adminSchool.upi_qr_code_url} 
                                alt="UPI QR Code" 
                                className="w-24 h-24 rounded-lg border"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timestamps */}
                    <div className="flex gap-4 text-xs text-muted-foreground pt-4 border-t">
                      <span>Created: {format(new Date(adminSchool.created_at), 'PPP')}</span>
                      <span>Last Updated: {format(new Date(adminSchool.updated_at), 'PPP')}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "students" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">Students</CardTitle>
                <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" disabled={!selectedSchool}>
                      <Plus className="w-4 h-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first-name">First Name *</Label>
                          <Input
                            id="first-name"
                            value={studentForm.first_name}
                            onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="last-name">Last Name *</Label>
                          <Input
                            id="last-name"
                            value={studentForm.last_name}
                            onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="class">Class *</Label>
                          <Input
                            id="class"
                            placeholder="e.g., 10-A"
                            value={studentForm.class}
                            onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            value={studentForm.section}
                            onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="roll-number">Roll Number</Label>
                        <Input
                          id="roll-number"
                          value={studentForm.roll_number}
                          onChange={(e) => setStudentForm({ ...studentForm, roll_number: e.target.value })}
                        />
                      </div>
                      <div className="border-t pt-4 mt-4">
                        <Label htmlFor="transport-charge">Transport Charge (₹/month)</Label>
                        <Input
                          id="transport-charge"
                          type="number"
                          placeholder="e.g., 1500"
                          value={studentForm.transport_charge}
                          onChange={(e) => setStudentForm({ ...studentForm, transport_charge: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Monthly transport fee for this student (charged on 29th of each month).
                        </p>
                      </div>
                      <div className="border-t pt-4 mt-4">
                        <Label htmlFor="parent-email">Parent Email *</Label>
                        <Input
                          id="parent-email"
                          type="email"
                          placeholder="Parent's email to link account"
                          value={studentForm.parent_email}
                          onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          When parent signs up with this email, they will automatically see this student.
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={createStudent.isPending}>
                        {createStudent.isPending ? "Adding..." : "Add Student"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!selectedSchool ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Please add a school first to manage students.
                  </div>
                ) : studentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students enrolled yet. Add your first student.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Class {student.class} {student.section && `• Section ${student.section}`}
                              {student.roll_number && ` • Roll: ${student.roll_number}`}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {student.parent_email && (
                                <p className="text-xs text-primary/70">
                                  Parent: {student.parent_email}
                                </p>
                              )}
                              {student.transport_charge > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Transport: ₹{Number(student.transport_charge).toLocaleString('en-IN')}/mo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={student.parent_id ? "default" : "secondary"}>
                            {student.parent_id ? "Linked" : "Pending"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingStudent(student);
                              setStudentForm({
                                first_name: student.first_name,
                                last_name: student.last_name,
                                class: student.class,
                                section: student.section || '',
                                roll_number: student.roll_number || '',
                                parent_email: student.parent_email || '',
                                transport_charge: student.transport_charge?.toString() || '',
                              });
                              setEditStudentOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {student.first_name} {student.last_name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteStudent.mutate(student.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "payments" && (
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
                    No payments recorded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {payment.students?.first_name?.charAt(0)}{payment.students?.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {payment.students?.first_name} {payment.students?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment.payment_method} • {payment.payment_date ? format(new Date(payment.payment_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ₹{Number(payment.amount).toLocaleString('en-IN')}
                          </p>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "verify" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Verify Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPaymentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                    <p>No pending payments to verify.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                              <Clock className="w-6 h-6 text-warning" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">
                                {payment.students?.first_name} {payment.students?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Class {payment.students?.class} • {payment.payment_method}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.created_at ? format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">
                                ₹{Number(payment.amount).toLocaleString('en-IN')}
                              </p>
                              <Badge variant="secondary" className="mt-1">
                                Pending Verification
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Screenshot Preview */}
                        {payment.screenshot_url && (
                          <div className="mt-4 p-3 bg-background rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">Payment Screenshot:</p>
                            <div className="relative">
                              <img 
                                src={payment.screenshot_url} 
                                alt="Payment screenshot" 
                                className="max-h-48 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setPreviewScreenshot(payment.screenshot_url)}
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="absolute top-2 right-2 gap-1"
                                onClick={() => setPreviewScreenshot(payment.screenshot_url)}
                              >
                                <Eye className="w-3 h-3" />
                                View Full
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {!payment.screenshot_url && (
                          <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                            <p className="text-sm text-destructive">No screenshot uploaded by parent.</p>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-3">
                          <Button 
                            className="flex-1 gap-2"
                            onClick={async () => {
                              await verifyPayment.mutateAsync({ paymentId: payment.id, action: 'approve' });
                              // Send receipt email directly to parent
                              await sendReceipt.mutateAsync(payment.id);
                            }}
                            disabled={verifyPayment.isPending || sendReceipt.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve & Send Receipt
                          </Button>
                          <Button 
                            variant="destructive"
                            className="gap-2"
                            onClick={() => verifyPayment.mutateAsync({ paymentId: payment.id, action: 'reject' })}
                            disabled={verifyPayment.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "fees" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">Fee Structures</CardTitle>
                <Dialog open={addFeeOpen} onOpenChange={setAddFeeOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" disabled={!selectedSchool}>
                      <Plus className="w-4 h-4" />
                      Add Fee Structure
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Fee Structure</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddFee} className="space-y-4">
                      <div>
                        <Label htmlFor="fee-name">Fee Name *</Label>
                        <Input
                          id="fee-name"
                          placeholder="e.g., Tuition Fee Q1"
                          value={feeForm.name}
                          onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fee-type">Fee Type *</Label>
                        <Select
                          value={feeForm.fee_type}
                          onValueChange={(value: any) => {
                            // Auto-set recurrence based on fee type
                            let recurrence = feeForm.recurrence_type;
                            if (value === 'tuition' || value === 'transport') {
                              recurrence = 'monthly';
                            } else if (value === 'annually') {
                              recurrence = 'annually';
                            } else if (value === 'other') {
                              recurrence = 'one_time';
                            }
                            setFeeForm({ ...feeForm, fee_type: value, recurrence_type: recurrence });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tuition">Tuition (Monthly on 29th)</SelectItem>
                            <SelectItem value="transport">Transport (Monthly on 29th)</SelectItem>
                            <SelectItem value="annually">Annual Fee (On specific date)</SelectItem>
                            <SelectItem value="activities">Activities</SelectItem>
                            <SelectItem value="library">Library</SelectItem>
                            <SelectItem value="laboratory">Laboratory</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="other">Other / Instant (One-time)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feeForm.fee_type === 'tuition' && 'Charged every 29th of the month'}
                          {feeForm.fee_type === 'transport' && 'Variable per student, charged every 29th of the month'}
                          {feeForm.fee_type === 'annually' && 'Charged once per year on the specified date'}
                          {feeForm.fee_type === 'other' && 'One-time instant fee, charged once when assigned'}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="fee-amount">Amount (₹) *</Label>
                        <Input
                          id="fee-amount"
                          type="number"
                          placeholder="25000"
                          value={feeForm.amount}
                          onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                          required
                        />
                      </div>
                      {feeForm.fee_type === 'annually' && (
                        <div className="flex flex-col gap-2">
                          <Label>Annual Fee Due Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !feeForm.due_date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {feeForm.due_date ? format(new Date(feeForm.due_date), "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={feeForm.due_date ? new Date(feeForm.due_date) : undefined}
                                onSelect={(date) => setFeeForm({ ...feeForm, due_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <p className="text-xs text-muted-foreground">
                            Annual fee will be charged on this date each year.
                          </p>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="academic-year">Academic Year *</Label>
                        <Input
                          id="academic-year"
                          placeholder="2024-2025"
                          value={feeForm.academic_year}
                          onChange={(e) => setFeeForm({ ...feeForm, academic_year: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fee-description">Description</Label>
                        <Input
                          id="fee-description"
                          value={feeForm.description}
                          onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createFee.isPending}>
                        {createFee.isPending ? "Adding..." : "Add Fee Structure"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!selectedSchool ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Please add a school first to manage fee structures.
                  </div>
                ) : feeStructures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No fee structures created yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feeStructures.map((fee) => (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">{fee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {fee.fee_type} • {fee.academic_year}
                            {(fee as any).recurrence_type === 'monthly' && ' • Monthly (29th)'}
                            {(fee as any).recurrence_type === 'annually' && fee.due_date && ` • Annual (${format(new Date(fee.due_date), 'MMM dd')})`}
                            {(fee as any).recurrence_type === 'one_time' && ' • One-time'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ₹{Number(fee.amount).toLocaleString('en-IN')}
                            </p>
                            <div className="flex gap-1 justify-end mt-1">
                              <Badge variant="outline" className="text-xs">
                                {(fee as any).recurrence_type === 'monthly' ? 'Monthly' : (fee as any).recurrence_type === 'annually' ? 'Annually' : 'One-time'}
                              </Badge>
                              <Badge variant={fee.is_active ? "default" : "secondary"}>
                                {fee.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingFee(fee);
                              setFeeForm({
                                name: fee.name,
                                fee_type: fee.fee_type,
                                amount: fee.amount.toString(),
                                academic_year: fee.academic_year,
                                description: fee.description || '',
                                recurrence_type: (fee as any).recurrence_type || 'monthly',
                                due_date: fee.due_date || '',
                              });
                              setEditFeeOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{fee.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteFee.mutate(fee.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Send Notification Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Send Notification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedSchool ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Please add a school first to send notifications.
                    </div>
                  ) : (
                    <form onSubmit={handleSendNotification} className="space-y-4">
                      <div>
                        <Label htmlFor="notif-title">Title *</Label>
                        <Input
                          id="notif-title"
                          placeholder="Important announcement"
                          value={notificationForm.title}
                          onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="notif-message">Message *</Label>
                        <Textarea
                          id="notif-message"
                          placeholder="Write your notification message here..."
                          rows={5}
                          value={notificationForm.message}
                          onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="notif-type">Type</Label>
                        <Select
                          value={notificationForm.type}
                          onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Note:</strong> This notification will be sent to all {students.length} students' linked parents via email.
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={sendNotification.isPending}>
                        {sendNotification.isPending ? "Sending..." : "Send Notification"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Notification History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">
                    Sent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notificationsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No notifications sent yet.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 rounded-lg bg-secondary/50 border-l-4 border-l-primary"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{notif.title}</p>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                            <Badge variant={
                              notif.type === "urgent" ? "destructive" :
                              notif.type === "warning" ? "secondary" : "default"
                            }>
                              {notif.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(notif.created_at), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-border pb-4 flex-wrap">
                <Button 
                  variant={settingsTab === 'subscription' ? 'default' : 'outline'}
                  onClick={() => setSettingsTab('subscription')}
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Subscription
                </Button>
                <Button 
                  variant={settingsTab === 'school' ? 'default' : 'outline'}
                  onClick={() => setSettingsTab('school')}
                  className="gap-2"
                >
                  <Building className="w-4 h-4" />
                  School Settings
                </Button>
                <Button 
                  variant={settingsTab === 'account' ? 'default' : 'outline'}
                  onClick={() => setSettingsTab('account')}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Account
                </Button>
                <Button 
                  variant={settingsTab === 'appearance' ? 'default' : 'outline'}
                  onClick={() => setSettingsTab('appearance')}
                  className="gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Appearance
                </Button>
              </div>

              {settingsTab === 'subscription' && selectedSchool && (
                <div className="max-w-xl">
                  <SubscriptionStatus schoolId={selectedSchool.id} />
                </div>
              )}

              {settingsTab === 'school' && selectedSchool && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* UPI Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-display flex items-center gap-2">
                        <IndianRupee className="w-5 h-5" />
                        Payment Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="upi-id"
                            placeholder="school@upi"
                            defaultValue={selectedSchool.upi_id || ''}
                            onBlur={(e) => {
                              if (e.target.value !== selectedSchool.upi_id) {
                                updateAdminSchool.mutate({ id: selectedSchool.id, upi_id: e.target.value });
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Parents will use this UPI ID for payments
                        </p>
                      </div>
                      <div>
                        <Label>QR Code</Label>
                        <div className="mt-2">
                          {selectedSchool.upi_qr_code_url ? (
                            <div className="flex items-center gap-4">
                              <img 
                                src={selectedSchool.upi_qr_code_url} 
                                alt="UPI QR Code" 
                                className="w-32 h-32 rounded-lg border"
                              />
                              <div className="space-y-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Change QR Code
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg">
                              <QrCode className="w-12 h-12 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-3">No QR code uploaded</p>
                              <Button 
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload QR Code
                              </Button>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  // For simplicity, we'll use a data URL
                                  // In production, you'd upload to storage
                                  await updateAdminSchool.mutateAsync({ 
                                    id: selectedSchool.id, 
                                    upi_qr_code_url: reader.result as string 
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* School Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-display flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        School Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="school-name">School Name</Label>
                        <Input
                          id="school-name"
                          defaultValue={selectedSchool.name}
                          onBlur={(e) => {
                            if (e.target.value !== selectedSchool.name) {
                              updateAdminSchool.mutate({ id: selectedSchool.id, name: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-email">Email</Label>
                        <Input
                          id="school-email"
                          type="email"
                          defaultValue={selectedSchool.email || ''}
                          onBlur={(e) => {
                            if (e.target.value !== selectedSchool.email) {
                              updateAdminSchool.mutate({ id: selectedSchool.id, email: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-phone">Phone</Label>
                        <Input
                          id="school-phone"
                          defaultValue={selectedSchool.phone || ''}
                          onBlur={(e) => {
                            if (e.target.value !== selectedSchool.phone) {
                              updateAdminSchool.mutate({ id: selectedSchool.id, phone: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-address">Address</Label>
                        <Textarea
                          id="school-address"
                          defaultValue={selectedSchool.address || ''}
                          onBlur={(e) => {
                            if (e.target.value !== selectedSchool.address) {
                              updateAdminSchool.mutate({ id: selectedSchool.id, address: e.target.value });
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {settingsTab === 'account' && (
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
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Role</p>
                        <p className="text-sm text-muted-foreground capitalize">{role}</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {settingsTab === 'appearance' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Sun className="w-5 h-5" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
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
              )}

              {!selectedSchool && settingsTab === 'school' && (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg font-medium mb-2">No School Found</p>
                      <p>Please add a school first to manage settings.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Screenshot Preview Dialog */}
      <Dialog open={!!previewScreenshot} onOpenChange={() => setPreviewScreenshot(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {previewScreenshot && (
            <img 
              src={previewScreenshot} 
              alt="Payment screenshot full view" 
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editStudentOpen} onOpenChange={setEditStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!editingStudent) return;
            
            await updateStudent.mutateAsync({
              id: editingStudent.id,
              first_name: studentForm.first_name,
              last_name: studentForm.last_name,
              class: studentForm.class,
              section: studentForm.section || null,
              roll_number: studentForm.roll_number || null,
              parent_email: studentForm.parent_email || null,
              transport_charge: studentForm.transport_charge ? parseFloat(studentForm.transport_charge) : 0,
            });
            
            setEditStudentOpen(false);
            setEditingStudent(null);
            setStudentForm({ first_name: "", last_name: "", class: "", section: "", roll_number: "", parent_email: "", transport_charge: "" });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-first-name">First Name *</Label>
                <Input
                  id="edit-first-name"
                  value={studentForm.first_name}
                  onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-last-name">Last Name *</Label>
                <Input
                  id="edit-last-name"
                  value={studentForm.last_name}
                  onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-class">Class *</Label>
                <Input
                  id="edit-class"
                  value={studentForm.class}
                  onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-section">Section</Label>
                <Input
                  id="edit-section"
                  value={studentForm.section}
                  onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-roll-number">Roll Number</Label>
              <Input
                id="edit-roll-number"
                value={studentForm.roll_number}
                onChange={(e) => setStudentForm({ ...studentForm, roll_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-transport-charge">Transport Charge (₹/month)</Label>
              <Input
                id="edit-transport-charge"
                type="number"
                value={studentForm.transport_charge}
                onChange={(e) => setStudentForm({ ...studentForm, transport_charge: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-parent-email">Parent Email</Label>
              <Input
                id="edit-parent-email"
                type="email"
                value={studentForm.parent_email}
                onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateStudent.isPending}>
              {updateStudent.isPending ? "Updating..." : "Update Student"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Dialog */}
      <Dialog open={editFeeOpen} onOpenChange={setEditFeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee Structure</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!editingFee) return;
            
            await updateFee.mutateAsync({
              id: editingFee.id,
              name: feeForm.name,
              fee_type: feeForm.fee_type,
              amount: parseFloat(feeForm.amount),
              academic_year: feeForm.academic_year,
              description: feeForm.description || null,
              recurrence_type: feeForm.recurrence_type as any,
              due_date: feeForm.due_date || null,
            });
            
            setEditFeeOpen(false);
            setEditingFee(null);
            setFeeForm({ name: "", fee_type: "tuition", amount: "", academic_year: "2024-2025", description: "", recurrence_type: "monthly", due_date: "" });
          }} className="space-y-4">
            <div>
              <Label htmlFor="edit-fee-name">Fee Name *</Label>
              <Input
                id="edit-fee-name"
                value={feeForm.name}
                onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-fee-type">Fee Type *</Label>
              <Select
                value={feeForm.fee_type}
                onValueChange={(value: any) => setFeeForm({ ...feeForm, fee_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">Tuition</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="annually">Annual Fee</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-fee-amount">Amount (₹) *</Label>
              <Input
                id="edit-fee-amount"
                type="number"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-academic-year">Academic Year *</Label>
              <Input
                id="edit-academic-year"
                value={feeForm.academic_year}
                onChange={(e) => setFeeForm({ ...feeForm, academic_year: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-fee-description">Description</Label>
              <Input
                id="edit-fee-description"
                value={feeForm.description}
                onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateFee.isPending}>
              {updateFee.isPending ? "Updating..." : "Update Fee Structure"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
