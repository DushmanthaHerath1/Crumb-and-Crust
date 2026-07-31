import React, { useState } from "react";

const Navbar = () => {
  // to track Mobile menu open or closed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full h-[64px] bg-[#131313] px-[20px] md:px-[80px] flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="text-[#FFB595] font-serif text-[18px] font-bold tracking-wide">
        Crumb & Crust
      </div>

      {/* Desktop Navigation Links (Hidden on Mobile) */}
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6 text-[#E0C0B2] text-[16px] font-sans">
          <a href="#" className="text-[#FFB595] font-bold">
            Home
          </a>
          <a href="#" className="hover:text-[#FFB595] transition-colors">
            Menu
          </a>
          <a href="#" className="hover:text-[#FFB595] transition-colors">
            Orders
          </a>
          <a href="#" className="hover:text-[#FFB595] transition-colors">
            Profile
          </a>
        </div>
      </div>

      {/* Cart & Hamburger Menu (Right Side) */}
      <div className="flex items-center gap-4 text-[#FFB595]">
        {/* Cart Icon (Visible on both Mobile & Desktop) */}
        <button className="hover:opacity-80 transition-opacity">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>

        {/* Hamburger / Close Icon (Visible ONLY on Mobile) */}
        <button
          className="md:hidden hover:opacity-80 transition-opacity ml-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            /* Close 'x' Icon */
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            /* Hamburger Menu Icon */
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>
      {/* Mobile Menu Dropdown (Animated) */}
      <div
        className={`absolute top-[64px] left-0 w-full bg-[#131313] flex flex-col items-end px-6 gap-6 border-t border-[#FFB595]/20 rounded-b-lg shadow-lg md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen
            ? "max-h-[300px] py-6 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <a href="#" className="text-[#FFB595] font-bold text-[16px]">
          Home
        </a>
        <a
          href="#"
          className="text-[#E0C0B2] hover:text-[#FFB595] text-[16px] transition-colors"
        >
          Menu
        </a>
        <a
          href="#"
          className="text-[#E0C0B2] hover:text-[#FFB595] text-[16px] transition-colors"
        >
          Orders
        </a>
        <a
          href="#"
          className="text-[#E0C0B2] hover:text-[#FFB595] text-[16px] transition-colors"
        >
          Profile
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
