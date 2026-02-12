import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  {
    num: "01",
    title: "Discovery call",
    time: "30 min",
    description: "We learn about your processes, pain points, and goals. We'll tell you honestly if AI is the right solution.",
  },
  {
    num: "02",
    title: "Custom proposal",
    time: "3 days",
    description: "You get a detailed roadmap with architecture, timeline, cost, and projected ROI — before any commitment.",
  },
  {
    num: "03",
    title: "Build & ship",
    time: "4-8 weeks",
    description: "Agile sprints with weekly demos. You see working software from week one, not slide decks.",
  },
  {
    num: "04",
    title: "Optimize & scale",
    time: "Ongoing",
    description: "We monitor performance, expand capabilities, and ensure your AI systems keep getting smarter.",
  },
];

const ProcessSection = () => (
  <section className="py-24 md:py-32 bg-stripe-gradient">
    <div className="container mx-auto px-6">
      <AnimatedSection>
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1]">
            Four steps from idea to{" "}
            <span className="text-gradient">production.</span>
          </h2>
        </div>
      </AnimatedSection>

      {/* Horizontal timeline on desktop, vertical on mobile */}
      <div className="grid md:grid-cols-4 gap-0">
        {steps.map((step, i) => (
          <AnimatedSection key={step.num} delay={i * 0.1}>
            <div className="relative pl-8 md:pl-0 pb-10 md:pb-0 md:pr-8">
              {/* Vertical line (mobile) / horizontal line (desktop) */}
              {i < steps.length - 1 && (
                <>
                  <div className="absolute left-[11px] top-7 bottom-0 w-px bg-border md:hidden" />
                  <div className="hidden md:block absolute top-3 left-[28px] right-0 h-px bg-border" />
                </>
              )}
              
              {/* Number dot */}
              <div className="absolute left-0 md:relative md:left-auto w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center mb-4">
                {i + 1}
              </div>

              <div className="md:mt-5">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <h3 className="text-[15px] font-semibold tracking-tight">{step.title}</h3>
                  <span className="text-[11px] text-primary font-medium">{step.time}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pr-4">{step.description}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
