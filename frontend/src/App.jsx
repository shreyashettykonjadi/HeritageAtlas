import { BrowserRouter, Routes, Route } from "react-router-dom"
import MapPage from "./pages/MapPage.jsx"
import PlaceDetail from "./pages/PlaceDetail.jsx"
import MyJourney from "./pages/MyJourney.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F9E4C5]">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/my-journey" element={<MyJourney />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
