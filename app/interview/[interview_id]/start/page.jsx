"use client";
import axios from "axios";
import Vapi from "@vapi-ai/web";
import Image from "next/image";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Phone, Timer, Shield, AlertTriangle } from "lucide-react";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import AlertConfirmation from "./_components/AlertConfirmation";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProctoring } from "@/hooks/useProctoring";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const { startProctoring, stopProctoring, flushEvents } = useProctoring();

  const [activeUser, setActiveUser] = useState(false);
  const [conversation, setConversation] = useState();
  const [timer, setTimer] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [error, setError] = useState(null);
  const [proctoringWarningMessage, setProctoringWarningMessage] = useState(null);
  const questionCountRef = useRef(0);
  const totalQuestionsRef = useRef(0);
  const autoEndTimeoutRef = useRef(null);
  const { interview_id } = useParams();
  const router = useRouter();
  const timerIntervalRef = useRef(null);
  const eventHandlersRef = useRef({});
  const vapiStartedRef = useRef(false);
  const callStartedRef = useRef(false);
  const feedbackGeneratedRef = useRef(false);
  const conversationRef = useRef(null);
  const handleCallEndRef = useRef(null);
  const violationCountRef = useRef(0);
  const proctoringTerminatedRef = useRef(false);
  const PROCTORING_MAX_CHANCES = 3;

  // Request fullscreen when user lands on the interview start page
  useEffect(() => {
    const enterFullscreen = () => {
      try {
        const doc = document.documentElement;
        if (doc.requestFullscreen) {
          doc.requestFullscreen().catch(() => {});
        }
      } catch (_) {}
    };
    enterFullscreen();
  }, []);

  const startCall = useCallback(() => {
    console.log("startCall called", {
      hasVapi: !!vapi,
      hasInterviewInfo: !!interviewInfo,
      hasQuestionList: !!interviewInfo?.interviewData?.questionList,
      questionListLength: interviewInfo?.interviewData?.questionList?.length
    });

    if (!vapi) {
      console.error("VAPI not initialized");
      setError("Voice service is not configured. Please contact support.");
      toast.error("Voice service unavailable");
      return;
    }

    if (!interviewInfo?.interviewData?.questionList) {
      console.error("Interview data missing:", interviewInfo);
      setError("Interview data is missing. Please try again.");
      toast.error("Failed to start interview - missing data");
      return;
    }

    let questionList = "";
    let questionCount = 0;
    interviewInfo.interviewData.questionList.forEach(
      (item) => {
        if (item?.question) {
          questionList = questionList ? `${questionList}, ${item.question}` : item.question;
          questionCount++;
        }
      }
    );

    if (!questionList) {
      console.error("No questions found in questionList");
      setError("No questions available for this interview");
      toast.error("Invalid interview configuration");
      return;
    }

    // Store total question count for tracking
    totalQuestionsRef.current = questionCount;
    questionCountRef.current = 0;

    console.log("Starting VAPI call with questions:", questionList.substring(0, 100) + "...");
    console.log(`Total questions to ask: ${questionCount}`);

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${
        interviewInfo?.userName || "there"
      }, how are you? Ready for your interview on ${
        interviewInfo?.interviewData?.jobPosition || "this position"
      }?`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "deepgram",
        voiceId: "asteria",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses. Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. 
Example: "Hey there! Welcome to your ${interviewInfo?.interviewData?.jobPosition || "this position"} interview. Let's get started with a few questions!"

IMPORTANT INSTRUCTIONS:
1. Ask one question at a time and wait for the candidate's response before proceeding.
2. Keep the questions clear and concise. Below are the questions to ask one by one (there are ${questionCount} questions total):
Questions: ${questionList}

3. If the candidate struggles, offer hints or rephrase the question without giving away the answer. 
Example: "Need a hint? Think about how React tracks component updates!"

4. Provide brief, encouraging feedback after each answer. 
Example: "Nice! That's a solid answer." "Hmm, not quite! Want to try again?"

5. Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"

6. CRITICAL - After asking ALL ${questionCount} questions provided above and getting responses, you MUST:
   - Count how many questions you've asked. You must ask EXACTLY ${questionCount} questions before closing.
   - Only after asking all ${questionCount} questions, proceed to closing.
   - Summarize briefly: "That was great! You handled the questions well."
   - Thank the candidate: "Thank you for your time and thoughtful answers."
   - Explicitly state EXACTLY this phrase: "The interview has ended."
   - After stating "The interview has ended", STOP speaking immediately. The system will automatically end the call.
   - DO NOT say "The interview has ended" until you have asked ALL ${questionCount} questions.

Key Guidelines:
✅ Be friendly, engaging, and witty 🎤
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ Ensure the interview remains focused on the job position
✅ After completing all questions, explicitly end the interview with a closing statement`,
          },
        ],
      },
    };

    // Prevent multiple starts
    if (callStartedRef.current) {
      console.log("Call already started, skipping...");
      return;
    }

    try {
      console.log("Calling vapi.start() with options:", {
        name: assistantOptions.name,
        hasFirstMessage: !!assistantOptions.firstMessage,
        hasModel: !!assistantOptions.model
      });
      
      callStartedRef.current = true;
      vapi.start(assistantOptions);
      setIsInterviewActive(true);
      toast.info("Connecting to interview...");
      
      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      
      // Set a maximum interview duration timeout (e.g., 45 minutes max)
      // This ensures the interview ends even if auto-end detection fails
      const maxDuration = 45 * 60 * 1000; // 45 minutes in milliseconds
      autoEndTimeoutRef.current = setTimeout(() => {
        if (vapi && isInterviewActive) {
          console.log("Maximum interview duration reached, auto-ending...");
          vapi.stop();
        }
      }, maxDuration);
      
      console.log("VAPI call started successfully");
    } catch (error) {
      console.error("Error starting VAPI call:", error);
      callStartedRef.current = false; // Allow retry on error
      setError(`Failed to start interview: ${error.message}`);
      toast.error(`Failed to start interview: ${error.message}`);
    }
  }, [interviewInfo]);

  const stopInterview = useCallback(() => {
    if (vapi) {
      try {
        vapi.stop();
        setIsInterviewActive(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        if (autoEndTimeoutRef.current) {
          clearTimeout(autoEndTimeoutRef.current);
        }
        // Mark as user-terminated - call handleCallEnd if available
        if (handleCallEndRef.current) {
          handleCallEndRef.current(true); // Pass true to indicate user terminated
        }
      } catch (error) {
        console.error("Error stopping interview:", error);
        toast.error("Error ending interview");
      }
    }
  }, []);


  // Auto-start the call when interviewInfo is available
  useEffect(() => {
    console.log("Interview info check:", {
      hasInterviewInfo: !!interviewInfo,
      hasVapi: !!vapi,
      vapiStarted: vapiStartedRef.current,
      interviewInfo: interviewInfo
    });

    if (interviewInfo && vapi && !vapiStartedRef.current) {
      console.log("Starting interview call...", interviewInfo);
      vapiStartedRef.current = true;
      // Small delay to ensure everything is ready
      setTimeout(() => {
        console.log("Calling startCall...");
        startCall();
      }, 1000);
    } else if (!vapi) {
      console.error("VAPI not available");
      setError("Voice service is not configured. Please contact support.");
      toast.error("Voice service unavailable");
    } else if (!interviewInfo) {
      console.log("Waiting for interview info...");
      // Don't show toast here as it might be loading
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [interviewInfo, startCall]);

  useEffect(() => {
    if (!vapi) {
      console.error("VAPI not initialized");
      return;
    }

    // Prevent multiple event listener registrations
    if (eventHandlersRef.current.registered) {
      return;
    }

    const handleMessage = (message) => {
      if (message?.conversation) {
        const convoString = JSON.stringify(message.conversation);
        setConversation(convoString);
        conversationRef.current = convoString; // Store in ref for access in call-end handler
        
        // Check if AI mentioned interview completion or if all questions are done
        try {
          const convData = typeof message.conversation === "string" 
            ? JSON.parse(message.conversation) 
            : message.conversation;
          
          if (convData && Array.isArray(convData)) {
            // Count assistant messages that contain actual questions
            // Filter out intro messages and closing messages to get accurate question count
            const assistantMessages = convData.filter(msg => 
              msg.role === "assistant" && msg.content
            );
            
            // Try to identify actual questions vs intro/closing messages
            // Questions typically end with "?" or contain question words
            const questionMessages = assistantMessages.filter(msg => {
              const content = (msg.content || "").toLowerCase();
              return content.includes("?") || 
                     content.includes("what") || 
                     content.includes("how") || 
                     content.includes("why") || 
                     content.includes("explain") ||
                     content.includes("tell me") ||
                     content.includes("describe");
            });
            
            // Use question count, but also track total assistant messages
            questionCountRef.current = questionMessages.length;
            
            console.log("Question tracking:", {
              totalAssistantMessages: assistantMessages.length,
              questionMessages: questionCountRef.current,
              expectedQuestions: totalQuestionsRef.current
            });
            
            const lastMessage = convData[convData.length - 1];
            const messageText = (lastMessage?.content || "").toLowerCase();
            
            // STRICT completion keywords - only very explicit phrases
            const completionKeywords = [
              "interview has ended",
              "the interview has ended",
              "interview is now complete",
              "the interview is now complete"
            ];
            
            const hasCompletionKeyword = completionKeywords.some(keyword => 
              messageText.includes(keyword)
            );
            
            // Only auto-end if we have explicit completion keyword
            // Be VERY strict - only end if AI explicitly says "The interview has ended"
            const allQuestionsAsked = questionCountRef.current >= totalQuestionsRef.current && totalQuestionsRef.current > 0;
            
            // Check if last message explicitly mentions interview completion (very strict)
            // Must contain "interview" AND ("ended" or "complete") AND ("thank you" or similar closing)
            const explicitCompletionInLastMessage = 
              messageText.includes("interview") && 
              (messageText.includes("ended") || messageText.includes("complete")) &&
              (messageText.includes("thank you") || messageText.includes("thank") || messageText.includes("finished"));
            
            // Only auto-end if:
            // 1. Explicit completion keyword found (most reliable), OR
            // 2. All questions asked (questionCount >= totalQuestions) AND last message explicitly mentions completion
            // This ensures we don't end prematurely
            const shouldAutoEnd = hasCompletionKeyword || (allQuestionsAsked && explicitCompletionInLastMessage && questionCountRef.current >= totalQuestionsRef.current);
            
            if (shouldAutoEnd) {
              console.log("Detected interview completion, ending call...", {
                hasKeyword: hasCompletionKeyword,
                questionsAsked: questionCountRef.current,
                totalQuestions: totalQuestionsRef.current,
                assistantMessages: assistantMessages.length,
                allQuestionsAsked,
                explicitCompletionInLastMessage,
                lastMessage: messageText.substring(0, 150)
              });
              
              // Wait a bit for the message to finish, then end the call
              setTimeout(() => {
                if (vapi) {
                  console.log("Auto-ending call after completion");
                  try {
                    vapi.stop();
                  } catch (e) {
                    console.error("Error auto-ending call:", e);
                  }
                }
              }, 5000); // 5 second delay to let the final message finish
            }
          }
        } catch (e) {
          console.error("Error checking completion:", e);
        }
      }
    };

    const handleCallStart = () => {
      toast.success("Call Connected");
      setIsInterviewActive(true);
      violationCountRef.current = 0;
      proctoringTerminatedRef.current = false;
      // Start proctoring (tab switch, visibility, copy/paste, fullscreen, context menu) – 3 chances then terminate
      startProctoring({
        interview_id,
        user_email: interviewInfo?.userEmail,
        user_name: interviewInfo?.userName,
        onViolation: (eventType) => {
          // 1 strike per violation. Only "returned to tab" does not count as a strike.
          const countsAsStrike = eventType !== "visibility_visible";
          if (countsAsStrike) {
            violationCountRef.current += 1;
          }
          const count = violationCountRef.current;

          const messages = {
            visibility_hidden: "You left the tab. This counts as 1 strike. Stay on this tab for the duration of the interview.",
            visibility_visible: "You returned to the tab. Please stay on this tab for the duration of the interview.",
            fullscreen_exit: "Fullscreen was turned off. This counts as 1 strike. Please remain in fullscreen for the entire interview.",
            copy_attempt: "Copy/paste is not allowed. This counts as 1 strike. Do not copy, paste, or cut during the interview.",
            paste_attempt: "Copy/paste is not allowed. This counts as 1 strike. Do not copy, paste, or cut during the interview.",
            context_menu: "Right-click is not allowed. This counts as 1 strike. Do not use the right-click menu during the interview.",
            keyboard_cheat: "Copy/paste shortcuts (Ctrl+C, Ctrl+V, etc.) are not allowed. This counts as 1 strike.",
          };
          const baseMsg = messages[eventType] || "This action is not allowed and counts as 1 strike. Please follow the interview rules.";

          if (countsAsStrike && count >= PROCTORING_MAX_CHANCES) {
            setProctoringWarningMessage(
              "You have reached 3 strikes. The interview is being terminated."
            );
            proctoringTerminatedRef.current = true;
            setTimeout(() => {
              try {
                vapi?.stop();
              } catch (e) {
                console.error("Error stopping call for proctoring:", e);
              }
            }, 800);
          } else {
            const msg = countsAsStrike
              ? `${baseMsg} You have ${PROCTORING_MAX_CHANCES - count} strike(s) remaining before termination.`
              : baseMsg;
            setProctoringWarningMessage(msg);
          }
        },
      });
      // Optional: request fullscreen for better proctoring (user can deny)
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (_) {}
    };

    const handleSpeechStart = () => {
      setActiveUser(false);
    };

    const handleSpeechEnd = () => {
      setActiveUser(true);
      // Removed auto-end logic from here - it was too aggressive
      // Auto-end is now only handled in handleMessage with strict criteria
    };

    const handleCallEnd = async (userTerminated = false) => {
      const terminatedDueToProctoring = proctoringTerminatedRef.current;
      if (terminatedDueToProctoring) proctoringTerminatedRef.current = false;
      const effectiveTerminated = userTerminated || terminatedDueToProctoring;

      if (effectiveTerminated) {
        if (terminatedDueToProctoring) {
          toast.error("Interview terminated due to proctoring violations");
        } else {
          toast.warning("Interview Terminated");
        }
      } else {
        toast.success("Interview Ended");
      }

      setIsInterviewActive(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (autoEndTimeoutRef.current) {
        clearTimeout(autoEndTimeoutRef.current);
      }

      // Flush proctoring events to DB and get summary for this attempt
      let proctoringSummary = null;
      try {
        proctoringSummary = await flushEvents();
      } catch (e) {
        console.error("Proctoring flush error:", e);
      }
      stopProctoring();

      // Exit fullscreen if active
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (_) {}

      // Only process once
      if (!feedbackGeneratedRef.current) {
        feedbackGeneratedRef.current = true;

        // Use ref to get latest conversation
        const convData = conversationRef.current || conversation;

        let savedRecord = false;
        let feedbackData = null;

        // If user terminated early or terminated due to proctoring, save minimal data (separate columns; feedback null)
        if (effectiveTerminated) {
          try {
            const terminatedByValue = terminatedDueToProctoring ? "proctoring" : "candidate";

            const { error: dbError } = await supabase
              .from("interview-feedback")
              .insert([
                {
                  userName: interviewInfo?.userName,
                  userEmail: interviewInfo?.userEmail,
                  interview_id: interview_id,
                  feedback: null,
                  recommended: false,
                  proctoring_summary: proctoringSummary,
                  terminated_by: terminatedByValue,
                  terminated_at: new Date().toISOString(),
                },
              ]);

            if (dbError) {
              console.error("Error saving terminated interview:", dbError);
            } else {
              savedRecord = true;
              console.log("Terminated interview saved to database");
            }
          } catch (error) {
            console.error("Error saving terminated interview:", error);
          }

          // Navigate to completed page without feedback
          router.replace(
            terminatedDueToProctoring
              ? "/interview/completed?terminated=true&proctoring=1"
              : "/interview/completed?terminated=true"
          );
          return;
        }

        // Step 1: Save interview record to database (without conversation field)
        if (convData) {
          try {
            const { data: convSaveData, error: convSaveError } = await supabase
              .from("interview-feedback")
              .insert([
                {
                  userName: interviewInfo?.userName,
                  userEmail: interviewInfo?.userEmail,
                  interview_id: interview_id,
                  feedback: null, // Will be updated after feedback generation
                  recommended: false,
                  proctoring_summary: proctoringSummary,
                },
              ])
              .select()
              .single();

            if (!convSaveError) {
              savedRecord = true;
              console.log("Interview record saved to database");
            } else {
              console.error("Error saving interview record:", convSaveError);
            }
          } catch (convError) {
            console.error("Error saving interview record:", convError);
          }
        }

        // Step 2: Generate feedback (but don't fail if this doesn't work)
        if (convData) {
          try {
            toast.loading("Submitting your interview...", { id: "feedback" });
            
            const result = await axios.post("/api/ai-feedback", {
              conversation: convData,
            });

            if (result?.data?.content) {
              let content = result.data.content;
              content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
              
              try {
                feedbackData = JSON.parse(content);
              } catch (parseError) {
                console.error("Error parsing feedback JSON:", parseError);
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  feedbackData = JSON.parse(jsonMatch[0]);
                } else {
                  console.warn("Could not parse feedback, using fallback");
                  feedbackData = {
                    feedback: {
                      rating: { technicalSkills: 5, communication: 5, problemSolving: 5, experience: 5 },
                      summary: ["Interview completed.", "Feedback generation had issues.", "Manual review recommended."],
                      recommendation: "No",
                      recommendationMsg: "Feedback generation encountered an error.",
                    },
                  };
                }
              }

              // Update the database record with feedback
              if (savedRecord) {
                const { error: updateError } = await supabase
                  .from("interview-feedback")
                  .update({
                    feedback: feedbackData,
                    recommended: feedbackData?.feedback?.recommendation === "Yes",
                    proctoring_summary: proctoringSummary,
                  })
                  .eq("interview_id", interview_id)
                  .eq("userEmail", interviewInfo?.userEmail);

                if (updateError) {
                  console.error("Error updating feedback:", updateError);
                }
              } else {
                // If record wasn't saved, try to save everything together
                const { error: dbError } = await supabase
                  .from("interview-feedback")
                  .insert([
                    {
                      userName: interviewInfo?.userName,
                      userEmail: interviewInfo?.userEmail,
                      interview_id: interview_id,
                      feedback: feedbackData,
                      recommended: feedbackData?.feedback?.recommendation === "Yes",
                      proctoring_summary: proctoringSummary,
                    },
                  ]);

                if (dbError) {
                  console.error("Database error:", dbError);
                }
              }

              toast.dismiss("feedback");
              toast.success("Thank you for completing the interview. Your responses have been submitted and the recruiter will review them shortly.");
            } else {
              throw new Error("Invalid response from feedback API");
            }
          } catch (error) {
            console.error("Error generating feedback:", error);
            toast.dismiss("feedback");
            // Don't show error if record was saved - just proceed
            if (savedRecord) {
              toast.success("Your interview has been submitted. The recruiter will review your responses.");
            } else {
              toast.warning("Something went wrong. Please try again or contact support.");
            }
          }
        } else {
          toast.warning("No conversation data available");
        }

        // Step 3: Navigate to completed page (without showing feedback to candidate)
        router.replace("/interview/completed");
      }
    };

    const handleError = (error) => {
      console.error("VAPI Error:", error);
      setError("An error occurred during the interview");
      toast.error("Interview error occurred");
    };

    // Store handleCallEnd in ref so stopInterview can access it
    handleCallEndRef.current = handleCallEnd;

    // Store handlers for cleanup
    eventHandlersRef.current = {
      message: handleMessage,
      "call-start": handleCallStart,
      "speech-start": handleSpeechStart,
      "speech-end": handleSpeechEnd,
      "call-end": handleCallEnd,
      error: handleError,
      registered: true,
    };

    // Register event listeners only once
    Object.entries(eventHandlersRef.current).forEach(([event, handler]) => {
      if (event !== "registered" && typeof handler === "function") {
        vapi.on(event, handler);
      }
    });

    // Cleanup function
    return () => {
      stopProctoring();
      if (vapi && eventHandlersRef.current) {
        Object.entries(eventHandlersRef.current).forEach(([event, handler]) => {
          if (event !== "registered" && typeof handler === "function") {
            vapi.off(event, handler);
          }
        });
        eventHandlersRef.current.registered = false;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (autoEndTimeoutRef.current) {
        clearTimeout(autoEndTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - we only want to register once on mount

  // Format timer
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (error && !isInterviewActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 lg:p-12">
      {/* Proctoring warning dialog – big centered message */}
      <Dialog
        open={!!proctoringWarningMessage}
        onOpenChange={(open) => !open && setProctoringWarningMessage(null)}
      >
        <DialogContent className="sm:max-w-md max-w-[95vw] text-center p-8" showCloseButton={false}>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-amber-100 p-4">
                <AlertTriangle className="h-14 w-14 text-amber-600" />
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-amber-900">
              Proctoring Notice
            </DialogTitle>
          </DialogHeader>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed py-4">
            {proctoringWarningMessage}
          </p>
          <DialogFooter className="flex justify-center sm:justify-center pt-4">
            <Button
              onClick={() => setProctoringWarningMessage(null)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8"
            >
              I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Session
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {isInterviewActive && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Proctoring active
                </div>
              )}
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                <Timer className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-mono font-semibold text-gray-800">
                  {formatTime(timer)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* AI Recruiter Card */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-8 flex flex-col gap-4 items-center justify-center min-h-[300px] transition-all hover:shadow-xl">
            <div className="relative">
              {!activeUser && isInterviewActive && (
                <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping" />
              )}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                <Image
                  src={"/ai-avatar.png"}
                  alt="AI Recruiter"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              {!activeUser && isInterviewActive && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Speaking
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">AI Recruiter</h3>
              <p className="text-sm text-gray-500">Interview Assistant</p>
            </div>
          </div>

          {/* Candidate Card */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-8 flex flex-col gap-4 items-center justify-center min-h-[300px] transition-all hover:shadow-xl">
            <div className="relative">
              {activeUser && isInterviewActive && (
                <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" />
              )}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {interviewInfo?.userName?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              {activeUser && isInterviewActive && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Your Turn
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {interviewInfo?.userName || "Candidate"}
              </h3>
              <p className="text-sm text-gray-500">You</p>
            </div>
          </div>
        </div>

        {/* Controls: End Call always; Start only when call is not active */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertConfirmation stopInterview={stopInterview}>
              <button
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
                aria-label="End interview"
              >
                <Phone className="h-7 w-7" />
              </button>
            </AlertConfirmation>

            <p className="text-sm text-gray-500">
              {isInterviewActive
                ? "Interview in Progress..."
                : interviewInfo
                  ? "Preparing interview..."
                  : "Waiting for interview details..."}
            </p>

            {/* Start / Retry only when call is NOT active */}
            {!isInterviewActive && !error && interviewInfo && (
              <Button
                onClick={() => {
                  if (!vapiStartedRef.current) {
                    vapiStartedRef.current = true;
                    startCall();
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Interview
              </Button>
            )}
            {!isInterviewActive && error && (
              <Button
                onClick={() => {
                  vapiStartedRef.current = false;
                  callStartedRef.current = false;
                  setError(null);
                  startCall();
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Retry Starting Interview
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
