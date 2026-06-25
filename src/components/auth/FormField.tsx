"use client";

import React, { useState } from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  onChange: (val: string) => void;
}

export function FormField({
  label,
  type,
  value,
  placeholder,
  required = true,
  disabled = false,
  icon: Icon,
  onChange
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const renderType = () => {
    if (isPassword) {
      return showPassword ? "text" : "password";
    }
    return type;
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative rounded-xl overflow-hidden group">
        {/* Left Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
          <Icon className="w-4 h-4" />
        </div>

        {/* Input */}
        <input
          type={renderType()}
          required={required}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />

        {/* Hide/Show Toggle */}
        {isPassword && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
