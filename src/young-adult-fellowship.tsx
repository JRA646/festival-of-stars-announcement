import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Copy,
  Heart,
  HelpCircle,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Share2,
  Sparkles,
  Star,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import "./young-adult-fellowship.css";

const TOPIC_FORM_URL = "https://forms.gle/kyPkB1fBYm7KFXCo7";
const EVENT_MAP_URL = "https://www.google.com/maps/dir/?api=1&destination=14.47395,120.98124";
const EVENT_DATE_ISO = "2026-10-11T13:00:00+08:00";
const EVENT_LABEL = "October 11, 2026 • 1:00 PM • Villar Sipag Events Place, Las Piñas";

const benefits = [
  { icon: Users, title: "MEET NEW FRIENDS", text: "Build real connections" },
  { icon: BookOpen, title: "GROW TOGETHER", text: "Discover God's Word for real life" },
  { icon: Heart, title: "BE ENCOURAGED", text: "Share struggles and victories" },
  { icon: Star, title: "MAKE A DIFFERENCE", text: "Use your gifts to impact others" },
];

const expectations = [
  { icon: Sparkles, title: "WORSHIP", text: "Lift your eyes, heart, and voice to Jesus." },
  { icon: BookOpen, title: "WORD", text: "Biblical truth for everyday decisions and pressure." },
  { icon: MessageCircle, title: "REAL CONVERSATIONS", text: "Ask honest questions without pretending." },
  { icon: Users, title: "FRIENDSHIP", text: "Meet people who are walking the journey too." },
  { icon: Heart, title: "PRAYER", text: "Make space for God to meet you right where you are." },
  { icon: Star, title: "FUN", text: "Laugh, hang out, and actually enjoy being together." },
];

const topicExamples = [
  "Faith and Daily Life",
  "Relationships",
  "Career and Calling",
  "Mental Health",
  "Real Questions about God",
  "Anything You Want to Learn!",
];

const faqs = [
  ["Do I need to be a church member?", "No. Come as you are, whether you're new to church, already connected, or simply curious."],
  ["Can I bring a friend?", "Absolutely. In fact, bring the friend who has been asking the same questions you have."],
  ["What should I wear?", "Whatever you are comfortable in. There is no dress code for fellowship."],
  ["What happens during fellowship?", "Expect worship, biblical teaching, honest conversations, prayer, friendship, and fun."],
];

function formatUnit(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function buildCalendarUrl() {
  const start = "20261011T130000";
  const end = "20261011T150000";
  const title = encodeURIComponent("First Love Young Adult Fellowship");
  const details = encodeURIComponent("Real People • Real Faith • Real Life");
  const location = encodeURIComponent("Villar Sipag Events Place, Las Piñas, Philippines");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export default function YoungAdultFellowship() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    document.title = "First Love Young Adults | Real Faith, Real Life";
    const description =
      "First Love Young Adults — Real Faith, Real Life. Join a community for young adults to connect, grow, ask honest questions, and live out God's purpose together.";

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
    setMeta("property", "og:image", `${window.location.origin}/festival-assets/08_Youth_Community.png`);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", "First Love Young Adults | Real Faith, Real Life");
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", `${window.location.origin}/festival-assets/08_Youth_Community.png`);

    const canonicalHref = `${window.location.origin}/young-adult-fellowship`;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const eventTime = useMemo(() => new Date(EVENT_DATE_ISO).getTime(), []);
  const remaining = Math.max(0, eventTime - now);
  const eventStarted = now >= eventTime;
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining / 3600000) % 24);
  const minutes = Math.floor((remaining / 60000) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  const closeMenu = () => setMenuOpen(false);

  async function shareEvent() {
    const shareData = {
      title: "First Love Young Adult Fellowship",
      text: `Join us — ${EVENT_LABEL}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Shared!");
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Link copied!");
    } catch {
      setShareMessage("");
    }

    window.setTimeout(() => setShareMessage(""), 2200);
  }

  async function copyInvite() {
    const message = `Hey! You should come with me to First Love Young Adult Fellowship on October 11 at 1:00 PM at Villar Sipag Events Place, Las Piñas. ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(message);
      setShareMessage("Invite copied!");
    } catch {
      setShareMessage("Copy is unavailable in this browser.");
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
          <a className="active" href="#home" onClick={closeMenu}>Home</a>
          <a href="#why" onClick={closeMenu}>About</a>
          <a href="#event" onClick={closeMenu}>Event</a>
          <a href="#expect" onClick={closeMenu}>What to Expect</a>
          <a href="#topics" onClick={closeMenu}>Topics</a>
        </div>

        <div className="ya-nav-actions">
          <button className="ya-share-mini" type="button" onClick={shareEvent} aria-label="Share event">
            <Share2 size={16} />
          </button>
          <a className="ya-nav-cta" href="#event" onClick={closeMenu}>Join Us</a>
        </div>

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
          <div className="ya-stamp">COME AS YOU ARE<br /><strong>YOUNG ADULTS • 18+</strong></div>
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
            <a className="ya-brush-button" href="#event">JOIN THE NEXT GATHERING</a>
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

      <section className="ya-countdown-section" aria-label="Next fellowship countdown">
        <div className="ya-countdown-intro">
          <span className="ya-mini-label">NEXT GATHERING</span>
          <h2>{eventStarted ? "THE CONVERSATION CONTINUES." : "SAVE THE DATE."}</h2>
          <p>{eventStarted ? "Thank you for being part of it. The fellowship continues beyond one day." : "October 11, 2026 • 1:00 PM • Villar Sipag Events Place"}</p>
        </div>

        {!eventStarted && (
          <div className="ya-countdown">
            <div><strong>{formatUnit(days)}</strong><span>DAYS</span></div>
            <div><strong>{formatUnit(hours)}</strong><span>HOURS</span></div>
            <div><strong>{formatUnit(minutes)}</strong><span>MINUTES</span></div>
            <div><strong>{formatUnit(seconds)}</strong><span>SECONDS</span></div>
          </div>
        )}

        <div className="ya-countdown-actions">
          <a href={buildCalendarUrl()} target="_blank" rel="noreferrer"><CalendarDays size={16} /> ADD TO CALENDAR</a>
          <button type="button" onClick={shareEvent}><Share2 size={16} /> SHARE EVENT</button>
          {shareMessage && <span className="ya-share-toast">{shareMessage}</span>}
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
              <span className={`ya-benefit-icon benefit-${index + 1}`}><Icon size={28} strokeWidth={2.1} /></span>
              <span><b>{title}</b><small>{text}</small></span>
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
                <strong>October 11, 2026</strong>
                <small>1:00 PM • Young Adult Fellowship</small>
              </span>
            </div>
            <div className="ya-detail-divider" />
            <div className="ya-detail">
              <span className="ya-detail-icon"><MapPin size={24} /></span>
              <span>
                <b>WHERE</b>
                <strong>Villar Sipag Events Place</strong>
                <small>Las Piñas</small>
                <a className="ya-directions" href={EVENT_MAP_URL} target="_blank" rel="noreferrer">
                  <Navigation size={13} /> GET DIRECTIONS
                </a>
              </span>
            </div>
          </div>

          <div className="ya-event-photo">
            <span className="ya-photo-tape" />
            <img src="/festival-assets/person_1.png" alt="Young adult fellowship moment" />
            <small>OCTOBER 11 • 1 PM</small>
          </div>

          <div className="ya-event-note">
            <span>WORSHIP</span><span>WORD</span><span>COMMUNITY</span><span>FUN :)</span>
          </div>
        </div>
      </section>

      <section id="expect" className="ya-expect">
        <div className="ya-expect-head">
          <span className="ya-mini-label">WHAT TO EXPECT</span>
          <h2>COME FOR THE <em>FAITH.</em><br />STAY FOR THE PEOPLE.</h2>
          <p>It is not a performance. It is a room for worship, truth, friendship, prayer, and real life.</p>
        </div>

        <div className="ya-expect-grid">
          {expectations.map(({ icon: Icon, title, text }, index) => (
            <article className={`ya-expect-card expect-${index + 1}`} key={title}>
              <span className="ya-expect-number">0{index + 1}</span>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ya-for-you">
        <div className="ya-for-you-paper">
          <span className="ya-paper-sticker">IS THIS FOR ME?</span>
          <h2>COME AS<br /><em>YOU ARE.</em></h2>
          <p>Single or in a relationship. Studying or working. New to church or already part of the family.</p>
          <p>Bring your wins, doubts, plans, pressure, stories, and questions. There is room for all of it here.</p>
          <div className="ya-for-you-badge"><UserPlus size={18} /> YOUNG ADULTS • 18+</div>
        </div>
        <div className="ya-invite-card">
          <span className="ya-mini-label">KNOW SOMEONE WHO SHOULD BE HERE?</span>
          <h3>BRING<br /><em>A FRIEND.</em></h3>
          <p>The best invitation is a simple one: “Come with me.”</p>
          <div className="ya-invite-actions">
            <button type="button" onClick={copyInvite}><Copy size={17} /> COPY INVITE</button>
            <a href="#event"><CalendarDays size={17} /> SEE EVENT</a>
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
            <p>Help shape your Young Adult Fellowship by sharing the questions and conversations you actually want to have.</p>
            <a className="ya-topic-cta" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">
              <MessageCircle size={25} /><span>Suggest a Topic Now</span><ArrowRight size={25} />
            </a>
            <p className="ya-form-hint">↗ Opens Google Form &nbsp; | &nbsp; It only takes a minute!</p>
          </div>

          <div className="ya-topic-paper">
            <span className="ya-paper-pin">✦</span>
            <span className="ya-paper-title">TOPIC WALL:</span>
            <ul>
              {topicExamples.map((topic) => (
                <li key={topic}><span><Check size={17} /></span>{topic}</li>
              ))}
            </ul>
            <div className="ya-topic-chips">
              <button type="button" onClick={() => window.open(TOPIC_FORM_URL, "_blank")}>FAITH</button>
              <button type="button" onClick={() => window.open(TOPIC_FORM_URL, "_blank")}>DATING</button>
              <button type="button" onClick={() => window.open(TOPIC_FORM_URL, "_blank")}>PURPOSE</button>
              <button type="button" onClick={() => window.open(TOPIC_FORM_URL, "_blank")}>CAREER</button>
              <button type="button" onClick={() => window.open(TOPIC_FORM_URL, "_blank")}>PRAYER</button>
            </div>
            <div className="ya-paper-doodle">★</div>
          </div>
        </div>
      </section>

      <section className="ya-community-band">
        <div className="ya-community-grid" />
        <div className="ya-community-copy">
          <span className="ya-mini-label">REAL QUESTIONS. REAL PEOPLE.</span>
          <h2>BRING YOUR<br /><em>WHOLE SELF.</em></h2>
          <p>Ask. Listen. Grow. We want a culture where you can take faith seriously without taking yourself too seriously.</p>
        </div>
        <div className="ya-community-cards">
          <span>ASK.</span><span>LISTEN.</span><span>GROW.</span>
        </div>
      </section>

      <section className="ya-faq">
        <div className="ya-faq-head">
          <span className="ya-mini-label">GOOD QUESTIONS</span>
          <h2>BEFORE YOU<br /><em>COME.</em></h2>
        </div>
        <div className="ya-faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary><HelpCircle size={20} /> <span>{question}</span><ArrowRight size={17} /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ya-share-band">
        <div>
          <span className="ya-mini-label">DON'T KEEP THIS TO YOURSELF</span>
          <h2>SHARE THE<br /><em>INVITATION.</em></h2>
        </div>
        <div className="ya-share-band-actions">
          <button type="button" onClick={shareEvent}><Share2 size={18} /> SHARE EVENT</button>
          <button type="button" onClick={copyInvite}><Copy size={18} /> COPY FRIEND INVITE</button>
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
          <a className="ya-see-you" href="#event">SEE YOU<br />THERE!</a>
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
