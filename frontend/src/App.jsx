import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/cart-drawer/CartDrawer";
import StorefrontPage from "./pages/StorefrontPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import StaffLogin from "./pages/StaffLogin";
import KitchenDashboard from "./pages/KitchenDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className={`bg-surface min-h-screen ${isAdmin ? "" : "pt-16"}`}>
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartDrawer />}
      <Routes>
        <Route path="/" element={<StorefrontPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmed" element={<OrderConfirmationPage />} />
        <Route path="/admin" element={<StaffLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!isAdmin && <Footer />}
    </div>
  );
}

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
        <AppShell />
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

export default App;
