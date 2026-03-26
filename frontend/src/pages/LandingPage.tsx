import { motion } from "framer-motion";
import { CheckCircle, Zap, Shield, BarChart3, Users, Clock, ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { FaLinkedin, FaGithub, FaXTwitter } from "react-icons/fa6";

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Create and assign tasks in seconds with our streamlined interface." },
  { icon: Users, title: "Team Collaboration", desc: "Invite members, assign tasks, and track progress together." },
  { icon: BarChart3, title: "Smart Analytics", desc: "Gain insights into productivity with real-time dashboards." },
  { icon: Shield, title: "Role-Based Access", desc: "Admin and user roles with granular permissions." },
  { icon: Clock, title: "Due Date Tracking", desc: "Never miss a deadline with smart reminders and filters." },
  { icon: CheckCircle, title: "Kanban Board", desc: "Drag-and-drop task management in a visual board." },
];

const pricingPlans = [
  { name: "Free", price: "KES 0", period: "/month", features: ["5 personal tasks", "1 organization", "Basic filters", "Email support"], cta: "Get Started", popular: false },
  { name: "Pro", price: "KES 1,500", period: "/month", features: ["Unlimited tasks", "5 organizations", "Advanced analytics", "Priority support", "Custom fields"], cta: "Start Free Trial", popular: true },
  { name: "Enterprise", price: "KES 6,000", period: "/month", features: ["Everything in Pro", "Unlimited orgs", "Custom integrations", "Dedicated support", "SSO & SAML", "Audit logs"], cta: "Contact Sales", popular: false },
];

const testimonials = [
  { name: "David Kimani", role: "CTO, TechSavanna", quote: "Tasky transformed how our team collaborates. We shipped 40% faster in the first month.", rating: 5 },
  { name: "Amina Osei", role: "PM, CloudNairobi", quote: "The Kanban board and role-based access are exactly what we needed. Clean and intuitive.", rating: 5 },
  { name: "Brian Ochieng", role: "Founder, DevPulse", quote: "Best task management tool for African startups. The pricing in KES is a game changer.", rating: 5 },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Organizations" },
  { value: "1M+", label: "Tasks Completed" },
  { value: "99.9%", label: "Uptime" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function LandingPage() {
  const navigate = useNavigate();
  const [carouselIdx, setCarouselIdx] = useState(0);

  const nextTestimonial = useCallback(() => setCarouselIdx((i) => (i + 1) % testimonials.length), []);
  const prevTestimonial = useCallback(() => setCarouselIdx((i) => (i - 1 + testimonials.length) % testimonials.length), []);

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">Tasky</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log in</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={() => navigate("/signup")}>
              Sign up free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Now with Kanban drag-and-drop
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Task management{" "}
              <span className="text-fuchsia-950 font-mono">reimagined</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Organize, collaborate, and ship faster. Tasky brings your team together with intelligent task workflows and beautiful Kanban boards.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gradient-primary text-primary-foreground border-0 px-8 h-12 text-base group" onClick={() => navigate("/signup")}>
                Start for free <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base px-8" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                See features
              </Button>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-16 max-w-4xl mx-auto">
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl p-1.5 animate-glow">
              <div className="rounded-lg bg-card p-6">
                <div className="grid grid-cols-4 gap-4">
                  {["To Do", "In Progress", "Review", "Done"].map((col, i) => (
                    <div key={col} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${["bg-muted-foreground", "bg-info", "bg-warning", "bg-success"][i]}`} />
                        <span className="text-sm font-medium">{col}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{[3, 2, 1, 2][i]}</span>
                      </div>
                      {Array.from({ length: [3, 2, 1, 2][i] }).map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 + j * 0.05 }}
                          className="rounded-lg border border-border p-3 bg-background hover-lift cursor-pointer"
                        >
                          <div className="h-2 w-3/4 bg-muted rounded mb-2" />
                          <div className="h-2 w-1/2 bg-muted rounded" />
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <motion.div key={s.label} variants={item} className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold gradient-text">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-sm font-medium text-primary mb-2 block">FEATURES</span>
            <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Everything you need to ship</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Powerful features designed for modern teams.</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <motion.div key={f.title} variants={item} className="glass-card rounded-xl p-6 hover-lift group">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-sm font-medium text-primary mb-2 block">TESTIMONIALS</span>
            <h2 className="text-3xl md:text-4xl font-mono font-bold mb-4">Loved by teams everywhere</h2>
            <p className="text-muted-foreground">See what our customers have to say.</p>
          </motion.div>
          <div className="max-w-2xl mx-auto relative">
            <motion.div
              key={carouselIdx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: testimonials[carouselIdx].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-lg italic text-foreground mb-6">"{testimonials[carouselIdx].quote}"</p>
              <div>
                <p className="font-display font-semibold">{testimonials[carouselIdx].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[carouselIdx].role}</p>
              </div>
            </motion.div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={prevTestimonial}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setCarouselIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === carouselIdx ? "w-6 gradient-primary" : "bg-muted-foreground/30"}`} />
                ))}
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={nextTestimonial}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-sm font-medium text-primary mb-2 block">PRICING</span>
            <h2 className="text-3xl md:text-4xl font-mono font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you need more.</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={item}
                className={`rounded-xl p-6 border ${plan.popular ? "gradient-primary text-primary-foreground border-transparent shadow-2xl scale-105" : "glass-card"} hover-lift`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 rounded-full bg-background/20 text-xs font-semibold mb-4">Most Popular</span>
                )}
                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "bg-background text-foreground hover:bg-background/90" : "gradient-primary text-primary-foreground border-0"}`}
                  onClick={() => navigate("/signup")}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center rounded-2xl gradient-primary p-12"
          >
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-primary-foreground mb-4">Ready to supercharge your productivity?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">Join thousands of teams already using Tasky to ship faster and collaborate better.</p>
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-12 px-8 text-base" onClick={() => navigate("/signup")}>
              Get started for free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">Tasky</span>
              </div>
              <p className="text-sm text-muted-foreground">Modern task management for modern teams. Built with love in Kenya 🇰🇪</p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Integrations</span></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Changelog</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-pointer hover:text-foreground transition-colors">About</span></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Blog</span></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Careers</span></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Contact</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Terms of Service</span></li>
                <li><span className="cursor-pointer hover:text-foreground transition-colors">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 Tasky. All rights reserved.</p>
            <div className="flex items-center gap-4 text-gray-500"> {/* Adjust base color as needed */}
      
      {/* LinkedIn */}
      <a
        href="https://www.linkedin.com/in/frankline-kober-32a55230b/"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:text-foreground transition-colors"
        aria-label="LinkedIn"
      >
        <FaLinkedin className="w-6 h-6" />
      </a>

      {/* X (Twitter) */}
      <a
        href="https://x.com/franklinekober?s=11"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:text-foreground transition-colors"
        aria-label="X (formerly Twitter)"
      >
        <FaXTwitter className="w-6 h-6" />
      </a>

      {/* GitHub */}
      <a
        href="https://github.com/676866"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:text-foreground transition-colors"
        aria-label="GitHub"
      >
        <FaGithub className="w-6 h-6" />
      </a>

    </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
