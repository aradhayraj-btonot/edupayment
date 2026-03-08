import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import Testimonials from "@/components/landing/Testimonials";
import UseCases from "@/components/landing/UseCases";
import Integrations from "@/components/landing/Integrations";
import TrustSecurity from "@/components/landing/TrustSecurity";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import FloatingSupportWidget from "@/components/support/FloatingSupportWidget";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EduPay by Btonot",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "description": "EduPay by Aradhay Raj Btonot - The best school fee payment platform in India. Pay school fees online with UPI, cards, and net banking.",
    "author": {
      "@type": "Person",
      "name": "Aradhay Raj",
      "description": "Founder of Btonot"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500"
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Btonot",
    "founder": {
      "@type": "Person",
      "name": "Aradhay Raj"
    },
    "url": "https://edupay.com",
    "logo": "https://storage.googleapis.com/gpt-engineer-file-uploads/WSKv6mil7rbJc2EHfYZp3QIalfs2/uploads/1766667010100-make logo of edu pay . it is paymement app.jpg"
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does EduPay work for schools?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Schools register on EduPay, set up their fee structures, and add students. Parents receive notifications and can pay fees online via UPI, cards, or net banking."
        }
      },
      {
        "@type": "Question",
        "name": "Is EduPay secure for online payments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! EduPay uses bank-grade AES-256 encryption, is PCI-DSS compliant, and processes payments through trusted gateways like Razorpay."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods do you support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support all major UPI apps, credit/debit cards, net banking from 50+ banks, and digital wallets."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>EduPay by Btonot - School Fee Payment Platform | Aradhay Raj</title>
        <meta name="description" content="EduPay by Aradhay Raj Btonot - The best school fee payment platform in India. Pay school fees online with UPI, cards, and net banking. Secure, instant fee collection software." />
        <meta property="og:image" content="https://edupay.com/og-image.png" />
        <meta name="twitter:image" content="https://edupay.com/og-image.png" />
        <meta name="keywords" content="Aradhay Raj, Aradhay Raj Btonot, Btonot, EduPay, edu pay, school fee payment, pay school fees online, school fee collection, fee management software, education fintech, edtech India" />
        <link rel="canonical" href="https://edupay.com" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqData)}
        </script>
      </Helmet>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <UseCases />
        <Integrations />
        <TrustSecurity />
        <Pricing />
        <FAQ />
        <CTASection />
        <Footer />
      </main>
      <FloatingSupportWidget />
    </>
  );
};

export default Index;
