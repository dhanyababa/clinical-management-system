const EmergencyFloat = () => {
  return (
    <a
      href="tel:9342513104"
      className="
        fixed
        bottom-4
        right-4
        sm:bottom-6
        sm:right-6
        z-40
        bg-red-600
        text-white
        text-xs
        sm:text-sm
        font-semibold
        px-3
        sm:px-4
        py-2.5
        sm:py-3
        rounded-full
        shadow-lg
        hover:bg-red-700
        transition
        whitespace-nowrap
        max-w-[calc(100vw-2rem)]
      "
    >
      Emergency Call
    </a>
  );
};

export default EmergencyFloat;