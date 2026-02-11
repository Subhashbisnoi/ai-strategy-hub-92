import { Target, Bot, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const services = [
  {
    icon: Target,
    title: "AI Strategy Consulting",
    tagline: "From Assessment to Implementation Roadmap",
    features: [
      "Comprehensive AI readiness assessment",
      "Custom AI implementation strategy aligned with business goals",
      "Technology stack recommendations",
      "ROI projections and success metrics",
      "Change management and team training",
    ],
    ideal: "Companies ready to integrate AI systematically",
    cta: "Book Strategy Consultation",
    ctaLink: "/contact",
  },
  {
    icon: Bot,
    title: "AI Agent Development",
    tagline: "Custom AI Agents That Work 24/7",
    features: [
      "Identify high-impact automation opportunities",
      "Build custom conversational AI agents",
      "Workflow automation solutions",
      "System integration and deployment",
      "Ongoing optimization and scaling",
    ],
    ideal: "Businesses seeking immediate efficiency gains",
    cta: "See Agent Demo",
    ctaLink: "/case-studies",
  },
];

const ServicesSection = () => (
  <section className="py-24 bg-card/50">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Two Ways We Drive <span className="text-gradient">AI Transformation</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose strategic guidance, tactical implementation, or both.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((s, i) => (
          <AnimatedSection key={s.title} delay={i * 0.15}>
            <div className="p-8 rounded-xl bg-background border border-border card-hover h-full flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">{s.title}</h3>
              <p className="text-primary text-sm font-medium mb-6">{s.tagline}</p>
              <ul className="space-y-3 mb-6 flex-1">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mb-6">
                <span className="font-semibold text-foreground">Ideal for:</span>{" "}
                {s.ideal}
              </p>
              <Button className="w-full glow-sm" asChild>
                <Link to={s.ctaLink}>{s.cta}</Link>
              </Button>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
