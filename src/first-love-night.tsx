import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  LoaderCircle,
  MapPin,
  Menu,
  Users,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./firstlovenight.css";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
};

type Rsvp = {
  full_name: string;
  email: string;
  mobile: string;
  guests: string;
  message: string;
};

const EVENT = {
  name: "First Love Night: The Formal",
  date: "14 November 2026",
  dateLabel: "14 NOVEMBER 2026",
  weekday: "SATURDAY",
  location: "TBA",
  city: "MANILA, PHILIPPINES",
  audience: "HIGH SCHOOL + COLLEGE STUDENTS",
  dressCode: "Formal",
  description:
    "A special formal night where young people can dress beautifully, have fun, build friendships and experience the love of Jesus.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getCountdown(target: string | null) {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export default function FirstLoveNight() {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState<Rsvp>({
    full_name: "",
    email: "",
    mobile: "",
    guests: "0",
    message: "",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("events")
        .select("id,name,description,start_at,end_at,location")
        .eq("is_active", true)
        .ilike("name", "%First Love Night%")
        .order("start_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (data) setEvent(data as EventRow);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const target = event?.start_at || "2026-11-14T00:00:00+08:00";
    const tick = () => setCountdown(getCountdown(target));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [event]);

  useEffect(() => {
    document.title = "First Love Night · The Formal";
  }, []);

  const startAt = event?.start_at || "2026-11-14T00:00:00+08:00";
  const venue = event?.location || EVENT.location;
  const eventDate = event ? formatDate(startAt) : EVENT.date;
  const eventTime = event ? formatTime(startAt) : "TBA";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue}, Manila, Philippines`,
  )}`;

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    EVENT.name,
  )}&dates=${encodeURIComponent(
    new Date(startAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"),
  )}/${encodeURIComponent(
    new Date(event?.end_at || new Date(new Date(startAt).getTime() + 3 * 60 * 60 * 1000))
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z"),
  )}&details=${encodeURIComponent(EVENT.description)}&location=${encodeURIComponent(
    `${venue}, Manila, Philippines`,
  )}`;

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const updateForm = (field: keyof Rsvp, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitRsvp = async (e: FormEvent) => {
    e.preventDefault();
    setRsvpError("");

    if (!event) {
      setRsvpError("RSVP is temporarily unavailable. Please try again later.");
      return;
    }
    if (!consent) {
      setRsvpError("Please confirm your information and consent to event follow-up.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("festival_registrations").insert({
      event_id: event.id,
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim() || null,
      guests: Number(form.guests),
      attending_service: eventTime,
      message: form.message.trim() || null,
    });

    if (error) {
      setRsvpError(
        error.code === "23505"
          ? "This email is already registered for First Love Night."
          : "We could not complete your RSVP. Please check your details and try again.",
      );
      setSubmitting(false);
      return;
    }

    void supabase.from("festival_analytics_events").insert({
      event_id: event.id,
      event_type: "register_submit",
      path: window.location.pathname,
      metadata: { type: "first_love_night_rsvp", guests: Number(form.guests) },
    });

    setRsvpDone(true);
    setConsent(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="fln-state">
        <LoaderCircle className="fln-spin" />
        <p>Preparing First Love Night…</p>
      </main>
    );
  }

  return (
    <main className="fln-page">
      <header className="fln-nav">
        <button className="fln-wordmark" type="button" onClick={() => scrollTo("home")}>
          <strong>FIRST LOVE NIGHT</strong>
          <span>THE FORMAL</span>
        </button>

        <nav className={mobileMenu ? "fln-links open" : "fln-links"} aria-label="First Love Night sections">
          <button type="button" onClick={() => scrollTo("home")}>Home</button>
          <button type="button" onClick={() => scrollTo("about")}>About</button>
          <button type="button" onClick={() => scrollTo("details")}>Details</button>
          <button type="button" onClick={() => scrollTo("experience")}>What to Expect</button>
          <button type="button" onClick={() => scrollTo("faq")}>FAQ</button>
        </nav>

        <div className="fln-nav-actions">
          <button className="fln-register-mini" type="button" onClick={() => { setRsvpDone(false); setRsvpError(""); setRsvpOpen(true); }}>
            Register Now
          </button>
          <button
            className="fln-menu"
            type="button"
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu((v) => !v)}
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <section id="home" className="fln-hero">
        <div className="fln-hero-bg" />
        <div className="fln-hero-overlay" />
        <div className="fln-hero-content">
          <p className="fln-kicker">F I R S T   L O V E   N I G H T</p>
          <h1>THE FORMAL</h1>
          <p className="fln-subtitle">A Christ-Centred Formal Night</p>
          <p className="fln-audience">{EVENT.audience}</p>

          <div className="fln-meta">
            <span><CalendarDays size={19} /><b>{eventDate}</b><small>{EVENT.weekday}</small></span>
            <i />
            <span><MapPin size={19} /><b>{venue}</b><small>{EVENT.city}</small></span>
          </div>

          <div className="fln-actions">
            <button className="fln-gold-btn" type="button" onClick={() => { setRsvpDone(false); setRsvpError(""); setRsvpOpen(true); }}>
              REGISTER NOW <ArrowRight size={17} />
            </button>
            <button className="fln-outline-btn" type="button" onClick={() => scrollTo("details")}>
              <CalendarDays size={15} /> SAVE THE DATE
            </button>
          </div>
        </div>

        <div className="fln-hero-figure" aria-hidden="true">
          <div className="fln-glow" />
          <div className="fln-arch arch-a" />
          <div className="fln-arch arch-b" />
          <div className="fln-couple">
            <div className="fln-person fln-man" />
            <div className="fln-person fln-woman" />
          </div>
          <div className="fln-bokeh b1" /><div className="fln-bokeh b2" /><div className="fln-bokeh b3" />
          <div className="fln-bokeh b4" /><div className="fln-bokeh b5" /><div className="fln-bokeh b6" />
        </div>
      </section>

      <section className="fln-countdown" aria-label="Countdown to First Love Night">
        <p>THE COUNTDOWN BEGINS</p>
        <div className="fln-counter">
          <div><strong>{String(countdown.days).padStart(2, "0")}</strong><span>DAYS</span></div>
          <i />
          <div><strong>{String(countdown.hours).padStart(2, "0")}</strong><span>HOURS</span></div>
          <i />
          <div><strong>{String(countdown.minutes).padStart(2, "0")}</strong><span>MINUTES</span></div>
          <i />
          <div><strong>{String(countdown.seconds).padStart(2, "0")}</strong><span>SECONDS</span></div>
        </div>
      </section>

      <section id="about" className="fln-vision">
        <div className="fln-vision-photo">
          <div className="fln-table-scene">
            <div className="fln-table-line" />
            <div className="fln-candle c1" /><div className="fln-candle c2" /><div className="fln-candle c3" />
            <div className="fln-flower flower-a" /><div className="fln-flower flower-b" />
            <div className="fln-glass g1" /><div className="fln-glass g2" /><div className="fln-glass g3" />
          </div>
        </div>
        <div className="fln-vision-copy">
          <span>THE VISION</span>
          <h2>A Night to Celebrate,<br />Connect and Encounter Jesus.</h2>
          <div className="fln-rule" />
          <p>{event?.description || EVENT.description}</p>
        </div>
      </section>

      <section id="experience" className="fln-experience">
        <span className="fln-section-kicker">THE EXPERIENCE</span>
        <h2>A Night with Purpose</h2>
        <div className="fln-experience-grid">
          {[
            ["ARRIVE", "A real formal from the first moment.", "door"],
            ["CELEBRATE", "Food, friendship, music and memories.", "glasses"],
            ["ENCOUNTER", "A meaningful moment with Jesus.", "cross"],
            ["CONNECT", "A clear next step into community.", "people"],
          ].map(([title, copy, icon]) => (
            <article key={title} className="fln-experience-item">
              <div className={"fln-circle-icon " + icon} aria-hidden="true">
                {icon === "cross" ? "✝" : icon === "people" ? "◌◌" : icon === "glasses" ? "◡◡" : "▯"}
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="details" className="fln-details">
        <div className="fln-details-bg" />
        <div className="fln-details-content">
          <span>EVENT DETAILS</span>
          <h2>Save the Date</h2>
          <div className="fln-details-grid">
            <article><CalendarDays /><small>DATE</small><strong>{eventDate}</strong><b>{EVENT.weekday}</b></article>
            <article><MapPin /><small>VENUE</small><strong>{venue}</strong><b>{EVENT.city}</b></article>
            <article><Users /><small>FOR</small><strong>High School +<br />College Students</strong><b>&nbsp;</b></article>
            <article><Heart /><small>DRESS CODE</small><strong>{EVENT.dressCode}</strong><b>(More details soon)</b></article>
          </div>
          <button className="fln-gold-btn fln-centered" type="button" onClick={() => { setRsvpDone(false); setRsvpError(""); setRsvpOpen(true); }}>
            REGISTER NOW <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className="fln-gallery" aria-label="Formal night atmosphere">
        <div className="fln-gallery-panel panel-1"><span>ARRIVE IN STYLE</span></div>
        <div className="fln-gallery-panel panel-2"><span>CELEBRATE TOGETHER</span></div>
        <div className="fln-gallery-panel panel-3"><span>COME WITH YOUR PEOPLE</span></div>
      </section>

      <section className="fln-final">
        <span>BE PART OF</span>
        <h2>A NIGHT THAT MATTERS</h2>
        <p>DRESS UP · BRING YOUR FRIENDS · ENCOUNTER JESUS</p>
        <button className="fln-gold-btn" type="button" onClick={() => { setRsvpDone(false); setRsvpError(""); setRsvpOpen(true); }}>
          REGISTER NOW <ArrowRight size={17} />
        </button>
      </section>

      <section id="faq" className="fln-faq">
        <div>
          <span>GOOD TO KNOW</span>
          <h2>Before the<br />Formal.</h2>
        </div>
        <div className="fln-faq-list">
          {[
            ["Who can attend?", "First Love Night is for high school and college students within the First Love community."],
            ["What should I wear?", "Formal attire. More detailed dress-code guidance will be announced soon."],
            ["Where will it be held?", "The venue is currently TBA in Manila, Philippines. Final venue details will be announced when confirmed."],
            ["Do I need to RSVP?", "Yes. RSVP helps the team prepare seating, food and the overall guest experience."],
          ].map(([question, answer], i) => (
            <article key={question} className={openFaq === i ? "open" : ""}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <strong>0{i + 1}</strong><span>{question}</span><ChevronDown size={18} />
              </button>
              {openFaq === i && <p>{answer}</p>}
            </article>
          ))}
        </div>
      </section>

      <footer className="fln-footer">
        <span>FIRST LOVE NIGHT · THE FORMAL</span>
        <span>14 NOVEMBER 2026 · MANILA, PHILIPPINES</span>
      </footer>

      {rsvpOpen && (
        <div
          className="fln-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => e.currentTarget === e.target && setRsvpOpen(false)}
        >
          <section className="fln-modal" role="dialog" aria-modal="true" aria-labelledby="fln-rsvp-title">
            <button className="fln-modal-close" type="button" onClick={() => setRsvpOpen(false)} aria-label="Close RSVP">
              <X size={20} />
            </button>

            {!rsvpDone ? (
              <>
                <span>YOUR PLACE AT THE TABLE</span>
                <h2 id="fln-rsvp-title">RSVP for<br /><em>THE FORMAL.</em></h2>
                <p>
                  Reserve your spot for a Christ-centred formal night built for connection,
                  celebration and an unforgettable encounter with Jesus.
                </p>

                <form onSubmit={submitRsvp}>
                  <div className="fln-form-grid">
                    <label>
                      <span>FULL NAME *</span>
                      <input required minLength={2} autoComplete="name" value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)} placeholder="Juan Dela Cruz" />
                    </label>
                    <label>
                      <span>EMAIL *</span>
                      <input required type="email" autoComplete="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="you@example.com" />
                    </label>
                    <label>
                      <span>MOBILE</span>
                      <input type="tel" autoComplete="tel" value={form.mobile} onChange={(e) => updateForm("mobile", e.target.value)} placeholder="09XX XXX XXXX" />
                    </label>
                    <label>
                      <span>GUESTS</span>
                      <select value={form.guests} onChange={(e) => updateForm("guests", e.target.value)}>
                        {Array.from({ length: 6 }, (_, i) => (
                          <option key={i} value={i}>{i === 0 ? "Just me" : `${i} guest${i > 1 ? "s" : ""}`}</option>
                        ))}
                      </select>
                    </label>
                    <label className="full">
                      <span>MESSAGE (OPTIONAL)</span>
                      <textarea rows={4} value={form.message} onChange={(e) => updateForm("message", e.target.value)} placeholder="Anything the event team should know?" />
                    </label>
                  </div>

                  <label className="fln-consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>I confirm the information above is accurate and agree to be contacted about First Love Night.</span>
                  </label>

                  {rsvpError && <div className="fln-form-error" role="alert">{rsvpError}</div>}

                  <button className="fln-gold-btn fln-wide" type="submit" disabled={submitting}>
                    {submitting ? <><LoaderCircle className="fln-spin" size={17} /> SUBMITTING…</> : <>CONFIRM RSVP <Check size={18} /></>}
                  </button>
                </form>
              </>
            ) : (
              <div className="fln-success">
                <div className="fln-success-mark">✦</div>
                <span>RSVP CONFIRMED</span>
                <h2>See you<br /><em>at the Formal.</em></h2>
                <p>Your place is reserved. We cannot wait to celebrate, connect and encounter Jesus together.</p>
                <div className="fln-success-card">
                  <div><CalendarDays /><span>14 November 2026<br /><small>Saturday</small></span></div>
                  <div><MapPin /><span>{venue}<br /><small>{EVENT.city}</small></span></div>
                  <div><Users /><span>{Number(form.guests) + 1} attendee{Number(form.guests) === 0 ? "" : "s"}<br /><small>{form.full_name}</small></span></div>
                </div>
                <a className="fln-outline-dark" href={calendarUrl} target="_blank" rel="noreferrer">
                  ADD TO CALENDAR <ArrowRight size={15} />
                </a>
                <a className="fln-outline-dark" href={mapUrl} target="_blank" rel="noreferrer">
                  GET DIRECTIONS <MapPin size={15} />
                </a>
                <button className="fln-outline-dark" type="button" onClick={() => setRsvpOpen(false)}>
                  CLOSE <ArrowDown size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
