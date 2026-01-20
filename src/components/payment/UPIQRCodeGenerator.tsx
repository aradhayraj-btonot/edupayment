import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, QrCode, CheckCircle, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface UPIQRCodeGeneratorProps {
  upiId: string;
  onUpiIdChange: (upiId: string) => void;
  schoolName: string;
  isUpdating?: boolean;
}

export const UPIQRCodeGenerator = ({
  upiId,
  onUpiIdChange,
  schoolName,
  isUpdating = false,
}: UPIQRCodeGeneratorProps) => {
  const [localUpiId, setLocalUpiId] = useState(upiId || "");
  const [isValidUpi, setIsValidUpi] = useState(false);

  useEffect(() => {
    setLocalUpiId(upiId || "");
  }, [upiId]);

  // Validate UPI ID format
  useEffect(() => {
    const upiPattern = /^[\w.-]+@[\w]+$/;
    setIsValidUpi(upiPattern.test(localUpiId));
  }, [localUpiId]);

  const generateUPIString = () => {
    if (!localUpiId) return "";
    const params = new URLSearchParams({
      pa: localUpiId,
      pn: schoolName,
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  };

  const handleSave = () => {
    if (!isValidUpi) {
      toast.error("Please enter a valid UPI ID (e.g., school@upi)");
      return;
    }
    onUpiIdChange(localUpiId);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(localUpiId);
    toast.success("UPI ID copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <IndianRupee className="w-5 h-5" />
          Payment Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* UPI ID Input */}
        <div className="space-y-2">
          <Label htmlFor="upi-id">UPI ID</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="upi-id"
                placeholder="school@upi"
                value={localUpiId}
                onChange={(e) => setLocalUpiId(e.target.value)}
                className={`pr-10 ${
                  localUpiId && !isValidUpi ? "border-destructive" : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {localUpiId && (
                  isValidUpi ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyUpiId}
              disabled={!localUpiId}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your school's UPI ID. QR code will be generated automatically.
          </p>
        </div>

        {/* Save Button */}
        {localUpiId !== upiId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={handleSave}
              disabled={!isValidUpi || isUpdating}
              className="w-full gap-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save UPI ID"
              )}
            </Button>
          </motion.div>
        )}

        {/* Generated QR Code */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Auto-Generated QR Code</Label>
            {isValidUpi && localUpiId && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                Ready
              </Badge>
            )}
          </div>
          
          <motion.div 
            className="flex flex-col items-center p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isValidUpi && localUpiId ? (
              <>
                <motion.div
                  className="p-4 bg-white rounded-2xl shadow-lg"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  key={localUpiId} // Re-animate when UPI ID changes
                >
                  <QRCodeSVG
                    value={generateUPIString()}
                    size={160}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: "/favicon.ico",
                      height: 20,
                      width: 20,
                      excavate: true,
                    }}
                  />
                </motion.div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  This QR code will be shown to parents for payment
                </p>
                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-secondary rounded-full">
                  <span className="text-xs font-mono">{localUpiId}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <QrCode className="w-16 h-16 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Enter a valid UPI ID to generate QR code
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Format: username@bankname
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4 bg-info/10 rounded-xl border border-info/20">
          <p className="text-sm text-info font-medium mb-1">
            💡 How it works
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• QR code is automatically generated from your UPI ID</li>
            <li>• Parents can scan or click to pay via any UPI app</li>
            <li>• Supports GPay, PhonePe, Paytm, BHIM & more</li>
            <li>• No need to upload QR code images manually</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
