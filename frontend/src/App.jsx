import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import MapPage from "./pages/MapPage.jsx"
import PlaceDetail from "./pages/PlaceDetail.jsx"
import MyJourney from "./pages/MyJourney.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen overflow-hidden bg-[#F9E4C5] flex flex-col">
        <Navbar />

        <div className="flex-1 pt-16 min-h-0">
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
