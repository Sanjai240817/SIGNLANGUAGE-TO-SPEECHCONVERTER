import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Trash2, 
  Volume2, 
  Copy, 
  Check,
  Space,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { toast } from 'sonner';

interface SentenceBuilderProps {
  currentGesture: string | null;
  onClear: () => void;
}

const SentenceBuilder = ({ currentGesture, onClear }: SentenceBuilderProps) => {
  const [sentence, setSentence] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { speak, isSpeaking } = useSpeechSynthesis();

  // Add gesture to sentence
  const addGesture = useCallback((gesture: string) => {
    if (gesture && gesture.length === 1) {
      setSentence(prev => [...prev, gesture]);
    }
  }, []);

  // Handle adding current gesture
  const handleAddCurrent = () => {
    if (currentGesture && currentGesture.length === 1) {
      addGesture(currentGesture);
      toast.success(`Added "${currentGesture}" to sentence`);
    }
  };

  // Add space
  const addSpace = () => {
    setSentence(prev => [...prev, ' ']);
  };

  // Remove last character
  const removeLast = () => {
    setSentence(prev => prev.slice(0, -1));
  };

  // Clear sentence
  const clearSentence = () => {
    setSentence([]);
    onClear();
  };

  // Speak sentence
  const speakSentence = () => {
    const text = sentence.join('');
    if (text.trim()) {
      speak(text);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    const text = sentence.join('');
    if (text.trim()) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sentenceText = sentence.join('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Type className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Sentence Builder</h3>
            <p className="text-sm text-muted-foreground">Build words from gestures</p>
          </div>
        </div>

        {sentence.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSentence}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Sentence display */}
      <div className="px-6 py-4 min-h-[80px]">
        <div className="flex flex-wrap gap-1 min-h-[48px] p-3 rounded-xl bg-muted/50 border border-border">
          <AnimatePresence mode="popLayout">
            {sentence.length === 0 ? (
              <span className="text-muted-foreground italic text-sm">
                Detected letters will appear here...
              </span>
            ) : (
              sentence.map((char, index) => (
                <motion.span
                  key={`${index}-${char}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`inline-flex items-center justify-center min-w-[28px] h-8 px-2 rounded-md font-mono font-medium ${
                    char === ' ' 
                      ? 'bg-transparent text-muted-foreground border border-dashed border-border' 
                      : 'gradient-bg-primary text-primary-foreground'
                  }`}
                >
                  {char === ' ' ? '␣' : char}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </div>
        
        {sentenceText.trim() && (
          <p className="mt-2 text-sm text-muted-foreground">
            Reads as: <span className="font-medium text-foreground">{sentenceText}</span>
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-t border-border flex flex-wrap gap-2">
        <Button
          onClick={handleAddCurrent}
          disabled={!currentGesture || currentGesture.length !== 1}
          size="sm"
          className="gradient-bg-primary"
        >
          Add "{currentGesture || '?'}"
        </Button>
        
        <Button
          onClick={addSpace}
          variant="outline"
          size="sm"
        >
          <Space className="w-4 h-4 mr-1" />
          Space
        </Button>
        
        <Button
          onClick={removeLast}
          variant="outline"
          size="sm"
          disabled={sentence.length === 0}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Undo
        </Button>

        <div className="flex-1" />

        <Button
          onClick={speakSentence}
          variant="outline"
          size="sm"
          disabled={!sentenceText.trim() || isSpeaking}
        >
          <Volume2 className="w-4 h-4 mr-1" />
          Speak
        </Button>

        <Button
          onClick={copyToClipboard}
          variant="outline"
          size="sm"
          disabled={!sentenceText.trim()}
        >
          {copied ? (
            <Check className="w-4 h-4 mr-1 text-success" />
          ) : (
            <Copy className="w-4 h-4 mr-1" />
          )}
          Copy
        </Button>
      </div>
    </motion.div>
  );
};

export default SentenceBuilder;
