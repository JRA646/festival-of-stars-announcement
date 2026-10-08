import FestivalOfStars from "./festivalofstars-youth";
import FestivalOfStarsRegister from "./festivalofstars-register";
import FestivalOfStarsAnnouncement from "./festivalofstars-announcement";
import FestivalOfStarsAnnouncementRegister from "./festivalofstars-announcement-register";
import YoungAdultFellowship from "./young-adult-fellowship";
import FirstLoveNight from "./first-love-night";
import FirstLoveNightOptionB from "./first-love-night-option-b";
import FirstLoveNightOptionBRsvp from "./first-love-night-option-b-rsvp";

const path = window.location.pathname;

export default function App() {
  if (path.startsWith("/first-love-night-option-b/rsvp")) return <FirstLoveNightOptionBRsvp />;
  if (path.startsWith("/first-love-night-option-b")) return <FirstLoveNightOptionB />;
  if (path.startsWith("/first-love-night")) return <FirstLoveNight />;
  if (path.startsWith("/festivalofstars/register")) return <FestivalOfStarsRegister />;
  if (path.startsWith("/festivalofstars/announcement/register")) return <FestivalOfStarsAnnouncementRegister />;
  if (path.startsWith("/festivalofstars/announcement")) return <FestivalOfStarsAnnouncement />;
  if (path.startsWith("/young-adult-fellowship")) return <YoungAdultFellowship />;
  return <FestivalOfStars />;
}
