"use client";

import { useRef, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";

const EVENT_TYPES = {
  VISIBILITY_HIDDEN: "visibility_hidden",
  VISIBILITY_VISIBLE: "visibility_visible",
  FULLSCREEN_EXIT: "fullscreen_exit",
  COPY_ATTEMPT: "copy_attempt",
  PASTE_ATTEMPT: "paste_attempt",
  CONTEXT_MENU: "context_menu",
  KEYBOARD_CHEAT: "keyboard_cheat", // e.g. Ctrl+C, Ctrl+V
};

/**
 * Hook to collect proctoring events during an interview (tab switch, visibility,
 * fullscreen exit, copy/paste, context menu). Events are stored in memory and
 * can be flushed to Supabase (proctoring_events table). Summary is computed
 * for saving on interview-feedback.proctoring_summary.
 */
export function useProctoring() {
  const enabledRef = useRef(false);
  const contextRef = useRef(null);
  const eventsRef = useRef([]);
  const onViolationRef = useRef(null);
  const summaryRef = useRef({
    tabSwitchCount: 0,
    totalTimeAwayMs: 0,
    copyPasteCount: 0,
    fullscreenExitCount: 0,
    visibilityChangeCount: 0,
    warningCount: 0,
  });
  const lastHiddenAtRef = useRef(null);
  const listenersRef = useRef([]);

  const pushEvent = useCallback((eventType, payload = {}) => {
    if (!enabledRef.current || !contextRef.current) return;
    const ctx = contextRef.current;
    const event = {
      interview_id: ctx.interview_id,
      user_email: ctx.user_email,
      user_name: ctx.user_name ?? null,
      event_type: eventType,
      payload: { ...payload, clientAt: new Date().toISOString() },
    };
    eventsRef.current.push(event);

    // Update summary
    const s = summaryRef.current;
    if (eventType === EVENT_TYPES.VISIBILITY_HIDDEN || eventType === EVENT_TYPES.VISIBILITY_VISIBLE) {
      s.visibilityChangeCount++;
    }
    if (eventType === EVENT_TYPES.VISIBILITY_HIDDEN) {
      s.tabSwitchCount++;
    }
    if (eventType === EVENT_TYPES.VISIBILITY_VISIBLE && payload.durationAwayMs) {
      s.totalTimeAwayMs += payload.durationAwayMs;
    }
    if (eventType === EVENT_TYPES.FULLSCREEN_EXIT) {
      s.fullscreenExitCount++;
    }
    if (
      eventType === EVENT_TYPES.COPY_ATTEMPT ||
      eventType === EVENT_TYPES.PASTE_ATTEMPT ||
      eventType === EVENT_TYPES.KEYBOARD_CHEAT
    ) {
      s.copyPasteCount++;
    }
    if (eventType === EVENT_TYPES.CONTEXT_MENU) {
      s.warningCount++;
    }

    // Notify violation so UI can show warning (e.g. toast)
    if (typeof onViolationRef.current === "function") {
      onViolationRef.current(eventType, payload);
    }
  }, []);

  const sendEventsToSupabase = useCallback(async (events) => {
    if (!events.length) return;
    try {
      const rows = events.map((e) => ({
        interview_id: e.interview_id,
        user_email: e.user_email,
        user_name: e.user_name,
        event_type: e.event_type,
        payload: e.payload,
      }));
      const { error } = await supabase.from("proctoring_events").insert(rows);
      if (error) console.error("Proctoring events insert error:", error);
    } catch (err) {
      console.error("Proctoring send error:", err);
    }
  }, []);

  const startProctoring = useCallback(
    ({ interview_id, user_email, user_name, onViolation }) => {
      if (!interview_id || !user_email) return;
      enabledRef.current = true;
      contextRef.current = { interview_id, user_email, user_name };
      onViolationRef.current = onViolation ?? null;
      eventsRef.current = [];
      summaryRef.current = {
        tabSwitchCount: 0,
        totalTimeAwayMs: 0,
        copyPasteCount: 0,
        fullscreenExitCount: 0,
        visibilityChangeCount: 0,
        warningCount: 0,
      };
      lastHiddenAtRef.current = null;

      // Page Visibility (tab switch / window blur)
      const onVisibilityChange = () => {
        if (document.hidden) {
          lastHiddenAtRef.current = Date.now();
          pushEvent(EVENT_TYPES.VISIBILITY_HIDDEN, {});
        } else {
          const durationAwayMs = lastHiddenAtRef.current
            ? Date.now() - lastHiddenAtRef.current
            : 0;
          pushEvent(EVENT_TYPES.VISIBILITY_VISIBLE, { durationAwayMs });
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      listenersRef.current.push({ type: "visibilitychange", fn: onVisibilityChange });

      // Fullscreen exit
      const onFullscreenChange = () => {
        if (!document.fullscreenElement) {
          pushEvent(EVENT_TYPES.FULLSCREEN_EXIT, {});
        }
      };
      document.addEventListener("fullscreenchange", onFullscreenChange);
      listenersRef.current.push({ type: "fullscreenchange", fn: onFullscreenChange });

      // Copy (block and record)
      const onCopy = (e) => {
        e.preventDefault();
        pushEvent(EVENT_TYPES.COPY_ATTEMPT, {});
      };
      document.addEventListener("copy", onCopy, true);
      listenersRef.current.push({ type: "copy", fn: onCopy, capture: true });

      // Paste (block and record)
      const onPaste = (e) => {
        e.preventDefault();
        pushEvent(EVENT_TYPES.PASTE_ATTEMPT, {});
      };
      document.addEventListener("paste", onPaste, true);
      listenersRef.current.push({ type: "paste", fn: onPaste, capture: true });

      // Cut (block and record)
      const onCut = (e) => {
        e.preventDefault();
        pushEvent(EVENT_TYPES.COPY_ATTEMPT, { type: "cut" });
      };
      document.addEventListener("cut", onCut, true);
      listenersRef.current.push({ type: "cut", fn: onCut, capture: true });

      // Context menu (right-click) - block and record
      const onContextMenu = (e) => {
        e.preventDefault();
        pushEvent(EVENT_TYPES.CONTEXT_MENU, {});
      };
      document.addEventListener("contextmenu", onContextMenu, true);
      listenersRef.current.push({ type: "contextmenu", fn: onContextMenu, capture: true });

      // Keyboard shortcuts that could be used to cheat (Ctrl+C, Ctrl+V, etc.)
      const onKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
          const key = (e.key || "").toLowerCase();
          if (key === "c" || key === "v" || key === "x" || key === "a") {
            e.preventDefault();
            pushEvent(EVENT_TYPES.KEYBOARD_CHEAT, { key: key, modifiers: e.ctrlKey ? "ctrl" : "meta" });
          }
        }
      };
      document.addEventListener("keydown", onKeyDown, true);
      listenersRef.current.push({ type: "keydown", fn: onKeyDown, capture: true });
    },
    [pushEvent]
  );

  const stopProctoring = useCallback(() => {
    enabledRef.current = false;
    onViolationRef.current = null;
    listenersRef.current.forEach(({ type, fn, capture }) => {
      document.removeEventListener(type, fn, capture ?? false);
    });
    listenersRef.current = [];
    contextRef.current = null;
  }, []);

  const getSummary = useCallback(() => {
    return { ...summaryRef.current };
  }, []);

  const flushEvents = useCallback(async () => {
    const events = [...eventsRef.current];
    eventsRef.current = [];
    await sendEventsToSupabase(events);
    return getSummary();
  }, [sendEventsToSupabase, getSummary]);

  return {
    startProctoring,
    stopProctoring,
    getSummary,
    flushEvents,
  };
}
