import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import {
  ArrowDown, ArrowRight, CalendarDays, ChevronDown, MapPin, Share2,
  Star, Users, BookOpen, Music2, Mic2, Drama, Sparkles, Volume2, VolumeX,
  Play, Heart, Instagram, Plus, Menu, X
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./festivalofstars-youth.css";

type TalentType = "singing" | "rap" | "acting";
type Talent = { id: string; slug: TalentType; name: string; tagline: string; description: string; accent: string };
type AnnouncementContent = {
  kicker?: string; tagline?: string; hero_copy?: string; audience?: string; age_label?: string;
  banner_title?: string; banner_copy?: string; about_title?: string; about_copy?: string; about_body?: string;
  talent_title?: string; talent_intro?: string; visit_title?: string;
  visit_items?: Array<{ title: string; copy: string }>;
  faqs?: Array<{ question: string; answer: string }>;
};
type PublicFestival = {
  event: { id: string; name: string; description: string | null; start_at: string; end_at: string | null; location: string | null };
  announcement: { slug: string; published_at: string; registration_enabled: boolean; hero_image_url: string | null; seo_title: string | null; seo_description: string | null; content: AnnouncementContent };
  talents: Talent[];
};
type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

const SLUG = "festival-of-stars";

function getTimeLeft(target: string): TimeLeft {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

const formatDate = (v: string) => new Date(v).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const formatTime = (v: string) => new Date(v).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const formatShortDate = (v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();

function track(eventId: string, eventType: string, metadata: Record<string, unknown> = {}) {
  void supabase.from("festival_analytics_events").insert({
    event_id: eventId, event_type: eventType, path: window.location.pathname, metadata
  });
}

function useScrollReveal() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      setVisible((current) => {
        const next = { ...current };
        entries.forEach((entry) => {
          const key = entry.target.getAttribute("data-reveal");
          if (key && entry.isIntersecting) next[key] = true;
        });
        return next;
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (key: string) => visible[key] ? "is-visible" : "";
}

function useActiveNav() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const sections = ["home", "about", "details", "performers", "vibe", "faq"];
    const nodes = sections.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const hit = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit?.target.id) setActive(hit.target.id);
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0.08, 0.25, 0.5] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return active;
}

function useSound() {
  const [enabled, setEnabled] = useState(false);
  const toggle = () => {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    osc.frequency.setValueAtTime(enabled ? 240 : 420, now);
    osc.frequency.exponentialRampToValueAtTime(enabled ? 420 : 560, now + 0.2);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.35);
    setEnabled((v) => !v);
  };
  return { enabled, toggle };
}

const gallery = [
  { cls: "gallery-crowd", label: "Worship together" },
  { cls: "gallery-community", label: "Real community" },
  { cls: "gallery-stage", label: "Make memories" },
  { cls: "gallery-youth", label: "Find your people" },
  { cls: "gallery-singer", label: "Express yourself" },
];

export default function FestivalOfStarsYouth() {
  const [festival, setFestival] = useState<PublicFestival | null>(null);
  const [error, setError] = useState("");
  const [activeTalent, setActiveTalent] = useState<TalentType>("singing");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [clock, setClock] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroStyle, setHeroStyle] = useState<CSSProperties>({});
  const trackedPageView = useRef(false);
  const reveal = useScrollReveal();
  const activeNav = useActiveNav();
  const sound = useSound();

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc("get_public_festival_of_stars", { p_slug: SLUG });
      if (!alive) return;
      if (rpcError || !data) {
        setError("This announcement is temporarily unavailable.");
        return;
      }
      const typed = data as PublicFestival;
      setFestival(typed);

      document.title = typed.announcement.seo_title || typed.event.name;
      const description = typed.announcement.seo_description || typed.event.description || "Festival of Stars";
      const image = new URL(typed.announcement.hero_image_url || "/festival-assets/festival-moodboard.jpg", window.location.origin).toString();

      const setMeta = (attr: "name" | "property", key: string, value: string) => {
        let node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
        if (!node) {
          node = document.createElement("meta");
          node.setAttribute(attr, key);
          document.head.appendChild(node);
        }
        node.content = value;
      };
      setMeta("name", "description", description);
      setMeta("property", "og:title", typed.event.name);
      setMeta("property", "og:description", description);
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:card", "summary_large_image");
      setMeta("name", "twitter:title", typed.event.name);
      setMeta("name", "twitter:description", description);
      setMeta("name", "twitter:image", image);

      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = window.location.href.split("#")[0];

      let structured = document.head.querySelector<HTMLScriptElement>('script[data-festival-schema="true"]');
      if (!structured) {
        structured = document.createElement("script");
        structured.type = "application/ld+json";
        structured.dataset.festivalSchema = "true";
        document.head.appendChild(structured);
      }
      structured.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        name: typed.event.name,
        description,
        startDate: typed.event.start_at,
        endDate: typed.event.end_at || undefined,
        image: [image],
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: typed.event.location || "First Love Church",
          address: typed.event.location || "Las Piñas City, Philippines"
        }
      });

      if (!trackedPageView.current) {
        trackedPageView.current = true;
        track(typed.event.id, "page_view");
      }
    };
    void load();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!festival) return;
    const tick = () => setClock(getTimeLeft(festival.event.start_at));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [festival]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = useMemo(() => festival?.talents.find((item) => item.slug === activeTalent) || festival?.talents[0] || null, [festival, activeTalent]);
  const content = festival?.announcement.content;
  const faqs = content?.faqs ?? [];
  const eventDate = festival ? formatDate(festival.event.start_at) : "";
  const eventTime = festival ? formatTime(festival.event.start_at) : "";
  const mapsUrl = festival?.event.location
    ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(festival.event.location)
    : "#";

  const share = () => {
    if (!festival) return;
    track(festival.event.id, "share_click");
    if (navigator.share) {
      void navigator.share({ title: festival.event.name, text: "Shine. Belong. Make a difference.", url: window.location.href });
    } else {
      void navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleHeroPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setHeroStyle({
      "--hero-x": `${x * 14}px`,
      "--hero-y": `${y * 10}px`,
      "--glow-x": `${50 + x * 14}%`,
      "--glow-y": `${50 + y * 12}%`
    } as CSSProperties);
  };

  if (error) return <main className="fos-state"><Star /><h1>Festival of Stars</h1><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
  if (!festival) return <main className="fos-state"><div className="fos-loader" /><p>Loading Festival of Stars…</p></main>;

  const countdownDone = clock.days + clock.hours + clock.minutes + clock.seconds === 0;
  const currentGallery = Array.from({ length: 3 }, (_, i) => gallery[(galleryIndex + i) % gallery.length]);

  return <main className="fos-youth">
    <div className="scroll-progress"><span style={{ width: `${progress}%` }} /></div>

    <nav className="fy-nav">
      <a className="fy-brand" href="#home" aria-label="First Love Church home">
        <span className="brand-logo-wrap"><img className="brand-logo" src="/images/app_logo.png" alt="" aria-hidden="true" /></span><span>First Love<small>CHURCH</small></span>
      </a>
      <div className={`fy-links ${mobileMenuOpen ? "open" : ""}`}>
        {[["home","Home"],["about","About"],["details","Details"],["performers","Performers"],["vibe","Vibe"],["faq","FAQ"]].map(([id,label]) =>
          <a key={id} href={`#${id}`} className={activeNav === id ? "active" : ""} onClick={() => setMobileMenuOpen(false)}>{label}</a>
        )}
      </div>
      <button className="fy-menu" type="button" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((v) => !v)}>
        {mobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>
      <div className="fy-actions">
        <button className="fy-icon" onClick={() => { sound.toggle(); track(festival.event.id, "sound_toggle", { enabled: !sound.enabled }); }} aria-label={sound.enabled ? "Turn sound off" : "Turn sound on"}>
          {sound.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>
        <button className="fy-icon" onClick={share} aria-label="Share"><Share2 size={17} /></button>
        {festival.announcement.registration_enabled &&
          <a className="fy-register small" href="/festivalofstars/register" onClick={() => track(festival.event.id, "register_click")}>Register Now <ArrowRight size={15} /></a>}
      </div>
    </nav>

    <section
      id="home"
      className="fy-hero"
      style={heroStyle}
      onPointerMove={handleHeroPointer}
      onPointerLeave={() => setHeroStyle({})}
    >
      <div className="fy-hero-bg" />
      <div className="fy-hero-glow" />
      <div className="fy-paint fy-paint-a" /><div className="fy-paint fy-paint-b" /><div className="fy-paint fy-paint-c" />
      <div className="fy-doodle star-a">✦</div><div className="fy-doodle star-b">★</div><div className="fy-doodle crown">♛</div>

      <div className="fy-hero-copy">
        <p className="fy-eyebrow">{content?.kicker || "FIRST LOVE CHURCH PRESENTS"}</p>
        <h1><span>FESTIVAL</span><strong>OF STARS</strong></h1>
        <p className="fy-tagline">{content?.tagline || "Shine. Belong. Make a difference."}</p>
        <p className="fy-description">{content?.hero_copy || festival.event.description}</p>
        <div className="fy-hero-buttons">
          {festival.announcement.registration_enabled &&
            <a className="fy-register" href="/festivalofstars/register" onClick={() => track(festival.event.id, "register_click")}>REGISTER NOW <ArrowRight size={18} /></a>}
          <a className="fy-outline" href="#details"><Play size={16} fill="currentColor" /> EXPLORE THE NIGHT</a>
        </div>

        <div className="fy-countdown">
          <span className="countdown-label">{countdownDone ? "THE NIGHT IS HERE" : "COUNTING DOWN"}</span>
          {countdownDone ? <b className="live-pill">LIVE ✦</b> :
            <div className="countdown-row">
              {[["days", clock.days, "D"], ["hours", clock.hours, "H"], ["minutes", clock.minutes, "M"], ["seconds", clock.seconds, "S"]].map(([key,value,label]) =>
                <div className="count-box" key={key}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>
              )}
            </div>}
        </div>
      </div>

      <div className="fy-hero-visual">
        <div className="hero-image-main">
          <img src="/festival-assets/01_Singer_Male_1.png" alt="AI-style young singer performing at Festival of Stars" loading="eager" />
          
        </div>
        <div className="hero-image-side hero-back-photo hero-back-female" role="img" aria-label="Female worship image from Festival of Stars sample artwork">
          <img src="/festival-assets/person_1.png" alt="AI-style young singer performing at Festival of Stars" loading="eager" />
        </div>
        <div className="hero-image-bottom hero-back-photo hero-back-guitar" role="img" aria-label="Guitarist image from Festival of Stars sample artwork" >
                    <img src="/festival-assets/person_2.png" alt="AI-style young singer performing at Festival of Stars" loading="eager" />
          </div>
        <div className="floating-note note-shine">SHINE<br /><em>YOUR WAY</em></div>
        <div className="floating-note note-create">CREATE<br /><em>TOGETHER</em></div>
      </div>

      <div className="fy-event-chip">
        <div><CalendarDays /><strong>{formatShortDate(festival.event.start_at)}</strong><small>{new Date(festival.event.start_at).toLocaleDateString("en-US",{weekday:"long"}).toUpperCase()} · {eventTime}</small></div>
        <i />
        <div><MapPin /><strong>FIRST LOVE CHURCH</strong><small>{festival.event.location || "LAS PIÑAS CITY"}</small></div>
        <i />
        <div><Users /><strong>{content?.audience || "YOUTH & YOUNG ADULTS"}</strong><small>{content?.age_label || "AGES 13 AND UP"}</small></div>
      </div>
    </section>

    <section className="fy-strip">
      <div className="strip-item"><span className="strip-icon pink"><Music2 /></span><div><b>POWERFUL WORSHIP</b><small>Experience God's presence.</small></div></div>
      <div className="strip-item"><span className="strip-icon violet"><Users /></span><div><b>REAL COMMUNITY</b><small>Meet people who care.</small></div></div>
      <div className="strip-item"><span className="strip-icon cyan"><BookOpen /></span><div><b>LIFE-CHANGING MESSAGES</b><small>Discover purpose.</small></div></div>
      <div className="strip-item"><span className="strip-icon yellow"><Sparkles /></span><div><b>FUN + CREATIVE</b><small>Games, booths, surprises.</small></div></div>
    </section>

    <div className="fy-marquee" aria-hidden="true"><div><span>✦ SHINE</span><span>✦ BELONG</span><span>✦ WORSHIP</span><span>✦ CELEBRATE</span><span>✦ CREATE</span><span>✦ COMMUNITY</span><span>✦ PURPOSE</span><span>✦ DISCOVER</span><span>✦ SHINE</span><span>✦ BELONG</span></div></div>

    <section id="about" className={`fy-section fy-about ${reveal("about")}`} data-reveal="about">
      <div className="about-copy">
        <p className="fy-eyebrow pink-text">A NIGHT TO REMEMBER</p>
        <h2>{content?.about_title || "WHY FESTIVAL OF STARS?"}</h2>
        <p className="lead">{content?.about_copy || "Festival of Stars is more than an event. It is a space where young people can worship boldly, meet people, discover purpose, and use their creativity for something bigger."}</p>
        <p>{content?.about_body || "Come for the energy. Stay for the people. Leave with purpose."}</p>
        <div className="about-actions">
          <a className="text-link" href="#performers">Meet the performers <ArrowRight size={16} /></a>
          <a className="heart-link" href="#vibe"><Heart size={15} fill="currentColor" /> Feel the vibe</a>
        </div>
      </div>
      <div className="about-art">
        <div className="group-photo mood-image group-crop"><img src="/festival-assets/05_Worship_Crowd.png" alt="AI-style friends together" /></div>
        <div className="hand-note"><Plus /><b>YOU ARE<br /><em>A STAR</em></b><small>Shine where God placed you.</small></div>
        <div className="about-doodle doodle-heart">♡</div><div className="about-doodle doodle-star">✦</div>
      </div>
    </section>

    <section id="details" className={`fy-section fy-experience ${reveal("details")}`} data-reveal="details">
      <div className="section-heading">
        <p className="fy-eyebrow pink-text">COME. CONNECT. SHINE.</p>
        <h2>MORE THAN AN EVENT</h2>
        <p>Worship. Community. Creativity. Purpose. All in one night.</p>
      </div>
      <div className="experience-grid">
        <article className="experience-card card-pink"><div className="experience-photo mood-image exp-worship"><img src="/festival-assets/08_Youth_Community.png" alt="AI-style young worshipper performing" loading="lazy" /></div><Music2 /><span>01</span><h3>WORSHIP</h3><p>Sing loud, lift your hands, and make space for God's presence.</p></article>
        <article className="experience-card card-yellow"><div className="experience-photo mood-image exp-community"><img src="/festival-assets/festival-moodboard.jpg" alt="AI-style friends together" loading="lazy" /></div><Users /><span>02</span><h3>COMMUNITY</h3><p>Meet new friends, laugh together, and find people who get you.</p></article>
        <article className="experience-card card-cyan"><div className="experience-photo mood-image exp-purpose"><img src="/festival-assets/festival-moodboard.jpg" alt="AI-style festival stage lights" loading="lazy" /></div><BookOpen /><span>03</span><h3>PURPOSE</h3><p>Hear practical truth and discover what God has put in you.</p></article>
        <article className="experience-card card-violet"><div className="experience-photo mood-image exp-fun"><img src="/festival-assets/festival-moodboard.jpg" alt="AI-style young people enjoying Festival of Stars" loading="lazy" /></div><Sparkles /><span>04</span><h3>FUN</h3><p>Games, creative activities, performances, and surprises.</p></article>
      </div>
    </section>

    <section id="performers" className={`fy-section fy-talent ${reveal("performers")}`} data-reveal="performers">
      <div className="talent-heading">
        <div><p className="fy-eyebrow pink-text">FIRST LOVE CHURCH</p><h2>FIRST LOVE <em>PERFORMERS</em></h2></div>
        <p>{content?.talent_intro || "Festival of Stars performances are for our First Love Church family. Singing, rap, and acting will be presented by approved First Love performers."}</p>
      </div>
      <div className="talent-cards">
        {festival.talents.map((talent, index) => {
          const Icon = talent.slug === "singing" ? Music2 : talent.slug === "rap" ? Mic2 : Drama;
          return <button
            key={talent.id}
            className={`talent-image-card ${activeTalent === talent.slug ? "selected" : ""}`}
            onClick={() => { setActiveTalent(talent.slug); track(festival.event.id, "talent_select", { talent: talent.slug }); }}
            aria-pressed={activeTalent === talent.slug}
          >
            <div className={`talent-photo ${talent.slug}-ai`}><img src={talent.slug === "singing" ? "/festival-assets/festival-moodboard.jpg" : talent.slug === "rap" ? "/festival-assets/festival-moodboard.jpg" : "/festival-assets/festival-moodboard.jpg"} alt="" aria-hidden="true" loading="lazy" /></div>
            <div className="talent-overlay" />
            <span className="talent-number">0{index + 1}</span>
            <span className="talent-icon"><Icon /></span>
            <div className="talent-label"><b>{talent.name}</b><small>{talent.tagline}</small></div>
            <ArrowRight className="talent-arrow" />
          </button>;
        })}
      </div>
      {active && <div className="talent-detail" style={{ "--talent-accent": active.accent } as CSSProperties}>
        <div><span>{active.name}</span><h3>{active.tagline}</h3><p>{active.description}</p></div>
        <span className="performer-note">Presented by approved First Love Church performers.</span>
      </div>}
    </section>

    <section id="vibe" className={`fy-section fy-vibe ${reveal("vibe")}`} data-reveal="vibe">
      <div className="vibe-copy">
        <p className="fy-eyebrow pink-text">EXPERIENCE THE VIBE</p>
        <h2>FIND YOUR<br /><em>PEOPLE.</em></h2>
        <p>Come as you are. Bring your people. Leave with more than memories.</p>
        <div className="vibe-buttons">
          <button onClick={() => setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)} aria-label="Previous photos">←</button>
          <button onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)} aria-label="Next photos">→</button>
        </div>
      </div>
      <div className="gallery-track">
        {currentGallery.map((item, index) =>
          <div className={`gallery-card mood-image ${item.cls}`} key={item.cls}><img src={item.cls === "gallery-singer" ? "/festival-assets/festival-moodboard.jpg" : item.cls === "gallery-community" ? "/festival-assets/festival-moodboard.jpg" : item.cls === "gallery-stage" ? "/festival-assets/festival-moodboard.jpg" : "/festival-assets/festival-moodboard.jpg"} alt="" aria-hidden="true" loading="lazy" />
            {index === 1 && <span>PEOPLE &gt; PERFECT</span>}
            {index === 2 && <span>MAKE MEMORIES</span>}
            <b>{item.label}</b>
          </div>
        )}
      </div>
    </section>

    <section className="fy-event">
      <div className="event-photo mood-image stage-crop-large"><img src="/festival-assets/festival-moodboard.jpg" alt="AI-style festival stage and crowd" loading="lazy" /></div>
      <div className="event-details">
        <p className="fy-eyebrow pink-text">SAVE THE DATE</p>
        <h2>{eventDate}</h2>
        <div className="event-facts">
          <div><CalendarDays /><b>{formatShortDate(festival.event.start_at)}</b><small>{eventTime}</small></div>
          <div><MapPin /><b>FIRST LOVE CHURCH</b><small>{festival.event.location || "LAS PIÑAS CITY"}</small></div>
          <div><Users /><b>{content?.audience || "YOUTH & YOUNG ADULTS"}</b><small>{content?.age_label || "AGES 13 AND UP"}</small></div>
        </div>
        <p className="event-note">Free admission. Bring a friend and come ready to shine.</p>
        <div className="event-buttons">
          {festival.announcement.registration_enabled &&
            <a className="fy-register" href="/festivalofstars/register" onClick={() => track(festival.event.id, "register_click")}>REGISTER NOW <ArrowRight size={17} /></a>}
          <a className="fy-outline dark-outline" href={mapsUrl} target="_blank" rel="noreferrer" onClick={() => track(festival.event.id, "directions_click")}>GET DIRECTIONS <MapPin size={16} /></a>
        </div>
      </div>
    </section>

    <section id="faq" className={`fy-section fy-faq ${reveal("faq")}`} data-reveal="faq">
      <div className="faq-visual">
        <div className="faq-human"><img src="/festival-assets/festival-moodboard.jpg" alt="AI-style young creator at Festival of Stars" /></div>
        <div className="faq-bubbles">✦<br />GOOD<br />QUESTIONS?</div>
      </div>
      <div className="faq-copy">
        <p className="fy-eyebrow pink-text">GOT QUESTIONS?</p>
        <h2>FAQ</h2>
        <div className="faq-list">
          {faqs.map((faq,index) =>
            <div className="faq-row" key={faq.question}>
              <button onClick={() => setFaqOpen(faqOpen === index ? null : index)} aria-expanded={faqOpen === index}>
                <span>{faq.question}</span><ChevronDown className={faqOpen === index ? "rotated" : ""} />
              </button>
              {faqOpen === index && <p>{faq.answer}</p>}
            </div>
          )}
        </div>
      </div>
    </section>

    <section className="fy-final">
      <div className="final-backdrop mood-image crowd-bottom"><img src="/festival-assets/festival-moodboard.jpg" alt="" aria-hidden="true" /></div>
      <div className="final-copy"><p className="fy-eyebrow">YOUR STAR MOMENT STARTS HERE</p><h2>YOU ARE A<br /><em>STAR.</em></h2><p>Shine. Belong. Make a difference.</p></div>
      {festival.announcement.registration_enabled &&
        <a className="fy-register final-button" href="/festivalofstars/register" onClick={() => track(festival.event.id, "register_click")}>REGISTER NOW <ArrowRight size={20} /></a>}
      <div className="final-doodle final-star">✦</div><div className="final-doodle final-heart">♡</div>
    </section>

    <footer className="fy-footer">
      <div><strong>FIRST LOVE CHURCH PHILIPPINES</strong><small>{festival.event.name} · {eventDate}</small></div>
      <div className="footer-social"><button onClick={share} aria-label="Share"><Share2 size={16} /></button><a href="#instagram" aria-label="Instagram"><Instagram size={16} /></a></div>
    </footer>

    {festival.announcement.registration_enabled && <div className="fy-mobile-register"><a href="/festivalofstars/register" onClick={() => track(festival.event.id, "register_click")}>REGISTER NOW <ArrowRight size={17} /></a></div>}
    <a className="fy-scroll-top" href="#home" aria-label="Back to top"><ArrowDown size={15} /></a>
  </main>;
}
