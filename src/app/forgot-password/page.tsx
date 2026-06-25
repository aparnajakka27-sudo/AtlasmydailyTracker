"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, Sparkles } from "lucide-react";
import { FormField } from "@/components/auth/FormField";
import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");
    setResetLink("");

    try {
      const res = await forgotPassword({ email });
      setSuccessMsg("Success! We generated a reset link for you below.");
      if (res.resetLink) {
        setResetLink(res.resetLink);
      }
    } catch (err: any) {
      setError(err.message || "Failed to request link. Try again.");
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
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Reset Password</h1>
          <p className="text-sm text-gray-400">Enter your email and we'll generate a reset link</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center font-medium transition-all">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 text-center font-medium transition-all space-y-2">
            <div>🎉 {successMsg}</div>
            {resetLink && (
              <div className="mt-3 pt-3 border-t border-green-500/20 text-left">
                <p className="text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Reset URL (Local Dev Mode):</p>
                <Link 
                  href={resetLink}
                  className="block p-3 bg-black/40 rounded-xl text-indigo-400 hover:text-indigo-300 font-mono text-xs break-all border border-indigo-500/20 font-bold"
                >
                  {resetLink}
                </Link>
              </div>
            )}
          </div>
        )}

        {!successMsg && (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-white/5 pt-6">
          <Link href="/login" className="text-gray-400 hover:text-white font-semibold transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
