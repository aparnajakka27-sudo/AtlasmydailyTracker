"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, UserPlus, LogIn, Rocket } from "lucide-react";
import { FormField } from "@/components/auth/FormField";
import { registerUser } from "@/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return; // Prevent double-submit

    // Client-side validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create user
      const registerRes = await registerUser({ name, email, password });
      
      setSuccess(true);
      
      // Save credentials in localStorage for automatic logins & persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("lifetracker-email", email);
        localStorage.setItem("lifetracker-pass", password);
      }

      // Auto sign-in immediately so user is logged in automatically
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError("Account registered successfully, but automatic sign-in failed. Please login manually.");
        setSuccess(false);
      } else {
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
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
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-sm text-gray-400">Join Atlas & start tracking your daily progress</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center font-medium transition-all">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 text-center font-medium transition-all">
            🎉 Account created successfully! Logging you in...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Full Name"
            type="text"
            value={name}
            icon={User}
            placeholder="Aparna Jakka"
            disabled={loading || success}
            onChange={setName}
          />

          <FormField
            label="Email Address"
            type="email"
            value={email}
            icon={Mail}
            placeholder="aparnajakka27@gmail.com"
            disabled={loading || success}
            onChange={setEmail}
          />

          <FormField
            label="Password"
            type="password"
            value={password}
            icon={Lock}
            placeholder="•••••••• (Min. 6 characters)"
            disabled={loading || success}
            onChange={setPassword}
          />

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-white/5 pt-6">
          <span>Already have an account? </span>
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1">
            Log In <LogIn className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
