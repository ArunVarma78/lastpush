"use client";
import { useUser } from "@/app/provider";
import Image from "next/image";
import { Sparkles, Zap } from "lucide-react";

function WelcomeContainer() {
  const { user } = useUser();

  return (
    <div className="bg-blue-600 rounded-xl shadow-lg p-6 md:p-8 text-white">
      {/* Background decoration */}

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.name || "User"}!
            </h2>
          </div>
          <p className="text-blue-100 text-sm md:text-base">
            AI-Driven Interviews, Hassle-Free Hiring
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full mt-4">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
        </div>

        {user?.picture && (
          <Image
            src={user.picture}
            alt="User Avatar"
            width={64}
            height={64}
            className="rounded-full border-4 border-white shadow-lg relative z-10"
          />
        )}
      </div>
    </div>
  );
}

export default WelcomeContainer;
