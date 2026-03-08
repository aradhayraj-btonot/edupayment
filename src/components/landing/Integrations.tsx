import { motion } from "framer-motion";
import { Smartphone, Globe, Zap, FileText, Headphones, TrendingUp } from "lucide-react";

const integrations = [
  {
    icon: Smartphone,
    name: "UPI Apps",
    description: "Google Pay, PhonePe, Paytm, BHIM & all UPI apps",
    color: "bg-success/10 text-success",
  },
  {
    icon: Globe,
    name: "Net Banking",
    description: "50+ banks including SBI, HDFC, ICICI, Axis & more",
    color: "bg-info/10 text-info",
  },
  {
    icon: Zap,
    name: "Razorpay",
    description: "Secure payment gateway with instant settlements",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    name: "WhatsApp",
    description: "Send fee reminders & receipts via WhatsApp",
    color: "bg-success/10 text-success",
  },
  {
    icon: Headphones,
    name: "Email & SMS",
    description: "Automated notifications via email and SMS",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: TrendingUp,
    name: "Excel Export",
    description: "Export reports, student data & payment history",
    color: "bg-coral/10 text-coral",
  },
];

const Integrations = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Integrations
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Works With Tools You Already Use
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seamlessly connect with payment gateways, communication channels, and reporting tools.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {integrations.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-4 bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
