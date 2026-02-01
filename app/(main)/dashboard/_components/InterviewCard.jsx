"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Copy,
  Send,
  Calendar,
  Clock,
  FileQuestion,
} from "lucide-react";
import NextLink from "next/link";
import { useState, useEffect } from "react";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function InterviewCard({ interview, viewDetail = false }) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(
        `${window.location.origin}/interview/${interview?.interview_id}`,
      );
    }
  }, [interview?.interview_id]);

  const copyLink = async () => {
    try {
      if (!shareUrl) {
        toast.error("Link not ready yet");
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const onSend = () => {
    if (!shareUrl) {
      toast.error("Link not ready yet");
      return;
    }
    try {
      const jobTitle = interview?.jobPosition || "AI Interview";
      const subject = encodeURIComponent(`Your ${jobTitle} Interview – LastPush`);
      const body = encodeURIComponent(
        `Hi,\n\nYou're invited to complete an AI-powered interview with us${jobTitle !== "AI Interview" ? ` for the ${jobTitle} role` : ""}.\n\nPlease use the link below when you're ready. We recommend a quiet space, a stable internet connection, and your camera enabled.\n\nInterview link: ${shareUrl}\n\nBest regards`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch (error) {
      console.error("Failed to open email:", error);
      toast.error("Failed to open email client");
    }
  };

  const candidateCount = interview?.["interview-feedback"]?.length || 0;

  return (
    <div className="group bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {interview?.jobPosition || "Untitled Interview"}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(interview?.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Type Tags */}
      {interview?.type && interview.type.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {interview.type.slice(0, 3).map((type, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
            >
              {type}
            </span>
          ))}
          {interview.type.length > 3 && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              +{interview.type.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-5">
        <div className="flex items-center gap-1">
          <FileQuestion className="h-4 w-4" />
          <span>{interview?.questionList?.length || 0} Questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{interview?.duration || "N/A"}</span>
        </div>
        {viewDetail && candidateCount > 0 && (
          <div className="ml-auto flex items-center gap-1 text-green-600 font-semibold">
            <span>{candidateCount}</span>
            <span className="text-xs">Candidates</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {!viewDetail ? (
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1 hover:bg-blue-50 hover:border-blue-300"
            onClick={copyLink}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>

          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={onSend}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      ) : (
        <NextLink
          href={"/scheduled-interview/" + interview?.interview_id + "/details"}
        >
          <Button
            className="w-full hover:bg-blue-50 hover:border-blue-300"
            variant="outline"
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </NextLink>
      )}
    </div>
  );
}

export default InterviewCard;
