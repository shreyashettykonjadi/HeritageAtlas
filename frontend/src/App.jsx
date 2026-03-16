import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import MapPage from "./pages/MapPage.jsx"
import PlaceDetail from "./pages/PlaceDetail.jsx"
import MyJourney from "./pages/MyJourney.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import api from "./services/api"

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(function checkSessionOnLoad() {
    async function loadSession() {
      try {
        const response = await api.get("/auth/me")
        setUser(response.data)
        setAuthLoading(false)
      } catch (error) {
        if (error?.response?.status === 401) {
          setUser(null)
          setAuthLoading(false)
        } else {
          console.error("Failed to verify auth session", error)
          setAuthLoading(false)
        }
      }
    }

    loadSession()
  }, [])

  function handleAuthSuccess(user) {
    setUser(user)
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FBF3E4]">
        <Navbar />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/place/:slug" element={<PlaceDetail />} />
            <Route path="/my-journey" element={<MyJourney />} />
            <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
