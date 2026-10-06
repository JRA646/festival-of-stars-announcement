import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Heart,
  LoaderCircle,
  MapPin,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./festivalofstars-announcement-register.css";

type PublicFestival = {
  event: {
    id: string;
    name: string;
    start_at: string;
    end_at: string | null;
    location: string | null;
  };
  announcement: {
    registration_enabled: boolean;
    seo_title: string | null;
    seo_description: string | null;
  };
};

const SLUG = "festival-of-stars";
const ANNOUNCEMENT_URL = "/festivalofstars/announcement";

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

function buildCalendarUrl(festival: PublicFestival) {
  const start = new Date(festival.event.start_at)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const endDate = festival.event.end_at
    ? new Date(festival.event.end_at)
    : new Date(new Date(festival.event.start_at).getTime() + 3 * 60 * 60 * 1000);
  const end = endDate
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const title = encodeURIComponent(festival.event.name || "Festival of Stars");
  const details = encodeURIComponent(
    "Festival of Stars · A celebration of the talent, creativity, fellowship, and unity of the First Love Experience community.",
  );
  const location = encodeURIComponent(
    festival.event.location || "Villar Sipag, Las Piñas, Philippines",
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

function buildMapUrl(location: string | null) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location || "Villar Sipag"}, Las Piñas, Philippines`,
  )}`;
}

export default function FestivalOfStarsAnnouncementRegister() {
  const [festival, setFestival] = useState<PublicFestival | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    guests: "0",
    attending_service: "",
    message: "",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "get_public_festival_of_stars",
        { p_slug: SLUG },
      );

      if (cancelled) return;

      if (rpcError || !data) {
        setError("RSVP is temporarily unavailable.");
        setLoading(false);
        return;
      }

      const typed = data as PublicFestival;
      setFestival(typed);
      setForm((current) => ({
        ...current,
        attending_service: formatTime(typed.event.start_at),
      }));
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!festival) return;

    const title =
      festival.announcement.seo_title ||
      "Festival of Stars RSVP · First Love Experience";
    const description =
      festival.announcement.seo_description ||
      "Reserve your spot at Festival of Stars · October 18, 2026 · First Love Experience.";

    document.title = title;

    const meta = (selector: string, attr: string, key: string, value: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(selector);
      if (!node) {
        node = document.createElement("meta");
        node.setAttribute(attr, key);
        document.head.appendChild(node);
      }
      node.content = value;
    };

    meta('meta[name="description"]', "name", "description", description);
    meta('meta[property="og:title"]', "property", "og:title", title);
    meta('meta[property="og:description"]', "property", "og:description", description);
    meta('meta[property="og:type"]', "property", "og:type", "website");
    meta(
      'meta[property="og:url"]',
      "property",
      "og:url",
      `${window.location.origin}${window.location.pathname}`,
    );
  }, [festival]);

  const eventDate = festival ? formatDate(festival.event.start_at) : "October 18, 2026";
  const eventTime = festival ? formatTime(festival.event.start_at) : "3:00 PM";
  const mapUrl = useMemo(
    () => buildMapUrl(festival?.event.location || "Villar Sipag"),
    [festival],
  );
  const calendarUrl = useMemo(
    () => (festival ? buildCalendarUrl(festival) : "#"),
    [festival],
  );

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const goToDetails = () => {
    setError("");
    if (!formRef.current?.reportValidity()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!festival) return;

    if (!consent) {
      setError("Please confirm the information and consent to event follow-up.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("festival_registrations")
      .insert({
        event_id: festival.event.id,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim() || null,
        guests: Number(form.guests),
        attending_service: form.attending_service,
        message: form.message.trim() || null,
      });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "This email is already registered for Festival of Stars."
          : "We could not complete your RSVP. Please check your details and try again.",
      );
      setSubmitting(false);
      return;
    }

    void supabase.from("festival_analytics_events").insert({
      event_id: festival.event.id,
      event_type: "register_submit",
      path: window.location.pathname,
      metadata: {
        type: "announcement_rsvp",
        guests: Number(form.guests),
      },
    });

    setSuccessMessage("Your RSVP is confirmed.");
    setStep(3);
    setConsent(false);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shareSuccess = async () => {
    const text = `I'm going to Festival of Stars on ${eventDate} at ${eventTime} at ${festival?.event.location || "Villar Sipag"}! Join me.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Festival of Stars",
          text,
          url: window.location.origin + ANNOUNCEMENT_URL,
        });
      } else {
        await navigator.clipboard.writeText(
          `${text} ${window.location.origin + ANNOUNCEMENT_URL}`,
        );
      }
      setShared(true);
    } catch {
      setShared(false);
    }

    window.setTimeout(() => setShared(false), 2200);
  };

  const copyInvite = async () => {
    const invite = `Festival of Stars\n${eventDate} · ${eventTime}\n${festival?.event.location || "Villar Sipag, Las Piñas"}\n\n${window.location.origin + ANNOUNCEMENT_URL}`;
    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <main className="foar-state">
        <div className="foar-loader-orbit"><span /><span /><span /></div>
        <p>Preparing your RSVP…</p>
      </main>
    );
  }

  if (!festival) {
    return (
      <main className="foar-state">
        <Sparkles />
        <h1>RSVP unavailable</h1>
        <p>{error || "Please try again later."}</p>
        <a href={ANNOUNCEMENT_URL}>Back to Festival of Stars</a>
      </main>
    );
  }

  if (!festival.announcement.registration_enabled) {
    return (
      <main className="foar-state">
        <Sparkles />
        <h1>RSVP is closed</h1>
        <p>Registration for Festival of Stars is not currently open.</p>
        <a href={ANNOUNCEMENT_URL}>Back to the announcement</a>
      </main>
    );
  }

  return (
    <main className="foar-page">
      <a className="foar-skip-link" href="#rsvp-content">Skip to RSVP</a>

      <header className="foar-header">
        <a href={ANNOUNCEMENT_URL} className="foar-back">
          <ArrowLeft size={18} />
          FESTIVAL OF STARS
        </a>
        <div className="foar-brand">
          <strong>FIRST LOVE CHURCH</strong>
          <span>PHILIPPINES</span>
        </div>
      </header>

      <section className="foar-hero">
        <div className="foar-hero-noise" aria-hidden="true" />
        <div className="foar-hero-burst burst-a" aria-hidden="true">★</div>
        <div className="foar-hero-burst burst-b" aria-hidden="true">✦</div>

        <div className="foar-copy">
          <span className="foar-kicker">SAVE YOUR SPOT</span>
          <p className="foar-eyebrow">
            ONE CHURCH · MANY STORIES · ONE BIG CELEBRATION
          </p>
          <h1>BE PART OF<br /><em>THE STARS.</em></h1>
          <p className="foar-lead">
            Your RSVP helps us prepare for a celebration of the{" "}
            <b>talent, creativity, fellowship, and unity</b> of the First Love Experience community.
          </p>

          <div className="foar-event-facts">
            <span><CalendarDays size={16} /> {eventDate}</span>
            <span><Clock3 size={16} /> {eventTime}</span>
            <span><MapPin size={16} /> {festival.event.location || "Villar Sipag"} · Las Piñas</span>
          </div>
        </div>

        <div className="foar-invite-poster" aria-hidden="true">
          <span>YOU'RE</span>
          <strong>INVITED!</strong>
          <small>FIRST LOVE EXPERIENCE</small>
          <b>OCT 18 · 3 PM</b>
        </div>
      </section>

      <div id="rsvp-content" className="foar-content">
        <div className="foar-steps" aria-label="RSVP progress">
          <div className={step >= 1 ? "active current" : ""}><span>01</span><b>YOU</b></div>
          <i />
          <div className={step >= 2 ? "active current" : ""}><span>02</span><b>YOUR VISIT</b></div>
          <i />
          <div className={step >= 3 ? "active current" : ""}><span>03</span><b>CONFIRMED</b></div>
        </div>

        {step < 3 ? (
          <section className="foar-form-shell">
            <div className="foar-form-intro">
              <span className="foar-section-label">
                {step === 1 ? "STEP 01 · YOUR DETAILS" : "STEP 02 · YOUR VISIT"}
              </span>
              <h2>{step === 1 ? <>COUNT <em>ME IN.</em></> : <>TELL US <em>YOUR PLAN.</em></>}</h2>
              <p>
                {step === 1
                  ? "Start with the basics so we know who is joining the celebration."
                  : "Let us know who is coming with you and anything we should know."}
              </p>
            </div>

            <form className="foar-form" ref={formRef} onSubmit={submit}>
              {step === 1 ? (
                <div className="foar-grid">
                  <label>
                    <span>FULL NAME *</span>
                    <input
                      required
                      minLength={2}
                      autoComplete="name"
                      value={form.full_name}
                      onChange={(e) => update("full_name", e.target.value)}
                      placeholder="Juan Dela Cruz"
                    />
                  </label>

                  <label>
                    <span>EMAIL *</span>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    <span>MOBILE NUMBER</span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.mobile}
                      onChange={(e) => update("mobile", e.target.value)}
                      placeholder="09XX XXX XXXX"
                    />
                  </label>
                </div>
              ) : (
                <div className="foar-grid">
                  <label>
                    <span>GUESTS</span>
                    <select
                      value={form.guests}
                      onChange={(e) => update("guests", e.target.value)}
                    >
                      {Array.from({ length: 11 }, (_, index) => (
                        <option key={index} value={index}>
                          {index === 0 ? "Just me" : `${index} guest${index > 1 ? "s" : ""}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>GATHERING TIME</span>
                    <select
                      value={form.attending_service}
                      onChange={(e) => update("attending_service", e.target.value)}
                    >
                      <option>{eventTime}</option>
                      <option>NOT SURE YET</option>
                    </select>
                  </label>

                  <label className="field-full">
                    <span>MESSAGE (OPTIONAL)</span>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Anything you'd like the event team to know?"
                    />
                  </label>

                  <div className="foar-confirm-summary field-full">
                    <span>YOUR RSVP</span>
                    <strong>{form.full_name}</strong>
                    <small>{form.email} · {Number(form.guests) === 0 ? "Just me" : `${form.guests} guest${Number(form.guests) > 1 ? "s" : ""}`}</small>
                  </div>
                </div>
              )}

              {step === 2 && (
                <>
                  <label className="foar-consent">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      I confirm that the information above is accurate and I agree
                      to be contacted by the event team about Festival of Stars.
                    </span>
                  </label>

                  {error && <div className="foar-error">{error}</div>}
                </>
              )}

              <div className="foar-form-actions">
                {step === 2 && (
                  <button
                    className="foar-secondary-button"
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                  >
                    <ArrowLeft size={17} /> BACK
                  </button>
                )}

                {step === 1 ? (
                  <button className="foar-submit" type="button" onClick={goToDetails}>
                    CONTINUE <ArrowRight size={19} />
                  </button>
                ) : (
                  <button className="foar-submit" type="submit" disabled={submitting}>
                    {submitting ? (
                      <><LoaderCircle className="foar-spin" /> SENDING…</>
                    ) : (
                      <>CONFIRM RSVP <Check size={19} /></>
                    )}
                  </button>
                )}
              </div>
            </form>
          </section>
        ) : (
          <section className="foar-success-screen" aria-live="polite">
            <div className="foar-success-star">★</div>
            <span className="foar-section-label">RSVP CONFIRMED</span>
            <h2>YOU'RE ON<br /><em>THE LIST!</em></h2>
            <p>{successMessage || "Your RSVP is confirmed."}</p>

            <div className="foar-success-ticket">
              <div><CalendarDays size={20} /><span><b>WHEN</b><strong>{eventDate}</strong><small>{eventTime}</small></span></div>
              <div><MapPin size={20} /><span><b>WHERE</b><strong>{festival.event.location || "Villar Sipag"}</strong><small>Las Piñas, Philippines</small></span></div>
              <div><Users size={20} /><span><b>WHO</b><strong>{Number(form.guests) === 0 ? "Just you" : `${Number(form.guests) + 1} people`}</strong><small>{form.full_name}</small></span></div>
            </div>

            <div className="foar-success-actions">
              <a className="foar-success-primary" href={calendarUrl} target="_blank" rel="noreferrer">
                <CalendarDays size={17} /> ADD TO CALENDAR
              </a>
              <a className="foar-success-secondary" href={mapUrl} target="_blank" rel="noreferrer">
                <MapPin size={17} /> GET DIRECTIONS
              </a>
              <button type="button" onClick={shareSuccess}>
                <Share2 size={17} /> {shared ? "SHARED!" : "SHARE EVENT"}
              </button>
              <button type="button" onClick={copyInvite}>
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? "COPIED!" : "COPY INVITE"}
              </button>
            </div>

            <a className="foar-success-back" href={ANNOUNCEMENT_URL}>
              BACK TO EVENT <ArrowRight size={16} />
            </a>
          </section>
        )}
      </div>

      <section className="foar-bottom-note">
        <Heart size={18} />
        <div>
          <strong>ONE NIGHT. ONE COMMUNITY.</strong>
          <span>Come ready to celebrate the people, gifts, and stories of First Love Experience.</span>
        </div>
      </section>

      <footer className="foar-footer">
        <span>FIRST LOVE CHURCH PHILIPPINES</span>
        <span>FESTIVAL OF STARS · {formatDate(festival.event.start_at)}</span>
      </footer>
    </main>
  );
}
