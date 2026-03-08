import { Target, Globe, Linkedin, ArrowRight, Zap, Code, Brain, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const About = () => (
  <main className="pt-16">
    {/* Hero */}
    <section className="py-12 md:py-16 bg-stripe-gradient border-b border-border/40">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-2">About CollabUp</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5">
              We build AI systems that{" "}
              <span className="text-gradient">run in production,</span>{" "}
              not in slide decks.
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Founded by <span className="font-extrabold text-foreground">IIITians</span> with real experience shipping AI at enterprise scale — from fintech risk systems to healthcare monitoring to supply chain intelligence.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Mission + Vision */}
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-5">
          <AnimatedSection>
            <div className="rounded-2xl border border-border/60 p-7 h-full">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Target className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg tracking-tight mb-2">Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Make AI transformation results-driven and accessible for every business — not just tech giants. We turn complex AI into working systems that deliver measurable ROI from day one.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="rounded-2xl border border-border/60 p-7 h-full">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
                <Globe className="h-4.5 w-4.5 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg tracking-tight mb-2">Vision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build the go-to AI engineering team for businesses across Asia, Europe, and the Americas — known for shipping fast, measuring everything, and never over-promising.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>

    {/* Our Story — editorial split */}
    <section className="py-12 md:py-16 bg-stripe-gradient">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-10 max-w-5xl">
          <AnimatedSection className="lg:col-span-2">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] sticky top-24">
              Our story
            </h2>
          </AnimatedSection>
          <div className="lg:col-span-3 space-y-4 text-[15px] text-muted-foreground leading-relaxed">
            <AnimatedSection><p>
              We started CollabUp because we kept seeing the same problem: companies knew AI could transform their business, but couldn't get it to work in production. The technology was ready — the execution wasn't. Too many consultants selling strategy decks that never became working systems. Too many "AI-powered" demos that broke the moment real data hit them.
            </p></AnimatedSection>
            <AnimatedSection><p>
              We come from the other side — <strong className="text-foreground">engineering teams that shipped AI at enterprise scale</strong>. Supply chain platforms that drove multi-million dollar sourcing decisions. Autonomous agents monitoring ICU patients in real time. Agentic systems running fintech operations end-to-end. NLP pipelines processing hundreds of thousands of documents. We've done this across industries, under real constraints, with real stakes.
            </p></AnimatedSection>
            <AnimatedSection><p>
              CollabUp exists to bridge the gap between what AI can do and what most businesses actually get. We don't sell vision — we build systems. <strong className="text-foreground">If AI isn't the right answer for your problem, we'll tell you that on the first call.</strong>
            </p></AnimatedSection>
          </div>
        </div>
      </div>
    </section>

    {/* Domain Experience */}
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Where we've built AI</h2>
          <p className="text-sm text-muted-foreground mb-8">Real production experience across high-stakes industries — not classroom projects.</p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BarChart3, domain: "Supply Chain & Procurement", detail: "Risk scoring for 50K+ components, distributor validation, supplier intelligence systems", color: "bg-blue-50 text-blue-600" },
            { icon: Zap, domain: "Fintech & Financial Services", detail: "Agentic AI ecosystems, merchant clustering, transaction behavior analysis, decision engines", color: "bg-emerald-50 text-emerald-600" },
            { icon: Brain, domain: "Healthcare & MedTech", detail: "Real-time ICU monitoring agents, patient trend detection, critical alerting systems, health recommendations", color: "bg-pink-50 text-pink-600" },
            { icon: Code, domain: "Enterprise & Document AI", detail: "Large-scale document processing with Graph-RAG, NLP pipelines, automated classification at 670K+ scale", color: "bg-orange-50 text-orange-600" },
          ].map((d, i) => (
            <AnimatedSection key={d.domain} delay={i * 0.08}>
              <div className="rounded-xl border border-border/60 p-5 h-full">
                <div className={`w-9 h-9 rounded-lg ${d.color} flex items-center justify-center mb-3`}>
                  <d.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-tight mb-1.5">{d.domain}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{d.detail}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Founders — detailed profiles */}
    <section className="py-12 md:py-16 bg-stripe-gradient">
      <div className="container mx-auto px-6 max-w-5xl">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">The founders</h2>
          <p className="text-sm text-muted-foreground mb-10"><span className="font-extrabold text-foreground">IIITians</span> who've shipped AI at enterprise scale — across fintech, healthcare, supply chain, and publishing.</p>
        </AnimatedSection>

        {/* Subhash */}
        <AnimatedSection>
          <div className="rounded-2xl border border-border/60 bg-white p-7 mb-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                SB
              </div>
              <div>
                <h3 className="font-bold text-xl tracking-tight">Subhash Bishnoi</h3>
                <p className="text-sm text-muted-foreground">Co-Founder · AI Engineering</p>
              </div>
            </div>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              Leads engineering at CollabUp. Worked for <strong className="text-foreground">1buy.ai</strong> — one of the fastest-growing startups in its segment — where he built AI-powered supply chain intelligence systems that saved over <strong className="text-foreground">$2M+ in procurement costs</strong> and automated risk scoring across 1.2M+ data records.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              Worked for <strong className="text-foreground">TNQ Tech</strong>, where he automated complex enterprise document workflows using AI — reducing manual processing time by <strong className="text-foreground">60%</strong> and saving hundreds of engineering hours annually.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
              Built <strong className="text-foreground">CogniScale</strong> — a cloud-native enterprise conversational AI platform with multi-tenant architecture for scalable, context-aware AI assistants. <strong className="text-foreground">IEEE Hacksagon 2025 Winner</strong>.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Production ML", "RAG & LLMs", "NLP & Transformers", "Conversational AI", "Python", "PyTorch", "LangChain"].map((t) => (
                <span key={t} className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary/80 text-muted-foreground">{t}</span>
              ))}
            </div>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </AnimatedSection>

        {/* Rishit */}
        <AnimatedSection delay={0.1}>
          <div className="rounded-2xl border border-border/60 bg-white p-7">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                RR
              </div>
              <div>
                <h3 className="font-bold text-xl tracking-tight">Rishit Rastogi</h3>
                <p className="text-sm text-muted-foreground">Co-Founder · AI Strategy & Ops</p>
              </div>
            </div>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              Drives strategy and applied AI at CollabUp. Worked for <strong className="text-foreground">HSBC</strong> — one of the world's largest banking institutions — in financial crime analytics, bringing deep domain expertise in compliance, risk systems, and data-driven decision-making at global scale.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
              Worked for <strong className="text-foreground">M2P Fintech</strong>, a leading fintech infrastructure firm, where he built agentic AI ecosystems and designed autonomous agents for operational intelligence and merchant analytics.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
              <strong className="text-foreground">IEEE Hacksagon 2025 Winner</strong> and <strong className="text-foreground">BuildShip Agentic AI Hackathon</strong> winner. Leads the AI & CS Club at prestigious institute of india.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Agentic AI", "Financial Crime AI", "AI Strategy", "Fintech AI", "CrewAI", "LangGraph", "Neo4j"].map((t) => (
                <span key={t} className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary/80 text-muted-foreground">{t}</span>
              ))}
            </div>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Numbers */}
    <section className="py-10 md:py-14 bg-white border-t border-border/40">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "$2M+", label: "Strategic decisions enabled" },
              { num: "1.2M+", label: "Records processed at scale" },
              { num: "Top 0.2%", label: "Amazon ML Challenge global rank" },
              { num: "5,000+", label: "Teams competed against & won" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-4xl font-extrabold tracking-tight text-gradient">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-stripe-blue py-12 md:py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.15),transparent_60%)]" />
      <div className="container mx-auto px-6 relative z-10">
        <AnimatedSection>
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Want to work with us?</h2>
            <p className="text-white/50 mb-6">30-minute call. We'll assess your AI opportunities and give you an honest take — no pitch, no pressure.</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-lg px-8 bg-white text-slate-900 hover:bg-white/90" asChild>
                <Link to="/contact">Start a conversation <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-lg px-8 text-white/60 hover:text-white hover:bg-white/10" asChild>
                <Link to="/services">Explore services</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default About;
