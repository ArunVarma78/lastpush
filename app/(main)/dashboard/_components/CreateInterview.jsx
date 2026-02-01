"use client";
import { Video, ArrowRight } from "lucide-react";
import Link from "next/link";

function CreateInterview() {
  return (
    <Link href={"/dashboard/create-interview"}>
      <div className="group border-2 border-blue-200 rounded-xl p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
        <div className="relative">
          <div className="relative bg-blue-500 p-4 rounded-xl">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Create New Interview
            </h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Create AI-powered interviews and evaluate candidates effortlessly
          </p>
          <div className="flex items-center gap-2 mt-3 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CreateInterview;
