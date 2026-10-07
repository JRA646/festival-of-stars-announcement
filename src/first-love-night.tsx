import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Heart,
  LoaderCircle,
  MapPin,
  Menu,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./firstlovenight.css";

type Experience = { title: string; copy: string; icon: string };
type TimelineItem = { time: string; title: string; copy: string };
type DressItem = { title: string; copy: string };
type FaqItem = { question: string; answer: string };

type FirstLoveNightData = {
  event: {
    id: string;
    name: string;
    description: string | null;
    start_at: string;
    end_at: string | null;
    location: string | null;
  };
  announcement: {
    slug: string;
    published_at: string;
    registration_enabled: boolean;
    seo_title: string;
    seo_description: string;
    content: {
      title: string;
      subtitle: string;
      audience: string;
      date_label: string;
      weekday: string;
      time_label: string;
      venue_label: string;
      city_label: string;
      dress_code: string;
      hero_image_url: string;
      vision_title: string;
      vision_copy: string;
      experience: Experience[];
      timeline: TimelineItem[];
      dress_code_items: DressItem[];
      faqs: FaqItem[];
    };
  };
  registration_count: number;
};

type RsvpForm = {
  full_name: string;
  email: string;
  mobile: string;
  age_group: "high_school" | "college" | "";
  guardian_name: string;
  guardian_mobile: string;
  guardian_consent: boolean;
  guest_count: string;
  church_group: string;
  dietary_requirements: string;
  referral_source: string;
  message: string;
  consent: boolean;
};

const FALLBACK: RsvpForm = {
  full_name: "",
  email: "",
  mobile: "",
  age_group: "",
  guardian_name: "",
  guardian_mobile: "",
  guardian_consent: false,
  guest_count: "0",
  church_group: "",
  dietary_requirements: "None",
  referral_source: "",
  message: "",
  consent: false,
};

function FirstLoveMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "fln-brand-mark compact" : "fln-brand-mark"} aria-hidden="true">
      <span>✦</span>
    </span>
  );
}

function formatEventDateParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).formatToParts(new Date(value));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    day: map.day,
    month: map.month.toUpperCase(),
    year: map.year,
    weekday: map.weekday.toUpperCase(),
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getDateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function getDaysUntil(value: string) {
  const [year, month, day] = getDateKey(value).split("-").map(Number);
  const today = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const todayParts = Object.fromEntries(today.map((part) => [part.type, part.value]));
  const targetDay = Date.UTC(year, month - 1, day);
  const nowDay = Date.UTC(
    Number(todayParts.year),
    Number(todayParts.month) - 1,
    Number(todayParts.day),
  );

  return Math.max(0, Math.ceil((targetDay - nowDay) / 86400000));
}

function openRsvpAnalytics(eventId: string, eventType: string, metadata: Record<string, unknown> = {}) {
  void supabase.from("festival_analytics_events").insert({
    event_id: eventId,
    event_type: eventType,
    path: window.location.pathname,
    metadata,
  });
}

export default function FirstLoveNight() {
  const [data, setData] = useState<FirstLoveNightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [rsvpOpen, setRsvpOpen] = useState(window.location.pathname.endsWith("/rsvp"));
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<RsvpForm>(FALLBACK);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [confirmation, setConfirmation] = useState<{ code: string; name: string; guests: number } | null>(null);
  const rsvpCloseRef = useRef<HTMLButtonElement | null>(null);
  const rsvpTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      const { data: result, error: rpcError } = await supabase.rpc("get_public_first_love_night");

      if (!alive) return;

      if (rpcError || !result) {
        setError("This event page is temporarily unavailable. Please try again.");
        setLoading(false);
        return;
      }

      const typed = result as FirstLoveNightData;
      setData(typed);
      document.title = typed.announcement.seo_title;

      const meta = (name: string, value: string) => {
        let node = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
        if (!node) {
          node = document.createElement("meta");
          node.name = name;
          document.head.appendChild(node);
        }
        node.content = value;
      };

      meta("description", typed.announcement.seo_description);

      const setProperty = (property: string, value: string) => {
        let node = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
        if (!node) {
          node = document.createElement("meta");
          node.setAttribute("property", property);
          document.head.appendChild(node);
        }
        node.content = value;
      };

      const heroImage = new URL(
        typed.announcement.content.hero_image_url,
        window.location.origin,
      ).toString();

      setProperty("og:title", typed.announcement.seo_title);
      setProperty("og:description", typed.announcement.seo_description);
      setProperty("og:image", heroImage);
      meta("twitter:card", "summary_large_image");
      meta("twitter:title", typed.announcement.seo_title);
      meta("twitter:description", typed.announcement.seo_description);
      meta("twitter:image", heroImage);

      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = window.location.href.split("#")[0];

      let schema = document.head.querySelector<HTMLScriptElement>('script[data-event-schema="first-love-night"]');
      if (!schema) {
        schema = document.createElement("script");
        schema.type = "application/ld+json";
        schema.dataset.eventSchema = "first-love-night";
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        name: typed.event.name,
        description: typed.event.description || typed.announcement.seo_description,
        startDate: typed.event.start_at,
        image: [heroImage],
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: typed.event.location || "TBA",
          address: "Manila, Philippines",
        },
      });

      openRsvpAnalytics(typed.event.id, "page_view", { page: "first_love_night" });
      setLoading(false);

      if (window.location.pathname.endsWith("/rsvp")) {
        openRsvpAnalytics(typed.event.id, "register_click", { source: "direct_rsvp_url" });
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!rsvpOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        closeRegistration();
        return;
      }

      if (event.key !== "Tab") return;

      const modal = document.querySelector<HTMLElement>(".fln-rsvp-modal");
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
        ),
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    requestAnimationFrame(() => rsvpCloseRef.current?.focus());

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [rsvpOpen, submitting]);

  useEffect(() => {
    const handlePopState = () => {
      setRsvpOpen(window.location.pathname.endsWith("/rsvp"));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const content = data?.announcement.content;
  const days = useMemo(() => (data ? getDaysUntil(data.event.start_at) : 0), [data]);
  const eventDate = data ? formatDate(data.event.start_at) : "";
  const eventDateParts = data ? formatEventDateParts(data.event.start_at) : null;
  const venue = data?.event.location || content?.venue_label || "TBA";
  const guestCount = Number(form.guest_count || 0);

  const openRegistration = (source: string) => {
    if (!data?.announcement.registration_enabled) return;
    rsvpTriggerRef.current = document.activeElement as HTMLElement | null;
    setMenuOpen(false);
    setStep(1);
    setRsvpError("");
    setConfirmation(null);
    setRsvpOpen(true);
    history.replaceState({}, "", "/first-love-night/rsvp");
    openRsvpAnalytics(data.event.id, "register_click", { source });
  };

  const closeRegistration = () => {
    if (submitting) return;
    setRsvpOpen(false);
    history.replaceState({}, "", "/first-love-night");
    requestAnimationFrame(() => rsvpTriggerRef.current?.focus?.());
  };

  const update = <K extends keyof RsvpForm>(field: K, value: RsvpForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (rsvpError) setRsvpError("");
  };

  const continueStepOne = (event: FormEvent) => {
    event.preventDefault();

    if (!form.age_group) {
      setRsvpError("Please select your age group.");
      return;
    }

    if (form.age_group === "high_school") {
      if (!form.guardian_name.trim() || !form.guardian_mobile.trim() || !form.guardian_consent) {
        setRsvpError("Parent or guardian information and consent are required for high school attendees.");
        return;
      }
    }

    setStep(2);
    if (data) openRsvpAnalytics(data.event.id, "register_click", { step: 1, action: "step_1_complete" });
  };

  const continueStepTwo = (event: FormEvent) => {
    event.preventDefault();
    setStep(3);
    if (data) openRsvpAnalytics(data.event.id, "register_click", { step: 2, action: "step_2_complete" });
  };

  const submitRsvp = async (event: FormEvent) => {
    event.preventDefault();
    if (!data) return;

    setSubmitting(true);
    setRsvpError("");

    const { data: result, error: submitError } = await supabase.rpc("submit_first_love_night_rsvp", {
      p_full_name: form.full_name.trim(),
      p_email: form.email.trim().toLowerCase(),
      p_mobile: form.mobile.trim() || null,
      p_age_group: form.age_group,
      p_guardian_name: form.guardian_name.trim() || null,
      p_guardian_mobile: form.guardian_mobile.trim() || null,
      p_guardian_consent: form.guardian_consent,
      p_guest_count: guestCount,
      p_church_group: form.church_group.trim() || null,
      p_dietary_requirements: form.dietary_requirements.trim() || "None",
      p_referral_source: form.referral_source || null,
      p_message: form.message.trim() || null,
      p_consent: form.consent,
      p_honeypot: "",
    });

    if (submitError || !result) {
      setRsvpError(
        submitError?.code === "23505"
          ? "This email is already registered for First Love Night."
          : submitError?.message || "We could not complete your RSVP. Please check your details and try again.",
      );
      setSubmitting(false);
      return;
    }

    const confirmationData = result as {
      confirmation_code: string;
      full_name: string;
      guest_count: number;
    };

    setConfirmation({
      code: confirmationData.confirmation_code,
      name: confirmationData.full_name,
      guests: confirmationData.guest_count,
    });
    setStep(3);
    setSubmitting(false);
    openRsvpAnalytics(data.event.id, "register_submit", {
      guests: guestCount,
      age_group: form.age_group,
      referral_source: form.referral_source,
    });
  };

  const share = async () => {
    if (!data) return;
    openRsvpAnalytics(data.event.id, "share_click");

    if (navigator.share) {
      await navigator.share({
        title: data.event.name,
        text: "Join us for First Love Night: The Formal.",
        url: window.location.origin + "/first-love-night",
      });
      return;
    }

    await navigator.clipboard?.writeText(window.location.origin + "/first-love-night");
  };

  const calendarStart = data ? getDateKey(data.event.start_at).replace(/-/g, "") : "";
  const calendarEnd = data ? new Date(
    Date.UTC(
      Number(getDateKey(data.event.start_at).slice(0,4)),
      Number(getDateKey(data.event.start_at).slice(5,7)) - 1,
      Number(getDateKey(data.event.start_at).slice(8,10)) + 1,
    ),
  ).toISOString().slice(0,10).replace(/-/g,"") : "";

  const calendarUrl = data
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.event.name)}&dates=${calendarStart}/${calendarEnd}&details=${encodeURIComponent(content?.vision_copy || "")}&location=${encodeURIComponent(
        `${venue}, Manila, Philippines`,
      )}`
    : "#";

  const directionsUrl = venue !== "TBA"
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${venue}, Manila, Philippines`,
      )}`
    : null;

  if (loading) {
    return (
      <main className="fln-state">
        <LoaderCircle className="fln-spin" />
        <p>Preparing First Love Night…</p>
      </main>
    );
  }

  if (error || !data || !content) {
    return (
      <main className="fln-state">
        <Sparkles />
        <h1>First Love Night</h1>
        <p>{error || "Event details are unavailable."}</p>
        <button type="button" onClick={() => window.location.reload()}>
          TRY AGAIN
        </button>
      </main>
    );
  }

  return (
    <main className="fln-page">
      <nav className="fln-nav" aria-label="First Love Night">
        <button className="fln-wordmark" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <FirstLoveMark compact />
          <span>
            <strong>FIRST LOVE NIGHT</strong>
            <small>THE FORMAL</small>
          </span>
        </button>

        <div className={menuOpen ? "fln-links open" : "fln-links"}>
          {[
            ["Home", "home"],
            ["The Night", "about"],
            ["Dress Code", "dress-code"],
            ["Details", "details"],
            ["FAQ", "faq"],
          ].map(([label, id]) => (
            <button key={id} type="button" onClick={() => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }}>
              {label}
            </button>
          ))}
        </div>

        <div className="fln-nav-actions">
          <button className="fln-share-nav" type="button" onClick={() => void share()} aria-label="Share event">
            <Share2 size={17} />
          </button>
          <button className="fln-register-mini" type="button" onClick={() => openRegistration("nav")}>
            RSVP NOW <ArrowRight size={15} />
          </button>
          <button className="fln-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <section id="home" className="fln-hero">
        <div className="fln-hero-image" style={{ backgroundImage: `url("${content.hero_image_url}")` }} />
        <div className="fln-hero-overlay" />
        <div className="fln-hero-grain" />

        <div className="fln-hero-content">
          <div className="fln-hero-brandline">
            <FirstLoveMark />
            <span>FIRST LOVE NIGHT</span>
            <i aria-hidden="true" />
            <small>{content.audience}</small>
          </div>

          <p className="fln-kicker">A NIGHT FOR THE NEXT GENERATION</p>

          <h1 className="fln-hero-title" aria-label="First Love Night">
            <span>FIRST LOVE</span>
            <span>NIGHT</span>
          </h1>

          <div className="fln-formal-lockup">
            <span>THE FORMAL</span>
            <i aria-hidden="true" />
            <p>A Christ-Centred Night</p>
          </div>

          <div className="fln-hero-date">
            {eventDateParts && (
              <>
                <strong>{eventDateParts.day}</strong>
                <div>
                  <b>{eventDateParts.month}</b>
                  <span>{eventDateParts.year} · {eventDateParts.weekday}</span>
                </div>
              </>
            )}
          </div>

          <div className="fln-hero-location">
            <MapPin size={15} />
            <span>{content.city_label} · {venue === "TBA" ? "VENUE TO BE ANNOUNCED" : venue}</span>
          </div>

          <div className="fln-hero-actions">
            <button className="fln-gold-btn" type="button" onClick={() => openRegistration("hero")}>
              SAVE MY PLACE <ArrowRight size={17} />
            </button>
            <a className="fln-outline-btn" href="#about">
              DISCOVER THE NIGHT
            </a>
          </div>

          <div className="fln-countdown-hero fln-countdown-compact">
            <span>COUNTING DOWN TO FIRST LOVE NIGHT</span>
            <strong>{days}</strong>
            <small>DAYS</small>
          </div>
        </div>

        <div className="fln-hero-bottom">
          <div><strong>{eventDateParts?.day}</strong><span>NOVEMBER 2026</span></div>
          <div><strong>{eventDateParts?.weekday}</strong><span>THE FORMAL</span></div>
          <div><strong>HS + COLLEGE</strong><span>THE NEXT GENERATION</span></div>
        </div>
      </section>

      <section className="fln-intro-strip">
        <div className="fln-strip-brand">
          <FirstLoveMark compact />
          <div>
            <span>FIRST LOVE NIGHT · RSVP REQUIRED</span>
            <strong>Come dressed. Come expectant. Come ready to encounter Jesus.</strong>
          </div>
        </div>
        <button type="button" onClick={() => openRegistration("strip")}>
          SAVE MY PLACE <ArrowRight size={15} />
        </button>
      </section>

      <section id="about" className="fln-vision">
        <div className="fln-vision-art">
          <FirstLoveMark />
          <span>FIRST LOVE NIGHT</span>
          <strong>LOVE</strong>
          <small>FIRST LOVE · 1 JOHN 4:19</small>
        </div>
        <div className="fln-vision-copy">
          <span>WHY WE GATHER</span>
          <h2>First Love Night is more than a formal.</h2>
          <div className="fln-rule" />
          <p>{content.vision_copy}</p>
          <div className="fln-vision-note">
            <Heart size={17} />
            <span>A night to celebrate friendship, make memories and encounter Jesus.</span>
          </div>
        </div>
      </section>

      <section className="fln-experience">
        <div className="fln-section-head">
          <span>WHAT TO EXPECT</span>
          <h2>A night designed to move you.</h2>
          <p>From the first step through the last song, every part of First Love Night is designed for celebration, encounter and real connection.</p>
        </div>

        <div className="fln-experience-grid">
          {content.experience.map((item, index) => (
            <article className="fln-experience-card" key={item.title}>
              <span className="fln-step-number">0{index + 1}</span>
              <div className="fln-experience-icon">
                {item.icon === "cross" ? "✝" : item.icon === "users" ? <Users size={23} /> : item.icon === "sparkles" ? <Sparkles size={23} /> : "◈"}
              </div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="dress-code" className="fln-dress">
        <div className="fln-dress-copy">
          <span>DRESS CODE</span>
          <h2>Make an entrance.</h2>
          <p>Formal attire. Think elegant, polished and photo-ready. More style guidance will be announced closer to the night.</p>
          <div className="fln-dress-badge">
            <ShieldCheck size={18} />
            <span>{content.dress_code.toUpperCase()} ATTIRE</span>
          </div>
        </div>
        <div className="fln-dress-list">
          {content.dress_code_items.map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="details" className="fln-timeline">
        <div className="fln-section-head">
          <span>THE FLOW OF THE NIGHT</span>
          <h2>Come for the moment. Stay for the encounter.</h2>
          <p>Timings will be published here as soon as the final programme is confirmed.</p>
        </div>

        <div className="fln-timeline-track">
          {content.timeline.map((item, index) => (
            <article key={item.title}>
              <div className="fln-timeline-dot" />
              <span>{item.time}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              {index < content.timeline.length - 1 && <i />}
            </article>
          ))}
        </div>
      </section>

      <section className="fln-event-details">
        <div className="fln-detail-visual">
          <FirstLoveMark />
          <span>FIRST LOVE NIGHT</span>
          <strong>THE NIGHT</strong>
          <small>{content.date_label} · {content.weekday}</small>
          <em>THE FORMAL</em>
        </div>

        <div className="fln-detail-content">
          <span>EVENT DETAILS</span>
          <h2>Save the date.</h2>

          <div className="fln-detail-grid">
            <article>
              <CalendarDays />
              <small>DATE</small>
              <strong>{eventDate}</strong>
              <span>{content.weekday}</span>
            </article>
            <article>
              <Clock3 />
              <small>TIME</small>
              <strong>{content.time_label}</strong>
              <span>Details soon</span>
            </article>
            <article>
              <MapPin />
              <small>VENUE</small>
              <strong>{venue}</strong>
              <span>{content.city_label}</span>
            </article>
            <article>
              <Users />
              <small>FOR</small>
              <strong>High School +<br />College Students</strong>
              <span>RSVP required</span>
            </article>
          </div>

          <div className="fln-detail-actions">
            <a href={calendarUrl} target="_blank" rel="noreferrer" className="fln-outline-dark">
              ADD TO CALENDAR
            </a>
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="fln-outline-dark"
                onClick={() => openRsvpAnalytics(data.event.id, "directions_click")}
              >
                DIRECTIONS
              </a>
            ) : (
              <span className="fln-outline-dark fln-disabled-action">
                DIRECTIONS · VENUE TBA
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="fln-story-strip">
        <div className="fln-story-image" style={{ backgroundImage: `url("${content.hero_image_url}")` }}>
          <span>THE FIRST IMPRESSION</span>
        </div>
        <div className="fln-story-copy">
          <span>THE NIGHT IN THREE WORDS</span>
          <strong>CELEBRATE.</strong>
          <strong>ENCOUNTER.</strong>
          <strong>CONNECT.</strong>
          <p>Dress up. Bring your friends. Make memories. Then make space for the thing that matters most.</p>
        </div>
      </section>

      <section className="fln-final-cta">
        <div className="fln-final-glow" />
        <FirstLoveMark />
        <span>FIRST LOVE NIGHT · 14 NOVEMBER 2026</span>
        <h2>THIS IS YOUR NIGHT.</h2>
        <p>Come dressed. Come expectant. Come ready for an encounter.</p>
        <button className="fln-gold-btn" type="button" onClick={() => openRegistration("final_cta")}>
          SAVE MY PLACE <ArrowRight size={17} />
        </button>
        <button className="fln-share-link" type="button" onClick={() => void share()}>
          <Share2 size={15} /> SHARE THIS NIGHT
        </button>
      </section>

      <section id="faq" className="fln-faq">
        <div className="fln-section-head">
          <span>GOOD TO KNOW</span>
          <h2>Before the formal.</h2>
          <p>Everything you need to know before you say yes.</p>
        </div>

        <div className="fln-faq-list">
          {content.faqs.map((item, index) => (
            <article key={item.question} className={faqOpen === index ? "open" : ""}>
              <button type="button" onClick={() => setFaqOpen(faqOpen === index ? null : index)} aria-expanded={faqOpen === index}>
                <span>0{index + 1}</span>
                <strong>{item.question}</strong>
                <ChevronDown size={18} />
              </button>
              {faqOpen === index && <p>{item.answer}</p>}
            </article>
          ))}
        </div>
      </section>

      <footer className="fln-footer">
        <div>
          <strong>FIRST LOVE NIGHT</strong>
          <span>THE FORMAL</span>
        </div>
        <div>
          <span>14 NOVEMBER 2026</span>
          <span>MANILA, PHILIPPINES</span>
        </div>
      </footer>

      {data.announcement.registration_enabled && (
        <div className="fln-mobile-rsvp">
          <div>
            <span>FIRST LOVE NIGHT</span>
            <strong>SAVE YOUR PLACE</strong>
          </div>
          <button type="button" onClick={() => openRegistration("mobile_sticky")}>
            RSVP NOW <ArrowRight size={15} />
          </button>
        </div>
      )}

      {rsvpOpen && (
        <div className="fln-rsvp-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && closeRegistration()}>
          <section className="fln-rsvp-modal" role="dialog" aria-modal="true" aria-labelledby="fln-rsvp-title">
            <button ref={rsvpCloseRef} className="fln-rsvp-close" type="button" onClick={closeRegistration} aria-label="Close RSVP">
              <X size={20} />
            </button>

            {!confirmation ? (
              <>
                <div className="fln-rsvp-head">
                  <span>YOUR PLACE AT THE TABLE</span>
                  <h2 id="fln-rsvp-title">Reserve your<br /><em>place at First Love Night.</em></h2>
                  <p>Three quick steps. Your details help the team prepare the welcome, food, seating and experience for the night.</p>
                </div>

                <div className="fln-rsvp-progress" aria-label="Registration progress">
                  {[["01", "YOU"], ["02", "YOUR NIGHT"], ["03", "CONFIRM"]].map(([number, label], index) => (
                    <div key={number} className={step >= index + 1 ? "active" : ""}>
                      <span>{number}</span>
                      <strong>{label}</strong>
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <form className="fln-rsvp-form" onSubmit={continueStepOne}>
                    <div className="fln-form-grid">
                      <label>
                        <span>FULL NAME *</span>
                        <input required minLength={2} autoComplete="name" value={form.full_name} onChange={(event) => update("full_name", event.target.value)} placeholder="Juan Dela Cruz" />
                      </label>
                      <label>
                        <span>EMAIL *</span>
                        <input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" />
                      </label>
                      <label>
                        <span>MOBILE NUMBER *</span>
                        <input required type="tel" autoComplete="tel" value={form.mobile} onChange={(event) => update("mobile", event.target.value)} placeholder="09XX XXX XXXX" />
                      </label>
                      <label>
                        <span>AGE GROUP *</span>
                        <select required value={form.age_group} onChange={(event) => update("age_group", event.target.value as RsvpForm["age_group"])}>
                          <option value="">Select your age group</option>
                          <option value="high_school">High School</option>
                          <option value="college">College</option>
                        </select>
                      </label>
                    </div>

                    {form.age_group === "high_school" && (
                      <div className="fln-guardian-box">
                        <div>
                          <ShieldCheck size={20} />
                          <div>
                            <strong>Parent / guardian details</strong>
                            <p>Because you are registering as a high-school attendee, we need a parent or guardian contact.</p>
                          </div>
                        </div>
                        <div className="fln-form-grid">
                          <label>
                            <span>GUARDIAN NAME *</span>
                            <input required value={form.guardian_name} onChange={(event) => update("guardian_name", event.target.value)} placeholder="Parent / Guardian" />
                          </label>
                          <label>
                            <span>GUARDIAN MOBILE *</span>
                            <input required type="tel" value={form.guardian_mobile} onChange={(event) => update("guardian_mobile", event.target.value)} placeholder="09XX XXX XXXX" />
                          </label>
                        </div>
                        <label className="fln-check-row">
                          <input type="checkbox" checked={form.guardian_consent} onChange={(event) => update("guardian_consent", event.target.checked)} />
                          <span>I confirm that a parent / guardian has given consent for this registration.</span>
                        </label>
                      </div>
                    )}

                    {rsvpError && <div className="fln-rsvp-error" role="alert">{rsvpError}</div>}

                    <button className="fln-rsvp-submit" type="submit">
                      CONTINUE <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form className="fln-rsvp-form" onSubmit={continueStepTwo}>
                    <div className="fln-form-grid">
                      <label>
                        <span>NUMBER OF GUESTS</span>
                        <select value={form.guest_count} onChange={(event) => update("guest_count", event.target.value)}>
                          {Array.from({ length: 6 }, (_, index) => <option key={index} value={index}>{index === 0 ? "Just me" : `${index} guest${index > 1 ? "s" : ""}`}</option>)}
                        </select>
                      </label>
                      <label>
                        <span>CHURCH / COMMUNITY</span>
                        <input value={form.church_group} onChange={(event) => update("church_group", event.target.value)} placeholder="Vibe, community, school, etc." />
                      </label>
                      <label>
                        <span>DIETARY REQUIREMENTS</span>
                        <select value={form.dietary_requirements} onChange={(event) => update("dietary_requirements", event.target.value)}>
                          <option>None</option>
                          <option>Vegetarian</option>
                          <option>Halal</option>
                          <option>Allergy — please explain below</option>
                        </select>
                      </label>
                      <label>
                        <span>HOW DID YOU HEAR ABOUT US?</span>
                        <select value={form.referral_source} onChange={(event) => update("referral_source", event.target.value)}>
                          <option value="">Select one</option>
                          <option>Friend</option>
                          <option>Vibe / Bacenta</option>
                          <option>Church</option>
                          <option>Social Media</option>
                          <option>School</option>
                          <option>Other</option>
                        </select>
                      </label>
                      <label className="fln-full-field">
                        <span>ANYTHING WE SHOULD KNOW? OPTIONAL</span>
                        <textarea rows={4} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="Dietary notes, accessibility needs, or anything else for the event team." />
                      </label>
                    </div>

                    {rsvpError && <div className="fln-rsvp-error" role="alert">{rsvpError}</div>}

                    <div className="fln-rsvp-form-actions">
                      <button className="fln-rsvp-back" type="button" onClick={() => setStep(1)}>BACK</button>
                      <button className="fln-rsvp-submit" type="submit">REVIEW RSVP <ArrowRight size={16} /></button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form className="fln-rsvp-form" onSubmit={submitRsvp}>
                    <div className="fln-confirm-card">
                      <div className="fln-confirm-top">
                        <span>YOUR RESERVATION</span>
                        <strong>FIRST LOVE NIGHT · THE FORMAL</strong>
                      </div>
                      <div className="fln-confirm-grid">
                        <div><small>GUEST</small><strong>{form.full_name}</strong></div>
                        <div><small>AGE GROUP</small><strong>{form.age_group === "high_school" ? "High School" : "College"}</strong></div>
                        <div><small>GUESTS</small><strong>{guestCount + 1}</strong></div>
                        <div><small>DATE</small><strong>{content.date_label}</strong></div>
                        <div><small>VENUE</small><strong>{venue}</strong></div>
                        <div><small>DRESS CODE</small><strong>{content.dress_code}</strong></div>
                      </div>
                    </div>

                    <label className="fln-check-row fln-final-consent">
                      <input type="checkbox" required checked={form.consent} onChange={(event) => update("consent", event.target.checked)} />
                      <span>I confirm my information is accurate and agree to be contacted about First Love Night.</span>
                    </label>

                    {rsvpError && <div className="fln-rsvp-error" role="alert">{rsvpError}</div>}

                    <button className="fln-rsvp-submit" type="submit" disabled={submitting}>
                      {submitting ? <><LoaderCircle className="fln-spin" size={16} /> SECURING YOUR PLACE…</> : <>CONFIRM MY RSVP <Check size={16} /></>}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="fln-confirmed">
                <div className="fln-confirmed-mark"><CheckCircle2 size={37} /></div>
                <span>FIRST LOVE NIGHT · CONFIRMED</span>
                <h2>You're going<br /><em>to First Love Night.</em></h2>
                <p>{confirmation.name}, your place is secured. Keep this confirmation code for check-in on the night.</p>

                <div className="fln-pass">
                  <div>
                    <small>CONFIRMATION CODE</small>
                    <strong>{confirmation.code}</strong>
                  </div>
                  <div>
                    <small>DATE</small>
                    <strong>{content.date_label}</strong>
                  </div>
                  <div>
                    <small>GUESTS</small>
                    <strong>{confirmation.guests + 1}</strong>
                  </div>
                </div>

                <div className="fln-confirm-actions">
                  <button type="button" className="fln-outline-dark" onClick={() => void navigator.clipboard?.writeText(confirmation.code)}>
                    <Copy size={15} /> COPY CHECK-IN CODE
                  </button>
                  <a href={calendarUrl} target="_blank" rel="noreferrer" className="fln-outline-dark">
                    <CalendarDays size={15} /> CALENDAR
                  </a>
                </div>

                <button type="button" className="fln-confirm-close" onClick={closeRegistration}>
                  BACK TO EVENT <ArrowRight size={15} />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
