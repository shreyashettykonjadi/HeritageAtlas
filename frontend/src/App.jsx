import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import AuthModal from "./components/AuthModal"
import MapPage from "./pages/MapPage.jsx"
import PlaceDetail from "./pages/PlaceDetail.jsx"
import MyJourney from "./pages/MyJourney.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"

function AppRoutes() {
  const { authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF3E4]">
        <div className="w-8 h-8 border-3 border-[#1B4436]/20 border-t-[#1B4436] rounded-full animate-spin" />
        <span className="mt-4 text-gray-500 text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF3E4]">
      <Navbar />
      <AuthModal />

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/place/:slug" element={<PlaceDetail />} />
          <Route path="/my-journey" element={<MyJourney />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
