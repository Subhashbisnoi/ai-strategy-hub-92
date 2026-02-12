import { Check, Brain, Bot, Server, Workflow, Cable, GraduationCap, ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const serviceDetails = [
  {
    id: "strategy",
    icon: Brain, color: "bg-blue-500", lightColor: "bg-blue-50 text-blue-600", title: "AI Strategy & Consulting",
    oneLiner: "Know exactly where AI will save you time and money — before writing a single line of code.",
    desc: "We audit your workflows, identify the highest-ROI opportunities for AI agents, and deliver a prioritized roadmap with cost projections. No fluff, no buzzwords — just a clear plan your team can execute.",
    deliverables: ["AI readiness report", "Prioritized use-case matrix", "ROI & cost model", "Phased implementation plan", "Tech stack recommendations"],
    timeline: "2–4 weeks",
  },
  {
    id: "agents",
    icon: Bot, color: "bg-purple-500", lightColor: "bg-purple-50 text-purple-600", title: "Custom AI Agent Development",
    oneLiner: "Production-grade AI agents that actually handle work — not just answer questions.",
    desc: "We build autonomous agents that handle customer support, process documents, qualify leads, manage internal knowledge, and orchestrate multi-step workflows. Powered by LLMs with RAG, tool-calling, memory, and guardrails.",
    deliverables: ["Custom-trained AI agents", "RAG knowledge pipeline", "Multi-agent orchestration", "Tool-calling integration", "Guardrails & safety layers", "Monitoring dashboard"],
    timeline: "4–8 weeks",
  },
  {
    id: "infra",
    icon: Server, color: "bg-slate-600", lightColor: "bg-slate-100 text-slate-700", title: "AI Infrastructure & MLOps",
    oneLiner: "The infra your AI agents need to run fast, reliably, and affordably at scale.",
    desc: "Vector databases, LLM gateways with smart routing, model serving, observability pipelines, CI/CD for AI, and cost-optimized cloud architecture. Everything your agents need to run in production without breaking.",
    deliverables: ["Vector DB setup (Pinecone / Weaviate / Qdrant)", "LLM gateway with routing & fallbacks", "Cost monitoring & rate limiting", "CI/CD pipeline for models", "Auto-scaling & disaster recovery"],
    timeline: "3–5 weeks",
  },
  {
    id: "automation",
    icon: Workflow, color: "bg-orange-500", lightColor: "bg-orange-50 text-orange-600", title: "AI-Powered Workflow Automation",
    oneLiner: "Connect AI agents to your CRM, ERP, email, Slack — automate entire processes end-to-end.",
    desc: "We build multi-step automated workflows using n8n, LangChain, and CrewAI that connect your AI agents to your existing tools. Including human-in-the-loop checkpoints for decisions that need a person.",
    deliverables: ["End-to-end workflow design", "n8n / Make integration", "Multi-step agent chains", "Human-in-the-loop gates", "Error handling & retries", "Real-time monitoring"],
    timeline: "4–6 weeks",
  },
  {
    id: "integration",
    icon: Cable, color: "bg-emerald-500", lightColor: "bg-emerald-50 text-emerald-600", title: "AI Integration & API Development",
    oneLiner: "Plug AI capabilities into your existing software with custom APIs and middleware.",
    desc: "Custom REST/GraphQL endpoints, LLM middleware for your SaaS, streaming response support, legacy system connectors, and secure data pipelines between your systems and AI models.",
    deliverables: ["Custom AI API endpoints", "LLM integration middleware", "Streaming & webhook support", "Legacy system connectors", "Security audit & hardening"],
    timeline: "4–6 weeks",
  },
  {
    id: "training",
    icon: GraduationCap, color: "bg-pink-500", lightColor: "bg-pink-50 text-pink-600", title: "AI Training & Ongoing Support",
    oneLiner: "Your team learns to own, extend, and optimize the AI agents we build.",
    desc: "Hands-on workshops for prompt engineering, agent management, and debugging. Plus ongoing monitoring, quarterly strategy reviews, and continuous optimization so your AI keeps getting smarter.",
    deliverables: ["Prompt engineering workshops", "Agent management training", "Performance monitoring setup", "Quarterly optimization reviews", "Priority support channel"],
    timeline: "Ongoing",
  },
];

const packages = [
  { name: "Strategy", price: "$5K", desc: "For teams exploring AI", features: ["AI readiness assessment", "Custom roadmap & ROI models", "Use-case prioritization", "3 months advisory"], highlight: false },
  { name: "Growth", price: "From $25K", desc: "Strategy + development", features: ["Everything in Strategy", "Up to 3 AI agents", "Infrastructure setup", "Workflow automation", "6 months support"], highlight: true },
  { name: "Enterprise", price: "Custom", desc: "Full AI transformation", features: ["Everything in Growth", "Unlimited agents & workflows", "Dedicated engineering team", "MLOps & infra management", "12 months premium support"], highlight: false },
];

const techStack = [
  { category: "LLM & Agents", desc: "We pick the right model and framework for each use case — balancing cost, latency, and accuracy.", tools: ["OpenAI GPT-4o", "Claude 3.5 Sonnet", "Gemini Pro", "LangChain", "LangGraph", "CrewAI", "AutoGen", "LlamaIndex", "Hugging Face"] },
  { category: "Vector & Data", desc: "Your AI agents are only as good as their data. We set up retrieval pipelines that return the right context, fast.", tools: ["Pinecone", "Weaviate", "Qdrant", "ChromaDB", "PostgreSQL + pgvector", "Redis", "MongoDB", "Supabase"] },
  { category: "Automation & APIs", desc: "We connect AI agents to your existing tools and build custom endpoints for any integration.", tools: ["n8n", "Make (Integromat)", "FastAPI", "Express.js", "Python", "Node.js", "GraphQL", "Webhook listeners"] },
  { category: "Infrastructure & DevOps", desc: "Production infrastructure that scales with your usage and keeps costs predictable.", tools: ["AWS (Lambda, ECS, S3)", "GCP (Cloud Run, Vertex AI)", "Docker", "Kubernetes", "Vercel", "Terraform", "GitHub Actions CI/CD"] },
];

const Services = () => (
  <main className="pt-16">
    {/* Hero — compact with service quick links */}
    <section className="py-12 md:py-16 bg-stripe-gradient border-b border-border/40">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-2">Services</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5 max-w-2xl">
            AI agents, infra &amp; consulting —{" "}
            <span className="text-gradient">end to end.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mb-6">
            From strategy to production-grade AI agents running your workflows.
          </p>

          {/* Quick jump links */}
          <div className="flex flex-wrap gap-2">
            {serviceDetails.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 bg-white text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.title.split(" & ")[0].replace("AI-Powered ", "").replace("Custom ", "")}
              </a>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Service Detail Sections */}
    {serviceDetails.map((service, idx) => (
      <section
        key={service.id}
        id={service.id}
        className={`py-10 md:py-14 ${idx % 2 === 1 ? 'bg-stripe-gradient' : 'bg-white'} scroll-mt-20`}
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left: Info (3 cols) */}
            <AnimatedSection className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-lg ${service.lightColor} flex items-center justify-center`}>
                  <service.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{service.title}</h2>
                </div>
              </div>

              <p className="text-[17px] font-medium text-foreground/80 mb-3 leading-snug">
                {service.oneLiner}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">
                {service.desc}
              </p>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/60">Timeline</span>
                <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">{service.timeline}</span>
              </div>
            </AnimatedSection>

            {/* Right: Deliverables card (2 cols) */}
            <AnimatedSection className="lg:col-span-2" delay={0.15}>
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground mb-4">What you get</h3>
                <ul className="space-y-3">
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                      <div className={`w-5 h-5 rounded-md ${service.lightColor} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Check className="h-3 w-3" />
                      </div>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-border/40">
                  <Button size="sm" variant="outline" className="rounded-lg text-xs w-full" asChild>
                    <Link to="/contact">
                      Discuss this service <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    ))}

    {/* Tech Stack — rich cards */}
    <section className="py-10 md:py-14 bg-white border-t border-border/40">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Our tech stack</h2>
            <p className="text-sm text-muted-foreground">Battle-tested tools we use to build, deploy, and scale your AI systems. We're vendor-agnostic — we pick the best tool for each job.</p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-5">
          {techStack.map((cat, i) => (
            <AnimatedSection key={cat.category} delay={i * 0.08}>
              <div className="rounded-2xl border border-border/60 p-6 bg-white h-full">
                <h3 className="text-sm font-bold tracking-tight text-foreground mb-1.5">{cat.category}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{cat.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tools.map((t) => (
                    <span key={t} className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary/80 text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section className="py-12 md:py-16 bg-stripe-gradient">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">No hidden fees. Start small, scale when ready.</p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {packages.map((pkg, i) => (
            <AnimatedSection key={pkg.name} delay={i * 0.1}>
              <div className={`rounded-2xl border p-7 h-full flex flex-col bg-white ${
                pkg.highlight
                  ? 'border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/10'
                  : 'border-border/60'
              }`}>
                {pkg.highlight && (
                  <span className="text-[10px] font-bold text-white bg-primary px-2.5 py-1 rounded-full self-start mb-3">Most popular</span>
                )}
                <h3 className="font-bold text-lg tracking-tight">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{pkg.desc}</p>
                <p className="text-3xl font-extrabold text-gradient mt-2 mb-6">{pkg.price}</p>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className={`rounded-lg w-full ${pkg.highlight ? '' : 'bg-secondary text-foreground hover:bg-secondary/80'}`} asChild>
                  <Link to="/contact">Get started</Link>
                </Button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-stripe-blue py-12 md:py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.15),transparent_60%)]" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Ready to build your AI agents?</h2>
          <p className="text-white/50 mb-7 max-w-lg mx-auto">30-minute strategy call. We'll assess your processes and tell you exactly where AI can help — no pitch, no pressure.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-lg px-8 bg-white text-slate-900 hover:bg-white/90" asChild>
              <Link to="/contact">Book a free call <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-lg px-8 text-white/60 hover:text-white hover:bg-white/10" asChild>
              <Link to="/about">Learn about us</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default Services;
