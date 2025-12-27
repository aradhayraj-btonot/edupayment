import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Mail, Lock, User, Building, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, role, loading, roleLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    if (!loading && !roleLoading && user && role) {
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "parent") {
        navigate("/parent");
      }
    }
  }, [user, role, loading, roleLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent, userRole: "admin" | "parent") => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!formData.fullName.trim()) {
          toast.error("Please enter your full name");
          setIsLoading(false);
          return;
        }
        if (!acceptedTerms) {
          toast.error("Please accept the Terms and Conditions to continue");
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(formData.email, formData.password, formData.fullName, userRole);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully! You are now logged in.");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Login - EduPay School Fee Payment",
    "description": "Sign in to EduPay by Aradhay Raj Btonot to manage school fee payments online.",
    "publisher": {
      "@type": "Organization",
      "name": "Btonot",
      "founder": {
        "@type": "Person",
        "name": "Aradhay Raj"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - EduPay School Fee Payment | Aradhay Raj Btonot</title>
        <meta name="description" content="Sign in to EduPay by Aradhay Raj Btonot. Access your dashboard to pay school fees online with UPI, cards, and net banking." />
        <meta name="keywords" content="EduPay login, school fee payment login, Aradhay Raj, Btonot, edu pay sign in" />
        <link rel="canonical" href="https://edupay.com/login" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-info rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-primary-foreground">
              EduPay
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
              {isSignUp ? "Join EduPay!" : "Welcome back!"}
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              {isSignUp 
                ? "Create your account to start managing school fees efficiently."
                : "Access your dashboard to manage fees, track payments, and stay on top of your school's finances."
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid gap-4"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Building className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-primary-foreground font-medium">
                  500+ Schools
                </p>
                <p className="text-primary-foreground/60 text-sm">
                  Trust EduPay for fee management
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              EduPay
            </span>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h2>
            <p className="text-muted-foreground">
              Choose your role to continue
            </p>
          </div>

          <Tabs defaultValue="parent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="admin" className="gap-2">
                <Building className="w-4 h-4" />
                School Admin
              </TabsTrigger>
              <TabsTrigger value="parent" className="gap-2">
                <User className="w-4 h-4" />
                Parent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <form
                onSubmit={(e) => handleSubmit(e, "admin")}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@school.edu"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || isSignUp}
                >
                  {isLoading ? "Please wait..." : "Sign in as Admin"}
                </Button>
                {isSignUp && (
                  <p className="text-sm text-muted-foreground text-center">
                    Admin accounts are created by invitation only. Please contact your school administrator.
                  </p>
                )}
              </form>
            </TabsContent>

            <TabsContent value="parent">
              <form
                onSubmit={(e) => handleSubmit(e, "parent")}
                className="space-y-4"
              >
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="parent-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="parent-name"
                        type="text"
                        placeholder="Jane Doe"
                        className="pl-10"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="parent-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="parent-email"
                      type="email"
                      placeholder="parent@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="parent-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                {isSignUp && (
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline font-medium" target="_blank">
                        Terms and Conditions
                      </Link>
                    </Label>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || (isSignUp && !acceptedTerms)}
                >
                  {isLoading ? "Please wait..." : isSignUp ? "Create Parent Account" : "Sign in as Parent"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
};

export default Login;
