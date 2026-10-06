import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import "./festivalofstars-announcement.css";

const EVENT_DATE = "October 18, 2026";
const EVENT_TIME = "3:00 PM";
const EVENT_VENUE = "Villar Sipag";
const REGISTER_URL = "/festivalofstars/announcement/register";
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Villar%20Sipag%2C%20Las%20Pi%C3%B1as";
const EVENT_TIME_ISO = "2026-10-18T15:00:00+08:00";

const faqItems = [
  {
    question: "What is the purpose of Festival of Stars?",
    answer:
      "Festival of Stars is a celebration of the talent, creativity, fellowship, and unity of the First Love Experience community.",
  },
  {
    question: "Who can attend?",
    answer:
      "Festival of Stars is designed for the First Love Experience community, bringing youth and young adults together for one shared celebration.",
  },
  {
    question: "Can I bring a friend?",
    answer:
      "Yes. Invite your friends, classmates, teammates, and family members to celebrate with the First Love Experience community.",
  },
  {
    question: "Who will be performing?",
    answer:
      "The performances are presented by approved First Love Church performers as part of the celebration program.",
  },
];

export default function FestivalOfStarsAnnouncement() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [openFaq, setOpenFaq] = useState(0);
  const [selectedMore, setSelectedMore] = useState(0);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        new Date(EVENT_TIME_ISO).getTime() - Date.now(),
      );

      setTimeLeft({
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining / 3600000) % 24),
        minutes: Math.floor((remaining / 60000) % 60),
        seconds: Math.floor((remaining / 1000) % 60),
      });
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdownDone =
    timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds === 0;


  const shareEvent = async () => {
    const shareData = {
      title: "Festival of Stars",
      text: "Festival of Stars • October 18, 2026 • 3 PM • Villar Sipag",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("SHARED!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("LINK COPIED!");
      }
    } catch {
      setShareStatus("");
    }

    window.setTimeout(() => setShareStatus(""), 2200);
  };


  return (
    <main className="foa-page">
      <header className="foa-nav">
        <a className="foa-brand" href="#home" aria-label="Festival of Stars home">
          <span className="foa-brand-logo">
            <img src="/images/app_logo.png" alt="" />
          </span>
          <span>
            First Love Church
            <small>PHILIPPINES</small>
          </span>
        </a>

        <div className="foa-nav-actions">
          <a className="foa-nav-link" href="#details">
            EVENT DETAILS <ArrowRight size={16} />
          </a>
          <button className="foa-share-button" type="button" onClick={shareEvent}>
            <MessageCircle size={16} /> SHARE
          </button>
        </div>
      </header>

      <section className="foa-hero">
        <div className="foa-blue-noise" aria-hidden="true" />
        <div className="foa-lightning lightning-one" aria-hidden="true" />
        <div className="foa-lightning lightning-two" aria-hidden="true" />
        <div className="foa-burst burst-one" aria-hidden="true">✦</div>
        <div className="foa-burst burst-two" aria-hidden="true">★</div>

        <div className="foa-hero-copy">
          <p className="foa-eyebrow">ONE CHURCH · MANY STORIES · ONE BIG CELEBRATION</p>
          <div className="foa-kicker">FIRST LOVE CHURCH PRESENTS</div>

          <h1>
            <span>FESTIVAL</span>
            <strong>OF STARS</strong>
          </h1>

          <div className="foa-date-sticker">
            <CalendarDays size={18} />
            <span>{EVENT_DATE}</span>
          </div>

          <p className="foa-hero-message">
            A celebration of the <b>talent, creativity, fellowship, and unity</b>{" "}
            of the First Love Experience community.
          </p>

          <div className="foa-actions">
            <a className="foa-primary" href={REGISTER_URL}>
              REGISTER NOW <ArrowRight size={20} />
            </a>
            <a className="foa-secondary" href="#details">
              EXPLORE THE EVENT
            </a>
            <button className="foa-hero-share" type="button" onClick={shareEvent}>
              <MessageCircle size={18} /> SHARE INVITE
            </button>
          </div>
          {shareStatus && <span className="foa-share-status">{shareStatus}</span>}
        </div>

        <div className="foa-hero-poster" aria-label="Festival of Stars themed poster">
          <div className="foa-poster-topline">FIRST LOVE CHURCH PHILIPPINES</div>
          <div className="foa-poster-title">
            <span>FESTIVAL</span>
            <em>OF</em>
            <strong>STARS</strong>
          </div>
          <div className="foa-poster-time">3 PM</div>
          <div className="foa-poster-meta">
            <span>OCTOBER 18</span>
            <span>VILLAR SIPAG</span>
          </div>
        </div>
      </section>



      <section className="foa-countdown">
        <div className="foa-countdown-copy">
          <span>THE STAR COUNTDOWN</span>
          <h2>{countdownDone ? "THE NIGHT IS HERE." : "COUNTING DOWN."}</h2>
          <p>
            {countdownDone
              ? "Festival of Stars is happening now. Come celebrate with the First Love Experience community."
              : "Get ready for October 18. Save the date, invite your people, and come celebrate together."}
          </p>
        </div>

        <div className="foa-countdown-grid" aria-label="Countdown to Festival of Stars">
          {[
            ["DAYS", timeLeft.days],
            ["HOURS", timeLeft.hours],
            ["MIN", timeLeft.minutes],
            ["SEC", timeLeft.seconds],
          ].map(([label, value]) => (
            <div className="foa-count-box" key={label}>
              <strong>{String(value).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="foa-countdown-actions">
          <a
            className="foa-primary foa-small-button"
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Festival%20of%20Stars&dates=20261018T150000/20261018T180000&details=Festival%20of%20Stars%20%7C%20First%20Love%20Experience&location=Villar%20Sipag%2C%20Las%20Pi%C3%B1as"
            target="_blank"
            rel="noreferrer"
          >
            <CalendarDays size={17} /> SAVE THE DATE
          </a>
          <a className="foa-secondary foa-small-button" href={MAP_URL} target="_blank" rel="noreferrer">
            <MapPin size={17} /> GET DIRECTIONS
          </a>
        </div>
      </section>

      <section className="foa-more-event" id="more-event">
        <div className="foa-more-event-head">
          <span>MORE THAN AN EVENT</span>
          <h2>MORE THAN<br /><em>A SHOW.</em></h2>
          <p>
            Festival of Stars is a space where the First Love Experience community
            can celebrate what God is doing among us — through talent, creativity,
            fellowship, and unity.
          </p>
        </div>

        <div className="foa-more-grid">
          {[
            ["CELEBRATE TALENT", "Recognize the gifts and abilities God has placed in our First Love community.", "GIFTED TO SHINE ✦", Star, "more-red"],
            ["EXPRESS CREATIVITY", "Celebrate music, movement, storytelling, and creative expression as part of the program.", "CREATE WITH PURPOSE ✦", Sparkles, "more-yellow"],
            ["BUILD FELLOWSHIP", "Bring people together, strengthen friendships, and create memories as one church family.", "PEOPLE OVER PERFECTION ✦", Users, "more-blue"],
            ["LIVE IN UNITY", "Celebrate different stories, different gifts, and one shared identity in Christ.", "ONE COMMUNITY. ONE PURPOSE. ✦", Heart, "more-white"],
          ].map(([title, text, footer, Icon, theme], index) => {
            const active = selectedMore === index;
            const MoreIcon = Icon as typeof Star;
            return (
              <button
                key={String(title)}
                type="button"
                className={`foa-more-card ${String(theme)} ${active ? "selected" : ""}`}
                aria-pressed={active}
                onClick={() => setSelectedMore(index)}
              >
                <span className="foa-more-number">0{index + 1}</span>
                <span className="foa-more-icon"><MoreIcon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <b>{footer}</b>
              </button>
            );
          })}
        </div>

        <div className="foa-more-selected" aria-live="polite">
          <span>YOU SELECTED</span>
          <strong>
            {["TALENT", "CREATIVITY", "FELLOWSHIP", "UNITY"][selectedMore]}
          </strong>
          <p>
            {[
              "Your gifts are part of what makes the First Love Experience community special.",
              "Your creativity gives the celebration its color, energy, and expression.",
              "Fellowship turns a gathering into a community where people belong.",
              "Unity brings different stories and gifts together around one shared celebration.",
            ][selectedMore]}
          </p>
        </div>

        <div className="foa-more-note">
          <Zap size={18} />
          <span>THE HEART OF THE NIGHT</span>
          <strong>NOT JUST A PERFORMANCE — A CELEBRATION OF WHO WE ARE TOGETHER.</strong>
        </div>
      </section>

      <section className="foa-faq" id="faq">
        <div className="foa-faq-heading">
          <span>GOOD QUESTIONS</span>
          <h2>BEFORE YOU<br /><em>COME.</em></h2>
          <p>Everything you need to know before Festival of Stars.</p>
        </div>

        <div className="foa-faq-list">
          {faqItems.map((item, index) => {
            const open = openFaq === index;
            return (
              <article className={`foa-faq-item ${open ? "open" : ""}`} key={item.question}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? -1 : index)}
                >
                  <span className="foa-faq-number">0{index + 1}</span>
                  <strong>{item.question}</strong>
                  <ChevronDown size={20} />
                </button>
                {open && <p>{item.answer}</p>}
              </article>
            );
          })}
        </div>
      </section>

      <section id="details" className="foa-details">
        <div className="foa-section-heading">
          <span>THE NIGHT</span>
          <h2>COME READY<br /><em>TO SHINE.</em></h2>
          <p>
            Festival of Stars brings the First Love Experience community together
            for worship, connection, creativity, and a joyful celebration of the
            gifts God has given us.
          </p>
        </div>

        <div className="foa-detail-grid">
          <article className="foa-card">
            <span className="foa-card-icon"><CalendarDays /></span>
            <div>
              <small>DATE & TIME</small>
              <h3>{EVENT_DATE}</h3>
              <p>{EVENT_TIME}</p>
            </div>
          </article>

          <article className="foa-card">
            <span className="foa-card-icon"><MapPin /></span>
            <div>
              <small>VENUE</small>
              <h3>{EVENT_VENUE}</h3>
              <p>Las Piñas</p>
            </div>
          </article>

          <article className="foa-card">
            <span className="foa-card-icon"><Users /></span>
            <div>
              <small>TOGETHER</small>
              <h3>FIRST LOVE EXPERIENCE</h3>
              <p>One community. One celebration.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="foa-highlight">
        <div className="foa-highlight-burst">★</div>
        <div>
          <span>WHAT FESTIVAL OF STARS IS ABOUT</span>
          <h2>Talent.<br />Creativity.<br /><em>Unity.</em></h2>
        </div>
        <div className="foa-highlight-copy">
          <p>
            Festival of Stars is a celebration of what makes the First Love
            Experience community special — the gifts we carry, the friendships
            we build, and the joy of coming together.
          </p>
          <p className="foa-performer-note">
            <Sparkles size={17} />
            Performances are presented by approved First Love Church performers.
          </p>
        </div>
      </section>

      <section className="foa-final">
        <div className="foa-final-glow" aria-hidden="true" />
        <span className="foa-final-label">OCTOBER 18 · 3 PM</span>
        <h2>SEE YOU<br /><em>AT THE STARS.</em></h2>
        <p>Bring your people. Bring your energy. Come celebrate with the First Love Experience family.</p>
        <a className="foa-primary" href={REGISTER_URL}>
          REGISTER NOW <ArrowRight size={20} />
        </a>
        <div className="foa-final-doodle" aria-hidden="true">
          <Star />
          <Star />
          <Star />
        </div>
      </section>

      <footer className="foa-footer">
        <span>FIRST LOVE CHURCH PHILIPPINES</span>
        <a href="#home">Back to top <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}
