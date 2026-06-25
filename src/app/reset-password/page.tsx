"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/auth/FormField";
import { resetPassword } from "@/services/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token. Please check reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-400 font-medium">⚠️ Invalid request. Reset token is missing.</p>
        <Link href="/login" className="text-indigo-400 hover:underline text-sm font-semibold">
          Go back to Login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="inline-flex p-3 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 mb-1 animate-pulse">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful!</h2>
          <p className="text-sm text-gray-400">Your password has been updated. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="New Password"
        type="password"
        value={password}
        icon={Lock}
        placeholder="•••••••• (Min. 6 characters)"
        disabled={loading}
        onChange={setPassword}
      />

      <FormField
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        icon={Lock}
        placeholder="••••••••"
        disabled={loading}
        onChange={setConfirmPassword}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <span>Reset Password</span>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070b] px-4 relative overflow-hidden font-sans">
      {/* Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>

      <div className="w-full max-w-md glass-panel border border-white/5 rounded-3xl p-8 relative z-10 bg-black/40 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create New Password</h1>
          <p className="text-sm text-gray-400">Complete the form below to restore your account access</p>
        </div>

        {/* Suspense boundary for useSearchParams Hook */}
        <Suspense fallback={
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            <p className="text-xs text-gray-400">Loading reset token...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

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
