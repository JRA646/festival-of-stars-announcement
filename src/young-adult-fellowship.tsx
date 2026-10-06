import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import "./young-adult-fellowship.css";

const TOPIC_FORM_URL = "https://forms.gle/kyPkB1fBYm7KFXCo7";
const EVENT_MAP_URL =
  "https://www.google.com/maps/dir/?api=1&destination=14.47395,120.98124";

function buildCalendarUrl() {
  const start = "20261011T130000";
  const end = "20261011T150000";
  const title = encodeURIComponent("First Love Young Adult Fellowship");
  const details = encodeURIComponent("Real People • Real Faith • Real Life");
  const location = encodeURIComponent(
    "Villar Sipag Events Place, Las Piñas, Philippines",
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

const expectations = [
  {
    icon: Sparkles,
    title: "Worship",
    text: "Lift your heart and voice to Jesus.",
  },
  {
    icon: BookOpen,
    title: "Word",
    text: "Biblical truth for everyday life.",
  },
  {
    icon: MessageCircle,
    title: "Real Conversations",
    text: "Ask honest questions without pretending.",
  },
  {
    icon: Users,
    title: "Friendship",
    text: "Meet people walking the same journey.",
  },
  {
    icon: Heart,
    title: "Prayer",
    text: "Make space for God together.",
  },
  {
    icon: Star,
    title: "Fun",
    text: "Laugh, connect, and enjoy each other's company.",
  },
];

export default function YoungAdultFellowship() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    document.title = "First Love Young Adults | Real Faith, Real Life";

    const description =
      "Young Adults Fellowship — a space to deepen your relationship with God, build Christ-centred friendships, and enjoy life together.";

    const setMeta = (attr: string, key: string, value: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`,
      );

      if (!node) {
        node = document.createElement("meta");
        node.setAttribute(attr, key);
        document.head.appendChild(node);
      }

      node.content = value;
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", "First Love Young Adults | Real Faith, Real Life");
    setMeta("property", "og:description", description);
    setMeta(
      "property",
      "og:image",
      `${window.location.origin}/festival-assets/08_Youth_Community.png`,
    );
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", "First Love Young Adults | Real Faith, Real Life");
    setMeta("name", "twitter:description", description);
    setMeta(
      "name",
      "twitter:image",
      `${window.location.origin}/festival-assets/08_Youth_Community.png`,
    );

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = `${window.location.origin}/young-adult-fellowship`;
  }, []);

  const closeMenu = () => setMenuOpen(false);

  async function shareEvent() {
    const shareData = {
      title: "First Love Young Adult Fellowship",
      text:
        "Join us on October 11, 2026 at 1:00 PM at Villar Sipag Events Place, Las Piñas.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Shared!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Link copied!");
      }
    } catch {
      setShareMessage("");
    }

    window.setTimeout(() => setShareMessage(""), 2200);
  }

  return (
    <main className="ya-site">
      <nav className="ya-nav">
        <a className="ya-brand" href="#home" onClick={closeMenu}>
          <span className="ya-brand-mark">
            <img src="/images/app_logo.png" alt="" />
          </span>
          <span className="ya-brand-name">
            FIRST LOVE
            <small>YOUNG ADULTS</small>
          </span>
        </a>

        <div className={`ya-links ${menuOpen ? "open" : ""}`}>
          <a href="#vision" onClick={closeMenu}>Vision</a>
          <a href="#event" onClick={closeMenu}>Event</a>
          <a href="#expect" onClick={closeMenu}>What to Expect</a>
        </div>

        <div className="ya-nav-actions">
          <button
            className="ya-share-mini"
            type="button"
            onClick={shareEvent}
            aria-label="Share event"
          >
            <MessageCircle size={16} />
          </button>
          <a className="ya-nav-cta" href="#event" onClick={closeMenu}>
            Join Us
          </a>
        </div>

        <button
          className="ya-menu"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      <section id="home" className="ya-hero">
        <div className="ya-hero-image" aria-hidden="true">
          <img src="/festival-assets/08_Youth_Community.png" alt="" />
        </div>
        <div className="ya-hero-overlay" />

        <div className="ya-hero-content">
          <span className="ya-kicker">YOUNG ADULT FELLOWSHIP</span>
          <span className="ya-event-pill">OCTOBER 11, 2026 • 1:00 PM</span>

          <h1>
            REAL PEOPLE.
            <span>REAL FAITH.</span>
            REAL LIFE.
          </h1>

          <p>
            A simple space for young adults to connect, grow in faith, and build
            Christ-centred friendships.
          </p>

          <div className="ya-hero-actions">
            <a className="ya-primary-button" href="#event">
              JOIN THE GATHERING <ArrowRight size={18} />
            </a>
            <a
              className="ya-secondary-button"
              href={TOPIC_FORM_URL}
              target="_blank"
              rel="noreferrer"
            >
              SUGGEST A TOPIC
            </a>
          </div>
        </div>

        <div className="ya-hero-photo">
          <img
            src="/festival-assets/person_1.png"
            alt="Young adults gathering together"
          />
        </div>
      </section>

      <section id="vision" className="ya-section ya-vision-simple">
        <div>
          <span className="ya-label">OUR VISION</span>
          <h2>GROW TOGETHER.<br /><em>LIVE FOR JESUS.</em></h2>
        </div>

        <div className="ya-vision-content">
          <p>
            The vision of Young Adults Fellowship (YAF) is for young adults to
            deepen their relationship with God with like-minded people, to
            fellowship, make lifelong Christ-centred friendships, and enjoy each
            other's company.
          </p>

          <div className="ya-vision-points">
            <span><Heart size={18} /> Deepen our relationship with God</span>
            <span><Users size={18} /> Fellowship with like-minded people</span>
            <span><Star size={18} /> Build lifelong Christ-centred friendships</span>
            <span><Sparkles size={18} /> Enjoy each other's company</span>
          </div>
        </div>
      </section>

      <section id="event" className="ya-event-simple">
        <div className="ya-section ya-event-card">
          <div className="ya-event-copy">
            <span className="ya-label">NEXT GATHERING</span>
            <h2>SEE YOU<br /><em>THERE.</em></h2>
            <p>
              Come as you are. Bring a friend and make time for God, good
              conversations, and genuine community.
            </p>

            <div className="ya-event-actions">
              <a href={buildCalendarUrl()} target="_blank" rel="noreferrer">
                <CalendarDays size={18} /> ADD TO CALENDAR
              </a>
              <a href={EVENT_MAP_URL} target="_blank" rel="noreferrer">
                <Navigation size={18} /> GET DIRECTIONS
              </a>
              <button type="button" onClick={shareEvent}>
                <MessageCircle size={18} /> SHARE
              </button>
            </div>

            {shareMessage && <span className="ya-share-message">{shareMessage}</span>}
          </div>

          <div className="ya-event-info">
            <div>
              <CalendarDays size={22} />
              <span>
                <b>DATE & TIME</b>
                <strong>October 11, 2026</strong>
                <small>1:00 PM</small>
              </span>
            </div>

            <div>
              <MapPin size={22} />
              <span>
                <b>VENUE</b>
                <strong>Villar Sipag Events Place</strong>
                <small>Las Piñas</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="expect" className="ya-section ya-expect-simple">
        <div className="ya-expect-heading">
          <span className="ya-label">WHAT TO EXPECT</span>
          <h2>FAITH, PEOPLE,<br /><em>REAL LIFE.</em></h2>
          <p>
            Nothing complicated. Just a welcoming space to worship, learn,
            talk, pray, and enjoy being together.
          </p>
        </div>

        <div className="ya-expect-grid">
          {expectations.map(({ icon: Icon, title, text }) => (
            <article key={title} className="ya-expect-item">
              <Icon size={22} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ya-simple-cta">
        <div>
          <span className="ya-label">COME AS YOU ARE</span>
          <h2>BRING A FRIEND.<br /><em>BE PART OF THE COMMUNITY.</em></h2>
        </div>

        <div className="ya-simple-cta-actions">
          <a href="#event">SEE EVENT</a>
          <a
            href={TOPIC_FORM_URL}
            target="_blank"
            rel="noreferrer"
          >
            SUGGEST A TOPIC <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <footer className="ya-footer">
        <span>FIRST LOVE <b>YOUNG ADULTS</b></span>
        <span>FAITH • FRIENDSHIP • PURPOSE</span>
      </footer>
    </main>
  );
}
