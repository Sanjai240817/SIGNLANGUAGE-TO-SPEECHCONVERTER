import { motion } from 'framer-motion';
import { Shield, ShieldCheck, Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrivacyBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const PrivacyBadge = ({ variant = 'compact', className = '' }: PrivacyBadgeProps) => {
  const content = (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <ShieldCheck className="w-4 h-4 text-success" />
        <span>100% Local Processing</span>
      </div>
      <ul className="space-y-1 text-muted-foreground text-xs">
        <li className="flex items-center gap-2">
          <Lock className="w-3 h-3" />
          Video never leaves your device
        </li>
        <li className="flex items-center gap-2">
          <Lock className="w-3 h-3" />
          Audio processed in-browser
        </li>
        <li className="flex items-center gap-2">
          <Lock className="w-3 h-3" />
          No cloud uploads or storage
        </li>
      </ul>
    </div>
  );

  if (variant === 'full') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20 ${className}`}
      >
        <div className="p-2 rounded-lg bg-success/10">
          <ShieldCheck className="w-5 h-5 text-success" />
        </div>
        <div>
          <h4 className="font-medium text-foreground mb-1">Privacy Protected</h4>
          <p className="text-sm text-muted-foreground">
            All processing happens locally in your browser. Your video and audio never leave your device.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success hover:bg-success/20 transition-colors ${className}`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Private</span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PrivacyBadge;
