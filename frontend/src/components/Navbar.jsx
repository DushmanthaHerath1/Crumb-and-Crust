import { useState } from "react";
import useCartStore from "../store/useCartStore";

const Navbar = () => {
  // to track Mobile menu open or closed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = useCartStore((state) => state.cartItemCount());
  const openCart = useCartStore((state) => state.openCart);

  return (
    <nav className="w-full h-16 bg-surface px-(--spacing-container-mobile) md:px-(--spacing-container-desktop) flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="text-primary font-heading text-xl font-bold tracking-wide">
        Crumb & Crust
      </div>

      {/* Desktop Navigation Links (Hidden on Mobile) */}
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6 text-on-surface-variant text-base font-body">
          <a
            href="#"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Home
          </a>
          <a
            href="#"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Menu
          </a>
          <a
            href="#"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Orders
          </a>
          <a
            href="#"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Profile
          </a>
        </div>
      </div>

      {/* Cart & Hamburger Menu (Right Side) */}
      <div className="flex items-center gap-4 text-primary">
        {/* Cart Icon (Visible on both Mobile & Desktop) */}
        <button
          className="relative hover:opacity-80 transition-opacity"
          aria-label={`Cart, ${cartItemCount} item${cartItemCount !== 1 ? "s" : ""}`}
          onClick={openCart}
        >
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

          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold bg-primary text-on-primary leading-none">
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </span>
          )}
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
        className={`absolute top-16 left-0 w-full bg-surface flex flex-col items-end px-6 gap-6 border-t border-primary/20 rounded-b-lg shadow-lg md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen
            ? "max-h-75 py-6 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <a
          href="#"
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Home
        </a>
        <a
          href="#"
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Menu
        </a>
        <a
          href="#"
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Orders
        </a>
        <a
          href="#"
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Profile
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
