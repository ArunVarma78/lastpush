"use client";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Info, Loader2Icon, Shield, Monitor, MousePointer, Copy, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";
import { InterviewDataContext } from "@/context/InterviewDataContext";

function Interview() {
  const { interview_id } = useParams();
  const [interviewData, setInterviewData] = useState();
  const [userName, setUserName] = useState();
  const [userEmail, setUserEmail] = useState();
  const [loading, setLoading] = useState(false);
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const router = useRouter();

  useEffect(() => {
    interview_id && GetInterviewDetails();
  }, [interview_id]);

  // Request fullscreen when user lands on the interview page
  useEffect(() => {
    const enterFullscreen = () => {
      try {
        const doc = document.documentElement;
        if (doc.requestFullscreen) {
          doc.requestFullscreen().catch(() => {});
        }
      } catch (_) {}
    };
    enterFullscreen();
  }, []);

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("jobPosition, jobDescription, duration, type, questionList")
        .eq("interview_id", interview_id);

      if (error) {
        throw error;
      }

      if (!Interviews || Interviews.length === 0) {
        toast.error("Interview not found. Please check the link.");
        router.push("/");
        return;
      }

      setInterviewData(Interviews[0]);
    } catch (error) {
      console.error("Error fetching interview:", error);
      toast.error("Failed to load interview. Please try again.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const onJoinInterview = async () => {
    // Validate inputs
    const newErrors = {};
    if (!userName || userName.trim().length < 2) {
      newErrors.userName = "Name must be at least 2 characters";
    }
    if (!userEmail || !validateEmail(userEmail)) {
      newErrors.userEmail = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("*")
        .eq("interview_id", interview_id);

      if (error) {
        throw error;
      }

      if (!Interviews || Interviews.length === 0) {
        toast.error("Interview not found");
        return;
      }

      setInterviewInfo({
        userName: userName.trim(),
        userEmail: userEmail.trim().toLowerCase(),
        interviewData: Interviews[0],
      });
      router.push("/interview/" + interview_id + "/start");
    } catch (error) {
      console.error("Error joining interview:", error);
      toast.error("Failed to join interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Image
            src={"/logo.jpeg"}
            alt="LastPush Logo"
            width={150}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI-Powered Interview
          </h1>
          <p className="text-gray-600">Get ready for your interview</p>
        </div>

        {/* Interview Details */}
        {interviewData && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {interviewData.jobPosition}
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Duration: {interviewData.duration}</span>
            </div>
            {interviewData.type && interviewData.type.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {interviewData.type.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proctoring rules – show before user fills data so they don't make mistakes */}
        <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="text-amber-600 h-6 w-6 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Proctoring rules – please read</h3>
              <p className="text-sm text-amber-800 mt-1">
                Each violation counts as <strong>1 strike</strong>. After <strong>3 strikes</strong> the interview will be terminated automatically.
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <Monitor className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span><strong>Stay in fullscreen</strong> – Do not exit fullscreen.</span>
            </li>
            <li className="flex items-start gap-2">
              <Monitor className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span><strong>Stay on this tab</strong> – Do not switch tabs or windows.</span>
            </li>
            <li className="flex items-start gap-2">
              <Copy className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span><strong>No copy/paste</strong> – Do not use copy, paste, or cut.</span>
            </li>
            <li className="flex items-start gap-2">
              <Keyboard className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span><strong>No shortcut keys</strong> – Do not use Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A.</span>
            </li>
            <li className="flex items-start gap-2">
              <MousePointer className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span><strong>No right-click</strong> – Do not use the right-click menu.</span>
            </li>
          </ul>
          <p className="mt-4 text-amber-800 font-medium text-sm">
            Please follow these rules to avoid disqualification.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              className={errors.userName ? "border-red-500" : ""}
              placeholder="Enter your full name"
              value={userName || ""}
              onChange={(e) => {
                setUserName(e.target.value);
                if (errors.userName) {
                  setErrors((prev) => ({ ...prev, userName: "" }));
                }
              }}
              maxLength={100}
            />
            {errors.userName && (
              <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              className={errors.userEmail ? "border-red-500" : ""}
              placeholder="Enter your email address"
              value={userEmail || ""}
              onChange={(e) => {
                setUserEmail(e.target.value);
                if (errors.userEmail) {
                  setErrors((prev) => ({ ...prev, userEmail: "" }));
                }
              }}
              maxLength={255}
            />
            {errors.userEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.userEmail}</p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Before you begin</h3>
              <ul className="space-y-1.5 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Test your camera and microphone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Ensure you have a stable internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Find a quiet place for the interview</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Join Button */}
        <Button
          className="mt-6 w-full h-12 text-lg font-semibold"
          disabled={loading || !userName || !userEmail}
          onClick={onJoinInterview}
        >
          {loading ? (
            <>
              <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Join Interview
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default Interview;
