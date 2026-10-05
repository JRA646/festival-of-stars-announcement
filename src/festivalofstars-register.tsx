import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, LoaderCircle, MapPin, Music2, Mic2, Drama, Users, Sparkles } from "lucide-react";
import { supabase } from "./lib/supabase";
import "./festivalofstars-register.css";

type TalentType = "singing" | "rap" | "acting";
type Talent = { id: string; slug: TalentType; name: string; tagline: string; description: string; accent: string };
type PublicFestival = {
  event: { id: string; name: string; start_at: string; location: string | null };
  announcement: { registration_enabled: boolean };
  talents: Talent[];
};

const SLUG = "festival-of-stars";

export default function FestivalOfStarsRegister() {
  const [festival, setFestival] = useState<PublicFestival | null>(null);
  const [mode, setMode] = useState<"rsvp" | "talent">("rsvp");
  const [talent, setTalent] = useState<TalentType>("singing");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [rsvp, setRsvp] = useState({ full_name: "", email: "", mobile: "", guests: "0", attending_service: "4:00 PM", message: "" });
  const [talentForm, setTalentForm] = useState({ full_name: "", email: "", mobile: "", performance_title: "", description: "", sample_url: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("talent") as TalentType | null;
    if (preset && ["singing", "rap", "acting"].includes(preset)) {
      setTalent(preset);
      setMode("talent");
    }

    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc("get_public_festival_of_stars", { p_slug: SLUG });
      if (rpcError || !data) {
        setError("Registration is temporarily unavailable.");
      } else {
        setFestival(data as PublicFestival);
      }
      setLoading(false);
    };
    void load();
  }, []);

  const selectedTalent = useMemo(
    () => festival?.talents.find((item) => item.slug === talent) || festival?.talents[0] || null,
    [festival, talent],
  );

  const updateRsvp = (field: keyof typeof rsvp, value: string) => setRsvp((current) => ({ ...current, [field]: value }));
  const updateTalent = (field: keyof typeof talentForm, value: string) => setTalentForm((current) => ({ ...current, [field]: value }));

  const submitRsvp = async () => {
    if (!festival || !consent) return;
    setSubmitting(true); setError("");
    const { error: insertError } = await supabase.from("festival_registrations").insert({
      event_id: festival.event.id,
      full_name: rsvp.full_name.trim(),
      email: rsvp.email.trim().toLowerCase(),
      mobile: rsvp.mobile.trim() || null,
      guests: Number(rsvp.guests),
      attending_service: rsvp.attending_service,
      message: rsvp.message.trim() || null,
    });
    if (insertError) {
      setError(insertError.code === "23505" ? "This email is already registered for Festival of Stars." : "We could not complete your registration. Please check your details and try again.");
    } else {
      void supabase.from("festival_analytics_events").insert({ event_id: festival.event.id, event_type: "register_submit", path: window.location.pathname, metadata: { type: "rsvp" } });
      setSuccess("You are registered for Festival of Stars!");
      setRsvp({ full_name: "", email: "", mobile: "", guests: "0", attending_service: "4:00 PM", message: "" });
    }
    setSubmitting(false);
  };

  const submitTalent = async () => {
    if (!festival || !selectedTalent || !consent) return;
    setSubmitting(true); setError("");
    const { error: insertError } = await supabase.from("festival_talent_submissions").insert({
      event_id: festival.event.id,
      talent_category_id: selectedTalent.id,
      full_name: talentForm.full_name.trim(),
      email: talentForm.email.trim().toLowerCase(),
      mobile: talentForm.mobile.trim() || null,
      performance_title: talentForm.performance_title.trim(),
      description: talentForm.description.trim(),
      sample_url: talentForm.sample_url.trim() || null,
    });
    if (insertError) {
      setError("We could not submit your talent entry. Please check the required fields and try again.");
    } else {
      void supabase.from("festival_analytics_events").insert({ event_id: festival.event.id, event_type: "talent_submit", path: window.location.pathname, metadata: { talent: selectedTalent.slug } });
      setSuccess("Talent submission received! The team will review your entry.");
      setTalentForm({ full_name: "", email: "", mobile: "", performance_title: "", description: "", sample_url: "" });
    }
    setSubmitting(false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!consent) { setError("Please confirm that the information you provided is accurate and that you agree to be contacted about the event."); return; }
    if (mode === "rsvp") void submitRsvp(); else void submitTalent();
  };

  if (loading) return <main className="fos-register-state"><LoaderCircle className="register-spin"/><p>Loading registration…</p></main>;
  if (!festival) return <main className="fos-register-state"><Sparkles/><h1>Registration unavailable</h1><p>{error || "Please try again later."}</p><a href="/festivalofstars">Back to Festival of Stars</a></main>;

  return (
    <main className="fos-register-page">
      <header className="register-header">
        <a href="/festivalofstars"><ArrowLeft size={18}/> Festival of Stars</a>
        <div><strong>FIRST LOVE CHURCH</strong><span>PHILIPPINES</span></div>
      </header>

      <section className="register-hero">
        <div>
          <p className="section-kicker">SAVE YOUR SPOT</p>
          <h1>Be part of<br/><span>the stars.</span></h1>
          <p>Choose an RSVP or submit your creative talent. Your next big moment can start here.</p>
          <div className="register-event-meta"><span><CalendarDays size={17}/> {new Date(festival.event.start_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span><span><MapPin size={17}/> {festival.event.location || "First Love Church · Las Piñas City"}</span></div>
        </div>
        <div className="register-art"><div className="register-art-bg"/><div className="register-art-image"><img src="/images/ai-festival-singer.webp" alt="AI-generated Festival of Stars singer" /></div><Sparkles className="register-sparkle"/></div>
      </section>

      <section className="register-shell">
        <div className="register-tabs">
          <button className={mode==="rsvp"?"active":""} onClick={() => { setMode("rsvp"); setSuccess(""); setError(""); }}>RSVP <Users size={17}/></button>
          <button className={mode==="talent"?"active":""} onClick={() => { setMode("talent"); setSuccess(""); setError(""); }}>CREATIVE SHOWCASE <Sparkles size={17}/></button>
        </div>

        {mode === "talent" && (
          <div className="talent-pickers">
            {festival.talents.map((item) => {
              const Icon = item.slug === "singing" ? Music2 : item.slug === "rap" ? Mic2 : Drama;
              return <button key={item.id} className={talent===item.slug?"picked":""} style={{ "--pick-accent": item.accent } as Record<string,string>} onClick={() => setTalent(item.slug)}><Icon/><span><strong>{item.name}</strong><small>{item.tagline}</small></span><ArrowRight size={15}/></button>;
            })}
          </div>
        )}

        <form className="register-form" onSubmit={onSubmit}>
          {selectedTalent && mode === "talent" && <div className="chosen-talent" style={{ "--talent-accent": selectedTalent.accent } as Record<string,string>}><span>{selectedTalent.name}</span><strong>{selectedTalent.tagline}</strong><small>{selectedTalent.description}</small></div>}

          <div className="form-grid">
            <label><span>Full name *</span><input required minLength={2} value={mode==="rsvp"?rsvp.full_name:talentForm.full_name} onChange={(e)=>mode==="rsvp"?updateRsvp("full_name",e.target.value):updateTalent("full_name",e.target.value)} placeholder="Juan Dela Cruz"/></label>
            <label><span>Email *</span><input required type="email" value={mode==="rsvp"?rsvp.email:talentForm.email} onChange={(e)=>mode==="rsvp"?updateRsvp("email",e.target.value):updateTalent("email",e.target.value)} placeholder="you@example.com"/></label>
            <label><span>Mobile number</span><input type="tel" value={mode==="rsvp"?rsvp.mobile:talentForm.mobile} onChange={(e)=>mode==="rsvp"?updateRsvp("mobile",e.target.value):updateTalent("mobile",e.target.value)} placeholder="09XX XXX XXXX"/></label>

            {mode === "rsvp" ? (
              <>
                <label><span>Guests</span><select value={rsvp.guests} onChange={(e)=>updateRsvp("guests",e.target.value)}>{Array.from({length:11},(_,i)=><option key={i} value={i}>{i===0?"Just me":i}</option>)}</select></label>
                <label><span>Gathering time</span><select value={rsvp.attending_service} onChange={(e)=>updateRsvp("attending_service",e.target.value)}><option>4:00 PM</option><option>OTHER</option></select></label>
                <label className="field-full"><span>Message (optional)</span><textarea value={rsvp.message} onChange={(e)=>updateRsvp("message",e.target.value)} rows={5} placeholder="Tell us anything we should know."/></label>
              </>
            ) : (
              <>
                <label className="field-full"><span>Performance title *</span><input required minLength={2} value={talentForm.performance_title} onChange={(e)=>updateTalent("performance_title",e.target.value)} placeholder="My original song"/></label>
                <label className="field-full"><span>Tell us about your performance *</span><textarea required minLength={10} value={talentForm.description} onChange={(e)=>updateTalent("description",e.target.value)} rows={6} placeholder="What are you performing? How long is it? What should the team know?"/></label>
                <label className="field-full"><span>Sample link (optional)</span><input type="url" value={talentForm.sample_url} onChange={(e)=>updateTalent("sample_url",e.target.value)} placeholder="https://..."/></label>
              </>
            )}
          </div>

          <label className="consent"><input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)}/><span>I confirm that the information above is accurate and I agree to be contacted by the event team about Festival of Stars.</span></label>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success"><CheckCircle2 size={20}/><span>{success}</span></div>}

          <button className="submit-button" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle className="register-spin"/> Sending…</> : mode==="rsvp" ? <>Complete RSVP <ArrowRight size={18}/></> : <>Submit talent <Sparkles size={18}/></>}</button>
        </form>
      </section>

      <footer className="register-footer"><div>Festival of Stars · First Love Church Philippines</div><a href="/festivalofstars">Back to announcement</a></footer>
    </main>
  );
}
