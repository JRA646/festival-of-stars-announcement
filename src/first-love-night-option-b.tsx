import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./first-love-night-option-b.css";

type FirstLoveNightData = {
  event: {
    name: string;
    description: string | null;
    start_at: string;
    location: string | null;
  };
  announcement: {
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
      experience: { title: string; copy: string; icon: string }[];
      timeline: { time: string; title: string; copy: string }[];
      dress_code_items: { title: string; copy: string }[];
      faqs: { question: string; answer: string }[];
    };
  };
  registration_count: number;
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

export default function FirstLoveNightOptionB() {
  const [data, setData] = useState<FirstLoveNightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const { data: result, error: rpcError } = await supabase.rpc("get_public_first_love_night");

      if (!alive) return;

      if (rpcError || !result) {
        setError("This event page is temporarily unavailable.");
        setLoading(false);
        return;
      }

      const typed = result as FirstLoveNightData;
      setData(typed);
      document.title = typed.announcement.seo_title;
      setLoading(false);
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const content = data?.announcement.content;
  const venue = data?.event.location || content?.venue_label || "TBA";
  const eventDate = data ? formatDate(data.event.start_at) : "";

  const share = async () => {
    const url = window.location.origin + "/first-love-night-option-b";

    if (navigator.share && data) {
      await navigator.share({
        title: data.event.name,
        text: "Join us for First Love Night: The Formal.",
        url,
      });
      return;
    }

    await navigator.clipboard?.writeText(url);
  };

  if (loading) {
    return (
      <main className="fln-b-state">
        <Sparkles size={22} />
        <p>Preparing First Love Night…</p>
      </main>
    );
  }

  if (error || !data || !content) {
    return (
      <main className="fln-b-state">
        <Heart size={24} />
        <h1>First Love Night</h1>
        <p>{error || "Event details are unavailable."}</p>
        <button type="button" onClick={() => window.location.reload()}>
          TRY AGAIN
        </button>
      </main>
    );
  }

  return (
    <main className="fln-b-page">
      <header className={menuOpen ? "fln-b-nav open" : "fln-b-nav"}>
        <a href="#top" className="fln-b-brand" onClick={() => setMenuOpen(false)}>
          <span>FIRST LOVE</span>
          <strong>NIGHT</strong>
          <small>THE FORMAL</small>
        </a>

        <nav aria-label="First Love Night navigation">
          {[
            ["The Night", "the-night"],
            ["Experience", "experience"],
            ["Details", "details"],
            ["FAQ", "faq"],
          ].map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>

        <div className="fln-b-actions">
          <button type="button" className="fln-b-share" onClick={() => void share()} aria-label="Share First Love Night">
            <Share2 size={16} />
          </button>
          <a className="fln-b-rsvp" href="/first-love-night/rsvp">
            RSVP <ArrowRight size={15} />
          </a>
          <button
            type="button"
            className="fln-b-menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <section id="top" className="fln-b-hero">
        <div className="fln-b-hero-copy">
          <p className="fln-b-eyebrow">FIRST LOVE EXPERIENCE · {content.audience}</p>
          <h1>
            First
            <em>Love</em>
            Night
          </h1>
          <p className="fln-b-lead">{content.subtitle}</p>

          <div className="fln-b-hero-meta">
            <span><CalendarDays size={16} /> {content.date_label}</span>
            <span><Clock3 size={16} /> {content.time_label}</span>
            <span><MapPin size={16} /> {venue}</span>
          </div>

          <div className="fln-b-hero-actions">
            <a className="fln-b-primary" href="/first-love-night/rsvp">
              Reserve your place <ArrowRight size={16} />
            </a>
            <a className="fln-b-text-link" href="#the-night">
              Discover the night
            </a>
          </div>
        </div>

        <div className="fln-b-hero-art">
          <div className="fln-b-image fln-b-image-main" style={{ backgroundImage: `url("${content.hero_image_url}")` }} />
          <div className="fln-b-image-caption">
            <span>01</span>
            <strong>{eventDate}</strong>
            <small>{content.city_label}</small>
          </div>
          <div className="fln-b-seal" aria-hidden="true">
            <span>FIRST LOVE</span>
            <strong>✦</strong>
            <span>THE FORMAL</span>
          </div>
        </div>
      </section>

      <section className="fln-b-note">
        <span>AN INVITATION</span>
        <strong>Dress well. Arrive expectant. Leave changed.</strong>
        <Heart size={17} />
      </section>

      <section id="the-night" className="fln-b-story">
        <div className="fln-b-story-image" style={{ backgroundImage: `url("${content.hero_image_url}")` }} />
        <div className="fln-b-story-copy">
          <p className="fln-b-eyebrow">WHY THIS NIGHT EXISTS</p>
          <h2>{content.vision_title}</h2>
          <p>{content.vision_copy}</p>
          <div className="fln-b-quote">
            <span>“</span>
            <strong>Come for the room. Stay for the moment. Remember the purpose.</strong>
          </div>
        </div>
      </section>

      <section id="experience" className="fln-b-experience">
        <div className="fln-b-section-intro">
          <p className="fln-b-eyebrow">THE EXPERIENCE</p>
          <h2>Five moments,<br /><em>one night.</em></h2>
        </div>

        <div className="fln-b-experience-list">
          {content.experience.slice(0, 5).map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
              <ArrowRight size={18} />
            </article>
          ))}
        </div>
      </section>

      <section className="fln-b-marquee" aria-label="Event statement">
        <div>FAITH</div>
        <span>·</span>
        <div>FELLOWSHIP</div>
        <span>·</span>
        <div>CELEBRATION</div>
      </section>

      <section className="fln-b-details" id="details">
        <div className="fln-b-details-card">
          <p className="fln-b-eyebrow">THE EVENING</p>
          <h2>Save the date.</h2>
          <div className="fln-b-details-grid">
            <div>
              <span>DATE</span>
              <strong>{content.date_label}</strong>
              <small>{content.weekday}</small>
            </div>
            <div>
              <span>TIME</span>
              <strong>{content.time_label}</strong>
              <small>Formal evening</small>
            </div>
            <div>
              <span>VENUE</span>
              <strong>{venue}</strong>
              <small>{content.city_label}</small>
            </div>
            <div>
              <span>DRESS CODE</span>
              <strong>{content.dress_code}</strong>
              <small>Elegant · polished · photo-ready</small>
            </div>
          </div>
          <a className="fln-b-primary" href="/first-love-night/rsvp">
            RSVP now <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className="fln-b-faq" id="faq">
        <div>
          <p className="fln-b-eyebrow">FAQ</p>
          <h2>The details before you say yes.</h2>
        </div>
        <div className="fln-b-faq-list">
          {content.faqs.slice(0, 6).map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="fln-b-footer">
        <div>
          <span>FIRST LOVE EXPERIENCE</span>
          <strong>First Love Night</strong>
        </div>
        <p>{data.registration_count} registrations · {content.date_label}</p>
        <a href="/first-love-night/rsvp">Reserve your place <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}
