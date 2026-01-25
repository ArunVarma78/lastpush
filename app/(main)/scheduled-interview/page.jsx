"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { Plus, Video } from "lucide-react";
import { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/InterviewCard";

function ScheduledInterview() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState();
  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    const result = await supabase
      .from("Interviews")
      .select(
        "jobPosition, duration, type, questionList, interview_id, created_at, interview-feedback(userEmail)",
      )
      .eq("userEmail", user?.email)
      .order("id", { ascending: false });

    console.log(result);
    setInterviewList(result.data);
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl">
        Interview List with Candidate Feedback
      </h2>

      {interviewList?.length == 0 && (
        <div className="p-5 flex flex-col gap-2 items-center bg-white rounded-lg">
          <Video className="h-10 w-10 text-primary" />
          <h2>You haven’t created any interviews yet.</h2>

          <NextLink href="/dashboard/create-interview">
            <Button className="cursor-pointer">
              <Plus />
              Create New Interview
            </Button>
          </NextLink>
        </div>
      )}

      {interviewList && (
        <div className="grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5">
          {interviewList?.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={index}
              viewDetail={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScheduledInterview;
