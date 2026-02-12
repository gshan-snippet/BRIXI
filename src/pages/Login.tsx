import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email) {
      toast.error("Please enter your email");
      return;
    }
    if (!form.password) {
      toast.error("Please enter a password");
      return;
    }
    if (isSignup && !form.name) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isSignup) {
        response = await authAPI.register(form.email, form.password, form.name, form.phone);
      } else {
        response = await authAPI.login(form.email, form.password);
      }

      if (response.success && response.user) {
        // Store user info in sessionStorage
        sessionStorage.setItem("userId", response.user.id);
        sessionStorage.setItem("userEmail", response.user.email);
        sessionStorage.setItem("userName", response.user.name);
        sessionStorage.setItem("userRole", response.user.role);
        sessionStorage.setItem("userPhone", response.user.phone || "");

        // Trigger a custom event to update navigation
        window.dispatchEvent(new Event("userChanged"));

        toast.success(isSignup ? "Account created successfully!" : "Logged in successfully!");
        
        // Redirect based on role
        if (response.user.role === "operator") {
          navigate("/");
        } else {
          navigate("/");
        }
      } else {
        toast.error(response.error || "Authentication failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">
            {isSignup ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignup ? "Sign up to book trusted workers" : "Log in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : (isSignup ? "Create Account" : "Log In")}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setForm({ name: "", phone: "", email: "", password: "" });
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
