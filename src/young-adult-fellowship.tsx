import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Star,
  Users,
  X,
} from "lucide-react";
import "./young-adult-fellowship.css";

const TOPIC_FORM_URL = "https://forms.gle/kyPkB1fBYm7KFXCo7";

const benefits = [
  { icon: Users, title: "MEET NEW FRIENDS", text: "Build real connections" },
  { icon: BookOpen, title: "GROW TOGETHER", text: "Discover God's Word for real life" },
  { icon: Heart, title: "BE ENCOURAGED", text: "Share struggles and victories" },
  { icon: Star, title: "MAKE A DIFFERENCE", text: "Use your gifts to impact others" },
];

const topicExamples = [
  "Faith and Daily Life",
  "Relationships",
  "Career and Calling",
  "Mental Health",
  "Real Questions about God",
  "Anything You Want to Learn!",
];

export default function YoungAdultFellowship() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "First Love Young Adults | Real Faith, Real Life";
    const description =
      "A young adult fellowship where real people can connect, grow in faith, ask honest questions, and live out God's purpose together.";

    const setMeta = (attr: string, key: string, value: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
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
  }, []);

  const closeMenu = () => setMenuOpen(false);

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
          <a className="active" href="#home" onClick={closeMenu}>Home</a>
          <a href="#why" onClick={closeMenu}>About</a>
          <a href="#event" onClick={closeMenu}>Event</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </div>

        <a className="ya-nav-cta" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">
          Join Us
        </a>

        <button className="ya-menu" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      <section id="home" className="ya-hero">
        <div className="ya-hero-image" aria-hidden="true">
          <img src="/festival-assets/person_1.png" alt="" />
        </div>
        <div className="ya-hero-overlay" />

        <div className="ya-hero-content">
          <p className="ya-kicker">YOUNG ADULT FELLOWSHIP</p>
          <h1>
            REAL PEOPLE
            <span>REAL FAITH</span>
            <strong>REAL LIFE</strong>
          </h1>
          <p className="ya-hero-lead">
            A community for young adults to connect, grow, and live out God's purpose together.
          </p>
          <a className="ya-brush-button" href="#event">
            COME AS YOU ARE
          </a>
        </div>

        <div className="ya-hero-doodle ya-doodle-top">FAITH<br />FRIENDS<br />PURPOSE<br /><b>TOGETHER ♡</b></div>
        <div className="ya-crown">♕</div>
        <div className="ya-brush ya-brush-left" />
        <div className="ya-brush ya-brush-right" />
      </section>

      <section id="why" className="ya-benefits">
        {benefits.map(({ icon: Icon, title, text }, index) => (
          <div className="ya-benefit" key={title}>
            <span className={`ya-benefit-icon benefit-${index + 1}`}><Icon size={28} strokeWidth={2} /></span>
            <span>
              <b>{title}</b>
              <small>{text}</small>
            </span>
          </div>
        ))}
      </section>

      <section id="event" className="ya-event">
        <div className="ya-event-inner">
          <div className="ya-event-details">
            <div className="ya-detail">
              <span className="ya-detail-icon"><CalendarDays size={24} /></span>
              <span>
                <b>WHEN</b>
                <strong>Every Saturday</strong>
                <small>4:00 PM – 6:00 PM</small>
              </span>
            </div>
            <div className="ya-detail-divider" />
            <div className="ya-detail">
              <span className="ya-detail-icon"><MapPin size={24} /></span>
              <span>
                <b>WHERE</b>
                <strong>First Love Church</strong>
                <small>Youth Hall</small>
              </span>
            </div>
          </div>

          <div className="ya-event-photo">
            <img src="/festival-assets/person_1.png" alt="Young adult worship moment" />
          </div>

          <div className="ya-event-note">
            <span>WORSHIP</span>
            <span>WORD</span>
            <span>COMMUNITY</span>
            <span>FUN :)</span>
          </div>
        </div>
      </section>

      <section id="topics" className="ya-topics">
        <div className="ya-topic-inner">
          <div className="ya-topic-copy">
            <div className="ya-lightbulb">☼</div>
            <p className="ya-section-kicker">YOUR VOICE MATTERS</p>
            <h2>SHARE YOUR <em>TOPICS!</em></h2>
            <p>
              We want to hear from you! Help us make your Young Adult Fellowship more meaningful by sharing the topics you want to discuss.
            </p>

            <a className="ya-topic-cta" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">
              <MessageCircle size={25} />
              <span>Suggest a Topic Now</span>
              <ArrowRight size={25} />
            </a>

            <p className="ya-form-hint">↗ Opens Google Form &nbsp; | &nbsp; It only takes a minute!</p>
          </div>

          <div className="ya-topic-paper">
            <span className="ya-paper-title">EXAMPLES:</span>
            <ul>
              {topicExamples.map((topic) => (
                <li key={topic}><span>✓</span>{topic}</li>
              ))}
            </ul>
            <div className="ya-paper-doodle">✦</div>
          </div>
        </div>
      </section>

      <section id="contact" className="ya-final">
        <div className="ya-final-image" aria-hidden="true">
          <img src="/festival-assets/05_Worship_Crowd.png" alt="" />
        </div>
        <div className="ya-final-overlay" />

        <div className="ya-final-copy">
          <p className="ya-final-script">DIFFERENT<br />STORIES<br /><span>ONE PURPOSE</span> ♡</p>
          <div className="ya-final-message">
            <p>Let's grow in faith, build genuine friendships,<br className="desktop-only" /> and make a lasting impact — together.</p>
            <small>1 TIMOTHY 4:12</small>
          </div>
          <a className="ya-see-you" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">
            SEE YOU<br />THERE!
          </a>
        </div>
      </section>

      <footer className="ya-footer">
        <span>FIRST LOVE <b>YOUNG ADULTS</b></span>
        <a href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">Suggest a topic <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}
