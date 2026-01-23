import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

function QuestionList({ formData, onCreateLink }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);

  useEffect(() => {
    if (formData) {
      GenerateQuestionList();
    }
  }, [formData]);

  const GenerateQuestionList = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/ai-model", {
        ...formData,
      });

      console.log(result);
      const Content = result.data.content;
      const FINAL_CONTENT = Content.replace("```json", "").replace("```", "");

      setQuestionList(JSON.parse(FINAL_CONTENT)?.interviewQuestions);
    } catch (e) {
      toast("Server Error, Try Again!");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    setSaveLoading(true);
    const interview_id = uuidv4();
    const { data, error } = await supabase
      .from("Interviews")
      .insert([
        {
          ...formData,
          questionList: questionList,
          userEmail: user?.email,
          interview_id: interview_id,
        },
      ])
      .select();

    setSaveLoading(false);
    console.log("questionCount", questionList.length);
    onCreateLink(interview_id, questionList.length);
  };

  return (
    <div>
      {loading && (
        <div className="p-5 bg-blue-50 rounded-xl border border-primary flex gap-5 items-center">
          <Loader2Icon className="animate-spin" />
          <div>
            <h2 className="font-medium">Generating Interview Questions</h2>
            <p className="text-primary">
              Our AI is crafting personalized questions based on your job
              position
            </p>
          </div>
        </div>
      )}

      {questionList?.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-5">
            Generated Interview Questions:
          </h2>
          <div className="p-5 border border-gray-300 rounded-xl bg-white">
            {questionList.map((item, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-xl mb-3"
              >
                <h2 className="font-medium">{item.question}</h2>
                <h2 className="text-sm text-gray-500">Type: {item?.type}</h2>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-10">
        <Button
          className="cursor-pointer"
          onClick={() => onFinish()}
          disabled={saveLoading}
        >
          {saveLoading && <Loader2 className="animate-spin" />}
          Create Interview Link & Finish
        </Button>
      </div>
    </div>
  );
}

export default QuestionList;
