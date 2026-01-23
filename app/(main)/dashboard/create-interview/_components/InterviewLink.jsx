import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  List,
  Mail,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import NextLink from "next/link";

function InterviewLink({ interview_id, formData, questionCount }) {
  const shareUrl = `${window.location.origin}/interview/${interview_id}`;

  const GetInterviewUrl = () => {
    return shareUrl;
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast("Link Copied");
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <Image
        src={"/check.png"}
        alt="check"
        width={200}
        height={200}
        className="w-[50px] h-[50px]"
      />

      <h2 className="font-bold text-lg mt-4">Your AI Interview is Ready!</h2>
      <p className="mt-3">
        Share this link with your candidates to start the interview process
      </p>

      <div className="w-full p-7 mt-6 rounded-lg bg-white">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">Interview Link</h2>
          <h2 className="p-1 px-2 text-primary bg-blue-50 rounded-4xl ">
            Valid for 30 Days
          </h2>
        </div>

        <div className="mt-3 flex gap-3 items-center">
          <Input defaultValue={GetInterviewUrl()} disabled={true} />
          <Button className="cursor-pointer" onClick={() => onCopyLink()}>
            <Copy /> Copy Link
          </Button>
        </div>

        <hr className="my-5" />

        <div className="flex gap-5">
          <h2 className="text-sm text-gray-500 flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            {formData?.duration}
          </h2>
          <h2 className="text-sm text-gray-500 flex gap-2 items-center">
            <List className="h-4 w-4" />
            {questionCount} Questions
          </h2>
          {/* <h2 className="text-sm text-gray-500 flex gap-2 items-center"><Calendar className="h-4 w-4" />30 Min{formData?.duration}</h2> */}
        </div>
      </div>

      <div className="mt-7 bg-white p-5 rounded-lg w-full">
        <h2 className="font-bold">Share Via</h2>
        <div className="flex justify-center gap-2 mt-2">
          <Button className="cursor-pointer" variant={"outline"}>
            <Mail />
            Email
          </Button>

          <Button className="cursor-pointer" variant={"outline"}>
            <Mail />
            Whatsapp
          </Button>
        </div>
      </div>

      <div className="flex w-full gap-5 justify-between mt-6">
        <NextLink href={"/dashboard"}>
          <Button className="cursor-pointer" variant={"outline"}>
            <ArrowLeft /> Back to Dashboard
          </Button>
        </NextLink>

        <NextLink href={"dashboard/create-interview"}>
          <Button className="cursor-pointer">
            <Plus /> Create New Interview
          </Button>
        </NextLink>
      </div>
    </div>
  );
}

export default InterviewLink;
