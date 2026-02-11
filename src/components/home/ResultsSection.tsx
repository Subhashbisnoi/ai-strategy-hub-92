import { Rocket, Clock, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const stats = [
  { icon: DollarSign, value: "$2M+", label: "Cost Savings Delivered" },
  { icon: Rocket, value: "300%", label: "Average Client ROI" },
  { icon: Clock, value: "6 wks", label: "Avg. Implementation" },
  { icon: Users, value: "50+", label: "AI Agents Deployed" },
];

const cases = [
  {
    badge: "Startup",
    company: "1buy.ai",
    title: "Scaling AI for Hyper-Growth",
    result: "Supported rapid month-over-month growth with scalable AI architecture",
    metric: "10x Faster Processing",
  },
  {
    badge: "Enterprise",
    company: "TNQTech",
    title: "Workflow Automation",
    result: "Eliminated manual bottlenecks with automated workflow systems",
    metric: "40% Cost Reduction",
  },
  {
    badge: "Platform",
    company: "CogniScale",
    title: "Enterprise AI Platform",
    result: "Built multi-tenant conversational AI serving multiple corporate clients",
    metric: "24/7 AI Operations",
  },
];

const ResultsSection = () => (
  <section className="py-24 bg-card/50">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Real Companies. <span className="text-gradient">Real Results.</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          See how we've transformed operations across industries.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((s, i) => (
          <AnimatedSection key={s.label} delay={i * 0.05}>
            <div className="text-center p-6 rounded-xl bg-background border border-border">
              <s.icon className="h-6 w-6 text-primary mx-auto mb-3" />
              <p className="text-3xl font-heading font-bold text-gradient mb-1">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {cases.map((c, i) => (
          <AnimatedSection key={c.company} delay={i * 0.1}>
            <div className="p-6 rounded-xl bg-background border border-border card-hover h-full flex flex-col">
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-4">
                {c.badge}
              </span>
              <h3 className="font-heading text-lg font-semibold mb-1">{c.company}</h3>
              <p className="text-sm text-primary font-medium mb-3">{c.title}</p>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{c.result}</p>
              <div className="pt-4 border-t border-border">
                <p className="font-heading font-bold text-foreground">{c.metric}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection className="text-center">
        <Button variant="outline" asChild>
          <Link to="/case-studies">View All Case Studies</Link>
        </Button>
      </AnimatedSection>
    </div>
  </section>
);

export default ResultsSection;
