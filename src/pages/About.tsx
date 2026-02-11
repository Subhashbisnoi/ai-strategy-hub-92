import { GraduationCap, Trophy, Rocket, Building, CreditCard, Linkedin, Target, Eye, Handshake, Lightbulb, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const values = [
  { icon: Target, title: "Results Over Hype", desc: "We measure success in ROI, not buzzwords. Every recommendation is grounded in business outcomes." },
  { icon: GraduationCap, title: "Academic Rigor", desc: "We bring IIIT Chennai's research excellence to practical business problems." },
  { icon: Handshake, title: "Transparency", desc: "We educate as we execute, ensuring your team understands and owns the AI solutions we build." },
  { icon: Lightbulb, title: "Continuous Innovation", desc: "We stay at the forefront through ongoing research, hackathon participation, and experimentation." },
  { icon: Shield, title: "Ethical AI", desc: "We build responsible AI systems that augment human capabilities rather than replace judgment." },
];

const milestones = [
  { year: "2024", event: "Company founded by IIIT Chennai alumni" },
  { year: "2024", event: "First enterprise client engagement" },
  { year: "2025", event: "IEEE Hackathon 2025 Winners" },
  { year: "2025", event: "BuildShip Agentic AI Hackathon Winners" },
  { year: "2025", event: "Expanded to 10+ clients across industries" },
];

const About = () => (
  <main className="pt-24">
    {/* Hero */}
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <AnimatedSection>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Building the Future of{" "}
            <span className="text-gradient">AI-Powered Business</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Founded by IIIT Chennai alumni on a mission to make transformative AI accessible to every business.
          </p>
        </AnimatedSection>
      </div>
    </section>

    {/* Story */}
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <AnimatedSection>
          <h2 className="text-3xl font-heading font-bold mb-8">
            Our Story: From IIIT Chennai to{" "}
            <span className="text-gradient">AI Transformation</span>
          </h2>
        </AnimatedSection>
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <AnimatedSection>
            <p>
              NexusAI was founded by Subhash Bishnoi and Rishit Rastogi, two IIIT Chennai alumni who shared a vision:
              to bridge the gap between cutting-edge AI research and real-world business impact.
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <p>
              While working at leading companies—from fast-growing startups like 1buy.ai to Fortune 500 enterprises like HSBC—we witnessed
              a consistent pattern: businesses knew AI was important but struggled to implement it effectively.
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <p>
              We realized that successful AI transformation requires both strategic thinking AND technical execution.
              That intersection is where we operate. Before founding NexusAI, we validated our approach through
              real-world results: scaling AI at 1buy.ai, automating workflows at TNQTech, and building enterprise
              platforms like CogniScale.
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <p>
              Today, we help companies across industries implement AI strategies and build custom automation solutions
              that deliver measurable ROI. Every engagement is grounded in one principle: AI should create real business
              value, not just technical complexity.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>

    {/* Mission & Values */}
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-6">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Mission & <span className="text-gradient">Values</span>
          </h2>
        </AnimatedSection>
        <AnimatedSection className="text-center mb-12">
          <div className="max-w-2xl mx-auto p-6 rounded-xl bg-background border border-border">
            <p className="text-sm text-muted-foreground italic">
              "To democratize access to transformative AI technology by delivering strategic guidance
              and custom automation solutions that create measurable business impact."
            </p>
          </div>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {values.map((v, i) => (
            <AnimatedSection key={v.title} delay={i * 0.05}>
              <div className="p-6 rounded-xl bg-background border border-border h-full text-center">
                <v.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-sm mb-2">{v.title}</h3>
                <p className="text-xs text-muted-foreground">{v.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Detailed Founders */}
    <section className="py-20">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Meet the <span className="text-gradient">Founders</span>
          </h2>
        </AnimatedSection>

        {/* Subhash */}
        <AnimatedSection className="mb-12">
          <div className="grid md:grid-cols-3 gap-8 p-8 rounded-xl bg-card border border-border">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4">
                <span className="font-heading font-bold text-primary text-2xl">SB</span>
              </div>
              <h3 className="font-heading text-xl font-bold">Subhash Bishnoi</h3>
              <p className="text-primary text-sm font-medium">Co-Founder & AI Engineer</p>
              <span className="mt-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">IIITIAN | IIIT Chennai '26</span>
              <a href="#" className="mt-3 text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Subhash combines cutting-edge AI expertise with real-world business impact. As Founding AI Engineer
                at 1buy.ai (fastest-growing startup in segment), he's proven that AI isn't just about technology—it's
                about transformation. His creation of CogniScale demonstrates production-ready enterprise AI architecture.
              </p>
              <p className="text-sm text-muted-foreground italic mb-6">
                "I believe AI's true power lies not in replacing humans but in amplifying what makes us uniquely
                capable—creativity, strategic thinking, and complex problem-solving."
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: GraduationCap, text: "IIIT Chennai '26" },
                  { icon: Trophy, text: "IEEE Hackathon 2025 Winner" },
                  { icon: Rocket, text: "Founding AI Engineer at 1buy.ai" },
                  { icon: Building, text: "Workflow Automation at TNQTech" },
                ].map((a) => (
                  <div key={a.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a.icon className="h-4 w-4 text-primary shrink-0" />{a.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Rishit */}
        <AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 p-8 rounded-xl bg-card border border-border">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4">
                <span className="font-heading font-bold text-primary text-2xl">RR</span>
              </div>
              <h3 className="font-heading text-xl font-bold">Rishit Rastogi</h3>
              <p className="text-primary text-sm font-medium">Co-Founder & Strategy Lead</p>
              <span className="mt-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">IIITIAN | IIIT Chennai</span>
              <a href="#" className="mt-3 text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Rishit brings a unique blend of financial acumen and AI innovation. His experience at HSBC and
                M2P Fintech gives him deep insights into how AI drives business value in high-stakes environments.
                Multiple hackathon wins validate his technical excellence.
              </p>
              <p className="text-sm text-muted-foreground italic mb-6">
                "The best AI solutions come from understanding what the business actually needs, not just what
                the technology can do."
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: GraduationCap, text: "IIIT Chennai Graduate" },
                  { icon: Building, text: "Financial Crime Analyst at HSBC" },
                  { icon: CreditCard, text: "M2P Fintech Experience" },
                  { icon: Trophy, text: "BuildShip AI Hackathon Winner" },
                ].map((a) => (
                  <div key={a.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a.icon className="h-4 w-4 text-primary shrink-0" />{a.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Timeline */}
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-6 max-w-2xl">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold">Our <span className="text-gradient">Journey</span></h2>
        </AnimatedSection>
        <div className="space-y-6">
          {milestones.map((m, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <div className="flex items-start gap-4">
                <span className="font-heading font-bold text-primary text-sm w-12 shrink-0 pt-1">{m.year}</span>
                <div className="flex-1 p-4 rounded-lg bg-background border border-border">
                  <p className="text-sm text-muted-foreground">{m.event}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <AnimatedSection>
          <h2 className="text-3xl font-heading font-bold mb-4">Want to Work With Us?</h2>
          <p className="text-muted-foreground mb-8">Let's discuss how we can help transform your business.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="glow" asChild>
              <Link to="/contact">Schedule a Consultation</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/case-studies">See Our Work</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default About;
