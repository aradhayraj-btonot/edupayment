import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

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

  return (
    <>
      <Helmet>
        <title>EduPay by Btonot - School Fee Payment Platform | Aradhay Raj</title>
        <meta name="description" content="EduPay by Aradhay Raj Btonot - The best school fee payment platform in India. Pay school fees online with UPI, cards, and net banking. Secure, instant fee collection software." />
        <meta name="keywords" content="Aradhay Raj, Aradhay Raj Btonot, Btonot, EduPay, edu pay, school fee payment, pay school fees online, school fee collection, fee management software, education fintech, edtech India" />
        <link rel="canonical" href="https://edupay.com" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationData)}
        </script>
      </Helmet>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Pricing />
        <Footer />
      </main>
    </>
  );
};

export default Index;
