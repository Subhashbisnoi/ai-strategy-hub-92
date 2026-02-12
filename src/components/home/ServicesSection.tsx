import { Brain, Bot, Server, Workflow, Cable, GraduationCap, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const services = [
  {
    icon: Brain,
    title: "AI Strategy & Consulting",
    desc: "We assess your business processes, identify where AI agents can save time and money, build a custom AI roadmap with ROI projections, and help you prioritize what to automate first.",
    features: ["AI readiness audit", "Use-case prioritization", "ROI & cost modeling", "Vendor-neutral advice"],
    ideal: "Teams exploring AI for the first time or scaling existing AI initiatives.",
    color: "bg-blue-50 text-blue-600",
    border: "hover:border-blue-200",
  },
  {
    icon: Bot,
    title: "Custom AI Agent Development",
    desc: "We design and build AI agents tailored to your workflows — from customer support bots and lead qualification agents to document processing and internal knowledge assistants powered by LLMs.",
    features: ["Conversational AI agents", "RAG-based knowledge bots", "Multi-agent orchestration", "Tool-calling agents"],
    ideal: "Companies that want AI handling repetitive tasks autonomously 24/7.",
    color: "bg-purple-50 text-purple-600",
    border: "hover:border-purple-200",
  },
  {
    icon: Server,
    title: "AI Infrastructure & MLOps",
    desc: "We set up production-grade AI infrastructure — vector databases, model serving, LLM gateways, monitoring, and CI/CD pipelines — so your AI agents run reliably at scale without breaking.",
    features: ["Vector DB setup (Pinecone, Weaviate)", "LLM gateway & routing", "Model monitoring & logging", "Auto-scaling & cost optimization"],
    ideal: "Engineering teams that need robust infra to serve AI models in production.",
    color: "bg-slate-100 text-slate-700",
    border: "hover:border-slate-300",
  },
  {
    icon: Workflow,
    title: "AI-Powered Workflow Automation",
    desc: "We connect AI agents to your existing tools — CRMs, ERPs, email, Slack, databases — and automate entire business processes end-to-end using platforms like n8n, LangChain, and CrewAI.",
    features: ["End-to-end workflow design", "n8n / Make / Zapier + AI", "Multi-step agent chains", "Human-in-the-loop fallbacks"],
    ideal: "Operations teams drowning in manual, repetitive work across multiple tools.",
    color: "bg-orange-50 text-orange-600",
    border: "hover:border-orange-200",
  },
  {
    icon: Cable,
    title: "AI Integration & API Development",
    desc: "We build APIs and middleware that plug AI capabilities into your existing software stack — whether that's adding GPT to your SaaS product, connecting agents to your database, or building custom LLM endpoints.",
    features: ["Custom AI API endpoints", "LLM integration into SaaS", "Legacy system connectors", "Secure data pipelines"],
    ideal: "Product teams adding AI features to existing applications.",
    color: "bg-emerald-50 text-emerald-600",
    border: "hover:border-emerald-200",
  },
  {
    icon: GraduationCap,
    title: "AI Training & Ongoing Support",
    desc: "We train your team to manage, prompt-engineer, and extend the AI agents we build. Plus ongoing monitoring, optimization, and support so your systems keep improving over time.",
    features: ["Prompt engineering workshops", "Agent management training", "Performance monitoring", "Quarterly optimization reviews"],
    ideal: "Teams that want to own and evolve their AI systems long-term.",
    color: "bg-pink-50 text-pink-600",
    border: "hover:border-pink-200",
  },
];

const ServicesSection = () => (
  <section className="py-24 md:py-32 bg-white">
    <div className="container mx-auto px-6">
      <AnimatedSection>
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-3">
            What we do
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
            AI agents, infrastructure &amp; consulting.{" "}
            <span className="text-muted-foreground">End to end.</span>
          </h2>
          <p className="text-muted-foreground">
            We help you go from "we should use AI" to production-grade AI agents running your workflows — with the strategy, engineering, and support to back it up.
          </p>
        </div>
      </AnimatedSection>

      {/* Clean 3×2 grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <AnimatedSection key={s.title} delay={i * 0.06}>
            <Link
              to="/services"
              className={`group flex flex-col h-full rounded-2xl border border-border/60 p-7 ${s.border} hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-white`}
            >
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-5`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-[16px] tracking-tight">{s.title}</h3>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0 mt-0.5" />
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">{s.desc}</p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {s.features.map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary/80 text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Ideal for */}
              <p className="text-[11px] text-muted-foreground/70 mt-auto pt-4 border-t border-border/40">
                <span className="font-semibold text-foreground/60">Ideal for:</span> {s.ideal}
              </p>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
