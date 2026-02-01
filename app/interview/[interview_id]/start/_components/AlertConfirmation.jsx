"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, PhoneOff } from "lucide-react";

function AlertConfirmation({ children, stopInterview }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <PhoneOff className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              End Interview?
            </AlertDialogTitle>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  This action cannot be undone
                </p>
                <AlertDialogDescription className="text-gray-600 text-base">
                  Once you end the interview, it cannot be resumed. Your interview will be marked as terminated and the recruiter will be notified.
                </AlertDialogDescription>
              </div>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="w-full sm:w-auto">
            Continue Interview
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => stopInterview()}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            End Interview
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertConfirmation;
