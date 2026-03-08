import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "How does EduPay work for schools?",
    a: "Schools register on EduPay, set up their fee structures (tuition, transport, activities, etc.), and add students. Parents receive notifications and can pay fees online via UPI, cards, or net banking. Schools get real-time tracking of all payments with automated receipts.",
  },
  {
    q: "Is EduPay secure for online payments?",
    a: "Absolutely! EduPay uses bank-grade encryption (AES-256), is PCI-DSS compliant, and processes payments through trusted gateways like Razorpay. We never store card details on our servers. All data is encrypted at rest and in transit.",
  },
  {
    q: "What payment methods do you support?",
    a: "We support all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), credit/debit cards (Visa, Mastercard, Rupay), net banking from 50+ banks, and digital wallets. Parents can choose their preferred method.",
  },
  {
    q: "Can parents pay fees in installments?",
    a: "Yes! Schools can configure flexible payment plans including monthly, quarterly, or custom installments. Parents can also make partial payments. Late fee rules can be set up automatically by the school admin.",
  },
  {
    q: "How quickly do payments reflect in the school's account?",
    a: "UPI payments reflect within seconds. Card and net banking payments are typically settled within 1-2 business days. Schools get instant notifications for every successful payment, and receipts are auto-generated immediately.",
  },
  {
    q: "Is there a setup fee or long-term contract?",
    a: "No setup fees and no long-term contracts! You can start with our 14-day free trial. After that, choose a monthly plan that suits your school. Cancel anytime with no penalties.",
  },
  {
    q: "Can EduPay handle multiple branches?",
    a: "Yes, our Enterprise plan supports multi-branch school chains. Each branch gets its own dashboard while headquarters gets a unified view of all collections, analytics, and reports across branches.",
  },
  {
    q: "What kind of support do you provide?",
    a: "We offer email support for all plans, priority phone support for Professional plans, and a dedicated account manager for Enterprise customers. Our AI chatbot is available 24/7 for instant help. You can also reach us at +91 9708565215.",
  },
  {
    q: "Can I customize fee receipts with my school's branding?",
    a: "Yes! Professional and Enterprise plans include custom branding. You can add your school logo, colors, and custom fields to receipts. Receipts are automatically emailed to parents and available for download in the dashboard.",
  },
  {
    q: "How do I migrate from my current system?",
    a: "Our team assists with complete data migration. You can bulk import students via Excel/CSV files, and we'll help set up your fee structures. Most schools are fully operational within 24-48 hours of signing up.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-info/10 text-info text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about EduPay. Can't find the answer? Contact our support team.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
              >
                <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-5 pb-5"
                >
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
