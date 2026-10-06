import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./festivalofstars-announcement.css";

type FaqItem = { question: string; answer: string };
type TimelineItem = { title: string; copy: string; tag: string };
type MoreEventItem = {
  title: string;
  copy: string;
  accent: "red" | "yellow" | "blue" | "white";
};
type Talent = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  accent: string;
};
type AnnouncementContent = {
  kicker?: string;
  tagline?: string;
  hero_copy?: string;
  audience?: string;
  age_label?: string;
  about_title?: string;
  about_copy?: string;
  about_body?: string;
  talent_title?: string;
  talent_intro?: string;
  performers_intro?: string;
  purpose?: string;
  what_to_bring?: string[];
  timeline?: TimelineItem[];
  more_than_event?: MoreEventItem[];
  faqs?: FaqItem[];
};
type PublicFestival = {
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
    hero_image_url: string | null;
    seo_title: string | null;
    seo_description: string | null;
    content: AnnouncementContent;
  };
  talents: Talent[];
};

const SLUG = "festival-of-stars";
const RSVP_URL = "/festivalofstars/announcement/register";
const FALLBACK_IMAGE = "/festival-assets/festival-moodboard.jpg";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value)).toUpperCase();
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTimeLeft(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function buildCalendarUrl(festival: PublicFestival) {
  const start = new Date(festival.event.start_at)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const endDate = festival.event.end_at
    ? new Date(festival.event.end_at)
    : new Date(new Date(festival.event.start_at).getTime() + 3 * 60 * 60 * 1000);
  const end = endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const title = encodeURIComponent(festival.event.name || "Festival of Stars");
  const details = encodeURIComponent(
    "A celebration of the talent, creativity, fellowship, and unity of the First Love Experience community.",
  );
  const location = encodeURIComponent(
    festival.event.location || "Villar Sipag, Las Piñas, Philippines",
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export default function FestivalOfStarsAnnouncement() {
  const [festival, setFestival] = useState<PublicFestival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [openFaq, setOpenFaq] = useState(0);
  const [selectedMore, setSelectedMore] = useState(0);
  const [selectedTimeline, setSelectedTimeline] = useState(0);
  const [selectedPerformerIndex, setSelectedPerformerIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "get_public_festival_of_stars",
        { p_slug: SLUG },
      );

      if (cancelled) return;

      if (rpcError || !data) {
        setError("This announcement is temporarily unavailable.");
        setLoading(false);
        return;
      }

      setFestival(data as PublicFestival);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!festival) return;

    const tick = () => setTimeLeft(getTimeLeft(festival.event.start_at));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [festival]);

  useEffect(() => {
    if (!festival) return;

    const seoTitle =
      festival.announcement.seo_title || "Festival of Stars · First Love Experience";
    const seoDescription =
      festival.announcement.seo_description ||
      festival.announcement.content.purpose ||
      "Festival of Stars is a celebration of the First Love Experience community.";
    const image =
      festival.announcement.hero_image_url || FALLBACK_IMAGE;
    const canonicalUrl = `${window.location.origin}/festivalofstars/announcement`;

    document.title = seoTitle;

    const setMeta = (
      selector: string,
      attr: string,
      key: string,
      value: string,
    ) => {
      let node = document.head.querySelector<HTMLMetaElement>(selector);
      if (!node) {
        node = document.createElement("meta");
        node.setAttribute(attr, key);
        document.head.appendChild(node);
      }
      node.content = value;
    };

    setMeta('meta[name="description"]', "name", "description", seoDescription);
    setMeta('meta[property="og:title"]', "property", "og:title", seoTitle);
    setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      seoDescription,
    );
    setMeta(
      'meta[property="og:image"]',
      "property",
      "og:image",
      new URL(image, window.location.origin).toString(),
    );
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta(
      'meta[property="og:url"]',
      "property",
      "og:url",
      canonicalUrl,
    );
    setMeta(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card",
      "summary_large_image",
    );
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", seoTitle);
    setMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      seoDescription,
    );
    setMeta(
      'meta[name="twitter:image"]',
      "name",
      "twitter:image",
      new URL(image, window.location.origin).toString(),
    );

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const ldId = "festival-of-stars-event-jsonld";
    document.getElementById(ldId)?.remove();

    const script = document.createElement("script");
    script.id = ldId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: festival.event.name || "Festival of Stars",
      description: seoDescription,
      startDate: festival.event.start_at,
      endDate: festival.event.end_at || undefined,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: festival.event.location || "Villar Sipag",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Las Piñas",
          addressCountry: "PH",
        },
      },
      organizer: {
        "@type": "Organization",
        name: "First Love Church Philippines",
      },
      image: [new URL(image, window.location.origin).toString()],
      url: canonicalUrl,
    });
    document.head.appendChild(script);

    return () => {
      document.getElementById(ldId)?.remove();
    };
  }, [festival]);

  const content = festival?.announcement.content;
  const faqs = content?.faqs || [];
  const timeline = content?.timeline || [];
  const moreItems =
    content?.more_than_event || [
      {
        title: "Talent",
        copy: "Recognize and celebrate the gifts God has placed in our community.",
        accent: "red" as const,
      },
      {
        title: "Creativity",
        copy: "Make room for music, movement, storytelling, and creative expression.",
        accent: "yellow" as const,
      },
      {
        title: "Fellowship",
        copy: "Strengthen friendships and create memories as one church family.",
        accent: "blue" as const,
      },
      {
        title: "Unity",
        copy: "Bring different stories and gifts together around one shared celebration.",
        accent: "white" as const,
      },
    ];

  const selectedTimelineItem = timeline[selectedTimeline] || timeline[0];
  const performers = festival?.talents || [];
  const selectedPerformer = performers[selectedPerformerIndex] || performers[0] || null;

  const eventDate = festival ? formatDate(festival.event.start_at) : "";
  const eventTime = festival ? formatTime(festival.event.start_at) : "";
  const mapUrl = festival?.event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${festival.event.location}, Las Piñas, Philippines`,
      )}`
    : "#";
  const calendarUrl = festival ? buildCalendarUrl(festival) : "#";
  const mapEmbedUrl = festival
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${festival.event.location || "Villar Sipag"}, Las Piñas, Philippines`,
      )}&output=embed`
    : "";
  const countdownDone =
    timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds === 0;

  const copyEventDetails = async () => {
    if (!festival) return;
    const text = [
      "Festival of Stars",
      eventDate,
      eventTime,
      festival.event.location || "Villar Sipag, Las Piñas",
      content?.purpose ||
        "A celebration of the talent, creativity, fellowship, and unity of the First Love Experience community.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const shareEvent = async () => {
    if (!festival) return;

    const shareData = {
      title: festival.event.name || "Festival of Stars",
      text: `Festival of Stars · ${formatShortDate(festival.event.start_at)} · ${eventTime}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setShared(true);
    } catch {
      setShared(false);
    }

    window.setTimeout(() => setShared(false), 2200);
  };

  if (loading) {
    return (
      <main className="foa-state">
        <div className="foa-loader-orbit"><span /><span /><span /></div>
        <p>Loading Festival of Stars…</p>
      </main>
    );
  }

  if (!festival) {
    return (
      <main className="foa-state">
        <Sparkles size={32} />
        <h1>Announcement unavailable</h1>
        <p>{error || "Please try again later."}</p>
      </main>
    );
  }

  return (
    <main className="foa-page">
      <a className="foa-skip-link" href="#main-content">Skip to content</a>

      <header className="foa-nav">
        <a className="foa-brand" href="#home" aria-label="Festival of Stars home">
          <span className="foa-brand-logo">
            <img src="/images/app_logo.png" alt="" loading="eager" />
          </span>
          <span>
            First Love Church
            <small>PHILIPPINES</small>
          </span>
        </a>

        <nav
          className={`foa-site-nav ${mobileMenu ? "open" : ""}`}
          aria-label="Festival of Stars sections"
        >
          <a href="#purpose" onClick={() => setMobileMenu(false)}>Purpose</a>
          <a href="#more-event" onClick={() => setMobileMenu(false)}>More Than an Event</a>
          <a href="#timeline" onClick={() => setMobileMenu(false)}>Program</a>
          <a href="#performers" onClick={() => setMobileMenu(false)}>Performers</a>
          <a href="#details" onClick={() => setMobileMenu(false)}>Details</a>
          <a href="#faq" onClick={() => setMobileMenu(false)}>FAQ</a>
        </nav>

        <div className="foa-nav-actions">
          <button className="foa-share-button" type="button" onClick={shareEvent}>
            <Share2 size={15} /> SHARE
          </button>
          {festival.announcement.registration_enabled && (
            <a className="foa-nav-register" href={RSVP_URL}>
              RSVP <ArrowRight size={15} />
            </a>
          )}
          <button
            className="foa-menu-button"
            type="button"
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu((value) => !value)}
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <div id="main-content">
        <section id="home" className="foa-hero">
          <div className="foa-blue-noise" aria-hidden="true" />
          <div className="foa-lightning lightning-one" aria-hidden="true" />
          <div className="foa-lightning lightning-two" aria-hidden="true" />
          <div className="foa-burst burst-one" aria-hidden="true">✦</div>
          <div className="foa-burst burst-two" aria-hidden="true">★</div>

          <div className="foa-hero-copy">
            <p className="foa-eyebrow">
              {content?.kicker || "ONE CHURCH · MANY STORIES · ONE BIG CELEBRATION"}
            </p>
            <div className="foa-kicker">FIRST LOVE CHURCH PRESENTS</div>

            <h1>
              <span>FESTIVAL</span>
              <strong>OF STARS</strong>
            </h1>

            <div className="foa-date-sticker">
              <CalendarDays size={18} />
              <span>{formatShortDate(festival.event.start_at)}</span>
            </div>

            <p className="foa-hero-message">
              {content?.tagline || "SHINE · BELONG · MAKE A DIFFERENCE"}
            </p>
            <p className="foa-hero-support">
              {content?.hero_copy ||
                "A celebration of the talent, creativity, fellowship, and unity of the First Love Experience community."}
            </p>

            <div className="foa-actions">
              {festival.announcement.registration_enabled && (
                <a className="foa-primary" href={RSVP_URL}>
                  RSVP NOW <ArrowRight size={20} />
                </a>
              )}
              <a className="foa-secondary" href="#purpose">
                DISCOVER THE NIGHT <ArrowDown size={17} />
              </a>
              <button className="foa-hero-share" type="button" onClick={shareEvent}>
                <MessageCircle size={17} /> SHARE THIS INVITE
              </button>
            </div>

            <div className="foa-hero-microcopy">
              <span><Users size={14} /> {content?.audience || "FOR YOUTH & YOUNG ADULTS"}</span>
              <span><Clock3 size={14} /> {eventTime}</span>
              <span><MapPin size={14} /> {festival.event.location || "Villar Sipag"}</span>
            </div>
            {shared && <span className="foa-share-status" aria-live="polite">INVITE READY TO SHARE ✦</span>}
          </div>

          <div className="foa-hero-poster" aria-label="Festival of Stars poster preview">
            <div className="foa-poster-image">
              <img
                src={festival.announcement.hero_image_url || FALLBACK_IMAGE}
                alt=""
                loading="eager"
              />
            </div>
            <div className="foa-poster-shade" />
            <div className="foa-poster-topline">FIRST LOVE CHURCH PHILIPPINES</div>
            <div className="foa-poster-title">
              <span>FESTIVAL</span>
              <em>OF</em>
              <strong>STARS</strong>
            </div>
            <div className="foa-poster-time">{eventTime}</div>
            <div className="foa-poster-meta">
              <span>{formatShortDate(festival.event.start_at)}</span>
              <span>{festival.event.location || "VILLAR SIPAG"}</span>
            </div>
            <div className="foa-poster-stamp">FIRST LOVE EXPERIENCE</div>
          </div>
        </section>

        <section className="foa-countdown" aria-label="Festival of Stars countdown">
          <div className="foa-countdown-copy">
            <span>THE STAR COUNTDOWN</span>
            <h2>{countdownDone ? "THE NIGHT IS HERE." : "GET READY."}</h2>
            <p aria-live="polite">
              {countdownDone
                ? "Festival of Stars is happening now."
                : `${eventDate} · ${eventTime} · ${festival.event.location || "Villar Sipag"}`}
            </p>
          </div>

          <div className="foa-countdown-grid">
            {[
              ["DAYS", timeLeft.days],
              ["HOURS", timeLeft.hours],
              ["MIN", timeLeft.minutes],
              ["SEC", timeLeft.seconds],
            ].map(([label, value]) => (
              <div className="foa-count-box" key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="foa-countdown-actions">
            <a className="foa-primary foa-small-button" href={calendarUrl} target="_blank" rel="noreferrer">
              <CalendarDays size={16} /> SAVE DATE
            </a>
            <button className="foa-secondary foa-small-button foa-copy-button" type="button" onClick={copyEventDetails}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "COPIED" : "COPY DETAILS"}
            </button>
          </div>
        </section>

        <section id="purpose" className="foa-purpose">
          <div className="foa-purpose-art" aria-hidden="true">
            <div className="foa-purpose-star">✦</div>
            <div className="foa-purpose-sticker">THIS IS WHY<br />WE CELEBRATE.</div>
          </div>
          <div className="foa-purpose-copy">
            <span className="foa-section-label">THE PURPOSE</span>
            <h2>WHY <em>FESTIVAL</em><br />OF STARS?</h2>
            <p className="foa-purpose-lead">
              {content?.purpose ||
                "Festival of Stars is a celebration of the talent, creativity, fellowship, and unity of the First Love Experience community."}
            </p>
            <p>
              {content?.about_copy ||
                "It is more than a program. It is a moment for our community to come together, recognize the gifts among us, strengthen relationships, and celebrate what God is doing through First Love Experience."}
            </p>

            <div className="foa-purpose-pills">
              <span><Star size={15} /> TALENT</span>
              <span><Sparkles size={15} /> CREATIVITY</span>
              <span><Users size={15} /> FELLOWSHIP</span>
              <span><Heart size={15} /> UNITY</span>
            </div>
          </div>
        </section>

        <section className="foa-more-event" id="more-event">
          <div className="foa-more-event-head">
            <span>MORE THAN AN EVENT</span>
            <h2>MORE THAN<br /><em>A SHOW.</em></h2>
            <p>
              The heart of Festival of Stars is bigger than what happens on stage.
              Explore what this celebration means to the First Love Experience community.
            </p>
          </div>

          <div className="foa-more-grid">
            {moreItems.map((item, index) => {
              const active = selectedMore === index;
              const Icon =
                index === 0 ? Star : index === 1 ? Sparkles : index === 2 ? Users : Heart;

              return (
                <button
                  key={item.title}
                  type="button"
                  className={`foa-more-card more-${item.accent} ${active ? "selected" : ""}`}
                  aria-pressed={active}
                  onClick={() => setSelectedMore(index)}
                >
                  <span className="foa-more-number">0{index + 1}</span>
                  <span className="foa-more-icon"><Icon /></span>
                  <h3>{item.title.toUpperCase()}</h3>
                  <p>{item.copy}</p>
                  <b>{active ? "ACTIVE ✦" : "EXPLORE ✦"}</b>
                </button>
              );
            })}
          </div>

          <div className="foa-more-selected" aria-live="polite">
            <span>YOU SELECTED</span>
            <strong>{moreItems[selectedMore]?.title || "Talent"}</strong>
            <p>
              {moreItems[selectedMore]?.copy ||
                "Your gifts are part of what makes the First Love Experience community special."}
            </p>
          </div>

          <div className="foa-more-note">
            <Zap size={18} />
            <span>THE HEART OF THE NIGHT</span>
            <strong>NOT JUST A PERFORMANCE — A CELEBRATION OF WHO WE ARE TOGETHER.</strong>
          </div>
        </section>

        <section className="foa-timeline" id="timeline">
          <div className="foa-timeline-head">
            <span>WHAT HAPPENS THAT NIGHT?</span>
            <h2>GATHER.<br /><em>CELEBRATE.</em><br />SHINE.</h2>
            <p>
              A simple flow built around community, celebration, and shared joy.
            </p>
          </div>

          <div className="foa-timeline-body">
            <div className="foa-timeline-tabs">
              {(timeline.length
                ? timeline
                : [
                    { tag: "01", title: "GATHER", copy: "Come together as one community." },
                    { tag: "02", title: "CELEBRATE", copy: "Celebrate gifts and creativity." },
                    { tag: "03", title: "CONNECT", copy: "Strengthen friendships and make memories." },
                    { tag: "04", title: "SHINE", copy: "Celebrate unity and the part you bring." },
                  ]
              ).map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  className={selectedTimeline === index ? "active" : ""}
                  onClick={() => setSelectedTimeline(index)}
                  aria-pressed={selectedTimeline === index}
                >
                  <span>{item.tag}</span>
                  <strong>{item.title}</strong>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>

            <div className="foa-timeline-feature">
              <span>{selectedTimelineItem?.tag || "01"}</span>
              <h3>{selectedTimelineItem?.title || "GATHER"}</h3>
              <p>{selectedTimelineItem?.copy || "Come together as one community."}</p>
              <div className="foa-timeline-quote">
                <Sparkles size={16} />
                <b>ONE NIGHT · ONE COMMUNITY</b>
              </div>
            </div>
          </div>
        </section>

        <section className="foa-performers" id="performers">
          <div className="foa-performers-head">
            <span>FIRST LOVE CHURCH</span>
            <h2>{content?.talent_title || "FIRST LOVE"} <em>PERFORMERS</em></h2>
            <p>
              {content?.performers_intro ||
                content?.talent_intro ||
                "The celebration features approved First Love Church performers across singing, rap, and acting."}
            </p>
          </div>

          <div className="foa-performer-layout">
            <div className="foa-performer-list">
              {performers.map((performer, index) => {
                const active = selectedPerformerIndex === index;
                return (
                  <button
                    key={performer.id}
                    type="button"
                    className={`foa-performer-tab ${active ? "active" : ""}`}
                    onClick={() => setSelectedPerformerIndex(index)}
                    aria-pressed={active}
                  >
                    <span>0{index + 1}</span>
                    <strong>{performer.name}</strong>
                    <small>{performer.tagline}</small>
                    <ArrowRight size={17} />
                  </button>
                );
              })}
            </div>

            <div className="foa-performer-feature">
              <div className="foa-performer-burst">✦</div>
              {selectedPerformer ? (
                <>
                  <span>{selectedPerformer.name}</span>
                  <h3>{selectedPerformer.tagline}</h3>
                  <p>{selectedPerformer.description}</p>
                </>
              ) : (
                <>
                  <span>FIRST LOVE</span>
                  <h3>PERFORMERS</h3>
                  <p>Approved First Love Church performers will lead the creative moments of the celebration.</p>
                </>
              )}
              <div className="foa-performer-note">
                <Check size={15} />
                Approved First Love Church performers only
              </div>
            </div>
          </div>
        </section>

        <section className="foa-details" id="details">
          <div className="foa-section-heading">
            <span>EVENT DETAILS</span>
            <h2>MEET US<br /><em>THERE.</em></h2>
            <p>
              Everything you need to plan your Festival of Stars experience.
            </p>
          </div>

          <div className="foa-detail-grid">
            <article className="foa-card">
              <span className="foa-card-icon"><CalendarDays /></span>
              <div>
                <small>DATE & TIME</small>
                <h3>{eventDate}</h3>
                <p>{eventTime}</p>
              </div>
            </article>

            <article className="foa-card">
              <span className="foa-card-icon"><MapPin /></span>
              <div>
                <small>VENUE</small>
                <h3>{festival.event.location || "Villar Sipag"}</h3>
                <p>Las Piñas, Philippines</p>
              </div>
            </article>

            <article className="foa-card">
              <span className="foa-card-icon"><Users /></span>
              <div>
                <small>WHO IS IT FOR?</small>
                <h3>{content?.audience || "YOUTH & YOUNG ADULTS"}</h3>
                <p>{content?.age_label || "AGES 13 AND UP"}</p>
              </div>
            </article>
          </div>

          <div className="foa-detail-actions">
            <a className="foa-primary" href={mapUrl} target="_blank" rel="noreferrer">
              <MapPin size={17} /> GET DIRECTIONS
            </a>
            <a className="foa-secondary dark-button" href={calendarUrl} target="_blank" rel="noreferrer">
              <CalendarDays size={17} /> ADD TO CALENDAR
            </a>
            <button className="foa-secondary dark-button" type="button" onClick={copyEventDetails}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "DETAILS COPIED" : "COPY EVENT DETAILS"}
            </button>
          </div>

          <div className="foa-bring-list">
            <div>
              <span>COME READY</span>
              <h3>WHAT SHOULD I BRING?</h3>
            </div>
            <div className="foa-bring-items">
              {(content?.what_to_bring || [
                "Yourself and your friends",
                "An open heart and positive energy",
                "A ready-to-celebrate attitude",
              ]).map((item) => (
                <span key={item}><Check size={15} /> {item}</span>
              ))}
            </div>
          </div>

          <div className="foa-map-card">
            <div className="foa-map-info">
              <span>FIND YOUR WAY</span>
              <h3>SEE YOU<br /><em>AT VILLAR SIPAG.</em></h3>
              <p>Use the map preview to check the venue before you head out.</p>
              <a className="foa-map-link" href={mapUrl} target="_blank" rel="noreferrer">
                OPEN IN GOOGLE MAPS <ArrowRight size={16} />
              </a>
            </div>
            <iframe
              title={`Map to ${festival.event.location || "Villar Sipag"}`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className="foa-share-cta">
          <div>
            <span>THIS IS YOUR INVITE</span>
            <h2>SHARE IT<br /><em>WITH YOUR PEOPLE.</em></h2>
            <p>Send the Festival of Stars invite to someone you want beside you.</p>
          </div>
          <div className="foa-share-cta-actions">
            <button type="button" onClick={shareEvent}>
              <Share2 size={17} /> SHARE EVENT
            </button>
            <button type="button" onClick={copyEventDetails}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "COPIED" : "COPY INVITE"}
            </button>
          </div>
        </section>

        <section className="foa-faq" id="faq">
          <div className="foa-faq-heading">
            <span>GOOD QUESTIONS</span>
            <h2>BEFORE YOU<br /><em>COME.</em></h2>
            <p>
              Everything you need to know before Festival of Stars.
            </p>
          </div>

          <div className="foa-faq-list">
            {faqs.length ? (
              faqs.map((item, index) => {
                const open = openFaq === index;
                return (
                  <article className={`foa-faq-item ${open ? "open" : ""}`} key={item.question}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : index)}
                    >
                      <span className="foa-faq-number">0{index + 1}</span>
                      <strong>{item.question}</strong>
                      <ChevronDown size={20} />
                    </button>
                    {open && <p>{item.answer}</p>}
                  </article>
                );
              })
            ) : (
              <div className="foa-faq-empty">No FAQ items are currently published.</div>
            )}
          </div>
        </section>

        <section className="foa-final">
          <div className="foa-final-glow" aria-hidden="true" />
          <span className="foa-final-label">{formatShortDate(festival.event.start_at)} · {eventTime}</span>
          <h2>SEE YOU<br /><em>AT THE STARS.</em></h2>
          <p>
            Bring your people. Bring your energy. Come celebrate the First Love Experience family.
          </p>
          {festival.announcement.registration_enabled && (
            <a className="foa-primary" href={RSVP_URL}>
              RSVP NOW <ArrowRight size={20} />
            </a>
          )}
          <button className="foa-final-share" type="button" onClick={shareEvent}>
            <Share2 size={18} /> SHARE EVENT
          </button>
          <div className="foa-final-doodle" aria-hidden="true">
            <Star /><Star /><Star />
          </div>
        </section>
      </div>

      {festival.announcement.registration_enabled && (
        <div className="foa-mobile-rsvp">
          <a href={RSVP_URL}>RSVP NOW <ArrowRight size={17} /></a>
        </div>
      )}

      <footer className="foa-footer">
        <span>FIRST LOVE CHURCH PHILIPPINES</span>
        <span>FESTIVAL OF STARS · {formatShortDate(festival.event.start_at)}</span>
      </footer>
    </main>
  );
}
