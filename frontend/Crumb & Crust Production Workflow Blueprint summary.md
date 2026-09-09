# Crumb & Crust: Master Production Workflow Blueprint

## Project Brief

"Crumb & Crust" is a digital transformation project for a popular artisanal bakery in Fitzroy, Melbourne. The project delivers a **Mobile-First Digital Pre-order & Kitchen Management System** to replace manual phone/walk-in orders. It features a frictionless Guest Checkout, strict 48-hour fermentation lead-time scheduling, dynamic daily capacity management, and a real-time kitchen dashboard with individual staff accountability.

The system relies on a decoupled architecture where the frontend provides a seamless UX, but a strict backend acts as the absolute source of truth for pricing, time-slot validation, and kitchen capacity.

---

## 1. Technology Stack

The core technologies are chosen for developer velocity, type safety, and high performance.

- **Frontend:** React + Vite (Fast HMR, optimized builds)
- **Styling:** Tailwind CSS (Utility-first, strict design system adherence)
- **State Management:** Zustand (Lightweight global cart state)
- **Backend:** Python + FastAPI (Asynchronous, highly typed API validation via Pydantic)
- **Database:** PostgreSQL (Relational integrity for orders and financial data)
- **Payments:** Stripe (Hosted checkout for PCI compliance)

---

## 2. Infrastructure & Deployment Stack

### Stage A: Development & Staging Environment (Zero Cost)

- **Frontend:** Running locally on `localhost:5173`.
- **Backend:** Running locally on `localhost:8000`.
- **Database:** Supabase Free Tier (Sufficient for active development; 7-day inactivity pause rule does not affect daily coding).
- **Payments:** Stripe Test Mode. Webhooks are routed to localhost using the Stripe CLI.
- **Staging/Client Review:** Frontend deployed to Vercel (Hobby). Backend deployed to Render (Free Tier) — _Note: Client is informed of 50-second cold starts during staging._

### Stage B: Production Environment (High Reliability)

- **Frontend Hosting:** **Vercel (Hobby Tier - $0).** Deployed to the Singapore (sin1) edge region to ensure minimal latency for the developer based in Sri Lanka, while maintaining fast load times for Australian users.
- **Backend Hosting:** **Render Starter Plan ($7/mo).** Critical upgrade. The backend must be "Always-On" to instantly receive Stripe Webhooks without cold-start timeouts.
- **Database Hosting:** **Render Managed Postgres Basic ($6/mo).** Ensures permanent uptime, bypassing Render's 30-day free database deletion and Supabase's 7-day pause policies.
- **Payments:** Stripe Live Mode.
- **Total Operating Cost:** ~$13/month (approx. LKR 3,900), easily covered by a standard monthly maintenance retainer.

---

## 3. Core System Workflows

### The Customer Journey (Frontend to Backend)

1. **Cart Assembly:** Users browse a mobile-first hybrid grid and add items. Zustand manages the cart. Items marked "Sold Out for Today" are visually disabled.
2. **Guest Checkout & Scheduling:** The user enters basic details (Name, Email, Phone). The frontend calculates the `max_lead_time` from the cart and fetches `business_rules` (blackout dates, daily caps) from the backend. The Date Picker mathematically prevents selecting invalid pickup slots.
3. **Backend Validation:** The frontend sends the payload. FastAPI intercepts and strictly re-validates:

- Is the requested time outside the 48h fermentation window?
- Is the daily order capacity (e.g., 50 orders/day) exceeded?
- Are the database prices matching the payload?

4. **Payment Intent:** If valid, FastAPI creates a `pending` order and generates a Stripe Checkout Session URL.

### The Webhook Flow (Absolute Truth)

1. Customer pays via Stripe.
2. Stripe sends a Webhook to the FastAPI backend.
3. **Security Check:** FastAPI verifies the `Stripe-Signature`.
4. **Idempotency Check:** FastAPI ensures this specific webhook hasn't been processed already.
5. **State Update:** Order status changes from `pending` to `paid`.

### The Admin Flow (Kitchen Dashboard)

1. **Authentication:** Staff log in via `/admin` using individual accounts (Owner/Staff roles) for strict accountability. Shared passwords are not used.
2. **Order Management:** Staff view a real-time list of `paid` orders filtered by date. They move orders through states: `paid` -> `ready_for_pickup` -> `completed`.
3. **Capacity Management:** Instead of a global inventory toggle, staff manage limits via the "Daily Capacity Tracker" and can toggle specific items as "Sold Out for Today."

---

## 4. Database Schema Contract

| Table            | Core Fields                                                             | Purpose                                   |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| `products`       | `id`, `name`, `price`, `lead_time_h`, `is_active`                       | Menu definitions and time constraints.    |
| `business_rules` | `id`, `blackout_dates`, `daily_order_cap`                               | Global kitchen capacity and availability. |
| `orders`         | `id`, `customer_json`, `pickup_datetime`, `status`, `stripe_session_id` | Core order metadata and tracking state.   |
| `order_items`    | `id`, `order_id`, `product_id`, `quantity`                              | Normalized line items.                    |
| `admin_users`    | `id`, `email`, `role`                                                   | Individual staff access control.          |
| `order_history`  | `id`, `order_id`, `changed_by_user_id`, `new_status`                    | Audit trail for order state changes.      |

---

## 5. Strict Operational Guardrails

- **No Client-Side Price Trust:** The React frontend never dictates the final total. FastAPI recalculates all math.
- **Time-Slot Integrity:** Even if a user manipulates the frontend Date Picker, FastAPI will reject the order if it violates the 48-hour rule or daily capacity.
- **No Ghost Orders:** The kitchen only sees an order once the Stripe Webhook explicitly sets it to `paid`.
- **Auditability:** Every manual change to an order's status is logged against a specific staff member's ID.
