# Agent Instructions
This file is the source of truth for any coding agent working in this repository. Read it before touching code. If a more local `AGENT.md` exists in a subdirectory, prefer the closer file for that specific area.

## 0. Project Context
**Crumb & Crust** is a single-tenant pre-order and kitchen management system for an artisanal bakery in Fitzroy, Melbourne. It is not a generic storefront — it exists to enforce three physical/operational constraints that a notepad used to track by hand:
- A **minimum 48-hour fermentation lead time** on sourdough/fermented products, enforced at checkout.
- A **daily order capacity cap** (~50 orders/day).
- **Blackout dates** (holidays, rest days) during which no pickup can be booked.

Two user types: anonymous **customers** (browse → cart → guest checkout → Stripe → confirmation) and authenticated **bakery staff** (`/admin` kitchen dashboard, individual logins, no shared credentials).

**Current focus:** the backend API is fully built and considered stable. The frontend is mid-wiring — existing components need to be connected to each other and to the backend (see Section 7). Do not re-architect finished backend routes while doing frontend wiring work unless a bug is found.

## 1. Stack & Architecture
- **Backend:** Python + FastAPI (async), Pydantic for request/response validation
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS, mobile-first
- **Client state:** Zustand (cart state only — do not introduce Redux/Context for this)
- **Database:** PostgreSQL (relational integrity matters here — this handles money and order state, not a place for schema-less shortcuts)
- **Payments:** Stripe Hosted Checkout + webhook (`/api/webhooks/stripe`)
- **Package Manager:** npm (frontend), pip (backend)

**Rule:** The stack is locked unless explicitly changed by the user. Do not propose alternatives (e.g. swapping Zustand for Redux, or FastAPI for Flask) without a stated, structural reason.

## 2. Dependency Policy
**Default: Write it yourself.** Reach for a library only when the alternative would be non-trivial, error-prone, or reinvention of a complex standard. Every dependency is a liability.
- **OK to add:** Things that are genuinely hard to get right (Stripe SDK, JWT/auth libraries, Postgres drivers/ORM, date/timezone handling for the lead-time and blackout-date logic).
- **Not OK to add:** A date-picker UI kit, form-validation wrapper, or state-management library beyond Zustand for a few lines of standard logic.
Before adding a runtime dependency, explain in the prompt or commit message:
1. What exactly does it do that cannot be written in <30 lines of clear code?
2. What is its maintenance and transitive-dependency footprint?

## 3. Configuration & Environment
- A single settings module (backend: e.g. `config.py` loaded via Pydantic `BaseSettings`; frontend: a single `env.js`/`config.ts`) is the source of truth for environment values.
- Do not call `os.getenv` or `import.meta.env` directly in random app code — read through the settings module.
- Fail fast on startup if required config is missing (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, JWT signing secret, etc.). No silent fallbacks to test keys or defaults.
- Never commit secrets, API keys, `.env` files, or generated credentials. Stripe keys and JWT secrets are especially sensitive — never log them, even at debug level.

## 4. Zero-Trust Frontend — Non-Negotiable
This is the single most important architectural rule in this codebase: **the backend trusts nothing the frontend sends except raw input.**
- The frontend may display prices, lead times, and available slots for UX purposes only. The backend independently recalculates prices from the DB, re-validates the 48h lead time, re-checks capacity, and re-validates every product ID on every write.
- Never "trust" a value from the request body for anything financial or scheduling-related just because the frontend already validated it. If you're writing backend code that skips a check because "the frontend already handles that," stop — that's the bug class this system exists to prevent.
- `GET /api/business-rules` (blackout dates, hours, capacity) is UX convenience data for disabling invalid date-picker slots client-side. It is never a substitute for server-side validation in `POST /api/orders`.
- The success page must confirm order status via a backend lookup by Stripe session ID — never trust `?status=paid`-style URL params directly.

## 5. Code Style & Philosophy
- **Make the smallest correct change.** Fix root causes over adding hacks — e.g. the `addToCart` duplication bug should be fixed by correcting the increment logic, not papered over by deduplicating at render time.
- **Small, obvious functions.** A 15-line function with clear names beats a three-class abstraction.
- **No premature abstraction.** Three similar lines is better than a badly-named base class. Extract only when there's a third caller. `ProductCard` and `FeaturedProductCard` sharing some logic is not automatically a shared-base-component situation — only extract if a genuine third variant appears.
- **No backwards-compat shims or feature flags** unless explicitly asked for.
- **Comments:** Explain *why* when non-obvious (e.g. why lead time is calculated from cart contents, why capacity is checked server-side twice), never *what*. Remove stale TODOs.
- **Security:** Sanitize untrusted input. Validate at boundaries — HTTP input, the Stripe webhook payload (always verify the signature before trusting the event), and DB writes.

## 6. Domain Rules to Preserve
These are the rules the whole system exists to enforce. Any change touching checkout, scheduling, or order state must keep them intact:
- Lead time is derived from the **maximum** required fermentation window across all items currently in the cart, not a fixed constant.
- Order status only moves forward through `pending → paid → ready_for_pickup → completed`, driven by the Stripe webhook (`pending → paid`) and admin dashboard actions (`paid → ready_for_pickup → completed`). Don't add ways to skip or reverse states without being asked.
- Every admin status change is written to `order_status_history` with the acting staff member's ID and a timestamp. If you add a new status-changing code path, it must log to this table too — no exceptions.
- Staff accounts are individual; never introduce a shared/admin-wide credential or bypass login for convenience during development.

## 7. Current Build Status (update as work lands)
**Backend:** all routes in the table below are built and working. Treat as stable unless a bug is found.
`GET /api/menu`, `GET /api/business-rules`, `POST /api/orders`, `POST /api/webhooks/stripe`, `POST /api/admin/login`, `GET /api/admin/orders`, `PATCH /api/admin/orders/{id}/status`.

**Frontend — actively being wired:**
- `App.jsx` fetches menu data but doesn't yet pass it down to where it's needed.
- `MenuFilter` tab state is local only — not yet filtering `ProductGrid`.
- `AddToCartButton` click handler exists but isn't calling into `useCartStore`.
- `useCartStore.addToCart` currently pushes duplicate entries instead of incrementing quantity for an existing item — needs a fix, not a workaround.
- `Navbar` cart badge isn't reading from `useCartStore` yet.
- Already fixed: menu fetch URL protocol bug, and price formatting (float → display string) in `ProductGrid`.

**Not started yet** (don't assume these exist): guest checkout form, date/time picker wired to `/api/business-rules`, Stripe redirect flow, success/confirmation page, admin login page, kitchen dashboard.

When picking up wiring work, prefer finishing one full path (e.g. add-to-cart → cart count → cart contents) end-to-end over touching many components partially.

## 8. Development Workflow & Git
- Respect existing formatting and lint rules.
- Reuse existing UI components (`ProductCard`, `FeaturedProductCard`, etc.) and the existing `useCartStore` pattern before creating new ones.
- Keep commits focused and logically grouped (e.g. "fix addToCart increment bug" separate from "wire Navbar badge to store"). Do not rewrite history unless asked.
- Run the smallest relevant tests while iterating; for backend changes touching order/payment logic, prefer testing the specific validation path (lead time, capacity, webhook signature) over a full suite run.

## 9. Final Handoff Format
When finishing a task, provide a brief summary containing:
1. Summary of changes made.
2. Files changed.
3. Validation/Tests performed.
4. Unresolved risks, assumptions, or missing config.
