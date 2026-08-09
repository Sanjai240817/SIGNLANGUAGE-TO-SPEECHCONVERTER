import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ASLSign {
  letter: string;
  emoji: string;
  description: string;
  fingers: string;
}

const ASL_SIGNS: ASLSign[] = [
  { letter: 'A', emoji: '✊', description: 'Fist with thumb on side', fingers: '👊 Thumb across closed fist' },
  { letter: 'B', emoji: '🖐️', description: 'Flat hand, thumb folded in', fingers: '4 fingers up, thumb tucked' },
  { letter: 'C', emoji: '🤏', description: 'Curved hand forming C', fingers: 'All fingers curved into C shape' },
  { letter: 'D', emoji: '☝️', description: 'Index up, others circle thumb', fingers: 'Index points up, others touch thumb' },
  { letter: 'E', emoji: '🤜', description: 'Fingers curled, thumb across', fingers: 'All fingertips touch thumb' },
  { letter: 'F', emoji: '👌', description: 'OK shape, 3 fingers up', fingers: 'Index+thumb circle, others extended' },
  { letter: 'G', emoji: '👉', description: 'Index & thumb point sideways', fingers: 'Index+thumb point, others folded' },
  { letter: 'H', emoji: '✌️', description: 'Index & middle sideways', fingers: 'Index+middle horizontal, others folded' },
  { letter: 'I', emoji: '🤙', description: 'Pinky extended only', fingers: 'Only pinky raised, fist closed' },
  { letter: 'J', emoji: '🤙', description: 'Pinky extended, draw J', fingers: 'Like I but trace a J in air' },
  { letter: 'K', emoji: '✌️', description: 'Index & middle up, thumb between', fingers: 'V shape with thumb touching middle' },
  { letter: 'L', emoji: '👆', description: 'L shape: thumb & index', fingers: 'Thumb+index at 90°, others folded' },
  { letter: 'M', emoji: '✊', description: 'Thumb under 3 fingers', fingers: 'Thumb tucked under index+middle+ring' },
  { letter: 'N', emoji: '✊', description: 'Thumb under 2 fingers', fingers: 'Thumb tucked under index+middle' },
  { letter: 'O', emoji: '👌', description: 'All fingers form O', fingers: 'All fingertips touch thumb in circle' },
  { letter: 'P', emoji: '🤞', description: 'K shape pointing down', fingers: 'Like K but hand points downward' },
  { letter: 'Q', emoji: '👇', description: 'G shape pointing down', fingers: 'Like G but hand points downward' },
  { letter: 'R', emoji: '🤞', description: 'Index & middle crossed', fingers: 'Index+middle crossed, others folded' },
  { letter: 'S', emoji: '✊', description: 'Fist, thumb over fingers', fingers: 'Closed fist, thumb across front' },
  { letter: 'T', emoji: '👊', description: 'Thumb between index & middle', fingers: 'Fist with thumb between index+middle' },
  { letter: 'U', emoji: '✌️', description: 'Index & middle together up', fingers: 'Index+middle together pointing up' },
  { letter: 'V', emoji: '✌️', description: 'Peace sign', fingers: 'Index+middle spread apart (V shape)' },
  { letter: 'W', emoji: '🖖', description: 'Three fingers extended', fingers: 'Index+middle+ring up, others folded' },
  { letter: 'X', emoji: '☝️', description: 'Index bent like hook', fingers: 'Index hooked, all others folded' },
  { letter: 'Y', emoji: '🤙', description: 'Thumb & pinky extended', fingers: 'Thumb+pinky out (hang loose)' },
  { letter: 'Z', emoji: '☝️', description: 'Draw Z with index finger', fingers: 'Index extended, trace Z in air' },
];

const ASLAlphabetChart = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = search
    ? ASL_SIGNS.filter(s => s.letter.toLowerCase().includes(search.toLowerCase()))
    : ASL_SIGNS;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="w-5 h-5" />
          <h3 className="text-lg font-display font-bold text-foreground">ASL Alphabet Reference</h3>
        </div>
        <div className="flex-1" />
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search letter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm rounded-xl bg-muted/50 border-border/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-2">
        {filtered.map((sign, i) => (
          <motion.button
            key={sign.letter}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => setSelected(selected === sign.letter ? null : sign.letter)}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 cursor-pointer group
              ${selected === sign.letter
                ? 'bg-primary/15 border-primary shadow-glow scale-105'
                : 'bg-card/80 border-border/40 hover:border-primary/40 hover:bg-primary/5'
              }`}
          >
            <span className="text-2xl sm:text-3xl leading-none">{sign.emoji}</span>
            <span className={`text-sm font-bold font-display ${selected === sign.letter ? 'text-primary' : 'text-foreground'}`}>
              {sign.letter}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Detail panel for selected letter */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/20"
        >
          {(() => {
            const sign = ASL_SIGNS.find(s => s.letter === selected)!;
            return (
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-4xl shrink-0">
                  {sign.emoji}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-display font-bold text-foreground mb-1">
                    Letter {sign.letter}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">{sign.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground font-medium">
                      {sign.fingers}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
};

export default ASLAlphabetChart;
