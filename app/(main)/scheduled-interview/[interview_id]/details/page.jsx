"use client";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import InterviewDetailContainer from "./_components/InterviewDetailContainer";
import CandidatList from "./_components/CandidatList";

function InterviewDetail() {
  const { interview_id } = useParams();
  const { user } = useUser();
  const [interviewDetail, setInterviewDetail] = useState();

  useEffect(() => {
    user && GetInterviewDetail();
  }, [user]);

  const GetInterviewDetail = async () => {
    const result = await supabase
      .from("Interviews")
      .select(
        `jobPosition, jobDescription, type, questionList, duration,
        interview_id, created_at, interview-feedback(userEmail, userName, feedback, created_at)`,
      )
      .eq("userEmail", user?.email)
      .eq("interview_id", interview_id);

    setInterviewDetail(result?.data[0]);
    console.log(result);
  };

  return (
    <>
      <h2 className="mt-6 mb-2 font-bold text-2xl">Interview Detail</h2>
      <InterviewDetailContainer interviewDetail={interviewDetail} />
      <CandidatList candidateList={interviewDetail?.["interview-feedback"]} />
    </>
  );
}

export default InterviewDetail;
