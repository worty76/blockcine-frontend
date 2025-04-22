"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/useAuthStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Handle redirection after successful login
  useEffect(() => {
    if (shouldRedirect && isAuthenticated) {
      router.push("/");
    }
  }, [shouldRedirect, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isRegistering
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

      const payload = isRegistering
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Check for error messages from our API
      if (data.message && response.status >= 400) {
        throw new Error(data.message);
      }

      if (isRegistering) {
        // If registration is successful, switch to login
        setIsRegistering(false);
        setEmail(""); // Clear fields after successful registration
        setPassword("");
        setName("");
        return;
      }

      // For login, handle token and userId
      if (data.token && data.userId) {
        // Use the Zustand store instead of localStorage
        login(
          {
            id: data.userId,
            email: email,
            isAdmin: data.isAdmin || false,
            // Include name if available in the response
            ...(data.name && { name: data.name }),
          },
          data.token
        );

        // Set flag to redirect instead of calling router.push directly
        setShouldRedirect(true);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRegisterMode = () => {
    setIsRegistering(!isRegistering);
    setError(""); // Clear any previous errors when switching modes
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218]">
      {/* Background blur effects - ensuring they're behind other elements */}
      <div className="fixed top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <Card className="w-full max-w-md bg-[#12121A] border border-gray-800 shadow-lg relative overflow-hidden">
        {/* Digital circuit lines decoration - ensuring it doesn't block interactions */}
        <svg
          className="absolute bottom-0 left-0 w-full h-12 opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 20"
        >
          <path
            d="M0,10 L20,10 C30,10 30,0 40,0 L100,0"
            stroke="url(#grad)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0,20 L30,20 C40,20 40,10 50,10 L100,10"
            stroke="url(#grad)"
            strokeWidth="1"
            fill="none"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hexagon pattern overlay - ensuring it doesn't block interactions */}
        <div
          className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDg0IDQ4Ij48cGF0aCBkPSJNMCwwIGgyNCB2NDggaC0yNHoiIGZpbGw9IiNmZmZmZmYxMCIvPjwvc3ZnPg==')]
        pointer-events-none"
        ></div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent pointer-events-none"></div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-center text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-cyan-400">
            {isRegistering ? "Create an Account" : "Login to Your Account"}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-900/20 border border-red-800 text-red-400"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegistering}
                  className="bg-[#1A1A25] border-gray-700 focus:border-purple-500/50 text-white relative z-10"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1A1A25] border-gray-700 focus:border-purple-500/50 text-white relative z-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1A1A25] border-gray-700 focus:border-purple-500/50 text-white relative z-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative z-10"
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isRegistering
                ? "Register"
                : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={toggleRegisterMode}
              className="p-0 text-purple-400 hover:text-purple-300 relative z-10"
            >
              {isRegistering
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Secured with blockchain technology
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
