import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import MenuSection from "../components/menu-section/MenuSection";
import Gallery from "../components/gallery-section/Gallery";
import BakeryLocation from "../components/location-section/BakeryLocation";

function StorefrontPage() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/menu`);
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return (
    <>
      <HeroSection />
      <MenuSection menu={menu} isLoading={isLoading} error={error} />
      <Gallery />
      <BakeryLocation />
    </>
  );
}

export default StorefrontPage;
