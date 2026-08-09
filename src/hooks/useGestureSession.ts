import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createSession as createSessionApi, endSession as endSessionApi, logGesture as logGestureApi } from '@/lib/backendApi';

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
  const [session, setSession] = useState<SessionData | null>(null);
  const [gestureLogs, setGestureLogs] = useState<GestureLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionRef = useRef<SessionData | null>(null);
  const { toast } = useToast();

  // Keep ref in sync with state
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Start a new session
  const startSession = useCallback(async (sessionName?: string) => {
    setIsLoading(true);
    try {
      const data = await createSessionApi(sessionName || `Session ${new Date().toLocaleString()}`);
      setSession(data);
      setGestureLogs([]);

      toast({
        title: "Session Started",
        description: "Your gesture session has been created.",
      });

      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // End the current session
  const endSession = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;

    try {
      await endSessionApi(currentSession.id, gestureLogs.length);

      toast({
        title: "Session Ended",
        description: `Session completed with ${gestureLogs.length} gestures detected.`,
      });

      setSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [gestureLogs.length, toast]);

  // Log a detected gesture
  const logGesture = useCallback(async (
    gestureName: string,
    description: string,
    confidence: number
  ) => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;

    try {
      const data = await logGestureApi(
        currentSession.id,
        gestureName,
        description,
        Math.round(confidence * 100) / 100
      );

      if (data) {
        setGestureLogs(prev => [data, ...prev].slice(0, 100));
      }
    } catch (error) {
      console.error('Error logging gesture:', error);
    }
  }, []);

  // Fetch session history
  const fetchSessionHistory = useCallback(async () => {
    try {
      const data = await fetchSessions();
      return data;
    } catch (error) {
      console.error('Error fetching session history:', error);
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
