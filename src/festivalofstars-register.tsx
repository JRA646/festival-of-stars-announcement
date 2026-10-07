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
import "./festivalofstars-register.css";
import "./first-love-theme.css";

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

export default function FestivalOfStarsRegister() {
  const [festival, setFestival] = useState<PublicFestival | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [rsvp, setRsvp] = useState({
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
      } else {
        const typed = data as PublicFestival;
        setFestival(typed);
        setRsvp((current) => ({
          ...current,
          attending_service: new Date(typed.event.start_at).toLocaleTimeString(
            "en-US",
            { hour: "numeric", minute: "2-digit" },
          ),
        }));
      }

      setLoading(false);
    };

    void load();
  }, []);

  const updateRsvp = (
    field: keyof typeof rsvp,
    value: string,
  ) => {
    setRsvp((current) => ({ ...current, [field]: value }));
  };

  const submitRsvp = async () => {
    if (!festival || !consent) return;

    setSubmitting(true);
    setError("");

    const { error: insertError } = await supabase
      .from("festival_registrations")
      .insert({
        event_id: festival.event.id,
        full_name: rsvp.full_name.trim(),
        email: rsvp.email.trim().toLowerCase(),
        mobile: rsvp.mobile.trim() || null,
        guests: Number(rsvp.guests),
        attending_service: rsvp.attending_service,
        message: rsvp.message.trim() || null,
      });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "This email is already registered for Festival of Stars."
          : "We could not complete your registration. Please check your details and try again.",
      );
    } else {
      void supabase.from("festival_analytics_events").insert({
        event_id: festival.event.id,
        event_type: "register_submit",
        path: window.location.pathname,
        metadata: { type: "rsvp" },
      });

      setSuccess("You are registered for Festival of Stars!");
      setRsvp({
        full_name: "",
        email: "",
        mobile: "",
        guests: "0",
        attending_service: new Date(
          festival.event.start_at,
        ).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        message: "",
      });
    }

    setSubmitting(false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!consent) {
      setError(
        "Please confirm that the information you provided is accurate and that you agree to be contacted about the event.",
      );
      return;
    }

    void submitRsvp();
  };

  if (loading) {
    return (
      <main className="fos-register-state">
        <LoaderCircle className="register-spin" />
        <p>Loading registration…</p>
      </main>
    );
  }

  if (!festival) {
    return (
      <main className="fos-register-state">
        <Sparkles />
        <h1>Registration unavailable</h1>
        <p>{error || "Please try again later."}</p>
        <a href="/festivalofstars">Back to Festival of Stars</a>
      </main>
    );
  }

  if (!festival.announcement.registration_enabled) {
    return (
      <main className="fos-register-state">
        <Sparkles />
        <h1>Registration is closed</h1>
        <p>Registration for Festival of Stars is not currently open.</p>
        <a href="/festivalofstars">Back to Festival of Stars</a>
      </main>
    );
  }

  const eventDate = new Date(festival.event.start_at).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );
  const eventTime = new Date(festival.event.start_at).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" },
  );

  return (
    <main className="fos-register-page">
      <header className="register-header">
        <a href="/festivalofstars">
          <ArrowLeft size={18} /> Festival of Stars
        </a>
        <div>
          <strong>FIRST LOVE CHURCH</strong>
          <span>PHILIPPINES</span>
        </div>
      </header>

      <section className="register-hero">
        <div>
          <p className="section-kicker">SAVE YOUR SPOT</p>
          <h1>
            Be part of
            <br />
            <span>the stars.</span>
          </h1>
          <p>
            Reserve your spot for a night of worship, community, and
            celebration with First Love Church.
          </p>

          <div className="register-event-meta">
            <span>
              <CalendarDays size={17} /> {eventDate} · {eventTime}
            </span>
            <span>
              <MapPin size={17} />{" "}
              {festival.event.location || "First Love Church · Las Piñas City"}
            </span>
          </div>
        </div>

        <div className="register-art">
          <div className="register-art-bg" />
          <div className="register-art-image">
            <img
              src="/festival-assets/01_Singer_Male_1.png"
              alt="Festival of Stars worship performance"
            />
          </div>
          <Sparkles className="register-sparkle" />
        </div>
      </section>

      <section className="register-shell">
        <div className="register-tabs">
          <button className="active" type="button">
            RSVP <Users size={17} />
          </button>
        </div>

        <form className="register-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              <span>Full name *</span>
              <input
                required
                minLength={2}
                value={rsvp.full_name}
                onChange={(event) =>
                  updateRsvp("full_name", event.target.value)
                }
                placeholder="Juan Dela Cruz"
              />
            </label>

            <label>
              <span>Email *</span>
              <input
                required
                type="email"
                value={rsvp.email}
                onChange={(event) => updateRsvp("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span>Mobile number</span>
              <input
                type="tel"
                value={rsvp.mobile}
                onChange={(event) => updateRsvp("mobile", event.target.value)}
                placeholder="09XX XXX XXXX"
              />
            </label>

            <label>
              <span>Guests</span>
              <select
                value={rsvp.guests}
                onChange={(event) => updateRsvp("guests", event.target.value)}
              >
                {Array.from({ length: 11 }, (_, index) => (
                  <option key={index} value={index}>
                    {index === 0 ? "Just me" : index}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Gathering time</span>
              <select
                value={rsvp.attending_service}
                onChange={(event) =>
                  updateRsvp("attending_service", event.target.value)
                }
              >
                <option>{eventTime}</option>
                <option>NOT SURE YET</option>
              </select>
            </label>

            <label className="field-full">
              <span>Message (optional)</span>
              <textarea
                value={rsvp.message}
                onChange={(event) => updateRsvp("message", event.target.value)}
                rows={5}
                placeholder="Tell us anything we should know."
              />
            </label>
          </div>

          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              I confirm that the information above is accurate and I agree to
              be contacted by the event team about Festival of Stars.
            </span>
          </label>

          {error && <div className="form-error">{error}</div>}

          {success && (
            <div className="form-success">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          <button
            className="submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle className="register-spin" /> Sending…
              </>
            ) : (
              <>
                Complete RSVP <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </section>

      <footer className="register-footer">
        <div>Festival of Stars · First Love Church Philippines</div>
        <a href="/festivalofstars">Back to announcement</a>
      </footer>
    </main>
  );
}
