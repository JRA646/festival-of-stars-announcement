import FestivalOfStars from "./festivalofstars-youth";
import FestivalOfStarsRegister from "./festivalofstars-register";
import YoungAdultFellowship from "./young-adult-fellowship";

const path = window.location.pathname;

export default function App() {
  if (path.startsWith("/festivalofstars/register")) return <FestivalOfStarsRegister />;
  if (path.startsWith("/young-adult-fellowship")) return <YoungAdultFellowship />;
  return <FestivalOfStars />;
}
