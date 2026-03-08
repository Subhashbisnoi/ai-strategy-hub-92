import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const FoundersSection = () => (
  <section className="py-20 md:py-28 bg-stripe-gradient">
    <div className="container mx-auto px-6">
      <AnimatedSection>
        <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-3">
          Our team
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4 max-w-xl">
          Built by engineers who've{" "}
          <span className="text-muted-foreground">shipped AI at scale.</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mb-12">
          We've built production AI across supply chain, fintech, and enterprise — not in labs, but in live systems handling real data and real decisions.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl">
        <AnimatedSection>
          <div className="rounded-2xl border border-border/60 bg-white p-7 hover:shadow-md transition-shadow duration-300 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                SB
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">Subhash Bishnoi</h3>
                <p className="text-sm text-muted-foreground">Co-Founder · AI Engineering</p>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
              Leads engineering at CollabUp. Worked for <strong className="text-foreground">1buy.ai</strong> — fastest-growing startup in its segment — saving $2M+ in procurement costs. Automated complex workflows at <strong className="text-foreground">TNQ Tech</strong>, cutting processing time by 60%. Built <strong className="text-foreground">CogniScale</strong>, an enterprise conversational AI platform. <strong className="text-foreground">IEEE Hacksagon 2025 Winner</strong>.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Production ML", "RAG & LLMs", "NLP", "Conversational AI", "LangChain"].map((t) => (
                <span key={t} className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            <a href="#" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="rounded-2xl border border-border/60 bg-white p-7 hover:shadow-md transition-shadow duration-300 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                RR
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">Rishit Rastogi</h3>
                <p className="text-sm text-muted-foreground">Co-Founder · AI Strategy & Ops</p>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
              Drives strategy and applied AI at CollabUp. Worked for <strong className="text-foreground">HSBC</strong> — one of the world's largest banks — in financial crime analytics. Built agentic AI ecosystems at <strong className="text-foreground">M2P Fintech</strong>, a leading fintech firm. <strong className="text-foreground">IEEE Hacksagon 2025 Winner</strong> and <strong className="text-foreground">BuildShip Agentic AI Hackathon</strong> winner.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Agentic AI", "Financial Crime AI", "Fintech AI", "CrewAI", "LangGraph"].map((t) => (
                <span key={t} className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            <a href="#" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection>
        <div className="mt-8">
          <Link to="/about" className="text-sm font-medium text-primary hover:underline">
            Read the full story →
          </Link>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default FoundersSection;
