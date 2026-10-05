import {useEffect,useMemo,useState} from "react";
import {ArrowDown,ArrowRight,CalendarDays,ChevronDown,Clock3,MapPin,Share2,Star,Users,Volume2,BookOpen,Music2,Gamepad2} from "lucide-react";
import {supabase} from "./lib/supabase";
import "./festivalofstars.css";

type EventData={id:string;name:string;description:string|null;start_at:string;end_at:string|null;location:string|null};
type TimeLeft={days:number;hours:number;minutes:number;seconds:number};

const EVENT_SLUG="festival-of-stars";

function getTimeLeft(target:string):TimeLeft{
  const diff=Math.max(0,new Date(target).getTime()-Date.now());
  return {days:Math.floor(diff/86400000),hours:Math.floor(diff/3600000)%24,minutes:Math.floor(diff/60000)%60,seconds:Math.floor(diff/1000)%60};
}

export default function FestivalOfStars(){
  const[event,setEvent]=useState<EventData|null>(null);
  const[timeLeft,setTimeLeft]=useState<TimeLeft>({days:0,hours:0,minutes:0,seconds:0});

  useEffect(()=>{supabase.rpc("get_public_event_announcement",{p_slug:EVENT_SLUG}).then(({data})=>{const row=Array.isArray(data)?data[0]:data;if(row)setEvent(row as EventData);});},[]);
  useEffect(()=>{if(!event)return;setTimeLeft(getTimeLeft(event.start_at));const id=window.setInterval(()=>setTimeLeft(getTimeLeft(event.start_at)),1000);return()=>window.clearInterval(id);},[event]);

  const start=event?new Date(event.start_at):null;
  const dateLabel=useMemo(()=>start?.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase()??"DEC 12, 2026"),[start]);
  const weekdayLabel=useMemo(()=>start?.toLocaleDateString("en-US",{weekday:"long"}).toUpperCase()??"SATURDAY"),[start]);
  const timeLabel=useMemo(()=>start?.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toUpperCase()??"4:00 PM"),[start]);
  const maps=event?.location?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(event.location):"#";
  const share=()=>navigator.share?navigator.share({title:"Festival of Stars",text:"Join Festival of Stars — First Love Church Philippines.",url:location.href}):navigator.clipboard?.writeText(location.href);

  return <main className="fos">
    <nav className="fos-nav">
      <a className="fos-logo" href="/festivalofstars"><span className="logo-mark">♥</span><span>First Love<small>CHURCH</small></span></a>
      <div className="fos-links"><a className="active" href="#home">Home</a><a href="#about">About</a><a href="#details">Details</a><a href="#contact">Contact</a></div>
      <div className="nav-actions"><button onClick={share} className="icon-btn" aria-label="Share"><Share2 size={18}/></button><a className="register-pill" href="#register">Register Now <ArrowRight size={16}/></a></div>
    </nav>

    <section className="fos-hero" id="home">
      <div className="paint paint-yellow"/><div className="paint paint-cyan"/><div className="paint paint-coral"/>
      <div className="scribble scribble-star">✦</div><div className="scribble scribble-crown">♛</div><div className="scribble scribble-plus">＋</div>
      <div className="hero-copy">
        <p className="hero-kicker">ONE CHURCH · MANY STORIES · ONE BIG CELEBRATION</p>
        <h1>FESTIVAL<br/><span>OF STARS</span></h1>
        <p className="hero-tag">SHINE · BELONG · MAKE A DIFFERENCE</p>
        <p className="hero-description">{event?.description||"A bold celebration of faith, creativity, purpose, and community for youth and young adults."}</p>
      </div>
      <div className="hero-side hero-side-left"><b>WORSHIP<br/>TOGETHER</b><Star size={28}/></div>
      <div className="hero-side hero-side-right"><b>DISCOVER<br/>YOUR PURPOSE</b><span>✦</span></div>
      <div className="info-strip">
        <div><CalendarDays/><b>{dateLabel}</b><small>{weekdayLabel} · {timeLabel}</small></div><i/>
        <div><MapPin/><b>{event?.location||"FIRST LOVE CHURCH"}</b><small>LAS PIÑAS CITY</small></div><i/>
        <div><Users/><b>FOR YOUTH &amp; YOUNG ADULTS</b><small>AGES 13 AND UP</small></div>
      </div>
      <div className="countdown">{[["days",timeLeft.days,"DAYS"],["hours",timeLeft.hours,"HOURS"],["minutes",timeLeft.minutes,"MINUTES"],["seconds",timeLeft.seconds,"SECONDS"]].map(([key,value,label],i)=><div className={`count count-${i+1}`} key={key}><strong>{String(value).padStart(2,"0")}</strong><span>{label}</span></div>)}</div>
      <a className="hero-register" href="#register">REGISTER NOW <ArrowRight size={18}/></a>
      <p className="hero-bottom">Be part of something bigger!</p>
      <a className="scroll-cue" href="#about" aria-label="Scroll to about"><ArrowDown size={18}/></a>
    </section>

    <section className="color-band"><h2>Every star has a story.</h2><b>Thank you for showing up.</b></section>

    <section className="fos-section light" id="about">
      <p className="section-kicker">A NIGHT TO REMEMBER</p><h2>Why Festival of Stars?</h2>
      <div className="about-grid">
        <div className="poster-note"><Star size={36}/><strong>YOU<br/>ARE A<br/><em>STAR</em></strong><span>Shine where God placed you.</span></div>
        <div><p className="big-copy">Festival of Stars is a special gathering for youth and young adults — a celebration of faith, creativity, friendship, and purpose.</p><p className="body-copy">Come exactly as you are. Meet new people, worship together, discover your gifts, hear life-giving messages, and make memories with a church family that believes your story matters.</p></div>
      </div>
    </section>

    <section className="fos-section dark" id="details">
      <div className="section-kicker">WHAT YOU'LL EXPERIENCE</div><h2>Come. Connect. Shine.</h2>
      <div className="feature-grid">
        <article><Music2/><h3>Powerful worship</h3><p>Experience God’s presence through music, worship, and creative arts.</p></article>
        <article><Users/><h3>Real community</h3><p>Meet new friends and belong to a family that cares.</p></article>
        <article><BookOpen/><h3>Life-changing messages</h3><p>Be inspired and discover God-given purpose.</p></article>
        <article><Gamepad2/><h3>Fun &amp; creative activities</h3><p>Games, booths, and surprises make faith exciting.</p></article>
      </div>
    </section>

    <section className="fos-section schedule">
      <div className="section-kicker">THE GATHERING</div><h2>One event. Big energy.</h2>
      <div className="schedule-card"><div className="schedule-time">{timeLabel}</div><div><h3>Festival of Stars</h3><p>{weekdayLabel} · {dateLabel}</p><p>{event?.location||"First Love Church, Las Piñas City"}</p></div><a href={maps} target="_blank" rel="noreferrer"><MapPin size={17}/> Directions</a></div>
    </section>

    <section className="fos-section dark visit">
      <div className="section-kicker">YOUR VISIT</div><h2>Be part of the story.</h2>
      <div className="visit-item"><h3>Come with your people</h3><p>Invite a friend, classmate, teammate, or family member. There is room for them here.</p></div>
      <div className="visit-item"><h3>Bring your creativity</h3><p>Wear something that feels like you. Celebrate your personality, culture, and story.</p></div>
      <div className="visit-item"><h3>Stay connected</h3><p>Take the next step after the event. Find community and keep growing with us.</p></div>
    </section>

    <section className="fos-cta" id="register"><div><div className="section-kicker">SAVE THE DATE</div><h2>Your place is waiting.</h2><p>Registration details will be available through the church event registration.</p></div><a className="hero-register" href="/register/festival-of-stars">REGISTER NOW <ArrowRight size={18}/></a></section>
    <footer id="contact"><div>FIRST LOVE CHURCH PHILIPPINES</div><small>Festival of Stars · {dateLabel}</small><button onClick={share}><Share2 size={15}/> Share this announcement</button></footer>
  </main>
}