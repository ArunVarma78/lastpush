"use client";
import { Button } from "@/components/ui/button";
import { Plus, Video } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";

function LatestInterviewsList() {
  const [interviewList, setInterviewList] = useState([]);

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl mt-6 mb-2">Previous Interviews</h2>

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
    </div>
  );
}

export default LatestInterviewsList;
