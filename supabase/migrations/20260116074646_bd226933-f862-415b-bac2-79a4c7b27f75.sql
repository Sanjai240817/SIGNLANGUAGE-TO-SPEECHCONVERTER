-- Create gesture_sessions table to track user sessions
CREATE TABLE public.gesture_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_gestures INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gesture_logs table to store detected gestures
CREATE TABLE public.gesture_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.gesture_sessions(id) ON DELETE CASCADE,
  gesture_name TEXT NOT NULL,
  gesture_description TEXT,
  confidence DECIMAL(5,2),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create speech_transcripts table for speech-to-sign history
CREATE TABLE public.speech_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.gesture_sessions(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  converted_signs TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gesture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gesture_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_transcripts ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for demo - no auth required)
CREATE POLICY "Allow public read access on gesture_sessions" 
ON public.gesture_sessions FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on gesture_sessions" 
ON public.gesture_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on gesture_sessions" 
ON public.gesture_sessions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on gesture_logs" 
ON public.gesture_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on gesture_logs" 
ON public.gesture_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on speech_transcripts" 
ON public.speech_transcripts FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on speech_transcripts" 
ON public.speech_transcripts FOR INSERT WITH CHECK (true);

-- Enable realtime for gesture_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.gesture_logs;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gesture_sessions_updated_at
BEFORE UPDATE ON public.gesture_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();