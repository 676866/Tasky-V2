import { motion } from "framer-motion";
import { CheckCircle, Zap, Shield, BarChart3, Users, Clock, ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { FaLinkedin, FaGithub, FaXTwitter } from "react-icons/fa6";

const features = [
  { 
    title: "Lightning Fast", 
    desc: "Create and assign tasks in seconds with our streamlined interface that feels like second nature.",
    author: "Product Team",
    category: "Efficiency" 
  },
  { 
    title: "Team Collaboration", 
    desc: "Invite members, assign tasks, and track progress together without the typical communication overhead.",
    author: "Operations Dept",
    category: "Connectivity"
  },
  { 
    title: "Intelligent Workflows", 
    desc: "Automate routine tasks and get smart suggestions to keep your projects moving forward effortlessly.",
    author: "Product Team",
    category: "Automation"
   },
   {
    title: "Robust Security",
    desc: "Your data is safe with us. We use industry-leading security practices to protect your information.",
    author: "Security Team",
    category: "Trust"
  
  },
  
  // ... repeat for other items
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

            {/* <img
                src="https://media.istockphoto.com/id/2093222366/photo/businesswoman-planning-on-a-digital-calendar-and-effective-task-management.jpg?s=1024x1024&w=is&k=20&c=ENimlHY1AYEDUEEgYeE0tSXwdMYVgVo8G05P6Ii0Z3A="
                alt="Task Illustration"
                className="max-w-[460px] w-full mx-auto rounded-3xl shadow-xl mb-12"
              /> */}
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
<motion.div 
  initial={{ opacity: 0, y: 50 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ duration: 0.8, delay: 0.3 }} 
  className="mt-16 max-w-5xl mx-auto px-4"
>
  {/* The "Amazing" Container with the purple ambient glow from your screenshot */}
  <div className="rounded-2xl border border-white/20 bg-white/80 dark:bg-card/50 backdrop-blur-xl p-2 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)]">
    <div className="rounded-xl bg-white dark:bg-[#0A0A0A] p-6 shadow-inner">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "To Do", count: 3, color: "bg-slate-400", tasks: ["visit the dentist", "Client Meeting", "do my homework"] },
          { label: "In Progress", count: 2, color: "bg-blue-500", tasks: ["recording marks", "API Integration"] },
          { label: "Review", count: 1, color: "bg-orange-500", tasks: ["User Testing"] },
          { label: "Done", count: 2, color: "bg-emerald-500", tasks: ["Project Setup", "backup installation"] }
        ].map((col, i) => (
          <div key={col.label} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color} shadow-sm`} />
                <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{col.label}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-full">{col.count}</span>
            </div>

            {/* Task Cards */}
            <div className="space-y-3">
              {col.tasks.map((task, j) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 + j * 0.05 }}
                  className="group rounded-xl border border-slate-100 dark:border-white/5 p-4 bg-white dark:bg-[#111111] hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex flex-col gap-3">
                    <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                      {task}
                    </p>
                    {/* Visual dummy "meta data" to make it look like a real app */}
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full" />
                      <div className="h-1.5 w-6 bg-slate-100 dark:bg-white/5 rounded-full" />
                      <div className="ml-auto flex -space-x-2">
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</motion.div>

        </div>
      </section>

   {/* Stats Section */}
<section className="py-24 bg-white dark:bg-[#030303] border-y border-gray-100 dark:border-white/5">
  <div className="container mx-auto px-4">
    <motion.div 
      variants={container} 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true }} 
      className="grid grid-cols-2 lg:grid-cols-4 gap-12"
    >
      {stats.map((s) => (
        <motion.div key={s.label} variants={item} className="flex flex-col items-center group">
          {/* Large Number - High Contrast */}
          <div className="relative">
            <h3 className="text-5xl md:text-6xl font-bold tracking-tighter text-gray-900 dark:text-white/90">
              {s.value}
            </h3>
            {/* Subtle glow behind number (optional, for that 'smart' feel) */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Label - Indigo/Purple Accent */}
          <p className="mt-4 text-xs md:text-sm font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400/80">
            {s.label}
          </p>

          {/* The Underline Glow (Exactly like your screenshot) */}
          <div className="mt-6 relative h-[2px] w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>



   {/* Features Section */}
<section id="features" className="py-20 bg-secondary/30">
  <div className="container mx-auto px-4">
    {/* Retained original header */}
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
      <span className="text-sm font-medium text-primary mb-2 block uppercase tracking-wider">Features</span>
      <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Everything you need to ship</h2>
      <p className="text-muted-foreground max-w-md mx-auto">Powerful features designed for modern teams.</p>
    </motion.div>

    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {features.map((f) => (
        <motion.div 
          key={f.title} 
          variants={item} 
          /* FlutterFlow Card Styling */
          className="relative min-h-[320px] rounded-3xl p-10 flex flex-col bg-gradient-to-br from-[#a341b9] via-[#42166b] to-[#121111] border border-white/5 hover:border-indigo-100 transition-all duration-100 group overflow-hidden shadow-2x1"
        >
          {/* Card Header */}
          <h3 className="text-xl font-bold text-white/90 mb-8 tracking-tight">
            {f.title}
          </h3>

          {/* Card Body (Description styled as a quote) */}
          <p className="text-lg leading-relaxed text-gray-300/90 font-medium mb-12 flex-grow">
            "{f.desc}"
          </p>

          {/* Card Footer (Author/Role style) */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="font-bold text-white text-md">
              {f.title.split(' ')[0]} Module
            </div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              System Core
            </div>
          </div>

          {/* Background Glow Effect on hover */}
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-100/20 transition-all" />
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
