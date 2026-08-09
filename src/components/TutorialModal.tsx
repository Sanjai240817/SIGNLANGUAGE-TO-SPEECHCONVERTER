import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  Hand, 
  Mic, 
  Volume2, 
  Camera,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ASL_ALPHABET } from '@/lib/signLanguageData';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to SignSpeak AI',
    icon: Hand,
    content: `SignSpeak AI helps you communicate using sign language. It works in two modes:
    
• **Sign to Speech**: Show hand gestures to the camera and hear them spoken aloud
• **Speech to Sign**: Speak into your microphone and see the corresponding sign language letters`,
    tips: ['All processing happens locally in your browser for privacy', 'No data is sent to external servers'],
  },
  {
    title: 'Sign to Speech Mode',
    icon: Camera,
    content: `In this mode, the camera detects your hand gestures and converts them to speech.

**How to use:**
1. Click "Start Camera" to begin
2. Position your hand clearly in frame
3. Make a gesture and hold it steady
4. Wait for the stability indicator to confirm
5. The gesture will be spoken automatically`,
    tips: ['Hold each gesture for 1-2 seconds', 'Good lighting helps recognition accuracy'],
  },
  {
    title: 'Speech to Sign Mode',
    icon: Mic,
    content: `In this mode, your speech is converted to visual sign language representations.

**How to use:**
1. Click "Start Speaking" to begin
2. Speak clearly into your microphone
3. Watch as letters appear as sign language visuals
4. The letter sequence animates through your words`,
    tips: ['Speak slowly and clearly', 'Works best in quiet environments'],
  },
  {
    title: 'Voice Settings',
    icon: Volume2,
    content: `Customize how detected gestures are spoken aloud.

**Available settings:**
• **Voice**: Choose from available system voices
• **Speed**: Adjust speaking rate (0.5x to 2x)
• **Pitch**: Change voice pitch
• **Auto-speak**: Toggle automatic speech for detected gestures`,
    tips: ['Try different voices to find one you prefer', 'Lower speed helps with comprehension'],
  },
  {
    title: 'Privacy & Security',
    icon: Shield,
    content: `SignSpeak AI prioritizes your privacy:

• **Local Processing**: All gesture recognition and speech processing happens in your browser
• **No Cloud Uploads**: Video and audio never leave your device
• **No Data Storage**: Nothing is recorded or saved permanently
• **Open Standards**: Uses Web APIs (MediaPipe, Web Speech API)`,
    tips: ['Camera and microphone access is only active when you enable it', 'You can revoke permissions anytime'],
  },
];

const GESTURE_REFERENCE = Object.entries(ASL_ALPHABET).slice(0, 10).map(([letter, data]) => ({
  letter,
  name: data.name,
  description: data.description,
}));

interface TutorialModalProps {
  triggerClassName?: string;
}

const TutorialModal = ({ triggerClassName }: TutorialModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showReference, setShowReference] = useState(false);

  const currentTutorial = TUTORIAL_STEPS[currentStep];
  const Icon = currentTutorial.icon;

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Tutorial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-bg-primary">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            {currentTutorial.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Tab switch */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={!showReference ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowReference(false)}
              className="flex-1"
            >
              Tutorial
            </Button>
            <Button
              variant={showReference ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowReference(true)}
              className="flex-1"
            >
              Gesture Reference
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {!showReference ? (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {currentTutorial.content.split('\n').map((line, i) => (
                    <p key={i} className="text-foreground whitespace-pre-wrap">
                      {line.replace(/\*\*(.*?)\*\*/g, '').includes(line) ? line : 
                        line.split(/\*\*(.*?)\*\*/).map((part, j) => 
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )
                      }
                    </p>
                  ))}
                </div>

                {/* Tips */}
                {currentTutorial.tips.length > 0 && (
                  <div className="bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-foreground">Pro Tips</span>
                    </div>
                    <ul className="space-y-2">
                      {currentTutorial.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2">
                  {TUTORIAL_STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="reference"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Here are some of the gestures SignSpeak AI can recognize:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {GESTURE_REFERENCE.map(({ letter, description }) => (
                    <div
                      key={letter}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center text-primary-foreground font-display font-bold">
                        {letter}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{letter}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  More gestures are recognized including common phrases like "I Love You", "Thumbs Up", and more.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {!showReference && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              <Button onClick={() => setIsOpen(false)} className="gradient-bg-primary">
                Get Started
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;
