import CandidateFeedbackDialog from "./CandidateFeedbackDialog";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function CandidateList({ candidateList }) {
  return (
    <div>
      <h2 className="font-bold my-5 text-xl">
        Candidates ({candidateList?.length})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {candidateList?.map((candidate, index) => (
          <div
            key={index}
            className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary w-12 h-12 flex items-center justify-center font-bold text-white rounded-full text-lg">
                {candidate.userName[0]}
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-800">
                    {candidate?.userName}
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-gray-500 font-normal">
                    {candidate.userEmail}
                  </p>
                </div>

                <p className="text-sm text-gray-400 mt-1">
                  {formatDate(candidate?.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-0">
              <CandidateFeedbackDialog candidate={candidate} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CandidateList;
