import { useState, useEffect, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "motion/react";
import { Github, Linkedin, Mail, MessageCircle, ExternalLink, ChevronRight, ArrowUp, Terminal, Code2, Database, Globe, Menu, X } from "lucide-react";

const NAV_LINKS = ["about", "skills", "projects", "leadership", "contact"];

/** Each category owns a neon from the palette; `rgb` feeds the rgba() glows. */
const SKILLS = [
  {
    category: "Languages",
    icon: Terminal,
    color: "#00ff88",
    rgb: "0,255,136",
    items: ["JavaScript", "TypeScript", "PHP", "Java", "C++", "SQL", "HTML", "CSS"],
  },
  {
    category: "Frameworks & Libraries",
    icon: Globe,
    color: "#ff00ff",
    rgb: "255,0,255",
    items: ["React", "React Native", "Laravel", "Bootstrap", "Eloquent ORM", "Blade"],
  },
  {
    category: "Backend & Data",
    icon: Database,
    color: "#00d4ff",
    rgb: "0,212,255",
    items: ["Node.js", "REST APIs", "n8n", "MySQL", "SQLite"],
  },
  {
    category: "Tools & Concepts",
    icon: Code2,
    color: "#ffcc00",
    rgb: "255,204,0",
    items: ["Git", "GitHub", "VS Code", "Android Studio", "OOP", "MVC", "RBAC", "DSA"],
  },
];

/** Neon assigned to each tech category, so a chip's color signals what kind of thing it is. */
const NEON = {
  lang: { hex: "#00ff88", rgb: "0,255,136" },
  framework: { hex: "#00d4ff", rgb: "0,212,255" },
  data: { hex: "#ff00ff", rgb: "255,0,255" },
  ai: { hex: "#ffb000", rgb: "255,176,0" },
} as const;

const TECH_CATEGORY: Record<string, keyof typeof NEON> = {
  // Languages (green)
  JavaScript: "lang", TypeScript: "lang", PHP: "lang", Java: "lang", "C++": "lang", SQL: "lang",
  Python: "lang",
  // Frameworks & libraries (cyan)
  React: "framework", "React Native": "framework", Laravel: "framework", Bootstrap: "framework",
  "Eloquent ORM": "framework", Blade: "framework",
  "Next.js": "framework", "Tailwind CSS": "framework", Prisma: "framework",
  Playwright: "framework", CustomTkinter: "framework", grammy: "framework",
  // Backend, data & infrastructure (magenta)
  "Node.js": "data", "REST API": "data", "REST APIs": "data", MySQL: "data", SQLite: "data", n8n: "data",
  "Microsoft Graph": "data", viem: "data", Solana: "data",
  // AI (amber)
  LLM: "ai", RAG: "ai", "Claude Code": "ai", "Claude Vision": "ai",
};

const techNeon = (tech: string) => NEON[TECH_CATEGORY[tech] ?? "data"];

interface Project {
  title: string;
  desc: string;
  tech: string[];
  github: string | null;
  live: string | null;
  highlight: boolean;
  tag?: string;
  /** Detail shown only in the project modal. */
  period?: string;
  why?: string;
  learned?: string[];
  /** Paths under /public, e.g. "/projects/food-ordering.png". Omit to hide the gallery entirely. */
  images?: string[];
}

const ACADEMIC_PROJECTS: Project[] = [
  {
    title: "Automated Onboarding Management System",
    desc: "Final Year Project. Researching the integration of Large Language Models with n8n workflow automation to streamline enterprise employee onboarding. Evaluating Retrieval-Augmented Generation (RAG) methodologies to securely query local onboarding data and reduce AI hallucinations.",
    tech: ["LLM", "n8n", "RAG"],
    github: null,
    live: null,
    highlight: true,
    tag: "// ongoing",
    period: "July 2026 – Present",
    why:
      "Employee onboarding is repetitive and manual — HR answers the same policy questions for every new hire. I wanted to find out whether an LLM could take that over reliably enough for real enterprise use, without shipping internal documents to a third party or inventing answers when it doesn't know something.",
    learned: [
      "Chaining n8n nodes into an automation workflow that a non-developer can still maintain",
      "Why naive LLM prompting hallucinates on internal policy questions, and how Retrieval-Augmented Generation grounds answers in real documents",
      "That retrieval quality — not the model — is usually the bottleneck in a RAG pipeline",
      "Querying onboarding data locally instead of sending it to an external API",
    ],
  },
  {
    title: "Food Ordering Web App",
    desc: "End-to-end restaurant ordering system handling menus, dynamic session carts, checkout pipelines, and historical order tracking. Secured restricted operations with Role-Based Access Control using Laravel Gates and Policies to isolate admin dashboards from customer endpoints.",
    tech: ["Laravel", "PHP", "Eloquent ORM", "MySQL", "Blade"],
    github: "https://github.com/fongziqi/food-ordering-web-app",
    live: null,
    highlight: false,
    period: "Feb 2026 – June 2026",
    images: ["/projects/food-ordering.png"],
    why:
      "A coursework brief to build a complete e-commerce flow end to end. I picked a restaurant ordering system because it forces the hard parts into the open: a cart that survives navigation, a checkout pipeline that can't half-complete, and an admin area customers must never reach.",
    learned: [
      "Laravel Gates and Policies — and why authorization belongs in one place instead of scattered across controllers",
      "Modelling relationships with Eloquent ORM rather than hand-writing SQL joins",
      "Session-based cart state, and the edge cases when a cart outlives a page load",
      "Separating admin dashboards from customer endpoints at the routing layer",
    ],
  },
  {
    title: "Note-Taking Mobile App",
    desc: "Cross-platform mobile client with structured state management for smooth interactions and local data rendering. Client-server communication over REST APIs keeps notes synchronized across devices, with the backend server run alongside the app during deployment and testing.",
    tech: ["React Native", "TypeScript", "Node.js", "REST API"],
    github: "https://github.com/fongziqi/NoteTakingApp",
    live: null,
    highlight: false,
    period: "Feb 2026 – June 2026",
    images: ["/projects/note-taking.png"],
    why:
      "I wanted to understand what actually happens between a mobile client and its backend, so I built both halves myself instead of mocking the API and pretending the network was solved.",
    learned: [
      "Structuring state in React Native so the UI stays responsive as data changes",
      "How TypeScript catches shape mismatches between client and API before they reach runtime",
      "Running and debugging a Node.js server alongside the mobile app during testing",
      "Designing REST endpoints that keep notes synchronized across devices",
    ],
  },
];

const VIBE_PROJECTS: Project[] = [
  {
    title: "CAD Manager",
    desc: "Built an internal CAD project and drawing management system for a small manufacturing team using Next.js, TypeScript, SQLite, and Microsoft SharePoint integration. Designed role-based workflows for project status tracking, approvals, archiving, file upload/restore, audit history, and user notifications, with a pluggable storage layer for local mock data and production SharePoint storage.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "SQLite", "Microsoft Graph", "Claude Code"],
    github: null,
    live: null,
    highlight: false,
    images: ["/projects/cad-manager.png"],
    why:
      "It was built to solve a real operational problem for a small CAD manufacturing team: keeping project files, approvals, statuses, and designer workspaces organized in one place instead of managing everything manually across folders and chat. The main goal was to create a management layer on top of SharePoint so the team could track who is editing what, control file access by workflow state, record audit history, and reduce mistakes during review, approval, archive, and restore steps.",
    learned: [
      "Integrated SharePoint storage and designed features for file upload, restore, archive, notifications, and audit history.",
      "Solved file-edit concurrency issues by designing a single-editor locking flow so the same file could not be edited by multiple users at the same time.",
      "Designed the system architecture and made implementation decisions for a full-stack CAD management platform using Next.js, TypeScript, and SQLite.",
    ],
  },
  {
    title: "Timetable Bidding App",
    desc: "App that streamlines course timetable bidding — lets students plan preferred slots, detect clashes, and place bids quickly when the bidding window opens.",
    tech: ["Python", "Playwright", "CustomTkinter", "Claude Vision", "Claude Code"],
    github: null,
    live: null,
    highlight: false,
    // Student ID redacted from this capture; untouched original in /screenshot-originals.
    images: ["/projects/timetable-bidder.png"],
    why:
      "Course bidding at UTAR is a scramble: the window opens, everyone rushes, and a clash you didn't spot costs you a semester. I wanted the planning done before the window opened, so bidding became execution rather than guesswork.",
    learned: [
      "Modelling timetable clash detection — deceptively fiddly once you handle overlapping and recurring slots",
      "Designing for a burst of time pressure, where the interface has to be fast to use rather than pretty",
    ],
  },
  {
    title: "Telegram CA Sniping Bot",
    desc: "Telegram bot that monitors channels for newly posted token contract addresses (CAs) in real time, parses and validates them, and surfaces instant alerts for fast action.",
    tech: ["Next.js", "TypeScript", "Prisma", "grammy", "viem", "Solana", "Claude Code"],
    github: null,
    live: null,
    highlight: false,
    // Tx hash redacted in telegram-bot.png (links to wallet); original in /screenshot-originals.
    images: ["/projects/telegram-bot.png", "/projects/telegram-bot2.png"],
    why:
      "An excuse to work with a real-time event stream where latency genuinely matters — messages arrive unpredictably, and the parsing has to be resilient to whatever format they show up in.",
    learned: [
      "Consuming a live message stream and reacting to events rather than polling on a timer",
      "Parsing and validating untrusted input — most incoming messages are noise or malformed",
      "Handling API rate limits and reconnection without dropping events",
    ],
  },
];

const EXPERIENCE = [
  {
    role: "Marketing Committee Member",
    company: "Music Club Concert",
    period: "July 2025",
    bullets: [
      "Formulated and executed digital promotional campaigns across student media channels",
      "Designed public-facing communications to maximize concert attendance and ticket sales",
    ],
  },
  {
    role: "Logistics & Fundraising Committee Member",
    company: "Dance Club Concert",
    period: "Sep 2024",
    bullets: [
      "Supported event logistics, participant communication, and issue resolution",
      "Contributed to smooth programme execution and a positive student experience",
    ],
  },
];

// ─── Ambient effects ────────────────────────────────────────────────────────

/** Scanline overlay across the whole page */
function Scanlines() {
  return <div className="cyber-scanlines" />;
}

/** Cursor glow that follows the mouse */
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 120, damping: 18 });
  const springY = useSpring(y, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed z-[9998]"
      style={{
        left: springX,
        top: springY,
        translateX: "-50%",
        translateY: "-50%",
        width: 340,
        height: 340,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 70%)",
      }}
    />
  );
}

/** Floating particle field */
const PARTICLE_COUNT = 28;
function Particles() {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * -20,
      xDrift: (Math.random() - 0.5) * 8,
    }))
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0,
            boxShadow: `0 0 ${p.size * 3}px rgba(0,255,136,0.8)`,
          }}
          animate={{
            y: [0, -80, -160],
            x: [0, p.xDrift * 10, p.xDrift * 20],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/** Slow-drifting ambient glow orbs */
function AmbientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(0,255,136,0.055) 0%, transparent 70%)",
          top: "10%",
          left: "-10%",
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(255,0,255,0.05) 0%, transparent 70%)",
          top: "50%",
          right: "-8%",
        }}
        animate={{ x: [0, -50, 0], y: [0, -60, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
          bottom: "5%",
          left: "30%",
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
    </div>
  );
}

/** Glitch text — flickers at random intervals (and on hover) */
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const triggerGlitch = useCallback(() => {
    setGlitching(true);
    timersRef.current.push(setTimeout(() => setGlitching(false), 120 + Math.random() * 300));
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    const schedule = () => {
      const delay = 1200 + Math.random() * 3800;
      timersRef.current.push(
        setTimeout(() => {
          if (cancelled) return;
          triggerGlitch();
          // occasional rapid double-flicker burst
          if (Math.random() < 0.45) {
            timersRef.current.push(setTimeout(() => { if (!cancelled) triggerGlitch(); }, 450 + Math.random() * 250));
          }
          schedule();
        }, delay)
      );
    };
    schedule();
    return () => {
      cancelled = true;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [triggerGlitch]);

  return (
    <span
      className={`relative inline-block cursor-default select-none ${className}`}
      onMouseEnter={triggerGlitch}
    >
      {text}
      {glitching && (
        <>
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              color: "#ff00ff",
              clipPath: "inset(30% 0 50% 0)",
              transform: "translateX(-4px)",
              mixBlendMode: "screen",
            }}
          >
            {text}
          </span>
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              color: "#00d4ff",
              clipPath: "inset(60% 0 10% 0)",
              transform: "translateX(4px)",
              mixBlendMode: "screen",
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

/** Animated corner bracket decoration */
function CornerBracket({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`absolute w-5 h-5 ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full border-primary"
        style={{
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderColor: "#00ff88",
        }}
      />
    </motion.div>
  );
}

/** Pulsing status dot */
function PulseDot({ color = "#00ff88" }: { color?: string }) {
  return (
    <span className="relative inline-flex items-center justify-center w-2 h-2">
      <motion.span
        className="absolute inline-block rounded-full"
        style={{ background: color, width: 8, height: 8 }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.9, 0, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="inline-block rounded-full w-2 h-2" style={{ background: color }} />
    </span>
  );
}

/** Reveal on scroll */
function RevealSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Typewriter */
function Typewriter({ text, className = "", speed = 55 }: { text: string; className?: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-primary">▌</span>}
    </span>
  );
}

/** Animated counter */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const step = target / (duration / 16);
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.floor(current));
      if (current >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, target]);
  return <span ref={ref}>{value}{suffix}</span>;
}

/** Floating back-to-top button, visible after scrolling past the hero */
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          whileHover={{ scale: 1.08, filter: "drop-shadow(0 0 10px rgba(0,255,136,0.5))" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="cyber-chamfer-sm fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 border-2 border-primary text-primary bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Ambient layers */}
      <Scanlines />
      <CursorGlow />
      <AmbientOrbs />
      <Particles />
      <BackToTop />

      {/* Nav */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <motion.button
            onClick={() => scrollTo("hero")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 font-mono text-sm md:text-base text-primary font-bold uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Terminal size={18} />
            <span className="cyber-glitch" data-text="FONGZIQI">FONGZIQI</span>
          </motion.button>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                whileHover={{ y: -2, color: "#00ff88", textShadow: "0 0 8px rgba(0,255,136,0.6)" }}
                onClick={() => scrollTo(link)}
                className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-150"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                [{link}]
              </motion.button>
            ))}
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.04, filter: "drop-shadow(0 0 8px rgba(0,255,136,0.6))" }}
              whileTap={{ scale: 0.97 }}
              className="cyber-chamfer-sm text-xs font-mono uppercase tracking-wider px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              RESUME.PDF
            </motion.a>
          </div>

          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4"
          >
            {NAV_LINKS.map((link) => (
              <button key={link} onClick={() => scrollTo(link)} className="text-left text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors" style={{ fontFamily: "'Share Tech Mono', monospace" }}>[{link}]</button>
            ))}
          </motion.div>
        )}
      </motion.nav>

      {/* Hero */}
      <section id="hero" className="min-h-screen flex flex-col justify-center max-w-5xl mx-auto px-6 pt-14 relative">
        {/* Circuit grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Horizontal scan line that drifts down */}
        <motion.div
          className="pointer-events-none absolute left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.25), transparent)" }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1 }}
        />

        <div className="py-20 md:py-0 relative">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-primary text-sm font-mono mb-4 tracking-widest flex items-center gap-2"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <PulseDot /> $ whoami
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl font-black leading-none uppercase tracking-wide md:tracking-widest mb-4"
            style={{ fontFamily: "'Orbitron', 'Share Tech Mono', monospace", textShadow: "0 0 10px rgba(0,255,136,0.35)" }}
          >
            <GlitchText text="FONG ZI QI" />
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl font-mono font-light text-muted-foreground mb-8"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="text-accent">{"// "}</span>
            <Typewriter text="Software Engineer Student" speed={45} />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="font-tech text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10"
          >
            Degree at UTAR, SE major. I enjoy building{" "}
            <span className="neon-highlight">practical, thoughtful software</span> and enjoy solving
            real-world problems through technology. Currently seeking a{" "}
            <span className="neon-highlight">Software Engineering internship</span> from September 2026.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04, filter: "brightness(1.1) drop-shadow(0 0 14px rgba(0,255,136,0.55))" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("projects")}
              className="cyber-chamfer-sm flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-mono font-medium uppercase tracking-wider transition-all duration-150"
            >
              View Projects <ChevronRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: "#00ff88", color: "#00ff88", filter: "drop-shadow(0 0 8px rgba(0,255,136,0.4))" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("contact")}
              className="cyber-chamfer-sm flex items-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-mono uppercase tracking-wider transition-all duration-150"
            >
              Get in touch <Mail size={16} />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="flex items-center gap-6 mt-12"
          >
            {[
              { icon: Github, href: "https://github.com/fongziqi" },
              { icon: Linkedin, href: "https://www.linkedin.com/in/fongziqi/" },
              { icon: Mail, href: "mailto:fongziqi123@gmail.com" },
            ].map(({ icon: Icon, href }) => (
              <motion.a
                key={href}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                whileHover={{ y: -3, color: "#00ff88" }}
                className="text-muted-foreground transition-colors"
              >
                <Icon size={20} />
              </motion.a>
            ))}
            <span className="h-px flex-1 max-w-24 bg-border" />
            <span className="text-xs text-muted-foreground font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Selangor, Malaysia</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-px h-12 bg-gradient-to-b from-transparent to-primary/50"
          />
        </motion.div>
      </section>

      {/* Stats bar */}
      <RevealSection>
        <div className="border-y border-border bg-card/30 relative overflow-hidden">
          {/* Animated accent line */}
          <motion.div
            className="absolute bottom-0 left-0 h-px bg-primary"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: 6, suffix: " +", label: "projects built" },
              { val: 8, suffix: "", label: "programming languages" },
              { val: 3, suffix: ".48", label: "CGPA" },
              { val: 12, suffix: " weeks", label: "internship from 21 Sep 2026" },
            ].map(({ val, suffix, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-primary mb-1" style={{ fontFamily: "'Orbitron', 'Share Tech Mono', monospace", textShadow: "0 0 12px rgba(0,255,136,0.4)" }}>
                  <Counter target={val} suffix={suffix} />
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* About */}
      <section id="about" className="max-w-5xl mx-auto px-6 py-24">
        <RevealSection><SectionLabel label="01" title="About" /></RevealSection>

        <div className="grid md:grid-cols-5 gap-12 mt-12">
          <RevealSection delay={0.1} className="font-tech md:col-span-3 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              I'm a Software Engineering undergraduate at Universiti Tunku Abdul Rahman (UTAR)
              with hands-on experience developing{" "}
              <span className="neon-highlight">full-stack web and mobile applications</span> using
              Laravel, React, React Native, Node.js, and SQL.
            </p>
            <p>
              I have experience in REST API development, role-based access control, client-server
              integration, and workflow automation. I'm currently developing an{" "}
              <span className="neon-highlight-tertiary">LLM-integrated employee onboarding system</span> using
              n8n as my final year project.
            </p>
            <p>
              I'm interested in <span className="neon-highlight-secondary">software engineering</span>,{" "}
              <span className="neon-highlight-secondary">backend development</span>, and{" "}
              <span className="neon-highlight-secondary">AI automation</span> roles.
            </p>
          </RevealSection>

          <RevealSection delay={0.2} className="md:col-span-2">
            <motion.div
              whileHover={{ borderColor: "rgba(0,255,136,0.4)", filter: "drop-shadow(0 0 10px rgba(0,255,136,0.2))" }}
              className="cyber-chamfer border border-border bg-background p-5 space-y-3 relative transition-all duration-150"
            >
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 -mx-5 -mt-5 mb-4 px-5 py-2.5 border-b border-border bg-card">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-primary/80" />
                <p className="ml-2 text-xs text-primary font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{"~/quick.facts"}</p>
              </div>
              {[
                ["university", "UTAR"],
                ["degree", "B. Software Engineering (Hons)"],
                ["year", "Year 3 Semester 1"],
                ["cgpa", "3.48 / 4.00"],
                ["location", "Selangor, Malaysia"],
                ["status", "open to internships"],
              ].map(([key, val], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex gap-3 text-sm"
                >
                  <span className="text-muted-foreground font-mono min-w-24" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{key}:</span>
                  <span className={val === "open to internships" ? "text-primary flex items-center gap-1.5" : "text-foreground"}>
                    {val === "open to internships" && <PulseDot />}
                    {val}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="max-w-5xl mx-auto px-6 py-24 border-t border-border">
        <RevealSection><SectionLabel label="02" title="Skills" /></RevealSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-12">
          {SKILLS.map(({ category, icon: Icon, color, rgb, items }, catIdx) => (
            <RevealSection key={category} delay={catIdx * 0.1}>
              <motion.div
                whileHover={{ y: -5, borderColor: `rgba(${rgb},0.4)`, filter: `drop-shadow(0 0 10px rgba(${rgb},0.25))` }}
                transition={{ duration: 0.15 }}
                className="cyber-chamfer border border-border bg-card p-5 h-full relative overflow-hidden group"
              >
                {/* Shimmer on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, rgba(${rgb},0.04) 0%, transparent 60%)` }}
                />
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs font-mono uppercase tracking-[0.15em]" style={{ color, fontFamily: "'Share Tech Mono', monospace" }}>{category}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill, si) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: catIdx * 0.05 + si * 0.04, duration: 0.3 }}
                      whileHover={{ scale: 1.1, color, textShadow: `0 0 6px rgba(${rgb},0.5)` }}
                      className="text-xs px-2 py-1 bg-secondary text-muted-foreground cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Academic Projects */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-24 border-t border-border">
        <RevealSection><SectionLabel label="03" title="Academic Projects" /></RevealSection>
        <ProjectGrid projects={ACADEMIC_PROJECTS} />
      </section>

      {/* Vibe Coded Projects */}
      <section id="vibe-projects" className="max-w-5xl mx-auto px-6 py-24 border-t border-border">
        <RevealSection><SectionLabel label="04" title="Vibe Coded Projects" /></RevealSection>
        <ProjectGrid projects={VIBE_PROJECTS} />

        <RevealSection delay={0.2}>
          <div className="mt-8 text-center">
            <motion.a href="https://github.com/fongziqi" target="_blank" rel="noreferrer" whileHover={{ x: 4 }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Github size={16} /> More on GitHub <ChevronRight size={14} />
            </motion.a>
          </div>
        </RevealSection>
      </section>

      {/* Experience */}
      <section id="leadership" className="max-w-5xl mx-auto px-6 py-24 border-t border-border">
        <RevealSection><SectionLabel label="05" title="Leadership" /></RevealSection>

        <div className="mt-12 space-y-12">
          {EXPERIENCE.map((exp, i) => (
            <RevealSection key={i} delay={i * 0.1}>
              <div className="grid md:grid-cols-4 gap-4 md:gap-8">
                <div className="md:col-span-1">
                  <p className="text-xs font-mono text-primary mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{exp.period}</p>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-base font-mono font-semibold uppercase tracking-wide mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{exp.role}</h3>
                  <ul className="space-y-2">
                    {exp.bullets.map((b, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: j * 0.1, duration: 0.4 }}
                        className="font-tech flex gap-3 text-sm text-muted-foreground leading-relaxed"
                      >
                        <span className="text-primary mt-1 shrink-0">›</span>{b}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>

        <RevealSection delay={0.1}>
          <div className="mt-16 border-t border-border pt-12">
            <p className="text-xs font-mono text-muted-foreground mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{"// education"}</p>
            <div className="space-y-10">
              <div className="grid md:grid-cols-4 gap-4 md:gap-8">
                <div className="md:col-span-1">
                  <p className="text-xs font-mono text-primary mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>June 2024 – June 2027</p>
                  <p className="text-sm text-muted-foreground">Universiti Tunku Abdul Rahman (UTAR)</p>
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-base font-mono font-semibold uppercase tracking-wide mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Bachelor of Software Engineering (Honours) — CGPA 3.48</h3>
                  <p className="font-tech text-sm text-muted-foreground leading-relaxed">
                    Core coursework: Data Structures & Algorithms, Object-Oriented Application Development, Software Design, Software Testing & Quality Assurance, Advanced Web Application Development, TCP/IP Network Fundamentals.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 md:gap-8">
                <div className="md:col-span-1">
                  <p className="text-xs font-mono text-primary mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>May 2023 – Jan 2024</p>
                  <p className="text-sm text-muted-foreground">Universiti Tunku Abdul Rahman (UTAR)</p>
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-base font-mono font-semibold uppercase tracking-wide mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Foundation in Arts (Management and Accountancy) — CGPA 3.55</h3>
                  <p className="font-tech text-sm text-muted-foreground leading-relaxed">
                    Awards & certifications: Malaysian University English Test (MUET) Band 4.0.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-5xl mx-auto px-6 py-24 border-t border-border">
        <RevealSection><SectionLabel label="06" title="Contact" /></RevealSection>

        <div className="mt-12 grid md:grid-cols-2 gap-12 items-start">
          <RevealSection delay={0.1}>
            <p className="font-tech text-muted-foreground leading-relaxed mb-6">
              I'm seeking a software engineering internship where I can contribute to real
              development projects, strengthen my backend and full-stack skills, and gain
              experience building reliable software systems. Available for a{" "}
              <span className="neon-highlight">12-week internship from 21 September 2026</span>.
            </p>
            <motion.a
              href="mailto:fongziqi123@gmail.com"
              whileHover={{ x: 4, color: "#00ff88" }}
              className="inline-flex items-center gap-2 text-primary text-sm font-mono"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Mail size={16} /> fongziqi123@gmail.com
            </motion.a>
          </RevealSection>

          <RevealSection delay={0.2}>
            <motion.div
              whileHover={{ borderColor: "rgba(0,255,136,0.5)", boxShadow: "0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.3)" }}
              className="border border-primary/30 bg-muted/30 backdrop-blur-md p-6 space-y-4 relative transition-all duration-150"
              style={{ boxShadow: "var(--box-shadow-neon-sm)" }}
            >
              <CornerBracket className="top-0 left-0" />
              <CornerBracket className="bottom-0 right-0 rotate-180" />
              <p className="text-xs font-mono text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{"// find me at"}</p>
              <ContactLinks />
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-border max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          © 2026 Fong Zi Qi — built with React + Tailwind
        </p>
        <div className="flex items-center gap-4">
          {[{ icon: Github, href: "https://github.com/fongziqi" }, { icon: Linkedin, href: "https://www.linkedin.com/in/fongziqi/" }].map(({ icon: Icon, href }) => (
            <motion.a key={href} href={href} whileHover={{ y: -2, color: "#00ff88" }} className="text-muted-foreground transition-colors">
              <Icon size={16} />
            </motion.a>
          ))}
        </div>
      </motion.footer>
    </div>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface ContactLink {
  icon: typeof Github;
  label: string;
  href: string;
  /** Show a "leaving the site" confirmation before opening (e.g. WhatsApp). */
  confirm?: boolean;
}

const CONTACT_LINKS: ContactLink[] = [
  { icon: Github, label: "github.com/fongziqi", href: "https://github.com/fongziqi" },
  { icon: Linkedin, label: "linkedin.com/in/fongziqi", href: "https://www.linkedin.com/in/fongziqi/" },
  { icon: Mail, label: "fongziqi123@gmail.com", href: "mailto:fongziqi123@gmail.com" },
  { icon: MessageCircle, label: "+6010-203 0186", href: "https://wa.me/60102030186", confirm: true },
];

/** Contact links; WhatsApp asks for confirmation before leaving the site. */
function ContactLinks() {
  const [pending, setPending] = useState<ContactLink | null>(null);

  return (
    <>
      {CONTACT_LINKS.map(({ icon: Icon, label, href, confirm }) => (
        <motion.a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          onClick={confirm ? (e) => { e.preventDefault(); setPending(CONTACT_LINKS.find((l) => l.label === label) ?? null); } : undefined}
          whileHover={{ x: 6, color: "#00ff88" }}
          className="flex items-center gap-3 text-sm text-muted-foreground transition-colors"
        >
          <Icon size={16} />
          <span className="font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
        </motion.a>
      ))}

      <ConfirmDialog
        pending={pending}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) window.open(pending.href, "_blank", "noopener,noreferrer");
          setPending(null);
        }}
      />
    </>
  );
}

/** Terminal-style "you're about to leave" confirmation. Radix handles focus trap, Esc, scroll lock. */
function ConfirmDialog({ pending, onClose, onConfirm }: { pending: ContactLink | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog.Root open={!!pending} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AnimatePresence>
        {pending && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{ x: "-50%", y: "-50%", boxShadow: "var(--box-shadow-neon-sm)" }}
                className="cyber-chamfer fixed left-1/2 top-1/2 z-[10001] w-[calc(100vw-2rem)] max-w-md border border-primary/40 bg-background focus:outline-none"
              >
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-card">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary/80" />
                  <p className="ml-2 text-xs text-primary font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>~/open-whatsapp</p>
                </div>

                <div className="p-6 space-y-5">
                  <Dialog.Title asChild>
                    <h2 className="text-base font-mono font-semibold uppercase tracking-wide text-foreground flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <MessageCircle size={18} className="text-primary" /> Open WhatsApp?
                    </h2>
                  </Dialog.Title>
                  <p className="font-tech text-sm text-muted-foreground leading-relaxed">
                    This opens a WhatsApp chat with Fong Zi Qi (<span className="neon-highlight">{pending.label}</span>) in a new tab. Continue?
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <Dialog.Close asChild>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="cyber-chamfer-sm px-4 py-2 border border-border text-muted-foreground text-xs font-mono uppercase tracking-wider hover:text-foreground transition-colors duration-150"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Cancel
                      </motion.button>
                    </Dialog.Close>
                    <motion.button
                      onClick={onConfirm}
                      whileHover={{ scale: 1.04, filter: "brightness(1.1) drop-shadow(0 0 12px rgba(0,255,136,0.5))" }}
                      whileTap={{ scale: 0.97 }}
                      className="cyber-chamfer-sm flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-mono font-medium uppercase tracking-wider transition-all duration-150"
                    >
                      Open WhatsApp <ExternalLink size={13} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/** Terminal-panel detail view for a single project. Radix handles focus trap, Escape and scroll lock. */
function ProjectModal({
  project,
  onClose,
  triggerRef,
}: {
  project: Project | null;
  onClose: () => void;
  /** The card that opened the modal, so focus can return there on close. */
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <Dialog.Root open={!!project} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AnimatePresence>
        {project && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onCloseAutoFocus={(e) => {
                // Controlled dialog has no Radix Trigger, so return focus to the card by hand.
                e.preventDefault();
                triggerRef.current?.focus();
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{ x: "-50%", y: "-50%", boxShadow: "var(--box-shadow-neon-sm)" }}
                // Sits above .cyber-scanlines (z-9999) — CRT lines over project
                // screenshots read as image artefacts, not texture.
                className="cyber-chamfer fixed left-1/2 top-1/2 z-[10001] w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto border border-primary/40 bg-background focus:outline-none"
              >
                {/* Terminal title bar */}
                <div className="sticky top-0 z-10 flex items-center gap-2 px-5 py-2.5 border-b border-border bg-card">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary/80" />
                  <p className="ml-2 text-xs text-primary font-mono truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    ~/{slug(project.title)}
                  </p>
                  <Dialog.Close asChild>
                    <motion.button
                      whileHover={{ scale: 1.15, color: "#00ff88" }}
                      whileTap={{ scale: 0.92 }}
                      aria-label="Close project details"
                      className="ml-auto text-muted-foreground transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                  </Dialog.Close>
                </div>

                <div className="p-6 space-y-6">
                  {/* Heading */}
                  <div>
                    {project.tag && (
                      <span className="text-xs text-primary font-mono mb-1 flex items-center gap-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {project.highlight && <PulseDot />} {project.tag}
                      </span>
                    )}
                    <Dialog.Title asChild>
                      <h2
                        className="text-lg md:text-xl font-mono font-semibold uppercase tracking-wide text-foreground"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {project.title}
                      </h2>
                    </Dialog.Title>
                    {project.period && (
                      <p className="font-tech text-xs text-muted-foreground mt-1.5">{project.period}</p>
                    )}
                  </div>

                  {/* Screenshots — capped by height so portrait phone captures don't blow out the panel */}
                  {project.images && project.images.length > 0 && (
                    <div className="space-y-3">
                      {project.images.map((src) => (
                        <div key={src} className="cyber-chamfer-sm border border-border bg-card/40 p-2 flex justify-center">
                          <img
                            src={src}
                            alt={`${project.title} screenshot`}
                            loading="lazy"
                            className="max-h-[380px] w-auto max-w-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <ModalSection label="// overview">
                    <p className="font-tech text-sm text-muted-foreground leading-relaxed">{project.desc}</p>
                  </ModalSection>

                  {project.why && (
                    <ModalSection label="// why_i_built_it">
                      <p className="font-tech text-sm text-muted-foreground leading-relaxed">{project.why}</p>
                    </ModalSection>
                  )}

                  {project.learned && project.learned.length > 0 && (
                    <ModalSection label="// what_i_learned">
                      <ul className="space-y-2">
                        {project.learned.map((item) => (
                          <li key={item} className="font-tech flex gap-3 text-sm text-muted-foreground leading-relaxed">
                            <span className="text-primary mt-0.5 shrink-0">›</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </ModalSection>
                  )}

                  <ModalSection label="// tools_used">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t) => {
                        const neon = techNeon(t);
                        return (
                          <span
                            key={t}
                            className="text-xs font-mono px-2 py-0.5 border"
                            style={{ fontFamily: "'JetBrains Mono', monospace", color: neon.hex, borderColor: `rgba(${neon.rgb},0.25)` }}
                          >
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  </ModalSection>

                  {(project.github || project.live) && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                      {project.github && (
                        <motion.a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ scale: 1.03, filter: "drop-shadow(0 0 8px rgba(0,255,136,0.5))" }}
                          whileTap={{ scale: 0.97 }}
                          className="cyber-chamfer-sm mt-4 inline-flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary text-xs font-mono uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <Github size={14} /> View source
                        </motion.a>
                      )}
                      {project.live && (
                        <motion.a
                          href={project.live}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="cyber-chamfer-sm mt-4 inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground text-xs font-mono uppercase tracking-wider transition-colors duration-150"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <ExternalLink size={14} /> Live demo
                        </motion.a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function ModalSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-primary font-mono mb-2.5" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{label}</p>
      {children}
    </div>
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = (project: Project, el: HTMLElement) => {
    triggerRef.current = el;
    setActive(project);
  };

  return (
    <div className="grid md:grid-cols-2 gap-5 mt-12">
      {projects.map((project, i) => (
        <RevealSection key={project.title} delay={i * 0.1}>
          <motion.div
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`${project.title} — view details`}
            onClick={(e) => open(project, e.currentTarget as HTMLElement)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(project, e.currentTarget as HTMLElement);
              }
            }}
            whileHover={{
              y: -6,
              borderColor: project.highlight ? "rgba(0,255,136,0.6)" : "rgba(0,255,136,0.3)",
              filter: "drop-shadow(0 0 12px rgba(0,255,136,0.25))",
            }}
            transition={{ duration: 0.15 }}
            className={`cyber-chamfer border p-6 flex flex-col gap-4 h-full relative overflow-hidden group cursor-pointer ${project.highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
              style={{ background: "linear-gradient(135deg, rgba(0,255,136,0.04) 0%, transparent 50%)" }}
            />
            <div className="flex items-start justify-between">
              <div>
                {project.tag && (
                  <span className="text-xs text-primary font-mono mb-1 flex items-center gap-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {project.highlight && <PulseDot />} {project.tag}
                  </span>
                )}
                <h3 className="text-base font-mono font-semibold uppercase tracking-wide text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {project.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 mt-1">
                {project.github && (
                  <motion.a href={project.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`${project.title} source on GitHub`} whileHover={{ scale: 1.2, color: "#00ff88" }} className="text-muted-foreground transition-colors"><Github size={17} /></motion.a>
                )}
                {project.live && (
                  <motion.a href={project.live} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`${project.title} live demo`} whileHover={{ scale: 1.2, color: "#00ff88" }} className="text-muted-foreground transition-colors"><ExternalLink size={17} /></motion.a>
                )}
              </div>
            </div>
            <p className="font-tech text-sm text-muted-foreground leading-relaxed flex-1">{project.desc}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {project.tech.map((t) => {
                const neon = techNeon(t);
                return (
                  <motion.span
                    key={t}
                    whileHover={{ scale: 1.06, borderColor: `rgba(${neon.rgb},0.7)`, textShadow: `0 0 6px rgba(${neon.rgb},0.5)` }}
                    className="text-xs font-mono px-2 py-0.5 border cursor-default"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: neon.hex,
                      borderColor: `rgba(${neon.rgb},0.25)`,
                    }}
                  >
                    {t}
                  </motion.span>
                );
              })}
            </div>

            {/* Affordance — the whole card is the trigger */}
            <span
              aria-hidden
              className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors duration-150 flex items-center gap-1.5 pt-1"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              $ read_more <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </span>
          </motion.div>
        </RevealSection>
      ))}

      <ProjectModal project={active} onClose={() => setActive(null)} triggerRef={triggerRef} />
    </div>
  );
}

function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-mono text-primary" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{label}.</span>
      <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: "'Orbitron', 'Share Tech Mono', monospace", textShadow: "0 0 14px rgba(0,255,136,0.18)" }}>{title}</h2>
      <motion.div
        className="h-px flex-1 bg-border origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
