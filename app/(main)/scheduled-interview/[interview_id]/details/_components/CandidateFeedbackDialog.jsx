import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const skills = [
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "communication", label: "Communication" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "experience", label: "Experience" },
];

function CandidateFeedbackDialog({ candidate }) {
  const feedback = candidate?.feedback?.feedback;
  const isRejected = feedback?.recommendation === "No";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          View Report
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Candidate Report
          </DialogTitle>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="mt-6 space-y-6">
            {/* Candidate Header */}
            <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg">
                  {candidate?.userName?.[0]}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {candidate?.userName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {candidate?.userEmail}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                {formatDate(candidate?.created_at)}
              </p>
            </div>

            {/* Skill Assessment */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">Skill Assessment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["technicalSkills", "Technical Skills"],
                  ["communication", "Communication"],
                  ["problemSolving", "Problem Solving"],
                  ["experience", "Experience"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium">
                        {feedback?.rating?.[key]}/10
                      </span>
                    </div>
                    <Progress value={feedback?.rating?.[key] * 10} />
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-3">Performance Summary</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {feedback?.summary?.map((item, i) => (
                  <p key={i}>• {item}</p>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div
              className={`
            p-5 rounded-xl shadow-sm
            ${feedback?.recommendation === "No" ? "bg-red-50" : "bg-green-50"}
          `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p
                    className={`font-semibold ${
                      feedback?.recommendation === "No"
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    Recommendation
                  </p>

                  <p className="text-sm mt-1">{feedback?.recommendationMsg}</p>
                </div>

                <Button
                  className={`
                w-full sm:w-auto cursor-pointer
                ${
                  feedback?.recommendation === "No"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }
              `}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default CandidateFeedbackDialog;
