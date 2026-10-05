import FestivalOfStars from "./festivalofstars";

const path = window.location.pathname;

export default function App() {
  if (path === "/" || path.startsWith("/festivalofstars")) {
    return <FestivalOfStars />;
  }

  return <FestivalOfStars />;
}
