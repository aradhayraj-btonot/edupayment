import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - EduPay School Fee Payment</title>
        <meta name="description" content="Read EduPay's Terms and Conditions for using our school fee payment platform." />
        <meta name="keywords" content="EduPay terms, conditions, school fee payment terms, user agreement" />
        <link rel="canonical" href="https://edupay.com/terms" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                EduPay
              </span>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-8">
            Terms and Conditions
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Last updated: December 27, 2024
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to EduPay, a school fee payment management platform operated by Btonot, founded by Aradhay Raj. 
                These Terms and Conditions ("Terms") govern your access to and use of the EduPay platform, including our 
                website, mobile applications, and related services (collectively, the "Service"). By creating an account 
                or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please 
                do not use our Service.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>"Platform"</strong> refers to the EduPay website, applications, and all related services.</li>
                <li><strong>"User"</strong> refers to any individual or entity that accesses or uses the Platform, including School Administrators and Parents.</li>
                <li><strong>"School Administrator"</strong> refers to authorized personnel from educational institutions who manage fee structures and student records.</li>
                <li><strong>"Parent"</strong> refers to parents or guardians who use the Platform to pay school fees for their children.</li>
                <li><strong>"Student"</strong> refers to enrolled students whose fee information is managed through the Platform.</li>
                <li><strong>"Transaction"</strong> refers to any payment made through the Platform.</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Account Registration and Security</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>3.1 Account Creation:</strong> To use certain features of our Service, you must create an account. 
                  You agree to provide accurate, current, and complete information during registration and to update such 
                  information to keep it accurate, current, and complete.
                </p>
                <p className="leading-relaxed">
                  <strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your 
                  account credentials and for all activities that occur under your account. You agree to immediately notify 
                  us of any unauthorized use of your account or any other breach of security.
                </p>
                <p className="leading-relaxed">
                  <strong>3.3 Age Requirement:</strong> You must be at least 18 years old to create an account and use our 
                  Service. By creating an account, you represent and warrant that you are at least 18 years of age.
                </p>
                <p className="leading-relaxed">
                  <strong>3.4 Account Termination:</strong> We reserve the right to suspend or terminate your account at any 
                  time for any reason, including violation of these Terms or suspected fraudulent activity.
                </p>
              </div>
            </section>

            {/* Services Description */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Services Description</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>4.1 For Schools:</strong> EduPay provides school administrators with tools to manage fee structures, 
                  track payments, manage student records, send notifications, and generate reports. Schools can configure 
                  multiple fee types including tuition, transport, activities, and other charges.
                </p>
                <p className="leading-relaxed">
                  <strong>4.2 For Parents:</strong> Parents can view their children's fee details, make payments through 
                  various payment methods (UPI, credit/debit cards, net banking), download receipts, and receive notifications 
                  about upcoming or overdue payments.
                </p>
                <p className="leading-relaxed">
                  <strong>4.3 Payment Processing:</strong> All payments are processed through secure third-party payment 
                  gateways including Razorpay. EduPay does not store your complete payment card information on our servers.
                </p>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payment Terms</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>5.1 Payment Authorization:</strong> By making a payment through EduPay, you authorize us to charge 
                  the specified amount to your chosen payment method. You confirm that you have the legal right to use the 
                  payment method provided.
                </p>
                <p className="leading-relaxed">
                  <strong>5.2 Transaction Fees:</strong> Depending on the school's subscription plan, transaction fees may 
                  apply. These fees will be clearly disclosed before you complete any payment.
                </p>
                <p className="leading-relaxed">
                  <strong>5.3 Failed Transactions:</strong> If a payment fails, you will be notified and may retry the payment. 
                  EduPay is not responsible for failed transactions due to insufficient funds, expired cards, or other issues 
                  with your payment method.
                </p>
                <p className="leading-relaxed">
                  <strong>5.4 Refunds:</strong> Refund policies are determined by individual schools. Please contact your 
                  school administrator for refund requests. EduPay will facilitate approved refunds but does not guarantee 
                  refund processing times.
                </p>
                <p className="leading-relaxed">
                  <strong>5.5 Receipt Generation:</strong> Digital receipts are automatically generated for all successful 
                  transactions. These receipts serve as proof of payment and can be downloaded from your account.
                </p>
              </div>
            </section>

            {/* School Subscription */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. School Subscription Plans</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>6.1 Subscription Tiers:</strong> EduPay offers various subscription plans for schools including 
                  Starter, Professional, and Enterprise tiers. Each tier includes different features and student limits.
                </p>
                <p className="leading-relaxed">
                  <strong>6.2 Billing:</strong> Subscription fees are billed in advance on a monthly or annual basis. Schools 
                  agree to pay all fees associated with their chosen subscription plan.
                </p>
                <p className="leading-relaxed">
                  <strong>6.3 Plan Changes:</strong> Schools may upgrade or downgrade their subscription plan at any time. 
                  Changes will take effect at the start of the next billing cycle.
                </p>
                <p className="leading-relaxed">
                  <strong>6.4 Cancellation:</strong> Schools may cancel their subscription at any time. Access to premium 
                  features will continue until the end of the current billing period.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. User Responsibilities</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>7.1 Accurate Information:</strong> You agree to provide accurate and truthful information when using 
                  our Service. School administrators are responsible for ensuring that student and fee information is accurate 
                  and up-to-date.
                </p>
                <p className="leading-relaxed">
                  <strong>7.2 Lawful Use:</strong> You agree to use the Platform only for lawful purposes and in accordance 
                  with these Terms. You will not use the Platform for any illegal or unauthorized purpose.
                </p>
                <p className="leading-relaxed">
                  <strong>7.3 Prohibited Activities:</strong> You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                  <li>Use the Platform to transmit malware, viruses, or other harmful code</li>
                  <li>Interfere with or disrupt the Platform or its servers</li>
                  <li>Use automated systems or bots to access the Platform</li>
                  <li>Collect or store personal information of other users without consent</li>
                  <li>Use the Platform for money laundering or other financial crimes</li>
                  <li>Impersonate any person or entity or falsely claim affiliation with any person or entity</li>
                </ul>
              </div>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy and Data Protection</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>8.1 Data Collection:</strong> We collect and process personal information in accordance with our 
                  Privacy Policy. By using our Service, you consent to our collection and use of your data as described in 
                  the Privacy Policy.
                </p>
                <p className="leading-relaxed">
                  <strong>8.2 Data Security:</strong> We implement appropriate technical and organizational measures to 
                  protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p className="leading-relaxed">
                  <strong>8.3 School Data:</strong> Schools retain ownership of their data including student records, fee 
                  structures, and payment information. EduPay acts as a data processor on behalf of schools.
                </p>
                <p className="leading-relaxed">
                  <strong>8.4 Data Retention:</strong> We retain user data for as long as your account is active or as needed 
                  to provide services. Transaction records may be retained for longer periods as required by law.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Intellectual Property Rights</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>9.1 Ownership:</strong> The Platform and its entire contents, features, and functionality are owned 
                  by Btonot and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="leading-relaxed">
                  <strong>9.2 Limited License:</strong> We grant you a limited, non-exclusive, non-transferable, revocable 
                  license to access and use the Platform for its intended purpose.
                </p>
                <p className="leading-relaxed">
                  <strong>9.3 Restrictions:</strong> You may not reproduce, distribute, modify, create derivative works of, 
                  publicly display, publicly perform, republish, download, store, or transmit any material from the Platform 
                  without our prior written consent.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Disclaimers and Limitations</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>10.1 Service Availability:</strong> We strive to maintain high availability of our Platform, but we 
                  do not guarantee uninterrupted, timely, secure, or error-free operation of the Service.
                </p>
                <p className="leading-relaxed">
                  <strong>10.2 Third-Party Services:</strong> Our Platform integrates with third-party services including 
                  payment gateways. We are not responsible for the performance, availability, or security of these third-party 
                  services.
                </p>
                <p className="leading-relaxed">
                  <strong>10.3 No Warranty:</strong> THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES 
                  OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                  FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="leading-relaxed">
                  <strong>10.4 Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, EDUPAY AND ITS 
                  AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                  OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless EduPay, Btonot, and their officers, directors, employees, 
                agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, 
                and expenses arising from: (a) your use of the Platform; (b) your violation of these Terms; (c) your 
                violation of any third-party rights; or (d) any content you submit or transmit through the Platform.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Dispute Resolution</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  <strong>12.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance with the 
                  laws of India, without regard to its conflict of law provisions.
                </p>
                <p className="leading-relaxed">
                  <strong>12.2 Arbitration:</strong> Any dispute arising out of or relating to these Terms or the Platform 
                  shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act of 
                  India.
                </p>
                <p className="leading-relaxed">
                  <strong>12.3 Informal Resolution:</strong> Before filing any formal dispute, you agree to first contact us 
                  and attempt to resolve the dispute informally by sending a written notice of your claim.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by 
                email or by posting a notice on our Platform prior to the changes becoming effective. Your continued use of 
                the Platform after any changes indicates your acceptance of the modified Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="leading-relaxed">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>Company:</strong> Btonot</li>
                  <li><strong>Founder:</strong> Aradhay Raj</li>
                  <li><strong>Email:</strong> support@edupay.com</li>
                  <li><strong>Website:</strong> https://edupay.com</li>
                </ul>
              </div>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions 
                shall continue in full force and effect. The invalid, illegal, or unenforceable provision shall be modified 
                to the minimum extent necessary to make it valid, legal, and enforceable while preserving its intent.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">16. Entire Agreement</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms, together with our Privacy Policy and any other agreements expressly incorporated by reference, 
                constitute the entire agreement between you and EduPay regarding your use of the Platform. These Terms 
                supersede any prior agreements or understandings between you and EduPay.
              </p>
            </section>

            {/* Acceptance */}
            <section className="bg-muted/50 p-6 rounded-xl border border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account or using the EduPay platform, you acknowledge that you have read, understood, and 
                agree to be bound by these Terms and Conditions. If you are using the Service on behalf of an organization, 
                you represent and warrant that you have the authority to bind that organization to these Terms.
              </p>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} EduPay by Btonot. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TermsAndConditions;
