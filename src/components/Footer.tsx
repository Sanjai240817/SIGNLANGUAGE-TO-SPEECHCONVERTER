import { motion } from "framer-motion";
import { Hand, Heart, Mail, Globe } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl gradient-bg-primary shadow-glow">
                <Hand className="w-5 h-5 text-primary-foreground" />
              </div>

              <span className="font-display text-xl font-bold text-foreground">
                SignSpeak AI
              </span>
            </div>

            <p className="text-muted-foreground max-w-md leading-relaxed">
              Breaking communication barriers with AI-powered sign language
              translation. Enabling seamless conversations between
              deaf/hard-of-hearing individuals and the hearing community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Quick Links
            </h4>

            <ul className="space-y-2">
              {["Features", "How It Works", "About", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Resources
            </h4>

            <ul className="space-y-2">
              {["ASL Guide", "Documentation", "API Access", "Support"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with
            <Heart className="w-4 h-4 text-destructive" />
            for accessibility
          </p>

          <p className="text-sm text-muted-foreground">
            © {currentYear} SignSpeak AI. All rights reserved.
          </p>

          {/* Social / Contact Icons */}
          <div className="flex items-center gap-4">

            {/* GitHub */}
            <a
              href="https://github.com/Sanjai240817/SIGNLANGUAGE-TO-SPEECHCONVERTER"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-5 h-5" />
            </a>

            {/* Website */}
            <a
              href="#"
              aria-label="Website"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-5 h-5" />
            </a>

            {/* Email */}
            <a
              href="mailto:support@signspeak.ai"
              aria-label="Email"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;