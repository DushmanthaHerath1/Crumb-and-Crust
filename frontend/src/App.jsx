import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

function App() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch("https://localhost:8000/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
    </div>
  );
}

export default App;
