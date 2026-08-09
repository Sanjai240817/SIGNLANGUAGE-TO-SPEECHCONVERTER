const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') ?? '';

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${BACKEND_BASE}/api${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = (data && (data.error || data.message)) || response.statusText;
    throw new Error(error);
  }

  return data;
}

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

export const createSession = async (sessionName?: string) => {
  return apiFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify({ session_name: sessionName }),
  }) as Promise<SessionPayload>;
};

export const endSession = async (sessionId: string, totalGestures: number) => {
  return apiFetch(`/sessions/${sessionId}/end`, {
    method: 'PUT',
    body: JSON.stringify({ total_gestures: totalGestures }),
  }) as Promise<SessionPayload>;
};

export const logGesture = async (
  sessionId: string,
  gestureName: string,
  gestureDescription: string | null,
  confidence: number
) => {
  return apiFetch('/gestures', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      gesture_name: gestureName,
      gesture_description: gestureDescription,
      confidence,
    }),
  }) as Promise<GestureLogPayload>;
};

export const saveTranscript = async (
  sessionId: string | null,
  originalText: string,
  convertedSigns: string[]
) => {
  return apiFetch('/transcripts', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      original_text: originalText,
      converted_signs: convertedSigns,
    }),
  }) as Promise<TranscriptPayload>;
};

export const fetchSessions = async () => {
  return apiFetch('/sessions') as Promise<SessionPayload[]>;
};

export const fetchGestureLogs = async () => {
  return apiFetch('/gestures') as Promise<GestureLogPayload[]>;
};

export const fetchTranscripts = async () => {
  return apiFetch('/transcripts') as Promise<TranscriptPayload[]>;
};
