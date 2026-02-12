import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50">
    <div className="container mx-auto px-6 py-14">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="text-lg font-bold tracking-tight">
            NexusAI<span className="text-primary">.</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
            AI strategy, custom agents, and automation — built for companies that move fast.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/50">
            Founded by IIIT Chennai alumni.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground mb-3">
            Services
          </h4>
          <ul className="space-y-2">
            {["AI Strategy", "Custom Agents", "Automation", "Generative AI", "Analytics"].map((s) => (
              <li key={s}>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground mb-3">
            Company
          </h4>
          <ul className="space-y-2">
            {[
              { label: "About", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground mb-3">
            Connect
          </h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a></li>
            <li><a href="mailto:hello@nexusai.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Email</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border/50 text-xs text-muted-foreground/50">
        &copy; {new Date().getFullYear()} NexusAI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
