import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Heart, MessageCircle, Sparkles, Users } from "lucide-react";
import "./young-adult-fellowship.css";

const TOPIC_FORM_URL = "https://forms.gle/kyPkB1fBYm7KFXCo7";

const topics = [
  ["Faith in real life", "How do we follow Jesus when life, work, relationships, and pressure get loud?", Heart],
  ["Purpose & career", "Finding direction without comparing your journey to everyone else's.", Sparkles],
  ["Relationships", "Healthy, Christ-centered friendships, dating, boundaries, and communication.", Users],
  ["Mental & emotional growth", "Building resilient faith while handling stress, disappointment, and change.", MessageCircle],
];

export default function YoungAdultFellowship() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Young Adult Fellowship | First Love Church";
    const description = "A young adult fellowship built for honest conversations, real community, practical faith, and growing together.";
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
    setMeta("property", "og:title", "Young Adult Fellowship | First Love Church");
    setMeta("property", "og:description", description);
  }, []);

  return (
    <main className="ya-site">
      <div className="ya-topbar"><span>FIRST LOVE CHURCH</span><span>YOUNG ADULT FELLOWSHIP</span></div>

      <nav className="ya-nav">
        <a className="ya-brand" href="#home" onClick={() => setMenuOpen(false)}>
          <span className="ya-logo"><img src="/images/app_logo.png" alt="" /></span>
          <span>First Love<small>CHURCH PHILIPPINES</small></span>
        </a>
        <div className={`ya-links ${menuOpen ? "open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#why" onClick={() => setMenuOpen(false)}>Why Join</a>
          <a href="#topics" onClick={() => setMenuOpen(false)}>Topics</a>
          <a href="#next" onClick={() => setMenuOpen(false)}>Next Step</a>
        </div>
        <a className="ya-nav-cta" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">Suggest a Topic <ArrowRight size={16} /></a>
        <button className="ya-menu" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen(v => !v)}>☰</button>
      </nav>

      <section id="home" className="ya-hero">
        <div className="ya-grid" />
        <div className="ya-sticker sticker-one">REAL<br />TALK.</div>
        <div className="ya-sticker sticker-two">NO<br />FILTER.</div>
        <div className="ya-hero-copy">
          <p className="ya-kicker">FOR YOUNG ADULTS WHO WANT MORE THAN SMALL TALK</p>
          <h1>LET'S TALK<br /><em>ABOUT LIFE.</em></h1>
          <p className="ya-lead">A space to ask honest questions, open the Bible, build friendships, and grow in faith together.</p>
          <div className="ya-actions">
            <a className="ya-primary" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">TELL US WHAT MATTERS <ArrowRight size={19} /></a>
            <a className="ya-ghost" href="#topics">See the conversation topics</a>
          </div>
          <div className="ya-pills"><span>✦ HONEST</span><span>✦ BIBLICAL</span><span>✦ PRACTICAL</span><span>✦ COMMUNITY</span></div>
        </div>

        <div className="ya-art" aria-label="Young adult community">
          <div className="ya-photo ya-photo-main"><img src="/festival-assets/05_Worship_Crowd.png" alt="Young adults gathered together" /></div>
          <div className="ya-photo ya-photo-small"><img src="/festival-assets/person_1.png" alt="Young adult worship moment" /></div>
          <div className="ya-note">BRING YOUR<br /><strong>QUESTIONS.</strong></div>
          <div className="ya-scribble">✦</div>
        </div>

        <div className="ya-hero-bottom">
          <div><CalendarDays /><span><b>YOUNG ADULT FELLOWSHIP</b><small>Watch this space for the next gathering.</small></span></div>
          <div><Users /><span><b>COME AS YOU ARE</b><small>Invite a friend. Everyone starts somewhere.</small></span></div>
          <a href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">SUBMIT YOUR TOPIC <ArrowRight size={17} /></a>
        </div>
      </section>

      <section id="why" className="ya-section ya-why">
        <div>
          <p className="ya-eyebrow">NOT JUST ANOTHER MEETING</p>
          <h2>WE MAKE<br /><em>ROOM FOR REAL LIFE.</em></h2>
        </div>
        <div className="ya-copy">
          <p>Young adulthood comes with big questions: career, purpose, relationships, faith, money, identity, pressure, and everything in between.</p>
          <p>We want the fellowship to be a place where those questions can be discussed with wisdom, Scripture, honesty, and people who actually walk with you.</p>
          <div className="ya-manifesto"><span>ASK.</span><span>LISTEN.</span><span>GROW.</span></div>
        </div>
      </section>

      <section id="topics" className="ya-topics">
        <div className="ya-topic-heading">
          <p className="ya-eyebrow">YOU GET A SAY</p>
          <h2>WHAT SHOULD<br /><em>WE TALK ABOUT?</em></h2>
          <p>The strongest fellowship conversations start with the questions young adults are already carrying. Tell us yours through the form.</p>
        </div>
        <div className="ya-topic-grid">
          {topics.map(([title, copy, Icon], index) => {
            const TopicIcon = Icon as typeof Heart;
            return <article className={`ya-topic-card card-${index + 1}`} key={String(title)}>
              <span className="ya-topic-number">0{index + 1}</span>
              <TopicIcon />
              <h3>{String(title)}</h3>
              <p>{String(copy)}</p>
            </article>;
          })}
        </div>
      </section>

      <section className="ya-quote">
        <span className="ya-quote-mark">“</span>
        <p>Come with a question.<br /><em>Leave with a community.</em></p>
        <small>— YOUNG ADULT FELLOWSHIP</small>
      </section>

      <section id="next" className="ya-next">
        <div className="ya-next-copy">
          <p className="ya-eyebrow">YOUR VOICE HELPS SHAPE THE ROOM</p>
          <h2>DON'T JUST<br /><em>SHOW UP.</em><br />SPEAK UP.</h2>
          <p>We are collecting the topics you genuinely want to discuss so future sessions can be relevant, practical, and worth showing up for.</p>
          <a className="ya-primary" href={TOPIC_FORM_URL} target="_blank" rel="noreferrer"><CheckCircle2 size={18} /> SUBMIT THE FORM <ArrowRight size={18} /></a>
        </div>
        <div className="ya-form-card">
          <div className="ya-form-icon"><BookOpen /></div>
          <span>1 MINUTE</span>
          <h3>Tell us what you want to talk about.</h3>
          <p>Name + topic + what you want to unpack. That's it.</p>
          <a href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">OPEN GOOGLE FORM <ArrowRight size={17} /></a>
        </div>
      </section>

      <footer className="ya-footer">
        <div><strong>FIRST LOVE CHURCH</strong><small>Young Adult Fellowship · Faith. Community. Real conversations.</small></div>
        <a href={TOPIC_FORM_URL} target="_blank" rel="noreferrer">Suggest a topic <ArrowRight size={16} /></a>
      </footer>
    </main>
  );
}
