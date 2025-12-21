import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useStudents, useCreateStudent } from "@/hooks/useStudents";
import { usePayments, usePaymentStats } from "@/hooks/usePayments";
import { useSchools, useCreateSchool } from "@/hooks/useSchools";
import { useFeeStructures, useCreateFeeStructure } from "@/hooks/useFees";
import { format } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addSchoolOpen, setAddSchoolOpen] = useState(false);
  const [addFeeOpen, setAddFeeOpen] = useState(false);

  // Data hooks
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const selectedSchool = schools[0];
  const { data: students = [], isLoading: studentsLoading } = useStudents(selectedSchool?.id);
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: paymentStats } = usePaymentStats();
  const { data: feeStructures = [] } = useFeeStructures(selectedSchool?.id);

  // Mutations
  const createStudent = useCreateStudent();
  const createSchool = useCreateSchool();
  const createFee = useCreateFeeStructure();

  // Form states
  const [studentForm, setStudentForm] = useState({
    first_name: "",
    last_name: "",
    class: "",
    section: "",
    roll_number: "",
    parent_email: "",
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
    fee_type: "tuition" as const,
    amount: "",
    academic_year: "2024-2025",
    description: "",
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
    });
    
    setStudentForm({ first_name: "", last_name: "", class: "", section: "", roll_number: "", parent_email: "" });
    setAddStudentOpen(false);
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSchool.mutateAsync({
      name: schoolForm.name,
      address: schoolForm.address || null,
      phone: schoolForm.phone || null,
      email: schoolForm.email || null,
      upi_id: schoolForm.upi_id || null,
      upi_qr_code_url: schoolForm.upi_qr_code_url || null,
    });
    
    setSchoolForm({ name: "", address: "", phone: "", email: "", upi_id: "", upi_qr_code_url: "" });
    setAddSchoolOpen(false);
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
    });
    
    setFeeForm({ name: "", fee_type: "tuition", amount: "", academic_year: "2024-2025", description: "" });
    setAddFeeOpen(false);
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
                {item.label}
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
                  {activeTab === "students" && `${students.length} students enrolled`}
                  {activeTab === "payments" && `${payments.length} total payments`}
                  {activeTab === "schools" && `${schools.length} schools registered`}
                  {activeTab === "fees" && `${feeStructures.length} fee structures`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-4 h-4" />
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
                <CardTitle className="text-lg font-display">Schools</CardTitle>
                <Dialog open={addSchoolOpen} onOpenChange={setAddSchoolOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add School
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New School</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSchool} className="space-y-4">
                      <div>
                        <Label htmlFor="school-name">School Name *</Label>
                        <Input
                          id="school-name"
                          value={schoolForm.name}
                          onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-address">Address</Label>
                        <Input
                          id="school-address"
                          value={schoolForm.address}
                          onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-phone">Phone</Label>
                        <Input
                          id="school-phone"
                          value={schoolForm.phone}
                          onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="school-email">Email</Label>
                        <Input
                          id="school-email"
                          type="email"
                          value={schoolForm.email}
                          onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                        />
                      </div>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-medium text-foreground mb-3">Payment Details</p>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="upi-id">UPI ID *</Label>
                            <Input
                              id="upi-id"
                              placeholder="e.g., school@upi"
                              value={schoolForm.upi_id}
                              onChange={(e) => setSchoolForm({ ...schoolForm, upi_id: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="qr-url">Payment QR Code URL</Label>
                            <Input
                              id="qr-url"
                              placeholder="https://..."
                              value={schoolForm.upi_qr_code_url}
                              onChange={(e) => setSchoolForm({ ...schoolForm, upi_qr_code_url: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={createSchool.isPending}>
                        {createSchool.isPending ? "Adding..." : "Add School"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {schoolsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : schools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No schools added yet. Add your first school to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schools.map((school) => (
                      <div
                        key={school.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{school.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {school.address || "No address"} • {school.email || "No email"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    ))}
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
                            {student.parent_email && (
                              <p className="text-xs text-primary/70 mt-1">
                                Parent: {student.parent_email}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={student.parent_id ? "default" : "secondary"}>
                          {student.parent_id ? "Linked" : "Pending"}
                        </Badge>
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
                          onValueChange={(value: any) => setFeeForm({ ...feeForm, fee_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tuition">Tuition</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="activities">Activities</SelectItem>
                            <SelectItem value="library">Library</SelectItem>
                            <SelectItem value="laboratory">Laboratory</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ₹{Number(fee.amount).toLocaleString('en-IN')}
                          </p>
                          <Badge variant={fee.is_active ? "default" : "secondary"}>
                            {fee.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(activeTab === "notifications" || activeTab === "settings") && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p>This feature is under development.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
