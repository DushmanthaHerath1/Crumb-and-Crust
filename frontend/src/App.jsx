import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/cart-drawer/CartDrawer";
import StorefrontPage from "./pages/StorefrontPage";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-surface min-h-screen">
        <Navbar />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<StorefrontPage />}></Route>
          <Route path="/checkout" element={<CheckoutPage />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
