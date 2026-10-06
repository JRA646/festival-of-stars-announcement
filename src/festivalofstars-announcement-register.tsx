import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  MapPin,
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
    location: string | null;
  };
  announcement: {
    registration_enabled: boolean;
  };
};

const SLUG = "festival-of-stars";

export default function FestivalOfStarsAnnouncementRegister() {
  const [festival, setFestival] = useState<PublicFestival | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    guests: "0",
    attending_service: "",
    message: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "get_public_festival_of_stars",
        { p_slug: SLUG },
      );

      if (rpcError || !data) {
        setError("Registration is temporarily unavailable.");
        setLoading(false);
        return;
      }

      const typed = data as PublicFestival;
      setFestival(typed);
      setForm((current) => ({
        ...current,
        attending_service: new Date(
          typed.event.start_at,
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      }));
      setLoading(false);
    };

    void load();
  }, []);

  const eventDate = festival
    ? new Date(festival.event.start_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "October 18, 2026";

  const eventTime = festival
    ? new Date(festival.event.start_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "3:00 PM";

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!festival) return;

    if (!consent) {
      setError(
        "Please confirm that the information above is accurate and that you agree to be contacted about the event.",
      );
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
      metadata: { type: "announcement_rsvp" },
    });

    setSuccess("You're on the list. See you at Festival of Stars!");
    setForm({
      full_name: "",
      email: "",
      mobile: "",
      guests: "0",
      attending_service: eventTime,
      message: "",
    });
    setConsent(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="foar-state">
        <LoaderCircle className="foar-spin" />
        <p>Loading RSVP…</p>
      </main>
    );
  }

  if (!festival) {
    return (
      <main className="foar-state">
        <Sparkles />
        <h1>RSVP unavailable</h1>
        <p>{error || "Please try again later."}</p>
        <a href="/festivalofstars/announcement">
          Back to Festival of Stars
        </a>
      </main>
    );
  }

  if (!festival.announcement.registration_enabled) {
    return (
      <main className="foar-state">
        <Sparkles />
        <h1>RSVP is closed</h1>
        <p>Registration for Festival of Stars is not currently open.</p>
        <a href="/festivalofstars/announcement">
          Back to Festival of Stars
        </a>
      </main>
    );
  }

  return (
    <main className="foar-page">
      <header className="foar-header">
        <a href="/festivalofstars/announcement" className="foar-back">
          <ArrowLeft size={18} />
          FESTIVAL OF STARS
        </a>
        <div className="foar-brand">
          <strong>FIRST LOVE CHURCH</strong>
          <span>PHILIPPINES</span>
        </div>
      </header>

      <section className="foar-hero">
        <div className="foar-lightning" aria-hidden="true" />
        <div className="foar-burst burst-a" aria-hidden="true">★</div>
        <div className="foar-burst burst-b" aria-hidden="true">✦</div>

        <div className="foar-copy">
          <span className="foar-kicker">SAVE YOUR SPOT</span>
          <p className="foar-eyebrow">ONE CHURCH · MANY STORIES · ONE BIG CELEBRATION</p>
          <h1>BE PART OF<br /><em>THE STARS.</em></h1>
          <p className="foar-lead">
            RSVP for a celebration of the <b>talent, creativity, fellowship,
            and unity</b> of the First Love Experience community.
          </p>

          <div className="foar-meta">
            <span><CalendarDays size={17} /> {eventDate} · {eventTime}</span>
            <span><MapPin size={17} /> {festival.event.location || "Villar Sipag · Las Piñas"}</span>
          </div>
        </div>

        <div className="foar-sticker" aria-hidden="true">
          <span>YOU'RE</span>
          <strong>INVITED!</strong>
          <small>FIRST LOVE EXPERIENCE</small>
        </div>
      </section>

      <section className="foar-form-shell">
        <div className="foar-form-intro">
          <span className="foar-section-label">RSVP FORM</span>
          <h2>COUNT <em>ME IN.</em></h2>
          <p>
            Tell us you're coming, bring your people, and help us prepare for
            a great celebration together.
          </p>
        </div>

        <form className="foar-form" onSubmit={submit}>
          <div className="foar-grid">
            <label>
              <span>FULL NAME *</span>
              <input
                required
                minLength={2}
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
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span>MOBILE NUMBER</span>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                placeholder="09XX XXX XXXX"
              />
            </label>

            <label>
              <span>GUESTS</span>
              <select
                value={form.guests}
                onChange={(e) => update("guests", e.target.value)}
              >
                {Array.from({ length: 11 }, (_, index) => (
                  <option key={index} value={index}>
                    {index === 0 ? "Just me" : index}
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
          </div>

          <label className="foar-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I confirm that the information above is accurate and I agree to
              be contacted by the event team about Festival of Stars.
            </span>
          </label>

          {error && <div className="foar-error">{error}</div>}

          {success && (
            <div className="foar-success">
              <CheckCircle2 size={21} />
              <span>{success}</span>
            </div>
          )}

          <button className="foar-submit" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="foar-spin" /> SENDING…
              </>
            ) : (
              <>
                <Users size={18} /> COMPLETE RSVP <ArrowRight size={19} />
              </>
            )}
          </button>
        </form>
      </section>

      <section className="foar-note">
        <Sparkles />
        <div>
          <strong>ONE NIGHT. ONE COMMUNITY.</strong>
          <span>Come ready to celebrate the people, gifts, and stories of First Love Experience.</span>
        </div>
        <a href="/festivalofstars/announcement">
          BACK TO ANNOUNCEMENT <ArrowRight size={16} />
        </a>
      </section>

      <footer className="foar-footer">
        <span>FIRST LOVE CHURCH PHILIPPINES</span>
        <span>FESTIVAL OF STARS · OCTOBER 18 · 3 PM</span>
      </footer>
    </main>
  );
}
