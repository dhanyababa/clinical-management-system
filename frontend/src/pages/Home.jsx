import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import HeroSection from "../components/shared/HeroSection";
import StatsSection from "../components/shared/StatsSection";
import AboutSection from "../components/shared/AboutSection";
import SpecialitiesSection from "../components/shared/SpecialitiesSection";
import EmergencySection from "../components/shared/EmergencySection";
import HomeCareSection from "../components/shared/HomeCareSection";
import ChairmanSection from "../components/shared/ChairmanSection";
import SupportSection from "../components/shared/SupportSection";

const Home = () => {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-white">
      <Navbar />

      {/* Main Content */}
      <main className="min-w-0 flex-1 pt-[76px] sm:pt-[88px] lg:pt-[124px]">
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <SpecialitiesSection />
        <EmergencySection />
        <HomeCareSection />
        <ChairmanSection />
        <SupportSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;