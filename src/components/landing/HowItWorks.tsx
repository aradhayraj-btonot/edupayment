import { motion } from "framer-motion";
import { School, Settings, CreditCard, BarChart } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: School,
      title: "Register Your School",
      description:
        "Quick onboarding process with guided setup for your institution.",
    },
    {
      number: "02",
      icon: Settings,
      title: "Configure Fee Structure",
      description:
        "Set up tuition, transport, activities, and custom fee categories.",
    },
    {
      number: "03",
      icon: CreditCard,
      title: "Parents Pay Online",
      description:
        "Multiple payment options with instant confirmation and receipts.",
    },
    {
      number: "04",
      icon: BarChart,
      title: "Track & Report",
      description:
        "Real-time dashboard with comprehensive analytics and reports.",
    },
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple setup process to transform your school's fee management.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-border" />
              )}

              <div className="relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                {/* Step Number */}
                <div className="absolute -top-4 left-6 px-3 py-1 rounded-lg gradient-primary text-primary-foreground text-sm font-bold">
                  {step.number}
                </div>

                <div className="pt-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
