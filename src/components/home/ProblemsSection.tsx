import { Clock, HelpCircle, TrendingDown } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const problems = [
  {
    icon: Clock,
    title: "Wasted Human Hours",
    description:
      "Your team spends hours on repetitive tasks that AI could handle in minutes—burning money and talent on manual work.",
  },
  {
    icon: HelpCircle,
    title: "Lost in AI Hype",
    description:
      "You know AI is important, but don't know where to start, what to prioritize, or what ROI to actually expect.",
  },
  {
    icon: TrendingDown,
    title: "Competitive Disadvantage",
    description:
      "While you manually process, competitors are automating—widening the gap in speed, cost, and customer experience daily.",
  },
];

const ProblemsSection = () => (
  <section className="py-24 relative">
    <div className="absolute inset-0 bg-gradient-radial" />
    <div className="container mx-auto px-6 relative z-10">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Is Your Business Losing Ground While Competitors{" "}
          <span className="text-gradient">Leverage AI?</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Most businesses know AI is crucial but struggle with implementation.
          Here's what's at stake.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((p, i) => (
          <AnimatedSection key={p.title} delay={i * 0.1}>
            <div className="p-8 rounded-xl bg-card border border-border card-hover h-full">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-5">
                <p.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">
                {p.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemsSection;
