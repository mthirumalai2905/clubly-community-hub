import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ResetPasswordFormProps {
  onUpdatePassword: (password: string) => Promise<{ error: Error | null }>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const ResetPasswordForm = ({
  onUpdatePassword,
  isLoading,
  setIsLoading,
  onSuccess,
  onError,
}: ResetPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const result = passwordSchema.safeParse({ password, confirmPassword });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      const { error } = await onUpdatePassword(password);
      if (error) {
        onError(error.message);
      } else {
        setSuccess(true);
        onSuccess("Password updated successfully! Redirecting...");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Password Updated!
        </h2>
        <p className="text-muted-foreground mb-6">
          Your password has been successfully changed. You'll be redirected shortly.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Set new password
        </h2>
        <p className="text-muted-foreground">
          Create a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Password strength indicators */}
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-foreground mb-2">Password requirements:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-primary' : 'text-muted-foreground'}`}>
              <CheckCircle className={`w-4 h-4 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
              8+ characters
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-primary' : 'text-muted-foreground'}`}>
              <CheckCircle className={`w-4 h-4 ${hasUppercase ? 'opacity-100' : 'opacity-30'}`} />
              Uppercase letter
            </div>
            <div className={`flex items-center gap-2 ${hasLowercase ? 'text-primary' : 'text-muted-foreground'}`}>
              <CheckCircle className={`w-4 h-4 ${hasLowercase ? 'opacity-100' : 'opacity-30'}`} />
              Lowercase letter
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? 'text-primary' : 'text-muted-foreground'}`}>
              <CheckCircle className={`w-4 h-4 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
              Number
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
          {passwordsMatch && (
            <p className="text-sm text-primary flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Passwords match
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isLoading || !hasMinLength || !hasUppercase || !hasLowercase || !hasNumber}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Update Password
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
