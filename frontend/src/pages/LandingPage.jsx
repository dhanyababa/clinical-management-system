import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import HeroSection from "../components/shared/HeroSection";
import StatsSection from "../components/shared/StatsSection";
import AboutSection from "../components/shared/AboutSection";
import SpecialitiesSection from "../components/shared/SpecialitiesSection";
import ChairmanSection from "../components/shared/ChairmanSection";
import DoctorsSection from "../components/shared/DoctorsSection";
import FacilitiesSection from "../components/shared/FacilitiesSection";
import TestimonialsSection from "../components/shared/TestimonialsSection";
import AppointmentSection from "../components/shared/AppointmentSection";
import EmergencyFloat from "../components/shared/EmergencyFloat";

const LandingPage = () => {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-white">
      <Navbar />

      {/* Offset for fixed navbar */}
      <main className="min-w-0 flex-1 pt-[76px] sm:pt-[88px] lg:pt-[124px]">
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <ChairmanSection />
        <SpecialitiesSection />
        <DoctorsSection />
        <FacilitiesSection />
        <TestimonialsSection />
        <AppointmentSection />
      </main>

      <Footer />
      <EmergencyFloat />
    </div>
  );
};

export default LandingPage;