import AnimatedSection from "@/components/AnimatedSection";
import hsbcLogo from "@/assets/hsbc.svg";
import onebuyLogo from "@/assets/1BUY.png";
import tnqLogo from "@/assets/TNQTech.png";
import m2pLogo from "@/assets/M2P.png";

const logos = [
  { name: "HSBC", src: hsbcLogo },
  { name: "1buy.ai", src: onebuyLogo },
  { name: "TNQ Tech", src: tnqLogo },
  { name: "M2P Fintech", src: m2pLogo },
];

const ProblemsSection = () => (
  <section className="py-14 border-y border-border/50 overflow-hidden bg-white">
    <div className="container mx-auto px-6">
      <AnimatedSection>
        <p className="text-center text-xs font-semibold text-muted-foreground/50 uppercase tracking-[0.2em] mb-8">
          Trusted by teams at
        </p>
      </AnimatedSection>
    </div>

    {/* Infinite scrolling marquee with logos */}
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
      <div className="flex animate-marquee whitespace-nowrap items-center">
        {[...logos, ...logos, ...logos, ...logos, ...logos, ...logos].map((logo, i) => (
          <img
            key={`${logo.name}-${i}`}
            src={logo.src}
            alt={logo.name}
            className="mx-12 h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300 select-none"
          />
        ))}
      </div>
    </div>
  </section>
);

export default ProblemsSection;
