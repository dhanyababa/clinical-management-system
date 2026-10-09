import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const FOOTER_LINKS = [
  "Home",
  "About",
  "Specialities",
  "Doctors",
  "Facilities",
  "Contact",
];

const SOCIAL_ICONS = [
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
];

const Footer = () => {
  return (
    <footer className="w-full bg-[#1B4360] text-white font-poppins">
      {/* Main Footer */}
      <div
        className="
          mx-auto flex w-full max-w-7xl
          flex-col items-center
          gap-5 px-4 py-6
          sm:px-6
          lg:flex-row lg:justify-between
          lg:gap-6 lg:py-5
        "
      >
        {/* Branding */}
        <div className="flex shrink-0 flex-col items-center gap-1 text-center sm:flex-row sm:gap-3 lg:items-center lg:text-left">
          <h2 className="text-xl font-bold text-[#D4AF37]">
            MediCare+
          </h2>

          <span className="text-xs text-gray-200 sm:text-sm">
            Compassionate Healthcare
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-medium">
          {FOOTER_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="whitespace-nowrap text-white no-underline transition-colors hover:text-[#D4AF37]"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Contact & Social Icons */}
        <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-200 sm:text-sm">
            <span>📍 Kochi</span>
            <span>📞 +91 98765 43210</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            {SOCIAL_ICONS.map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label={
                  [
                    "Facebook",
                    "Twitter",
                    "Instagram",
                    "LinkedIn",
                  ][index]
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-base text-white transition-all hover:border-[#D4AF37] hover:bg-white/10 hover:text-[#D4AF37]"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 px-4 py-3 text-center text-xs text-gray-300 sm:text-sm">
        © 2026 MediCare+. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;