import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
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
          <ShoppingBag size={20} />

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
            <X size={24} />
          ) : (
            <Menu size={24} />
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
