import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const CTASection = () => (
  <section className="relative overflow-hidden">
    {/* Dark section — Stripe-style */}
    <div className="bg-stripe-blue py-24 md:py-32">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.15),transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-5">
              Ready to build AI that{" "}
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#818cf8] bg-clip-text text-transparent">
                actually ships?
              </span>
            </h2>
            <p className="text-lg text-white/50 mb-8 font-light">
              30-minute strategy call. We'll identify your highest-impact opportunities
              and give you an honest assessment — no pitch, no pressure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="h-12 px-8 rounded-lg text-[15px] font-semibold bg-white text-slate-900 hover:bg-white/90"
                asChild
              >
                <Link to="/contact">
                  Book a free strategy call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-12 px-8 rounded-lg text-[15px] font-medium text-white/60 hover:text-white hover:bg-white/10"
                asChild
              >
                <Link to="/about">
                  Learn about us
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

export default CTASection;
