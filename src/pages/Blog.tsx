import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const posts = [
  {
    id: 1,
    title: "5 Signs Your Business is Ready for AI Transformation",
    excerpt: "Discover the key indicators that your organization is prepared to leverage AI for competitive advantage and operational efficiency.",
    category: "Strategy",
    author: "Rishit Rastogi",
    date: "Jan 15, 2025",
    readTime: "5 min",
  },
  {
    id: 2,
    title: "Building Production-Ready AI Agents: Lessons from CogniScale",
    excerpt: "Technical deep-dive into the architecture decisions and lessons learned building our enterprise AI platform.",
    category: "Technical",
    author: "Subhash Bishnoi",
    date: "Jan 8, 2025",
    readTime: "8 min",
  },
  {
    id: 3,
    title: "How to Calculate AI ROI: A Framework for Business Leaders",
    excerpt: "A practical framework for evaluating AI investments and projecting returns based on real-world data from our client engagements.",
    category: "Strategy",
    author: "Rishit Rastogi",
    date: "Dec 28, 2024",
    readTime: "6 min",
  },
  {
    id: 4,
    title: "AI in Fintech: Use Cases from HSBC and Beyond",
    excerpt: "Exploring how financial institutions are leveraging AI for fraud detection, risk analysis, and customer experience.",
    category: "Industry",
    author: "Rishit Rastogi",
    date: "Dec 20, 2024",
    readTime: "7 min",
  },
  {
    id: 5,
    title: "From IIIT Chennai to AI Entrepreneurship: Our Journey",
    excerpt: "The story of how two IIIT Chennai graduates combined academic rigor with startup hustle to build an AI consultancy.",
    category: "Founder",
    author: "Subhash Bishnoi",
    date: "Dec 12, 2024",
    readTime: "4 min",
  },
  {
    id: 6,
    title: "Multi-Tenant AI Architectures: A Technical Overview",
    excerpt: "How to design AI systems that serve multiple clients from a single codebase while maintaining data isolation and customization.",
    category: "Technical",
    author: "Subhash Bishnoi",
    date: "Dec 5, 2024",
    readTime: "10 min",
  },
];

const categoryColors: Record<string, string> = {
  Strategy: "text-primary bg-primary/10",
  Technical: "text-accent bg-accent/10",
  Industry: "text-foreground bg-secondary",
  Founder: "text-primary bg-primary/10",
};

const Blog = () => (
  <main className="pt-24">
    {/* Hero */}
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <AnimatedSection>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            AI Insights & <span className="text-gradient">Innovation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Expert perspectives on AI strategy, implementation, and industry trends.
          </p>
        </AnimatedSection>
      </div>
    </section>

    {/* Posts Grid */}
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 0.05}>
              <article className="p-6 rounded-xl bg-card border border-border card-hover h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${categoryColors[post.category] || "text-muted-foreground bg-muted"}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {post.readTime}
                  </span>
                </div>

                <h2 className="font-heading text-lg font-semibold mb-3 leading-snug">
                  {post.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">{post.author}</span>
                    <span className="mx-2">·</span>
                    {post.date}
                  </div>
                  <span className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Newsletter */}
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-6 max-w-xl text-center">
        <AnimatedSection>
          <h2 className="text-2xl font-heading font-bold mb-4">
            Get AI Insights in Your Inbox
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Weekly insights on AI strategy, implementation tips, and industry trends. No spam.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={255}
            />
            <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow-sm hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default Blog;
