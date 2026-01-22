import { Video } from "lucide-react";
import Link from "next/link";

function CreateInterview() {
  return (
    <div>
      <Link
        href={"/dashboard/create-interview"}
        className="bg-white border border-gray-200 rounded-lg p-5 flex gap-6 cursor-pointer"
      >
        <Video className="p-3 text-primary bg-blue-50 rounded-lg h-12 w-12" />

        <div>
          <h2 className="font-bold">Create New Interview</h2>
          <p className="text-gray-500">
            Create AI-powered interviews and evaluate candidates effortlessly.
          </p>
        </div>
      </Link>
    </div>
  );
}

export default CreateInterview;
