
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landing'
import VideoMeet from './pages/VideoMeet'
import './App.css'
import Authentication from './pages/authentication'
import { AuthProvider } from './contexts/AuthContext';

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/:url" element={<VideoMeet />} />
          
        </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
