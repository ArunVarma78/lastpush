"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Send } from "lucide-react";
import NextLink from "next/link";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function InterviewCard({ interview, viewDetail = false }) {
  const shareUrl = `${window.location.origin}/${interview?.interview_id}`;
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast("Copied");
  };

  const onSend = () => {
    window.location.href =
      "mailto:codingbee@gmail.com?subject=AiCruiter Interview Link & body=Interview Link:" +
      shareUrl;
  };

  return (
    <div className="p-5 bg-white rounded-lg border">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg capitalize">
          {interview?.jobPosition}
        </h2>
        <h2 className="text-sm">{formatDate(interview?.created_at)}</h2>
      </div>

      <p>Type: {interview?.type?.join(" • ")}</p>

      <h2 className="mt-2 flex justify-between text-gray-500">
        {interview?.questionList?.length} Questions • {interview?.duration}
      </h2>

      {!viewDetail ? (
        <div className="flex gap-3 w-full mt-5">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={copyLink}
          >
            <Copy /> Copy Link
          </Button>

          <Button className="flex-1 cursor-pointer" onClick={onSend}>
            <Send /> Send
          </Button>
        </div>
      ) : (
        <NextLink
          href={"/scheduled-interview/" + interview?.interview_id + "/details"}
        >
          <Button className="mt-5 w-full cursor-pointer" variant="outline">
            View Detail <ArrowRight />
          </Button>
        </NextLink>
      )}
    </div>
  );
}

export default InterviewCard;
