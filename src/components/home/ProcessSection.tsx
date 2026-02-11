import { Phone, FileText, Cog, TrendingUp } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  {
    icon: Phone,
    num: "01",
    title: "Discovery Call",
    duration: "15-30 minutes",
    description: "We analyze your current processes and identify AI opportunities with clear ROI potential.",
  },
  {
    icon: FileText,
    num: "02",
    title: "Custom Proposal",
    duration: "2-3 days",
    description: "Receive a tailored strategy with specific recommendations, timelines, and ROI projections.",
  },
  {
    icon: Cog,
    num: "03",
    title: "Implementation",
    duration: "2-8 weeks",
    description: "We build and deploy your AI solution with minimal disruption to operations.",
  },
  {
    icon: TrendingUp,
    num: "04",
    title: "Optimize & Scale",
    duration: "Ongoing",
    description: "Continuous monitoring, refinement, and expansion of AI capabilities for maximum impact.",
  },
];

const ProcessSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Your Path to <span className="text-gradient">AI Transformation</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A proven 4-step process that delivers results in weeks, not months.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <AnimatedSection key={step.num} delay={i * 0.1}>
            <div className="relative p-6 rounded-xl bg-card border border-border card-hover h-full">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
              )}
              <span className="text-4xl font-heading font-bold text-primary/20 mb-4 block">
                {step.num}
              </span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-1">{step.title}</h3>
              <span className="text-xs text-primary font-medium block mb-3">{step.duration}</span>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
