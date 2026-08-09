import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  Sun,
  Camera,
  Hand
} from 'lucide-react';

interface QualityIndicatorProps {
  handDetected: boolean;
  gestureConfidence: number;
  lightingQuality?: 'good' | 'poor' | 'unknown';
  showTips?: boolean;
}

const QualityIndicator = ({ 
  handDetected, 
  gestureConfidence,
  lightingQuality = 'unknown',
  showTips = true
}: QualityIndicatorProps) => {
  const getConfidenceLevel = () => {
    if (gestureConfidence >= 80) return { level: 'high', color: 'text-success', label: 'High Confidence' };
    if (gestureConfidence >= 50) return { level: 'medium', color: 'text-warning', label: 'Medium Confidence' };
    return { level: 'low', color: 'text-destructive', label: 'Low Confidence' };
  };

  const confidence = getConfidenceLevel();

  const getIssues = () => {
    const issues: string[] = [];
    
    if (!handDetected) {
      issues.push('No hand detected in frame');
    }
    
    if (gestureConfidence < 50 && handDetected) {
      issues.push('Gesture unclear - try holding steady');
    }
    
    if (lightingQuality === 'poor') {
      issues.push('Low lighting may affect accuracy');
    }
    
    return issues;
  };

  const issues = getIssues();
  const hasIssues = issues.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Status indicators */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Hand detection status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border">
          <Hand className={`w-4 h-4 ${handDetected ? 'text-success' : 'text-muted-foreground'}`} />
          <span className={`text-xs font-medium ${handDetected ? 'text-success' : 'text-muted-foreground'}`}>
            {handDetected ? 'Hand Detected' : 'No Hand'}
          </span>
        </div>

        {/* Confidence level */}
        {handDetected && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border">
            {confidence.level === 'high' ? (
              <CheckCircle2 className={`w-4 h-4 ${confidence.color}`} />
            ) : confidence.level === 'medium' ? (
              <AlertTriangle className={`w-4 h-4 ${confidence.color}`} />
            ) : (
              <XCircle className={`w-4 h-4 ${confidence.color}`} />
            )}
            <span className={`text-xs font-medium ${confidence.color}`}>
              {confidence.label}
            </span>
          </div>
        )}

        {/* Lighting indicator */}
        {lightingQuality !== 'unknown' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border">
            <Sun className={`w-4 h-4 ${lightingQuality === 'good' ? 'text-success' : 'text-warning'}`} />
            <span className={`text-xs font-medium ${lightingQuality === 'good' ? 'text-success' : 'text-warning'}`}>
              {lightingQuality === 'good' ? 'Good Lighting' : 'Low Light'}
            </span>
          </div>
        )}
      </div>

      {/* Issues and tips */}
      {showTips && hasIssues && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-2 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20"
        >
          <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-foreground">Tips: </span>
            <span className="text-muted-foreground">
              {issues.join(' • ')}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QualityIndicator;
