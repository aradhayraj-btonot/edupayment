import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, Mail } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-info rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
            Ready to Transform Your School's Fee Management?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
            Join 500+ schools already using EduPay to simplify fee collection, 
            improve transparency, and save hours every week. Start your free trial today!
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/login">
              <Button variant="hero" size="xl" className="group text-base">
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="tel:+919708565215">
              <Button variant="heroOutline" size="xl" className="text-base">
                <Phone className="w-5 h-5" />
                Talk to Sales
              </Button>
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/70 text-sm">
            <a href="tel:+919708565215" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Phone className="w-4 h-4" />
              +91 9708565215
            </a>
            <a href="mailto:aradhayrajbusiness@gmail.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Mail className="w-4 h-4" />
              aradhayrajbusiness@gmail.com
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-primary-foreground/60 text-xs">
            <span>✅ No credit card required</span>
            <span>✅ Setup in under 5 minutes</span>
            <span>✅ Cancel anytime</span>
            <span>✅ Free data migration</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
