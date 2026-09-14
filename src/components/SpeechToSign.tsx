import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  Hand,
  Loader2,
  AlertCircle,
  Play,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Database,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { translateToEnglish } from '@/lib/translationApi';
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

/* --------------------------------------------------
   Supported Languages
-------------------------------------------------- */

const LANGUAGES = [
  {
    code: 'en-US',
    translationCode: 'en',
    name: 'English',
  },
  {
    code: 'ta-IN',
    translationCode: 'ta',
    name: 'Tamil',
  },
  {
    code: 'hi-IN',
    translationCode: 'hi',
    name: 'Hindi',
  },
  {
    code: 'te-IN',
    translationCode: 'te',
    name: 'Telugu',
  },
  {
    code: 'ml-IN',
    translationCode: 'ml',
    name: 'Malayalam',
  },
  {
    code: 'kn-IN',
    translationCode: 'kn',
    name: 'Kannada',
  },
  {
    code: 'bn-IN',
    translationCode: 'bn',
    name: 'Bengali',
  },
];

/* --------------------------------------------------
   Component
-------------------------------------------------- */

const SpeechToSign = ({
  isActive,
  onToggle,
  autoStart = true,
  sessionId = null,
}: SpeechToSignProps) => {
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);

  /* --------------------------------------------------
     NEW: Multilingual states
  -------------------------------------------------- */

  const [selectedLanguage, setSelectedLanguage] =
    useState('en-US');

  const [translatedText, setTranslatedText] =
    useState('');

  const [isTranslating, setIsTranslating] =
    useState(false);

  const { saveTranscript } = useSpeechTranscript();

  /* --------------------------------------------------
     Speech Recognition
  -------------------------------------------------- */

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: selectedLanguage,
    interimResults: true,
  });

  const { speak, isSpeaking } = useSpeechSynthesis();

  /* --------------------------------------------------
     Auto-start listening
  -------------------------------------------------- */

  useEffect(() => {
    if (
      autoStart &&
      isSupported &&
      !autoStarted &&
      !isListening
    ) {
      setAutoStarted(true);

      setTimeout(() => {
        startListening();
        onToggle();
      }, 500);
    }
  }, [
    autoStart,
    isSupported,
    autoStarted,
    isListening,
    startListening,
    onToggle,
  ]);

  /* --------------------------------------------------
     Translate speech to English
  -------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const translateSpeech = async () => {
      if (!transcript.trim()) {
        setTranslatedText('');
        return;
      }

      /* English → no translation needed */

      if (selectedLanguage === 'en-US') {
        setTranslatedText(transcript);
        return;
      }

      try {
        setIsTranslating(true);

        const language = LANGUAGES.find(
          (item) => item.code === selectedLanguage
        );

        if (!language) {
          return;
        }

        const result = await translateToEnglish(
          transcript,
          language.translationCode
        );

        if (!cancelled) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error(
          'Translation error:',
          error
        );

        if (!cancelled) {
          setTranslatedText('');
          toast.error(
            'Unable to translate speech.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
        }
      }
    };

    translateSpeech();

    return () => {
      cancelled = true;
    };
  }, [transcript, selectedLanguage]);

  /* --------------------------------------------------
     Convert English text → ASL letters
  -------------------------------------------------- */

  useEffect(() => {
    /*
      English:
      transcript + interimTranscript

      Other languages:
      translatedText
    */

    const textForASL =
      selectedLanguage === 'en-US'
        ? transcript + interimTranscript
        : translatedText;

    const fullText = textForASL
      .toUpperCase()
      .replace(/[^A-Z\s]/g, '');

    const letters = fullText
      .split('')
      .filter(
        (letter) =>
          ASL_ALPHABET[letter] ||
          letter === ' '
      );

    setCurrentLetters(letters);

    if (!isAnimating) {
      setActiveLetterIndex(0);
    }
  }, [
    transcript,
    interimTranscript,
    translatedText,
    selectedLanguage,
    isAnimating,
  ]);

  /* --------------------------------------------------
     Animate letters
  -------------------------------------------------- */

  useEffect(() => {
    if (
      isAnimating &&
      currentLetters.length > 0
    ) {
      const interval = setInterval(() => {
        setActiveLetterIndex((prev) => {
          if (
            prev >=
            currentLetters.length - 1
          ) {
            setIsAnimating(false);
            return prev;
          }

          return prev + 1;
        });
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [
    isAnimating,
    currentLetters.length,
  ]);

  /* --------------------------------------------------
     Start / Stop Listening
  -------------------------------------------------- */

  const handleToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        resetTranscript();

        setTranslatedText('');
        setCurrentLetters([]);
        setActiveLetterIndex(0);
        setIsAnimating(false);

        startListening();
      } catch (err) {
        console.error(
          'Microphone permission error:',
          err
        );

        toast.error(
          'Microphone access denied. Please enable microphone permissions.'
        );
      }
    }

    onToggle();
  };

  /* --------------------------------------------------
     Play ASL animation
  -------------------------------------------------- */

  const handlePlayAnimation = useCallback(() => {
    if (currentLetters.length > 0) {
      setActiveLetterIndex(0);
      setIsAnimating(true);
    }
  }, [currentLetters.length]);

  /* --------------------------------------------------
     Reset
  -------------------------------------------------- */

  const handleReset = useCallback(() => {
    resetTranscript();

    setTranslatedText('');
    setCurrentLetters([]);
    setActiveLetterIndex(0);
    setIsAnimating(false);
  }, [resetTranscript]);

  /* --------------------------------------------------
     Copy
  -------------------------------------------------- */

  const handleCopy = useCallback(() => {
    const text =
      transcript + interimTranscript;

    if (text) {
      navigator.clipboard.writeText(text);

      setCopied(true);

      toast.success(
        'Text copied to clipboard!'
      );

      setTimeout(
        () => setCopied(false),
        2000
      );
    }
  }, [
    transcript,
    interimTranscript,
  ]);

  /* --------------------------------------------------
     Save to Cloud
  -------------------------------------------------- */

  const handleSaveToCloud =
    useCallback(async () => {
      const text =
        transcript + interimTranscript;

      if (
        text &&
        currentLetters.length > 0
      ) {
        const result =
          await saveTranscript(
            sessionId,
            text,
            currentLetters
          );

        if (result) {
          setSavedToCloud(true);

          toast.success(
            'Transcript saved to cloud!'
          );

          setTimeout(
            () => setSavedToCloud(false),
            2000
          );
        }
      }
    }, [
      transcript,
      interimTranscript,
      currentLetters,
      sessionId,
      saveTranscript,
    ]);

  /* --------------------------------------------------
     Text to Speech
  -------------------------------------------------- */

  const handleSpeak = useCallback(() => {
    const text =
      transcript + interimTranscript;

    if (text) {
      speak(text);
    }
  }, [
    transcript,
    interimTranscript,
    speak,
  ]);

  /* --------------------------------------------------
     Active Sign
  -------------------------------------------------- */

  const activeLetter =
    currentLetters[activeLetterIndex];

  const signInfo =
    activeLetter &&
    activeLetter !== ' '
      ? ASL_ALPHABET[activeLetter]
      : null;

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------
          Header
      ------------------------------------------------ */}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="p-3 rounded-xl gradient-bg-accent shadow-accent">
            <Mic className="w-6 h-6 text-accent-foreground" />
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Speech to Sign
            </h3>

            <p className="text-sm text-muted-foreground">
              Speak and see ASL finger spelling
            </p>
          </div>

        </div>

        {/* ------------------------------------------------
            Language + Start button
        ------------------------------------------------ */}

        <div className="flex flex-wrap items-center gap-2">

          {/* Language selector */}

          <select
            value={selectedLanguage}
            onChange={(e) => {
              stopListening();

              setSelectedLanguage(
                e.target.value
              );

              resetTranscript();

              setTranslatedText('');
              setCurrentLetters([]);
              setActiveLetterIndex(0);
              setIsAnimating(false);
            }}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            {LANGUAGES.map(
              (language) => (
                <option
                  key={language.code}
                  value={language.code}
                >
                  {language.name}
                </option>
              )
            )}
          </select>

          {/* Start / Stop */}

          <Button
            onClick={handleToggle}
            variant={
              isListening
                ? 'destructive'
                : 'default'
            }
            size="lg"
            className={`rounded-xl ${
              !isListening
                ? 'gradient-bg-accent shadow-accent'
                : ''
            }`}
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
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
              }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
          )}

        </div>
      </div>

      {/* ------------------------------------------------
          Listening status
      ------------------------------------------------ */}

      {isSupported && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            isListening
              ? 'bg-green-500/10 text-green-700 border border-green-200'
              : 'bg-slate-500/10 text-slate-600 border border-slate-200'
          }`}
        >
          <motion.div
            animate={
              isListening
                ? {
                    scale: [
                      0.8,
                      1.2,
                      0.8,
                    ],
                    opacity: [
                      0.5,
                      1,
                      0.5,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
            className="w-2 h-2 rounded-full bg-current"
          />

          {isListening
            ? `Listening in ${
                LANGUAGES.find(
                  (language) =>
                    language.code ===
                    selectedLanguage
                )?.name || 'selected language'
              }...`
            : 'Ready to listen'}
        </motion.div>
      )}

      {/* ------------------------------------------------
          Not supported
      ------------------------------------------------ */}

      {!isSupported && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20"
        >
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />

          <p className="text-sm text-foreground">
            Speech recognition is not
            supported in your browser.
            Try Chrome, Edge, or Safari.
          </p>
        </motion.div>
      )}

      {/* ------------------------------------------------
          Error
      ------------------------------------------------ */}

      {error && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />

          <p className="text-sm text-foreground">
            {error}
          </p>
        </motion.div>
      )}

      {/* ------------------------------------------------
          Main content
      ------------------------------------------------ */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* =================================================
            LEFT: Speech
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="bg-card rounded-2xl border border-border p-6 shadow-lg"
        >

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />

              <h4 className="font-medium text-foreground">
                Your Speech
              </h4>
            </div>

            {(transcript ||
              interimTranscript) && (
              <div className="flex items-center gap-1">

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
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
                  onClick={
                    handleSaveToCloud
                  }
                  title="Save to cloud"
                >
                  {savedToCloud ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
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

          {/* Speech transcript */}

          <div className="min-h-[150px] p-4 rounded-xl bg-muted/50 relative overflow-hidden">

            {isListening &&
            !transcript &&
            !interimTranscript ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">

                <div className="relative">

                  <Loader2 className="w-8 h-8 animate-spin text-primary" />

                  <motion.div
                    animate={{
                      scale: [
                        1,
                        1.5,
                        1,
                      ],
                      opacity: [
                        0.5,
                        0,
                        0.5,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 rounded-full border-2 border-primary"
                  />

                </div>

                <span className="text-muted-foreground">
                  Listening...
                </span>

              </div>
            ) : transcript ||
              interimTranscript ? (
              <p className="text-foreground leading-relaxed text-lg">

                {transcript}

                {interimTranscript && (
                  <span className="text-muted-foreground italic">
                    {interimTranscript}
                  </span>
                )}

              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">

                <Sparkles className="w-8 h-8 text-muted-foreground" />

                <p className="text-muted-foreground">
                  {isSupported
                    ? 'Start speaking to see your words here...'
                    : 'Speech recognition unavailable'}
                </p>

              </div>
            )}

          </div>

          {/* ------------------------------------------------
              English translation
          ------------------------------------------------ */}

          {selectedLanguage !==
            'en-US' &&
            (transcript ||
              isTranslating ||
              translatedText) && (
              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">

                <div className="flex items-center justify-between mb-2">

                  <p className="text-sm font-semibold text-foreground">
                    English Translation
                  </p>

                  {isTranslating && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}

                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">

                  {isTranslating
                    ? 'Translating...'
                    : translatedText ||
                      'Waiting for translation...'}

                </p>

              </div>
            )}

          {/* Listening animation */}

          {isListening && (
            <div className="mt-4 flex items-center justify-center gap-1">

              {[1, 2, 3, 4, 5, 6, 7].map(
                (i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleY: [
                        1,
                        2,
                        1,
                      ],
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 h-6 rounded-full bg-accent"
                  />
                )
              )}

            </div>
          )}

        </motion.div>

        {/* =================================================
            RIGHT: ASL Sign
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="bg-card rounded-2xl border border-border p-6 shadow-lg"
        >

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <Hand className="w-5 h-5 text-accent" />

              <h4 className="font-medium text-foreground">
                ASL Sign
              </h4>

            </div>

            {currentLetters.length >
              0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={
                  handlePlayAnimation
                }
                disabled={isAnimating}
                className="rounded-lg"
              >
                <Play className="w-4 h-4 mr-1" />

                {isAnimating
                  ? 'Playing...'
                  : 'Play'}
              </Button>
            )}

          </div>

          {/* Sign display */}

          <div className="min-h-[150px] flex items-center justify-center">

            <AnimatePresence mode="wait">

              {signInfo ? (
                <motion.div
                  key={activeLetter}
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                    rotateY: -90,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    rotateY: 90,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="text-center"
                >

                  <motion.div
                    className="w-32 h-32 rounded-3xl gradient-bg-primary flex items-center justify-center mb-4 mx-auto shadow-glow relative overflow-hidden"
                    whileHover={{
                      scale: 1.05,
                    }}
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
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0"
                    />

                  </motion.div>

                  <p className="text-xl font-display font-bold text-foreground">
                    {signInfo.name}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {signInfo.description}
                  </p>

                  <p className="text-3xl mt-2">
                    {signInfo.handShape}
                  </p>

                </motion.div>

              ) : activeLetter ===
                ' ' ? (

                <motion.div
                  key="space"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="text-center"
                >

                  <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center mb-4 mx-auto">

                    <span className="text-2xl text-muted-foreground">
                      SPACE
                    </span>

                  </div>

                </motion.div>

              ) : (

                <motion.div
                  key="empty"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
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

          {currentLetters.length >
            0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-4 border-t border-border pt-4"
            >

              <p className="text-xs text-muted-foreground mb-2">
                Letter sequence (
                {currentLetters.length}{' '}
                letters):
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">

                {currentLetters.map(
                  (
                    letter,
                    index
                  ) => (
                    <motion.span
                      key={index}
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      transition={{
                        delay:
                          index * 0.02,
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        letter === ' '
                          ? 'bg-muted/50 text-muted-foreground w-4'
                          : index ===
                            activeLetterIndex
                          ? 'gradient-bg-primary text-primary-foreground shadow-glow scale-110'
                          : index <
                            activeLetterIndex
                          ? 'bg-primary/20 text-primary'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {letter === ' '
                        ? ''
                        : letter}
                    </motion.span>
                  )
                )}

              </div>

            </motion.div>
          )}

        </motion.div>

      </div>

      {/* ------------------------------------------------
          Quick Guide
      ------------------------------------------------ */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
        className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-6 border border-primary/10"
      >

        <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">

          <Sparkles className="w-5 h-5 text-primary" />

          How it works

        </h4>

        <div className="grid sm:grid-cols-3 gap-4 text-sm">

          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">
                1
              </span>
            </div>

            <p className="text-muted-foreground">
              Select your language and click
              "Start Listening"
            </p>

          </div>

          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold">
                2
              </span>
            </div>

            <p className="text-muted-foreground">
              Your speech is converted to
              text and translated to English
            </p>

          </div>

          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <span className="text-success font-bold">
                3
              </span>
            </div>

            <p className="text-muted-foreground">
              Watch the ASL finger spelling
              animation
            </p>

          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default SpeechToSign;