import { supabase } from "@/integrations/supabase/client";

export interface SessionPayload {
  id: string;
  session_name: string | null;
  created_at: string;
  started_at: string;
  ended_at: string | null;
  total_gestures: number | null;
  updated_at?: string;
}

export interface GestureLogPayload {
  id: string;
  session_id: string | null;
  gesture_name: string;
  gesture_description: string | null;
  confidence: number | null;
  detected_at: string;
}

export interface TranscriptPayload {
  id: string;
  session_id: string | null;
  original_text: string;
  converted_signs: string[] | null;
  created_at: string;
}

/* -----------------------------------------
   CREATE SESSION
----------------------------------------- */

export const createSession = async (
  sessionName?: string
): Promise<SessionPayload> => {
  console.log("Creating session...");

  const { data, error } = await supabase
    .from("gesture_sessions")
    .insert({
      session_name:
        sessionName ||
        `Session ${new Date().toLocaleTimeString()}`,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase create session error:", error);
    throw new Error(error.message);
  }

  console.log("Session created:", data);

  return data;
};

/* -----------------------------------------
   END SESSION
----------------------------------------- */

export const endSession = async (
  sessionId: string,
  totalGestures: number
): Promise<SessionPayload> => {
  const { data, error } = await supabase
    .from("gesture_sessions")
    .update({
      ended_at: new Date().toISOString(),
      total_gestures: totalGestures,
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Supabase end session error:", error);
    throw new Error(error.message);
  }

  return data;
};

/* -----------------------------------------
   LOG GESTURE
----------------------------------------- */

export const logGesture = async (
  sessionId: string,
  gestureName: string,
  gestureDescription: string | null,
  confidence: number
): Promise<GestureLogPayload> => {
  const { data, error } = await supabase
    .from("gesture_logs")
    .insert({
      session_id: sessionId,
      gesture_name: gestureName,
      gesture_description: gestureDescription,
      confidence,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase gesture error:", error);
    throw new Error(error.message);
  }

  return data;
};

/* -----------------------------------------
   SAVE TRANSCRIPT
----------------------------------------- */

export const saveTranscript = async (
  sessionId: string | null,
  originalText: string,
  convertedSigns: string[]
): Promise<TranscriptPayload> => {
  const { data, error } = await supabase
    .from("speech_transcripts")
    .insert({
      session_id: sessionId,
      original_text: originalText,
      converted_signs: convertedSigns,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase transcript error:", error);
    throw new Error(error.message);
  }

  return data;
};

/* -----------------------------------------
   FETCH SESSIONS
----------------------------------------- */

export const fetchSessions = async (): Promise<
  SessionPayload[]
> => {
  const { data, error } = await supabase
    .from("gesture_sessions")
    .select("*")
    .order("started_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    console.error("Supabase fetch sessions error:", error);
    throw new Error(error.message);
  }

  return data || [];
};

/* -----------------------------------------
   FETCH GESTURES
----------------------------------------- */

export const fetchGestureLogs = async (): Promise<
  GestureLogPayload[]
> => {
  const { data, error } = await supabase
    .from("gesture_logs")
    .select("*")
    .order("detected_at", {
      ascending: false,
    })
    .limit(200);

  if (error) {
    console.error("Supabase fetch gestures error:", error);
    throw new Error(error.message);
  }

  return data || [];
};

/* -----------------------------------------
   FETCH TRANSCRIPTS
----------------------------------------- */

export const fetchTranscripts = async (): Promise<
  TranscriptPayload[]
> => {
  const { data, error } = await supabase
    .from("speech_transcripts")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(200);

  if (error) {
    console.error(
      "Supabase fetch transcripts error:",
      error
    );

    throw new Error(error.message);
  }

  return data || [];
};