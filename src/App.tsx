import FestivalOfStars from "./festivalofstars";
import FestivalOfStarsRegister from "./festivalofstars-register";

const path = window.location.pathname;

export default function App() {
  if (path.startsWith("/festivalofstars/register")) return <FestivalOfStarsRegister />;
  return <FestivalOfStars />;
}
