import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import MapPage from "./pages/MapPage.jsx"
import PlaceDetail from "./pages/PlaceDetail.jsx"
import MyJourney from "./pages/MyJourney.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F9E4C5]">
        <Navbar />

        <div className="pt-20">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/place/:id" element={<PlaceDetail />} />
            <Route path="/my-journey" element={<MyJourney />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
