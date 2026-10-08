import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Heart,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./first-love-night-option-b-rsvp.css";

type FirstLoveNightData = {
  event: {
    id: string;
    name: string;
    start_at: string;
    location: string | null;
  };
  announcement: {
    registration_enabled: boolean;
    seo_title: string;
    seo_description: string;
    content: {
      subtitle: string;
      date_label: string;
      weekday: string;
      time_label: string;
      venue_label: string;
      city_label: string;
      dress_code: string;
      hero_image_url: string;
    };
  };
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

const INITIAL_FORM: RsvpForm = {
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
  return value.slice(0, 10);
}

function track(eventId: string, eventType: string, metadata: Record<string, unknown> = {}) {
  void supabase.from("festival_analytics_events").insert({
    event_id: eventId,
    event_type: eventType,
    path: window.location.pathname,
    metadata: { ...metadata, page: "first_love_night_option_b_rsvp" },
  });
}

export default function FirstLoveNightOptionBRsvp() {
  const [data, setData] = useState<FirstLoveNightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<RsvpForm>(INITIAL_FORM);
  const [rsvpError, setRsvpError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    code: string;
    name: string;
    guests: number;
  } | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const { data: result, error: rpcError } = await supabase.rpc("get_public_first_love_night");

      if (!alive) return;

      if (rpcError || !result) {
        setError("This registration page is temporarily unavailable.");
        setLoading(false);
        return;
      }

      const typed = result as FirstLoveNightData;
      setData(typed);
      document.title = `RSVP · ${typed.announcement.seo_title}`;

      let description = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!description) {
        description = document.createElement("meta");
        description.name = "description";
        document.head.appendChild(description);
      }
      description.content = typed.announcement.seo_description;

      setLoading(false);
      track(typed.event.id, "register_click", { source: "option_b_rsvp_page" });
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const content = data?.announcement.content;
  const venue = data?.event.location || content?.venue_label || "TBA";
  const guestCount = Number(form.guest_count || 0);

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
    if (data) track(data.event.id, "register_click", { step: 1, action: "step_1_complete" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const continueStepTwo = (event: FormEvent) => {
    event.preventDefault();
    setStep(3);
    if (data) track(data.event.id, "register_click", { step: 2, action: "step_2_complete" });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setSubmitting(false);

    track(data.event.id, "register_submit", {
      guests: guestCount,
      age_group: form.age_group,
      referral_source: form.referral_source,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calendarUrl = data
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        data.event.name,
      )}&dates=${getDateKey(data.event.start_at).replace(/-/g, "")}/${new Date(
        new Date(data.event.start_at).getTime() + 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}&details=${encodeURIComponent(
        content?.subtitle || "First Love Night: The Formal.",
      )}&location=${encodeURIComponent(`${venue}, ${content?.city_label || "Manila"}, Philippines`)}`
    : "#";

  if (loading) {
    return (
      <main className="fln-b-rsvp-state">
        <Sparkles size={23} />
        <p>Preparing your invitation…</p>
      </main>
    );
  }

  if (error || !data || !content) {
    return (
      <main className="fln-b-rsvp-state">
        <Heart size={25} />
        <h1>First Love Night</h1>
        <p>{error || "Registration details are unavailable."}</p>
        <button type="button" onClick={() => window.location.reload()}>
          TRY AGAIN
        </button>
      </main>
    );
  }

  if (!data.announcement.registration_enabled) {
    return (
      <main className="fln-b-rsvp-state">
        <Heart size={25} />
        <h1>Registration is closed.</h1>
        <p>Thank you for your interest in First Love Night.</p>
        <a href="/first-love-night-option-b">BACK TO EVENT <ArrowRight size={15} /></a>
      </main>
    );
  }

  return (
    <main className="fln-b-rsvp-page">
      <aside className="fln-b-rsvp-aside">
        <div
          className="fln-b-rsvp-aside-image"
          style={{ backgroundImage: `url("${content.hero_image_url}")` }}
        />
        <div className="fln-b-rsvp-aside-overlay" />
        <a className="fln-b-rsvp-brand" href="/first-love-night-option-b">
          <span>FIRST LOVE</span>
          <strong>NIGHT</strong>
          <small>THE FORMAL</small>
        </a>

        <div className="fln-b-rsvp-aside-copy">
          <p>YOUR INVITATION</p>
          <h1>Reserve your<br /><em>place at the night.</em></h1>
          <span>{content.date_label} · {content.time_label}</span>
          <span>{venue} · {content.city_label}</span>
        </div>

        <div className="fln-b-rsvp-aside-bottom">
          <Heart size={15} />
          <span>Faith · Fellowship · Celebration</span>
        </div>
      </aside>

      <section className="fln-b-rsvp-panel">
        <div className="fln-b-rsvp-topline">
          <a href="/first-love-night-option-b">
            <ArrowLeft size={15} /> Back to event
          </a>
          <span>{content.dress_code} · RSVP REQUIRED</span>
        </div>

        <div className="fln-b-rsvp-content">
          {!confirmation ? (
            <>
              <div className="fln-b-rsvp-heading">
                <p>FIRST LOVE EXPERIENCE · RSVP</p>
                <h2>
                  {step === 1 && <>Tell us about <em>you.</em></>}
                  {step === 2 && <>Shape <em>your evening.</em></>}
                  {step === 3 && <>Review <em>your invitation.</em></>}
                </h2>
                <span>Three steps. One confirmed place. Everything else is easy.</span>
              </div>

              <div className="fln-b-rsvp-progress">
                {[
                  ["01", "YOU"],
                  ["02", "YOUR NIGHT"],
                  ["03", "CONFIRM"],
                ].map(([number, label], index) => (
                  <div key={number} className={step >= index + 1 ? "active" : ""}>
                    <span>{number}</span>
                    <strong>{label}</strong>
                  </div>
                ))}
              </div>

              {step === 1 && (
                <form className="fln-b-rsvp-form" onSubmit={continueStepOne}>
                  <div className="fln-b-rsvp-grid">
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
                    <div className="fln-b-rsvp-guardian">
                      <div className="fln-b-rsvp-guardian-head">
                        <ShieldCheck size={19} />
                        <div>
                          <strong>Parent / guardian details</strong>
                          <p>Required for high-school attendees.</p>
                        </div>
                      </div>
                      <div className="fln-b-rsvp-grid">
                        <label>
                          <span>GUARDIAN NAME *</span>
                          <input required value={form.guardian_name} onChange={(event) => update("guardian_name", event.target.value)} placeholder="Parent / Guardian" />
                        </label>
                        <label>
                          <span>GUARDIAN MOBILE *</span>
                          <input required type="tel" value={form.guardian_mobile} onChange={(event) => update("guardian_mobile", event.target.value)} placeholder="09XX XXX XXXX" />
                        </label>
                      </div>
                      <label className="fln-b-rsvp-check">
                        <input type="checkbox" checked={form.guardian_consent} onChange={(event) => update("guardian_consent", event.target.checked)} />
                        <span>I confirm that a parent / guardian has given consent for this registration.</span>
                      </label>
                    </div>
                  )}

                  {rsvpError && <div className="fln-b-rsvp-error" role="alert">{rsvpError}</div>}

                  <div className="fln-b-rsvp-actions">
                    <a href="/first-love-night-option-b" className="fln-b-rsvp-back-link">Cancel</a>
                    <button className="fln-b-rsvp-primary" type="submit">Continue <ArrowRight size={16} /></button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form className="fln-b-rsvp-form" onSubmit={continueStepTwo}>
                  <div className="fln-b-rsvp-grid">
                    <label>
                      <span>NUMBER OF GUESTS</span>
                      <select value={form.guest_count} onChange={(event) => update("guest_count", event.target.value)}>
                        {Array.from({ length: 6 }, (_, index) => (
                          <option key={index} value={index}>
                            {index === 0 ? "Just me" : `${index} guest${index > 1 ? "s" : ""}`}
                          </option>
                        ))}
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
                    <label className="fln-b-rsvp-full">
                      <span>ANYTHING WE SHOULD KNOW? OPTIONAL</span>
                      <textarea rows={5} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="Dietary notes, accessibility needs, or anything else for the event team." />
                    </label>
                  </div>

                  {rsvpError && <div className="fln-b-rsvp-error" role="alert">{rsvpError}</div>}

                  <div className="fln-b-rsvp-actions">
                    <button className="fln-b-rsvp-secondary" type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button className="fln-b-rsvp-primary" type="submit">Review RSVP <ArrowRight size={16} /></button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form className="fln-b-rsvp-form" onSubmit={submitRsvp}>
                  <div className="fln-b-rsvp-review">
                    <div className="fln-b-rsvp-review-head">
                      <span>YOUR RESERVATION</span>
                      <strong>FIRST LOVE NIGHT · THE FORMAL</strong>
                    </div>
                    <div className="fln-b-rsvp-review-grid">
                      <div><small>GUEST</small><strong>{form.full_name}</strong></div>
                      <div><small>AGE GROUP</small><strong>{form.age_group === "high_school" ? "High School" : "College"}</strong></div>
                      <div><small>GUESTS</small><strong>{guestCount + 1}</strong></div>
                      <div><small>DATE</small><strong>{content.date_label}</strong></div>
                      <div><small>TIME</small><strong>{content.time_label}</strong></div>
                      <div><small>VENUE</small><strong>{venue}</strong></div>
                      <div><small>DRESS CODE</small><strong>{content.dress_code}</strong></div>
                      <div><small>COMMUNITY</small><strong>{form.church_group || "Not specified"}</strong></div>
                    </div>
                  </div>

                  <label className="fln-b-rsvp-check fln-b-rsvp-final-check">
                    <input type="checkbox" required checked={form.consent} onChange={(event) => update("consent", event.target.checked)} />
                    <span>I confirm my information is accurate and agree to be contacted about First Love Night.</span>
                  </label>

                  {rsvpError && <div className="fln-b-rsvp-error" role="alert">{rsvpError}</div>}

                  <div className="fln-b-rsvp-actions">
                    <button className="fln-b-rsvp-secondary" type="button" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button className="fln-b-rsvp-primary" type="submit" disabled={submitting}>
                      {submitting ? <><LoaderCircle className="fln-b-rsvp-spin" size={16} /> Securing your place…</> : <>Confirm my RSVP <Check size={16} /></>}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="fln-b-rsvp-confirmed">
              <div className="fln-b-rsvp-confirmed-mark"><CheckCircle2 size={39} /></div>
              <p>YOU'RE ON THE LIST</p>
              <h2>See you at<br /><em>The Formal.</em></h2>
              <span>{confirmation.name}, your RSVP is confirmed. Keep your confirmation code for check-in.</span>

              <div className="fln-b-rsvp-pass">
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

              <div className="fln-b-rsvp-confirm-actions">
                <button type="button" className="fln-b-rsvp-secondary" onClick={() => void navigator.clipboard?.writeText(confirmation.code)}>
                  <Copy size={15} /> Copy code
                </button>
                <a href={calendarUrl} target="_blank" rel="noreferrer" className="fln-b-rsvp-secondary">
                  <CalendarDays size={15} /> Calendar
                </a>
              </div>

              <a className="fln-b-rsvp-home" href="/first-love-night-option-b">
                Back to First Love Night <ArrowRight size={15} />
              </a>
            </div>
          )}
        </div>

        <footer className="fln-b-rsvp-footer">
          <div><CalendarDays size={14} /><span>{content.date_label}</span></div>
          <div><Clock3 size={14} /><span>{content.time_label}</span></div>
          <div><MapPin size={14} /><span>{venue}</span></div>
        </footer>
      </section>
    </main>
  );
}
