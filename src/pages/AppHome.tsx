import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Download, Smartphone, Wifi, WifiOff, Bell, Shield, Zap, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AppHome = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Works instantly, even on slow networks' },
    { icon: WifiOff, title: 'Works Offline', desc: 'Access your data without internet' },
    { icon: Bell, title: 'Push Notifications', desc: 'Get instant fee & payment alerts' },
    { icon: Shield, title: 'Secure', desc: 'Bank-grade encryption for all data' },
  ];

  return (
    <>
      <Helmet>
        <title>Install EduPay App - School Fee Management</title>
        <meta name="description" content="Install the EduPay app on your device for faster access to school fee management." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">EduPay</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-lg">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Get the EduPay App
            </h1>
            <p className="text-muted-foreground">
              Install for a faster, native-like experience
            </p>
          </motion.div>

          {/* Install Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {isInstalled ? (
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
                  <h2 className="text-lg font-bold text-foreground mb-1">App Installed!</h2>
                  <p className="text-muted-foreground text-sm">
                    EduPay is installed on your device. Open it from your home screen.
                  </p>
                </CardContent>
              </Card>
            ) : deferredPrompt ? (
              <Button
                onClick={handleInstall}
                size="lg"
                className="w-full gap-2 h-14 text-lg"
              >
                <Download className="w-5 h-5" />
                Install EduPay App
              </Button>
            ) : isIOS ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="w-8 h-8 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Install on iPhone/iPad</h2>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="font-bold text-foreground">1.</span>
                      Tap the <strong className="text-foreground">Share</strong> button (📤) at the bottom of Safari
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-foreground">2.</span>
                      Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-foreground">3.</span>
                      Tap <strong className="text-foreground">"Add"</strong> to install
                    </li>
                  </ol>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Smartphone className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Open this page in Chrome or Edge to install the app on your device.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 text-center">
                    <f.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-bold text-sm text-foreground mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link to="/login">
              <Button variant="outline" size="lg" className="gap-2">
                Continue in Browser
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default AppHome;
