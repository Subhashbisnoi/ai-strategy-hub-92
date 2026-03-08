import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative overflow-hidden bg-stripe-gradient pt-28 pb-20 md:pt-36 md:pb-28">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <motion.div
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-white shadow-sm mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Now accepting new clients for Q2 2026
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            AI infrastructure for businesses that{" "}
            <span className="text-gradient">move fast</span>
          </motion.h1>

          <motion.p
            className="text-[17px] md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Founded by <span className="font-extrabold text-foreground">IIITians</span> with real-world experience of building Scalable AI  systems across industries & Multiple Trusted Organisations.
            We design, build, and deploy custom AI agents and automation systems.
            From strategy to production
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              size="lg"
              className="h-12 px-7 rounded-lg text-[15px] font-semibold shadow-md hover:shadow-lg transition-all"
              asChild
            >
              <Link to="/contact">
                Start a project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 rounded-lg text-[15px] font-medium border-2"
              asChild
            >
              <Link to="/services">
                See how it works
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center gap-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <span className="block text-2xl font-bold text-foreground">$2M+</span>
              <span className="text-xs">saved for clients</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <span className="block text-2xl font-bold text-foreground">50+</span>
              <span className="text-xs">agents deployed</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <span className="block text-2xl font-bold text-foreground">4 wks</span>
              <span className="text-xs">avg. deployment</span>
            </div>
          </motion.div>
        </div>

        {/* Right: Visual element — abstract gradient card stack */}
        <motion.div
          className="relative hidden lg:block"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Background glow */}
            <div className="absolute inset-0 rounded-3xl hero-gradient opacity-20 blur-3xl" />
            
            {/* Stacked cards */}
            <div className="absolute top-8 left-4 right-12 bg-white rounded-2xl shadow-xl p-6 border border-border/50 animate-float">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary">agent</span>
                  <span className="text-xs font-mono text-muted-foreground">.process(</span>
                  <span className="text-xs font-mono text-orange-500">"invoice_batch"</span>
                  <span className="text-xs font-mono text-muted-foreground">)</span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary rounded-full">
                  <div className="h-2 w-3/4 bg-primary rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Processing 847 invoices...</span>
                  <span className="text-primary font-medium">74%</span>
                </div>
              </div>
            </div>

            <div className="absolute top-44 left-10 right-4 bg-white rounded-2xl shadow-lg p-5 border border-border/50 animate-float-slow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold">AI Agent — Customer Support</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="block text-lg font-bold text-foreground">2.3k</span>
                  <span className="text-[10px] text-muted-foreground">Resolved today</span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-foreground">12ms</span>
                  <span className="text-[10px] text-muted-foreground">Avg response</span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-primary">98.5%</span>
                  <span className="text-[10px] text-muted-foreground">Accuracy</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-6 bg-white rounded-xl shadow-md p-4 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">↗</span>
                </div>
                <div>
                  <span className="text-xs font-semibold block">ROI This Quarter</span>
                  <span className="text-lg font-bold text-gradient">+340%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
