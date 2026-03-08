import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Principal, DPS Ranchi",
    content:
      "EduPay has completely transformed how we handle fee collection. What used to take us weeks of manual tracking now happens automatically. Our collection rate improved by 35% in just 3 months!",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rajesh Kumar",
    role: "Admin, St. Mary's School",
    content:
      "The parent dashboard is so intuitive that we barely get any support calls anymore. Parents love the transparency and instant receipts. Best decision we made this year.",
    rating: 5,
    avatar: "RK",
  },
  {
    name: "Anita Verma",
    role: "Parent",
    content:
      "Paying school fees used to mean standing in long queues. Now I just open EduPay, scan the QR code, and it's done in 30 seconds. The instant receipt feature is amazing!",
    rating: 5,
    avatar: "AV",
  },
  {
    name: "Dr. Sunil Mehta",
    role: "Director, Bright Future Academy",
    content:
      "We run 3 branches and EduPay handles all of them seamlessly. The analytics dashboard gives me a bird's eye view of collections across all schools. Highly recommended!",
    rating: 5,
    avatar: "SM",
  },
  {
    name: "Kavita Devi",
    role: "Parent, Class 8",
    content:
      "I love that I get notifications before the due date and can pay from my phone using any UPI app. No more late fees because I forgot! The app is very easy to use.",
    rating: 5,
    avatar: "KD",
  },
  {
    name: "Mohammed Iqbal",
    role: "Accountant, Modern Public School",
    content:
      "The automated reports save me hours every week. I can generate fee defaulter lists, collection summaries, and receipts with just one click. It's a game changer for school administration.",
    rating: 5,
    avatar: "MI",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Loved by Schools & Parents
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what schools and parents across India are saying about EduPay.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                "{t.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
