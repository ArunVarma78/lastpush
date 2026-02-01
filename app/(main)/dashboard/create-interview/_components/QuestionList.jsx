import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Loader2Icon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

function QuestionList({ formData, onCreateLink }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    // Only generate once when formData is first provided
    if (formData && !hasGeneratedRef.current && !isGeneratingRef.current) {
      GenerateQuestionList();
    }
  }, [formData]);

  const GenerateQuestionList = async () => {
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current) {
      console.log("Generation already in progress, skipping...");
      return;
    }

    isGeneratingRef.current = true;
    hasGeneratedRef.current = true;
    setLoading(true);

    try {
      const result = await axios.post("/api/ai-model", {
        ...formData,
      });

      if (!result?.data?.content) {
        throw new Error("No content received from server");
      }

      let content = result.data.content;
      // Remove markdown code blocks if present
      content = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse question data");
        }
      }

      const questions = parsedData?.interviewQuestions || [];
      if (questions.length === 0) {
        toast.error("No questions generated. Please try again.");
        hasGeneratedRef.current = false; // Allow retry
      } else {
        setQuestionList(questions);
        toast.success(`Generated ${questions.length} questions!`);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(
        error.message || "Failed to generate questions. Please try again.",
      );
      setQuestionList([]);
      hasGeneratedRef.current = false; // Allow retry on error
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  };

  const onFinish = async () => {
    if (questionList.length === 0) {
      toast.error("No questions available. Please generate questions first.");
      return;
    }

    if (!user?.email) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    setSaveLoading(true);
    try {
      const interview_id = uuidv4();
      const { data, error } = await supabase
        .from("Interviews")
        .insert([
          {
            ...formData,
            questionList: questionList,
            userEmail: user.email,
            interview_id: interview_id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to create interview");
      }

      toast.success("Interview created successfully!");
      onCreateLink(interview_id, questionList.length);
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error(
        error.message || "Failed to create interview. Please try again.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 flex flex-col sm:flex-row gap-5 items-center">
          <Loader2Icon className="animate-spin h-8 w-8 text-blue-600" />
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-gray-800">
              Generating Interview Questions
            </h2>
            <p className="text-gray-600 mt-1">
              Our AI is crafting personalized questions based on your job
              position and requirements...
            </p>
          </div>
        </div>
      )}

      {!loading && questionList?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl text-gray-800">
              Generated Interview Questions
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {questionList.length} Questions
            </span>
          </div>
          <div className="space-y-3">
            {questionList.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 mb-2">
                      {item.question}
                    </p>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                      {item?.type || "General"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && questionList.length === 0 && (
        <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
          <p className="text-yellow-800">
            No questions generated. Please try again or check your inputs.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-6 border-t">
        <Button
          className="bg-blue-600 hover:bg-blue-700 px-8"
          onClick={onFinish}
          disabled={saveLoading || questionList.length === 0}
        >
          {saveLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          Create Interview Link & Finish
        </Button>
      </div>
    </div>
  );
}

export default QuestionList;
