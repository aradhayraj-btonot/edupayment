import { motion } from "framer-motion";
import {
  CreditCard,
  Bell,
  BarChart3,
  Shield,
  Users,
  Receipt,
  Smartphone,
  Clock,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: CreditCard,
      title: "Multi-Gateway Payments",
      description:
        "Accept payments via UPI, cards, net banking, and wallets with Razorpay & Stripe integration.",
      color: "bg-info/10 text-info",
    },
    {
      icon: Bell,
      title: "Automated Reminders",
      description:
        "Send SMS, email, and WhatsApp notifications for due dates, payments, and receipts.",
      color: "bg-warning/10 text-warning",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Track collections, pending fees, and generate comprehensive financial reports instantly.",
      color: "bg-success/10 text-success",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description:
        "PCI-DSS compliant platform with encrypted transactions and secure data storage.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description:
        "Separate dashboards for admins, parents, and students with appropriate permissions.",
      color: "bg-coral/10 text-coral",
    },
    {
      icon: Receipt,
      title: "Instant Receipts",
      description:
        "Auto-generate and email payment receipts with school branding and QR codes.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description:
        "Fully responsive platform with dedicated mobile apps for iOS and Android.",
      color: "bg-info/10 text-info",
    },
    {
      icon: Clock,
      title: "Flexible Payment Plans",
      description:
        "Support installments, partial payments, late fees, and scholarship discounts.",
      color: "bg-warning/10 text-warning",
    },
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need to Manage School Fees
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of tools designed to simplify fee collection,
            payment tracking, and financial management.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
