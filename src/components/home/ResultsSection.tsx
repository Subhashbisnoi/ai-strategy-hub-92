import { Quote } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const ResultsSection = () => (
  <section className="py-24 md:py-32 bg-white">
    <div className="container mx-auto px-6">
      {/* Stats bar — full width, big numbers */}
      <AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20 pb-16 border-b border-border/50">
          {[
            { num: "$2M+", label: "Saved for clients" },
            { num: "300%", label: "Average ROI" },
            { num: "50+", label: "AI agents shipped" },
            { num: "98.5%", label: "Client satisfaction" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-5xl font-extrabold tracking-tight text-gradient">{s.num}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Testimonial — editorial layout */}
      <div className="grid lg:grid-cols-5 gap-12 items-start">
        <AnimatedSection className="lg:col-span-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-3">
            Results
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
            Real outcomes,{" "}
            <span className="text-muted-foreground">not demos.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Every project starts with clear KPIs and ends with measurable business impact. Here's what our clients say.
          </p>
        </AnimatedSection>

        <div className="lg:col-span-3 space-y-6">
          {[
            {
              quote: "NexusAI didn't just build us an AI system — they fundamentally changed how our operations run. We went from 3-day turnarounds to real-time processing.",
              author: "Engineering Lead",
              company: "1buy.ai",
              result: "10x faster processing",
            },
            {
              quote: "The team's enterprise experience shows. They understood our compliance requirements from day one and built accordingly. No hand-holding needed.",
              author: "Head of Technology",
              company: "TNQ Tech",
              result: "40% cost reduction",
            },
          ].map((t, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div className="rounded-2xl border border-border/60 p-7 hover:shadow-md transition-shadow duration-300">
                <Quote className="h-5 w-5 text-primary/30 mb-4" />
                <p className="text-[15px] leading-relaxed mb-5 text-foreground/80">{t.quote}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full">
                    {t.result}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ResultsSection;
