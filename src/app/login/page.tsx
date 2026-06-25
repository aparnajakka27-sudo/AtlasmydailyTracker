"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, UserPlus, Rocket } from "lucide-react";
import { FormField } from "@/components/auth/FormField";
import { verifyCredentials } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load credentials if "Remember Me" was enabled previously
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("lifetracker-email");
      const savedPass = localStorage.getItem("lifetracker-pass");
      const savedRememberStr = localStorage.getItem("lifetracker-remember");
      const savedRemember = savedRememberStr === null ? true : savedRememberStr === "true";
      
      setRememberMe(savedRemember);
      if (savedRemember) {
        if (savedEmail) setEmail(savedEmail.trim().toLowerCase());
        if (savedPass) setPassword(savedPass);
        
        // Auto-login if valid credentials exist and not currently logged in, avoiding duplicate loading triggers
        if (savedEmail && savedPass && !session && !loading) {
          setLoading(true);
          const cleanSavedEmail = savedEmail.trim().toLowerCase();
          signIn("credentials", {
            email: cleanSavedEmail,
            password: savedPass,
            redirect: false,
          }).then(res => {
            if (!res?.error) {
              router.push("/");
            } else {
              setLoading(false);
            }
          });
        }
      }
    }
  }, [session, router]);

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double-submit

    const cleanEmail = email.trim().toLowerCase();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Pre-verify credentials on backend for exact error messages
      await verifyCredentials({ email: cleanEmail, password });

      // 2. Process sign-in via NextAuth
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Login failed. Please check credentials.");
      } else {
        // Save to localStorage if "Remember Me" is checked
        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("lifetracker-email", cleanEmail);
            localStorage.setItem("lifetracker-pass", password);
            localStorage.setItem("lifetracker-remember", "true");
          } else {
            localStorage.removeItem("lifetracker-email");
            localStorage.removeItem("lifetracker-pass");
            localStorage.removeItem("lifetracker-remember");
          }
        }
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070b] px-4 relative overflow-hidden font-sans">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>

      <div className="w-full max-w-md glass-panel border border-white/5 rounded-3xl p-8 relative z-10 bg-black/40 backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 mb-4 animate-bounce">
            <Rocket className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-400">Unlock your ultimate daily planning dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center font-medium transition-all">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Email Address"
            type="email"
            value={email}
            icon={Mail}
            placeholder="you@example.com"
            disabled={loading}
            onChange={setEmail}
          />

          <div>
            <FormField
              label="Password"
              type="password"
              value={password}
              icon={Lock}
              placeholder="••••••••"
              disabled={loading}
              onChange={setPassword}
            />
            
            {/* Forgot Password Link */}
            <div className="flex justify-end mt-2">
              <Link 
                href="/forgot-password" 
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-[#07070b] transition-all"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-gray-400 cursor-pointer select-none">
              Remember my credentials
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-white/5 pt-6">
          <span>Don't have an account? </span>
          <Link href="/register" className="text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1">
            Register Account <UserPlus className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
