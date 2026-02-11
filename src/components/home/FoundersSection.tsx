import { GraduationCap, Trophy, Rocket, Building, CreditCard, Linkedin } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const founders = [
  {
    name: "Subhash Bishnoi",
    title: "Co-Founder & AI Engineer",
    badge: "IIITIAN | IIIT Chennai '26",
    bio: "Subhash combines cutting-edge AI expertise with real-world business impact. As Founding AI Engineer at 1buy.ai, he scaled AI systems for hyper-growth. His work on CogniScale demonstrates production-ready enterprise AI architecture.",
    specialties: "Enterprise AI Architecture, NLP, Conversational AI, System Integration",
    achievements: [
      { icon: GraduationCap, text: "IIIT Chennai '26 — Elite technical education" },
      { icon: Trophy, text: "IEEE Hackathon 2025 Winner" },
      { icon: Rocket, text: "Founding AI Engineer at 1buy.ai" },
      { icon: Building, text: "Workflow Automation at TNQTech" },
    ],
    initials: "SB",
  },
  {
    name: "Rishit Rastogi",
    title: "Co-Founder & Strategy Lead",
    badge: "IIITIAN | IIIT Chennai",
    bio: "Rishit brings a unique blend of financial acumen and AI innovation. His experience at HSBC and M2P Fintech gives him deep insights into how AI drives value in high-stakes environments.",
    specialties: "AI Strategy, Financial Systems, Risk Analysis, Business Intelligence",
    achievements: [
      { icon: GraduationCap, text: "IIIT Chennai Graduate" },
      { icon: Building, text: "Financial Crime Analyst at HSBC" },
      { icon: CreditCard, text: "M2P Fintech Experience" },
      { icon: Trophy, text: "BuildShip Agentic AI Hackathon Winner" },
    ],
    initials: "RR",
  },
];

const FoundersSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-6">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Built by <span className="text-gradient">IIIT Chennai Engineers</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Two IIITians combining world-class technical education with real-world AI transformation.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {founders.map((f, i) => (
          <AnimatedSection key={f.name} delay={i * 0.15}>
            <div className="p-8 rounded-xl bg-card border border-border card-hover h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-primary text-lg">{f.initials}</span>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold">{f.name}</h3>
                  <p className="text-sm text-primary font-medium">{f.title}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                    {f.badge}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{f.bio}</p>

              <ul className="space-y-3 mb-5">
                {f.achievements.map((a) => (
                  <li key={a.text} className="flex items-center gap-3 text-sm">
                    <a.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{a.text}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Specialties:</span> {f.specialties}
                </p>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="p-8 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 text-center">
          <h3 className="font-heading text-xl font-bold mb-3">The IIIT Chennai Advantage</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Both founders are proud IIITians from IIIT Chennai, one of India's premier institutions
            for AI and technology. Together, they combine elite technical education with hands-on
            business impact—having won multiple hackathons and delivered AI solutions across startup
            and enterprise environments.
          </p>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

export default FoundersSection;
