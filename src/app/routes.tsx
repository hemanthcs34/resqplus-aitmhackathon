import { Routes, Route } from "react-router-dom"
import App from "../App"
import Game from "../pages/Game"
import NotFound from "../pages/NotFound"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/game" element={<Game />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}