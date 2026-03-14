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
  const [authUser, setAuthUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(function checkSessionOnLoad() {
    async function loadSession() {
      try {
        const response = await api.get("/auth/me")
        setAuthUser(response.data)
      } catch (error) {
        if (error?.response?.status === 401) {
          setAuthUser(null)
        } else {
          console.error("Failed to verify auth session", error)
        }
      } finally {
        setAuthChecked(true)
      }
    }

    loadSession()
  }, [])

  function handleAuthSuccess(user) {
    setAuthUser(user)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FBF3E4]">
        <Navbar />

        <main className="flex-1 flex flex-col">
          {!authChecked ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#1B4436]/20 border-t-[#1B4436] rounded-full animate-spin" />
            </div>
          ) : (
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/place/:slug" element={<PlaceDetail />} />
            <Route path="/my-journey" element={<MyJourney />} />
            <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />
          </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  )
}
