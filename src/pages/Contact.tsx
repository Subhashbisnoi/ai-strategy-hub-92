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
    name: "", email: "", company: "", phone: "", industry: "", interest: "", message: "",
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

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="pt-24">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="container mx-auto px-6 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Let's Start the <span className="text-gradient">Conversation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Whether you're ready to transform your business with AI or just have questions, we're here to help.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <AnimatedSection className="lg:col-span-3">
              {submitted ? (
                <div className="p-12 rounded-xl bg-card border border-border text-center">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="font-heading text-2xl font-bold mb-3">Thank You!</h3>
                  <p className="text-muted-foreground">
                    We've received your message and will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 rounded-xl bg-card border border-border space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Name *</label>
                      <Input
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="bg-background"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email *</label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="bg-background"
                        maxLength={255}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Company</label>
                      <Input
                        placeholder="Company name"
                        value={form.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        className="bg-background"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone</label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="bg-background"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Industry</label>
                      <Select onValueChange={(v) => handleChange("industry", v)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fintech">Fintech</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="saas">Enterprise SaaS</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Interested In</label>
                      <Select onValueChange={(v) => handleChange("interest", v)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strategy">AI Strategy Consulting</SelectItem>
                          <SelectItem value="agents">AI Agent Development</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                          <SelectItem value="unsure">Not Sure Yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Message *</label>
                    <Textarea
                      placeholder="Tell us about your project, challenges, and goals..."
                      rows={5}
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="bg-background resize-none"
                      maxLength={1000}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full glow">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </AnimatedSection>

            {/* Contact Info */}
            <AnimatedSection className="lg:col-span-2" delay={0.2}>
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="font-heading font-semibold mb-4">Get in Touch</h3>
                  <div className="space-y-4">
                    <a href="mailto:hello@nexusai.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-5 w-5 text-primary" /> hello@nexusai.com
                    </a>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-5 w-5 text-primary" /> +91 (XXX) XXX-XXXX
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-5 w-5 text-primary" /> Chennai, India
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="font-heading font-semibold mb-4">Connect With Us</h3>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-5 w-5" /> Subhash Bishnoi
                    </a>
                    <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-5 w-5" /> Rishit Rastogi
                    </a>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                  <h3 className="font-heading font-semibold mb-2">Free Strategy Session</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Book a free 30-minute call with our founding team. We'll assess your AI opportunities
                    and provide actionable recommendations—no strings attached.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
