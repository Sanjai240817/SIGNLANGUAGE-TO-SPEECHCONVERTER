import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Trash2, Clock, Copy, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { toast } from 'sonner';

export interface GestureHistoryItem {
  id: string;
  gesture: string;
  description: string;
  timestamp: Date;
}

interface GestureHistoryProps {
  history: GestureHistoryItem[];
  onClear: () => void;
  onReplay?: (item: GestureHistoryItem) => void;
}

const GestureHistory = ({ history, onClear, onReplay }: GestureHistoryProps) => {
  const { speak, isSpeaking, cancel } = useSpeechSynthesis();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleSpeak = (item: GestureHistoryItem) => {
    if (isSpeaking && speakingId === item.id) {
      cancel();
      setSpeakingId(null);
    } else {
      speak(item.description);
      setSpeakingId(item.id);
    }
  };

  const handleCopy = async (item: GestureHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.description);
      setCopiedId(item.id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleReplay = (item: GestureHistoryItem) => {
    if (onReplay) {
      onReplay(item);
    }
    // Also speak when replaying
    speak(item.description);
    setSpeakingId(item.id);
    toast.success(`Replaying: ${item.description}`);
  };

  const handleCopyAll = async () => {
    const allText = history.map(item => item.description).join('\n');
    try {
      await navigator.clipboard.writeText(allText);
      toast.success('Copied all gestures to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Gesture History</h3>
            <p className="text-sm text-muted-foreground">
              {history.length} gesture{history.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                className="text-muted-foreground hover:text-primary"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* History list */}
      <div className="max-h-80 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Volume2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No gestures detected yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start signing to see translations here
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-bg-primary text-primary-foreground font-display font-bold">
                      {item.gesture.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReplay(item)}
                      className="rounded-full text-muted-foreground hover:text-accent"
                      title="Replay"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(item)}
                      className="rounded-full text-muted-foreground hover:text-primary"
                      title="Copy"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(item)}
                      className={`rounded-full ${
                        speakingId === item.id && isSpeaking ? 'text-primary' : 'text-muted-foreground'
                      }`}
                      title="Speak"
                    >
                      {speakingId === item.id && isSpeaking ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default GestureHistory;
