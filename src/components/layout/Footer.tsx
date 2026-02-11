import { Link } from "react-router-dom";
import { Linkedin, Github, Mail } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <Link to="/" className="font-heading text-xl font-bold text-gradient">
            NexusAI
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI Transformation for Forward-Thinking Companies. Founded by IIIT Chennai Alumni.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-primary transition-colors">AI Strategy Consulting</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">AI Agent Development</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Implementation Support</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Ongoing Optimization</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/case-studies" className="hover:text-primary transition-colors">Case Studies</Link></li>
            <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NexusAI. All rights reserved.</p>
        <p>Proudly founded by IIIT Chennai alumni</p>
      </div>
    </div>
  </footer>
);

export default Footer;
