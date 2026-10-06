import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Sparkles,
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
      "A young adult fellowship where real people connect, grow in faith, ask honest questions, and live out God's purpose together.";

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
          <a href="#topics" onClick={closeMenu}>Topics</a>
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
          <img src="/festival-assets/08_Youth_Community.png" alt="" />
        </div>
        <div className="ya-hero-overlay" />
        <div className="ya-hero-grain" />

        <div className="ya-hero-content">
          <div className="ya-stamp">COME AS YOU ARE<br /><strong>EST. 2026</strong></div>
          <p className="ya-kicker">Y O U N G &nbsp; A D U L T &nbsp; F E L L O W S H I P</p>

          <h1>
            REAL PEOPLE
            <span>REAL FAITH</span>
            <strong>REAL LIFE</strong>
          </h1>

          <p className="ya-hero-lead">
            A community for young adults to connect, grow, and live out God's purpose together.
          </p>

          <div className="ya-hero-actions">
            <a className="ya-brush-button" href="#event">COME AS YOU ARE!</a>
            <a className="ya-outline-button" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">
              SUGGEST A TOPIC <ArrowRight size={17} />
            </a>
          </div>

          <div className="ya-hero-tags">
            <span>FAITH</span><span>FRIENDSHIP</span><span>PURPOSE</span><span>COMMUNITY</span>
          </div>
        </div>

        <div className="ya-hero-collage" aria-label="Young adult fellowship community">
          <div className="ya-photo-card ya-photo-back">
            <img src="/festival-assets/person_2.png" alt="Young adult fellowship" />
            <span>FRIENDS</span>
          </div>
          <div className="ya-photo-card ya-photo-main">
            <img src="/festival-assets/08_Youth_Community.png" alt="Young adults together" />
            <span>TOGETHER</span>
          </div>
          <div className="ya-photo-card ya-photo-front">
            <img src="/festival-assets/person_1.png" alt="Young adult community" />
            <span>REAL LIFE</span>
          </div>
          <div className="ya-doodle-note ya-note-one">FAITH<br />FRIENDS<br />PURPOSE<br /><b>♡ TOGETHER</b></div>
          <div className="ya-doodle-note ya-note-two">WORSHIP<br />WORD<br />COMMUNITY<br />FUN :)</div>
          <div className="ya-star-doodle">✦</div>
          <div className="ya-arrow-doodle">↘</div>
        </div>

        <div className="ya-hero-bottom-edge">
          <span>DIFFERENT STORIES</span>
          <span className="edge-orange">ONE PURPOSE</span>
          <span className="edge-heart">♡</span>
        </div>
      </section>

      <section id="why" className="ya-benefits-wrap">
        <div className="ya-benefits-intro">
          <span className="ya-mini-label">MORE THAN A MEETING</span>
          <span className="ya-mini-script">This is your people.</span>
        </div>
        <div className="ya-benefits">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <div className="ya-benefit" key={title}>
              <span className={`ya-benefit-icon benefit-${index + 1}`}>
                <Icon size={28} strokeWidth={2.1} />
              </span>
              <span>
                <b>{title}</b>
                <small>{text}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="event" className="ya-event">
        <div className="ya-event-tape tape-a" />
        <div className="ya-event-tape tape-b" />
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
            <span className="ya-photo-tape" />
            <img src="/festival-assets/person_1.png" alt="Young adult fellowship moment" />
            <small>SATURDAY NIGHTS</small>
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
        <div className="ya-topic-scribble">YOUR VOICE<br /><span>MATTERS.</span></div>
        <div className="ya-topic-inner">
          <div className="ya-topic-copy">
            <div className="ya-lightbulb"><Sparkles size={50} /></div>
            <p className="ya-section-kicker">YOU GET A SAY</p>
            <h2>SHARE YOUR <em>TOPICS!</em></h2>
            <p>
              We want to hear from you! Help shape your Young Adult Fellowship by sharing the questions and conversations you actually want to have.
            </p>

            <a className="ya-topic-cta" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">
              <MessageCircle size={25} />
              <span>Suggest a Topic Now</span>
              <ArrowRight size={25} />
            </a>

            <p className="ya-form-hint">↗ Opens Google Form &nbsp; | &nbsp; It only takes a minute!</p>
          </div>

          <div className="ya-topic-paper">
            <span className="ya-paper-pin">✦</span>
            <span className="ya-paper-title">EXAMPLES:</span>
            <ul>
              {topicExamples.map((topic) => (
                <li key={topic}><span><Check size={17} /></span>{topic}</li>
              ))}
            </ul>
            <div className="ya-paper-doodle">★</div>
          </div>
        </div>
      </section>

      <section className="ya-community-band">
        <div className="ya-community-grid" />
        <div className="ya-community-copy">
          <span className="ya-mini-label">REAL QUESTIONS. REAL PEOPLE.</span>
          <h2>BRING YOUR<br /><em>WHOLE SELF.</em></h2>
          <p>Come with your wins, doubts, plans, pressure, stories, and questions. There is room for all of it here.</p>
        </div>
        <div className="ya-community-cards">
          <span>ASK.</span>
          <span>LISTEN.</span>
          <span>GROW.</span>
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
        <span className="ya-footer-note">FAITH • FRIENDSHIP • PURPOSE</span>
        <a href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">Suggest a topic <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}
