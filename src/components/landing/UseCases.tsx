import { motion } from "framer-motion";
import {
  GraduationCap,
  Building2,
  Users,
  Wallet,
  BookOpen,
  Bus,
  Trophy,
  Microscope,
} from "lucide-react";

const useCases = [
  {
    icon: GraduationCap,
    title: "K-12 Schools",
    description: "Complete fee management for primary and secondary schools with class-wise fee structures and parent portals.",
    stats: "300+ K-12 schools",
  },
  {
    icon: Building2,
    title: "School Chains",
    description: "Multi-branch management with centralized reporting, unified dashboards, and branch-level controls.",
    stats: "15+ school chains",
  },
  {
    icon: BookOpen,
    title: "Coaching Institutes",
    description: "Manage batch-wise fees, installment plans, and scholarship tracking for coaching centers.",
    stats: "50+ institutes",
  },
  {
    icon: Bus,
    title: "Transport Fees",
    description: "Route-wise transport fee management with per-student charges and automated billing cycles.",
    stats: "Auto-calculated",
  },
  {
    icon: Trophy,
    title: "Activity & Sports Fees",
    description: "Manage extracurricular, sports, and activity-specific fees separately with easy opt-in for parents.",
    stats: "Custom categories",
  },
  {
    icon: Microscope,
    title: "Lab & Library Fees",
    description: "Track lab deposits, library fees, and other one-time charges with refund management built-in.",
    stats: "Full tracking",
  },
];

const UseCases = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-coral/10 text-coral text-sm font-medium mb-4">
            Use Cases
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Built for Every Type of Institution
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a single school or a chain of institutions, EduPay adapts to your needs.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground font-medium">
                  {item.stats}
                </span>
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
