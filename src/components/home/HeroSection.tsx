import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-ai.png";

const HeroSection = () => (
  <section className="min-h-screen flex items-center relative overflow-hidden pt-16">
    <div className="absolute inset-0 bg-grid opacity-20" />
    <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />

    <div className="container mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            AI Consulting & Automation Agency
          </motion.span>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Transform Your Business with{" "}
            <span className="text-gradient">AI-Powered Automation</span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground mb-8 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            We help forward-thinking companies implement AI strategy and build
            custom automation agents that reduce costs by 40% and accelerate
            growth.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button size="lg" className="glow text-base px-8" asChild>
              <Link to="/contact">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Free Strategy Session
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link to="/case-studies">
                See Our Case Studies
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span>🎓 Founded by IIITians</span>
            <span>🏆 Award-Winning Team</span>
            <span>🤖 50+ AI Agents Deployed</span>
            <span>💰 $2M+ in Cost Savings</span>
          </motion.div>
        </div>

        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl" />
            <img
              src={heroImage}
              alt="AI Neural Network Visualization"
              className="relative w-full rounded-2xl border border-border/50"
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
