import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import MapPage from "./pages/MapPage.jsx"
import PlaceDetail from "./pages/PlaceDetail.jsx"
import MyJourney from "./pages/MyJourney.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FBF3E4]">
        <Navbar />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/place/:slug" element={<PlaceDetail />} />
            <Route path="/my-journey" element={<MyJourney />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
