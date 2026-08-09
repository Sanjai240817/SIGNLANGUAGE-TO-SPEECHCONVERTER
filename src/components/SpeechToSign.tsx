import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Hand, Loader2, AlertCircle, Play, RotateCcw, Copy, Check, Sparkles, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechTranscript } from '@/hooks/useSpeechTranscript';
import { ASL_ALPHABET } from '@/lib/signLanguageData';
import { toast } from 'sonner';

interface SpeechToSignProps {
  isActive: boolean;
  onToggle: () => void;
  autoStart?: boolean;
  sessionId?: string | null;
}

const SpeechToSign = ({ isActive, onToggle, autoStart = true, sessionId = null }: SpeechToSignProps) => {
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);

  const { saveTranscript } = useSpeechTranscript();

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, isSpeaking } = useSpeechSynthesis();

  // Auto-start listening when component mounts
  useEffect(() => {
    if (autoStart && isSupported && !autoStarted && !isListening) {
      setAutoStarted(true);
      setTimeout(() => {
        startListening();
        onToggle();
      }, 500);
    }
  }, [autoStart, isSupported, autoStarted, isListening, startListening, onToggle]);

  // Parse transcript into letters for sign display
  useEffect(() => {
    const fullText = (transcript + interimTranscript).toUpperCase().replace(/[^A-Z\s]/g, '');
    const letters = fullText.split('').filter(letter => ASL_ALPHABET[letter] || letter === ' ');
    setCurrentLetters(letters);
    if (!isAnimating) {
      setActiveLetterIndex(0);
    }
  }, [transcript, interimTranscript, isAnimating]);

  // Animate through letters with slower timing for better visibility
  useEffect(() => {
    if (isAnimating && currentLetters.length > 0) {
      const interval = setInterval(() => {
        setActiveLetterIndex(prev => {
          if (prev >= currentLetters.length - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500); // Slower speed: 1.5 seconds per letter
      return () => clearInterval(interval);
    }
  }, [isAnimating, currentLetters.length]);

  const handleToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      // Request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        resetTranscript();
        setCurrentLetters([]);
        setActiveLetterIndex(0);
        startListening();
      } catch (err) {
        console.error('Microphone permission error:', err);
        toast.error('Microphone access denied. Please enable microphone permissions.');
      }
    }
    onToggle();
  };

  const handlePlayAnimation = useCallback(() => {
    if (currentLetters.length > 0) {
      setActiveLetterIndex(0);
      setIsAnimating(true);
    }
  }, [currentLetters.length]);

  const handleReset = useCallback(() => {
    resetTranscript();
    setCurrentLetters([]);
    setActiveLetterIndex(0);
    setIsAnimating(false);
  }, [resetTranscript]);

  const handleCopy = useCallback(() => {
    const text = transcript + interimTranscript;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transcript, interimTranscript]);

  const handleSaveToCloud = useCallback(async () => {
    const text = transcript + interimTranscript;
    if (text && currentLetters.length > 0) {
      const result = await saveTranscript(sessionId, text, currentLetters);
      if (result) {
        setSavedToCloud(true);
        toast.success('Transcript saved to cloud!');
        setTimeout(() => setSavedToCloud(false), 2000);
      }
    }
  }, [transcript, interimTranscript, currentLetters, sessionId, saveTranscript]);

  const handleSpeak = useCallback(() => {
    const text = transcript + interimTranscript;
    if (text) {
      speak(text);
    }
  }, [transcript, interimTranscript, speak]);

  const activeLetter = currentLetters[activeLetterIndex];
  const signInfo = activeLetter && activeLetter !== ' ' ? ASL_ALPHABET[activeLetter] : null;

  return (
    <div className="space-y-6">
      {/* Speech-to-Sign header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl gradient-bg-accent shadow-accent">
            <Mic className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Speech to Sign</h3>
            <p className="text-sm text-muted-foreground">Speak and see ASL finger spelling</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleToggle}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className={`rounded-xl ${!isListening ? 'gradient-bg-accent shadow-accent' : ''}`}
            disabled={!isSupported}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="mr-2 w-5 h-5" />
                Start Listening
              </>
            )}
          </Button>
          {isListening && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
          )}
        </div>
      </div>

      {/* Listening status */}
      {isSupported && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            isListening 
              ? 'bg-green-500/10 text-green-700 border border-green-200' 
              : 'bg-slate-500/10 text-slate-600 border border-slate-200'
          }`}
        >
          <motion.div 
            animate={isListening ? { scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-current"
          />
          {isListening ? 'Listening for speech...' : 'Ready to listen'}
        </motion.div>
      )}

      {/* Not supported warning */}
      {!isSupported && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20"
        >
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-sm text-foreground">
            Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari.
          </p>
        </motion.div>
      )}

      {/* Error display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-foreground">{error}</p>
        </motion.div>
      )}

      {/* Main content area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Transcript display */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Your Speech</h4>
            </div>
            {(transcript || interimTranscript) && (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleSaveToCloud}
                  title="Save to cloud"
                >
                  {savedToCloud ? <Check className="w-4 h-4 text-success" /> : <Database className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="min-h-[150px] p-4 rounded-xl bg-muted/50 relative overflow-hidden">
            {isListening && !transcript && !interimTranscript ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="relative">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-primary"
                  />
                </div>
                <span className="text-muted-foreground">Listening...</span>
              </div>
            ) : transcript || interimTranscript ? (
              <p className="text-foreground leading-relaxed text-lg">
                {transcript}
                {interimTranscript && (
                  <span className="text-muted-foreground italic">{interimTranscript}</span>
                )}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {isSupported ? 'Start speaking to see your words here...' : 'Speech recognition unavailable'}
                </p>
              </div>
            )}
          </div>

          {/* Listening indicator */}
          {isListening && (
            <div className="mt-4 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, 2, 1] }}
                  transition={{ 
                    duration: 0.4, 
                    repeat: Infinity, 
                    delay: i * 0.08,
                    ease: "easeInOut" 
                  }}
                  className="w-1.5 h-6 rounded-full bg-accent"
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Sign display */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hand className="w-5 h-5 text-accent" />
              <h4 className="font-medium text-foreground">ASL Sign</h4>
            </div>
            {currentLetters.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePlayAnimation}
                disabled={isAnimating}
                className="rounded-lg"
              >
                <Play className="w-4 h-4 mr-1" />
                {isAnimating ? 'Playing...' : 'Play'}
              </Button>
            )}
          </div>

          <div className="min-h-[150px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {signInfo ? (
                <motion.div
                  key={activeLetter}
                  initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-center"
                >
                  <motion.div 
                    className="w-32 h-32 rounded-3xl gradient-bg-primary flex items-center justify-center mb-4 mx-auto shadow-glow relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-6xl font-display font-bold text-primary-foreground">
                      {activeLetter}
                    </span>
                    <motion.div
                      animate={{ 
                        background: [
                          'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                          'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                          'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0"
                    />
                  </motion.div>
                  <p className="text-xl font-display font-bold text-foreground">{signInfo.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{signInfo.description}</p>
                  <p className="text-3xl mt-2">{signInfo.handShape}</p>
                </motion.div>
              ) : activeLetter === ' ' ? (
                <motion.div
                  key="space"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl text-muted-foreground">SPACE</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center mb-4 mx-auto">
                    <Hand className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Signs will appear here
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Letter sequence */}
          {currentLetters.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 border-t border-border pt-4"
            >
              <p className="text-xs text-muted-foreground mb-2">Letter sequence ({currentLetters.length} letters):</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {currentLetters.map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      letter === ' '
                        ? 'bg-muted/50 text-muted-foreground w-4'
                        : index === activeLetterIndex
                        ? 'gradient-bg-primary text-primary-foreground shadow-glow scale-110'
                        : index < activeLetterIndex
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {letter === ' ' ? '' : letter}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Quick guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-6 border border-primary/10"
      >
        <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          How it works
        </h4>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">1</span>
            </div>
            <p className="text-muted-foreground">Click "Start Listening" and speak clearly</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold">2</span>
            </div>
            <p className="text-muted-foreground">Your speech is converted to text in real-time</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <span className="text-success font-bold">3</span>
            </div>
            <p className="text-muted-foreground">Watch the ASL finger spelling animation</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SpeechToSign;
