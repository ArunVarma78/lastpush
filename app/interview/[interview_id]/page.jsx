"use client";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Info, Loader2Icon, Video } from "lucide-react";
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

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      let { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("jobPosition, jobDescription, duration, type, questionList")
        .eq("interview_id", interview_id);

      setInterviewData(Interviews[0]);
      if (Interviews?.length == 0) {
        toast("Incorrect Interview Link");
        return;
      }
    } catch (e) {
      toast("Incorrect Interview Link");
    } finally {
      setLoading(false);
    }
  };

  const onJoinInterview = async () => {
    setLoading(true);

    let { data: Interviews, error } = await supabase
      .from("Interviews")
      .select("*")
      .eq("interview_id", interview_id);

    console.log(Interviews[0]);
    setInterviewInfo({
      userName: userName,
      userEmail: userEmail,
      interviewData: Interviews[0],
    });
    router.push("/interview/" + interview_id + "/start");
    setLoading(false);
  };

  return (
    <div className="px-4 sm:px-10 mt-7 pb-20">
      <div className="flex flex-col items-center justify-center border rounded-lg bg-white p-7 mx-auto max-w-2xl">
        <Image
          src={"/logo.jpeg"}
          alt="logo"
          width={100}
          height={100}
          className="w-35"
        />
        <h2 className="text-gray-500 mt-3">AI-Powered Interview Platform</h2>

        <Image
          src={"/interview.jpg"}
          alt="interview"
          width={500}
          height={500}
          className="w-70 my-6"
        />

        <h2 className="font-bold text-xl">{interviewData?.jobPosition}</h2>
        <h2 className="flex gap-2 items-center text-gray-500 my-3">
          <Clock className="h-4 w-4" />
          Duration: {interviewData?.duration}
        </h2>

        <div className="flex items-center gap-4 w-full mb-5">
          <label className="font-medium">Name: </label>
          <Input
            className="flex-1"
            placeholder="Enter you name"
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full mb-5">
          <label className="font-medium">Email: </label>
          <Input
            className="flex-1"
            placeholder="Enter you email"
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>

        <div className="p-4 bg-blue-100 rounded-lg flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Info className="text-primary h-5 w-5" />
            <h2 className="font-bold text-primary">Before you begin</h2>
          </div>

          {/* List */}
          <ul className="list-disc list-inside text-sm text-primary space-y-1">
            <li>Test your camera and microphone</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Find a quiet place for the interview</li>
          </ul>
        </div>

        <Button
          className={"mt-5 w-full font-bold"}
          disabled={loading || !userName || !userEmail}
          onClick={() => onJoinInterview()}
        >
          <Video />
          {loading && <Loader2Icon />} Join Interview
        </Button>
      </div>
    </div>
  );
}

export default Interview;
