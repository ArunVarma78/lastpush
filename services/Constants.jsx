import {
  Crown,
  List,
  Puzzle,
  Calendar,
  Code2Icon,
  Settings,
  User2Icon,
  WalletCards,
  LayoutDashboard,
  BriefcaseBusinessIcon,
} from "lucide-react";

export const SideBarOptions = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Schedule Interview",
    icon: Calendar,
    path: "/schedule-interview",
  },
  {
    name: "All Interview",
    icon: List,
    path: "/all-interview",
  },
  {
    name: "Billing",
    icon: WalletCards,
    path: "/billing",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export const InterviewType = [
  {
    title: "Technical",
    icon: Code2Icon,
  },
  {
    title: "Behavioral",
    icon: User2Icon,
  },
  {
    title: "Experience",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Problem Solving",
    icon: Puzzle,
  },
  {
    title: "Leadership",
    icon: Crown,
  },
];

export const QUESTIONS_PROMPT = `
You are an expert technical interviewer. Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}
Job Description:{{jobDescription}}
Interview Duration: {{duration}}
Interview Type: {{type}}

📝 Your task:
Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {{type}} interview.

🧩 Format your response in JSON format with array list of questions.
format: interviewQuestions=[
{
 question:'',
 type:'Technical/Behavioral/Experince/Problem Solving/Leadership'
},{
...
}]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role. Ensure only type that is provided in Interview Type
`;

export const FEEDBACK_PROMPT = `
You are an expert technical interviewer.

Analyze the interview conversation below and evaluate the candidate.

------------------------
Interview Conversation:
{{conversation}}
------------------------

Evaluation requirements:
1. Rate the candidate from 1 to 10 in each category:
   - Technical Skills
   - Communication
   - Problem Solving
   - Experience

2. Provide:
   - A concise interview summary in EXACTLY 3 lines
   - A hiring recommendation (Yes or No)
   - A short explanation message for the recommendation

STRICT OUTPUT RULES (MANDATORY):
- Respond ONLY with valid JSON
- Do NOT include explanations outside the JSON
- Ratings must be numbers between 1 and 10

The response MUST match this JSON structure EXACTLY:

{
  "feedback": {
    "rating": {
      "technicalSkills": 0,
      "communication": 0,
      "problemSolving": 0,
      "experience": 0
    },
    "summary": [
      "Line 1",
      "Line 2",
      "Line 3"
    ],
    "recommendation": "Yes | No",
    "recommendationMsg": "string"
  }
}

If you cannot comply with the JSON format, return this instead:

{
  "feedback": null
}
`;
