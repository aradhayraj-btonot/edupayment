import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <title>About EduPay | Aradhay Raj Btonot - School Fee Payment Platform</title>
        <meta
          name="description"
          content="Learn about EduPay, the best school fee payment platform created by Aradhay Raj, founder of Btonot. Simplify fee collection with secure UPI payments, instant receipts, and real-time tracking for schools and parents."
        />
        <meta
          name="keywords"
          content="Aradhay Raj, Aradhay Raj Btonot, Btonot, EduPay, edu pay, school fee payment, pay school fees online, school fee management, young entrepreneur, teen founder, education technology, edtech India, school payments, fee collection software, student payments, online school fees"
        />
        <meta name="author" content="Aradhay Raj - Btonot" />
        <link rel="canonical" href="https://edupay.com/about" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About EduPay | Aradhay Raj Btonot - School Fee Payment" />
        <meta
          property="og:description"
          content="Discover EduPay by Aradhay Raj Btonot. The revolutionary school fee payment platform making fee collection simple and secure for schools and parents across India."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://edupay.com/about" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About EduPay | Aradhay Raj Btonot" />
        <meta
          name="twitter:description"
          content="Meet Aradhay Raj, founder of Btonot, creator of EduPay - the future of school fee payment in India."
        />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "EduPay by Aradhay Raj Btonot",
            description: "School fee payment platform by Aradhay Raj, founder of Btonot",
            founder: {
              "@type": "Person",
              name: "Aradhay Raj",
              jobTitle: "Founder & CEO",
              affiliation: "Btonot",
            },
            url: "https://edupay.com",
            sameAs: ["https://twitter.com/btonot"],
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
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Meet the Founder
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                The Visionary Behind EduPay
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Founder Image */}
                    <div className="bg-gradient-to-br from-primary via-primary/80 to-accent p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-primary-foreground/20 shadow-lg">
                        <img
                          src={founderImage}
                          alt="Aradhay Raj - Founder & CEO of BTONOT"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-primary-foreground mb-2">
                        Aradhay Raj
                      </h3>
                      <p className="text-primary-foreground/80 mb-1">Founder & CEO, BTONOT</p>
                      <p className="text-primary-foreground/60 text-sm mb-4">Full-Stack Developer · AI Researcher · Prompt Engineer</p>
                      <div className="flex items-center gap-3">
                        <a
                          href="https://www.linkedin.com/in/aradhay-raj"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                        >
                          <Linkedin className="w-5 h-5 text-primary-foreground" />
                        </a>
                        <a
                          href="https://github.com/aradhay-raj"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                        >
                          <Github className="w-5 h-5 text-primary-foreground" />
                        </a>
                        <a
                          href="https://instagram.com/aradhayrajofficial"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                        >
                          <Instagram className="w-5 h-5 text-primary-foreground" />
                        </a>
                        <a
                          href="mailto:aradhayrajbusiness@gmail.com"
                          className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                        >
                          <Mail className="w-5 h-5 text-primary-foreground" />
                        </a>
                        <a
                          href="https://aradhayraj.online"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5 text-primary-foreground" />
                        </a>
                      </div>
                    </div>

                    {/* Founder Bio */}
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Tech Visionary & Entrepreneur</span>
                      </div>
                      <h4 className="text-xl font-semibold text-foreground mb-4">
                        Building Next-Generation AI Companies
                      </h4>
                      <div className="space-y-4 text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Aradhay Raj</strong> is the Founder & CEO of{" "}
                          <strong className="text-primary">BTONOT</strong>, the parent company behind multiple
                          innovative technology and AI ventures driving digital transformation.
                        </p>
                        <p>
                          Starting his journey as a web and app developer, Aradhay expanded into artificial
                          intelligence, prompt engineering, research, and automation systems. He combines deep
                          technical skills with creative execution and strategic thinking.
                        </p>
                        <p>
                          EduPay is one of Aradhay's flagship products under BTONOT, born from observing
                          the challenges schools and parents face with fee management. His other ventures include{" "}
                          <strong className="text-foreground">Prodlink</strong> (social media platform),{" "}
                          <strong className="text-foreground">Nexbro AI</strong> (intelligent automation), and{" "}
                          <strong className="text-foreground">NexTrust AI</strong> (trust & decision support systems).
                        </p>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border">
                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div>
                            <Code className="w-5 h-5 text-primary mx-auto mb-2" />
                            <p className="text-xs font-medium text-foreground">Full-Stack Dev</p>
                          </div>
                          <div>
                            <Brain className="w-5 h-5 text-primary mx-auto mb-2" />
                            <p className="text-xs font-medium text-foreground">AI Research</p>
                          </div>
                          <div>
                            <Cpu className="w-5 h-5 text-primary mx-auto mb-2" />
                            <p className="text-xs font-medium text-foreground">Prompt Eng.</p>
                          </div>
                          <div>
                            <Rocket className="w-5 h-5 text-primary mx-auto mb-2" />
                            <p className="text-xs font-medium text-foreground">Startup Builder</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mt-12 text-center"
            >
              <blockquote className="text-xl md:text-2xl font-display italic text-muted-foreground">
                "To build human-centric, intelligent technology that solves real-world problems,
                empowers businesses and creators, and shapes the future of digital experiences through AI."
              </blockquote>
              <cite className="block mt-4 text-foreground font-medium">— Aradhay Raj, Founder & CEO of BTONOT</cite>
            </motion.div>
          </div>
        </section>

        {/* Technology Section */}
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
