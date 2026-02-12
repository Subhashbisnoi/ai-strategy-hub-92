import { Plus, Minus } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useState } from "react";

const faqs = [
  { q: "How much does it cost?", a: "Strategy from $5K, development $10K-$50K depending on scope. Every project includes ROI projections upfront — most clients see 300-500% return within the first year." },
  { q: "How fast can you deliver?", a: "Initial results in 2-4 weeks. Full solutions in 4-8 weeks. We work in agile sprints — you see working software from week one." },
  { q: "Do we need a technical team?", a: "No. We handle architecture, development, deployment, and monitoring. We also train your team to own the solution long-term." },
  { q: "What industries do you work with?", a: "Fintech, e-commerce, enterprise SaaS, manufacturing, and more. Our approach is industry-agnostic — we optimize for your specific workflows." },
  { q: "What happens after launch?", a: "Ongoing optimization and support. AI systems improve over time. We monitor, adjust, and help you scale successful implementations." },
  { q: "Can you integrate with our existing stack?", a: "Yes. CRMs, ERPs, databases, APIs, legacy systems. Integration planning is part of our discovery." },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12">
          <AnimatedSection className="lg:col-span-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-3">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Questions{" "}
              <span className="text-muted-foreground">we get asked a lot.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Can't find what you're looking for?{" "}
              <a href="/contact" className="text-primary font-medium hover:underline">
                Reach out to us.
              </a>
            </p>
          </AnimatedSection>

          <div className="lg:col-span-3">
            <div className="divide-y divide-border">
              {faqs.map((faq, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <button
                    className="w-full flex items-start justify-between gap-4 py-5 text-left group"
                    onClick={() => setOpen(open === i ? null : i)}
                  >
                    <span className={`text-[15px] font-medium tracking-tight transition-colors ${open === i ? 'text-primary' : 'text-foreground'}`}>
                      {faq.q}
                    </span>
                    <span className="mt-0.5 shrink-0 text-muted-foreground">
                      {open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      open === i ? "max-h-48 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed pr-8">
                      {faq.a}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
