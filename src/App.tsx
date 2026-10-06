import FestivalOfStars from "./festivalofstars-youth";
import FestivalOfStarsRegister from "./festivalofstars-register";
import FestivalOfStarsAnnouncement from "./festivalofstars-announcement";
import FestivalOfStarsAnnouncementRegister from "./festivalofstars-announcement-register";
import YoungAdultFellowship from "./young-adult-fellowship";

const path = window.location.pathname;

export default function App() {
  if (path.startsWith("/festivalofstars/register")) return <FestivalOfStarsRegister />;
  if (path.startsWith("/festivalofstars/announcement/register")) return <FestivalOfStarsAnnouncementRegister />;
  if (path.startsWith("/festivalofstars/announcement")) return <FestivalOfStarsAnnouncement />;
  if (path.startsWith("/young-adult-fellowship")) return <YoungAdultFellowship />;
  return <FestivalOfStars />;
}
