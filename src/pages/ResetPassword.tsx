import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { updatePassword, session, loading, isRecoveryMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user came from password reset email
  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;
    
    setIsCheckingSession(false);
    
    // If we have a session (either recovery mode or normal), allow password reset
    if (!session) {
      toast({
        title: "Invalid or expired link",
        description: "Please request a new password reset link.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [session, loading, navigate, toast]);

  const handleUpdatePassword = async (password: string) => {
    const result = await updatePassword(password);
    if (!result.error) {
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
    return result;
  };

  const handleSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  const handleError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  // Show loading while checking session
  if (loading || isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-background">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl font-bold">Clubly</span>
          </div>
          <h1 className="font-display text-5xl font-bold mb-6 leading-tight">
            Secure your
            <br />
            <span className="text-primary">account</span>
          </h1>
          <p className="text-xl text-background/70 max-w-md leading-relaxed">
            Create a strong password to keep your Clubly account safe and secure.
          </p>
        </div>

        <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-40 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="lg:hidden flex items-center gap-2 justify-center mb-10 absolute top-8 left-1/2 -translate-x-1/2">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Clubly
          </span>
        </div>

        <ResetPasswordForm
          onUpdatePassword={handleUpdatePassword}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default ResetPassword;
