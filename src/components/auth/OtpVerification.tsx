import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

interface OtpVerificationProps {
  email: string;
  onVerify: (token: string) => Promise<{ error: Error | null }>;
  onResend: () => Promise<void>;
  isLoading: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const OtpVerification = ({
  email,
  onVerify,
  onResend,
  isLoading,
  onSuccess,
  onError,
}: OtpVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      onError("Please enter the complete 6-digit code");
      return;
    }

    const { error } = await onVerify(otp);
    if (error) {
      onError("Invalid or expired code. Please try again.");
    } else {
      onSuccess("Email verified successfully!");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setResending(true);
    try {
      await onResend();
      onSuccess("New code sent to your email!");
      setCooldown(60);
      
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      onError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Verify your email
        </h2>
        <p className="text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerify}
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify Email
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
};
