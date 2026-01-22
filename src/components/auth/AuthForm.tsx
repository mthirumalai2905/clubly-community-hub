import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(2, "Username must be at least 2 characters").max(30),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

interface AuthFormProps {
  onSignUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onForgotPassword: (email: string) => Promise<{ error: Error | null }>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const AuthForm = ({
  onSignUp,
  onSignIn,
  onForgotPassword,
  isLoading,
  setIsLoading,
  onSuccess,
  onError,
}: AuthFormProps) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = signUpSchema.safeParse({ email, password, username });
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

        const { error } = await onSignUp(email, password, username);
        if (error) {
          if (error.message.includes("already registered")) {
            onError("This email is already registered.");
          } else {
            onError(error.message);
          }
        } else {
          onSuccess("🎉 Welcome to Clubly! Your account has been created.");
        }
      } else if (mode === 'signin') {
        const result = signInSchema.safeParse({ email, password });
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

        const { error } = await onSignIn(email, password);
        if (error) {
          onError("Invalid email or password.");
        }
      } else if (mode === 'forgot') {
        const result = forgotPasswordSchema.safeParse({ email });
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

        const { error } = await onForgotPassword(email);
        if (error) {
          onError(error.message);
        } else {
          onSuccess("Password reset link sent! Check your email inbox.");
          setMode('signin');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return "Create your account";
      case 'forgot': return "Reset your password";
      default: return "Welcome back";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return "Start building your community";
      case 'forgot': return "Enter your email to receive a reset link";
      default: return "Sign in to continue";
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          {getTitle()}
        </h2>
        <p className="text-muted-foreground">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {mode !== 'forgot' && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
        )}

        {mode === 'signin' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {mode === 'signup' && "Create Account"}
              {mode === 'signin' && "Sign In"}
              {mode === 'forgot' && "Send Reset Link"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        {mode === 'forgot' ? (
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrors({});
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === 'signin' ? (
              <>
                Don't have an account?{" "}
                <span className="text-primary font-medium">Sign up</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="text-primary font-medium">Sign in</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
