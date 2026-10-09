import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { MdPhoneInTalk, MdLogin } from "react-icons/md";

const NAV_ITEMS = [
  "About",
  "Specialities",
  "Doctors",
  "Facilities",
  "Testimonials",
  "Contact",
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const handleNavigation = (item) => {
    setMenuOpen(false);

    const sectionId = item.toLowerCase();

    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
        });
      } else {
        window.location.hash = sectionId;
      }
    }
  };

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b-[3px] border-[#D4AF37]/30 bg-white font-poppins shadow-lg">

      {/* ===================================== */}
      {/* TOP CONTACT BAR */}
      {/* ===================================== */}

      <div className="hidden items-center justify-end bg-[#1B4360] px-6 py-2 text-xs font-bold uppercase tracking-wide text-white lg:flex">
        <div className="flex items-center gap-2">
          <MdPhoneInTalk className="text-lg text-[#D4AF37]" />
          <span>Emergency: +91 000 000 0000</span>
        </div>
      </div>

      {/* ===================================== */}
      {/* MAIN NAVBAR */}
      {/* ===================================== */}

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-6 lg:py-4">

        {/* LOGO */}

        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            navigate("/");
          }}
          className="flex min-w-0 shrink-0 items-center gap-2 text-left sm:gap-3"
          aria-label="MediCare+ Home"
        >
          <img
            src="https://img.icons8.com/ios-filled/80/1B4360/hospital-room.png"
            alt="MediCare+ Hospital Logo"
            className="h-10 w-10 shrink-0 rounded-full border-2 border-[#D4AF37] object-contain shadow-md sm:h-12 sm:w-12 lg:h-14 lg:w-14"
          />

          <div className="flex min-w-0 flex-col">
            <h1 className="whitespace-nowrap text-lg font-extrabold tracking-tight text-[#1B4360] sm:text-2xl lg:text-3xl">
              MediCare+
            </h1>

            <p className="whitespace-nowrap text-[7px] font-bold uppercase tracking-[0.12em] text-[#D4AF37] sm:text-[10px] sm:tracking-[0.2em]">
              Hospital & Research
            </p>
          </div>
        </button>

        {/* ===================================== */}
        {/* DESKTOP NAVIGATION */}
        {/* ===================================== */}

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:flex 2xl:gap-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleNavigation(item)}
              className="group relative whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-[#1B4360] transition-colors duration-200 hover:text-[#D4AF37] 2xl:text-sm"
            >
              {item}

              <span className="absolute -bottom-2 left-0 h-[3px] w-0 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* ===================================== */}
        {/* DESKTOP STAFF LOGIN */}
        {/* ===================================== */}

        <button
          type="button"
          onClick={handleLogin}
          className="hidden shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1B4360] px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#285a7d] hover:shadow-lg xl:inline-flex"
        >
          <MdLogin size={21} className="text-[#D4AF37]" />
          <span className="whitespace-nowrap">
            Staff Login
          </span>
        </button>

        {/* ===================================== */}
        {/* TABLET STAFF LOGIN */}
        {/* ===================================== */}

        <div className="ml-auto hidden items-center gap-3 md:flex xl:hidden">
          <button
            type="button"
            onClick={handleLogin}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1B4360] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#285a7d]"
          >
            <MdLogin size={20} className="text-[#D4AF37]" />
            <span className="whitespace-nowrap">
              Staff Login
            </span>
          </button>
        </div>

        {/* ===================================== */}
        {/* MOBILE / TABLET MENU BUTTON */}
        {/* ===================================== */}

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#1B4360] transition-colors hover:bg-gray-100 xl:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="medicare-navigation-menu"
        >
          {menuOpen ? (
            <HiX size={28} />
          ) : (
            <HiMenu size={28} />
          )}
        </button>
      </div>

      {/* ===================================== */}
      {/* MOBILE / TABLET NAVIGATION MENU */}
      {/* ===================================== */}

      {menuOpen && (
        <div
          id="medicare-navigation-menu"
          className="max-h-[calc(100dvh-85px)] overflow-y-auto border-t border-gray-200 bg-white shadow-xl xl:hidden"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleNavigation(item)}
                className="w-full px-6 py-3.5 text-left text-sm font-semibold uppercase tracking-wide text-[#1B4360] transition-colors hover:bg-[#D4AF37]/10 hover:text-[#1B4360]"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Login inside menu only on mobile */}

          <div className="border-t border-gray-100 px-4 pb-4 pt-3 md:hidden">
            <button
              type="button"
              onClick={handleLogin}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B4360] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#285a7d]"
            >
              <MdLogin size={22} className="text-[#D4AF37]" />
              Staff Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;