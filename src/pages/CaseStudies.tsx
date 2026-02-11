import { Rocket, Clock, DollarSign, TrendingUp, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const caseStudies = [
  {
    badge: "Startup · E-commerce",
    company: "1buy.ai",
    role: "Founding AI Engineer",
    title: "Scaling AI for Hyper-Growth",
    challenge: "As one of the fastest-growing startups, 1buy.ai needed AI-powered solutions that could scale with explosive user growth while maintaining performance and enabling fast iteration.",
    solution: "Architected and implemented a comprehensive, cloud-native AI system with microservices approach, auto-scaling capabilities, and a personalization engine designed for rapid iteration.",
    results: [
      { icon: Rocket, label: "Supported rapid month-over-month growth" },
      { icon: Clock, label: "10x reduction in processing time" },
      { icon: DollarSign, label: "Enabled significant additional revenue" },
      { icon: TrendingUp, label: "Improved user engagement across platform" },
    ],
    techUsed: ["Python", "OpenAI", "AWS", "Docker", "PostgreSQL"],
    keyTakeaway: "Scalable architecture is crucial for startups expecting growth. Early investment in proper AI architecture pays dividends.",
  },
  {
    badge: "Enterprise · Technology",
    company: "TNQTech",
    role: "AI Automation Consultant",
    title: "Enterprise Workflow Automation",
    challenge: "TNQTech was struggling with manual workflows that slowed operations, increased error rates, and caused team burnout across departments.",
    solution: "Designed and deployed automated workflow systems that eliminated repetitive tasks, integrated with existing enterprise tools, and provided real-time monitoring dashboards.",
    results: [
      { icon: Clock, label: "40+ hours saved per week per team" },
      { icon: TrendingUp, label: "65% reduction in processing errors" },
      { icon: DollarSign, label: "40% operational cost reduction" },
      { icon: Rocket, label: "ROI achieved within 3 months" },
    ],
    techUsed: ["Python", "Node.js", "LangChain", "Docker"],
    keyTakeaway: "Automation of repetitive tasks delivers immediate, measurable ROI with minimal disruption to existing workflows.",
  },
  {
    badge: "Platform · Enterprise AI",
    company: "CogniScale",
    role: "Creator & Lead Architect",
    title: "Enterprise AI Ecosystem",
    challenge: "The market needed a production-ready, scalable conversational AI platform capable of serving multiple corporate clients from a unified codebase with high customization.",
    solution: "Built a cloud-native, multi-tenant conversational AI ecosystem with end-to-end NLP capabilities, context-aware responses, and enterprise-grade security and compliance.",
    results: [
      { icon: Rocket, label: "Serving multiple corporate clients" },
      { icon: TrendingUp, label: "Handles thousands of conversations daily" },
      { icon: Clock, label: "70% faster deployment vs traditional methods" },
      { icon: DollarSign, label: "Proven enterprise-scale architecture" },
    ],
    techUsed: ["Python", "TensorFlow", "LangChain", "AWS", "Docker", "Pinecone"],
    keyTakeaway: "Multi-tenant architecture enables serving diverse enterprise clients efficiently while maintaining customization and data isolation.",
  },
];

const CaseStudies = () => (
  <main className="pt-24">
    {/* Hero */}
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <AnimatedSection>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Real Projects. <span className="text-gradient">Real Impact.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how we've helped companies across industries transform their operations with AI.
          </p>
        </AnimatedSection>
      </div>
    </section>

    {/* Aggregate Stats */}
    <section className="py-12 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "$2M+", label: "Cost Savings" },
            { value: "300%", label: "Average ROI" },
            { value: "6 wks", label: "Avg Implementation" },
            { value: "98%", label: "Client Satisfaction" },
          ].map((s, i) => (
            <AnimatedSection key={s.label} delay={i * 0.05}>
              <div className="text-center p-4">
                <p className="text-3xl font-heading font-bold text-gradient">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Case Studies */}
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="space-y-16">
          {caseStudies.map((cs, i) => (
            <AnimatedSection key={cs.company}>
              <div className="p-8 md:p-10 rounded-2xl bg-card border border-border">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                    {cs.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">{cs.role}</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">{cs.company}</h2>
                <p className="text-primary font-medium mb-8">{cs.title}</p>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" /> The Challenge
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cs.challenge}</p>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Our Solution
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cs.solution}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {cs.results.map((r) => (
                    <div key={r.label} className="p-4 rounded-lg bg-background border border-border">
                      <r.icon className="h-5 w-5 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {cs.techUsed.map((t) => (
                      <span key={t} className="px-3 py-1 text-xs rounded-full bg-secondary text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic max-w-md">
                    💡 {cs.keyTakeaway}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="container mx-auto px-6 text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Want Results <span className="text-gradient">Like These?</span>
          </h2>
          <p className="text-muted-foreground mb-8">Let's discuss how we can transform your business.</p>
          <Button size="lg" className="glow" asChild>
            <Link to="/contact">
              Schedule Strategy Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default CaseStudies;
