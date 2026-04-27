import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();

        localStorage.setItem("finai_session_id", data.session_id);
        localStorage.setItem("finai_business_type", data.business_type);
        localStorage.setItem("finai_username", data.username);

        toast({
          title: "Login Successful",
          description: `Welcome, ${data.username}!`,
        });

        setTimeout(() => navigate("/demo"), 100);
      } catch (error: any) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google Sign-In Failed",
        description: "Could not complete Google authentication.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 flex flex-col justify-center items-center px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-2">
            <Lock className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            FinAI Portal Access
          </CardTitle>
          <CardDescription>
            Sign in with your Google account to access your personalized CRM and financial models.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <Button
            onClick={() => login()}
            disabled={loading}
            className="w-full h-12 text-base font-semibold flex items-center gap-3 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all"
            variant="outline"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Authenticating..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
