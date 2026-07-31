import { useEffect, useState } from "react";

function App() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch("https://localhost:8000/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Crumb & Crust Menu (Test)
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menu.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white shadow-md rounded-lg border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
            <p className="text-gray-600 mt-2">Rs. {item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
