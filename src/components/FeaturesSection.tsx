import { motion } from 'framer-motion';
import { Hand, Camera, Volume2, ArrowRight, Mic, Zap, Shield, Globe } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Camera,
      title: 'Real-time Detection',
      description: 'Advanced computer vision captures and analyzes hand gestures instantly with sub-second latency.',
      color: 'primary',
    },
    {
      icon: Hand,
      title: 'ASL Support',
      description: 'Full support for American Sign Language alphabet and common phrases with 90%+ accuracy.',
      color: 'accent',
    },
    {
      icon: Volume2,
      title: 'Natural Speech',
      description: 'High-quality text-to-speech converts detected signs into clear, natural-sounding voice output.',
      color: 'primary',
    },
    {
      icon: Mic,
      title: 'Speech to Sign',
      description: 'Reverse translation - speak and see the corresponding sign language representations.',
      color: 'accent',
    },
    {
      icon: Zap,
      title: 'Edge Processing',
      description: 'Runs entirely in your browser for maximum privacy and zero network latency.',
      color: 'primary',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'No video data leaves your device. All processing happens locally and securely.',
      color: 'accent',
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Everything You Need for
            <span className="gradient-text"> Seamless Communication</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Built with cutting-edge AI technology to provide accurate, real-time 
            sign language translation in any environment.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                feature.color === 'primary' 
                  ? 'bg-primary/10 group-hover:bg-primary/20' 
                  : 'bg-accent/10 group-hover:bg-accent/20'
              } transition-colors`}>
                <feature.icon className={`w-6 h-6 ${
                  feature.color === 'primary' ? 'text-primary' : 'text-accent'
                }`} />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className={`w-5 h-5 ${
                  feature.color === 'primary' ? 'text-primary' : 'text-accent'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '90%+', label: 'Accuracy Rate' },
            { value: '<100ms', label: 'Detection Speed' },
            { value: '26+', label: 'ASL Letters' },
            { value: '100%', label: 'Privacy' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl lg:text-4xl font-display font-bold gradient-text mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
