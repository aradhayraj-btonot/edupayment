import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Mail, Linkedin, Github, Instagram, Globe, Rocket,
  Brain, Code, Smartphone, Sparkles, Target, Video, BarChart3,
  ExternalLink, Quote, Users, Shield, GraduationCap, Cpu,
} from "lucide-react";
import founderImage from "@/assets/founder-aradhay-raj.png";

const customEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: customEase },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: customEase },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: customEase },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: customEase },
  },
};

const skills = [
  { name: "Web Development", level: 95, icon: Code },
  { name: "Mobile App Development", level: 88, icon: Smartphone },
  { name: "AI Research & Development", level: 92, icon: Brain },
  { name: "Prompt Engineering", level: 96, icon: Sparkles },
  { name: "System Architecture", level: 85, icon: Target },
  { name: "Commercial Video Creation", level: 80, icon: Video },
  { name: "Startup Building", level: 90, icon: Rocket },
  { name: "Product Strategy", level: 87, icon: BarChart3 },
];

const ventures = [
  { name: "BTONOT", desc: "The parent company behind multiple innovative technology and AI ventures, driving digital transformation.", icon: Rocket, color: "from-primary to-accent" },
  { name: "Prodlink", desc: "A social media web platform designed to connect people and foster meaningful digital interactions.", icon: Users, color: "from-blue-500 to-cyan-500" },
  { name: "Nexbro AI", desc: "An AI-focused company delivering intelligent automation and AI solutions for modern businesses.", icon: Brain, color: "from-violet-500 to-purple-500" },
  { name: "NexTrust AI", desc: "An AI system focused on trust, intelligence, and advanced decision support for critical operations.", icon: Shield, color: "from-amber-500 to-orange-500" },
  { name: "EduPay", desc: "A seamless school fees payment app that simplifies fee collection for schools and payments for parents.", icon: GraduationCap, color: "from-emerald-500 to-teal-500" },
];

const socials = [
  { icon: Mail, label: "Email", href: "mailto:aradhayrajbusiness@gmail.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/aradhay-raj" },
  { icon: Github, label: "GitHub", href: "https://github.com/aradhay-raj" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/aradhayrajofficial" },
  { icon: Globe, label: "Website", href: "https://aradhayraj.online" },
];

const roles = ["Full-Stack Developer", "AI Researcher", "Prompt Engineer", "Tech Visionary"];

const ParallaxSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

const Founder = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  return (
    <>
      <Helmet>
        <title>Aradhay Raj – Founder & CEO | EduPay</title>
        <meta name="description" content="Meet Aradhay Raj, Founder & CEO of BTONOT and EduPay. Full-stack developer, AI researcher, and tech visionary building next-generation digital ecosystems." />
      </Helmet>

      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Nav */}
        <motion.nav
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
        >
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <motion.span whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 400 }}>
                <ArrowLeft className="w-4 h-4" />
              </motion.span>
              Back to Home
            </Link>
          </div>
        </motion.nav>

        {/* Hero with parallax */}
        <section ref={heroRef} className="relative py-24 md:py-36 overflow-hidden">
          {/* Animated background blobs */}
          <motion.div
            className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="container mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
              {/* Photo with animated ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 relative"
              >
                <motion.div
                  className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 blur-sm"
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-2xl">
                  <img src={founderImage} alt="Aradhay Raj" className="w-full h-full object-cover" />
                </div>
                {/* Floating badge */}
                <motion.div
                  className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                >
                  🚀 CEO
                </motion.div>
              </motion.div>

              {/* Text content with staggered entrance */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="text-center md:text-left"
              >
                <motion.div variants={fadeUp}>
                  <Badge variant="secondary" className="mb-4 animate-pulse">Founder & CEO of BTONOT</Badge>
                </motion.div>
                <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-4">
                  Aradhay{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite]">
                    Raj
                  </span>
                </motion.h1>
                <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-6 max-w-lg">
                  Building next-generation AI companies and digital ecosystems
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {roles.map((t, i) => (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.12, duration: 0.4 }}
                      whileHover={{ scale: 1.08, y: -2 }}
                    >
                      <Badge variant="outline" className="cursor-default transition-colors hover:bg-primary/10">
                        {t}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Story */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-10 text-center">
                The Story Behind{" "}
                <span className="text-primary">the Vision</span>
              </motion.h2>
              {[
                "Aradhay Raj started his journey as a web developer and app developer, building scalable, modern digital products that push the boundaries of what's possible.",
                "Over time, his expertise expanded into artificial intelligence, prompt engineering, research, and automation systems. He combines deep technical skills with creative execution and strategic thinking.",
                "Today, as the Founder & CEO of BTONOT, Aradhay leads multiple innovative ventures focused on building intelligent technology that solves real-world problems and shapes the future of digital experiences.",
              ].map((text, i) => (
                <motion.p
                  key={i}
                  variants={i % 2 === 0 ? slideRight : slideLeft}
                  className="text-muted-foreground leading-relaxed text-lg mb-5 last:mb-0"
                >
                  {text}
                </motion.p>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Ventures */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Portfolio
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                Companies & Products
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Building innovative platforms that leverage AI to solve real-world problems.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {ventures.map((v) => (
                <motion.div
                  key={v.name}
                  variants={fadeScale}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className={`h-full group cursor-default overflow-hidden transition-all duration-300 hover:shadow-xl ${v.name === "EduPay" ? "border-primary/50 ring-2 ring-primary/20" : "hover:border-primary/30"}`}>
                    <CardContent className="p-6 relative">
                      {/* Gradient accent top */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${v.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                        <v.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                        {v.name}
                        {v.name === "EduPay" && <Badge variant="secondary" className="text-[10px]">This App</Badge>}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Skills */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-14 text-center">
                Skills & <span className="text-primary">Capabilities</span>
              </motion.h2>
              <div className="space-y-7">
                {skills.map((s, i) => (
                  <motion.div
                    key={s.name}
                    variants={fadeUp}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"
                      >
                        <s.icon className="w-5 h-5 text-primary" />
                      </motion.div>
                      <span className="font-semibold text-foreground">{s.name}</span>
                      <motion.span
                        className="ml-auto text-sm font-bold text-primary"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                      >
                        {s.level}%
                      </motion.span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent relative"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.1, repeatDelay: 3 }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="container mx-auto px-4 max-w-3xl text-center relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.div variants={fadeScale}>
                <Quote className="w-14 h-14 text-primary/30 mx-auto mb-8" />
              </motion.div>
              <motion.blockquote
                variants={fadeUp}
                className="text-2xl md:text-3xl font-display text-foreground italic leading-relaxed mb-8"
              >
                "To build human-centric, intelligent technology that solves real-world problems, empowers businesses and creators, and shapes the future of digital experiences through AI."
              </motion.blockquote>
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
                <div className="w-px h-8 bg-primary/30" />
                <p className="text-muted-foreground text-lg">
                  As a builder of next-generation AI companies, I'm committed to creating technology that doesn't just innovate — it <span className="text-primary font-semibold">transforms</span> how we live, work, and connect.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                Let's Build <span className="text-primary">Together</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
                Interested in collaboration, investment opportunities, or just want to connect? I'd love to hear from you.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
                {socials.map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="lg" className="gap-2 shadow-sm hover:shadow-md transition-shadow">
                      <s.icon className="w-5 h-5" />
                      {s.label}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </Button>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Gradient shift keyframe */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `}</style>
    </>
  );
};

export default Founder;
