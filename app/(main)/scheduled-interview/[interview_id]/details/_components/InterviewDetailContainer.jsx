import { Calendar, Clock, Logs } from "lucide-react";
import { useState } from "react";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function InterviewDetailContainer({ interviewDetail }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [questionsExpanded, setQuestionsExpanded] = useState(false);
  const initialQuestionCount = 4;

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      {/* Job Position */}
      <h2 className="font-bold text-lg capitalize">
        {interviewDetail?.jobPosition}
      </h2>

      {/* Details Row */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm">
          <Clock className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-semibold text-sm">{interviewDetail?.duration}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm">
          <Calendar className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Created On</p>
            <p className="font-semibold text-sm">
              {formatDate(interviewDetail?.created_at)}
            </p>
          </div>
        </div>

        {interviewDetail?.type && interviewDetail?.type.length > 0 && (
          <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <Logs className="h-5 w-5 text-purple-500" />
              <p className="text-xs text-gray-500">Type</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {interviewDetail.type.map((t, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="mt-5">
        <h2 className="font-bold mb-2">Job Description</h2>
        <p
          className={`text-sm text-justify whitespace-pre-line transition-all ${
            descExpanded ? "" : "line-clamp-6"
          }`}
        >
          {interviewDetail?.jobDescription}
        </p>
        {interviewDetail?.jobDescription?.length > 300 && (
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            {descExpanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>

      {/* Interview Questions */}
      <div className="mt-5">
        <h2 className="font-bold">Interview Questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
          {(questionsExpanded
            ? interviewDetail?.questionList
            : interviewDetail?.questionList?.slice(0, initialQuestionCount)
          )?.map((item, index) => (
            <h2 className="text-sm w-full text-justify" key={index}>
              {index + 1}. {item?.question}
            </h2>
          ))}
        </div>
        {interviewDetail?.questionList?.length > initialQuestionCount && (
          <button
            onClick={() => setQuestionsExpanded(!questionsExpanded)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            {questionsExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}

export default InterviewDetailContainer;
