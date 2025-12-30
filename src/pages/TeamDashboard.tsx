import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { 
  useTeamStats, 
  useAllSchools, 
  useAllParents, 
  useAllAdmins, 
  useAllPayments,
  useAllSubscriptions,
  useCreateCustomSubscription,
  useCreateAdmin,
} from '@/hooks/useTeamData';
import { 
  GraduationCap, 
  Users, 
  CreditCard, 
  Building2, 
  LogOut, 
  Shield,
  TrendingUp,
  UserCheck,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Search,
  Plus,
  MessageSquare,
  HeadphonesIcon,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [customPlan, setCustomPlan] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [customAmount, setCustomAmount] = useState('');
  const [customDuration, setCustomDuration] = useState('12');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminSchool, setAdminSchool] = useState('');

  const { data: stats, isLoading: statsLoading } = useTeamStats();
  const { data: schools, isLoading: schoolsLoading } = useAllSchools();
  const { data: parents, isLoading: parentsLoading } = useAllParents();
  const { data: admins, isLoading: adminsLoading } = useAllAdmins();
  const { data: payments, isLoading: paymentsLoading } = useAllPayments();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useAllSubscriptions();
  const createSubscription = useCreateCustomSubscription();
  const createAdmin = useCreateAdmin();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleCreateSubscription = () => {
    if (!selectedSchool || !customAmount) {
      toast.error('Please fill all fields');
      return;
    }

    createSubscription.mutate({
      schoolId: selectedSchool,
      plan: customPlan,
      amount: parseFloat(customAmount),
      durationMonths: parseInt(customDuration),
    });

    setSubscriptionDialogOpen(false);
    setSelectedSchool('');
    setCustomAmount('');
  };

  const handleCreateAdmin = () => {
    if (!adminEmail || !adminPassword || !adminFullName || !adminSchool) {
      toast.error('Please fill all fields');
      return;
    }

    createAdmin.mutate({
      email: adminEmail,
      password: adminPassword,
      fullName: adminFullName,
      schoolId: adminSchool,
    }, {
      onSuccess: () => {
        setAdminDialogOpen(false);
        setAdminEmail('');
        setAdminPassword('');
        setAdminFullName('');
        setAdminSchool('');
      }
    });
  };

  const filteredParents = parents?.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins?.filter(a => 
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">EduPay Team</h1>
              <p className="text-xs text-muted-foreground">Administrative Control Panel</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Schools', value: stats?.totalSchools || 0, icon: Building2, color: 'bg-blue-500' },
            { label: 'Total Parents', value: stats?.totalParents || 0, icon: Users, color: 'bg-green-500' },
            { label: 'Total Admins', value: stats?.totalAdmins || 0, icon: UserCheck, color: 'bg-purple-500' },
            { label: 'Total Payments', value: stats?.totalPayments || 0, icon: CreditCard, color: 'bg-orange-500' },
            { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-emerald-500' },
            { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: TrendingUp, color: 'bg-pink-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="parents">Parents</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Recent Schools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {schoolsLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : (
                    <div className="space-y-3">
                      {schools?.slice(0, 5).map((school) => (
                        <div key={school.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{school.name}</p>
                            <p className="text-xs text-muted-foreground">{school.email}</p>
                          </div>
                          <Badge variant={school.school_subscriptions?.[0]?.status === 'active' ? 'default' : 'secondary'}>
                            {school.school_subscriptions?.[0]?.status || 'No Subscription'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : (
                    <div className="space-y-3">
                      {payments?.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{payment.students?.first_name} {payment.students?.last_name}</p>
                            <p className="text-xs text-muted-foreground">{payment.students?.schools?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(payment.amount)}</p>
                            <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Custom Subscription</DialogTitle>
                      <DialogDescription>
                        Grant a custom subscription to a school with a custom price.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Select School</Label>
                        <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools?.map((school) => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Plan Type</Label>
                        <Select value={customPlan} onValueChange={(v) => setCustomPlan(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Custom Amount (₹)</Label>
                        <Input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (months)</Label>
                        <Select value={customDuration} onValueChange={setCustomDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                            <SelectItem value="24">24 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleCreateSubscription}
                        disabled={createSubscription.isPending}
                      >
                        {createSubscription.isPending ? 'Creating...' : 'Create Subscription'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={() => setActiveTab('support')}>
                  <HeadphonesIcon className="w-4 h-4 mr-2" />
                  View Support Tickets
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Schools</CardTitle>
                  <CardDescription>Manage all registered schools</CardDescription>
                </div>
                <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subscription
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : schools?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No schools found</TableCell>
                      </TableRow>
                    ) : (
                      schools?.map((school) => (
                        <TableRow key={school.id}>
                          <TableCell className="font-medium">{school.name}</TableCell>
                          <TableCell>{school.email || '-'}</TableCell>
                          <TableCell>{school.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={school.school_subscriptions?.[0]?.status === 'active' ? 'default' : 'secondary'}>
                              {school.school_subscriptions?.[0]?.plan || 'None'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {school.school_subscriptions?.[0]?.expires_at 
                              ? format(new Date(school.school_subscriptions[0].expires_at), 'PP')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {school.school_subscriptions?.[0]?.amount 
                              ? formatCurrency(school.school_subscriptions[0].amount)
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Parent Accounts</CardTitle>
                    <CardDescription>View all registered parent accounts</CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search parents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : filteredParents?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No parents found</TableCell>
                      </TableRow>
                    ) : (
                      filteredParents?.map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell className="font-medium">{parent.full_name}</TableCell>
                          <TableCell>
                            <a href={`mailto:${parent.email}`} className="flex items-center gap-1 text-primary hover:underline">
                              <Mail className="w-3 h-3" />
                              {parent.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {parent.phone ? (
                              <a href={`tel:${parent.phone}`} className="flex items-center gap-1 hover:underline">
                                <Phone className="w-3 h-3" />
                                {parent.phone}
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{parent.studentCount} students</Badge>
                          </TableCell>
                          <TableCell>{format(new Date(parent.created_at), 'PP')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Admin Accounts</CardTitle>
                    <CardDescription>View and manage school administrator accounts</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search admins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Admin Account</DialogTitle>
                          <DialogDescription>
                            Create a new administrator account for a school.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              value={adminFullName}
                              onChange={(e) => setAdminFullName(e.target.value)}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                              type="password"
                              value={adminPassword}
                              onChange={(e) => setAdminPassword(e.target.value)}
                              placeholder="Enter password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Select School</Label>
                            <Select value={adminSchool} onValueChange={setAdminSchool}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a school" />
                              </SelectTrigger>
                              <SelectContent>
                                {schools?.map((school) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={handleCreateAdmin}
                            disabled={createAdmin.isPending}
                          >
                            {createAdmin.isPending ? 'Creating...' : 'Create Admin Account'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : filteredAdmins?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No admins found</TableCell>
                      </TableRow>
                    ) : (
                      filteredAdmins?.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.full_name}</TableCell>
                          <TableCell>
                            <a href={`mailto:${admin.email}`} className="flex items-center gap-1 text-primary hover:underline">
                              <Mail className="w-3 h-3" />
                              {admin.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {admin.phone ? (
                              <a href={`tel:${admin.phone}`} className="flex items-center gap-1 hover:underline">
                                <Phone className="w-3 h-3" />
                                {admin.phone}
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{admin.schoolName}</Badge>
                          </TableCell>
                          <TableCell>{format(new Date(admin.created_at), 'PP')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>All Payment History</CardTitle>
                <CardDescription>Complete payment history across all schools</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : payments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No payments found</TableCell>
                      </TableRow>
                    ) : (
                      payments?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.students?.first_name} {payment.students?.last_name}
                          </TableCell>
                          <TableCell>{payment.students?.schools?.name || '-'}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>
                            <Badge variant={
                              payment.status === 'completed' ? 'default' : 
                              payment.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.created_at ? format(new Date(payment.created_at), 'PP') : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeadphonesIcon className="w-5 h-5" />
                    Customer Support
                  </CardTitle>
                  <CardDescription>Help and support management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Support Email</h4>
                    <a href="mailto:aradhayrajbusiness@gmail.com" className="text-primary hover:underline">
                      aradhayrajbusiness@gmail.com
                    </a>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Support Phone</h4>
                    <a href="tel:+919708565215" className="text-primary hover:underline">
                      +91 9708565215
                    </a>
                  </div>
                  <Button className="w-full" onClick={() => window.open('mailto:aradhayrajbusiness@gmail.com')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Compose Support Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Support Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('schools')}>
                    <Building2 className="w-4 h-4 mr-2" />
                    View School Issues
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('payments')}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Review Payment Problems
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setSubscriptionDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Grant Custom Subscription
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('parents')}>
                    <Users className="w-4 h-4 mr-2" />
                    Find Parent Account
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('admins')}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Find Admin Account
                  </Button>
                </CardContent>
              </Card>

              {/* Subscriptions Overview */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>All Subscriptions</CardTitle>
                  <CardDescription>Subscription management across all schools</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptionsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                        </TableRow>
                      ) : subscriptions?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">No subscriptions found</TableCell>
                        </TableRow>
                      ) : (
                        subscriptions?.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.schools?.name}</TableCell>
                            <TableCell>
                              <Badge>{sub.plan}</Badge>
                            </TableCell>
                            <TableCell className="font-bold">{formatCurrency(sub.amount)}</TableCell>
                            <TableCell>
                              <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                {sub.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(sub.starts_at), 'PP')}</TableCell>
                            <TableCell>{format(new Date(sub.expires_at), 'PP')}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeamDashboard;
