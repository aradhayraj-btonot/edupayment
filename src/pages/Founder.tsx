import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Mail, Linkedin, Github, Instagram, Globe, Rocket,
  Brain, Code, Smartphone, Sparkles, Target, Video, BarChart3,
  ExternalLink, Quote,
} from "lucide-react";
import founderImage from "@/assets/founder-aradhay-raj.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
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
  { name: "BTONOT", desc: "The parent company behind multiple innovative technology and AI ventures, driving digital transformation." },
  { name: "Prodlink", desc: "A social media web platform designed to connect people and foster meaningful digital interactions." },
  { name: "Nexbro AI", desc: "An AI-focused company delivering intelligent automation and AI solutions for modern businesses." },
  { name: "NexTrust AI", desc: "An AI system focused on trust, intelligence, and advanced decision support for critical operations." },
  { name: "EduPay", desc: "A seamless school fees payment app that simplifies fee collection for schools and payments for parents." },
];

const socials = [
  { icon: Mail, label: "Email", href: "mailto:aradhayrajbusiness@gmail.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/aradhay-raj" },
  { icon: Github, label: "GitHub", href: "https://github.com/aradhay-raj" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/aradhayrajofficial" },
  { icon: Globe, label: "Website", href: "https://aradhayraj.online" },
];

const Founder = () => (
  <>
    <Helmet>
      <title>Aradhay Raj – Founder & CEO | EduPay</title>
      <meta name="description" content="Meet Aradhay Raj, Founder & CEO of BTONOT and EduPay. Full-stack developer, AI researcher, and tech visionary building next-generation digital ecosystems." />
    </Helmet>

    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-2xl">
                <img src={founderImage} alt="Aradhay Raj" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center md:text-left">
              <Badge variant="secondary" className="mb-4">Founder & CEO of BTONOT</Badge>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">Aradhay Raj</h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-lg">
                Building next-generation AI companies and digital ecosystems
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {["Full-Stack Developer", "AI Researcher", "Prompt Engineer", "Tech Visionary"].map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8 text-center">
              The Story Behind the Vision
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
              <p>Aradhay Raj started his journey as a web developer and app developer, building scalable, modern digital products that push the boundaries of what's possible.</p>
              <p>Over time, his expertise expanded into artificial intelligence, prompt engineering, research, and automation systems. He combines deep technical skills with creative execution and strategic thinking.</p>
              <p>Today, as the Founder & CEO of BTONOT, Aradhay leads multiple innovative ventures focused on building intelligent technology that solves real-world problems and shapes the future of digital experiences.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ventures */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-center">
            Companies & Products
          </motion.h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Building innovative platforms that leverage AI to solve real-world problems and create meaningful digital experiences.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ventures.map((v, i) => (
              <motion.div key={v.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className={`h-full hover:shadow-lg transition-shadow ${v.name === "EduPay" ? "border-primary/50 bg-primary/5" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-lg">{v.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{v.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-display font-bold text-foreground mb-12 text-center">
            Skills & Capabilities
          </motion.h2>
          <div className="space-y-6">
            {skills.map((s, i) => (
              <motion.div key={s.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="flex items-center gap-3 mb-2">
                  <s.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="ml-auto text-sm text-muted-foreground">{s.level}%</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Quote className="w-10 h-10 text-primary/40 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl font-display text-foreground italic leading-relaxed mb-6">
              "To build human-centric, intelligent technology that solves real-world problems, empowers businesses and creators, and shapes the future of digital experiences through AI."
            </blockquote>
            <p className="text-muted-foreground">
              As a builder of next-generation AI companies and digital ecosystems, I'm committed to creating technology that doesn't just innovate — it transforms how we live, work, and connect.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Let's Build Together</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Interested in collaboration, investment opportunities, or just want to connect? I'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <s.icon className="w-4 h-4" />
                    {s.label}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  </>
);

export default Founder;
