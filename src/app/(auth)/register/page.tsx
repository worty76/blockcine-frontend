"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Enhanced validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218]">
      {/* Background blur effects */}
      <div className="fixed top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <Card className="w-full max-w-md bg-[#12121A] border border-gray-800 shadow-lg relative overflow-hidden">
        {/* Digital circuit lines decoration */}
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

        {/* Hexagon pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDg0IDQ4Ij48cGF0aCBkPSJNMCwwIGgyNCB2NDggaC0yNHoiIGZpbGw9IiNmZmZmZmYxMCIvPjwvc3ZnPg==')]
          pointer-events-none"
        ></div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent pointer-events-none"></div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-center text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-cyan-400">
            Create Your Account
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

          {success && (
            <Alert className="mb-4 bg-green-900/20 border border-green-800 text-green-400">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#1A1A25] border-gray-700 focus:border-purple-500/50 text-white relative z-10"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#1A1A25] border-gray-700 focus:border-purple-500/50 text-white relative z-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative z-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300"
              >
                Login here
              </Link>
            </p>
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
