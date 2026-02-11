import { Check, Target, Bot, Zap, Shield, BarChart, Users, GraduationCap, Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const whyUs = [
  { icon: GraduationCap, title: "IIITian Founders", desc: "Elite technical education from IIIT Chennai, India's AI powerhouse" },
  { icon: Award, title: "Proven Track Record", desc: "Award-winning team with real enterprise and startup experience" },
  { icon: BarChart, title: "ROI-Focused", desc: "We prioritize business outcomes, not just cool technology" },
  { icon: RefreshCw, title: "Full-Stack Service", desc: "From strategy to deployment to optimization—we handle it all" },
  { icon: Users, title: "Cross-Industry", desc: "Proven success across fintech, e-commerce, enterprise SaaS" },
  { icon: Zap, title: "Fast Results", desc: "See measurable results in weeks, not months" },
];

const consulting = [
  { phase: "Week 1", title: "Discovery & Assessment", items: ["Current state analysis", "Technology audit", "Team capability assessment", "Opportunity identification"] },
  { phase: "Week 2-3", title: "Strategy Development", items: ["Custom AI roadmap", "Technology stack recommendations", "ROI projections", "Implementation timeline"] },
  { phase: "Week 3-4", title: "Execution Planning", items: ["Detailed project plans", "Resource allocation", "Risk mitigation", "Success metrics definition"] },
];

const agentDev = [
  { phase: "Week 1", title: "Opportunity Analysis", items: ["Process mapping", "Automation assessment", "Use case prioritization", "ROI estimation"] },
  { phase: "Week 2", title: "Design & Architecture", items: ["Technical specification", "System architecture", "Integration planning", "UX design"] },
  { phase: "Week 3-6", title: "Development & Testing", items: ["Custom AI agent development", "System integration", "Rigorous testing", "Performance optimization"] },
  { phase: "Week 7-8", title: "Deployment & Training", items: ["Production deployment", "Team training", "Documentation", "Knowledge transfer"] },
];

const packages = [
  { name: "Starter", price: "From $5K", features: ["Initial strategy consultation", "1 AI agent development", "3 months support"], highlight: false },
  { name: "Growth", price: "From $25K", features: ["Full strategy development", "3 AI agents", "6 months support", "Priority access"], highlight: true },
  { name: "Enterprise", price: "Custom", features: ["Comprehensive transformation", "Unlimited agents (first year)", "12 months premium support", "Dedicated account manager"], highlight: false },
];

const Services = () => (
  <main className="pt-24">
    {/* Hero */}
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <AnimatedSection>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            AI Services That Drive{" "}
            <span className="text-gradient">Real Transformation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Strategic consulting and custom automation solutions designed for your unique business needs.
          </p>
        </AnimatedSection>
      </div>
    </section>

    {/* Why Choose Us */}
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Why Leading Companies <span className="text-gradient">Choose Us</span>
          </h2>
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {whyUs.map((w, i) => (
            <AnimatedSection key={w.title} delay={i * 0.05}>
              <div className="p-6 rounded-xl bg-background border border-border card-hover h-full text-center">
                <w.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground">{w.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* AI Strategy Consulting */}
    <section className="py-20">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold">AI Strategy Consulting</h2>
              <p className="text-primary text-sm font-medium">From Assessment to Implementation Roadmap</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <p className="text-muted-foreground mb-10 max-w-3xl leading-relaxed">
            Our strategic consulting service helps organizations navigate the complex AI landscape.
            We assess your readiness, identify highest-impact opportunities, and create a clear roadmap
            for implementation that aligns with your business goals and delivers measurable ROI.
          </p>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-6">
          {consulting.map((c, i) => (
            <AnimatedSection key={c.title} delay={i * 0.1}>
              <div className="p-6 rounded-xl bg-card border border-border h-full">
                <span className="text-xs font-medium text-primary">{c.phase}</span>
                <h3 className="font-heading font-semibold mt-1 mb-4">{c.title}</h3>
                <ul className="space-y-2">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* AI Agent Development */}
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold">AI Agent Development</h2>
              <p className="text-primary text-sm font-medium">Custom AI Agents That Work 24/7</p>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection>
          <p className="text-muted-foreground mb-10 max-w-3xl leading-relaxed">
            We build custom AI agents tailored to your specific workflows. From conversational
            customer support bots to intelligent document processors, our agents handle repetitive
            tasks so your team can focus on high-value work.
          </p>
        </AnimatedSection>
        <div className="grid md:grid-cols-4 gap-6">
          {agentDev.map((a, i) => (
            <AnimatedSection key={a.title} delay={i * 0.1}>
              <div className="p-6 rounded-xl bg-background border border-border h-full">
                <span className="text-xs font-medium text-primary">{a.phase}</span>
                <h3 className="font-heading font-semibold mt-1 mb-4">{a.title}</h3>
                <ul className="space-y-2">
                  {a.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Use Cases */}
    <section className="py-20">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold mb-4">Example <span className="text-gradient">Use Cases</span></h2>
        </AnimatedSection>
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Customer Support Automation", "Lead Qualification", "Document Processing", "Data Entry & Extraction", "IT Support Bots", "Sales Automation", "Financial Reporting", "Compliance Monitoring"].map((uc) => (
              <div key={uc} className="p-4 rounded-lg bg-card border border-border text-center text-sm text-muted-foreground">
                {uc}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Packages */}
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Complete AI <span className="text-gradient">Transformation Packages</span>
          </h2>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {packages.map((pkg, i) => (
            <AnimatedSection key={pkg.name} delay={i * 0.1}>
              <div className={`p-8 rounded-xl border h-full flex flex-col ${
                pkg.highlight
                  ? "bg-primary/5 border-primary/30 glow-sm"
                  : "bg-background border-border"
              }`}>
                {pkg.highlight && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-xl font-bold mb-1">{pkg.name}</h3>
                <p className="text-2xl font-heading font-bold text-gradient mb-6">{pkg.price}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={pkg.highlight ? "glow-sm w-full" : "w-full"} variant={pkg.highlight ? "default" : "outline"} asChild>
                  <Link to="/contact">Get Started</Link>
                </Button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Tech */}
    <section className="py-20">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Built on <span className="text-gradient">Cutting-Edge Technology</span>
          </h2>
        </AnimatedSection>
        <AnimatedSection>
          <div className="flex flex-wrap justify-center gap-4">
            {["OpenAI GPT-4", "LangChain", "Python", "Node.js", "TensorFlow", "AWS", "Docker", "Pinecone", "React", "PostgreSQL"].map((tech) => (
              <span key={tech} className="px-5 py-2.5 rounded-full bg-card border border-border text-sm text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="container mx-auto px-6 text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">Let's discuss how we can transform your business with AI.</p>
          <Button size="lg" className="glow" asChild>
            <Link to="/contact">Schedule Free Consultation</Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default Services;
