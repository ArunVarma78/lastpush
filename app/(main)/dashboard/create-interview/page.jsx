"use client";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import FormContainer from "./_components/FormContainer";
import QuestionList from "./_components/QuestionList";
import InterviewLink from "./_components/InterviewLink";

function CreateInterview() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState();
  const [interviewId, setInterviewId] = useState();
  const [questionCount, setQuestionCount] = useState(0);

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    console.log("FormData", formData);
  };

  const onGoToNext = () => {
    if (
      !formData?.jobPosition ||
      !formData?.jobDescription ||
      !formData?.duration ||
      !formData?.type
    ) {
      toast("Please enter all details!");
      return;
    }

    setStep(step + 1);
  };

  const onCreateLink = (interview_id, questionCount) => {
    setInterviewId(interview_id);
    setQuestionCount(questionCount);
    setStep(step + 1);
  };

  return (
    <div className="mt-10 px-10 md:px-24 lg:px-44 xl:px-56">
      <div className="flex gap-5 items-center">
        <div
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
        >
          <ArrowLeft />
        </div>

        <h2 className="font-bold text-2xl">Create New Interview</h2>
      </div>
      <Progress value={step * 33.33} className="my-5" />

      {step == 1 ? (
        <FormContainer
          onHandleInputChange={onHandleInputChange}
          GoToNext={() => onGoToNext()}
        />
      ) : step == 2 ? (
        <QuestionList formData={formData} onCreateLink={onCreateLink} />
      ) : step == 3 ? (
        <InterviewLink
          interview_id={interviewId}
          formData={formData}
          questionCount={questionCount}
        />
      ) : null}
    </div>
  );
}

export default CreateInterview;
