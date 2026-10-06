import { ArrowRight, CalendarDays, MapPin, Sparkles, Star, Users } from "lucide-react";
import "./festivalofstars-announcement.css";

const EVENT_DATE = "October 18, 2026";
const EVENT_TIME = "3:00 PM";
const EVENT_VENUE = "Villar Sipag";
const REGISTER_URL = "/festivalofstars/register";

export default function FestivalOfStarsAnnouncement() {
  return (
    <main className="foa-page">
      <header className="foa-nav">
        <a className="foa-brand" href="/festivalofstars" aria-label="Back to Festival of Stars">
          <span className="foa-brand-logo">
            <img src="/images/app_logo.png" alt="" />
          </span>
          <span>
            First Love Church
            <small>PHILIPPINES</small>
          </span>
        </a>

        <a className="foa-nav-link" href="/festivalofstars">
          Festival of Stars <ArrowRight size={16} />
        </a>
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
          </div>
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
        <a href="/festivalofstars">Back to Festival of Stars <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}
