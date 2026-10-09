import React from "react";
import {
  FaUserMd,
  FaAmbulance,
  FaMicroscope,
  FaHospitalSymbol,
} from "react-icons/fa";

const HeroSection = () => {
  const bgImage =
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2000&auto=format&fit=crop";

  return (
    <div
      className="
        relative
        min-h-screen
        bg-cover
        bg-center
        font-poppins
        pt-24
        lg:pt-36
      "
      style={{ backgroundImage: `url("${bgImage}")` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60" />

      {/* Hero Content */}
      <div
        className="
          relative
          z-10
          container
          mx-auto
          px-5
          sm:px-6
          lg:px-10
          py-10
          sm:py-14
          lg:py-20
        "
      >
        <div className="max-w-4xl">

          {/* Heading */}
          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
              xl:text-7xl
              font-extrabold
              text-white
              mb-5
              sm:mb-6
              leading-tight
              tracking-tight
              break-words
            "
          >
            Advanced Care. <br />

            <span className="text-[#D4AF37]">
              Compassionate Healing.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="
              mb-7
              sm:mb-8
              text-sm
              sm:text-base
              md:text-lg
              lg:text-xl
              text-gray-200
              max-w-2xl
              font-light
              leading-relaxed
            "
          >
            Delivering world-class healthcare with
            state-of-the-art technology, highly trained
            specialists, and personalized patient care.
          </p>

          {/* Buttons */}
          <div
            className="
              flex
              flex-col
              sm:flex-row
              flex-wrap
              gap-3
              sm:gap-4
            "
          >
            <button
              className="
                w-full
                sm:w-auto
                bg-[#1B4360]
                hover:bg-[#D4AF37]
                hover:text-[#1B4360]
                text-white
                px-6
                sm:px-10
                py-3
                sm:py-4
                rounded-full
                font-semibold
                shadow-xl
                transition-all
                duration-300
              "
            >
              Book Appointment
            </button>

            <button
              className="
                w-full
                sm:w-auto
                backdrop-blur-md
                border-2
                border-white/50
                text-white
                px-6
                sm:px-10
                py-3
                sm:py-4
                rounded-full
                font-semibold
                hover:bg-[#D4AF37]
                hover:text-[#1B4360]
                transition-all
                duration-300
              "
            >
              Emergency Services
            </button>
          </div>

          {/* Icon Cards */}
          <div
            className="
              mt-10
              sm:mt-12
              lg:mt-16
              mb-8
              grid
              grid-cols-2
              md:grid-cols-4
              gap-5
              sm:gap-8
            "
          >
            {/* ICU */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group">
              <FaHospitalSymbol
                className="
                  w-9 h-9
                  sm:w-12 sm:h-12
                  mb-2
                  text-[#D4AF37]
                  group-hover:scale-125
                  transition-transform duration-300
                "
              />

              <p className="text-white font-medium text-xs uppercase tracking-widest">
                24/7 ICU
              </p>
            </div>

            {/* Doctors */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group">
              <FaUserMd
                className="
                  w-9 h-9
                  sm:w-12 sm:h-12
                  mb-2
                  text-[#D4AF37]
                  group-hover:scale-125
                  transition-transform duration-300
                "
              />

              <p className="text-white font-medium text-xs uppercase tracking-widest">
                Expert Doctors
              </p>
            </div>

            {/* Ambulance */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group">
              <FaAmbulance
                className="
                  w-9 h-9
                  sm:w-12 sm:h-12
                  mb-2
                  text-[#D4AF37]
                  group-hover:scale-125
                  transition-transform duration-300
                "
              />

              <p className="text-white font-medium text-xs uppercase tracking-widest">
                Emergency
              </p>
            </div>

            {/* Labs */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group">
              <FaMicroscope
                className="
                  w-9 h-9
                  sm:w-12 sm:h-12
                  mb-2
                  text-[#D4AF37]
                  group-hover:scale-125
                  transition-transform duration-300
                "
              />

              <p className="text-white font-medium text-xs uppercase tracking-widest">
                Advanced Labs
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;