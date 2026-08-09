import { motion } from 'framer-motion';
import { Hand, Volume2, Mic, ArrowRight, Sparkles, Users, Globe, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen gradient-bg-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 pt-20 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-16"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-bg-primary shadow-glow">
              <Hand className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">SignSpeak AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#translator" className="text-muted-foreground hover:text-foreground transition-colors">Translator</a>
            <a href="/backend" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Database className="w-4 h-4" />
              Dashboard
            </a>
          </nav>
        </motion.div>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Communication</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight">
              <span className="text-foreground">Breaking </span>
              <span className="gradient-text">Communication</span>
              <br />
              <span className="text-foreground">Barriers</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Transform sign language into natural speech instantly. Our advanced AI enables seamless 
              communication between deaf/hard-of-hearing individuals and the hearing community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group text-lg px-8 py-6 rounded-xl gradient-bg-primary hover:opacity-90 shadow-glow transition-all"
                onClick={onGetStarted}
              >
                Start Translating
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-secondary"
              >
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">10K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">ASL Support</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-full h-full rounded-full border-2 border-primary/20"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute w-[90%] h-[90%] rounded-full border-2 border-primary/15"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute w-[80%] h-[80%] rounded-full border-2 border-primary/10"
                />
              </div>

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  {/* Main card */}
                  <div className="glass rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center gap-6">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="p-4 rounded-2xl bg-primary/10"
                      >
                        <Hand className="w-12 h-12 text-primary" />
                      </motion.div>
                      
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ 
                              duration: 0.5, 
                              repeat: Infinity, 
                              delay: i * 0.15,
                              ease: "easeInOut" 
                            }}
                            className="w-1.5 h-6 rounded-full bg-primary"
                          />
                        ))}
                      </div>
                      
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="p-4 rounded-2xl bg-accent/10"
                      >
                        <Volume2 className="w-12 h-12 text-accent" />
                      </motion.div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="font-display text-lg font-semibold text-foreground">
                        "Hello, how are you?"
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Detected from ASL gestures
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 p-3 rounded-xl glass shadow-lg"
              >
                <Mic className="w-6 h-6 text-primary" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-5 p-3 rounded-xl glass shadow-lg"
              >
                <Volume2 className="w-6 h-6 text-accent" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-2 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
