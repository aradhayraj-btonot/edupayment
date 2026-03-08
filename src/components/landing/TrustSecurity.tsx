import { motion } from "framer-motion";
import { Shield, Lock, Server, Eye, CheckCircle, Award } from "lucide-react";

const trustPoints = [
  {
    icon: Shield,
    title: "PCI-DSS Compliant",
    description: "All payment data is handled according to the highest security standards in the industry.",
  },
  {
    icon: Lock,
    title: "256-bit Encryption",
    description: "Bank-grade AES-256 encryption for all data at rest and TLS 1.3 for data in transit.",
  },
  {
    icon: Server,
    title: "99.9% Uptime SLA",
    description: "Enterprise-grade infrastructure with redundant servers and automated failover systems.",
  },
  {
    icon: Eye,
    title: "GDPR & Privacy",
    description: "Full compliance with data protection regulations. Your data is never sold or shared.",
  },
  {
    icon: CheckCircle,
    title: "Regular Audits",
    description: "Third-party security audits and penetration testing conducted quarterly.",
  },
  {
    icon: Award,
    title: "ISO 27001 Ready",
    description: "Following ISO 27001 information security management best practices.",
  },
];

const TrustSecurity = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
              Security & Trust
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Your Data is Safe With Us
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We understand that school financial data is sensitive. That's why we've built EduPay with 
              security at its core — from encrypted payments to role-based access controls.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {trustPoints.slice(0, 4).map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{point.title}</h4>
                    <p className="text-xs text-muted-foreground">{point.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise-Grade Security</h3>
                <p className="text-muted-foreground text-sm">Protecting ₹50Cr+ in transactions</p>
              </div>

              <div className="space-y-4">
                {trustPoints.map((point, index) => (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium">{point.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-success text-success-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg"
            >
              🔒 Secure
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustSecurity;
