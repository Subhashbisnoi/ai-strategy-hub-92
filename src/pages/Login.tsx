import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("user123");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      
      // Store session locally
      localStorage.setItem("finai_session_id", data.session_id);
      localStorage.setItem("finai_business_type", data.business_type);
      localStorage.setItem("finai_username", data.username);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });

      // Give toast a tiny bit of time to show
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
  };

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
            Enter your secure credentials to access your personalized CRM and financial models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium">Username</label>
              <Input
                placeholder="e.g. user1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-primary h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02]" disabled={loading || !username}>
               {loading ? "Authenticating..." : "Secure Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 bg-slate-50/50 p-6 border-t rounded-b-xl text-sm text-slate-500 text-center">
           <p className="font-medium text-slate-700">Available Demo Accounts:</p>
           <ul className="flex flex-wrap gap-2 justify-center">
             <li className="bg-white border shadow-sm px-3 py-1 rounded-full cursor-pointer hover:bg-slate-50 hover:border-primary transition-colors" onClick={() => setUsername("user1")}>user1</li>
             <li className="bg-white border shadow-sm px-3 py-1 rounded-full cursor-pointer hover:bg-slate-50 hover:border-primary transition-colors" onClick={() => setUsername("user2")}>user2</li>
             <li className="bg-white border shadow-sm px-3 py-1 rounded-full cursor-pointer hover:bg-slate-50 hover:border-primary transition-colors" onClick={() => setUsername("user3")}>user3</li>
             <li className="bg-white border shadow-sm px-3 py-1 rounded-full cursor-pointer hover:bg-slate-50 hover:border-primary transition-colors" onClick={() => setUsername("user4")}>user4</li>
           </ul>
           <p className="text-xs pt-2">Password: <span className="font-mono bg-white border px-2 py-0.5 rounded shadow-sm">user123</span></p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
