import { useState, useEffect, useRef } from "react";

import {
  ArrowRight, CheckCircle2, Users, Brain, MessageSquare, Calendar,
  FileText, Plus, Sparkles, Zap, Target, Activity, Stethoscope,
  ShieldCheck, HeartPulse, Syringe, Pill, Microscope, ClipboardPlus,
  ScanHeart, Cross, Thermometer, ShieldPlus, FlaskConical, CircleDot,
  Star, TrendingUp, BarChart2, Bell, Menu, X, Mail, Phone, MapPin,
  Linkedin, Twitter, Facebook, Instagram
} from "lucide-react";

import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

// =========================================================
// GLOBAL RESPONSIVE STYLES (with improved mobile text contrast)
// =========================================================
const globalStyles = `
  * { margin:0; padding:0; box-sizing:border-box; }
  .animated-bg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
  section, nav, footer { position:relative; z-index:1; }

  /* ── Improved Typography scale for readability on mobile ── */
  :root {
    --fs-hero: clamp(32px, 6vw, 58px);
    --fs-h2:   clamp(26px, 4vw, 46px);
    --fs-h3:   clamp(18px, 2.2vw, 22px);
    --fs-body: clamp(15px, 1.5vw, 18px);
    --fs-sm:   clamp(13px, 1.2vw, 15px);
    --fs-xs:   clamp(12px, 1vw, 14px);
  }

  /* Ensure sufficient contrast on all text */
  body {
    color: #1e293b;
    background-color: #f0fdf4;
  }

  /* Desktop nav links */
  .desktop-nav { display: flex; gap: 3rem; align-items: center; }
  .desktop-cta { display: flex; gap: 12px; align-items: center; }
  .hamburger-btn { display: none; background: none; border: none; cursor: pointer; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 12px; background: rgba(16,185,129,0.1); color: #10b981; transition: all 0.2s; }
  .hamburger-btn:hover { background: rgba(16,185,129,0.2); }

  @media (max-width: 1024px) {
    .desktop-nav { display: none !important; }
    .desktop-cta { display: none !important; }
    .hamburger-btn { display: flex !important; }
  }

  /* Responsive grids (unchanged) */
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center; }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .feat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
  .svc-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 40px; }
  .price-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
  .test-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 48px; }

  @media (max-width: 1024px) {
    .feat-grid { grid-template-columns: repeat(2,1fr); }
    .svc-grid  { grid-template-columns: repeat(2,1fr); }
    .footer-grid { grid-template-columns: repeat(2,1fr); gap: 40px; }
  }

  @media (max-width: 768px) {
    .hero-grid  { grid-template-columns: 1fr; gap: 30px; text-align: center; }
    .about-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
    .feat-grid  { grid-template-columns: 1fr; }
    .svc-grid   { grid-template-columns: 1fr 1fr; }
    .stats-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
    .price-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
    .test-grid  { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }

    .hero-image-col { height: 340px !important; }
    .float-cards { display: none; }
    .hero-notify { display: none !important; }
    .trusted-row { gap: 12px !important; flex-wrap: wrap; justify-content: center; }
    .badge-row   { gap: 12px !important; flex-wrap: wrap; justify-content: center; }

    .cta-btns { flex-direction: column; align-items: center; }
    .cta-btns a { width: 100%; max-width: 320px; justify-content: center; }

    .footer-bottom { flex-direction: column; text-align: center; gap: 16px; }
    .footer-links  { flex-wrap: wrap; justify-content: center; gap: 16px !important; }
  }

  @media (max-width: 480px) {
    .svc-grid  { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
    .section-pad { padding: 64px 20px !important; }
    .hero-pad   { padding-top: 88px !important; padding-bottom: 48px !important; }
    .container  { padding: 0 20px !important; }
  }

  /* Additional mobile text fixes */
  @media (max-width: 640px) {
    h1, .hero-text { text-align: center; }
    p, .description { text-align: center; }
    .badge-row, .trusted-row { justify-content: center; }
    .about-grid ul li { justify-content: center; text-align: left; }
  }
`;

// =========================================================
// ANIMATED BACKGROUND (unchanged, premium)
// =========================================================
function AnimatedBackground() {
  const icons = [
    { I: Stethoscope, top: "8%", left: "4%", sz: 88, col: "#10b981", dur: 8 },
    { I: Microscope, top: "14%", right: "6%", sz: 72, col: "#06b6d4", dur: 10 },
    { I: Pill, top: "44%", right: "4%", sz: 72, col: "#ec4899", dur: 11 },
    { I: ClipboardPlus, top: "60%", left: "5%", sz: 64, col: "#3b82f6", dur: 13 },
    { I: ScanHeart, top: "28%", left: "40%", sz: 72, col: "#ef4444", dur: 12 },
    { I: FlaskConical, top: "6%", left: "52%", sz: 56, col: "#8b5cf6", dur: 9 },
    { I: Activity, top: "12%", left: "28%", sz: 48, col: "#34d399", dur: 9 },
    { I: Cross, top: "20%", right: "26%", sz: 44, col: "#22d3ee", dur: 8 },
    { I: Stethoscope, bottom: "6%", right: "6%", sz: 56, col: "#10b981", dur: 10 },
    { I: HeartPulse, top: "18%", left: "62%", sz: 36, col: "#fb7185", dur: 9 },
  ];

  return (
    <div className="animated-bg">
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#f0fff8 0%,#ecfff7 50%,#f0fdfa 100%)" }} />
      <motion.div animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -150, left: -150, width: 700, height: 700, background: "rgba(16,185,129,0.18)", borderRadius: "50%", filter: "blur(140px)" }} />
      <motion.div animate={{ x: [0, -80, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: -200, right: -150, width: 750, height: 750, background: "rgba(6,182,212,0.15)", borderRadius: "50%", filter: "blur(160px)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(to right,#10b981 1px,transparent 1px),linear-gradient(to bottom,#10b981 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      {[0, 1, 2, 3, 4].map(i => (
        <motion.div key={i} initial={{ x: "-100%" }} animate={{ x: "200%" }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear", delay: i * 2 }}
          style={{ position: "absolute", top: `${8 + i * 18}%`, width: 480, height: 120, opacity: 0.07 }}>
          <svg width="480" height="120" viewBox="0 0 480 120" fill="none">
            <path d="M0 60 L50 60 L80 22 L110 98 L150 32 L195 60 L240 60 L270 18 L310 102 L350 48 L480 60"
              stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      ))}

      {icons.map((item, idx) => {
        const Icon = item.I;
        return (
          <motion.div key={idx}
            animate={{ y: [-16, 16, -16], rotate: [0, 5, -5, 0], x: [-5, 5, -5] }}
            transition={{ duration: item.dur, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
            style={{ position: "absolute", top: item.top, left: item.left, right: item.right, bottom: item.bottom }}>
            <div style={{
              width: item.sz, height: item.sz, borderRadius: "30%",
              background: "rgba(255,255,255,0.35)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon size={item.sz * 0.45} color={item.col} />
            </div>
          </motion.div>
        );
      })}

      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div key={`p${i}`}
          animate={{ y: [-25, 25, -25], opacity: [0.05, 0.2, 0.05], scale: [1, 1.5, 1] }}
          transition={{ duration: 4 + (i % 6), repeat: Infinity, delay: i * 0.15 }}
          style={{ position: "absolute", left: `${(i * 9) % 100}%`, top: `${(i * 11) % 100}%` }}>
          <CircleDot size={3 + (i % 5)} color="rgba(16,185,129,0.4)" />
        </motion.div>
      ))}

      <motion.div animate={{ y: ["-10%", "110%"] }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", left: 0, right: 0, height: 96, background: "linear-gradient(to bottom,transparent,rgba(52,211,153,0.09),transparent)", filter: "blur(20px)" }} />

      <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ position: "absolute", top: "36%", left: "47%" }}>
        <HeartPulse size={160} color="#10b981" />
      </motion.div>
    </div>
  );
}

// =========================================================
// FLOATING STAT CARD (unchanged)
// =========================================================
function FloatCard({ icon: Icon, label, value, sub, color, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      style={{ ...style, position: "absolute", zIndex: 10 }}
      className="float-cards"
    >
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
          borderRadius: 20, padding: "14px 18px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12),0 4px 16px rgba(16,185,129,0.1)",
          border: "1px solid rgba(255,255,255,0.8)",
          display: "flex", alignItems: "center", gap: 12, minWidth: 170
        }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginTop: 2 }}>{label}</div>
          {sub && <div style={{ fontSize: 10, fontWeight: 600, color: "#10b981", marginTop: 1 }}>{sub}</div>}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =========================================================
// NAVBAR — fixed glassmorphism, right-slide mobile menu
// =========================================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025 && mobileMenuOpen) {
        setMobileMenuOpen(false);
        document.body.style.overflow = "";
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const toggleMenu = () => {
    if (!mobileMenuOpen) {
      setMobileMenuOpen(true);
      document.body.style.overflow = "hidden";
    } else {
      setMobileMenuOpen(false);
      document.body.style.overflow = "";
    }
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";
  };

  const navLinks = ["Home", "About", "Features", "Solutions", "Pricing", "Contact"];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(16, 185, 129, 0.25)",
        boxShadow: scrolled ? "0 8px 32px rgba(0, 0, 0, 0.08)" : "0 2px 12px rgba(0, 0, 0, 0.04)",
        padding: "0 32px", height: "80px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/logo.png"
            alt="Bireena Health"
            style={{ height: 55, width: "auto", objectFit: "contain" }}
            onError={(e) => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<div style="width:48px;height:48px;background:linear-gradient(135deg,#10b981,#059669);border-radius:14px;display:flex;align-items:center;justify-content:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z"/></svg></div>'; }}
          />
        </div>

        <div className="desktop-nav">
          {navLinks.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`}
              style={{
                fontSize: "1rem", fontWeight: 600, color: "#1e293b",
                textDecoration: "none", transition: "all 0.2s", position: "relative",
                paddingBottom: "4px"
              }}
              onMouseEnter={(e) => { e.target.style.color = "#10b981"; }}
              onMouseLeave={(e) => { e.target.style.color = "#1e293b"; }}>
              {link}
              <span style={{
                position: "absolute", bottom: 0, left: 0, width: 0, height: 2,
                background: "#10b981", borderRadius: 4, transition: "width 0.2s"
              }} className="nav-hover-line" />
            </a>
          ))}
        </div>

        <div className="desktop-cta">
          <a href="/login" style={{ fontSize: "0.95rem", fontWeight: 700, color: "#475569", textDecoration: "none" }}>Sign In</a>
          <motion.a href="/login" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)", color: "white",
              padding: "10px 24px", borderRadius: 40, fontSize: "0.95rem", fontWeight: 700,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 8px 20px rgba(16,185,129,0.3)"
            }}>
            Get Started <ArrowRight size={14} />
          </motion.a>
        </div>

        <button className="hamburger-btn" onClick={toggleMenu}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(6px)", zIndex: 101, cursor: "pointer"
              }}
              onClick={closeMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: "fixed", top: 0, right: 0, width: "min(320px, 80%)",
                height: "100vh", background: "rgba(10, 15, 28, 0.98)",
                backdropFilter: "blur(24px)", zIndex: 102, padding: "32px 24px",
                display: "flex", flexDirection: "column", gap: 32,
                borderLeft: "1px solid rgba(16,185,129,0.2)",
                boxShadow: "-8px 0 32px rgba(0,0,0,0.3)"
              }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={closeMenu} style={{
                  background: "rgba(255,255,255,0.08)", border: "none",
                  width: 44, height: 44, borderRadius: 30, display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                  color: "white", fontSize: 20
                }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {navLinks.map(link => (
                  <a key={link} href={`#${link.toLowerCase()}`} onClick={closeMenu}
                    style={{
                      fontSize: "1.6rem", fontWeight: 600, color: "#f1f5f9",
                      textDecoration: "none", transition: "0.2s", display: "inline-block"
                    }}
                    onMouseEnter={(e) => e.target.style.color = "#10b981"}
                    onMouseLeave={(e) => e.target.style.color = "#f1f5f9"}>
                    {link}
                  </a>
                ))}
              </div>
              <motion.a href="/login" whileTap={{ scale: 0.97 }} onClick={closeMenu}
                style={{
                  background: "linear-gradient(135deg,#10b981,#059669)", color: "white",
                  padding: "14px 24px", borderRadius: 40, fontSize: "1rem",
                  fontWeight: 700, textDecoration: "none", textAlign: "center",
                  marginTop: 20
                }}>
                Get Started <ArrowRight size={16} style={{ display: "inline", marginLeft: 8 }} />
              </motion.a>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-nav a:hover .nav-hover-line { width: 100%; }
      `}</style>
    </>
  );
}

// =========================================================
// HERO (with improved text contrast and mobile readability)
// =========================================================
function Hero() {
  return (
    <section id="home" className="hero-pad section-pad" style={{ paddingTop: 110, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
      <div className="container" style={{ maxWidth: 1330, margin: "0 auto", padding: "0 24px" }}>
        <div className="hero-grid">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "7px 18px", borderRadius: 100,
                background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
                fontSize: "var(--fs-xs)", fontWeight: 800, color: "#059669", letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 24
              }}>
              <Sparkles size={14} /> Intelligent Healthcare Platform
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ fontSize: "var(--fs-hero)", fontWeight: 900, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-1.5px", marginBottom: 20 }}>
              Simplifying Healthcare<br />
              <span style={{ color: "#10b981", fontStyle: "italic" }}>with Intelligent Care</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ fontSize: "var(--fs-body)", color: "#334155", lineHeight: 1.7, marginBottom: 32, maxWidth: 540 }}>
              Bireena Health is an intelligent clinical platform that helps healthcare providers deliver better care, streamline workflows, and improve patient outcomes.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
              <motion.a href="/login" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                style={{
                  background: "linear-gradient(135deg,#10b981,#059669)", color: "white",
                  padding: "14px 28px", borderRadius: 14, fontSize: "var(--fs-body)", fontWeight: 800,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 12px 32px rgba(16,185,129,0.35)"
                }}>
                Get Started Free <ArrowRight size={16} />
              </motion.a>
              <motion.a href="#contact" whileHover={{ scale: 1.03 }}
                style={{
                  background: "white", color: "#0f172a",
                  padding: "14px 28px", borderRadius: 14, fontSize: "var(--fs-body)", fontWeight: 800,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                  border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
                }}>
                <Calendar size={16} color="#10b981" /> Book a Demo
              </motion.a>
            </motion.div>
            <motion.div className="badge-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { label: "HIPAA Compliant", icon: ShieldCheck },
                { label: "Secure & Encrypted", icon: ShieldPlus },
                { label: "Trusted by Providers", icon: Users },
              ].map(({ label, icon: Icon }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 700, color: "#475569" }}>
                  <Icon size={15} color="#10b981" /> {label}
                </div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-image-col"
            style={{ position: "relative", height: 520 }}>
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: 32, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.18)" }}>
              <img src="1.jpeg" alt="Healthcare professional"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => {
                  e.target.style.display = "none";
                  e.target.parentElement.style.background = "linear-gradient(135deg,#dcfce7,#d1fae5,#a7f3d0)";
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(15,23,42,0.3) 0%,transparent 60%)" }} />
            </motion.div>
            <FloatCard icon={Users} label="Total Patients" value="1,248" sub="↑ 12% vs yesterday" color="#10b981" delay={0.6} style={{ top: 24, left: -28 }} />
            <FloatCard icon={Calendar} label="Appointments" value="328" sub="↑ 10% vs yesterday" color="#3b82f6" delay={0.8} style={{ top: "40%", right: -24 }} />
            <FloatCard icon={FileText} label="New Records" value="85" sub="↑ 10% vs yesterday" color="#8b5cf6" delay={1.0} style={{ bottom: 24, left: 20 }} />
            <motion.div className="hero-notify"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
              style={{ position: "absolute", bottom: 28, right: -20, zIndex: 10 }}>
              <motion.div
                animate={{ y: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "rgba(15,23,42,0.9)", backdropFilter: "blur(20px)",
                  borderRadius: 18, padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxWidth: 200
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", letterSpacing: "0.1em" }}>CLINICAL ASSISTANT</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, margin: 0 }}>
                  Patient care gap detected for Patient ID: 102026
                </p>
                <div style={{ marginTop: 8, padding: "5px 10px", borderRadius: 8, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 11, fontWeight: 700, color: "#34d399", display: "inline-block" }}>
                  View Recommendation →
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          style={{ marginTop: 60 }}>
          <p style={{ textAlign: "center", fontSize: "var(--fs-xs)", fontWeight: 800, color: "#5b6b66", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>
            Trusted by Leading Healthcare Organizations
          </p>
          <div className="trusted-row" style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            {["MedCare Hospitals", "Curewell Health", "HealthFirst Clinic", "Wellness Group", "PrimeCare Medical"].map(name => (
              <div key={name} style={{
                padding: "10px 20px", borderRadius: 12,
                background: "rgba(255,255,255,0.85)", border: "1px solid rgba(16,185,129,0.2)",
                fontSize: "var(--fs-xs)", fontWeight: 800, color: "#334155",
                backdropFilter: "blur(10px)"
              }}>
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =========================================================
// SECTION HEADING (improved contrast)
// =========================================================
function SH({ tag, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 60 }}>
      <span style={{
        display: "inline-block", padding: "5px 18px", borderRadius: 100,
        background: "rgba(16,185,129,0.12)", color: "#059669",
        fontSize: "var(--fs-xs)", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16
      }}>{tag}</span>
      <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.5px", marginBottom: 14, lineHeight: 1.2 }}>{title}</h2>
      <p style={{ fontSize: "var(--fs-body)", color: "#475569", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>{sub}</p>
    </div>
  );
}

// =========================================================
// ABOUT, FEATURES, SERVICES, STATS, PRICING, TESTIMONIALS, CTA
// (minor contrast fixes applied)
// =========================================================
function About() {
  const items = [
    { icon: Zap, text: "Auto-categorization of 10,000+ medical records" },
    { icon: Activity, text: "Real-time clinical anomaly & fraud detection" },
    { icon: Target, text: "Resource and care gap identification" },
    { icon: Brain, text: "Patient intake and triage automation" },
  ];
  return (
    <section id="about" className="section-pad" style={{ padding: "100px 24px", background: "white" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="about-grid">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
              fontSize: "var(--fs-xs)", fontWeight: 900, color: "#059669", letterSpacing: "0.15em",
              textTransform: "uppercase", marginBottom: 24
            }}>
              <Sparkles size={12} /> What We Provide
            </div>
            <h2 style={{ fontSize: "var(--fs-h2)", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.5px", lineHeight: 1.2, marginBottom: 20 }}>
              Your 24/7 Virtual<br /><span style={{ color: "#10b981" }}>Clinical Assistant</span>
            </h2>
            <p style={{ fontSize: "var(--fs-body)", color: "#475569", lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>
              Our intelligent platform works around the clock to automate clinical tasks, reduce administrative burden, and help your care teams focus on what matters most — patient care.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map(({ icon: Icon, text }) => (
                <li key={text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color="#10b981" />
                  </div>
                  <span style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "#0f172a" }}>{text}</span>
                </li>
              ))}
            </ul>
            <motion.a href="#features" whileHover={{ scale: 1.05 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 14,
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "white", fontSize: "var(--fs-body)", fontWeight: 800, textDecoration: "none",
                boxShadow: "0 12px 32px rgba(16,185,129,0.3)"
              }}>
              Explore All Features <ArrowRight size={16} />
            </motion.a>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{
              background: "white", borderRadius: 28, padding: 28,
              boxShadow: "0 30px 80px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#f87171", "#fbbf24", "#34d399"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                </div>
                <span style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.15em", textTransform: "uppercase" }}>Clinical Intelligence Feed</span>
                <div style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(16,185,129,0.12)", fontSize: 10, fontWeight: 800, color: "#059669", border: "1px solid rgba(16,185,129,0.2)" }}>Live</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.08)", borderRadius: 14, padding: 14, marginBottom: 16, border: "1px solid rgba(16,185,129,0.15)" }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "#059669" }}>Analyzing clinical health...</span>
              </div>
              {[
                { icon: Zap, color: "#ef4444", bg: "#fef2f2", title: "Anomaly Detected", desc: "Duplicate record of 'Patient #4412' detected for Ward 'Emer-A'.", time: "Just now" },
                { icon: Activity, color: "#10b981", bg: "#f0fdf4", title: "Patient Intake Completed", desc: "New patient intake completed and added to system records.", time: "10 mins ago" },
                { icon: Target, color: "#8b5cf6", bg: "#faf5ff", title: "Care Gap Identified", desc: "Preventive screening due for Patient ID: 102026.", time: "1 hr ago" },
              ].map(({ icon: Icon, color, bg, title, desc, time }) => (
                <motion.div key={title} whileHover={{ scale: 1.02, x: 4 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    background: "white", borderRadius: 16, padding: 16, marginBottom: 12,
                    border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", cursor: "pointer"
                  }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8 }}>
                      <span style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "#0f172a" }}>{title}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", whiteSpace: "nowrap" }}>{time}</span>
                    </div>
                    <p style={{ fontSize: "var(--fs-xs)", color: "#475569", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <a href="#about" style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "#10b981", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  View All Notifications <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: Brain, title: "Smart Automation", desc: "Reduce admin work with intelligent assistants that handle documentation and follow-ups.", color: "#10b981", bg: "#f0fdf4" },
    { icon: Activity, title: "Real-time Clinical Insights", desc: "Get actionable insights at the point of care and improve decision-making.", color: "#3b82f6", bg: "#eff6ff" },
    { icon: ShieldCheck, title: "Secure & Compliant", desc: "End-to-end encryption and HIPAA-compliant infrastructure for peace of mind.", color: "#8b5cf6", bg: "#faf5ff" },
    { icon: CheckCircle2, title: "Seamless Connectivity", desc: "Integrate with EHRs, labs, pharmacies, and other tools you already use.", color: "#f97316", bg: "#fff7ed" },
  ];
  return (
    <section id="features" className="section-pad" style={{ padding: "100px 24px", background: "#f8fafc" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SH tag="Why Choose Us" title="Built for Modern Healthcare" sub="Powerful features that set us apart from the rest." />
        <div className="feat-grid">
          {feats.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: "0 30px 60px rgba(0,0,0,0.12)" }}
              style={{
                background: "white", borderRadius: 24, padding: 28,
                border: "1px solid #e2e8f0", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)", transition: "box-shadow 0.3s"
              }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Icon size={26} color={color} />
              </div>
              <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: 800, color: "#0f172a", marginBottom: 10, letterSpacing: "-0.3px" }}>{title}</h3>
              <p style={{ fontSize: "var(--fs-sm)", color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
              <a href="#contact" style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: color, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Learn more <ArrowRight size={12} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const svcs = [
    { icon: FileText, title: "EHR Automation", desc: "Smart EHR automation that saves time and reduces manual entry." },
    { icon: FlaskConical, title: "Pharmacy & Labs", desc: "Integrated ordering and results management in one place." },
    { icon: BarChart2, title: "Financial Reporting", desc: "Real-time financial insights and performance analytics." },
    { icon: Calendar, title: "Appointment Management", desc: "Intelligent scheduling and patient reminders." },
    { icon: Brain, title: "Clinical Insights", desc: "Data-driven insights to improve care quality and outcomes." },
    { icon: Users, title: "Care Coordination", desc: "Seamless communication across the care team." },
    { icon: MessageSquare, title: "Patient Engagement", desc: "Empower patients with portals, updates, and secure messaging." },
    { icon: Activity, title: "Telehealth Solutions", desc: "Built-in telehealth tools for virtual care delivery." },
  ];
  return (
    <section id="solutions" className="section-pad" style={{ padding: "100px 24px", background: "white" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SH tag="Our Solutions" title="Comprehensive Medical Services"
          sub="A complete suite of solutions to streamline operations, improve efficiency, and elevate patient experience." />
        <div className="svc-grid">
          {svcs.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
              style={{ background: "#f8fafc", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: "var(--fs-xs)", color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>{desc}</p>
              <a href="#contact" style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: "#10b981", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                Learn more <ArrowRight size={11} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { icon: Users, value: "20K+", label: "Healthcare Providers" },
    { icon: HeartPulse, value: "1M+", label: "Patients Managed" },
    { icon: FileText, value: "50M+", label: "Clinical Records" },
    { icon: Activity, value: "99.9%", label: "Uptime & Reliability" },
  ];
  return (
    <div style={{ background: "linear-gradient(135deg,#0a2f1a,#052014)", padding: "60px 24px" }}>
      <div className="container stats-grid" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={24} color="#10b981" />
            </div>
            <div style={{ fontSize: "clamp(32px,4vw,44px)", fontWeight: 900, color: "white", letterSpacing: "-1px" }}>{value}</div>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(false);
  const plans = [
    { name: "Starter", desc: "For small practices getting started", mo: 49, yr: 39, feats: ["Up to 1,000 patients", "EHR Integration", "Basic Assistant"] },
    { name: "Professional", desc: "For growing practices", mo: 129, yr: 99, feats: ["Up to 10,000 patients", "Advanced Assistant", "Reports & Analytics", "Priority Support"], popular: true },
    { name: "Enterprise", desc: "For large organizations", mo: null, yr: null, feats: ["Unlimited patients", "Custom integrations", "Dedicated Support"] },
  ];
  return (
    <section id="pricing" className="section-pad" style={{ padding: "100px 24px", background: "#f8fafc" }}>
      <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SH tag="Pricing" title="Simple, Transparent Pricing"
          sub="Transparent pricing with no hidden fees. Scale effortlessly as your practice grows." />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: yearly ? "#94a3b8" : "#0f172a" }}>Monthly</span>
          <motion.button onClick={() => setYearly(!yearly)}
            style={{ width: 52, height: 28, borderRadius: 100, background: "#10b981", border: "none", cursor: "pointer", padding: 3, position: "relative", display: "flex", alignItems: "center" }}>
            <motion.div animate={{ x: yearly ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{ width: 22, height: 22, borderRadius: "50%", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
          </motion.button>
          <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: yearly ? "#0f172a" : "#94a3b8", display: "flex", gap: 6, alignItems: "center" }}>
            Yearly
            <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(16,185,129,0.15)", color: "#059669", fontSize: 10, fontWeight: 800 }}>Save 20%</span>
          </span>
        </div>
        <div className="price-grid">
          {plans.map(({ name, desc, mo, yr, feats, popular }) => (
            <motion.div key={name} whileHover={{ y: -8 }}
              style={{
                background: popular ? "linear-gradient(135deg,#0a2f1a,#052c18)" : "white",
                borderRadius: 24, padding: 32,
                border: popular ? "none" : "1px solid #e2e8f0",
                boxShadow: popular ? "0 30px 80px rgba(16,185,129,0.25)" : "0 4px 20px rgba(0,0,0,0.05)",
                position: "relative", overflow: "hidden"
              }}>
              {popular && <div style={{ position: "absolute", top: 16, right: 16, padding: "4px 12px", borderRadius: 100, background: "rgba(16,185,129,0.3)", color: "#34d399", fontSize: 10, fontWeight: 900, border: "1px solid rgba(16,185,129,0.4)" }}>Most Popular</div>}
              <h3 style={{ fontSize: "var(--fs-xs)", fontWeight: 900, color: popular ? "#6ee7b7" : "#94a3b8", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{name}</h3>
              <p style={{ fontSize: "var(--fs-xs)", color: popular ? "rgba(255,255,255,0.6)" : "#64748b", marginBottom: 20 }}>{desc}</p>
              <div style={{ marginBottom: 28 }}>
                {mo ? (
                  <>
                    <span style={{ fontSize: "clamp(32px,4vw,44px)", fontWeight: 900, color: popular ? "white" : "#0f172a", letterSpacing: "-1px" }}>${yearly ? yr : mo}</span>
                    <span style={{ fontSize: "var(--fs-xs)", color: popular ? "rgba(255,255,255,0.5)" : "#94a3b8", marginLeft: 4 }}>/month</span>
                  </>
                ) : (
                  <span style={{ fontSize: "clamp(28px,3.5vw,38px)", fontWeight: 900, color: popular ? "white" : "#0f172a" }}>Custom</span>
                )}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {feats.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--fs-sm)", fontWeight: 600, color: popular ? "rgba(255,255,255,0.85)" : "#475569" }}>
                    <CheckCircle2 size={15} color="#10b981" /> {f}
                  </li>
                ))}
              </ul>
              <motion.a href={mo ? "/login" : "#contact"} whileHover={{ scale: 1.03 }}
                style={{
                  display: "block", textAlign: "center", padding: "13px", borderRadius: 12,
                  background: popular ? "#10b981" : "white",
                  color: popular ? "white" : "#0f172a",
                  fontSize: "var(--fs-sm)", fontWeight: 800, textDecoration: "none",
                  border: popular ? "none" : "2px solid #e2e8f0"
                }}>
                {mo ? "Get Started" : "Contact Sales"}
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "Dr. Emily Carter", role: "Family Medicine", stars: 5, text: "Bireena Health has transformed the way we manage our practice. The assistant saves us hours every day." },
    { name: "Dr. James Wilson", role: "Internal Medicine", stars: 5, text: "The insights and automation help us deliver better care and improve patient satisfaction." },
    { name: "Sarah Mitchell", role: "Practice Administrator", stars: 5, text: "A must-have platform for any modern healthcare organization." },
  ];
  return (
    <section className="section-pad" style={{ padding: "100px 24px", background: "white" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SH tag="What Our Clients Say" title="Loved by Healthcare Professionals"
          sub="Trusted by thousands of healthcare providers across the country." />
        <div className="test-grid">
          {reviews.map(({ name, role, stars, text }, i) => (
            <motion.div key={name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: "#f8fafc", borderRadius: 24, padding: 28, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {Array(stars).fill(0).map((_, j) => <Star key={j} size={16} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <p style={{ fontSize: "var(--fs-body)", color: "#475569", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                "{text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{name[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: "var(--fs-sm)", fontWeight: 800, color: "#0f172a" }}>{name}</div>
                  <div style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "#64748b" }}>{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="contact" className="section-pad" style={{ padding: "100px 24px", background: "linear-gradient(135deg,#0a2f1a,#031a0e)", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: "20%", left: "-5%", width: 500, height: 500, background: "rgba(16,185,129,0.1)", borderRadius: "50%", filter: "blur(120px)" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "-5%", width: 500, height: 500, background: "rgba(6,182,212,0.08)", borderRadius: "50%", filter: "blur(120px)" }} />
      <div className="container" style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
          padding: "6px 18px", borderRadius: 100,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          fontSize: "var(--fs-xs)", fontWeight: 800, color: "#34d399", letterSpacing: "0.15em", textTransform: "uppercase"
        }}>
          <Sparkles size={12} /> Get Started Today
        </div>
        <h2 style={{ fontSize: "clamp(32px,6vw,56px)", fontWeight: 900, color: "white", letterSpacing: "-2px", lineHeight: 1.2, marginBottom: 16 }}>
          Ready to Transform<br />
          <span style={{ color: "#10b981" }}>Your Practice?</span>
        </h2>
        <p style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,0.65)", marginBottom: 48, maxWidth: 560, margin: "0 auto 48px" }}>
          Join thousands of healthcare providers already using Bireena Health to deliver smarter, better care.
        </p>
        <div className="cta-btns" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <motion.a href="/login" whileHover={{ scale: 1.05 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "16px 32px", borderRadius: 14,
              background: "linear-gradient(135deg,#10b981,#059669)",
              color: "white", fontSize: "var(--fs-body)", fontWeight: 800, textDecoration: "none",
              boxShadow: "0 16px 40px rgba(16,185,129,0.4)"
            }}>
            Get Started Free <ArrowRight size={16} />
          </motion.a>
          <motion.a href="#contact" whileHover={{ scale: 1.05 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "16px 32px", borderRadius: 14,
              background: "rgba(255,255,255,0.08)",
              color: "white", fontSize: "var(--fs-body)", fontWeight: 800, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
            <Calendar size={16} /> Book a Demo
          </motion.a>
        </div>
      </div>
    </section>
  );
}

// =========================================================
// FOOTER — fixed contrast and mobile readability
// =========================================================
function Footer() {
  return (
    <footer style={{
      background: "radial-gradient(ellipse at 30% 20%, #0a0f1c, #020408)",
      borderTop: "1px solid rgba(16,185,129,0.2)",
      padding: "70px 24px 32px"
    }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="footer-grid">
          <div>
            <div style={{ marginBottom: 20 }}>
              <img
                src="/logo.png"
                alt="Bireena Health"
                style={{
                  height: 56,
                  width: "auto",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)"
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <div style="width:56px;height:56px;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:16px">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z"/>
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
            <p style={{
              fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7, marginBottom: 24, maxWidth: 280
            }}>
              Intelligent healthcare platform empowering providers with AI-driven insights and seamless workflows.
            </p>
          </div>

          <div>
            <h4 style={{
              fontSize: "var(--fs-xs)", fontWeight: 800, color: "white",
              letterSpacing: "0.1em", marginBottom: 24, position: "relative",
              display: "inline-block"
            }}>
              Product
              <span style={{
                position: "absolute", bottom: -8, left: 0, width: 32, height: 2,
                background: "#10b981", borderRadius: 2
              }} />
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Features", "Solutions", "Pricing", "Integrations"].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} style={{
                    fontSize: "var(--fs-xs)", fontWeight: 500, color: "rgba(255,255,255,0.65)",
                    textDecoration: "none", transition: "all 0.2s"
                  }} onMouseEnter={e => e.target.style.color = "#10b981"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.65)"}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{
              fontSize: "var(--fs-xs)", fontWeight: 800, color: "white",
              letterSpacing: "0.1em", marginBottom: 24, position: "relative",
              display: "inline-block"
            }}>
              Company
              <span style={{
                position: "absolute", bottom: -8, left: 0, width: 32, height: 2,
                background: "#10b981", borderRadius: 2
              }} />
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["About Us", "Careers", "Blog", "Press Kit"].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(" ", "")}`} style={{
                    fontSize: "var(--fs-xs)", fontWeight: 500, color: "rgba(255,255,255,0.65)",
                    textDecoration: "none", transition: "all 0.2s"
                  }} onMouseEnter={e => e.target.style.color = "#10b981"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.65)"}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{
              fontSize: "var(--fs-xs)", fontWeight: 800, color: "white",
              letterSpacing: "0.1em", marginBottom: 24, position: "relative",
              display: "inline-block"
            }}>
              Connect
              <span style={{
                position: "absolute", bottom: -8, left: 0, width: 32, height: 2,
                background: "#10b981", borderRadius: 2
              }} />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <p style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)" }}>
                <MapPin size={16} color="#10b981" /> 500 Health Ave, San Francisco, CA
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)" }}>
                <Mail size={16} color="#10b981" /> hello@bireenahealth.com
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)" }}>
                <Phone size={16} color="#10b981" /> +1 (888) 372-5489
              </p>
            </div>
            <div className="social-icons" style={{ display: "flex", gap: 16 }}>
              {[
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" }
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -4, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{
                    width: 40, height: 40, borderRadius: 40,
                    background: "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.7)",
                    transition: "all 0.2s",
                    textDecoration: "none"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#10b981";
                    e.currentTarget.style.color = "#0a0f1c";
                    e.currentTarget.style.boxShadow = "0 0 12px #10b981";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{
          paddingTop: 32, marginTop: 32,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16
        }}>
          <p style={{ fontSize: "var(--fs-xs)", fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
            © 2026 Bireena Health. All rights reserved.
          </p>
          <div className="footer-links" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Preferences"].map(link => (
              <a key={link} href="#contact" style={{
                fontSize: "var(--fs-xs)", fontWeight: 500, color: "rgba(255,255,255,0.45)",
                textDecoration: "none", transition: "color 0.2s"
              }} onMouseEnter={e => e.target.style.color = "#10b981"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// =========================================================
// ROOT COMPONENT
// =========================================================
export default function Landing() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{globalStyles}</style>
      <AnimatedBackground />
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Services />
      <Stats />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}