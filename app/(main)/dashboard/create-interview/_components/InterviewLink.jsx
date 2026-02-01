"use client";
import {
  ArrowLeft,
  Clock,
  Copy,
  List,
  Mail,
  MessageCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import NextLink from "next/link";
import { useState, useEffect } from "react";

function InterviewLink({ interview_id, formData, questionCount }) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && interview_id) {
      setShareUrl(`${window.location.origin}/interview/${interview_id}`);
    }
  }, [interview_id]);

  const onCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareViaEmail = () => {
    if (!shareUrl) return;
    const jobTitle = formData?.jobPosition || "AI Interview";
    const subject = encodeURIComponent(`Your ${jobTitle} Interview – LastPush`);
    const body = encodeURIComponent(
      `Hi,\n\nYou're invited to complete an AI-powered interview with us${jobTitle !== "AI Interview" ? ` for the ${jobTitle} role` : ""}.\n\nPlease use the link below when you're ready. We recommend a quiet space, a stable internet connection, and your camera enabled.\n\nInterview link: ${shareUrl}\n\nBest regards`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    if (!shareUrl) return;
    const jobTitle = formData?.jobPosition || "AI Interview";
    const intro =
      jobTitle !== "AI Interview"
        ? `Hi! You're invited to complete an AI interview for the ${jobTitle} role.\n\n`
        : "Hi! You're invited to complete an AI interview with us.\n\n";
    const text = encodeURIComponent(
      `${intro}Use this link when you're ready (quiet space + camera recommended):\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10 max-w-2xl mx-auto">
      <Image
        src="/check.png"
        alt="Success"
        width={200}
        height={200}
        className="w-14 h-14 object-contain"
      />

      <h2 className="font-bold text-xl mt-4 text-gray-900">
        Your AI Interview is Ready!
      </h2>
      <p className="mt-2 text-gray-600 text-center">
        Share this link with your candidates to start the interview process
      </p>

      <div className="w-full mt-6 rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:border-blue-200 transition-colors">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="font-bold text-lg">Interview Link</h3>
          <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            Valid for 30 Days
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1 font-mono text-sm bg-gray-50"
          />
          <Button
            className="shrink-0 bg-blue-500 hover:bg-blue-700"
            onClick={onCopyLink}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-200">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            {formData?.duration || "N/A"}
          </span>
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <List className="h-4 w-4 text-gray-500" />
            {questionCount} Questions
          </span>
        </div>
      </div>

      <div className="mt-6 w-full rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-3">Share via</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="hover:bg-blue-50 hover:border-blue-300"
            onClick={shareViaEmail}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            variant="outline"
            className="hover:bg-blue-50 hover:border-blue-300"
            onClick={shareViaWhatsApp}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col-reverse sm:flex-row gap-3 justify-between mt-8">
        <NextLink href="/dashboard">
          <Button
            variant="outline"
            className="w-full sm:w-auto hover:bg-blue-50 hover:border-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </NextLink>
        <NextLink href="/dashboard/create-interview">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Interview
          </Button>
        </NextLink>
      </div>
    </div>
  );
}

export default InterviewLink;
