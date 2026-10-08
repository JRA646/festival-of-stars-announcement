import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown, ArrowRight, CalendarDays, ChevronDown, Clock3, MapPin, Share2,
  Star, Users, BookOpen, Music2, Mic2, Drama, Sparkles, Volume2, VolumeX
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./festivalofstars.css";
import "./first-love-theme.css";

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
  return { days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 };
}
const formatDate = (v: string) => new Date(v).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const formatShortDate = (v: string) => new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase();
const formatTime = (v: string) => new Date(v).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});

function track(eventId: string, eventType: string, metadata: Record<string, unknown> = {}) {
  void supabase.from("festival_analytics_events").insert({ event_id: eventId, event_type: eventType, path: window.location.pathname, metadata });
}

function useReveal() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      setVisible((current) => {
        const next = { ...current };
        entries.forEach((entry) => { const key = entry.target.getAttribute("data-reveal"); if (key && entry.isIntersecting) next[key] = true; });
        return next;
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (key: string) => visible[key] ? " reveal-visible" : "";
}

function useFestivalSound() {
  const [enabled, setEnabled] = useState(false);
  const toggle = () => {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    osc.frequency.setValueAtTime(enabled ? 220 : 330, now);
    osc.frequency.exponentialRampToValueAtTime(enabled ? 330 : 440, now + 0.28);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(now + 0.46);
    setEnabled((value) => !value);
  };
  return { enabled, toggle };
}

export default function FestivalOfStars() {
  const [festival, setFestival] = useState<PublicFestival | null>(null);
  const trackedPageView = useRef(false);
  const [error, setError] = useState("");
  const [activeTalent, setActiveTalent] = useState<TalentType>("singing");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [clock, setClock] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const reveal = useReveal();
  const sound = useFestivalSound();

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc("get_public_festival_of_stars", { p_slug: SLUG });
      if (!alive) return;
      if (rpcError || !data) { setError("This announcement is temporarily unavailable."); return; }
      const typed = data as PublicFestival;
      setFestival(typed);
      document.title = typed.announcement.seo_title || typed.event.name;
      const description = typed.announcement.seo_description || typed.event.description || "Festival of Stars";
      const image = new URL(typed.announcement.hero_image_url || "/festival-assets/festival-moodboard.jpg", window.location.origin).toString();
      const setMeta = (attr: "name" | "property", key: string, value: string) => {
        let node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
        if (!node) { node = document.createElement("meta"); node.setAttribute(attr, key); document.head.appendChild(node); }
        node.content = value;
      };
      setMeta("name","description",description);
      setMeta("property","og:title",typed.event.name); setMeta("property","og:description",description); setMeta("property","og:image",image);
      setMeta("name","twitter:card","summary_large_image"); setMeta("name","twitter:title",typed.event.name); setMeta("name","twitter:description",description); setMeta("name","twitter:image",image);

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
          address: typed.event.location || "Las Piñas City, Philippines",
        },
      });

      if (!trackedPageView.current) {
        trackedPageView.current = true;
        track(typed.event.id,"page_view");
      }
    };
    void load();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!festival) return;
    const tick = () => setClock(getTimeLeft(festival.event.start_at));
    tick();
    const timer = window.setInterval(tick,1000);
    return () => window.clearInterval(timer);
  }, [festival]);

  const active = useMemo(() => festival?.talents.find((item) => item.slug === activeTalent) || festival?.talents[0] || null, [festival, activeTalent]);
  const eventDate = festival ? formatDate(festival.event.start_at) : "";
  const eventTime = festival ? formatTime(festival.event.start_at) : "";
  const mapsUrl = festival?.event.location ? "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(festival.event.location) : "#";
  const content = festival?.announcement.content;
  const faqs = content?.faqs ?? [];
  const visits = content?.visit_items ?? [];

  const share = () => {
    if (!festival) return;
    track(festival.event.id,"share_click");
    if (navigator.share) void navigator.share({ title: festival.event.name, text: "Shine. Belong. Make a difference.", url: window.location.href });
    else void navigator.clipboard?.writeText(window.location.href);
  };
  const toggleSound = () => {
    sound.toggle();
    if (festival) track(festival.event.id,"sound_toggle",{ enabled: !sound.enabled });
  };

  if (error) return <main className="fos-state"><Star/><h1>Festival of Stars</h1><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
  if (!festival) return <main className="fos-state"><div className="fos-loader"/><p>Loading Festival of Stars…</p></main>;

  return <main className="fos">
    <nav className="fos-nav">
      <a href="#home" className="fos-logo"><span className="logo-mark">♥</span><span>First Love<small>CHURCH</small></span></a>
      <div className="fos-links"><a href="#home">Home</a><a href="#about">About</a><a href="#details">Details</a><a href="#talent">Talent</a><a href="#faq">FAQ</a></div>
      <div className="nav-actions">
        <button className="icon-btn" onClick={toggleSound} aria-label={sound.enabled ? "Turn sound off" : "Turn sound on"}>{sound.enabled ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
        <button className="icon-btn nav-share" onClick={share} aria-label="Share"><Share2 size={18}/></button>
        {festival.announcement.registration_enabled && <a className="register-pill" href="/festivalofstars/register" onClick={() => track(festival.event.id,"register_click")}>Register Now <ArrowRight size={16}/></a>}
      </div>
    </nav>

    <section className="fos-hero" id="home">
      <div className="hero-glow"/><div className="grain"/>
      <div className="paint paint-yellow"/><div className="paint paint-cyan"/><div className="paint paint-coral"/>
      <div className="scribble scribble-star">✦</div><div className="scribble scribble-crown">♛</div><div className="scribble scribble-plus">＋</div>
      <div className="hero-copy">
        <p className="hero-kicker">{content?.kicker}</p><h1>FESTIVAL<br/><span>OF STARS</span></h1>
        <p className="hero-tag">{content?.tagline}</p><p className="hero-description">{content?.hero_copy || festival.event.description}</p>
        <div className="hero-actions">
          {festival.announcement.registration_enabled && <a className="hero-register" href="/festivalofstars/register" onClick={() => track(festival.event.id,"register_click")}>REGISTER NOW <ArrowRight size={20}/></a>}
          <a className="hero-ghost" href="#details">EXPLORE THE NIGHT <ArrowDown size={18}/></a>
        </div>
      </div>

      <div className="hero-collage" aria-label="Festival of Stars artwork">
        <div className="collage-texture"/>
        <div className="collage-person collage-singer"><img src="/images/ai-festival-singer.webp" alt="AI-generated Festival of Stars singer" loading="eager"/><span>SINGING</span></div>
        <div className="collage-person collage-rap"><div className="mood-image mood-youth" role="img" aria-label="Smiling youth from supplied Festival of Stars artwork"/><span>RAP</span></div>
        <div className="collage-stage-photo"><div className="mood-image mood-stage" role="img" aria-label="Stage with star from supplied Festival of Stars artwork"/></div>
        <div className="collage-word word-shine">SHINE</div><div className="collage-word word-belong">BELONG</div><div className="collage-word word-create">CREATE</div>
        <div className="collage-ticket ticket-date"><strong>{formatShortDate(festival.event.start_at)}</strong><small>{eventTime}</small></div>
        <div className="collage-ticket ticket-place"><strong>{festival.event.location || "FIRST LOVE CHURCH"}</strong><small>LAS PIÑAS CITY</small></div>
      </div>

      <div className="info-strip">
        <div><CalendarDays/><b>{formatShortDate(festival.event.start_at)}</b><small>{new Date(festival.event.start_at).toLocaleDateString("en-US",{weekday:"long"}).toUpperCase()} · {eventTime}</small></div><i/>
        <div><MapPin/><b>FIRST LOVE CHURCH</b><small>{festival.event.location || "LAS PIÑAS CITY"}</small></div><i/>
        <div><Users/><b>{content?.audience || "FOR YOUTH & YOUNG ADULTS"}</b><small>{content?.age_label || "AGES 13 AND UP"}</small></div>
      </div>

      <div className="countdown-wrap" aria-live="polite">
        <p>COUNTING DOWN TO THE NIGHT</p>
        {clock.days + clock.hours + clock.minutes + clock.seconds === 0
          ? <div className="live-now">THE STARS ARE LIVE ✦</div>
          : <div className="countdown">{[["days",clock.days,"DAYS"],["hours",clock.hours,"HOURS"],["minutes",clock.minutes,"MINUTES"],["seconds",clock.seconds,"SECONDS"]].map(([key,value,label],index)=><div className={`count count-${index+1}`} key={key}><strong>{String(value).padStart(2,"0")}</strong><span>{label}</span></div>)}</div>}
      </div>
      <p className="hero-bottom">Be part of something bigger!</p><a className="scroll-cue" href="#about" aria-label="Scroll to about"><ArrowDown size={18}/></a>
    </section>

    <section className="human-strip">
      <div className="human-photo human-photo-wide"><div className="mood-image mood-crowd"/><span>WE CELEBRATE TOGETHER</span></div>
      <div className="human-photo"><div className="mood-image mood-guitar"/><span>POWERFUL WORSHIP</span></div>
      <div className="human-photo"><div className="mood-image mood-community"/><span>REAL COMMUNITY</span></div>
    </section>

    <div className="marquee" aria-hidden="true"><div className="marquee-track"><span>✦ SHINE</span><span>✦ BELONG</span><span>✦ WORSHIP</span><span>✦ RAP</span><span>✦ ACTING</span><span>✦ SINGING</span><span>✦ CREATE</span><span>✦ DISCOVER</span><span>✦ SHINE</span><span>✦ BELONG</span><span>✦ WORSHIP</span><span>✦ RAP</span><span>✦ ACTING</span><span>✦ SINGING</span></div></div>

    <section className="color-band"><h2>{content?.banner_title || "Every star has a story."}</h2><b>{content?.banner_copy || "Come ready to shine."}</b></section>

    <section className={`fos-section light reveal${reveal("about")}`} id="about" data-reveal="about">
      <p className="section-kicker">A NIGHT TO REMEMBER</p><h2>{content?.about_title}</h2>
      <div className="about-grid"><div className="poster-note"><Sparkles/><strong>YOU<br/>ARE A<br/><em>STAR</em></strong><span>Shine where God placed you.</span></div><div><p className="big-copy">{content?.about_copy}</p><p className="body-copy">{content?.about_body}</p></div></div>
    </section>

    <section className={`fos-section dark reveal${reveal("details")}`} id="details" data-reveal="details">
      <div className="section-kicker">WHAT YOU'LL EXPERIENCE</div><h2>Come. Connect. Shine.</h2>
      <div className="feature-grid">
        <article><Music2/><h3>POWERFUL WORSHIP</h3><p>Sing loud, lift your hands, and experience God’s presence through music.</p><span>01</span></article>
        <article><Users/><h3>REAL COMMUNITY</h3><p>Meet new friends and belong to a family that genuinely cares.</p><span>02</span></article>
        <article><BookOpen/><h3>LIFE-CHANGING MESSAGES</h3><p>Hear practical truth and discover the purpose God has put in you.</p><span>03</span></article>
        <article><Sparkles/><h3>FUN &amp; CREATIVE ACTIVITIES</h3><p>Games, challenges, art, performances, and surprises all night.</p><span>04</span></article>
      </div>
    </section>

    <section className={`talent-stage reveal${reveal("talent")}`} id="talent" data-reveal="talent">
      <div className="section-kicker">CREATIVE SHOWCASE</div><h2>{content?.talent_title}</h2><p className="talent-intro">{content?.talent_intro}</p>
      <div className="talent-grid">{festival.talents.map((talent,index)=>{const Icon=talent.slug==="singing"?Music2:talent.slug==="rap"?Mic2:Drama;return <button key={talent.id} className="talent-card" style={{"--talent-accent":talent.accent} as CSSProperties} onClick={()=>{setActiveTalent(talent.slug);track(festival.event.id,"talent_select",{talent:talent.slug});}}><Icon/><span>0{index+1}</span><strong>{talent.name}</strong><small>{talent.tagline}</small><ArrowRight/></button>})}</div>
      {active && <div className="talent-preview" style={{"--talent-accent":active.accent} as CSSProperties}><div><p>{active.name}</p><h3>{active.tagline}</h3><span>{active.description}</span></div><a href={`/festivalofstars/register?talent=${active.slug}`} onClick={()=>track(festival.event.id,"talent_view",{talent:active.slug})}>Register this talent <ArrowRight size={17}/></a></div>}
    </section>

    <section className={`schedule-section reveal${reveal("schedule")}`} data-reveal="schedule">
      <div className="section-kicker">SAVE THE DATE</div><h2>{eventDate}</h2>
      <div className="schedule-card"><div className="schedule-date">{new Date(festival.event.start_at).getMonth() + 1}/{new Date(festival.event.start_at).getDate()}</div><div className="schedule-content"><h3>{festival.event.name}</h3><p><Clock3/> {eventTime}</p><p><MapPin/> {festival.event.location || "First Love Church · Las Piñas City"}</p><div className="schedule-checks"><span>✓ Youth &amp; Young Adults</span><span>✓ Ages 13 and up</span><span>✓ Open to friends</span></div></div><a className="direction-button" href={mapsUrl} target="_blank" rel="noreferrer" onClick={()=>track(festival.event.id,"directions_click")}>Get directions <MapPin size={16}/></a></div>
    </section>

    <section className="visit-strip dark"><div className="section-kicker">YOUR VISIT</div><h2>{content?.visit_title}</h2>{visits.map(item=><div className="visit-item" key={item.title}><h3>{item.title}</h3><p>{item.copy}</p></div>)}</section>

    <section className="faq-section" id="faq"><div className="section-kicker">GOOD TO KNOW</div><h2>Questions?</h2><div className="faq-list">{faqs.map((faq,index)=><div className="faq-item" key={faq.question}><button onClick={()=>setFaqOpen(faqOpen===index?null:index)} aria-expanded={faqOpen===index}><span>{faq.question}</span><ChevronDown className={faqOpen===index?"rotated":""}/></button>{faqOpen===index&&<p>{faq.answer}</p>}</div>)}</div></section>

    <section className="fos-cta" id="register"><div><div className="section-kicker">YOUR STAR MOMENT STARTS HERE</div><h2>Be part of the night.</h2><p>Save the date, invite your people, and get ready to shine.</p></div>{festival.announcement.registration_enabled&&<a className="hero-register" href="/festivalofstars/register" onClick={()=>track(festival.event.id,"register_click")}>REGISTER NOW <ArrowRight size={18}/></a>}</section>

    <footer id="contact"><div><strong>FIRST LOVE CHURCH PHILIPPINES</strong><small>{festival.event.name} · {eventDate}</small></div><button onClick={share}><Share2 size={15}/> Share</button></footer>
    {festival.announcement.registration_enabled&&<div className="mobile-register"><a href="/festivalofstars/register" onClick={()=>track(festival.event.id,"register_click")}>REGISTER NOW <ArrowRight size={17}/></a></div>}
  </main>;
}
