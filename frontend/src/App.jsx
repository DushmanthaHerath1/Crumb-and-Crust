import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/cart-drawer/CartDrawer";
import StorefrontPage from "./pages/StorefrontPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

function App() {
  const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: import.meta.env.VITE_PAYPAL_CURRENCY,
    intent: "capture",
    components: "buttons",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <BrowserRouter>
        <div className="bg-surface min-h-screen">
          <Navbar />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<StorefrontPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/order-confirmed"
              element={<OrderConfirmationPage />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

export default App;
