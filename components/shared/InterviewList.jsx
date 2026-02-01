"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { Plus, Video, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useEffect, useState } from "react";
import InterviewCard from "@/app/(main)/dashboard/_components/InterviewCard";
import NextLink from "next/link";
import { toast } from "sonner";

function InterviewList({
  limit = null,
  title = "Interviews",
  showEmptyState = true,
  viewDetail = false,
  selectFields = "*",
}) {
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      GetInterviewList();
    } else {
      setLoading(false);
    }
  }, [user]);

  const GetInterviewList = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("Interviews")
        .select(selectFields)
        .eq("userEmail", user?.email)
        .order("id", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: Interviews, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setInterviewList(Interviews || []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError("Failed to load interviews. Please try again.");
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-5">
        <h2 className="font-bold text-2xl mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(limit || 6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border p-5 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-5">
        <h2 className="font-bold text-2xl mb-4">{title}</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={GetInterviewList} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl mb-4">{title}</h2>

      {interviewList?.length === 0 && showEmptyState && (
        <div className="rounded-xl border-2 border-blue-200 hover:border-blue-400 p-8 flex flex-col gap-4 items-center">
          <div className="relative">
            <Video className="h-16 w-16 text-blue-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No interviews yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first AI-powered interview to get started
            </p>
          </div>
          <NextLink href="/dashboard/create-interview">
            <Button className="bg-blue-600 hover:bg-blue-700 ">
              <Plus className="mr-2 h-4 w-4" />
              Create New Interview
            </Button>
          </NextLink>
        </div>
      )}

      {interviewList && interviewList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {interviewList.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={interview.id || interview.interview_id || index}
              viewDetail={viewDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewList;
