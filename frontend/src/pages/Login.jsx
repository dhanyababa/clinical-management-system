import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MdPerson, MdLock } from "react-icons/md";

const Login = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // HANDLE INPUT CHANGE
  // ============================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================
  // HANDLE LOGIN
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(formData);
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Login failed. Please try again.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="
        relative flex min-h-screen min-h-[100dvh]
        w-full items-center justify-center
        bg-cover bg-center bg-no-repeat
        px-4 py-8
        sm:px-6 sm:py-12
        font-poppins
      "
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg')",
      }}
    >
      {/* ===================================== */}
      {/* BACKGROUND OVERLAY */}
      {/* ===================================== */}

      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1B4360]/85 via-black/70 to-[#1B4360]/90"
        aria-hidden="true"
      />

      {/* ===================================== */}
      {/* LOGIN CARD */}
      {/* ===================================== */}

      <div
        className="
          relative z-10
          w-full max-w-md min-w-0
          rounded-2xl
          bg-white
          px-5 py-7
          shadow-2xl
          sm:px-8 sm:py-8
        "
      >
        {/* ===================================== */}
        {/* LOGO AND BRANDING */}
        {/* ===================================== */}

        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="https://img.icons8.com/ios-filled/80/1B4360/hospital-room.png"
            alt="MediCare+ Hospital Logo"
            className="mb-2 h-14 w-14 object-contain sm:h-16 sm:w-16"
          />

          <h1 className="text-2xl font-extrabold tracking-tight text-[#1B4360] sm:text-3xl">
            MediCare+
          </h1>

          <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-[#B89528] sm:text-sm">
            Hospital & Research
          </p>
        </div>

        {/* ===================================== */}
        {/* LOGIN TITLE */}
        {/* ===================================== */}

        <h2 className="mb-6 text-center text-lg font-bold text-[#1B4360] sm:text-xl">
          Login to Your Account
        </h2>

        {/* ===================================== */}
        {/* LOGIN FORM */}
        {/* ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-col gap-4"
        >
          {/* ERROR MESSAGE */}

          {errorMessage && (
            <div
              role="alert"
              className="
                break-words
                rounded-lg
                border border-red-200
                bg-red-50
                px-3 py-3
                text-sm text-red-700
              "
            >
              {errorMessage}
            </div>
          )}

          {/* ===================================== */}
          {/* USERNAME */}
          {/* ===================================== */}

          <div>
            <label
              htmlFor="login-username"
              className="mb-1.5 block text-sm font-medium text-[#1B4360]"
            >
              Username
            </label>

            <div
              className="
                flex min-w-0 items-center
                rounded-lg
                border border-gray-300
                bg-white
                px-3 py-1.5
                transition
                focus-within:border-[#D4AF37]
                focus-within:ring-2
                focus-within:ring-[#D4AF37]/30
              "
            >
              <MdPerson
                className="mr-2 shrink-0 text-xl text-gray-400"
                aria-hidden="true"
              />

              <input
                id="login-username"
                type="text"
                name="username"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
                className="
                  w-full min-w-0
                  bg-transparent
                  p-2
                  text-base text-gray-900
                  placeholder:text-gray-400
                  outline-none
                "
              />
            </div>
          </div>

          {/* ===================================== */}
          {/* PASSWORD */}
          {/* ===================================== */}

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-medium text-[#1B4360]"
            >
              Password
            </label>

            <div
              className="
                flex min-w-0 items-center
                rounded-lg
                border border-gray-300
                bg-white
                px-3 py-1.5
                transition
                focus-within:border-[#D4AF37]
                focus-within:ring-2
                focus-within:ring-[#D4AF37]/30
              "
            >
              <MdLock
                className="mr-2 shrink-0 text-xl text-gray-400"
                aria-hidden="true"
              />

              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="
                  w-full min-w-0
                  bg-transparent
                  p-2
                  text-base text-gray-900
                  placeholder:text-gray-400
                  outline-none
                "
              />
            </div>
          </div>

          {/* ===================================== */}
          {/* FORGOT PASSWORD */}
          {/* ===================================== */}

          {/* <div className="text-right">
            <a
              href="#"
              className="text-sm font-medium text-[#1B4360] transition-colors hover:text-[#B89528] hover:underline"
            >
              Forgot Password?
            </a>
          </div> */}

          {/* ===================================== */}
          {/* LOGIN BUTTON */}
          {/* ===================================== */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              flex w-full items-center justify-center
              rounded-lg
              bg-[#D4AF37]
              px-4 py-3
              text-base font-semibold
              text-[#1B4360]
              shadow-md
              transition
              hover:bg-yellow-400
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#1B4360]
              focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* ===================================== */}
        {/* FOOTER */}
        {/* ===================================== */}

        <p className="mt-6 text-center text-xs text-gray-500 sm:text-sm">
          © {new Date().getFullYear()} Hospital Management System
        </p>
      </div>
    </div>
  );
};

export default Login;