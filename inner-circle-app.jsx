
import { useState, useEffect, useRef, useCallback } from "react";

// ─── PERSISTENT STORAGE HELPERS ───────────────────────────────────────────────
const db = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); return true; } catch { return false; }
  },
};

// ─── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED_MEMBERS = [
  { id: "m1", name: "Maya Chen", role: "Partner", company: "Lightspeed Ventures", city: "San Francisco", industry: "Venture Capital", tags: ["Investor", "Consumer"], initials: "MC", colorFrom: "#3a2a00", colorTo: "#5a4000", tc: "#c9a84c", bio: "Investing in consumer, fintech & creator economy. Previously built and sold two companies.", linkedin: "", joined: "2024-01-15", invitesLeft: 3, invitesUsed: ["IC-A4F2K9"], isAdmin: true },
  { id: "m2", name: "James Kim", role: "Partner", company: "Sequoia Capital", city: "San Francisco", industry: "Venture Capital", tags: ["Investor", "Fintech"], initials: "JK", colorFrom: "#001a3a", colorTo: "#002a5a", tc: "#5b9bd5", bio: "20+ years investing in category-defining companies. Board member at 12 unicorns.", linkedin: "", joined: "2024-01-20", invitesLeft: 2, invitesUsed: [], isAdmin: false },
  { id: "m3", name: "Sofia Reyes", role: "Founder & CEO", company: "Woven Health", city: "New York", industry: "Healthcare", tags: ["Founder", "HealthTech"], initials: "SR", colorFrom: "#1a0030", colorTo: "#2d0050", tc: "#a855f7", bio: "Building the future of preventive health. YC W22. Forbes 30 Under 30.", linkedin: "", joined: "2024-02-01", invitesLeft: 3, invitesUsed: [], isAdmin: false },
  { id: "m4", name: "Marcus Webb", role: "Creative Director", company: "Contra Studio", city: "London", industry: "Creative & Media", tags: ["Creative", "Design"], initials: "MW", colorFrom: "#001a10", colorTo: "#002a1a", tc: "#4caf7d", bio: "Brand strategy and creative direction for the world's most ambitious companies.", linkedin: "", joined: "2024-02-10", invitesLeft: 1, invitesUsed: [], isAdmin: false },
  { id: "m5", name: "Priya Nair", role: "VP Engineering", company: "Stripe", city: "San Francisco", industry: "Technology", tags: ["Engineer", "Fintech"], initials: "PN", colorFrom: "#1a1000", colorTo: "#2a1800", tc: "#c9a84c", bio: "Building payments infrastructure used by millions. MIT CS. Open source contributor.", linkedin: "", joined: "2024-02-15", invitesLeft: 3, invitesUsed: [], isAdmin: false },
];

const SEED_APPS = [
  { id: "a1", name: "Lucas Fernandez", role: "Co-founder", company: "Archon AI", city: "Austin", industry: "Technology", referral: "James Kim", bio: "Building AI infrastructure for SMBs. Previously ML lead at OpenAI. YC W23. $8M raised.", linkedIn: "linkedin.com/in/lucasf", email: "lucas@archon.ai", connectWith: ["Investors", "Operators"], status: "pending", appliedAt: "2024-12-10T09:00:00Z", score: null, aiNotes: null },
  { id: "a2", name: "Nina Park", role: "Partner", company: "Benchmark", city: "San Francisco", industry: "Venture Capital", referral: "Sofia Reyes", bio: "Invested in 40+ companies. Focus on consumer and marketplace businesses. $3B AUM.", linkedIn: "linkedin.com/in/ninapark", email: "nina@benchmark.com", connectWith: ["Founders", "Operators"], status: "pending", appliedAt: "2024-12-11T14:30:00Z", score: null, aiNotes: null },
  { id: "a3", name: "Ravi Gupta", role: "Director of Product", company: "Notion", city: "San Francisco", industry: "Technology", referral: "", bio: "Building the future of knowledge work. Stanford MBA. Led growth from 1M to 30M users.", linkedIn: "linkedin.com/in/ravigupta", email: "ravi@notion.so", connectWith: ["Founders", "Engineers"], status: "pending", appliedAt: "2024-12-12T11:00:00Z", score: null, aiNotes: null },
  { id: "a4", name: "Camille Moreau", role: "Creative Director", company: "LVMH", city: "Paris", industry: "Creative & Media", referral: "Marcus Webb", bio: "Leading brand strategy for flagship maisons. 15 years in luxury. ESAD graduate.", linkedIn: "linkedin.com/in/camillem", email: "camille@lvmh.com", connectWith: ["Creatives", "Founders"], status: "pending", appliedAt: "2024-12-13T16:00:00Z", score: null, aiNotes: null },
];

const SEED_EVENTS = [
  { id: "e1", title: "Founder Dinner SF", type: "in-person", month: "DEC", day: "15", desc: "Intimate dinner for 20 founders and investors. North Beach, San Francisco.", location: "North Beach, SF", attendees: ["m1", "m2", "m3"], capacity: 20, createdBy: "m1" },
  { id: "e2", title: "AI & The Future of Work", type: "virtual", month: "DEC", day: "18", desc: "Panel discussion with leaders from OpenAI, Anthropic & Microsoft.", location: "Zoom", attendees: ["m2", "m4", "m5"], capacity: 200, createdBy: "m1" },
  { id: "e3", title: "NYC Winter Gathering", type: "in-person", month: "JAN", day: "8", desc: "Annual community meetup in Manhattan. Drinks, connections, and conversation.", location: "Manhattan, NY", attendees: ["m3"], capacity: 50, createdBy: "m2" },
  { id: "e4", title: "Portfolio Office Hours", type: "virtual", month: "JAN", day: "22", desc: "Open Q&A with our member investors. Submit your questions in advance.", location: "Zoom", attendees: [], capacity: 100, createdBy: "m1" },
];

const SEED_MESSAGES = {
  "m1_m3": [
    { id: "msg1", from: "m3", text: "Hey Maya! I saw your profile on Inner Circle — your work at Lightspeed is incredible.", ts: "2024-12-13T10:32:00Z" },
    { id: "msg2", from: "m3", text: "Would love to grab coffee and chat about the creator economy space. Are you free this week?", ts: "2024-12-13T10:32:30Z" },
    { id: "msg3", from: "m1", text: "Sofia! Of course, I've been following your work too. Let's do it!", ts: "2024-12-13T10:45:00Z" },
    { id: "msg4", from: "m1", text: "How about Thursday at 3pm in SoMa?", ts: "2024-12-13T10:45:30Z" },
    { id: "msg5", from: "m3", text: "Thursday at 3 works perfectly. See you then ✨", ts: "2024-12-13T11:00:00Z" },
  ],
  "m1_m2": [
    { id: "msg6", from: "m2", text: "Maya — great to meet you at the Sequoia dinner last week.", ts: "2024-12-12T09:00:00Z" },
    { id: "msg7", from: "m2", text: "Let me know if you'd like an intro to anyone in our portfolio.", ts: "2024-12-12T09:01:00Z" },
    { id: "msg8", from: "m1", text: "Would love that! Particularly interested in any fintech founders.", ts: "2024-12-12T09:30:00Z" },
  ],
};

const INVITE_CODES = ["IC-A4F2K9", "IC-B7D3M1", "IC-C9E5P3", "IC-D2F8Q7", "IC-E4H1R2"];

// ─── CLAUDE API ─────────────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const G = {
  bg: "#0a0a0a", bg2: "#141414", bg3: "#1e1e1e", bg4: "#282828",
  border: "#2a2a2a", border2: "#383838",
  gold: "#c9a84c", gold2: "#e8c97a", goldDim: "rgba(201,168,76,0.15)",
  text: "#f0ede8", text2: "#a09a90", text3: "#6a6460",
  green: "#4caf7d", red: "#e05252", blue: "#5b9bd5", purple: "#a855f7",
};

const css = {
  shell: { width: 390, minHeight: 844, background: G.bg, margin: "0 auto", position: "relative", overflow: "hidden", borderRadius: 44, border: `1px solid ${G.border2}`, boxShadow: "0 40px 80px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" },
  statusBar: { height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", fontSize: 12, fontWeight: 500, color: G.text2, flexShrink: 0 },
  screen: { display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", overflowX: "hidden" },
  bottomNav: { position: "sticky", bottom: 0, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)", borderTop: `0.5px solid ${G.border}`, padding: "8px 0 24px", display: "flex", justifyContent: "space-around", zIndex: 100, flexShrink: 0 },
  navItem: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", padding: "4px 16px", borderRadius: 8, color: active ? G.gold : G.text3, fontSize: 10, fontWeight: 600, letterSpacing: "0.03em" }),
  card: { background: G.bg2, border: `0.5px solid ${G.border}`, borderRadius: 12, padding: 16 },
  avatar: (w = 44, from = "#1a1a1a", to = "#2a2a2a", tc = G.text2) => ({ width: w, height: w, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: w * 0.32, background: `linear-gradient(135deg,${from},${to})`, color: tc, flexShrink: 0 }),
  badge: (color, bg, border) => ({ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: `0.5px solid ${border}`, display: "inline-block" }),
  btnGold: { background: G.gold, color: "#1a1200", fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, border: "none", borderRadius: 50, padding: "14px 32px", cursor: "pointer", width: "100%", letterSpacing: "0.02em" },
  btnOutline: { background: "transparent", color: G.text, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, border: `0.5px solid ${G.border2}`, borderRadius: 50, padding: "12px 24px", cursor: "pointer", width: "100%" },
  btnSm: (active) => ({ fontSize: 13, padding: "8px 18px", borderRadius: 50, border: `0.5px solid ${active ? "rgba(201,168,76,0.4)" : G.border2}`, background: active ? G.goldDim : G.bg3, color: active ? G.gold : G.text2, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, whiteSpace: "nowrap" }),
  input: { background: G.bg3, border: `0.5px solid ${G.border2}`, borderRadius: 8, padding: "14px 16px", color: G.text, fontFamily: "'DM Sans',sans-serif", fontSize: 15, width: "100%", outline: "none", boxSizing: "border-box" },
  label: { fontSize: 12, fontWeight: 700, color: G.text2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" },
};

// ─── TINY COMPONENTS ──────────────────────────────────────────────────────────
const Badge = ({ type, children }) => {
  const styles = {
    gold: css.badge(G.gold, G.goldDim, "rgba(201,168,76,0.3)"),
    green: css.badge(G.green, "rgba(76,175,125,0.15)", "rgba(76,175,125,0.3)"),
    red: css.badge(G.red, "rgba(224,82,82,0.1)", "rgba(224,82,82,0.3)"),
    gray: css.badge(G.text2, "rgba(255,255,255,0.05)", G.border),
  };
  return <span style={styles[type] || styles.gray}>{children}</span>;
};

const Avatar = ({ member, size = 44 }) => (
  <div style={css.avatar(size, member.colorFrom || "#1a1a1a", member.colorTo || "#2a2a2a", member.tc || G.text2)}>
    {member.initials}
  </div>
);

const Divider = () => <div style={{ height: 0.5, background: G.border, margin: "16px 0" }} />;

const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={css.label}>{label}</label>
    {children}
  </div>
);

const StatCard = ({ num, label, color }) => (
  <div style={{ background: G.bg3, border: `0.5px solid ${G.border}`, borderRadius: 8, padding: 16, flex: 1, textAlign: "center" }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: color || G.text, lineHeight: 1 }}>{num}</div>
    <div style={{ fontSize: 11, color: G.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4, fontWeight: 700 }}>{label}</div>
  </div>
);

const Toast = ({ msg }) => (
  msg ? <div style={{ position: "fixed", bottom: 130, left: "50%", transform: "translateX(-50%)", background: G.bg3, border: `0.5px solid ${G.border2}`, borderRadius: 50, padding: "12px 24px", fontSize: 14, fontWeight: 500, color: G.text, zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>{msg}</div>
  : null
);

const BottomNav = ({ active, onNav }) => {
  const items = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "members", icon: "👥", label: "Members" },
    { id: "events", icon: "📅", label: "Events" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <div style={css.bottomNav}>
      {items.map(i => (
        <div key={i.id} style={css.navItem(active === i.id)} onClick={() => onNav(i.id)}>
          <span style={{ fontSize: 20 }}>{i.icon}</span>
          <span>{i.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── SCREENS ──────────────────────────────────────────────────────────────────

// SPLASH
const SplashScreen = ({ onApply, onLogin }) => (
  <div style={{ ...css.screen, justifyContent: "space-between", padding: "32px 28px 48px" }}>
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <div style={{ fontSize: 12, letterSpacing: "0.3em", color: G.gold, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>By invitation only</div>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 56, lineHeight: 1, color: G.text, marginBottom: 8 }}>Inner<br /><em>Circle</em></div>
      <div style={{ width: 40, height: 1, background: G.gold, margin: "20px auto" }} />
      <p style={{ color: G.text2, fontSize: 15, lineHeight: 1.8, maxWidth: 260, margin: "0 auto" }}>A curated community of founders, creators, and investors who shape what's next.</p>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", marginTop: "auto" }}>
      <button style={css.btnGold} onClick={onApply}>Apply for Membership</button>
      <button style={css.btnOutline} onClick={onLogin}>Sign In</button>
      <p style={{ textAlign: "center", fontSize: 12, color: G.text3, marginTop: 4 }}>Have an invite? <span style={{ color: G.gold, cursor: "pointer" }} onClick={onApply}>Use it here →</span></p>
    </div>
  </div>
);

// LOGIN
const LoginScreen = ({ onBack, onLogin, onAdmin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div style={{ ...css.screen, padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <span style={{ fontSize: 22, color: G.text2, cursor: "pointer" }} onClick={onBack}>←</span>
      </div>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, marginBottom: 6 }}>Welcome<br /><em>back.</em></div>
      <p style={{ color: G.text2, fontSize: 14, marginBottom: 36 }}>Sign in to your membership</p>
      <FormGroup label="Email">
        <input style={css.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      </FormGroup>
      <FormGroup label="Password">
        <input style={css.input} type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
      </FormGroup>
      <button style={{ ...css.btnGold, marginTop: 8 }} onClick={() => onLogin(email)}>Sign In</button>
      <Divider />
      <button style={{ ...css.btnOutline, fontSize: 13, padding: "10px 24px" }} onClick={onAdmin}>🛡 Admin Sign In</button>
    </div>
  );
};

// APPLICATION FORM
const ApplyScreen = ({ onBack, onSubmit, toast }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", linkedin: "", industry: "", role: "", company: "", notable: "", why: "", city: "", inviteCode: "", referral: "", connectWith: [] });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTag = (t) => set("connectWith", form.connectWith.includes(t) ? form.connectWith.filter(x => x !== t) : [...form.connectWith, t]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const app = { id: `a${Date.now()}`, name: `${form.firstName} ${form.lastName}`, role: form.role, company: form.company, city: form.city, industry: form.industry, referral: form.referral, bio: form.notable, linkedIn: form.linkedin, email: form.email, connectWith: form.connectWith, status: "pending", appliedAt: new Date().toISOString(), score: null, aiNotes: null };
    const apps = await db.get("applications") || SEED_APPS;
    apps.push(app);
    await db.set("applications", apps);
    setSubmitting(false);
    onSubmit();
  };

  const stepDot = (n) => {
    const done = n < step, active = n === step;
    return <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: done ? G.gold : active ? G.goldDim : G.bg3, color: done ? "#1a1200" : active ? G.gold : G.text3, border: active ? `1.5px solid ${G.gold}` : done ? "none" : `0.5px solid ${G.border}`, flexShrink: 0 }}>{done ? "✓" : n}</div>;
  };

  return (
    <div style={{ ...css.screen, padding: "28px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <span style={{ fontSize: 22, color: G.text2, cursor: "pointer" }} onClick={onBack}>←</span>
        <span style={{ fontSize: 12, color: G.text3, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>Application</span>
        <span style={{ fontSize: 12, color: G.gold }}>{step} of 3</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
        {stepDot(1)}<div style={{ flex: 1, height: 0.5, background: step > 1 ? G.gold : G.border }} />{stepDot(2)}<div style={{ flex: 1, height: 0.5, background: step > 2 ? G.gold : G.border }} />{stepDot(3)}
      </div>
      <div style={{ height: 2, background: G.border, borderRadius: 2, marginBottom: 24 }}>
        <div style={{ height: "100%", background: G.gold, borderRadius: 2, width: `${step * 33.3}%`, transition: "width 0.4s" }} />
      </div>

      {step === 1 && <>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, marginBottom: 6 }}>Who <em>are you?</em></div>
        <p style={{ color: G.text2, fontSize: 14, marginBottom: 28 }}>Tell us the basics</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div><label style={css.label}>First Name</label><input style={css.input} placeholder="Alex" value={form.firstName} onChange={e => set("firstName", e.target.value)} /></div>
          <div><label style={css.label}>Last Name</label><input style={css.input} placeholder="Chen" value={form.lastName} onChange={e => set("lastName", e.target.value)} /></div>
        </div>
        <FormGroup label="Email"><input style={css.input} type="email" placeholder="alex@example.com" value={form.email} onChange={e => set("email", e.target.value)} /></FormGroup>
        <FormGroup label="LinkedIn URL"><input style={css.input} placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} /></FormGroup>
        <FormGroup label="Industry">
          <select style={{ ...css.input, cursor: "pointer" }} value={form.industry} onChange={e => set("industry", e.target.value)}>
            <option value="">Select your field</option>
            {["Technology & Software", "Venture Capital", "Creative & Media", "Finance", "Healthcare & Biotech", "Real Estate", "Other"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Invite Code (optional)"><input style={{ ...css.input, fontFamily: "monospace", letterSpacing: "0.1em" }} placeholder="IC-XXXXXX" value={form.inviteCode} onChange={e => set("inviteCode", e.target.value)} /></FormGroup>
        <button style={css.btnGold} onClick={() => setStep(2)}>Continue →</button>
      </>}

      {step === 2 && <>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, marginBottom: 6 }}>Your <em>story</em></div>
        <p style={{ color: G.text2, fontSize: 14, marginBottom: 28 }}>Help us understand your work</p>
        <FormGroup label="Current Role"><input style={css.input} placeholder="Partner at Accel / Founder of..." value={form.role} onChange={e => set("role", e.target.value)} /></FormGroup>
        <FormGroup label="Company"><input style={css.input} placeholder="Company name" value={form.company} onChange={e => set("company", e.target.value)} /></FormGroup>
        <FormGroup label="Notable Work or Achievements"><textarea style={{ ...css.input, resize: "none", height: 100, lineHeight: 1.6 }} placeholder="Share ventures, investments, or impact that defines you..." value={form.notable} onChange={e => set("notable", e.target.value)} /></FormGroup>
        <FormGroup label="What brings you to Inner Circle?"><textarea style={{ ...css.input, resize: "none", height: 100, lineHeight: 1.6 }} placeholder="What are you hoping to give and gain?" value={form.why} onChange={e => set("why", e.target.value)} /></FormGroup>
        <button style={css.btnGold} onClick={() => setStep(3)}>Continue →</button>
        <button style={{ ...css.btnOutline, marginTop: 10 }} onClick={() => setStep(1)}>← Back</button>
      </>}

      {step === 3 && <>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, marginBottom: 6 }}>Almost<br /><em>there.</em></div>
        <p style={{ color: G.text2, fontSize: 14, marginBottom: 28 }}>Final details</p>
        <FormGroup label="City"><input style={css.input} placeholder="San Francisco, New York..." value={form.city} onChange={e => set("city", e.target.value)} /></FormGroup>
        <FormGroup label="Looking to connect with">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {["Founders", "Investors", "Operators", "Creatives", "Engineers", "Advisors"].map(t => (
              <button key={t} style={css.btnSm(form.connectWith.includes(t))} onClick={() => toggleTag(t)}>{t}</button>
            ))}
          </div>
        </FormGroup>
        <FormGroup label="Referred by"><input style={css.input} placeholder="Name of your referral (if any)" value={form.referral} onChange={e => set("referral", e.target.value)} /></FormGroup>
        <div style={{ background: G.bg3, border: `0.5px solid ${G.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: G.text2, lineHeight: 1.6 }}>By submitting, you agree to our <span style={{ color: G.gold }}>Community Standards</span> and understand membership is by discretionary approval only.</p>
        </div>
        <button style={{ ...css.btnGold, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Application"}</button>
        <button style={{ ...css.btnOutline, marginTop: 10 }} onClick={() => setStep(2)}>← Back</button>
      </>}
    </div>
  );
};

// SUBMITTED
const SubmittedScreen = ({ onHome }) => (
  <div style={{ ...css.screen, justifyContent: "center", alignItems: "center", padding: 32, textAlign: "center" }}>
    <div style={{ width: 80, height: 80, borderRadius: "50%", background: G.goldDim, border: `0.5px solid rgba(201,168,76,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>✓</div>
    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, marginBottom: 8 }}>You're in<br /><em>the queue.</em></div>
    <p style={{ color: G.text2, fontSize: 15, lineHeight: 1.7, maxWidth: 280, margin: "0 auto 32px" }}>Our team reviews every application personally. You'll hear back within 5–7 business days.</p>
    <div style={{ ...css.card, width: "100%", marginBottom: 32 }}>
      {[["Application received", "Just now", true], ["Team review", "Pending", false], ["Decision sent", "Pending", false]].map(([label, time, done]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: done ? G.gold : G.border2, flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: done ? G.text : G.text3 }}>{label}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: G.text3 }}>{time}</span>
        </div>
      ))}
    </div>
    <button style={css.btnGold} onClick={onHome}>Back to Home</button>
  </div>
);

// HOME
const HomeScreen = ({ member, members, events, messages, onNav, onInvite, toast }) => {
  const unreadCount = Object.values(messages).reduce((acc, thread) => {
    return acc + thread.filter(m => m.from !== member.id && !m.read).length;
  }, 0);

  const recentMembers = [...members].sort((a, b) => new Date(b.joined) - new Date(a.joined)).slice(0, 2);
  const upcomingEvent = events[0];

  return (
    <div style={css.screen}>
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: G.text2, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>Good morning</div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26 }}>{member.name.split(" ")[0]} <em>{member.name.split(" ")[1]}</em></div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div onClick={() => onNav("messages")} style={{ cursor: "pointer", position: "relative" }}>
              <span style={{ fontSize: 22 }}>💬</span>
              {unreadCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: G.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#1a1200" }}>{unreadCount}</div>}
            </div>
            <div onClick={() => onNav("profile")} style={{ padding: 3, background: `conic-gradient(${G.gold},${G.gold2},${G.gold})`, borderRadius: "50%", cursor: "pointer" }}>
              <div style={{ padding: 2, background: G.bg, borderRadius: "50%" }}>
                <Avatar member={member} size={36} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <StatCard num={members.length} label="Members" />
          <StatCard num={events.length} label="Events" />
          <StatCard num={member.invitesLeft} label="Invites" color={G.gold} />
        </div>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: G.text3, fontWeight: 700, marginBottom: 12 }}>Recent Activity</div>
      </div>
      <div style={{ padding: "0 24px", flex: 1 }}>
        {recentMembers.map(m => (
          <div key={m.id} style={{ ...css.card, marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Avatar member={m} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{m.name} <span style={{ color: G.text3, fontWeight: 400 }}>joined the community</span></div>
              <div style={{ fontSize: 12, color: G.text3 }}>{m.role} · {m.company}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>{m.tags.map(t => <Badge key={t} type="gray">{t}</Badge>)}</div>
            </div>
          </div>
        ))}
        {upcomingEvent && (
          <div style={{ ...css.card, marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: G.goldDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>Upcoming: <span style={{ color: G.gold }}>{upcomingEvent.title}</span></div>
              <div style={{ fontSize: 12, color: G.text3 }}>{upcomingEvent.month} {upcomingEvent.day} · {upcomingEvent.location}</div>
              <div style={{ marginTop: 8 }}><Badge type="gold">{upcomingEvent.attendees.length} attending</Badge></div>
            </div>
          </div>
        )}
        <div style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.06))`, border: `0.5px solid rgba(201,168,76,0.25)`, borderRadius: 12, padding: 20, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>You have {member.invitesLeft} invites</div>
              <div style={{ fontSize: 12, color: G.text2 }}>Share Inner Circle with someone exceptional</div>
            </div>
          </div>
          <button style={{ ...css.btnGold, marginTop: 14, fontSize: 13, padding: "10px 32px" }} onClick={onInvite}>Send an Invite</button>
        </div>
        <div style={{ height: 100 }} />
      </div>
      <BottomNav active="home" onNav={onNav} />
    </div>
  );
};

// MEMBERS
const MembersScreen = ({ members, currentMember, onNav, onSelect }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filters = ["All", "Founders", "Investors", "Operators", "Creatives", "New"];

  const filtered = members.filter(m => {
    const matchFilter = filter === "all" || (filter === "new" ? m.id !== currentMember.id : m.tags.some(t => t.toLowerCase().includes(filter)));
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.company.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch && m.id !== currentMember.id;
  });

  return (
    <div style={css.screen}>
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, marginBottom: 16 }}>The <em>Directory</em></div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input style={{ ...css.input, paddingLeft: 42 }} placeholder="Search by name, company, skill..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 18, scrollbarWidth: "none" }}>
          {filters.map(f => (
            <button key={f} style={css.btnSm(filter === f.toLowerCase())} onClick={() => setFilter(f.toLowerCase())}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 24px", flex: 1 }}>
        {filtered.map(m => (
          <div key={m.id} onClick={() => onSelect(m)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: `0.5px solid ${G.border}`, cursor: "pointer" }}>
            <Avatar member={m} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: G.text2 }}>{m.role} · {m.company}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>{m.tags.map(t => <Badge key={t} type="gray">{t}</Badge>)}</div>
            </div>
            <span style={{ color: G.text3 }}>›</span>
          </div>
        ))}
        <div style={{ height: 100 }} />
      </div>
      <BottomNav active="members" onNav={onNav} />
    </div>
  );
};

// MEMBER DETAIL
const MemberDetailScreen = ({ member, currentMember, onBack, onMessage }) => (
  <div style={css.screen}>
    <div style={{ padding: "20px 24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 22, cursor: "pointer", color: G.text2 }} onClick={onBack}>←</span>
        <span style={{ fontSize: 13, color: G.text2 }}>Member Profile</span>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div style={{ padding: 3, background: `conic-gradient(${G.gold},${G.gold2},${G.gold})`, borderRadius: "50%" }}>
          <div style={{ padding: 2, background: G.bg, borderRadius: "50%" }}><Avatar member={member} size={72} /></div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>{member.name}</div>
          <div style={{ fontSize: 14, color: G.text2, marginBottom: 8 }}>{member.role} · {member.company}</div>
          <div style={{ display: "flex", gap: 6 }}>{member.tags.map(t => <Badge key={t} type="gray">{t}</Badge>)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 14 }}>📍</span>
        <span style={{ fontSize: 14, color: G.text2 }}>{member.city}</span>
      </div>
      <Divider />
      <div style={{ margin: "16px 0" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: G.text3, fontWeight: 700, marginBottom: 8 }}>About</div>
        <p style={{ fontSize: 14, color: G.text2, lineHeight: 1.7 }}>{member.bio}</p>
      </div>
      <Divider />
      <div style={{ margin: "16px 0" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: G.text3, fontWeight: 700, marginBottom: 8 }}>Industry</div>
        <Badge type="gray">{member.industry}</Badge>
      </div>
      <button style={{ ...css.btnGold, marginTop: 16 }} onClick={() => onMessage(member)}>💬 Send a Message</button>
      <button style={{ ...css.btnOutline, marginTop: 10 }}>👤 Connect</button>
      <div style={{ height: 40 }} />
    </div>
  </div>
);

// EVENTS
const EventsScreen = ({ events, currentMember, onNav, onRsvp, toast }) => {
  const [tab, setTab] = useState("upcoming");
  return (
    <div style={css.screen}>
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28 }}>Events</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={css.btnSm(tab === "upcoming")} onClick={() => setTab("upcoming")}>Upcoming</button>
            <button style={css.btnSm(tab === "past")} onClick={() => setTab("past")}>Past</button>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 24px", flex: 1 }}>
        {events.map(ev => {
          const attending = ev.attendees.includes(currentMember.id);
          const spotsLeft = ev.capacity - ev.attendees.length;
          return (
            <div key={ev.id} style={{ ...css.card, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 52, height: 56, background: G.goldDim, border: `0.5px solid rgba(201,168,76,0.3)`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: G.gold, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ev.month}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: G.gold, lineHeight: 1 }}>{ev.day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4 }}><Badge type={ev.type === "virtual" ? "gray" : "gold"}>{ev.type === "virtual" ? "Virtual" : "In Person"}</Badge></div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{ev.title}</div>
                  <div style={{ fontSize: 13, color: G.text2, lineHeight: 1.5 }}>{ev.desc}</div>
                  <div style={{ fontSize: 12, color: G.text3, marginTop: 6 }}>📍 {ev.location}</div>
                </div>
              </div>
              <Divider />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: G.text2 }}>👥 {ev.attendees.length} attending · <span style={{ color: G.text3 }}>{spotsLeft} spots left</span></div>
                <button style={css.btnSm(attending)} onClick={() => !attending && onRsvp(ev.id)}>{attending ? "✓ Going" : "RSVP"}</button>
              </div>
            </div>
          );
        })}
        <div style={{ height: 100 }} />
      </div>
      <BottomNav active="events" onNav={onNav} />
    </div>
  );
};

// MESSAGES LIST
const MessagesScreen = ({ messages, members, currentMember, onNav, onOpen }) => {
  const threads = Object.entries(messages).filter(([key]) => key.includes(currentMember.id));
  return (
    <div style={css.screen}>
      <div style={{ padding: "20px 24px 0", flex: 1 }}>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, marginBottom: 16 }}>Messages</div>
        {threads.length === 0 && <p style={{ color: G.text2, fontSize: 14 }}>No messages yet. Find someone in the directory!</p>}
        {threads.map(([key, thread]) => {
          const otherId = key.replace(currentMember.id, "").replace("_", "").replace("_", "");
          const other = members.find(m => m.id === otherId);
          if (!other) return null;
          const last = thread[thread.length - 1];
          const unread = thread.filter(m => m.from !== currentMember.id && !m.read).length;
          return (
            <div key={key} onClick={() => onOpen(other)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: `0.5px solid ${G.border}`, cursor: "pointer" }}>
              <div style={{ position: "relative" }}>
                <Avatar member={other} />
                {unread > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: G.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#1a1200" }}>{unread}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: unread ? 700 : 400 }}>{other.name}</span>
                  <span style={{ fontSize: 12, color: G.text3 }}>{new Date(last.ts).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 13, color: G.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{last.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav active="messages" onNav={onNav} />
    </div>
  );
};

// CHAT
const ChatScreen = ({ other, currentMember, thread, onBack, onSend }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div style={{ ...css.screen, justifyContent: "space-between" }}>
      <div>
        <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${G.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22, cursor: "pointer", color: G.text2 }} onClick={onBack}>←</span>
          <Avatar member={other} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{other.name}</div>
            <div style={{ fontSize: 12, color: G.green }}>● Online</div>
          </div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          {thread.map(msg => {
            const isMine = msg.from === currentMember.id;
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: 18, fontSize: 14, lineHeight: 1.5, background: isMine ? G.gold : G.bg3, color: isMine ? "#1a1200" : G.text, borderBottomRightRadius: isMine ? 4 : 18, borderBottomLeftRadius: isMine ? 18 : 4 }}>{msg.text}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
      <div style={{ padding: "12px 16px 32px", borderTop: `0.5px solid ${G.border}`, display: "flex", gap: 10, alignItems: "center" }}>
        <input style={{ ...css.input, borderRadius: 50, padding: "10px 16px", flex: 1 }} placeholder="Message..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} />
        <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: "50%", background: G.gold, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>›</button>
      </div>
    </div>
  );
};

// PROFILE
const ProfileScreen = ({ member, onNav, onLogout, toast }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  return (
    <div style={css.screen}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28 }}>Profile</div>
          <button style={css.btnSm(false)} onClick={onLogout}>Sign Out</button>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          <div style={{ padding: 3, background: `conic-gradient(${G.gold},${G.gold2},${G.gold})`, borderRadius: "50%" }}>
            <div style={{ padding: 2, background: G.bg, borderRadius: "50%" }}><Avatar member={member} size={72} /></div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>{member.name}</div>
            <div style={{ fontSize: 14, color: G.text2, marginBottom: 8 }}>{member.role} · {member.company}</div>
            <div style={{ display: "flex", gap: 6 }}>{member.tags.map(t => <Badge key={t} type="gold">{t}</Badge>)}</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: G.text2, lineHeight: 1.7, marginBottom: 20 }}>{member.bio}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button style={css.btnSm(false)}>🔗 LinkedIn</button>
          <button style={css.btnSm(false)}>🐦 Twitter</button>
          <button style={css.btnSm(false)}>🌐 Website</button>
        </div>
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: G.text3, fontWeight: 700 }}>Your Invite Codes</div>
          <Badge type="gold">{member.invitesLeft} remaining</Badge>
        </div>
        {(member.invitesUsed || []).map(code => (
          <div key={code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: G.bg3, borderRadius: 8, marginBottom: 8, border: `0.5px solid ${G.border}` }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: G.gold, letterSpacing: "0.1em" }}>{code}</span>
            <Badge type="green">Active</Badge>
          </div>
        ))}
        <button style={{ ...css.btnOutline, marginTop: 12, fontSize: 13, padding: "10px 24px" }} onClick={() => setShowInviteModal(true)}>📋 Copy Invite Link</button>
        {showInviteModal && (
          <div style={{ marginTop: 16, background: G.bg3, borderRadius: 12, padding: 16, border: `0.5px solid ${G.border}` }}>
            <p style={{ fontSize: 13, color: G.text2, marginBottom: 12 }}>Share this link with someone exceptional:</p>
            <div style={{ fontFamily: "monospace", fontSize: 14, color: G.gold, background: G.bg4, padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>https://innercircle.app/join?code={INVITE_CODES[0]}</div>
            <button style={{ ...css.btnGold, fontSize: 13, padding: "10px 32px" }} onClick={() => { toast("Link copied!"); setShowInviteModal(false); }}>Copy</button>
          </div>
        )}
        <div style={{ height: 100 }} />
      </div>
      <BottomNav active="profile" onNav={onNav} />
    </div>
  );
};

// ADMIN DASHBOARD
const AdminScreen = ({ applications, members, events, onApprove, onReject, onLogout }) => {
  const [tab, setTab] = useState("applications");
  const [reviewing, setReviewing] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const pending = applications.filter(a => a.status === "pending");
  const approved = applications.filter(a => a.status === "approved");

  const reviewWithAI = async (app) => {
    setReviewing({ ...app, aiNotes: null });
    setAiLoading(true);
    const result = await callClaude(
      `You are a selective community curator for Inner Circle, a high-caliber professional network. Evaluate membership applications concisely. Respond ONLY with valid JSON: {"score": number 0-100, "recommendation": "approve" | "waitlist" | "decline", "reasoning": "2-3 sentences max", "strengths": ["item1","item2"], "concerns": ["item1"] or []}`,
      `Applicant: ${app.name}\nRole: ${app.role} at ${app.company}\nCity: ${app.city}\nIndustry: ${app.industry}\nReferral: ${app.referral || "None"}\nBio: ${app.bio}\nConnecting with: ${(app.connectWith || []).join(", ")}`
    );
    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      setReviewing(prev => ({ ...prev, aiNotes: parsed, score: parsed.score }));
    } catch {
      setReviewing(prev => ({ ...prev, aiNotes: { score: 75, recommendation: "waitlist", reasoning: result, strengths: [], concerns: [] }, score: 75 }));
    }
    setAiLoading(false);
  };

  return (
    <div style={css.screen}>
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28 }}>Admin <em>Panel</em></div>
          <button style={css.btnSm(false)} onClick={onLogout}>Exit</button>
        </div>
        <p style={{ color: G.text2, fontSize: 13, marginBottom: 20 }}>Manage applications & community</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <StatCard num={pending.length} label="Pending" color={G.gold} />
          <StatCard num={members.length} label="Members" color={G.green} />
          <StatCard num={approved.length} label="Approved" color={G.blue} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", scrollbarWidth: "none" }}>
          <button style={css.btnSm(tab === "applications")} onClick={() => { setTab("applications"); setReviewing(null); }}>Applications ({pending.length})</button>
          <button style={css.btnSm(tab === "members")} onClick={() => { setTab("members"); setReviewing(null); }}>Members</button>
          <button style={css.btnSm(tab === "events")} onClick={() => { setTab("events"); setReviewing(null); }}>Events</button>
        </div>
      </div>

      <div style={{ padding: "0 24px", flex: 1 }}>
        {/* REVIEW MODAL */}
        {reviewing && (
          <div style={{ ...css.card, marginBottom: 16, border: `0.5px solid rgba(201,168,76,0.4)` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>🤖 AI Review: {reviewing.name}</span>
              <span style={{ cursor: "pointer", color: G.text3, fontSize: 18 }} onClick={() => setReviewing(null)}>✕</span>
            </div>
            {aiLoading && <div style={{ color: G.text2, fontSize: 14 }}>Analysing application…</div>}
            {reviewing.aiNotes && !aiLoading && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: reviewing.aiNotes.score >= 80 ? G.green : reviewing.aiNotes.score >= 60 ? G.gold : G.red }}>{reviewing.aiNotes.score}</div>
                  <div>
                    <Badge type={reviewing.aiNotes.recommendation === "approve" ? "green" : reviewing.aiNotes.recommendation === "decline" ? "red" : "gold"}>{reviewing.aiNotes.recommendation.toUpperCase()}</Badge>
                    <p style={{ fontSize: 13, color: G.text2, lineHeight: 1.5, marginTop: 6 }}>{reviewing.aiNotes.reasoning}</p>
                  </div>
                </div>
                {reviewing.aiNotes.strengths.length > 0 && <div style={{ marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: G.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Strengths</span>{reviewing.aiNotes.strengths.map(s => <div key={s} style={{ fontSize: 13, color: G.green, marginTop: 4 }}>✓ {s}</div>)}</div>}
                {reviewing.aiNotes.concerns.length > 0 && <div style={{ marginBottom: 12 }}><span style={{ fontSize: 11, fontWeight: 700, color: G.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Concerns</span>{reviewing.aiNotes.concerns.map(c => <div key={c} style={{ fontSize: 13, color: G.red, marginTop: 4 }}>⚠ {c}</div>)}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={{ flex: 1, background: "rgba(76,175,125,0.15)", color: G.green, border: `0.5px solid rgba(76,175,125,0.4)`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 50, cursor: "pointer" }} onClick={() => { onApprove(reviewing.id); setReviewing(null); }}>✓ Approve</button>
                  <button style={{ flex: 1, background: "rgba(224,82,82,0.1)", color: G.red, border: `0.5px solid rgba(224,82,82,0.3)`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 50, cursor: "pointer" }} onClick={() => { onReject(reviewing.id); setReviewing(null); }}>✕ Decline</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "applications" && pending.map(app => (
          <div key={app.id} style={{ ...css.card, marginBottom: 12, opacity: reviewing?.id === app.id ? 0.5 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div style={{ ...css.avatar(44), background: G.bg4 }}>{app.name.split(" ").map(x => x[0]).join("")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{app.name}</span>
                  {app.score && <span style={{ fontSize: 14, fontWeight: 700, color: app.score >= 80 ? G.green : G.gold }}>★ {app.score}</span>}
                </div>
                <div style={{ fontSize: 13, color: G.text2 }}>{app.role} · {app.company}</div>
                <div style={{ fontSize: 12, color: G.text3 }}>📍 {app.city} · {app.industry}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: G.text2, lineHeight: 1.6, marginBottom: 12 }}>{app.bio}</p>
            {app.referral && <div style={{ fontSize: 12, color: G.text3, marginBottom: 12 }}>👤 Referred by {app.referral}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "rgba(76,175,125,0.15)", color: G.green, border: `0.5px solid rgba(76,175,125,0.4)`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 50, cursor: "pointer" }} onClick={() => onApprove(app.id)}>✓ Approve</button>
              <button style={{ background: "rgba(224,82,82,0.1)", color: G.red, border: `0.5px solid rgba(224,82,82,0.3)`, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 50, cursor: "pointer" }} onClick={() => onReject(app.id)}>✕ Decline</button>
              <button style={{ ...css.btnSm(false), marginLeft: "auto" }} onClick={() => reviewWithAI(app)}>🤖 AI Review</button>
            </div>
          </div>
        ))}

        {tab === "members" && members.map(m => (
          <div key={m.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `0.5px solid ${G.border}` }}>
            <Avatar member={m} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: G.text3 }}>{m.role} · {m.city}</div>
            </div>
            <Badge type="green">Active</Badge>
          </div>
        ))}

        {tab === "events" && events.map(ev => (
          <div key={ev.id} style={{ ...css.card, marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 48, background: G.goldDim, border: `0.5px solid rgba(201,168,76,0.3)`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: G.gold, textTransform: "uppercase" }}>{ev.month}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: G.gold, lineHeight: 1 }}>{ev.day}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{ev.title}</div>
              <div style={{ fontSize: 12, color: G.text3 }}>{ev.attendees.length} RSVPs · {ev.capacity - ev.attendees.length} spots left</div>
            </div>
            <button style={css.btnSm(false)}>✏</button>
          </div>
        ))}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

// ─── INVITE MODAL ─────────────────────────────────────────────────────────────
const InviteModal = ({ onClose, onSend, toast }) => {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    const code = INVITE_CODES[Math.floor(Math.random() * INVITE_CODES.length)];
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    toast(`Invite sent to ${email}! Code: ${code}`);
    onSend(email, code);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 500 }}>
      <div style={{ background: G.bg2, borderRadius: "24px 24px 0 0", padding: "28px 24px 48px", width: 390, border: `0.5px solid ${G.border2}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24 }}>Send an <em>Invite</em></div>
          <span style={{ cursor: "pointer", color: G.text3, fontSize: 22 }} onClick={onClose}>✕</span>
        </div>
        <FormGroup label="Recipient Email">
          <input style={css.input} type="email" placeholder="friend@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </FormGroup>
        <FormGroup label="Personal Note (optional)">
          <textarea style={{ ...css.input, resize: "none", height: 80 }} placeholder="Why I think you'd love Inner Circle..." value={note} onChange={e => setNote(e.target.value)} />
        </FormGroup>
        <button style={{ ...css.btnGold, opacity: loading ? 0.7 : 1 }} onClick={handleSend} disabled={loading}>{loading ? "Sending..." : "Send Invite 🎁"}</button>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("splash");
  const [currentMember, setCurrentMember] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState(SEED_MEMBERS);
  const [applications, setApplications] = useState(SEED_APPS);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [selectedMember, setSelectedMember] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [loaded, setLoaded] = useState(false);

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  // Load persisted data
  useEffect(() => {
    (async () => {
      const [m, a, e, msg] = await Promise.all([db.get("members"), db.get("applications"), db.get("events"), db.get("messages")]);
      if (m) setMembers(m); else await db.set("members", SEED_MEMBERS);
      if (a) setApplications(a); else await db.set("applications", SEED_APPS);
      if (e) setEvents(e); else await db.set("events", SEED_EVENTS);
      if (msg) setMessages(msg); else await db.set("messages", SEED_MESSAGES);
      setLoaded(true);
    })();
  }, []);

  const persist = async (key, val) => { await db.set(key, val); };

  const handleLogin = async (email) => {
    const member = members.find(m => m.email?.toLowerCase() === email.toLowerCase()) || members[0];
    setCurrentMember(member);
    setIsAdmin(false);
    setView("app");
    setActiveTab("home");
  };

  const handleAdminLogin = () => { setCurrentMember(members[0]); setIsAdmin(true); setView("admin"); };

  const handleLogout = () => { setCurrentMember(null); setIsAdmin(false); setView("splash"); setActiveTab("home"); };

  const handleNav = (tab) => {
    setActiveTab(tab);
    setSelectedMember(null);
    setChatWith(null);
    setView("app");
  };

  const handleApprove = async (appId) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    const newMember = {
      id: `m${Date.now()}`, name: app.name, role: app.role, company: app.company, city: app.city,
      industry: app.industry, tags: [app.industry.split(" ")[0]], initials: app.name.split(" ").map(x => x[0]).join(""),
      colorFrom: "#1a1a1a", colorTo: "#2a2a2a", tc: G.text2, bio: app.bio,
      joined: new Date().toISOString(), invitesLeft: 3, invitesUsed: [], isAdmin: false,
    };
    const newApps = applications.map(a => a.id === appId ? { ...a, status: "approved" } : a);
    const newMembers = [...members, newMember];
    setApplications(newApps); setMembers(newMembers);
    await persist("applications", newApps); await persist("members", newMembers);
    toast(`✓ ${app.name} approved and added to the community!`);
  };

  const handleReject = async (appId) => {
    const newApps = applications.map(a => a.id === appId ? { ...a, status: "rejected" } : a);
    setApplications(newApps);
    await persist("applications", newApps);
    toast("Application declined.");
  };

  const handleRsvp = async (eventId) => {
    const newEvents = events.map(e => e.id === eventId ? { ...e, attendees: [...e.attendees, currentMember.id] } : e);
    setEvents(newEvents); await persist("events", newEvents);
    toast("✓ RSVP confirmed!");
  };

  const handleSendMessage = async (text) => {
    if (!chatWith || !currentMember) return;
    const key = [currentMember.id, chatWith.id].sort().join("_");
    const newMsg = { id: `msg${Date.now()}`, from: currentMember.id, text, ts: new Date().toISOString(), read: false };
    const newMessages = { ...messages, [key]: [...(messages[key] || []), newMsg] };
    setMessages(newMessages); await persist("messages", newMessages);
  };

  const openChat = (member) => { setChatWith(member); setView("chat"); };

  const getChatThread = () => {
    if (!chatWith || !currentMember) return [];
    const key = [currentMember.id, chatWith.id].sort().join("_");
    return messages[key] || [];
  };

  const handleInviteSent = async (email, code) => {
    const newMembers = members.map(m => m.id === currentMember.id ? { ...m, invitesLeft: m.invitesLeft - 1, invitesUsed: [...(m.invitesUsed || []), code] } : m);
    setMembers(newMembers); await persist("members", newMembers);
    setCurrentMember(prev => ({ ...prev, invitesLeft: prev.invitesLeft - 1, invitesUsed: [...(prev.invitesUsed || []), code] }));
  };

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a", color: G.gold, fontFamily: "'DM Serif Display',serif", fontSize: 32 }}>
      <em>Inner Circle</em>
    </div>
  );

  const renderAppScreen = () => {
    if (view === "chat" && chatWith) return <ChatScreen other={chatWith} currentMember={currentMember} thread={getChatThread()} onBack={() => { setChatWith(null); setView("app"); setActiveTab("messages"); }} onSend={handleSendMessage} />;
    if (selectedMember) return <MemberDetailScreen member={selectedMember} currentMember={currentMember} onBack={() => setSelectedMember(null)} onMessage={(m) => { setChatWith(m); setSelectedMember(null); setView("chat"); }} />;
    switch (activeTab) {
      case "home": return <HomeScreen member={currentMember} members={members} events={events} messages={messages} onNav={handleNav} onInvite={() => setShowInvite(true)} toast={toast} />;
      case "members": return <MembersScreen members={members} currentMember={currentMember} onNav={handleNav} onSelect={m => setSelectedMember(m)} />;
      case "events": return <EventsScreen events={events} currentMember={currentMember} onNav={handleNav} onRsvp={handleRsvp} toast={toast} />;
      case "messages": return <MessagesScreen messages={messages} members={members} currentMember={currentMember} onNav={handleNav} onOpen={openChat} />;
      case "profile": return <ProfileScreen member={currentMember} onNav={handleNav} onLogout={handleLogout} toast={toast} />;
      default: return null;
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
        <div style={css.shell}>
          <div style={css.statusBar}>
            <span>9:41</span>
            <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14 }}>▲ ◉ ▮▮</span>
          </div>
          {view === "splash" && <SplashScreen onApply={() => setView("apply")} onLogin={() => setView("login")} />}
          {view === "login" && <LoginScreen onBack={() => setView("splash")} onLogin={handleLogin} onAdmin={handleAdminLogin} />}
          {view === "apply" && <ApplyScreen onBack={() => setView("splash")} onSubmit={() => setView("submitted")} toast={toast} />}
          {view === "submitted" && <SubmittedScreen onHome={() => setView("splash")} />}
          {view === "app" && renderAppScreen()}
          {view === "admin" && <AdminScreen applications={applications.filter(a => a.status === "pending")} members={members} events={events} onApprove={handleApprove} onReject={handleReject} onLogout={handleLogout} />}
          {view === "chat" && chatWith && renderAppScreen()}
          <Toast msg={toastMsg} />
          {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSend={handleInviteSent} toast={toast} />}
        </div>
      </div>
    </>
  );
}
