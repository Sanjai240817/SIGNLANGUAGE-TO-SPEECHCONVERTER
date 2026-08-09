import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  History, 
  Clock, 
  Activity, 
  Database,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionData, GestureLogEntry } from '@/hooks/useGestureSession';

interface SessionPanelProps {
  session: SessionData | null;
  gestureLogs: GestureLogEntry[];
  isLoading: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
}

const SessionPanel = ({
  session,
  gestureLogs,
  isLoading,
  onStartSession,
  onEndSession,
}: SessionPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Update elapsed time
  useEffect(() => {
    if (!session) {
      setElapsedTime('00:00');
      return;
    }

    const startTime = new Date(session.started_at).getTime();
    
    const updateTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setElapsedTime(`${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="glass rounded-2xl overflow-hidden border border-border/50 shadow-lg">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${session ? 'bg-success/20' : 'bg-muted'}`}>
              <Database className={`w-5 h-5 ${session ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-foreground">Session Control</h3>
                {session && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-success mr-1.5"
                    />
                    Recording
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {session ? `${gestureLogs.length} gestures logged` : 'Start a session to save gestures'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {session && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{elapsedTime}</span>
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Session Stats */}
                {session && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <Activity className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-foreground">{gestureLogs.length}</p>
                      <p className="text-xs text-muted-foreground">Gestures</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-accent" />
                      <p className="text-lg font-bold text-foreground font-mono">{elapsedTime}</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <Layers className="w-4 h-4 mx-auto mb-1 text-success" />
                      <p className="text-lg font-bold text-foreground">
                        {gestureLogs.length > 0 
                          ? Math.round(gestureLogs.reduce((sum, log) => sum + (log.confidence || 0), 0) / gestureLogs.length)
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Conf.</p>
                    </div>
                  </div>
                )}

                {/* Session Controls */}
                <div className="flex gap-3">
                  {!session ? (
                    <Button
                      onClick={() => {
                        console.log('Starting session...');
                        onStartSession();
                      }}
                      disabled={isLoading}
                      className="flex-1 gradient-bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Activity className="w-5 h-5" />
                          </motion.div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Start Session
                          <Sparkles className="w-4 h-4 ml-2 opacity-70" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={onEndSession}
                      variant="destructive"
                      className="flex-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      size="lg"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      End Session
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-4 hover:bg-muted transition-colors"
                    onClick={() => window.location.href = '/backend'}
                  >
                    <History className="w-5 h-5" />
                  </Button>
                </div>

                {/* Recent Gestures Preview */}
                {gestureLogs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recent Gestures
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gestureLogs.slice(0, 5).map((log, index) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                        >
                          {log.gesture_name}
                        </motion.div>
                      ))}
                      {gestureLogs.length > 5 && (
                        <span className="px-3 py-1.5 text-sm text-muted-foreground">
                          +{gestureLogs.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SessionPanel;
