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
  useUpdateSubscription,
  useDeleteSubscription,
  useGrantFreeSubscription,
  useCreateAdmin,
  useCreateSchoolWithAdmins,
  type AdminInput,
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
  Edit,
  Trash2,
  Package,
  Gift,
} from 'lucide-react';
import { Bell } from 'lucide-react';
import { SendPushNotificationDialog } from '@/components/notifications/SendPushNotificationDialog';
import { TeamTicketManager } from '@/components/support/TeamTicketManager';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [customPlan, setCustomPlan] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [customAmount, setCustomAmount] = useState('');
  const [customDuration, setCustomDuration] = useState('12');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminSchool, setAdminSchool] = useState('');
  
  // Create school with admins state
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');
  const [newSchoolAdmins, setNewSchoolAdmins] = useState<AdminInput[]>([
    { email: '', password: '', fullName: '' }
  ]);

  const { data: stats, isLoading: statsLoading } = useTeamStats();
  const { data: schools, isLoading: schoolsLoading } = useAllSchools();
  const { data: parents, isLoading: parentsLoading } = useAllParents();
  const { data: admins, isLoading: adminsLoading } = useAllAdmins();
  const { data: payments, isLoading: paymentsLoading } = useAllPayments();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useAllSubscriptions();
  const createSubscription = useCreateCustomSubscription();
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();
  const grantFreeSubscription = useGrantFreeSubscription();
  const createAdmin = useCreateAdmin();
  const createSchoolWithAdmins = useCreateSchoolWithAdmins();
  
  // Edit subscription state
  const [editSubscriptionDialogOpen, setEditSubscriptionDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [editPlan, setEditPlan] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [editAmount, setEditAmount] = useState('');
  const [editDuration, setEditDuration] = useState('12');
  const [editStatus, setEditStatus] = useState<'active' | 'expired' | 'cancelled' | 'pending'>('active');
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<any>(null);

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

  const handleAddAdminField = () => {
    setNewSchoolAdmins([...newSchoolAdmins, { email: '', password: '', fullName: '' }]);
  };

  const handleRemoveAdminField = (index: number) => {
    if (newSchoolAdmins.length > 1) {
      setNewSchoolAdmins(newSchoolAdmins.filter((_, i) => i !== index));
    }
  };

  const handleUpdateAdminField = (index: number, field: keyof AdminInput, value: string) => {
    const updated = [...newSchoolAdmins];
    updated[index] = { ...updated[index], [field]: value };
    setNewSchoolAdmins(updated);
  };

  const handleCreateSchoolWithAdmins = () => {
    if (!newSchoolName.trim()) {
      toast.error('Please enter school name');
      return;
    }

    const validAdmins = newSchoolAdmins.filter(a => a.email && a.password && a.fullName);
    if (validAdmins.length === 0) {
      toast.error('Please add at least one admin with all fields filled');
      return;
    }

    createSchoolWithAdmins.mutate({
      name: newSchoolName,
      address: newSchoolAddress || undefined,
      phone: newSchoolPhone || undefined,
      email: newSchoolEmail || undefined,
      admins: validAdmins,
    }, {
      onSuccess: () => {
        setSchoolDialogOpen(false);
        setNewSchoolName('');
        setNewSchoolAddress('');
        setNewSchoolPhone('');
        setNewSchoolEmail('');
        setNewSchoolAdmins([{ email: '', password: '', fullName: '' }]);
      }
    });
  };

  const handleOpenEditSubscription = (subscription: any) => {
    setEditingSubscription(subscription);
    setEditPlan(subscription.plan);
    setEditAmount(subscription.amount?.toString() || '');
    setEditStatus(subscription.status);
    setEditDuration('12');
    setEditSubscriptionDialogOpen(true);
  };

  const handleUpdateSubscription = () => {
    if (!editingSubscription) return;

    updateSubscription.mutate({
      subscriptionId: editingSubscription.id,
      plan: editPlan,
      amount: parseFloat(editAmount),
      durationMonths: parseInt(editDuration),
      status: editStatus,
    }, {
      onSuccess: () => {
        setEditSubscriptionDialogOpen(false);
        setEditingSubscription(null);
      }
    });
  };

  const handleDeleteSubscription = () => {
    if (!subscriptionToDelete) return;

    deleteSubscription.mutate({
      subscriptionId: subscriptionToDelete.id,
      schoolId: subscriptionToDelete.school_id,
    }, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSubscriptionToDelete(null);
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
          <TabsList className="grid grid-cols-8 w-full max-w-6xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="parents">Parents</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                <div className="flex items-center gap-2">
                  <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add School
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New School</DialogTitle>
                        <DialogDescription>
                          Create a new school with one or more admin accounts.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        {/* School Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm">School Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>School Name *</Label>
                              <Input
                                value={newSchoolName}
                                onChange={(e) => setNewSchoolName(e.target.value)}
                                placeholder="Enter school name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={newSchoolEmail}
                                onChange={(e) => setNewSchoolEmail(e.target.value)}
                                placeholder="school@example.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <Input
                                value={newSchoolPhone}
                                onChange={(e) => setNewSchoolPhone(e.target.value)}
                                placeholder="Phone number"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Address</Label>
                              <Input
                                value={newSchoolAddress}
                                onChange={(e) => setNewSchoolAddress(e.target.value)}
                                placeholder="School address"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Admin Accounts */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Admin Accounts</h4>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddAdminField}>
                              <Plus className="w-4 h-4 mr-1" />
                              Add Admin
                            </Button>
                          </div>
                          
                          {newSchoolAdmins.map((admin, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Admin #{index + 1}</span>
                                {newSchoolAdmins.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAdminField(index)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Full Name *</Label>
                                  <Input
                                    value={admin.fullName}
                                    onChange={(e) => handleUpdateAdminField(index, 'fullName', e.target.value)}
                                    placeholder="Full name"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Email *</Label>
                                  <Input
                                    type="email"
                                    value={admin.email}
                                    onChange={(e) => handleUpdateAdminField(index, 'email', e.target.value)}
                                    placeholder="admin@example.com"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Password *</Label>
                                  <Input
                                    type="password"
                                    value={admin.password}
                                    onChange={(e) => handleUpdateAdminField(index, 'password', e.target.value)}
                                    placeholder="Password"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button 
                          className="w-full" 
                          onClick={handleCreateSchoolWithAdmins}
                          disabled={createSchoolWithAdmins.isPending}
                        >
                          {createSchoolWithAdmins.isPending ? 'Creating...' : 'Create School with Admins'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subscription
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : schools?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No schools found</TableCell>
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
                            {school.school_subscriptions?.[0]?.amount !== undefined
                              ? school.school_subscriptions[0].amount === 0 
                                ? 'Free' 
                                : formatCurrency(school.school_subscriptions[0].amount)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => grantFreeSubscription.mutate({ schoolId: school.id })}
                              disabled={grantFreeSubscription.isPending || school.school_subscriptions?.[0]?.status === 'active'}
                              className="gap-1"
                            >
                              <Gift className="w-3 h-3" />
                              {school.school_subscriptions?.[0]?.status === 'active' ? 'Active' : 'Give Free'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Custom Subscriptions
                  </CardTitle>
                  <CardDescription>Manage all custom subscription plans created for schools</CardDescription>
                </div>
                <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Plan
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : subscriptions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No subscriptions found</TableCell>
                      </TableRow>
                    ) : (
                      subscriptions?.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.schools?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{sub.plan}</Badge>
                          </TableCell>
                          <TableCell className="font-bold">{formatCurrency(sub.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={sub.status === 'active' ? 'default' : sub.status === 'pending' ? 'secondary' : 'destructive'}>
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{sub.starts_at ? format(new Date(sub.starts_at), 'PP') : '-'}</TableCell>
                          <TableCell>{sub.expires_at ? format(new Date(sub.expires_at), 'PP') : '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenEditSubscription(sub)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setSubscriptionToDelete(sub);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Subscription Dialog */}
            <Dialog open={editSubscriptionDialogOpen} onOpenChange={setEditSubscriptionDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Subscription</DialogTitle>
                  <DialogDescription>
                    Update subscription for {editingSubscription?.schools?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Plan Type</Label>
                    <Select value={editPlan} onValueChange={(v) => setEditPlan(v as any)}>
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
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editStatus} onValueChange={(v) => setEditStatus(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Extend Duration (months from now)</Label>
                    <Select value={editDuration} onValueChange={setEditDuration}>
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
                    onClick={handleUpdateSubscription}
                    disabled={updateSubscription.isPending}
                  >
                    {updateSubscription.isPending ? 'Updating...' : 'Update Subscription'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the subscription for {subscriptionToDelete?.schools?.name}? 
                    This will deactivate their access to the platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteSubscription}
                    disabled={deleteSubscription.isPending}
                  >
                    {deleteSubscription.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Send instant push notifications to all subscribed users across all schools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">About Push Notifications</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Push notifications appear at the OS level, even when the browser is closed</li>
                      <li>• Users must enable notifications in their browser to receive them</li>
                      <li>• Works on Chrome, Edge, Firefox (desktop and Android)</li>
                      <li>• Notifications are sent only to users who have subscribed</li>
                    </ul>
                  </div>
                  <SendPushNotificationDialog />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <TeamTicketManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeamDashboard;
