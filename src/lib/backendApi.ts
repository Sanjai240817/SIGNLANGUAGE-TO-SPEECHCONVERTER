// =========================================
// BACKEND API CONFIGURATION
// =========================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  console.warn(
    "VITE_BACKEND_URL is not configured. Add it to your .env file and Vercel environment variables."
  );
}

// =========================================
// TYPES
// =========================================

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

// =========================================
// HELPER FUNCTION
// =========================================

const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  if (!BACKEND_URL) {
    throw new Error(
      "Backend URL is not configured. Please set VITE_BACKEND_URL."
    );
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = `Backend request failed: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// =========================================
// CREATE SESSION
// =========================================

export const createSession = async (
  sessionName?: string
): Promise<SessionPayload> => {
  console.log("Creating session through Render backend...");

  const data = await apiRequest<SessionPayload>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({
      session_name:
        sessionName ||
        `Session ${new Date().toLocaleTimeString()}`,
    }),
  });

  console.log("Session created:", data);

  return data;
};

// =========================================
// END SESSION
// =========================================

export const endSession = async (
  sessionId: string,
  totalGestures: number
): Promise<SessionPayload> => {
  const data = await apiRequest<SessionPayload>(
    `/api/sessions/${sessionId}/end`,
    {
      method: "PUT",
      body: JSON.stringify({
        total_gestures: totalGestures,
      }),
    }
  );

  console.log("Session ended:", data);

  return data;
};

// =========================================
// LOG GESTURE
// =========================================

export const logGesture = async (
  sessionId: string,
  gestureName: string,
  gestureDescription: string | null,
  confidence: number
): Promise<GestureLogPayload> => {
  const data = await apiRequest<GestureLogPayload>("/api/gestures", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      gesture_name: gestureName,
      gesture_description: gestureDescription,
      confidence,
    }),
  });

  console.log("Gesture logged:", data);

  return data;
};

// =========================================
// SAVE TRANSCRIPT
// =========================================

export const saveTranscript = async (
  sessionId: string | null,
  originalText: string,
  convertedSigns: string[]
): Promise<TranscriptPayload> => {
  const data = await apiRequest<TranscriptPayload>("/api/transcripts", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      original_text: originalText,
      converted_signs: convertedSigns,
    }),
  });

  console.log("Transcript saved:", data);

  return data;
};

// =========================================
// FETCH SESSIONS
// =========================================

export const fetchSessions = async (): Promise<
  SessionPayload[]
> => {
  const data = await apiRequest<SessionPayload[]>(
    "/api/sessions"
  );

  return data || [];
};

// =========================================
// FETCH GESTURE LOGS
// =========================================

export const fetchGestureLogs = async (): Promise<
  GestureLogPayload[]
> => {
  const data = await apiRequest<GestureLogPayload[]>(
    "/api/gestures"
  );

  return data || [];
};

// =========================================
// FETCH TRANSCRIPTS
// =========================================

export const fetchTranscripts = async (): Promise<
  TranscriptPayload[]
> => {
  const data = await apiRequest<TranscriptPayload[]>(
    "/api/transcripts"
  );

  return data || [];
};