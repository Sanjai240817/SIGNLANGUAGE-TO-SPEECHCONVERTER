import { motion } from 'framer-motion';
import { 
  Brain, 
  Cpu, 
  Wifi, 
  Shield, 
  Zap,
  TrendingUp,
  Target,
  Gauge
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AdvancedStatsProps {
  fps: number;
  confidence: number;
  gestureCount: number;
  handDetected: boolean;
  processingLatency?: number;
}

const AdvancedStats = ({
  fps,
  confidence,
  gestureCount,
  handDetected,
  processingLatency = 0,
}: AdvancedStatsProps) => {
  const stats = [
    {
      icon: Cpu,
      label: 'FPS',
      value: fps,
      max: 60,
      suffix: '',
      color: fps > 30 ? 'text-success' : fps > 15 ? 'text-warning' : 'text-destructive',
      bgColor: fps > 30 ? 'bg-success/20' : fps > 15 ? 'bg-warning/20' : 'bg-destructive/20',
    },
    {
      icon: Target,
      label: 'Confidence',
      value: Math.round(confidence * 100),
      max: 100,
      suffix: '%',
      color: confidence > 0.8 ? 'text-success' : confidence > 0.5 ? 'text-warning' : 'text-muted-foreground',
      bgColor: confidence > 0.8 ? 'bg-success/20' : confidence > 0.5 ? 'bg-warning/20' : 'bg-muted',
    },
    {
      icon: Brain,
      label: 'AI Model',
      value: handDetected ? 'Active' : 'Idle',
      max: 0,
      suffix: '',
      color: handDetected ? 'text-primary' : 'text-muted-foreground',
      bgColor: handDetected ? 'bg-primary/20' : 'bg-muted',
    },
    {
      icon: Zap,
      label: 'Latency',
      value: processingLatency,
      max: 100,
      suffix: 'ms',
      color: processingLatency < 50 ? 'text-success' : processingLatency < 100 ? 'text-warning' : 'text-destructive',
      bgColor: processingLatency < 50 ? 'bg-success/20' : processingLatency < 100 ? 'bg-warning/20' : 'bg-destructive/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          System Stats
        </h3>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${handDetected ? 'bg-success' : 'bg-muted-foreground'}`}
          />
          <span className="text-xs text-muted-foreground">
            {handDetected ? 'Processing' : 'Standby'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>
              {stat.value}{stat.suffix}
            </p>
            {stat.max > 0 && (
              <Progress 
                value={(Number(stat.value) / stat.max) * 100} 
                className="h-1 mt-2"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-success" />
          <span>Local Processing</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi className="w-3.5 h-3.5" />
          <span>Cloud Backup: On</span>
        </div>
      </div>

      {/* Gesture Counter */}
      <div className="flex items-center justify-center gap-3 p-3 rounded-xl gradient-bg-primary/10 border border-primary/20">
        <TrendingUp className="w-5 h-5 text-primary" />
        <span className="text-sm text-foreground">
          <strong className="text-lg">{gestureCount}</strong> gestures detected this session
        </span>
      </div>
    </motion.div>
  );
};

export default AdvancedStats;
