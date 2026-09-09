import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MenuSection from "./components/menu-section/MenuSection";

function App() {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);
  // isLoading starts true — the fetch begins immediately on mount
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
        // Runs whether fetch succeeded or failed — loading is done either way
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <HeroSection />
      <MenuSection menu={menu} isLoading={isLoading} error={error} />
    </div>
  );
}

export default App;
