import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Copy,
  CheckCircle,
  Upload,
  Smartphone,
  IndianRupee,
  ArrowRight,
  Wallet,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

// UPI App configurations with deep link schemes
const UPI_APPS = [
  { name: "Google Pay", scheme: "gpay", color: "#4285F4", icon: "G" },
  { name: "PhonePe", scheme: "phonepe", color: "#5F259F", icon: "P" },
  { name: "Paytm", scheme: "paytm", color: "#00BAF2", icon: "₹" },
  { name: "BHIM", scheme: "bhim", color: "#00B9F1", icon: "B" },
  { name: "Other UPI", scheme: "upi", color: "#6366F1", icon: "U" },
];

interface UPIPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: {
    id: string;
    amount: number;
    discount?: number;
    fee_structures?: { name: string };
  } | null;
  school: {
    upi_id?: string | null;
    name: string;
  } | null;
  studentName: string;
  onConfirmPayment: (amount: number) => Promise<{ id: string }>;
  onUploadScreenshot: (file: File, paymentId: string) => Promise<void>;
  isCreatingPayment: boolean;
  isUploadingScreenshot: boolean;
}

export const UPIPaymentDialog = ({
  open,
  onOpenChange,
  fee,
  school,
  studentName,
  onConfirmPayment,
  onUploadScreenshot,
  isCreatingPayment,
  isUploadingScreenshot,
}: UPIPaymentDialogProps) => {
  const [paymentStep, setPaymentStep] = useState<"select" | "pay" | "upload">("select");
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullAmount = fee ? Number(fee.amount) - Number(fee.discount || 0) : 0;
  const payAmount = paymentType === "full" ? fullAmount : Number(partialAmount) || 0;

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPaymentStep("select");
      setPaymentType("full");
      setPartialAmount("");
      setCreatedPaymentId(null);
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setSelectedApp(null);
      setTransactionId("");
    }
  }, [open]);

  const generateUPILink = (app?: string) => {
    if (!school?.upi_id || !payAmount) return "";
    
    const params = new URLSearchParams({
      pa: school.upi_id,
      pn: school.name,
      am: payAmount.toString(),
      cu: "INR",
      tn: `Fee payment for ${studentName} - ${fee?.fee_structures?.name || "School Fee"}`,
    });

    // For specific apps, use their correct deep link schemes
    if (app) {
      switch (app) {
        case "gpay":
          return `gpay://upi/pay?${params.toString()}`;
        case "phonepe":
          return `phonepe://pay?${params.toString()}`;
        case "paytm":
          return `paytm://upi/pay?${params.toString()}`;
        case "bhim":
          return `bhim://upi/pay?${params.toString()}`;
        default:
          return `upi://pay?${params.toString()}`;
      }
    }
    return `upi://pay?${params.toString()}`;
  };

  const handleAppClick = (app: typeof UPI_APPS[0]) => {
    setSelectedApp(app.scheme);
    const link = generateUPILink(app.scheme);
    
    if (!link) {
      toast.error("Unable to generate payment link. Please scan the QR code instead.");
      return;
    }

    // Use a temporary anchor to trigger deep link without navigating away
    const anchor = document.createElement("a");
    anchor.href = link;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    toast.info("Complete payment in your UPI app, then return here to confirm", {
      duration: 5000,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("UPI ID copied to clipboard!");
  };

  const handleProceedToPayment = () => {
    if (paymentType === "partial" && (!partialAmount || Number(partialAmount) <= 0)) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (paymentType === "partial" && Number(partialAmount) > fullAmount) {
      toast.error("Partial amount cannot exceed total due");
      return;
    }
    setPaymentStep("pay");
  };

  const handleConfirmPayment = async () => {
    try {
      const result = await onConfirmPayment(payAmount);
      setCreatedPaymentId(result.id);
      setPaymentStep("upload");
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshotFile || !createdPaymentId) return;
    
    // Update transaction_id if provided
    if (transactionId.trim()) {
      await supabase
        .from("payments")
        .update({ transaction_id: transactionId.trim() })
        .eq("id", createdPaymentId);
    }
    
    await onUploadScreenshot(screenshotFile, createdPaymentId);
    onOpenChange(false);
    toast.success("Payment submitted for verification!");
  };

  if (!fee || !school) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: paymentStep === "upload" ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {paymentStep === "upload" ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <CreditCard className="w-5 h-5 text-primary" />
              )}
            </motion.div>
            {paymentStep === "select" && "Select Payment Amount"}
            {paymentStep === "pay" && "Complete Payment"}
            {paymentStep === "upload" && "Upload Screenshot"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Payment Type */}
          {paymentStep === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Fee Info */}
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Due Amount</p>
                <motion.p 
                  className="text-3xl font-bold text-primary"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  ₹{fullAmount.toLocaleString("en-IN")}
                </motion.p>
                <p className="text-sm text-muted-foreground mt-1">
                  {fee.fee_structures?.name}
                </p>
              </div>

              {/* Payment Type Selection */}
              <div className="space-y-3">
                <Label>Choose Payment Option</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentType("full")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentType === "full"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Wallet className="w-6 h-6 text-primary mb-2" />
                    <p className="font-semibold">Pay Full</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{fullAmount.toLocaleString("en-IN")}
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentType("partial")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentType === "partial"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <IndianRupee className="w-6 h-6 text-accent mb-2" />
                    <p className="font-semibold">Pay Partial</p>
                    <p className="text-sm text-muted-foreground">Custom amount</p>
                  </motion.button>
                </div>
              </div>

              {/* Partial Amount Input */}
              <AnimatePresence>
                {paymentType === "partial" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="partial-amount">Enter Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="partial-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        className="pl-8"
                        max={fullAmount}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum: ₹{fullAmount.toLocaleString("en-IN")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Proceed Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={paymentType === "partial" && (!partialAmount || Number(partialAmount) <= 0)}
              >
                Proceed to Pay ₹{payAmount.toLocaleString("en-IN")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {paymentStep === "pay" && (
            <motion.div
              key="pay"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* Amount Badge */}
              <motion.div 
                className="text-center p-3 bg-success/10 rounded-xl border border-success/20"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <p className="text-sm text-muted-foreground">Paying</p>
                <p className="text-2xl font-bold text-success">
                  ₹{payAmount.toLocaleString("en-IN")}
                </p>
              </motion.div>

              {/* Dynamic QR Code */}
              {school.upi_id && (
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-4 bg-white rounded-2xl shadow-lg">
                    <QRCodeSVG
                      value={generateUPILink()}
                      size={180}
                      level="H"
                      includeMargin
                      imageSettings={{
                        src: "/favicon.ico",
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Scan with any UPI app
                  </p>
                </motion.div>
              )}

              {/* UPI Apps */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <Label>Or pay with UPI app</Label>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {UPI_APPS.map((app, index) => (
                    <motion.button
                      key={app.scheme}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAppClick(app)}
                      className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                        selectedApp === app.scheme
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.icon}
                      </div>
                      <span className="text-[10px] mt-1 text-muted-foreground truncate w-full text-center">
                        {app.name.split(" ")[0]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* UPI ID Copy */}
              {school.upi_id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-muted-foreground">Or copy UPI ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-secondary px-3 py-2.5 rounded-lg text-sm font-mono truncate">
                      {school.upi_id}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(school.upi_id!)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Confirm Button */}
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmPayment}
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Processing...
                    </>
                  ) : (
                    "I've Completed the Payment"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Complete payment via UPI, then click above to continue
                </p>
              </div>

              {/* Back Button */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setPaymentStep("select")}
              >
                ← Change amount
              </Button>
            </motion.div>
          )}

          {/* Step 3: Upload Screenshot */}
          {paymentStep === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <motion.div 
                className="text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-3" />
                </motion.div>
                <p className="font-semibold text-foreground">Payment Recorded!</p>
                <p className="text-sm text-muted-foreground">
                  Please upload your payment screenshot for verification
                </p>
              </motion.div>

              <div className="space-y-2">
                <Label>Upload Payment Screenshot</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  {screenshotPreview ? (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      </motion.div>
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-2">
                <Label htmlFor="transaction-id">UPI Transaction ID / UTR Number</Label>
                <Input
                  id="transaction-id"
                  type="text"
                  placeholder="e.g. 412345678901"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Find this in your UPI app's payment confirmation
                </p>
              </div>

                className="w-full"
                size="lg"
                onClick={handleUploadScreenshot}
                disabled={!screenshotFile || isUploadingScreenshot}
              >
                {isUploadingScreenshot ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Uploading...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your payment will be verified by the school admin. You'll receive a
                notification once approved.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
