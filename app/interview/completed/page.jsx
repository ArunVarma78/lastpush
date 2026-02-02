"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, PhoneOff } from "lucide-react";
import Image from "next/image";

function CompletedInterviewContent() {
  const searchParams = useSearchParams();
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminatedByProctoring, setTerminatedByProctoring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const terminated = searchParams.get("terminated") === "true";
    const proctoring = searchParams.get("proctoring") === "1";
    setIsTerminated(terminated);
    setTerminatedByProctoring(terminated && proctoring);
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            {isTerminated ? (
              <>
                <div className="absolute inset-0  rounded-full opacity-20"></div>
                <div className="relative p-4 bg-orange-100 rounded-full">
                  <PhoneOff className="h-16 w-16 text-orange-600" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 rounded-full opacity-20"></div>
                <CheckCircle2 className="h-20 w-20 text-green-500 relative z-10" />
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {isTerminated ? "Interview Terminated" : "Interview Completed!"}
          </h1>
          <p className="text-gray-600">
            {isTerminated
              ? terminatedByProctoring
                ? "The interview was ended due to proctoring violations"
                : "You ended the interview before completion"
              : "Thank you for participating in the interview"}
          </p>
        </div>

        {/* Message Section */}
        <div
          className={
            terminatedByProctoring
              ? "bg-amber-50 rounded-xl p-6 border-2 border-amber-200"
              : "bg-blue-50 rounded-xl p-6 border-2 border-blue-200"
          }
        >
          <div className="text-center space-y-4">
            {terminatedByProctoring ? (
              <>
                <p className="text-gray-700 text-lg font-semibold">
                  You exceeded the allowed proctoring violations (3 chances). The interview has been terminated.
                </p>
                <p className="text-gray-600">
                  The recruiter has been notified. If you have questions, please contact the recruiter.
                </p>
              </>
            ) : isTerminated ? (
              <>
                <p className="text-gray-700 text-lg">
                  Your interview has been terminated. The recruiter has been notified.
                </p>
                <p className="text-gray-600">
                  If you'd like to complete the interview, please contact the recruiter or wait for further instructions.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 text-lg font-semibold">
                  Your interview has been successfully completed!
                </p>
                <p className="text-gray-600">
                  The recruiter will review your interview and get back to you soon. If you're selected, they will contact you directly.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center pt-4">
          <Image
            src="/logo.jpeg"
            alt="LastPush Logo"
            width={120}
            height={40}
            className="opacity-60"
          />
        </div>
      </div>
    </div>
  );
}

function CompletedInterviewFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export default function CompletedInterview() {
  return (
    <Suspense fallback={<CompletedInterviewFallback />}>
      <CompletedInterviewContent />
    </Suspense>
  );
}
