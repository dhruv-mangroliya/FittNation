import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import AppShowcase from './components/AppShowcase';
import Preloader from './components/Preloader';
import Services from './components/Services';
import Gallery from './components/Gallery';
import Instagram from './components/Instagram';
import Branches from './components/Branches';
import Contact from './components/Contact';
import Footer from './components/Footer';

import Login from './pages/Login';
import Admin from './pages/Admin';
import FitnessTracker from './pages/FitnessTracker';
import SharePage from './pages/SharePage';

function FitnessTrackerPage() {
  return <FitnessTracker />;
}

function Home() {
  const [selectedBranch, setSelectedBranch] = useState('mota-varachha');
  return (
    <div className="home">
      <Preloader />
      <Navbar onBranchSelect={setSelectedBranch} />
      <Hero />
      <Marquee />
      <AppShowcase />
      <Services />
      <Gallery />
      <Instagram />
      <Branches selectedBranch={selectedBranch} onBranchSelect={setSelectedBranch} />
      <Contact />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                 element={<Home />} />
          <Route path="/login"            element={<Login />} />
          <Route path="/admin"            element={<Admin />} />
          <Route path="/fitness-tracker"  element={<FitnessTrackerPage />} />
          <Route path="/share-card"       element={<SharePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
