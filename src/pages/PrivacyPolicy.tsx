import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | FeeSync</title>
        <meta name="description" content="FeeSync Privacy Policy - Learn how we collect, use, and protect your personal information." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
            
            <p className="text-muted-foreground text-lg">
              Last Updated: December 27, 2024
            </p>

            <p className="text-muted-foreground">
              FeeSync ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              school fee management platform.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-foreground">1.1 Personal Information</h3>
              <p className="text-muted-foreground">We collect information that you provide directly to us, including:</p>
              <ul className="text-muted-foreground">
                <li><strong>For School Administrators:</strong> Name, email address, phone number, school name, school address, designation</li>
                <li><strong>For Parents/Guardians:</strong> Name, email address, phone number, address, relationship to student</li>
                <li><strong>For Students:</strong> Name, class/grade, section, roll number, admission date, parent/guardian details</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground">1.2 Financial Information</h3>
              <p className="text-muted-foreground">
                We collect fee-related information including fee structures, payment history, outstanding dues, 
                and transaction records. Payment card details are processed securely through our payment 
                partner (Razorpay) and are never stored on our servers.
              </p>

              <h3 className="text-xl font-semibold text-foreground">1.3 Automatically Collected Information</h3>
              <ul className="text-muted-foreground">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Usage data (pages visited, time spent, actions taken)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the collected information for the following purposes:</p>
              
              <h3 className="text-xl font-semibold text-foreground">2.1 Service Provision</h3>
              <ul className="text-muted-foreground">
                <li>To create and manage user accounts</li>
                <li>To process fee payments and generate receipts</li>
                <li>To send fee reminders and payment notifications</li>
                <li>To generate financial reports for schools</li>
                <li>To manage student records and fee structures</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground">2.2 Communication</h3>
              <ul className="text-muted-foreground">
                <li>To send transactional emails and SMS</li>
                <li>To respond to inquiries and support requests</li>
                <li>To send important service updates and announcements</li>
                <li>To send promotional communications (with consent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground">2.3 Service Improvement</h3>
              <ul className="text-muted-foreground">
                <li>To analyze usage patterns and improve our platform</li>
                <li>To develop new features and services</li>
                <li>To ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">3. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground">We may share your information in the following circumstances:</p>

              <h3 className="text-xl font-semibold text-foreground">3.1 With Schools</h3>
              <p className="text-muted-foreground">
                Parent and student information is shared with the respective school for fee management purposes. 
                Schools are responsible for the accuracy and appropriate use of this data.
              </p>

              <h3 className="text-xl font-semibold text-foreground">3.2 Service Providers</h3>
              <p className="text-muted-foreground">We may share information with third-party service providers who assist us in:</p>
              <ul className="text-muted-foreground">
                <li>Payment processing (Razorpay)</li>
                <li>Email and SMS delivery</li>
                <li>Cloud hosting and data storage</li>
                <li>Analytics and monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground">3.3 Legal Requirements</h3>
              <p className="text-muted-foreground">We may disclose information when required by law, court order, or government request.</p>

              <h3 className="text-xl font-semibold text-foreground">3.4 Business Transfers</h3>
              <p className="text-muted-foreground">
                In the event of a merger, acquisition, or sale of assets, user information may be transferred 
                to the acquiring entity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="text-muted-foreground">
                <li>Encryption of data in transit (TLS/SSL) and at rest (AES-256)</li>
                <li>Secure cloud infrastructure with regular backups</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security assessments and audits</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-muted-foreground">
                For more details, please see our <Link to="/security" className="text-primary hover:underline">Security Information & Awareness</Link> page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain personal information for as long as necessary to provide our services and fulfill 
                the purposes outlined in this policy, unless a longer retention period is required by law. 
                Specific retention periods include:
              </p>
              <ul className="text-muted-foreground">
                <li><strong>Active accounts:</strong> Data retained while account is active</li>
                <li><strong>Financial records:</strong> 7 years as per legal requirements</li>
                <li><strong>Inactive accounts:</strong> Deleted after 3 years of inactivity</li>
                <li><strong>Support communications:</strong> Retained for 2 years</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground">You have the following rights regarding your personal information:</p>

              <h3 className="text-xl font-semibold text-foreground">6.1 Access and Correction</h3>
              <p className="text-muted-foreground">
                You can access and update your personal information through your account settings or by 
                contacting your school administrator.
              </p>

              <h3 className="text-xl font-semibold text-foreground">6.2 Data Portability</h3>
              <p className="text-muted-foreground">
                You can request a copy of your personal data in a commonly used format.
              </p>

              <h3 className="text-xl font-semibold text-foreground">6.3 Deletion</h3>
              <p className="text-muted-foreground">
                You can request deletion of your personal information, subject to legal retention requirements.
              </p>

              <h3 className="text-xl font-semibold text-foreground">6.4 Communication Preferences</h3>
              <p className="text-muted-foreground">
                You can opt out of promotional communications by clicking the unsubscribe link in emails 
                or contacting us directly. Note that transactional communications cannot be opted out.
              </p>

              <h3 className="text-xl font-semibold text-foreground">6.5 Cookie Preferences</h3>
              <p className="text-muted-foreground">
                You can control cookies through your browser settings. Note that disabling cookies may 
                affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">7. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our platform collects student information necessary for school fee management. This data 
                is collected with the consent of schools and parents/guardians. We do not knowingly collect 
                personal information from children without appropriate parental or guardian consent.
              </p>
              <p className="text-muted-foreground">
                Parents and guardians can review, modify, or request deletion of their child's information 
                by contacting the school administrator.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">8. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground">We use cookies and similar technologies to:</p>
              <ul className="text-muted-foreground">
                <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-muted-foreground">
                You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">9. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our platform may contain links to third-party websites or services. We are not responsible 
                for the privacy practices of these external sites. We encourage you to read their privacy 
                policies before providing any personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">10. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be stored and processed in servers located outside your country of 
                residence. By using our platform, you consent to the transfer of your information to 
                facilities that may be in other jurisdictions. We ensure appropriate safeguards are in 
                place to protect your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the updated policy on our platform and updating the "Last Updated" date. 
                Your continued use of our platform after such changes constitutes your acceptance of the 
                updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">12. Compliance with Indian Laws</h2>
              <p className="text-muted-foreground">
                This Privacy Policy is governed by and complies with applicable Indian laws, including:
              </p>
              <ul className="text-muted-foreground">
                <li>Information Technology Act, 2000</li>
                <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
                <li>Digital Personal Data Protection Act, 2023 (as applicable)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">13. Grievance Officer</h2>
              <p className="text-muted-foreground">
                In accordance with the Information Technology Act, 2000, the name and contact details of 
                the Grievance Officer are provided below:
              </p>
              <div className="bg-card border rounded-lg p-4 text-muted-foreground">
                <p className="mb-1"><strong>Grievance Officer:</strong> Privacy Officer</p>
                <p className="mb-1"><strong>Email:</strong> btonot.in@gmail.com</p>
                <p className="mb-0"><strong>Response Time:</strong> Within 48 hours of receiving the grievance</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">14. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                data practices, please contact us:
              </p>
              <div className="bg-card border rounded-lg p-4 text-muted-foreground">
                <p className="mb-1"><strong>Email:</strong> btonot.in@gmail.com</p>
                <p className="mb-1"><strong>Support:</strong> aradhayrajbusiness@gmail.com</p>
                <p className="mb-1"><strong>Website:</strong> edupayment.online</p>
                <p className="mb-1"><strong>Phone:</strong> +91 9708565215</p>
                <p className="mb-0"><strong>Address:</strong> Ramagarh, Jharkhand, India</p>
              </div>
            </section>

            <div className="border-t pt-8 mt-12">
              <p className="text-muted-foreground text-sm">
                By using FeeSync, you acknowledge that you have read and understood this Privacy Policy 
                and agree to its terms. If you do not agree with this policy, please do not use our platform.
              </p>
              <p className="text-muted-foreground text-sm mt-4">
                Related documents: <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> | <Link to="/security" className="text-primary hover:underline">Security Information</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
