import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/cart-drawer/CartDrawer";
import StorefrontPage from "./pages/StorefrontPage";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-surface min-h-screen">
        <Navbar />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<StorefrontPage />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
