import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { useToast } from "@/hooks/use-toast";

import {
  createSession as createSessionApi,
  endSession as endSessionApi,
  logGesture as logGestureApi,
  fetchSessions,
} from "@/lib/backendApi";

export interface GestureLogEntry {
  id: string;
  gesture_name: string;
  gesture_description: string | null;
  confidence: number | null;
  detected_at: string;
}

export interface SessionData {
  id: string;
  session_name: string | null;
  started_at: string;
  ended_at: string | null;
  total_gestures: number | null;
}

export const useGestureSession = () => {
  const [session, setSession] =
    useState<SessionData | null>(null);

  const [gestureLogs, setGestureLogs] =
    useState<GestureLogEntry[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const sessionRef =
    useRef<SessionData | null>(null);

  const { toast } = useToast();

  /* -----------------------------------------
     KEEP REF UPDATED
  ----------------------------------------- */

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  /* -----------------------------------------
     START SESSION
  ----------------------------------------- */

  const startSession = useCallback(
    async (sessionName?: string) => {
      if (sessionRef.current) {
        console.log(
          "Session already active:",
          sessionRef.current.id
        );

        return sessionRef.current;
      }

      setIsLoading(true);

      try {
        console.log("🚀 Starting session...");

        const data = await createSessionApi(
          sessionName ||
            `Session ${new Date().toLocaleTimeString()}`
        );

        console.log(
          "✅ Session successfully created:",
          data
        );

        const sessionData: SessionData = {
          id: data.id,
          session_name: data.session_name,
          started_at: data.started_at,
          ended_at: data.ended_at,
          total_gestures: data.total_gestures,
        };

        sessionRef.current = sessionData;

        setSession(sessionData);
        setGestureLogs([]);

        toast({
          title: "Session Started",
          description:
            "Your gesture session has been created.",
        });

        return sessionData;
      } catch (error) {
        console.error(
          "❌ START SESSION ERROR:",
          error
        );

        toast({
          title: "Session Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to start session.",
          variant: "destructive",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /* -----------------------------------------
     END SESSION
  ----------------------------------------- */

  const endSession = useCallback(async () => {
    const currentSession =
      sessionRef.current;

    if (!currentSession) {
      return;
    }

    try {
      console.log(
        "🛑 Ending session:",
        currentSession.id
      );

      await endSessionApi(
        currentSession.id,
        gestureLogs.length
      );

      toast({
        title: "Session Ended",
        description:
          `Session completed with ${gestureLogs.length} gestures detected.`,
      });
    } catch (error) {
      console.error(
        "❌ END SESSION ERROR:",
        error
      );

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to end session.",
        variant: "destructive",
      });
    } finally {
      sessionRef.current = null;

      setSession(null);
      setGestureLogs([]);
    }
  }, [gestureLogs.length, toast]);

  /* -----------------------------------------
     LOG GESTURE
  ----------------------------------------- */

  const logGesture = useCallback(
    async (
      gestureName: string,
      description: string,
      confidence: number
    ) => {
      const currentSession =
        sessionRef.current;

      if (!currentSession) {
        console.warn(
          "No active session."
        );
        return;
      }

      try {
        const data =
          await logGestureApi(
            currentSession.id,
            gestureName,
            description,
            Math.round(confidence * 100) / 100
          );

        if (data) {
          setGestureLogs((prev) =>
            [data, ...prev].slice(0, 100)
          );
        }
      } catch (error) {
        console.error(
          "❌ LOG GESTURE ERROR:",
          error
        );
      }
    },
    []
  );

  /* -----------------------------------------
     SESSION HISTORY
  ----------------------------------------- */

  const fetchSessionHistory =
    useCallback(async () => {
      try {
        return await fetchSessions();
      } catch (error) {
        console.error(
          "❌ FETCH SESSION ERROR:",
          error
        );

        return [];
      }
    }, []);

  return {
    session,
    gestureLogs,
    isLoading,
    startSession,
    endSession,
    logGesture,
    fetchSessionHistory,
  };
};