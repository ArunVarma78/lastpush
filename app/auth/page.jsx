"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function Login() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 md:p-10">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="relative">
            <Image
              src={"/logo.jpeg"}
              alt="LastPush Logo"
              width={150}
              height={60}
              className="mx-auto"
              priority
            />
          </div>

          {/* Image */}
          <div className="relative w-full max-w-sm">
            <Image
              src={"/login.jpg"}
              alt="Login illustration"
              width={600}
              height={400}
              className="w-full h-auto rounded-xl shadow-lg"
              priority
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-blue-600">
              Welcome to LastPush
            </h1>
            <p className="text-gray-600">
              AI-Powered Interview Platform
            </p>
            <p className="text-sm text-gray-500">
              Sign in with your Google account to get started
            </p>
          </div>

          {/* Sign In Button */}
          <Button
            className="w-full h-12 text-lg font-semibold"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Continue with Google
              </>
            )}
          </Button>

          {/* Features */}
          <div className="w-full pt-6 border-t space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI-powered interview questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time voice interviews</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Automated candidate evaluation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
