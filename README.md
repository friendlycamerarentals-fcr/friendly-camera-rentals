<div align="center">

<img src="public/logo.png" alt="Friendly Camera Rentals" width="120" />

# 📸 Friendly Camera Rentals

### Camera Rental & Sales Marketplace — Rent · Buy · Sell · Book

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-2.x-4A8F29?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

<br />

> A full-stack marketplace for camera equipment and photography services: rental inventory with duration-based pricing, used-gear listings for sale, sell-request intake, service enquiries, a customer rewards programme, and an admin dashboard with booking, payment, reward, and catalog management.

<br />

</div>

---

## Overview

Friendly Camera Rentals (FCR) is a production-style Next.js App Router application for a camera rental and resale business operating in India (all money values are INR).

**Customers** sign in with Google (Firebase Authentication), maintain a profile with a generated customer ID, browse rental gear, build a rental cart, submit booking requests, request rewards on camera rentals, browse and enquire about used gear for sale, submit sell requests with images, request photography/videography services over WhatsApp, and leave testimonials for moderation.

**Administrators** manage the catalog (rental and buy products, drag-and-drop ordering), bookings and rentals (status flow, multi-item manual bookings, verified advance/balance payments, WhatsApp hand-off), customers, rewards (automatic and manual), sell requests, testimonials, hero marquee content, and monitor live dashboard statistics plus a merged "Recent Activity" feed.

The application is a single Next.js project with route handlers as its backend, a SQL-only PostgreSQL data layer (no ORM), and WhatsApp click-to-chat as the confirmation channel after data is persisted.

---

## Features

### Customer Features

| Feature | Description |
| --- | --- |
| Google sign-in | Firebase popup sign-in; the customer record is created/synced on first login and on every session restore |
| Customer profile | `/profile` page with read-only Customer ID and email; editable name, 10-digit mobile, and address; draft persistence in `sessionStorage` |
| Profile-complete gate | A rental booking cannot start until name, phone, and address are filled in; the pending booking resumes automatically after saving |
| Rental browsing | `/rental` with a search field and explicit submit, category filters derived from live data, skeleton loading, error + retry, and empty states |
| Rental product details | `/rental/[id]` gallery, specifications, duration options from the product's `pricing` map, quantity handling, add-to-cart |
| Rental cart | Slide-in cart drawer persisted in `localStorage`, per-product/per-duration line items, quantity increase, removal, running total |
| Two-step booking flow | Step 1 collects booking date (no past dates), pickup time, notes, and ID-proof acknowledgement; step 2 reviews customer, booking, and item summary before confirmation |
| Availability check | Cart is validated against `/api/rental-products/availability` before the booking form opens; unavailable items are removed with a toast |
| Reward redemption at checkout | Active reward is fetched for the signed-in customer and applied as a discount on the first camera item (camera-only eligibility) |
| Booking persistence + WhatsApp | Each cart line is saved as a rental request through `POST /api/rental-requests`, then a prefilled WhatsApp message with booking IDs and payment breakdown is opened |
| Buy browsing | `/buy` with category filters, client-side search, and a product grid fed by `/api/buy-products` |
| Buy product details | `/buy/[slug]` gallery, specifications, accessories, condition/warranty, and WhatsApp purchase enquiry |
| Sell requests | `/sell` multi-section form with brand/model/condition/category selectors, image upload to Cloudinary, and `POST /api/sell-requests` |
| Services | `/services` service catalog, process timeline, FAQ, and a "Book Slot via WhatsApp" form (prefilled message; no DB write) |
| Testimonials | Submission form posting to `/api/testimonials` as `pending`; only `approved` testimonials render on the home page |
| Contact | `/contact` form validated and acknowledged by `POST /api/contact` |
| Legal pages | `/terms` and `/privacy-policy` |
| Global helpers | Floating WhatsApp button, login modal (auto-prompted once per browser for guests after 30s), mobile navigation, splash/loader wrapper, 404 page |

### Admin Features

| Area | Route | Implemented capability |
| --- | --- | --- |
| Dashboard | `/admin` | Seven live count cards (Bookings, Rentals, Buy Products, Sell Requests, Customers, Rewards, Testimonials) and the Recent Activity feed |
| Bookings calendar | `/admin/bookings` | Month calendar with status-tinted days, legend, today shortcut, and per-day booking drill-down |
| Rentals | `/admin/rentals` | Stats, search, status/time filters, sorting, rental table, details modal, WhatsApp reply, delete with guards, and manual multi-item bookings |
| Rental products | `/admin/rental-products` | Stats, filters, table, view modal, availability toggle, delete dialog, drag-and-drop reorder, add/edit forms with image upload and duration pricing |
| Buy products | `/admin/buy-products` (also `/admin/buy`) | Stats, filters, table, view modal, status changes (`In Stock` / `Out of Stock` / `Sold`), delete, reorder, add/edit/detail pages |
| Sell requests | `/admin/sell-requests` (also `/admin/sell` → redirect) | Stats, search, status filter, detail modal, status updates, delete |
| Customers | `/admin/customers` | Search by name / customer ID / phone / email, customer cards, detail modal with reward history |
| Rewards | `/admin/rewards`, `/admin/rewards/[id]` | Statistics, search, status filter, paginated table, reward timeline/details modal, refresh, manual reward creation |
| Testimonials | `/admin/testimonials` | Stats, status tabs, date-range filters, approve/reject, delete with confirmation, detail modal |
| Hero marquee | `/admin/hero-marquee` | Create/edit/delete marquee messages, per-item active toggle, display order, global enable/disable switch (150-character limit) |
| Notifications | Admin header bell | Unread badge, dropdown list, mark one/all read, delete, clear all, notification sound, 10s polling |
| Admin shell | `/admin/*` | Collapsible desktop sidebar, mobile drawer, session-aware header, logout |

### Rental Management

- Rental catalog is stored in `RentalProduct` with a JSONB `pricing` map of duration keys (`1hr`, `3hrs`, `2days`, `1week`, …) to prices.
- The public details page reads duration options from that map and adds the selected duration + price to the cart.
- Admins can create manual bookings (phone/WhatsApp enquiries) for one or more items sharing a single duration, with per-item agreed prices and an optional expected advance.
- Rental requests support a persisted item list (`RentalRequestItem`) so multi-item manual bookings appear with every item in the admin list and details modal.
- Every rental carries a booking source (`Website` or `Manual`) plus audit fields for who created and confirmed it.

### Product Management

- **Rental products** – name, slug, brand, model, category (`camera`, `lens`, `drone`, `gimbal`, `light`, `audio`, `tripod`, `accessories`), description, megapixels, battery count, availability flag, cover + gallery images, and duration pricing (persisted as `specifications` + `pricing` JSONB). Slugs are generated from the product name and `display_order` drives customer-facing order.
- **Buy products** – name, slug, brand, model, category, condition, warranty, status, price, description, cover + gallery images. The API and tables additionally support `discountPrice`, `specifications`, and `accessories`. Status transitions to `Sold` are recorded as durable events.
- **Sell requests** – customer-submitted intake (contact details, city, category, brand, model, purchase year, warranty status, expected price, condition, accessories, description, images) with a `pending` → `contacted` → `approved` / `rejected` review flow.
- **Ordering** – both catalogs can be reordered in admin with `@dnd-kit`; `PUT /api/{resource}/reorder` persists `display_order` inside a transaction, and customer lists render in the saved order.

### Booking & Order Management

1. Customer is authenticated with a complete profile and has items in the cart.
2. Availability is validated; otherwise the cart is pruned with feedback.
3. Each cart line becomes a `RentalRequest` (`Pending`, `paymentStatus` `Pending`) with a generated request ID in the form `FCR-R######`.
4. An optional reward is reserved atomically during creation.
5. Admin opens the booking, confirms it (product availability is re-checked), records verified payments, and progresses the rental.
6. Status transitions are validated server-side; invalid transitions return `409`.
7. An admin can send the customer the persisted booking, payment breakdown, and status update over WhatsApp.

**Rental status flow** (`src/constants/rentalStatus.js`):

```text
Pending    → Confirmed | Approved | Rejected | Cancelled
Confirmed  → Picked Up | Returned | Completed | Rejected | Cancelled
Approved   → Confirmed | Picked Up | Returned | Completed | Rejected | Cancelled
Picked Up  → Returned | Completed | Cancelled
Returned   → Completed | Cancelled
Completed / Rejected / Cancelled → (terminal)
```

### Rewards System

- **Earning** – when a rental becomes `Completed`, the app generates a reward worth **10%** of the final rental amount (`calculateReward`), expiring **3 months** after the rental's last update. Generation is skipped when the rental has no customer, when a reward already exists for that rental, or when the customer still holds an `Active`/`Applied` reward.
- **Reservation** – applying a reward sets it to `Applied` with `appliedRentalId` and `appliedDate`, and recalculates `totalAmount = originalAmount − rewardDiscount − otherDiscount`. The discount is capped at the remaining payable amount.
- **Redemption** – a reward becomes `Used` when its rental is `Completed`; it returns to `Active` (or `Expired` if past its expiry) when the rental is `Cancelled`/`Rejected`.
- **Eligibility** – rewards apply only to camera-category rentals and only one reward may be active or reserved per customer at a time (enforced by partial unique indexes plus `FOR UPDATE` row locks).
- **Expiry** – expired active rewards are swept on reward reads, reward API calls, rental mutations, and the scheduled endpoints `GET|POST /api/cron/expire-rewards` and `POST /api/rewards/expire`.
- **Manual rewards** – admins can grant a reward to an existing customer with an amount and start date. Expiry is start date + 3 months, `source` is `Manual`, `rentalRequestId`/`rentalDate` stay `NULL`, duplicates for the same customer/date/amount are rejected, and customers holding an `Active`/`Applied` reward cannot receive another.
- **Admin visibility** – totals, per-status counts, total reward value, search by reward/customer/contact details, pagination, and a lifecycle timeline (generated → applied → used → expired).

### Customer Management

- Customer records are created automatically the first time a Google account signs in (`POST /api/customers` upserts by email) with a sequential business ID `FCR-C#####` and a new `AdminNotification` of type `new_customer`.
- Customers can update name, phone, and address from `/profile` (`PUT /api/profile`).
- Admins can search/list customers, open a detail modal, and review that customer's reward history.

### Activity & Dashboard

- **Dashboard cards** count rows in `RentalProduct`, `BuyProduct`, `SellRequest`, `RentalRequest`, `Testimonial`, `Customer`, and `Reward`.
- **Recent Activity** (`/api/admin/dashboard/activity` + `buildRecentActivities`) merges the newest rental bookings, pending testimonials, sell requests, and buy-product "marked as sold" events into one time-sorted list (max 10), rendered with relative timestamps, loading skeleton, error/retry, and an empty state. It polls every 30 seconds only while the tab is visible.
- **Admin notifications** are written whenever a rental booking, sell request, testimonial, or new customer arrives, and are surfaced through the header bell.

---

## Technology Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16.2.9 (App Router, route handlers, `src/proxy.js` request proxy) |
| UI runtime | React 19.2.4 / React DOM 19.2.4 |
| Styling | Tailwind CSS v4 with `@tailwindcss/postcss`, custom fonts and theme tokens in `src/app/globals.css` |
| Animation | Framer Motion 12 |
| Icons | Lucide React, React Icons |
| Drag & drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Database | PostgreSQL (Neon) accessed with `pg` — hand-written SQL only, no ORM and no Prisma |
| Customer authentication | Firebase Authentication (`firebase` 12) with Google provider |
| Admin authentication | Environment-configured credentials + HMAC-SHA256 session token in an httpOnly cookie (`src/lib/jwt.js`) |
| Image storage | Cloudinary (`cloudinary` 2) via `/api/upload` and `/api/upload/delete` |
| Notifications / toasts | Sonner |
| Date input | `react-datepicker` (manual reward start date) |
| Counters | `react-countup` + `react-intersection-observer` |
| Messaging | WhatsApp `wa.me` click-to-chat links |
| Analytics | Google Tag Manager snippet in `src/app/layout.js` |
| Linting | ESLint 9 with `eslint-config-next` (core-web-vitals) |
| Tests | Node's built-in test runner (`node:test`) for pure library logic |

---

## Project Structure

```text
fcr/
├── database/
│   ├── init.sql                     # Full schema: tables, constraints, indexes, sequences,
│   │                                # ID triggers, reward trigger, expiry function, views,
│   │                                # plus later dated additions (payments, items, manual rewards)
│   └── migrations.sql               # Incremental, idempotent schema change log
├── public/
│   ├── fonts/                       # Arial + Palatino font files used by globals.css
│   ├── hero/, images/               # Marketing imagery
│   ├── sounds/admin-notification.mp3
│   └── logo.png, favicon.ico
├── src/
│   ├── app/
│   │   ├── (admin)/admin/           # Admin dashboard pages (see Application Routes)
│   │   ├── (auth)/admin/login/      # Admin sign-in screen
│   │   ├── api/                     # Route handlers grouped by resource
│   │   ├── buy/, buy/[slug]/        # Buy catalog + product detail
│   │   ├── rental/, rental/[id]/    # Rental catalog + product detail
│   │   ├── sell/, services/         # Sell intake + service enquiry pages
│   │   ├── contact/, profile/       # Contact form, customer profile
│   │   ├── terms/, privacy-policy/  # Legal pages
│   │   ├── layout.js                # Providers, GTM, Sonner, metadata
│   │   ├── page.js                  # Home page (server-rendered testimonials)
│   │   ├── not-found.jsx
│   │   └── globals.css              # Tailwind entry, theme tokens, admin/reward calendar styles
│   ├── components/
│   │   ├── admin/                   # Admin UI by feature (rentals, rewards, products, …)
│   │   ├── auth/                    # Login modal + Google button
│   │   ├── buy/, rental/, sell/, services/, testimonials/, contact/, home/, legal/
│   │   ├── cart/                    # Cart drawer, item, 2-step booking modal
│   │   ├── common/                  # Uploader, avatar, loaders, floating WhatsApp
│   │   ├── layout/                  # Navbar, footer, layout wrapper
│   │   └── ui/                      # Counter, list skeleton
│   ├── constants/                   # Rental status transitions, reward status/limits
│   ├── context/                     # Auth, cart, booking flow, admin notifications
│   ├── data/                        # Static content (services used by the home page)
│   ├── db/                          # Pool, query wrapper, transaction helpers
│   ├── hooks/                       # useFetchData, useRewards
│   ├── lib/                         # Business logic and helpers (see below)
│   │   └── rewards/                 # Apply, generate, expire, validate, manual, dates
│   ├── services/rewardService.js    # Reward facade used by API routes
│   └── proxy.js                     # Route/method guards for admin pages and APIs
├── AGENTS.md
├── FCR_DATABASE_UPDATES.sql         # Consolidated schema file (also defines HeroMarquee tables)
├── SERVICE_BOOKING_IMPLEMENTATION.md# Historical design note for an older service-booking module
├── next.config.mjs                  # Remote image host allow-list
└── package.json
```

Notable helpers in `src/lib/`:

| File | Purpose |
| --- | --- |
| `db` layer (`src/db/query.js`) | `query`, `getClient`, `transaction`, `runTransactionWithClient`; returns `[]` when no database URL is configured |
| `rentalDuration.js` | Pricing-key parsing, custom duration validation, paise-based money math |
| `rentalPayment.js` / `rentalPayments.js` | Payment validation and derived payment summaries |
| `rewards/*` | Reward lifecycle, eligibility, manual reward validation, expiry |
| `adminActivity.js` / `recentActivityPresentation.js` | Activity merging, view-state and polling logic |
| `whatsappBookingMessage.js` | WhatsApp message builder from persisted booking data |
| `dataCache.js` | In-memory TTL cache (30s) with in-flight de-duplication for GET requests |
| `customerId.js` / `rentalRequestId.js` / `createId.js` | Business ID generation and UUID helper |
| `jwt.js` / `adminAuth.js` | Admin token signing/verification and `requireAdmin()` |
| `cloudinary.js` / `upload.js` | Cloudinary client and browser-side upload helper |

---

## Application Routes

### Customer-facing

| Route | Description |
| --- | --- |
| `/` | Home: hero with marquee, featured products, services, categories, why-choose-us, CTA, approved testimonials |
| `/rental` | Rental catalog with search and category filters |
| `/rental/[id]` | Rental product details (accepts product ID or slug) |
| `/buy` | Buy catalog with filters |
| `/buy/[slug]` | Buy product details |
| `/sell` | Sell request landing page + form |
| `/services` | Photography/videography services + WhatsApp booking form |
| `/contact` | Contact page |
| `/profile` | Customer profile (redirects guests to `/`) |
| `/terms`, `/privacy-policy` | Legal content |

### Admin

| Route | Description |
| --- | --- |
| `/admin/login` | Admin sign-in |
| `/admin` | Dashboard with statistics and Recent Activity |
| `/admin/bookings` | Booking calendar |
| `/admin/rentals` | Rental request management + manual booking |
| `/admin/rental-products` | Rental catalog list |
| `/admin/rental-products/add` | Add rental product |
| `/admin/rental-products/edit/[id]` | Edit rental product |
| `/admin/buy-products` | Buy catalog list |
| `/admin/buy-products/add` | Add buy product |
| `/admin/buy-products/[id]` | Buy product detail |
| `/admin/buy-products/edit/[id]` | Edit buy product |
| `/admin/buy` | Alias of `/admin/buy-products` |
| `/admin/sell-requests` | Sell request management |
| `/admin/sell` | Redirects to `/admin/sell-requests` |
| `/admin/customers` | Customer directory |
| `/admin/rewards` | Reward management |
| `/admin/rewards/[id]` | Reward detail page |
| `/admin/testimonials` | Testimonial moderation |
| `/admin/hero-marquee` | Hero marquee content management |

All `/admin/*` pages except `/admin/login` require a valid admin session.

---

## API

Access rules are enforced in `src/proxy.js`, with `requireAdmin()` used additionally inside the most sensitive handlers.

### Public catalog & content

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/rental-products` | GET | List rental products (`?search=`, `?category=`), ordered by `display_order` |
| `/api/rental-products/[id]` | GET | Single rental product |
| `/api/rental-products/availability` | POST | Batch availability check used by the cart (public by design, read-only) |
| `/api/buy-products` | GET | List buy products |
| `/api/buy-products/[id]` | GET | Single buy product |
| `/api/testimonials` | GET, POST | List testimonials (`?status=`); submit a `pending` testimonial |
| `/api/hero-marquee` | GET | Active marquee messages in display order |
| `/api/hero-marquee/settings` | GET | Global marquee enabled flag |
| `/api/contact` | POST | Validate and acknowledge a contact message (no persistence, no email) |
| `/api/customers` | POST | Customer sync/upsert after Google sign-in |
| `/api/profile` | GET, PUT | Read/update the signed-in customer's profile (`x-user-email` header) |
| `/api/rental-requests` | POST | Create a rental booking request |
| `/api/sell-requests` | POST | Create a sell request |
| `/api/rewards/check` | POST | Check whether a customer has a usable reward |
| `/api/rewards/apply` | POST | Reserve a reward against an existing rental |

### Admin-protected

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/admin/login` | POST | Credential check, issues `admin_auth` cookie |
| `/api/admin/logout` | POST | Clears the admin cookie |
| `/api/admin/session` | GET | Current admin email |
| `/api/admin/notifications` | GET, POST | List notifications; actions `mark-read`, `mark-all-read`, `delete`, `clear-all` |
| `/api/admin/rentals` | POST | Create a manual multi-item rental booking (pending or confirmed) |
| `/api/admin/dashboard/activity` | GET | Merged Recent Activity feed |
| `/api/rental-requests` | GET | All rental requests with items and payment summaries |
| `/api/rental-requests/[id]` | PATCH, DELETE | Status transitions, payment recording, amount edits, deletion |
| `/api/rental-products` | POST | Create rental product |
| `/api/rental-products/[id]` | PUT, DELETE | Update/delete rental product |
| `/api/rental-products/reorder` | PUT | Persist `display_order` |
| `/api/buy-products` | POST | Create buy product |
| `/api/buy-products/[id]` | PUT, DELETE | Update/delete buy product (records sold events) |
| `/api/buy-products/reorder` | PUT | Persist `display_order` |
| `/api/customers` | GET | List/search customers |
| `/api/customers/[id]` | GET, PUT, DELETE | Customer record operations |
| `/api/sell-requests` | GET | List sell requests |
| `/api/sell-requests/[id]` | GET, PUT, DELETE | Review/update/delete sell request |
| `/api/testimonials/[id]` | PUT, DELETE | Approve/reject/delete testimonial |
| `/api/rewards` | GET, POST | List rewards with statistics; create a manual reward |
| `/api/rewards/[id]` | GET, PATCH, DELETE | Reward detail, limited field updates, delete |
| `/api/rewards/generate` | POST | Generate a reward for a completed rental |
| `/api/rewards/expire` | POST | Expire rewards past their expiry date |
| `/api/hero-marquee` | POST | Create marquee item |
| `/api/hero-marquee/[id]` | PUT, DELETE | Update/delete marquee item |
| `/api/hero-marquee/settings` | PUT | Toggle marquee visibility |
| `/api/upload` | POST | Upload an image to Cloudinary (`fcr/<folder>`) |
| `/api/upload/delete` | POST | Delete a Cloudinary asset by `publicId` |
| `/api/cron/expire-rewards` | GET, POST | Scheduled reward expiry endpoint (no cron configuration is committed) |

---

## Database

The data layer is plain PostgreSQL. Every statement in `database/*.sql` is idempotent (`IF NOT EXISTS`, guarded constraints), and no destructive statement (`DROP TABLE`, `TRUNCATE`, `DELETE FROM`) is used.

### Models

| Table | Purpose and key fields |
| --- | --- |
| `RentalProduct` | Rental catalog; unique `slug`, `category`, `brand`, `model`, `available`, `images`/`specifications`/`pricing` JSONB, `display_order` |
| `RentalRequestItem` | Items of a booking; `rentalRequestId`, `productId`, `durationDisplay`, negotiated `rentalPrice`, `isCustomDuration`, `isCustomPrice`, `itemOrder` |
| `RentalRequest` | One booking; unique `requestId` (`FCR-R######`), customer and contact details, product snapshot, `rentalDuration`, `quantity`, `originalAmount`, `rewardId`, `rewardDiscount`, `discount`, `advanceAmount`, `status`, `paymentStatus`, `bookingSource`, verified-advance audit fields, `createdByAdmin`, `confirmedByAdmin` |
| `RentalPayment` | Auditable payment ledger; `paymentType` (`Advance`/`Balance`), `amount`, `method`, `reference`, `verified`, `verifiedAt`, `verifiedBy`, `idempotencyKey` (unique per request) |
| `Customer` | Unique `customerId` (`FCR-C#####`) and unique `email`, `name`, `profileImage`, `phoneNumber`, `address` |
| `BuyProduct` | Sale catalog; unique `slug`, `status` (`In Stock`/`Out of Stock`/`Sold`), `price`, `discountPrice`, `condition`, `warranty`, JSONB specs/accessories, `display_order` |
| `BuyProductSoldEvent` | Immutable record of a product transitioning to `Sold` (`productId`, `productName`, `previousStatus`, `newStatus`, `occurredAt`); intentionally has no FK |
| `SellRequest` | Sell intake with contact, device, condition, `expectedPrice`, `images`, `status` |
| `Testimonial` | `name`, `designation`, `image`, `rating`, `review`, `status` (`pending`/`approved`/`rejected`), `featured` |
| `Reward` | Unique `rewardId` and `rentalRequestId`, `customerId`, `customerRecordId`, `rewardPercentage`, `rewardAmount`, nullable rental context for manual rewards, `status`, `expireDate`, `appliedRentalId`, `appliedDate`, `usedDate`, `expiredDate`, `generatedAt`, `source` |
| `AdminNotification` | Admin inbox rows (`type`, `title`, `message`, `relatedId`, `relatedType`, `read`) |
| `HeroMarquee` | Home-page marquee messages (`text`, `isActive`, `display_order`) |
| `HeroMarqueeSettings` | Single `global` row with `isEnabled` |
| `ServiceBooking` | Defined in the schema (service enquiry fields + `status`), currently not written to by any application route |

### Relationships

- `RentalRequest.customerId` → `Customer.id` (`ON DELETE SET NULL`); business flows also match on `Customer.customerId`.
- `RentalRequestItem.rentalRequestId` → `RentalRequest.requestId` (`ON DELETE CASCADE`).
- `RentalPayment.rentalRequestId` → `RentalRequest.requestId` (`ON DELETE RESTRICT`).
- `Reward.rentalRequestId` and `Reward.appliedRentalId` → `RentalRequest.requestId`; `Reward.customerRecordId` → `Customer.id`.
- `RentalRequest.productId` is deliberately **not** a foreign key (polymorphic reference enforced in application code).
- Partial unique indexes guarantee one `Active` reward per customer, and — when existing data is clean — one `Active`/`Applied` reward per customer.

### Database-side automation

- Sequences + trigger functions generate `FCR-C#####`, `FCR-R######`, and `RWD-######` IDs on insert when the application leaves them empty.
- `updatedAt` triggers on the main tables.
- `after_rental_completed_create_reward` creates a 10% reward with a 3-month expiry when a rental transitions to `Completed` and no reward exists for it.
- `fn_expire_rewards()` expires overdue active rewards.
- Report views: `view_admin_dashboard_summary`, `view_rental_revenue_by_month`, `view_top_rental_products`, `view_customer_reward_summary`.

---

## Authentication

### Customers — Firebase Google sign-in

1. `LoginModal` triggers `signInWithPopup` with the Google provider (`src/context/AuthContext.jsx`).
2. The signed-in user is synced to the `Customer` table via `POST /api/customers` (idempotent upsert keyed on lower-cased email, guarded by a PostgreSQL advisory lock and a sequential customer ID).
3. The profile is loaded from `GET /api/profile` using an `x-user-email` header and cached for 60s.
4. Session state is restored by `onAuthStateChanged`; profile completeness (`name`, `phoneNumber`, `address`) gates rental bookings.
5. Sign-out clears Firebase auth and all cached profile state.

### Admins — password credentials + signed cookie

- `POST /api/admin/login` compares submitted credentials with `ADMIN_EMAIL`/`ADMIN_PASSWORD` and the optional second pair `ADMIN_EMAIL_2`/`ADMIN_PASSWORD_2`. If only one variable of the second pair is configured, login fails closed with a configuration error.
- On success it signs a payload containing `{ role: "admin", email }` with HMAC-SHA256 and stores it in the `admin_auth` cookie (`httpOnly`, `sameSite=lax`, `secure` in production, lifetime from `JWT_EXPIRES_IN`, default `7d`).
- Tokens are verified with a fixed lifetime (never refreshed per request) and must have a valid `exp` claim; invalid tokens are rejected and the cookie is cleared.
- `src/proxy.js` guards `/admin/*` pages (redirect to `/admin/login`) and the protected API path groups (401 JSON), while allowing the explicitly public methods listed in the API section.
- Sensitive handlers (`rental-requests/[id]`, `admin/rentals`, dashboard activity, rewards admin routes, customer/notification routes) additionally call `requireAdmin()`.

---

## Integrations

| Service | Usage |
| --- | --- |
| **Firebase Authentication** | Google sign-in for customers (`src/lib/firebase.js`, `AuthContext`) |
| **Cloudinary** | Product images, sell-request images, and gallery uploads; upload/delete endpoints; `res.cloudinary.com` allowed in `next.config.mjs` |
| **Neon PostgreSQL** | Primary datastore over `pg` with SSL enabled automatically for Neon hostnames (`DATABASE_URL` or `POSTGRES_URL`) |
| **WhatsApp (`wa.me`)** | Click-to-chat for rental bookings, buy enquiries, service enquiries, admin responses, and the floating contact button |
| **Google Tag Manager** | Loaded in the root layout with the configured container |
| **Remote images** | Image hosts used by seed/demo data are allow-listed in `next.config.mjs`; local font files are served from `public/fonts` |

No payment gateway, email provider, SMS gateway, maps, or shipping integration is implemented. Payments are recorded manually by admins as verified ledger entries.

---

## UI/UX

- **Design system** – dark, amber-accented theme (`#F5A623`) with glassmorphism panels, gradient glows, rounded cards, and custom `InterLocal`/`CormorantLocal` fonts declared in `globals.css`.
- **Motion** – Framer Motion page/card animations, staggered lists, spring-based modals, and animated drawers.
- **Responsive layouts** – mobile-first grids, safe-area-aware padding for notched devices, `dvh`-based full-height panels, and viewport `viewportFit: cover`.
- **Navigation** – sticky public navbar with cart badge and profile avatar, animated mobile menu, and a one-time login prompt for guests; collapsible admin sidebar (preference persisted in `localStorage`) plus a mobile drawer with backdrop, Escape handling, and scroll locking.
- **Booking UX** – portal-rendered cart drawer and 2-step booking modal with progress indicator, per-step validation, review summary, and persisted draft so a login/profile detour does not lose the booking.
- **Loading states** – product-list skeletons, reward skeleton rows, testimonial skeleton cards, activity skeleton, and splash/loader wrapper.
- **Empty & error states** – dedicated empty states for cart, catalog search, customers, testimonials, rewards, and recent activity; retry actions on catalog and activity failures.
- **Feedback** – Sonner toaster (dark theme, top-center) for success/error/warning messages, plus optimistic UI updates followed by refetch across admin tables.
- **Modals & dialogs** – rental details with allowed status transitions, item list, reward details, and payment panel; reward details with lifecycle timeline; customer detail with reward history; sell request and testimonial detail modals; and confirmation dialogs for destructive actions.
- **Visual status cues** – colour-coded badges for rental/reward/sell/testimonial statuses, and a calendar that tints each day by the statuses of its bookings (legend included).
- **Admin polish** – animated statistic cards, responsive data tables, drag-and-drop reorder modal, notification bell with unread badge and sound.
- **Accessibility touches** – labelled icon buttons, `aria-live` regions for activity, `role="alert"` error blocks, and keyboard dismissal of admin drawers.

---

## Business Logic

| Area | Implemented rule |
| --- | --- |
| Rental pricing | Duration prices come from `RentalProduct.pricing` JSONB keys parsed by `parsePricingKey` (`hr`/`hrs` → Hours, `week` → 7 Days). Custom durations must be whole numbers: 1–720 hours or 1–90 days. |
| Money precision | All sums, comparisons, and stored amounts are computed through paise (integer cents) helpers to avoid float drift. |
| Cart totals | Line total = unit price × quantity; the reward discount is capped at the first camera item's line total. |
| Booking creation | Requires an existing `customerId`, complete contact fields, an available product, and at least one item detail. Duplicate active bookings (same product, phone, date, pickup time, duration) return `409`. |
| Booking IDs | `FCR-R######` derived from the highest existing numeric request ID (minimum `100001`); customer IDs `FCR-C#####` from `10000`; reward IDs `FCR-R100001`-style via the reward service. |
| Manual rentals | Existing registered customer only (never auto-created), 1–20 items, one shared standard or custom duration, per-item agreed price, future booking date, required pickup time, expected advance ≤ final amount. A pending booking stores only the expectation; confirming with an advance records exactly one verified `Advance` payment matching that expectation. |
| Rental status guards | Transitions must follow `RENTAL_STATUS_TRANSITIONS`; confirmation re-checks product availability and stamps `confirmedByAdmin`; terminal statuses cannot move. |
| Payments | Ledger entries accept only `Cash` or `UPI`, must be positive, cannot exceed the remaining balance, and require a per-request `idempotencyKey` (a retry with the same key and payload is accepted; a changed payload is rejected). `paymentStatus` becomes `Advance Paid` or `Paid` from verified totals only. |
| Advance integrity | `PATCH /api/rental-requests/[id]` rejects direct `advanceAmount` writes; the stored advance, verified total, and remaining amount are always derived from verified ledger rows. |
| Amount edits | `originalAmount` and `discount` can be edited, but the final amount cannot go negative and cannot drop below already-recorded payments. |
| Deletion guards | Rentals linked to a reward (or carrying a reward discount or generated reward) and rentals with recorded payments cannot be deleted; they must be cancelled/rejected to preserve history. |
| Reward earning | 10% of the final rental amount, valid 3 months from the completion timestamp; skipped if the rental has no customer, already has a reward, or the customer holds an `Active`/`Applied` reward. |
| Reward redemption | Camera-category rentals only; discount = `min(rewardAmount, originalAmount − otherDiscount − advance)`; rewards move `Active` → `Applied` → `Used`, and are released back to `Active`/`Expired` when a rental is cancelled or rejected. |
| Reward expiry | Active rewards past `expireDate` become `Expired` with `expiredDate` set, both by application sweeps and the SQL function. |
| Manual rewards | Positive amount with at most 2 decimals, valid calendar start date, expiry = start + 3 months, status decided by comparing expiry to now, duplicate customer/date/amount combinations rejected, one outstanding reward per customer. |
| Buy product status | Normalised to `In Stock` / `Out of Stock` / `Sold`; only a genuine transition into `Sold` writes a `BuyProductSoldEvent`, which then appears in Recent Activity. |
| Sell request flow | `pending` → `contacted` → `approved` / `rejected`, with public submission creating an admin notification. |
| Testimonial moderation | Submissions are always created as `pending`; the home page queries only `approved` rows; admins may approve, reject, or delete. |
| Notifications | New rental booking, sell request, testimonial, and customer each create an `AdminNotification`; admins can mark read, delete individually, or clear all. |
| Cache behaviour | Catalog, testimonial, marquee, customer, and sell-request GETs use a 30s in-memory cache with in-flight de-duplication; writes invalidate the affected prefixes. |

---

## Installation

Requirements: Node.js (a version supported by Next.js 16), npm, and a PostgreSQL database (Neon or any Postgres instance). The `psql` client is only needed if you use the `db:*` helper scripts.

```bash
git clone https://github.com/your-username/fcr.git
cd fcr
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Then fill in the values described in the next section.

---

## Environment Variables

```env
# Database (either name is accepted; DATABASE_URL takes precedence)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Admin credentials (the second pair is optional)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-admin-password"
ADMIN_EMAIL_2="second-admin@example.com"
ADMIN_PASSWORD_2="another-password"

# Admin session
JWT_SECRET="a-long-random-secret"
JWT_EXPIRES_IN="7d"

# Firebase (customer Google sign-in)
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""

# Cloudinary (server-side uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

Notes:

- `POSTGRES_URL` is accepted as a fallback for `DATABASE_URL`.
- `JWT_EXPIRES_IN` accepts a positive duration in `s`, `m`, `h`, or `d`; it must be server-side (no `NEXT_PUBLIC_` prefix).
- Cloudinary uses the server-only `CLOUDINARY_*` names — there is no `NEXT_PUBLIC_CLOUDINARY_*` variable in this codebase.
- Never commit `.env.local`; the repository `.gitignore` excludes it.

---

## Development

Apply the database schema first, then start the dev server.

```bash
# Option 1: helper scripts (requires psql on PATH)
npm run db:init      # database/init.sql
npm run db:migrate   # database/migrations.sql

# Option 2: run the SQL files manually in the Neon SQL editor / any Postgres client
#   database/init.sql, then database/migrations.sql, then the HeroMarquee block
#   from FCR_DATABASE_UPDATES.sql if you use the marquee feature.

npm run dev          # http://localhost:3000
npm run lint         # ESLint (next/core-web-vitals)
```

Run the unit tests (Node's built-in runner — the project does not define an `npm test` script):

```bash
node --test "src/**/*.test.js"
```

---

## Production / Deployment

The project is a standard Next.js application and can be deployed to any Node.js host that supports Next.js 16, or to Vercel. No deployment configuration file (`vercel.json`, Dockerfile, or CI workflow) is committed, so platform setup is done through the hosting provider.

```bash
npm run build
npm start            # serves the production build
```

Deployment checklist:

1. Configure every environment variable for the target environment (`NEXT_PUBLIC_*` values are baked in at build time).
2. Apply `database/init.sql`, `database/migrations.sql`, and — for the marquee feature — the `HeroMarquee`/`HeroMarqueeSettings` block from `FCR_DATABASE_UPDATES.sql` to that environment's database **before** deploying code that depends on them. Confirm `DATABASE_URL` points at the intended database first; development, staging, and production may not share a schema.
3. Keep `JWT_SECRET` secret and stable per environment, and set `JWT_EXPIRES_IN=7d` server-side.
4. Schedule a daily call to `/api/cron/expire-rewards` (Vercel Cron or any scheduler) so rewards expire even when no admin visits the dashboard. Alternatively enable `pg_cron` and schedule `SELECT fn_expire_rewards();`.

---

## Important Notes

- **Schema file placement.** `database/init.sql` is the complete initial schema (including the newer payment, multi-item, manual-reward, and sold-event additions plus the report views). `database/migrations.sql` is the incremental, idempotent change log for existing databases. `HeroMarquee` and `HeroMarqueeSettings` are **only** defined in `FCR_DATABASE_UPDATES.sql`, so a database built from `init.sql` alone needs that block before the marquee admin page works. `FCR_DATABASE_UPDATES.sql` is the older consolidated file and does not contain the most recent additions.
- **No ORM.** There is no Prisma schema or migration tooling. All queries go through `src/db/query.js`.
- **Reward ID prefixes.** Application-generated rewards use `FCR-R######` (`src/constants/rewardStatus.js`), while the SQL trigger function in `database/init.sql` inserts `RWD-######`. Both paths avoid duplicates through the unique `rentalRequestId` constraint, but the prefixes differ if the database trigger fires.
- **Service bookings and contact messages are not persisted.** The services form and the contact form open/acknowledge messages over WhatsApp and the contact endpoint respectively; the `ServiceBooking` table and the older `SERVICE_BOOKING_IMPLEMENTATION.md` note describe a module whose API routes and admin pages are no longer present in this codebase.
- **Customer identity is client-asserted.** `/api/profile` trusts the `x-user-email` header, and the customer sync endpoint is intentionally public so first-time Google sign-ins can create their record. There is no server-side Firebase token verification in this project.
- **WhatsApp number is hard-coded** in the cart, floating button, services form, and buy details components; it is not an environment variable.
- **Payments are manual.** Cash/UPI receipts are recorded and verified by an admin; no payment gateway, refunds, or invoicing exists.
- **Unused dependencies.** `next-auth` and `socket.io`/`socket.io-client` are listed in `package.json` but are not imported anywhere in `src/`.
- **Backup files.** Several `.bak` files (`src/app/api/contact/route.js.bak`, `src/app/rental/page.jsx.bak`, `src/components/admin/rental-products/RentalProductForm.jsx.bak`) and a root-level `test_security.js` remain in the working tree and are not part of the build.

---

## Future Improvements

Grounded in gaps visible in the current code:

- Persist service booking enquiries and contact messages in the database (the `ServiceBooking` table already exists) instead of relying on WhatsApp.
- Add a `/api/services` route group and matching admin page, or remove the unused `ServiceBooking` table and stale implementation note.
- Add server-side verification of customer identity (Firebase ID token) instead of trusting the `x-user-email` header.
- Add an `npm test` script and a CI workflow for the existing `node:test` suites.
- Move the WhatsApp business number into configuration and remove unused dependencies (`next-auth`, `socket.io*`) and leftover `.bak` files.
- Surface date-range availability (not just the `available` flag) so overlapping rentals of the same item are prevented.

---

## License

No license is specified for this repository. Add a `LICENSE` file if you intend to open-source it.
