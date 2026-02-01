"use client";
import InterviewList from "@/components/shared/InterviewList";

const SCHEDULED_SELECT =
  "jobPosition, duration, type, questionList, interview_id, created_at, interview-feedback(userEmail)";

function ScheduledInterview() {
  return (
    <InterviewList
      title="Interview List with Candidate Feedback"
      viewDetail={true}
      selectFields={SCHEDULED_SELECT}
    />
  );
}

export default ScheduledInterview;
