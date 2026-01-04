import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, CheckCircle, Users, Server } from "lucide-react";

const Security = () => {
  return (
    <>
      <Helmet>
        <title>Security Information & Awareness | FeeSync</title>
        <meta name="description" content="Learn about FeeSync's security measures and best practices to keep your data safe." />
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
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground m-0">Security Information & Awareness</h1>
            </div>
            
            <p className="text-muted-foreground text-lg">
              Last Updated: December 27, 2024
            </p>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
              <h2 className="text-xl font-semibold text-foreground mt-0 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Our Commitment to Security
              </h2>
              <p className="text-muted-foreground mb-0">
                At FeeSync, we understand the critical importance of protecting your data. We implement industry-leading 
                security measures to ensure your information remains safe, confidential, and accessible only to authorized users.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Server className="h-6 w-6 text-primary" />
                1. Data Protection Measures
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground">Encryption at Rest & In Transit</h3>
                  <p className="mb-0">All data is encrypted using AES-256 encryption when stored and TLS 1.3 during transmission, ensuring your information is protected at all times.</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground">Secure Database Infrastructure</h3>
                  <p className="mb-0">Our databases are hosted on secure cloud infrastructure with automatic backups, redundancy, and disaster recovery protocols.</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground">Regular Security Audits</h3>
                  <p className="mb-0">We conduct regular security assessments and penetration testing to identify and address potential vulnerabilities.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                2. Access Control & Authentication
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Role-Based Access:</strong> Users can only access data relevant to their role (admin, parent, student)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Secure Authentication:</strong> Password-protected accounts with secure session management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Session Security:</strong> Automatic session timeout and secure token handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>School-Level Isolation:</strong> Each school's data is completely isolated from other schools</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                3. Payment Security
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  FeeSync integrates with Razorpay, a PCI-DSS compliant payment gateway, ensuring all payment 
                  transactions meet the highest security standards.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground">PCI-DSS Compliance</h4>
                    <p className="text-sm mb-0">Payment processing follows Payment Card Industry Data Security Standards</p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground">No Card Storage</h4>
                    <p className="text-sm mb-0">We never store credit/debit card details on our servers</p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground">Secure Payment Links</h4>
                    <p className="text-sm mb-0">All payment pages use HTTPS encryption</p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground">Transaction Verification</h4>
                    <p className="text-sm mb-0">Every transaction is verified and logged for audit purposes</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
                4. Security Best Practices for Users
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mt-0">Protect Your Account</h3>
                <ul className="space-y-2 text-muted-foreground mb-0">
                  <li>✓ Use a strong, unique password with at least 8 characters including numbers and symbols</li>
                  <li>✓ Never share your login credentials with anyone</li>
                  <li>✓ Always log out after using shared or public computers</li>
                  <li>✓ Verify you're on the official FeeSync website before entering credentials</li>
                  <li>✓ Report any suspicious activity immediately to school administration</li>
                  <li>✓ Keep your registered email address up to date</li>
                  <li>✓ Be cautious of phishing emails claiming to be from FeeSync</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground">5. Recognizing Security Threats</h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-foreground">Phishing Attacks</h4>
                  <p className="mb-0">FeeSync will never ask for your password via email or phone. If you receive such requests, do not respond and report immediately.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-foreground">Suspicious Links</h4>
                  <p className="mb-0">Always verify URLs before clicking. Official FeeSync links will always use our secure domain.</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-foreground">Social Engineering</h4>
                  <p className="mb-0">Be wary of unsolicited calls or messages claiming to be from FeeSync support asking for sensitive information.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground">6. Incident Response</h2>
              <p className="text-muted-foreground">
                In the unlikely event of a security incident, we have established procedures to:
              </p>
              <ul className="text-muted-foreground">
                <li>Immediately contain and assess the situation</li>
                <li>Notify affected users within 72 hours as per regulatory requirements</li>
                <li>Conduct thorough investigation and remediation</li>
                <li>Implement measures to prevent future occurrences</li>
                <li>Provide transparent communication about the incident</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground">7. Data Retention & Deletion</h2>
              <p className="text-muted-foreground">
                We retain your data only as long as necessary for providing our services or as required by law. 
                Schools can request data deletion upon termination of services, and we ensure secure data 
                destruction following industry best practices.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground">8. Compliance & Certifications</h2>
              <div className="grid md:grid-cols-3 gap-4 text-muted-foreground">
                <div className="bg-card border rounded-lg p-4 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground mb-1">Data Protection</p>
                  <p className="text-sm mb-0">Compliant with Indian IT Act 2000</p>
                </div>
                <div className="bg-card border rounded-lg p-4 text-center">
                  <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground mb-1">Payment Security</p>
                  <p className="text-sm mb-0">PCI-DSS via Razorpay</p>
                </div>
                <div className="bg-card border rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground mb-1">Privacy Standards</p>
                  <p className="text-sm mb-0">SPDI Rules Compliant</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground">9. Report Security Concerns</h2>
              <div className="bg-card border rounded-lg p-6">
                <p className="text-muted-foreground">
                  If you discover a security vulnerability or have concerns about the security of your data, 
                  please contact us immediately:
                </p>
                <ul className="text-muted-foreground mb-0">
                  <li><strong>Email:</strong> btonot.in@gmail.com</li>
                  <li><strong>Support:</strong> aradhayrajbusiness@gmail.com</li>
                  <li><strong>Phone:</strong> +91 9708565215</li>
                  <li><strong>Website:</strong> edupayment.online</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4 mb-0">
                  We take all security reports seriously and will respond within 24 hours.
                </p>
              </div>
            </section>

            <div className="border-t pt-8 mt-12">
              <p className="text-muted-foreground text-sm">
                This security policy is reviewed and updated regularly to ensure we maintain the highest 
                standards of data protection. For questions about our security practices, please contact 
                your school administrator or reach out to our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Security;
