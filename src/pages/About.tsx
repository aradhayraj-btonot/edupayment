import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  ArrowLeft,
  Users,
  Shield,
  Zap,
  Globe,
  Heart,
  Code,
  Rocket,
  Award,
  Linkedin,
  Github,
  Mail,
  Instagram,
  ExternalLink,
  Brain,
  Cpu,
} from "lucide-react";
import founderImage from "@/assets/founder-aradhay.png";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank-level security with encrypted transactions and PCI-DSS compliance.",
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Real-time payment verification and instant receipt generation.",
    },
    {
      icon: Users,
      title: "Parent-Friendly",
      description: "Intuitive interface designed for parents of all technical backgrounds.",
    },
    {
      icon: Globe,
      title: "Multi-School Support",
      description: "Manage multiple schools and students from a single dashboard.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Students Served" },
    { value: "50+", label: "Schools Onboarded" },
    { value: "₹1Cr+", label: "Payments Processed" },
    { value: "99.9%", label: "Uptime Guarantee" },
  ];

  return (
    <>
      <Helmet>
        <title>About EduPay | Aradhay Raj - Founder & CEO of BTONOT</title>
        <meta
          name="description"
          content="Meet Aradhay Raj, Founder & CEO of BTONOT — building EduPay and next-gen AI companies including Prodlink, Nexbro AI, and NexTrust AI."
        />
        <meta
          name="keywords"
          content="Aradhay Raj, BTONOT, EduPay, Prodlink, Nexbro AI, NexTrust AI, AI researcher, full-stack developer, edtech India"
        />
        <meta name="author" content="Aradhay Raj - BTONOT" />
        <link rel="canonical" href="https://edupayment.in/about" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About EduPay | Aradhay Raj — Founder of BTONOT" />
        <meta
          property="og:description"
          content="Meet Aradhay Raj, Founder & CEO of BTONOT — building EduPay and next-gen AI companies including Prodlink, Nexbro AI, and NexTrust AI."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://edupayment.in/about" />
        <meta property="og:image" content="https://edupayment.in/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About EduPay | Aradhay Raj - BTONOT" />
        <meta
          name="twitter:description"
          content="Meet Aradhay Raj, Founder & CEO of BTONOT — building next-generation AI companies and digital ecosystems. Creator of EduPay, Prodlink, Nexbro AI, and NexTrust AI."
        />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "BTONOT",
            description: "The parent company behind multiple innovative technology and AI ventures, driving digital transformation.",
            founder: {
              "@type": "Person",
              name: "Aradhay Raj",
              jobTitle: "Founder & CEO",
              url: "https://aradhayraj.online",
              sameAs: [
                "https://www.linkedin.com/in/aradhay-raj",
                "https://github.com/aradhay-raj",
                "https://instagram.com/aradhayrajofficial",
              ],
              knowsAbout: ["Full-Stack Development", "AI Research", "Prompt Engineering", "Startup Building"],
            },
            url: "https://edupay.com",
            sameAs: [
              "https://aradhayraj.online",
              "https://www.linkedin.com/in/aradhay-raj",
              "https://github.com/aradhay-raj",
            ],
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">EduPay</span>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                About EduPay
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
                Revolutionizing School
                <span className="text-primary"> Fee Management</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                EduPay is a cloud-based school fee management platform that simplifies fee collection, 
                payment tracking, and parent communication. Built with love for schools and families.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We believe that managing school finances should be simple, transparent, and stress-free 
                  for both schools and parents. Our mission is to bridge the gap between educational 
                  institutions and families through innovative technology.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  EduPay eliminates the hassle of manual fee collection, reduces administrative burden, 
                  and provides real-time visibility into payment status. We're committed to making 
                  education more accessible by removing financial friction.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Made with Love</p>
                    <p className="text-sm text-muted-foreground">For schools and families worldwide</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {features.map((feature, index) => (
                  <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section id="founder" className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Meet the Founder
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  The Visionary Behind EduPay
                </h2>
              </div>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-8">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-lg shrink-0">
                      <img
                        src={founderImage}
                        alt="Aradhay Raj - Founder & CEO of BTONOT"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-2xl font-display font-bold text-foreground mb-1">Aradhay Raj</h3>
                      <p className="text-muted-foreground mb-1">Founder & CEO, BTONOT</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Full-Stack Developer · AI Researcher · Prompt Engineer · Tech Visionary
                      </p>
                      <p className="text-muted-foreground text-sm mb-4">
                        Building next-generation AI companies and digital ecosystems that solve real-world problems.
                      </p>
                      <Link to="/founder">
                        <Button variant="default" className="gap-2">
                          View Full Profile
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <blockquote className="text-center mt-10 text-xl md:text-2xl font-display italic text-muted-foreground">
                "To build human-centric, intelligent technology that solves real-world problems,
                empowers businesses and creators, and shapes the future of digital experiences through AI."
              </blockquote>
              <cite className="block mt-4 text-center text-foreground font-medium">— Aradhay Raj, Founder & CEO of BTONOT</cite>
            </motion.div>
          </div>
        </section>

        {/* Ventures Section */}
        <section className="py-20 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                BTONOT Ventures
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Companies & Products
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Building innovative platforms that leverage AI to solve real-world problems and create meaningful digital experiences.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "BTONOT",
                  description: "The parent company behind multiple innovative technology and AI ventures, driving digital transformation.",
                  icon: Rocket,
                  color: "from-primary to-accent",
                  highlight: true,
                },
                {
                  name: "EduPay",
                  description: "A seamless school fees payment app that simplifies fee collection for schools and payments for parents.",
                  icon: GraduationCap,
                  color: "from-success to-primary",
                  highlight: false,
                },
                {
                  name: "Prodlink",
                  description: "A social media web platform designed to connect people and foster meaningful digital interactions.",
                  icon: Users,
                  color: "from-info to-primary",
                  highlight: false,
                },
                {
                  name: "Nexbro AI",
                  description: "An AI-focused company delivering intelligent automation and AI solutions for modern businesses.",
                  icon: Brain,
                  color: "from-accent to-primary",
                  highlight: false,
                },
              ].map((venture, index) => (
                <motion.div
                  key={venture.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${venture.highlight ? 'border-primary/30 shadow-lg' : ''}`}>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${venture.color} flex items-center justify-center mb-4`}>
                        <venture.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-foreground mb-2">
                        {venture.name}
                        {venture.highlight && (
                          <Badge variant="secondary" className="ml-2 text-xs">Parent Co.</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground flex-1">{venture.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* NexTrust AI - featured */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto mt-6"
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-accent/20">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-accent flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-foreground mb-1">NexTrust AI</h3>
                    <p className="text-sm text-muted-foreground">
                      An AI system focused on trust, intelligence, and advanced decision support for critical operations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Built with Modern Technology
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                EduPay is built using cutting-edge technologies to ensure security, 
                reliability, and the best user experience.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  title: "React & TypeScript",
                  description: "Modern frontend built with React and TypeScript for a robust, type-safe codebase.",
                },
                {
                  title: "Cloud Infrastructure",
                  description: "Powered by cloud services ensuring 99.9% uptime and global availability.",
                },
                {
                  title: "Bank-Level Security",
                  description: "End-to-end encryption and secure payment processing with industry standards.",
                },
              ].map((tech, index) => (
                <motion.div
                  key={tech.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-foreground mb-2">{tech.title}</h3>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">
                Ready to Transform Your School's Fee Management?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join thousands of schools and parents who trust EduPay for their fee management needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/#contact">
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground text-primary-foreground py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display font-bold">EduPay by Btonot</span>
              </div>
              <p className="text-primary-foreground/60 text-sm">
                © 2024 Btonot. Created by Aradhay Raj. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default About;
