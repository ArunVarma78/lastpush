"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { Plus, Video } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/InterviewCard";
import NextLink from "next/link";

function AllInterview() {
  const [interviewList, setInterviewList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    let { data: Interviews, error } = await supabase
      .from("Interviews")
      .select("*")
      .eq("userEmail", user?.email)
      .order("id", { ascending: false });
    console.log(Interviews);
    setInterviewList(Interviews);
  };

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl">All Previous Interviews</h2>

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
          {interviewList.map((interview, index) => (
            <InterviewCard interview={interview} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AllInterview;
