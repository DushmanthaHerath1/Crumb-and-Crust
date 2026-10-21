import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import useCartStore from "../store/useCartStore";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const cartItemCount = useCartStore((state) => state.cartItemCount());
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    const SCROLL_THRESHOLD = 15;

    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);

      if (currentScrollY <= 60) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (scrollDifference < SCROLL_THRESHOLD) {
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-16 bg-surface px-(--spacing-container-mobile) md:px-(--spacing-container-desktop) flex items-center justify-between z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="text-primary font-heading text-xl font-bold tracking-wide">
        <a href="/#home">Crumb & Crust</a>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6 text-on-surface-variant text-base font-body">
          <a
            href="/#home"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Home
          </a>
          <a
            href="/#menu"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Menu
          </a>
          <a
            href="/#gallery"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Gallery
          </a>
          <a
            href="/#location"
            className="hover:text-primary hover:font-bold active:text-primary active:font-bold transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4 text-primary">
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

        <button
          className="md:hidden hover:opacity-80 transition-opacity ml-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`absolute top-16 left-0 w-full bg-surface flex flex-col items-end px-6 gap-6 border-t border-primary/20 rounded-b-lg shadow-lg md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen
            ? "max-h-75 py-6 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <a
          href="/#home"
          onClick={handleNavLinkClick}
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Home
        </a>
        <a
          href="/#menu"
          onClick={handleNavLinkClick}
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Menu
        </a>
        <a
          href="/#gallery"
          onClick={handleNavLinkClick}
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Gallery
        </a>
        <a
          href="/#location"
          onClick={handleNavLinkClick}
          className="text-base text-on-surface-variant hover:text-primary active:text-primary active:font-bold transition-colors"
        >
          Contact Us
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
