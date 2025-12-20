"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const from = searchParams.get("from") || "/dashboard";
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Title */}
      <h1 className="text-white text-[32px] font-bold leading-tight text-left pb-2">
        Welcome Back
      </h1>
      
      <p className="text-gray-600 text-base font-normal leading-normal pb-8">
        Please enter your details to sign in.
      </p>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        
        {/* Form Fields Container */}
        <div className="flex flex-col gap-4">
          
          {/* Username Field */}
          <label className="flex flex-col flex-1">
            <p className="text-white text-base font-medium leading-normal pb-2">
              Username or Email
            </p>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1a1a1a] focus:outline-0 focus:ring-2 focus:ring-[#d4b896]/50 border border-[#e0d5c7] bg-[#f8f6f3] focus:border-[#d4b896] h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal transition-all"
              placeholder="Enter your username or email"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </label>

          {/* Password Field */}
          <label className="flex flex-col flex-1">
            <div className="flex justify-between items-center pb-2">
              <p className="text-white text-base font-medium leading-normal">
                Password
              </p>
              <a
                className="text-[#d4b896] text-sm font-medium hover:text-[#c4a886] transition-colors cursor-pointer"
                href="#"
              >
                Forgot password?
              </a>
            </div>
            
            {/* Password Input with Toggle Button */}
            <div className="flex w-full flex-1 items-stretch">
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none border-r-0 text-[#1a1a1a] focus:outline-0 focus:ring-2 focus:ring-[#d4b896]/50 border border-[#e0d5c7] bg-[#f8f6f3] focus:border-[#d4b896] h-14 placeholder:text-gray-400 p-[15px] pr-2 text-base font-normal leading-normal transition-all"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              
              {/* Show/Hide Password Button */}
              <button
                className="text-gray-500 flex border border-[#e0d5c7] bg-[#f8f6f3] items-center justify-center px-4 rounded-r-lg border-l-0 hover:bg-[#f0ebe5] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#d4b896]/50 transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

        </div>

        {/* Submit Button */}
        <button
          className="flex items-center justify-center text-center font-medium relative rounded-lg px-6 py-4 text-base text-[#1a1a1a] bg-[#d4b896] hover:bg-[#c4a886] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4b896] h-14 w-full mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging in...
            </span>
          ) : (
            "Log In"
          )}
        </button>
      </form>
    </>
  );
}