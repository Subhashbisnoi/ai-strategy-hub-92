import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "@/components/AnimatedSection";

const faqs = [
  {
    q: "How much does AI implementation typically cost?",
    a: "Investment varies based on project scope. Strategy consulting engagements typically start at $5K, while custom AI agent development ranges from $10K to $50K. We provide detailed ROI projections, and most clients see 300-500% ROI within the first year.",
  },
  {
    q: "How long does implementation take?",
    a: "Most clients see initial results within 2-4 weeks. Full implementation of custom AI agents typically takes 4-8 weeks. We work in sprints to show progress early and often.",
  },
  {
    q: "Do we need technical expertise on our team?",
    a: "No technical expertise required. We handle everything—from architecture to deployment to maintenance. We also provide comprehensive training so your team can effectively use the AI solutions.",
  },
  {
    q: "What industries do you work with?",
    a: "We've delivered AI solutions across fintech (HSBC, M2P Fintech), e-commerce (1buy.ai), enterprise technology (TNQTech), and more. Our approach is industry-agnostic—we focus on your unique challenges.",
  },
  {
    q: "How do you measure success?",
    a: "We establish clear KPIs upfront: cost savings (30-50%), time reduction (40-60%), accuracy improvements (15-25%), or revenue impact. Every project includes a measurement framework aligned with your goals.",
  },
  {
    q: "What if the AI solution doesn't deliver expected results?",
    a: "We build in optimization periods and work iteratively. Our proven track record and hackathon wins demonstrate our commitment to results. We include performance guarantees in our agreements.",
  },
  {
    q: "Can you integrate with our existing systems?",
    a: "Yes. We specialize in system integration with CRMs, ERPs, databases, APIs, and legacy systems. Integration planning is part of our discovery process.",
  },
  {
    q: "What happens after deployment?",
    a: "We offer ongoing optimization and support. AI systems improve over time with more data. We monitor performance, make adjustments, and help scale successful implementations.",
  },
];

const FAQSection = () => (
  <section className="py-24 bg-card/50">
    <div className="container mx-auto px-6 max-w-3xl">
      <AnimatedSection className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h2>
        <p className="text-muted-foreground">
          Everything you need to know about working with us.
        </p>
      </AnimatedSection>

      <AnimatedSection>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border rounded-xl px-6 bg-background"
            >
              <AccordionTrigger className="text-left font-heading font-medium text-sm hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </AnimatedSection>
    </div>
  </section>
);

export default FAQSection;
