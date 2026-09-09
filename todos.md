# Crumb & Crust — Full Completion Plan

> **Legend:** `[ ]` = not started · `[/]` = in progress · `[X]` = done

---

## Current State Snapshot

### ✅ Backend (Stable — treat as done unless a bug surfaces)

All 7 routes are built and working: `GET /api/menu`, `GET /api/business-rules`,
`POST /api/orders`, `POST /api/webhooks/stripe`, `POST /api/admin/login`,
`GET /api/admin/orders`, `PATCH /api/admin/orders/{id}/status`

### ⚠️ Known Backend Issues to Fix

See Phase 0 below.

### 🔧 Frontend (Partially built, mostly disconnected)

- `Navbar` — renders, no cart count badge
- `HeroSection` — renders, CTA button does nothing
- `MenuSection` — shell, receives `menu` prop but doesn't pass it through correctly (`App.jsx` fetches but never passes down)
- `MenuFilter` — tab UI works locally, NOT connected to `ProductGrid` filtering
- `ProductGrid` — accepts `products` prop, price formatting fixed, renders cards
- `FeaturedProductCard` / `ProductCard` — UI done, `onAddToCart` prop exists but never reaches `useCartStore`
- `AddToCartButton` — click handler exists but Zustand NOT connected
- `useCartStore` — `addToCart` pushes duplicates instead of incrementing quantity
- `App.jsx` — fetches menu on mount, uses `https` instead of `http` (TLS bug), fetched data never passed to `MenuSection`

### ❌ Not Started (Frontend)

Cart drawer/panel, Guest checkout form, Date/time picker, Stripe redirect, Success/confirmation page, Admin login page, Kitchen dashboard, React Router setup

---

## PHASE 0 — Backend Fixes & Gaps (Do Before Frontend)

### 0.1 — Backend Model Issues

- [x] **`Product` model missing `description` field** — `FeaturedProductCard` has a `description` prop with a hardcoded fallback. The API returns no description. Add `description = Column(String, nullable=True)` to `Product`.
- [x] **`Product` model missing `image_url` field** — Cards have `imageUrl` prop. No image data comes from the API. Added `image_url = Column(String, nullable=True)` to `Product`.
- [x] **`Product` model — `is_sold_out_today` dropped** — `is_active` already handles the "unavailable" toggle; no separate column needed.
- [x] **`Order` model missing `total_price` field** — Added `total_price = Column(Float, nullable=True)` to `Order`; `POST /api/orders` now stores `calculated_total` on the order before commit.
- [x] **`OrderItem` — `unit_price` dropped** — The product price lives on the `Product` table; `subtotal` (= price × qty, stored at order time) is sufficient.
- [x] **`AdminUser` model missing `full_name` field** — Added `full_name = Column(String, nullable=True)` to `AdminUser`.
- [x] **`Product` model — add `is_featured` column** — Added `is_featured = Column(Boolean, default=False)`. A+B logic in `GET /api/menu` uses this as the manual override signal. Migration `1eed00631d9c` applied.

### 0.2 — Backend Schema Fixes

- [x] **`ProductResponse` schema missing new fields** — Added `category`, `description`, `image_url` to `ProductResponse`.
- [x] **`OrderResponse` schema missing `total_price`** — Added `total_price: Optional[float]` to `OrderResponse`.
- [x] **Create `OrderItemResponse` schema** — Added `OrderItemResponse` with `id`, `product_id`, `quantity`, `subtotal` (no unit_price — redundant).
- [x] **Create `AdminOrderResponse` schema** — Created `AdminOrderResponse` with `id`, `status`, `pickup_datetime`, `total_price`, `customer_json`, `paid_at`, `stripe_session_id`, and nested `items: List[OrderItemResponse]`. Applied `response_model` to both admin order endpoints.
- [x] **`OrderStatusUpdate` schema — add status validation** — Added `Literal["ready_for_pickup", "completed", "failed", "refunded"]` constraint.
- [x] **`AdminResponse` schema missing `full_name`** — Added `full_name: Optional[str]` to `AdminResponse`.
- [x] **`ProductResponse` — add `is_featured` field** — Added `is_featured: bool = False`. The A+B logic in `get_menu` mutates the Pydantic object (not the SQLAlchemy row) to signal which product is featured.

### 0.3 — Backend Route Fixes

- [ ] **`POST /api/orders` — wrong HTTP status on invalid product** — ~~Line 148 in `main.py` raises `HTTPException(status_code=201, ...)` for an unavailable product.~~ Fixed to `status_code=400`.
- [x] **`POST /api/orders` — store `total_price` on the order** — `total_price=calculated_total` is now set on `new_order` before `db.flush()`.
- [x] **`POST /api/orders` — remove `unit_price` dead code** — Removed the commented-out `unit_price` line; `subtotal` is all that's stored.
- [x] **`PATCH /api/admin/orders/{id}/status` — missing response model** — Added `response_model=schemas.AdminOrderResponse`; endpoint now returns the updated order.
- [ ] **`GET /api/admin/orders` — add date filter query param** — Dashboard needs to filter by pickup date. Add an optional `date: Optional[date] = None` query param. If provided, filter `Order.pickup_datetime` by that date.
- [ ] **`GET /api/admin/orders` — add status filter** — Add optional `status: Optional[str] = None` query param to allow the kitchen to view only `paid` orders (the default dashboard view).
- [x] **`POST /api/admin/login` — fix `headers` syntax bug** — Fixed `headers={"WWW-Authenticate", "Bearer"}` (set literal) to `headers={"WWW-Authenticate": "Bearer"}` (dict).
- [ ] **`dependencies.py` — typo in error message** — Line 23: `"Bearber"` should be `"Bearer"`.
- [ ] **Add `GET /api/orders/{session_id}` endpoint** — The success page must confirm order status by querying the backend with the Stripe session ID (never trust URL params). Add this public, unauthenticated route that returns the order status and pickup time for a given `stripe_session_id`.
- [ ] **Add `GET /api/availability` endpoint** — Public, unauthenticated. Accepts a `?date=YYYY-MM-DD` query param. Returns whether that date is at capacity (boolean `is_fully_booked` and `remaining_slots` count). Used by the frontend date picker to disable fully-booked dates _before_ the user submits. Backend still validates capacity on `POST /api/orders` — this is a UX convenience only.
- [ ] **Add `POST /api/admin/products/{id}/sold-out-today` toggle endpoint** — Since we dropped `is_sold_out_today`, this is no longer applicable; staff use `is_active` to disable a product.

### 0.4 — Alembic Migrations

- [x] **Create and run Alembic migration** — Migration `b9f1c3d72e05` written to `alembic/versions/`. Adds `image_url` to `products`, `total_price` to `orders`, `full_name` to `admin_users`. Run with `uv run alembic upgrade head` from the `backend/` directory.
- [x] **Migration `1eed00631d9c` — add `is_featured` to products** — Auto-generated and applied. Column added as `nullable=True` in the DB (Alembic default for new columns on existing tables; model default=False handles fresh rows).
- [x] **Update `reset_db.py`** — `is_featured=True` set on "Special Sourdough" as the default manual featured product on every fresh reset.

---

### 0.5 — Featured Product A+B Logic

- [x] **`resolve_featured_id()` helper in `main.py`** — Implements the 4-tier priority: (1) manual DB flag, (2) today's best seller, (3) all-time best seller, (4) first product as last resort.
- [x] **`GET /api/menu` — build Pydantic objects, not mutate SQLAlchemy rows** — Uses `model_validate(p)` then sets `item.is_featured = True` on the Pydantic copy. Prevents SQLAlchemy from treating the featured flag as a dirty write.
- [x] **`ProductGrid.jsx` — replace positional hack with `is_featured` lookup** — `products.find(p => p.is_featured)` + fallback guard if no featured product comes back.

---

## PHASE 1 — Wire Existing Frontend Components Together

> Goal: By the end of this phase, the menu page is fully alive — real data, working filters, cart with a live count badge.

### 1.1 — Fix `useCartStore`

- [x] **Fix `addToCart` duplicate bug** — `addToCart` checks by `id`; increments quantity if found, pushes `{ ...product, quantity: 1 }` if new.
- [x] **Add `removeFromCart(itemId)` action** — Filters out the item by id.
- [x] **Add `updateQuantity(itemId, quantity)` action** — Updates quantity; removes item if quantity reaches 0.
- [x] **Add `cartItemCount` derived value** — Function: `cart.reduce((sum, item) => sum + item.quantity, 0)`. Navbar badge reads this.
- [x] **Add `cartTotal` derived value** — Function: `cart.reduce((sum, item) => sum + item.price * item.quantity, 0)`. Display-only; backend always recomputes the authoritative total.
- [x] **Add `isCartOpen` + `openCart` / `closeCart`** — Boolean + two setters for the CartDrawer slide-in.

### 1.2 — Fix `App.jsx` (Data Plumbing)

- [x] **Fix `https` to `http` URL bug** — Change `fetch("https://localhost:8000/api/menu")` to `fetch("http://localhost:8000/api/menu")` in `App.jsx`.
- [ ] **Pass `menu` prop down to `MenuSection`** — `App.jsx` already fetches and stores menu data in state but never passes it: add `menu={menu}` to `<MenuSection />`. This one line connects the fetch to the grid.
- [ ] **Add loading and error states to `App.jsx`** — Track `isLoading` and `error` state alongside `menu`. Pass them to `MenuSection` so the UI can show a spinner or error message instead of silently doing nothing.
- [ ] **Set up React Router in `App.jsx`** — Install `react-router-dom`, wrap the app in `<BrowserRouter>`, and define routes: `/` (storefront), `/checkout` (guest form + date picker), `/success` (confirmation page), `/admin` (login), `/admin/dashboard` (kitchen). _(No `/cart` route — cart is a drawer only.)_

### 1.3 — Connect `MenuFilter` to `ProductGrid`

- [ ] **Lift filter state to `MenuSection`** — Move `activeTab` state from `MenuFilter` up to `MenuSection`. Pass `activeTab` and `onTabChange` as props down to `MenuFilter`.
- [ ] **Update `MenuFilter` to accept props** — Change `MenuFilter` to a controlled component: accept `activeTab`, `onTabChange`, and `categories` as props instead of managing its own state or hardcoding the tab list.
- [ ] **Derive categories dynamically from menu data** — In `MenuSection`, compute the tab list from the live API response: `["All", ...new Set(menu.map(p => p.category).filter(Boolean))]`. This means adding a new category to the DB automatically adds a new tab — no frontend change ever needed.
- [ ] **Add category-based filtering in `MenuSection`** — After lifting state, filter the `menu` array by `product.category` matching `activeTab` before passing `filteredProducts` to `ProductGrid`. The **"All"** tab shows all active products with no filter applied.
- [ ] **Update cards to use real API data** — Ensure `FeaturedProductCard` and `ProductCard` accept and render `description` and `imageUrl` from real API data instead of hardcoded defaults.

### 1.4 — Wire `AddToCartButton` to `useCartStore`

- [ ] **Import and call `useCartStore` in `ProductGrid`** — Destructure `addToCart`. Create a `handleAddToCart(product)` function that calls `addToCart({ id: product.id, name: product.name, price: product.price, lead_time_h: product.lead_time_h, quantity: 1 })`. Include `lead_time_h` so the checkout page can compute max lead time.
- [ ] **Pass `handleAddToCart` as `onAddToCart` to cards** — Replace the current `onAddToCart?.()` callbacks in `ProductGrid` with `() => handleAddToCart(product)`.
- [ ] **Remove `onAddToCart` prop from `App.jsx` and `MenuSection` chain** — `ProductGrid` now owns this responsibility directly via Zustand. Clean up any unused prop forwarding.

### 1.5 — Wire Cart Count to `Navbar`

- [ ] **Import `useCartStore` in `Navbar`** — Destructure the `cartItemCount` derived value.
- [ ] **Add cart count badge to cart icon** — Conditionally render a small orange badge (absolute-positioned circle with count) over the cart SVG icon in `Navbar` when `cartItemCount > 0`.
- [ ] **Add `onClick` to the cart icon button in `Navbar`** — Wire the click to open the cart drawer (created in Phase 2).

### 1.6 — Wire Hero CTA Button

- [ ] **Add `onClick` to the "Pre-order for Pickup" button in `HeroSection`** — Scroll the user to the menu section. Use `document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })`. Add `id="menu"` to the `<section>` in `MenuSection.jsx`.

---

## PHASE 2 — Cart Drawer

> Goal: A slide-in cart panel that shows items, quantities, a subtotal, and a "Proceed to Checkout" button.

- [ ] **Create `CartDrawer.jsx`** in `src/components/`. A fixed, right-side slide-in panel rendered when open.
- [ ] **Read cart state from `useCartStore`** — Display each item: name, quantity stepper (+ / −), item subtotal, and a remove button.
- [ ] **Display `cartTotal`** from the Zustand derived value at the bottom of the drawer.
- [ ] **Add a "Proceed to Checkout" button** that navigates to `/checkout` (React Router `useNavigate`).
- [ ] **Add a "Clear Cart" button** that calls `useCartStore.clearCart()`.
- [ ] **Wire drawer open/close state** — Add `isCartOpen` boolean to `useCartStore` (or a small UI slice). Navbar cart icon sets it to `true`. `CartDrawer` renders an X close button.
- [ ] **Style the drawer** — Slide from right (`translate-x-full` to `translate-x-0`), dark semi-transparent overlay behind it, consistent with the dark design system.
- [ ] **Render an empty state** when the cart has no items — e.g. "Your cart is empty. Start adding some bakes!"

---

## PHASE 3 — Guest Checkout Page (`/checkout`)

> Goal: A full checkout page: guest form + date/time picker wired to business rules, submits order to backend, redirects to Stripe.

### 3.1 — Page Setup

- [ ] **Create `CheckoutPage.jsx`** in `src/pages/`.
- [ ] **Add route `/checkout` in `App.jsx`** using React Router `<Route path="/checkout" element={<CheckoutPage />} />`.
- [ ] **Guard the route** — If the cart is empty (read from Zustand), redirect back to `/` automatically.

### 3.2 — Order Summary Sidebar

- [ ] **Render cart items summary on checkout page** — Read from `useCartStore`. Display product name, quantity, line subtotal. Display cart total.
- [ ] **Display `max_lead_time_hours`** — Compute `Math.max(...cart.map(item => item.lead_time_h))` from the cart. Show it as a note: "Your order requires X hours preparation time."

### 3.3 — Guest Info Form

- [ ] **Build guest info form** — Fields: Full Name (min 2 chars), Email (valid format), Phone (min 9 chars). Controlled React inputs with local state.
- [ ] **Add inline validation** — Show error messages per field on blur. Disable the submit button until all fields are valid.

### 3.4 — Date & Time Picker (Wired to Business Rules)

- [ ] **Fetch `GET /api/business-rules` on checkout page mount** — Store `daily_order_cap`, `blackout_dates`, `opening_hours_json`, `max_advance_days` in local state.
- [ ] **Fetch availability for the visible month from `GET /api/availability`** — On calendar month render (and when the user navigates months), fetch availability for each date in the visible range. Cache results locally so navigating back doesn't re-fetch. Use `is_fully_booked` to disable dates that are at capacity in the calendar grid.
- [ ] **Build a custom date picker** — No date-picker library (plain JS date math, ~50–80 lines). Build a simple calendar grid (month view). No external dependency needed.
- [ ] **Disable invalid dates in the date picker:**
  - Dates before today
  - Dates within the next `max_lead_time_hours` hours (enforce the 48h fermentation rule client-side for UX)
  - Dates in `blackout_dates` array from the API
  - Dates beyond `today + max_advance_days`
  - Dates where `is_fully_booked === true` from the availability API
- [ ] **Build a time slot selector** — After a valid date is chosen, render clickable time slots from `opening_hours_json.start` to `opening_hours_json.end` in 30-minute increments. Disable past slots on the current day.
- [ ] **Require both a date AND a time to be selected** before the form submit button becomes active.

### 3.5 — Form Submission & Stripe Redirect

- [ ] **Generate `idempotency_key`** on checkout page mount using `crypto.randomUUID()`.
- [ ] **Build order payload** — Construct the `POST /api/orders` payload from guest details, cart items, and the selected pickup datetime combined as an ISO 8601 string.
- [ ] **Submit to `POST /api/orders`** on form submit.
- [ ] **Handle API error responses** — Show inline error messages for 400 errors (e.g. "Fully booked", "Lead time not met", "Closed on this date"). Map API error strings to friendly copy — never surface raw API error strings.
- [ ] **Redirect to `checkout_url` on success** — The backend returns `checkout_url` (Stripe hosted page URL). Use `window.location.href = response.checkout_url` to redirect.
- [ ] **Clear the cart on successful redirect** — Call `useCartStore.clearCart()` before the redirect.
- [ ] **Add a loading state** while the API call is in-flight and while redirecting to Stripe.

---

## PHASE 4 — Success / Confirmation Page (`/success`)

> Goal: Confirm payment server-side and show the customer their order details.

- [ ] **Create `SuccessPage.jsx`** in `src/pages/`.
- [ ] **Add route `/success` in `App.jsx`**.
- [ ] **Read `session_id` from URL query params** — Use React Router `useSearchParams()` to get `?session_id=...`.
- [ ] **Fetch order status from backend** — Call `GET /api/orders/{session_id}` (new endpoint from Phase 0) to confirm the order is `paid`. Never trust URL params directly.
- [ ] **Show loading state** while the fetch is in-flight.
- [ ] **Show error state** if the session ID is missing, the order is not found, or status is not `paid`. Provide a link back to the homepage.
- [ ] **Show confirmation UI on success:**
  - Order ID
  - Pickup date and time (formatted nicely, e.g. "Saturday, 6 September 2026 at 9:00 AM")
  - Customer name
  - Itemized order summary
  - Total paid
  - A friendly message ("We'll have it ready for you!")
- [ ] **Add a "Back to Home" button**.

---

## PHASE 5 — Admin Login Page (`/admin`)

> Goal: A staff-only login form that authenticates against the backend and stores a JWT.

- [ ] **Create `AdminLoginPage.jsx`** in `src/pages/`.
- [ ] **Add route `/admin` in `App.jsx`** — If the user already has a valid JWT in localStorage, redirect straight to `/admin/dashboard`.
- [ ] **Build the login form** — Fields: Email, Password. Controlled inputs with local state.
- [ ] **Submit to `POST /api/admin/login`** using `application/x-www-form-urlencoded` (OAuth2 form, NOT JSON — the backend uses `OAuth2PasswordRequestForm`).
- [ ] **On success, store the JWT** — Save `access_token` to `localStorage` (key: `crumb_admin_token`).
- [ ] **On success, redirect to `/admin/dashboard`**.
- [ ] **On 401 error, show "Invalid email or password"** — Do not expose the raw error from the backend.
- [ ] **Create a `useAdminAuth` hook** — Reads the JWT from localStorage, checks if it is expired (decode payload, check `exp`), returns `{ token, isAuthenticated, logout }`. `logout()` clears localStorage and redirects to `/admin`.
- [ ] **Create a `ProtectedRoute` wrapper component** — Wraps admin-only routes. Uses `useAdminAuth`. Redirects unauthenticated users to `/admin`.

---

## PHASE 6 — Kitchen Dashboard (`/admin/dashboard`)

> Goal: The real-time kitchen view — all paid orders for today, with status controls for each.

### 6.1 — Page Setup

- [ ] **Create `KitchenDashboard.jsx`** in `src/pages/`.
- [ ] **Add route `/admin/dashboard` in `App.jsx`**, wrapped in `<ProtectedRoute>`.
- [ ] **Add a "Logout" button** that calls `useAdminAuth().logout()`.

### 6.2 — Order List

- [ ] **Fetch `GET /api/admin/orders`** on mount with the JWT in the `Authorization: Bearer <token>` header. Default to filtering by today's date and `status=paid`.
- [ ] **Add a date selector** at the top of the dashboard to switch which day's orders are shown. Pass `?date=YYYY-MM-DD` query param to the API.
- [ ] **Add status filter tabs**: "Paid", "Ready for Pickup", "Completed". Map to the corresponding `status` query param.
- [ ] **Render an `OrderCard` per order** — Show: Order ID, customer name (from `customer_json.name`), pickup time (formatted), itemized list (product names + quantities), order total, current status badge, and action buttons.

### 6.3 — Status Action Buttons

- [ ] **"Mark Ready" button** — Visible only when `status === "paid"`. Calls `PATCH /api/admin/orders/{id}/status` with `{ "new_status": "ready_for_pickup" }`.
- [ ] **"Mark Complete" button** — Visible only when `status === "ready_for_pickup"`. Calls `PATCH /api/admin/orders/{id}/status` with `{ "new_status": "completed" }`.
- [ ] **Handle API errors on status update** — Show an error toast or inline message if the PATCH fails.
- [ ] **Add confirmation on "Mark Complete"** — A simple `window.confirm` prompt before marking an order complete to prevent accidental taps.

### 6.4 — Sold Out Today Toggle

- [ ] **Fetch product list on dashboard** for the sold-out toggle feature.
- [ ] **Add a collapsible "Menu Controls" section** — Shows all active products with a toggle switch for `is_sold_out_today`.
- [ ] **Wire toggle to `POST /api/admin/products/{id}/sold-out-today`** (new endpoint from Phase 0).

---

## PHASE 7 — Polish, Robustness & Error Handling

### 7.1 — Global API Utility

- [ ] **Create `src/lib/api.js`** — A thin `fetch` wrapper that reads the base URL from `import.meta.env.VITE_API_URL` (fallback: `http://localhost:8000`). All API calls across the app go through this — no raw `fetch("http://localhost:8000/...")` in component files.
- [ ] **Create `.env.local`** with `VITE_API_URL=http://localhost:8000`. Document this in `README.md`.
- [ ] **Add a `NotFoundPage.jsx`** (404 catch-all route) with a link back to home.
- [ ] **Add a React `ErrorBoundary`** wrapping the route-rendered pages so an uncaught render error doesn't blank the entire app.

### 7.2 — Mobile Responsiveness Audit

- [ ] **Test and fix Navbar on mobile** — Cart badge, hamburger menu, mobile dropdown all working.
- [ ] **Test and fix `ProductGrid` on mobile** — Single-column grid on small screens. Featured card full-width.
- [ ] **Test and fix `CartDrawer` on mobile** — Full-screen on mobile, slide-in panel on desktop.
- [ ] **Test and fix Checkout page on mobile** — Form and date picker usable on a 375px viewport.
- [ ] **Test and fix Kitchen Dashboard on mobile** — Order cards readable and buttons tappable at small sizes.

### 7.3 — Loading States

- [ ] **Add skeleton loaders** to `ProductGrid` while `menu` is fetching — replace the "Loading menu…" text with styled placeholder card skeletons.
- [ ] **Add spinner to the checkout submit button** while the order is being submitted.
- [ ] **Add spinner to the Success page** while the session is being confirmed.
- [ ] **Add spinner to the Kitchen Dashboard** while orders are loading.

### 7.4 — Toast Notifications

- [ ] **Show "Added to cart" toast** — When a user clicks "Add to Cart", show a brief toast notification (bottom-right, auto-dismiss after 2s). Build a simple toast system in ~30 lines — no library needed.
- [ ] **Show error toasts** for failed API calls in the dashboard (status update failures, network errors).

### 7.5 — Accessibility

- [ ] **Add `aria-label` to all icon-only buttons** (cart icon in Navbar, close button in CartDrawer, hamburger menu, etc.).
- [ ] **Ensure form inputs have `<label>` elements** in the checkout and admin login forms.
- [ ] **Ensure status action buttons have clear, descriptive text** — not just icons.

---

## PHASE 8 — Final Integration Testing

- [ ] **End-to-end customer flow** — Browse menu, add items, verify cart badge increments, open cart drawer, proceed to checkout, fill in form, pick a valid date/time, submit, verify Stripe redirect, verify the success page shows the correct order.
- [ ] **48h lead time enforcement** — Try to select a pickup time within 48 hours and confirm it is disabled in the picker AND rejected by the backend with a clear error.
- [ ] **Blackout date test** — Add a test date to `blackout_dates` in the DB, verify the date picker disables it and the backend rejects it.
- [ ] **Daily capacity test** — Set `daily_order_cap = 1` in the DB, place one order, try to place a second for the same day, verify a "Fully Booked" error.
- [ ] **Idempotency test** — Submit the checkout form twice fast, verify only one order is created.
- [ ] **Admin login flow** — Log in, verify JWT is stored in localStorage, verify `/admin/dashboard` is accessible, verify logging out clears state and redirects to `/admin`.
- [ ] **Status transition test** — Find a paid order in the dashboard, move it to "Ready for Pickup", then "Completed". Verify `order_status_history` has two new rows with the correct `changed_by_user_id`.
- [ ] **Stale JWT test** — Manually remove the JWT from localStorage, then try to access `/admin/dashboard` — verify redirect to `/admin`.

---

## PHASE 9 — Documentation & Cleanup

- [ ] **Update `frontend/AGENT.md` Section 7** to reflect actual build status as tasks are completed.
- [ ] **Update `backend/README.md`** with setup instructions (virtual env, `.env` vars, alembic commands, seed commands).
- [ ] **Update `frontend/README.md`** with local dev instructions (npm install, `.env.local` setup, `npm run dev`).
- [ ] **Remove dead code** — The commented-out `unit_price` in `main.py`, the dead `return new_order` line, the stale comment `#this guy is blurred`, and any other stale TODOs.
- [ ] **Commit in logical chunks** per the Git workflow in `AGENT.md`.

---

## Decisions Log — Confirmed

1. **Product categories** ✅ — Add `category` column to `products` table. Rename the "Featured" tab to **"All"** — it shows every active product. `Breads`, `Pastries`, `Sweets` tabs filter by the new `category` field.

2. **Product images** ✅ — `image_url` column added to `products`. Seeds set to `None` for now; user will provide real URLs in a follow-up. Cards fall back to a styled color placeholder until then.

3. **Cart drawer vs cart page** ✅ — Cart is a **slide-in drawer only**. No `/cart` route. The drawer stays on the current page.

4. **Custom date picker** ✅ — No date-picker library. Build a plain calendar grid with JS date math (~50–80 lines). All real validation (lead time, capacity, blackout dates) happens on the backend regardless.

5. **`is_sold_out_today` dropped** ✅ — `is_active` already covers the "unavailable" use case for V1. No separate boolean column or toggle endpoint needed.

6. **`unit_price` dropped from `OrderItem`** ✅ — The authoritative price is on `Product`. `subtotal` (price × qty at order time) is stored on `OrderItem`; `total_price` is stored on `Order`. This is enough for the admin dashboard and Stripe reconciliation.

7. **Availability endpoint** ✅ — Build `GET /api/availability?date=YYYY-MM-DD`. Returns `{ is_fully_booked, remaining_slots }`. Frontend fetches this per visible month in the date picker and disables fully-booked dates in the calendar UI. Backend still validates capacity on `POST /api/orders` — this is UX-only.
