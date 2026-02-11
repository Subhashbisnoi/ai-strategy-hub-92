import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const CTASection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />

    <div className="container mx-auto px-6 relative z-10 text-center">
      <AnimatedSection>
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
          Ready to Transform Your Business{" "}
          <span className="text-gradient">with AI?</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join forward-thinking companies working with IIIT Chennai-trained AI experts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Free 30-minute strategy session</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Custom AI opportunity assessment</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> No-obligation proposal</span>
        </div>

        <Button size="lg" className="glow text-base px-10 mb-4" asChild>
          <Link to="/contact">
            Schedule Your Free Strategy Session
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          ⏰ Limited slots available · 💰 Typical ROI: 300-500% · 🚀 Implementation in 4-8 weeks
        </p>
      </AnimatedSection>
    </div>
  </section>
);

export default CTASection;
