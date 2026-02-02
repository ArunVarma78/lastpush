"use client";
import { useState } from "react";
import { InterviewDataContext } from "@/context/InterviewDataContext";

function InterviewLayout({ children }) {
  const [interviewInfo, setInterviewInfo] = useState();

  return (
    <InterviewDataContext.Provider value={{ interviewInfo, setInterviewInfo }}>
      <div className="bg-secondary">
        {children}
      </div>
    </InterviewDataContext.Provider>
  );
}

export default InterviewLayout;
