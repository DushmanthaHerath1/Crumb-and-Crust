import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import MenuSection from "../components/menu-section/MenuSection";

function StorefrontPage() {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("http://localhost:8000/api/menu");
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
    </>
  );
}

export default StorefrontPage;
