import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Share2,
  Star,
  Users,
  BookOpen,
  Music2,
  Mic2,
  Drama,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./festivalofstars.css";

type EventData = {
  id: string;
  location: string | null;
};

type TalentType = "singing" | "rap" | "acting";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EVENT_SLUG = "festival-of-stars";
const EVENT_DATE = "2026-12-12T16:00:00+08:00";

const talentContent: Record<
  TalentType,
  { label: string; title: string; copy: string; accent: string }
> = {
  singing: {
    label: "SINGING",
    title: "Raise your voice.",
    copy: "Lead worship, perform a song, or bring a sound that gets the whole room singing.",
    accent: "#19ddd1",
  },
  rap: {
    label: "RAP",
    title: "Bring your bars.",
    copy: "Tell your story through rhythm, flow, poetry, and a message that makes people think.",
    accent: "#ffc526",
  },
  acting: {
    label: "ACTING",
    title: "Own the stage.",
    copy: "Perform a scene, monologue, skit, spoken word piece, or creative act that brings the story to life.",
    accent: "#ff6148",
  },
};


function getTimeLeft(target: string): TimeLeft {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(target));
    tick();

    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [target]);

  return timeLeft;
}

export default function FestivalOfStars() {
  const [event, setEvent] = useState<EventData | null>(null);
  const [activeTalent, setActiveTalent] = useState<TalentType>("singing");
  const [showTalentPanel, setShowTalentPanel] = useState(false);
  const [registered, setRegistered] = useState(false);

  const timeLeft = useCountdown(EVENT_DATE);

  useEffect(() => {
    let mounted = true;

    const loadEvent = async () => {
      const { data } = await supabase.rpc("get_public_event_announcement", {
        p_slug: EVENT_SLUG,
      });

      if (!mounted) return;

      const row = Array.isArray(data) ? data[0] : data;
      if (row) setEvent(row as EventData);
    };

    void loadEvent();

    return () => {
      mounted = false;
    };
  }, []);

  const mapsUrl = event?.location
    ? "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(event.location)
    : "https://www.google.com/maps/search/?api=1&query=First+Love+Church+Las+Pinas";

  const share = () => {
    if (navigator.share) {
      void navigator.share({
        title: "Festival of Stars",
        text: "Shine. Belong. Make a difference. Join Festival of Stars!",
        url: window.location.href,
      });
      return;
    }

    void navigator.clipboard?.writeText(window.location.href);
  };

  const revealTalent = (talent: TalentType) => {
    setActiveTalent(talent);
    setShowTalentPanel(true);
  };

  const handleRegister = () => {
    setRegistered(true);
    window.setTimeout(() => setRegistered(false), 3200);
  };

  const handleHeroPointer = (eventPointer: PointerEvent & { currentTarget: HTMLElement }) => {
    const bounds = eventPointer.currentTarget.getBoundingClientRect();
    const x = ((eventPointer.clientX - bounds.left) / bounds.width) * 100;
    const y = ((eventPointer.clientY - bounds.top) / bounds.height) * 100;

    eventPointer.currentTarget.style.setProperty("--mouse-x", `${x}%`);
    eventPointer.currentTarget.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <main className="fos">
      <nav className="fos-nav">
        <a className="fos-logo" href="#home" aria-label="First Love Church home">
          <span className="logo-mark">♥</span>
          <span>
            First Love
            <small>CHURCH</small>
          </span>
        </a>

        <div className="fos-links">
          <a className="active" href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#details">Details</a>
          <a href="#talent">Talent</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <button className="icon-btn" onClick={share} aria-label="Share event">
            <Share2 size={18} />
          </button>
          <a className="register-pill" href="#register" onClick={handleRegister}>
            Register Now <ArrowRight size={16} />
          </a>
        </div>
      </nav>

      <section className="fos-hero" id="home" onPointerMove={handleHeroPointer}>
        <div className="hero-glow" />
        <div className="grain" />

        <div className="paint paint-yellow" />
        <div className="paint paint-cyan" />
        <div className="paint paint-coral" />
        <div className="paint paint-pink" />

        <div className="scribble scribble-star">✦</div>
        <div className="scribble scribble-crown">♛</div>
        <div className="scribble scribble-plus">＋</div>
        <div className="scribble scribble-star-2">✦</div>

        <div className="hero-copy">
          <p className="hero-kicker">ONE CHURCH · MANY STORIES · ONE BIG CELEBRATION</p>
          <h1>
            FESTIVAL
            <br />
            <span>OF STARS</span>
          </h1>

          <p className="hero-tag">SHINE · BELONG · MAKE A DIFFERENCE</p>
          <p className="hero-description">
            A high-energy celebration for youth and young adults — packed with
            worship, real community, creative expression, and purpose.
          </p>

          <div className="hero-actions">
            <a className="hero-register" href="#register" onClick={handleRegister}>
              REGISTER NOW <ArrowRight size={20} />
            </a>
            <a className="hero-ghost" href="#details">
              EXPLORE THE NIGHT <ArrowDown size={18} />
            </a>
          </div>
        </div>

        <div className="hero-side hero-side-left">
          <b>WORSHIP<br />TOGETHER</b>
          <Star size={30} />
        </div>

        <div className="hero-side hero-side-right">
          <b>DISCOVER<br />YOUR PURPOSE</b>
          <span>✦</span>
        </div>

        <div className="hero-human hero-human-left mood-singer" role="img" aria-label="Singer artwork from the uploaded Festival of Stars mood board">
          <span>WORSHIP ✦</span>
        </div>

        <div className="hero-human hero-human-right">
          <div className="mood-image mood-female" role="img" aria-label="Female worship artwork from the uploaded Festival of Stars mood board" />
          <span>YOU BELONG HERE</span>
        </div>

        <div className="info-strip">
          <div>
            <CalendarDays />
            <b>DEC 12, 2026</b>
            <small>SATURDAY · 4:00 PM</small>
          </div>
          <i />
          <div>
            <MapPin />
            <b>FIRST LOVE CHURCH</b>
            <small>LAS PIÑAS CITY</small>
          </div>
          <i />
          <div>
            <Users />
            <b>FOR YOUTH &amp; YOUNG ADULTS</b>
            <small>AGES 13 AND UP</small>
          </div>
        </div>

        <div className="countdown-wrap">
          <p>COUNTING DOWN TO THE NIGHT</p>
          <div className="countdown">
            {[
              ["days", timeLeft.days, "DAYS"],
              ["hours", timeLeft.hours, "HOURS"],
              ["minutes", timeLeft.minutes, "MINUTES"],
              ["seconds", timeLeft.seconds, "SECONDS"],
            ].map(([key, value, label], index) => (
              <div className={`count count-${index + 1}`} key={key}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="hero-bottom">Be part of something bigger!</p>
        <a className="scroll-cue" href="#about" aria-label="Scroll to about">
          <ArrowDown size={18} />
        </a>
      </section>

      <section className="human-strip" aria-label="Festival people">
        <div className="human-photo human-photo-wide">
          <div className="mood-image mood-crowd" role="img" aria-label="Worship crowd from the uploaded Festival of Stars mood board" />
          <span>WE CELEBRATE TOGETHER</span>
        </div>
        <div className="human-photo">
          <div className="mood-image mood-guitar" role="img" aria-label="Guitarist from the uploaded Festival of Stars mood board" />
          <span>POWERFUL WORSHIP</span>
        </div>
        <div className="human-photo">
          <div className="mood-image mood-community" role="img" aria-label="Youth community from the uploaded Festival of Stars mood board" />
          <span>REAL COMMUNITY</span>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>✦ SHINE</span>
          <span>✦ BELONG</span>
          <span>✦ WORSHIP</span>
          <span>✦ RAP</span>
          <span>✦ ACTING</span>
          <span>✦ SINGING</span>
          <span>✦ CREATE</span>
          <span>✦ DISCOVER</span>
          <span>✦ SHINE</span>
          <span>✦ BELONG</span>
          <span>✦ WORSHIP</span>
          <span>✦ RAP</span>
          <span>✦ ACTING</span>
          <span>✦ SINGING</span>
          <span>✦ CREATE</span>
          <span>✦ DISCOVER</span>
        </div>
      </div>

      <section className="color-band">
        <h2>Every star has a story.</h2>
        <b>Come ready to shine.</b>
      </section>

      <section className="fos-section light" id="about">
        <p className="section-kicker">A NIGHT TO REMEMBER</p>
        <h2>Why Festival of Stars?</h2>

        <div className="about-grid">
          <div className="poster-note">
            <Sparkles size={38} />
            <strong>
              YOU
              <br />
              ARE A
              <br />
              <em>STAR</em>
            </strong>
            <span>Shine where God placed you.</span>
          </div>

          <div>
            <p className="big-copy">
              Festival of Stars is more than an event. It is a space where young
              people can worship boldly, meet people, discover purpose, and use
              their creativity for something bigger.
            </p>
            <p className="body-copy">
              Expect a night built around faith, friendship, music, stories,
              stage performances, games, and moments that make you want to come
              back with your whole squad.
            </p>
          </div>
        </div>
      </section>

      <section className="fos-section dark" id="details">
        <div className="section-kicker">WHAT YOU'LL EXPERIENCE</div>
        <h2>Come. Connect. Shine.</h2>

        <div className="feature-grid">
          <article>
            <Music2 />
            <h3>Powerful worship</h3>
            <p>Sing loud, lift your hands, and experience God’s presence through music.</p>
            <span className="feature-number">01</span>
          </article>
          <article>
            <Users />
            <h3>Real community</h3>
            <p>Meet new friends and belong to a family that genuinely cares.</p>
            <span className="feature-number">02</span>
          </article>
          <article>
            <BookOpen />
            <h3>Life-changing messages</h3>
            <p>Hear practical truth and discover the purpose God has put in you.</p>
            <span className="feature-number">03</span>
          </article>
          <article>
            <Sparkles />
            <h3>Fun &amp; creative activities</h3>
            <p>Games, challenges, art, performances, and surprises all night long.</p>
            <span className="feature-number">04</span>
          </article>
        </div>
      </section>

      <section className="talent-stage" id="talent">
        <div className="section-kicker">CREATIVE SHOWCASE</div>
        <h2>Bring your talent to the stars.</h2>
        <p className="talent-intro">
          Festival of Stars is your stage. Pick a lane, tap into your creativity,
          and discover where your gift can make an impact.
        </p>

        <div className="talent-grid">
          <button className="talent-card talent-sing" onClick={() => revealTalent("singing")}>
            <Music2 />
            <span>01</span>
            <strong>SINGING</strong>
            <small>Raise your voice.</small>
            <ArrowRight />
          </button>

          <button className="talent-card talent-rap" onClick={() => revealTalent("rap")}>
            <Mic2 />
            <span>02</span>
            <strong>RAP</strong>
            <small>Bring your bars.</small>
            <ArrowRight />
          </button>

          <button className="talent-card talent-act" onClick={() => revealTalent("acting")}>
            <Drama />
            <span>03</span>
            <strong>ACTING</strong>
            <small>Own the stage.</small>
            <ArrowRight />
          </button>
        </div>

        <div className="talent-selector">
          <div className="talent-tabs" role="tablist" aria-label="Talent showcase">
            {(Object.keys(talentContent) as TalentType[]).map((talent) => (
              <button
                key={talent}
                className={activeTalent === talent ? "selected" : ""}
                onClick={() => setActiveTalent(talent)}
              >
                {talentContent[talent].label}
              </button>
            ))}
          </div>

          <div
            className="talent-preview"
            style={{ "--talent-accent": talentContent[activeTalent].accent } as Record<string, string>}
          >
            <div>
              <p>{talentContent[activeTalent].label}</p>
              <h3>{talentContent[activeTalent].title}</h3>
              <span>{talentContent[activeTalent].copy}</span>
            </div>
            <button className="preview-button" onClick={() => setShowTalentPanel(true)}>
              See performance details <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="schedule-section">
        <div className="section-kicker">SAVE THE DATE</div>
        <h2>Saturday. December 12.</h2>

        <div className="schedule-card">
          <div className="schedule-date">DEC<br /><span>12</span></div>
          <div className="schedule-content">
            <h3>Festival of Stars</h3>
            <p><Clock3 size={16} /> 4:00 PM</p>
            <p><MapPin size={16} /> First Love Church · Las Piñas City</p>
            <div className="schedule-checks">
              <span><CheckCircle2 size={15} /> Youth &amp; Young Adults</span>
              <span><CheckCircle2 size={15} /> Ages 13 and up</span>
              <span><CheckCircle2 size={15} /> Open to friends</span>
            </div>
          </div>
          <a className="direction-button" href={mapsUrl} target="_blank" rel="noreferrer">
            Get directions <MapPin size={16} />
          </a>
        </div>
      </section>

      <section className="fos-section dark visit">
        <div className="section-kicker">YOUR VISIT</div>
        <h2>Same mission.<br />Brighter tomorrow.</h2>

        <div className="visit-item">
          <h3>Bring your people</h3>
          <p>Invite a friend, classmate, teammate, sibling, or anyone who needs a night to belong.</p>
        </div>

        <div className="visit-item">
          <h3>Bring your creativity</h3>
          <p>Come ready to sing, rap, act, create, dance, cheer, and celebrate the gifts God gave you.</p>
        </div>

        <div className="visit-item">
          <h3>Bring your story</h3>
          <p>You do not have to have it all figured out. Show up, meet people, and take your next step.</p>
        </div>
      </section>

      <section className="fos-cta" id="register">
        <div>
          <div className="section-kicker">YOUR STAR MOMENT STARTS HERE</div>
          <h2>Be part of the night.</h2>
          <p>Save the date, invite your people, and get ready to shine.</p>
        </div>

        <a className="hero-register" href="/register/festival-of-stars" onClick={handleRegister}>
          REGISTER NOW <ArrowRight size={18} />
        </a>
      </section>

      <footer id="contact">
        <div>
          <strong>FIRST LOVE CHURCH PHILIPPINES</strong>
          <small>Festival of Stars · December 12, 2026</small>
        </div>

        <button onClick={share}>
          <Share2 size={15} /> Share this announcement
        </button>
      </footer>

      {showTalentPanel && (
        <div className="talent-modal-backdrop" role="presentation" onClick={() => setShowTalentPanel(false)}>
          <section
            className="talent-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="talent-modal-title"
            onClick={(eventModal) => eventModal.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setShowTalentPanel(false)} aria-label="Close">
              <X size={20} />
            </button>
            <div className="modal-icon">
              {activeTalent === "singing" && <Music2 />}
              {activeTalent === "rap" && <Mic2 />}
              {activeTalent === "acting" && <Drama />}
            </div>
            <p className="section-kicker">{talentContent[activeTalent].label}</p>
            <h3 id="talent-modal-title">{talentContent[activeTalent].title}</h3>
            <p>{talentContent[activeTalent].copy}</p>
            <div className="modal-list">
              <span><CheckCircle2 size={15} /> Prepare a 2–4 minute piece</span>
              <span><CheckCircle2 size={15} /> Keep the message uplifting</span>
              <span><CheckCircle2 size={15} /> Bring your best energy</span>
            </div>
            <a className="modal-action" href="/register/festival-of-stars" onClick={handleRegister}>
              Register now <ArrowRight size={17} />
            </a>
          </section>
        </div>
      )}

      {registered && (
        <div className="register-toast">
          <CheckCircle2 size={20} />
          <span>Registration is ready — continue to the RSVP form.</span>
          <a href="/register/festival-of-stars">Open RSVP</a>
        </div>
      )}
    </main>
  );
}
