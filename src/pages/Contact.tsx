import { useState } from "react";
import { Mail, Phone, MapPin, Linkedin, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedSection from "@/components/AnimatedSection";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "", interest: "", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <main className="pt-16">
      <section className="py-20 md:py-28 bg-stripe-gradient">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl">
            {/* Left: Info */}
            <AnimatedSection className="lg:col-span-2">
              <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-3">Contact</p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5">
                Let's talk.
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Tell us about your project. We'll get back to you within 24 hours with an honest assessment.
              </p>

              <div className="space-y-5">
                <a href="mailto:hello@nexusai.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white border border-border/60 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  hello@nexusai.com
                </a>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-9 h-9 rounded-lg bg-white border border-border/60 flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </div>
                  +91 (XXX) XXX-XXXX
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-9 h-9 rounded-lg bg-white border border-border/60 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  Chennai, India
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground mb-3">Connect with founders</p>
                <div className="space-y-2">
                  {["Subhash Bishnoi", "Rishit Rastogi"].map((name) => (
                    <a key={name} href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-3.5 w-3.5" /> {name}
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Form */}
            <AnimatedSection className="lg:col-span-3" delay={0.1}>
              {submitted ? (
                <div className="rounded-2xl border border-border/60 bg-white p-16 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl tracking-tight mb-2">Message sent</h3>
                  <p className="text-muted-foreground">We'll be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-white p-8 shadow-sm space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-foreground">Name *</label>
                      <Input placeholder="Jane Smith" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="rounded-lg h-10 bg-secondary/30 border-border/50" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-foreground">Email *</label>
                      <Input type="email" placeholder="jane@company.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="rounded-lg h-10 bg-secondary/30 border-border/50" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-foreground">Company</label>
                      <Input placeholder="Company" value={form.company} onChange={(e) => handleChange("company", e.target.value)} className="rounded-lg h-10 bg-secondary/30 border-border/50" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-foreground">Interested in</label>
                      <Select onValueChange={(v) => handleChange("interest", v)}>
                        <SelectTrigger className="rounded-lg h-10 bg-secondary/30 border-border/50"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strategy">AI Strategy</SelectItem>
                          <SelectItem value="agents">Custom Agents</SelectItem>
                          <SelectItem value="automation">Automation</SelectItem>
                          <SelectItem value="genai">Generative AI</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="unsure">Not sure yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-foreground">Message *</label>
                    <Textarea placeholder="Tell us about your project, challenges, and timeline..." rows={5} value={form.message} onChange={(e) => handleChange("message", e.target.value)} className="rounded-lg bg-secondary/30 border-border/50 resize-none" />
                  </div>
                  <Button type="submit" className="w-full rounded-lg h-11 text-sm font-semibold">
                    <Send className="mr-2 h-4 w-4" />
                    Send message
                  </Button>
                  <p className="text-[11px] text-muted-foreground/60 text-center">
                    We respond within 24 hours. No spam, ever.
                  </p>
                </form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
