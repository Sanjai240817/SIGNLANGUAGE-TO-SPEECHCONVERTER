import { motion } from 'framer-motion';
import { Volume2, VolumeX, Pause, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useState } from 'react';

interface SpeechControlsProps {
  lastDetectedText: string;
  autoSpeak: boolean;
  onAutoSpeakChange: (value: boolean) => void;
}

const SpeechControls = ({ lastDetectedText, autoSpeak, onAutoSpeakChange }: SpeechControlsProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    isSpeaking,
    isPaused,
    isSupported,
    speak,
    pause,
    resume,
    cancel,
  } = useSpeechSynthesis({ rate, pitch });

  const handleSpeak = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else if (lastDetectedText) {
      speak(lastDetectedText);
    }
  };

  const handleStop = () => {
    cancel();
  };

  // Filter voices to show English ones first
  const sortedVoices = [...voices].sort((a, b) => {
    if (a.lang.startsWith('en') && !b.lang.startsWith('en')) return -1;
    if (!a.lang.startsWith('en') && b.lang.startsWith('en')) return 1;
    return a.name.localeCompare(b.name);
  });

  if (!isSupported) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
        <div className="flex items-center gap-3 text-muted-foreground">
          <VolumeX className="w-6 h-6" />
          <p>Text-to-speech is not supported in your browser.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Speech Output</h3>
            <p className="text-sm text-muted-foreground">Text-to-speech controls</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className={showSettings ? 'text-primary' : 'text-muted-foreground'}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Current text */}
      <div className="px-6 py-4 bg-muted/30">
        <p className="text-sm text-muted-foreground mb-1">Last detected:</p>
        <p className="font-medium text-foreground min-h-[24px]">
          {lastDetectedText || 'No text detected yet'}
        </p>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 flex items-center gap-4">
        <Button
          onClick={handleSpeak}
          size="lg"
          className="flex-1 gradient-bg-primary shadow-glow"
          disabled={!lastDetectedText}
        >
          {isSpeaking && !isPaused ? (
            <>
              <Pause className="mr-2 w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 w-5 h-5" />
              {isPaused ? 'Resume' : 'Speak'}
            </>
          )}
        </Button>
        
        {isSpeaking && (
          <Button
            onClick={handleStop}
            variant="outline"
            size="lg"
          >
            <VolumeX className="mr-2 w-5 h-5" />
            Stop
          </Button>
        )}
      </div>

      {/* Auto-speak toggle */}
      <div className="px-6 py-4 border-t border-border">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-foreground">Auto-speak detected gestures</span>
          <button
            onClick={() => onAutoSpeakChange(!autoSpeak)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoSpeak ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                autoSpeak ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border"
        >
          <div className="p-6 space-y-6">
            {/* Voice selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Voice</label>
              <Select
                value={selectedVoice?.name || ''}
                onValueChange={(value) => {
                  const voice = voices.find(v => v.name === value);
                  if (voice) setSelectedVoice(voice);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speed control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Speed</label>
                <span className="text-sm text-muted-foreground">{rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[rate]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={([value]) => setRate(value)}
                className="py-2"
              />
            </div>

            {/* Pitch control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Pitch</label>
                <span className="text-sm text-muted-foreground">{pitch.toFixed(1)}</span>
              </div>
              <Slider
                value={[pitch]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={([value]) => setPitch(value)}
                className="py-2"
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SpeechControls;
