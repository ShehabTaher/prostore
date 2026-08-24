# Prostore

A full-stack e-commerce storefront built with **Next.js**, following Brad Traversy’s Prostore course.

**Progress:** Sections **1–3** complete · currently moving into Section 4.

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | Prisma |
| Auth | NextAuth *(Section 4)* |
| Payments | PayPal *(Section 8)*, Stripe *(Section 15)* |

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Course roadmap

Each section below explains **what you build** and **why it matters**. Completed sections are marked ✅.

### ✅ Section 1 — Introduction

**Goal:** Understand the project goals, final app features, and how the course is structured.

**What you learn**
- Overview of the Prostore e-commerce app (shop, cart, checkout, admin)
- Tools and services used across the course
- How the finished product should look and behave

**Outcome:** Clear mental model of the app before writing code.

---

### ✅ Section 2 — App Creation & Basic Layout

**Goal:** Bootstrap the Next.js app and build the shared UI shell.

**What you build**
- Next.js app with TypeScript and Tailwind CSS
- Global layout, metadata, fonts, and theme provider (`next-themes`)
- Shared **header** (logo, nav, cart/user placeholders) and **footer**
- Dark / light **mode toggle**
- shadcn/ui components (Button, Sheet, Dropdown, Card, etc.)
- Custom **loading** and **not-found** pages
- App constants (`APP_NAME`, description, etc.)
- Early product UI from sample data: `ProductList`, `ProductCard`, `ProductPrice`

**Key folders after this section**
```
app/
  (root)/          # main storefront layout + home page
  layout.tsx       # root layout + ThemeProvider
  loading.tsx
  not-found.tsx
components/
  shared/header/   # header, menu, mode toggle
  shared/product/  # product list, card, price
  ui/              # shadcn primitives
db/
  sample-data.ts   # temporary product data
lib/
  constants/       # app name, description, etc.
```

**Outcome:** A working storefront shell that lists featured products from sample data.

---

### ✅ Section 3 — Database, Prisma & Product Display

**Goal:** Replace sample data with a real database and persist products.

**What you build**
- Prisma setup and schema (products, users, etc.)
- Database connection and seeding from sample data
- Server actions to fetch latest products and a product by slug
- Product details page by slug (`/product/[slug]`)
- Product image gallery and stronger typing / validators

**Key folders after this section**
```
prisma/
  schema.prisma          # Product (and related) models
db/
  prisma.ts              # Prisma client
  seed.ts                # seed from sample data
  sample-data.ts
lib/
  actions/product.actions.ts
  validators.ts
  generated/prisma/      # generated client
app/(root)/
  product/[slug]/page.tsx
components/shared/product/
  product-images.tsx
types/
```

**Outcome:** Products load from the database instead of a static file.

---

### Section 4 — Authentication With Next Auth

**Goal:** Let users sign up, sign in, and access protected routes.

**What you will build**
- NextAuth configuration (credentials / providers)
- Sign-in and sign-up pages
- Session handling in the header (user menu)
- Protected routes and role awareness (user vs admin)

**Outcome:** Authenticated users can use account-related features.

---

### Section 5 — Add To Cart

**Goal:** Let shoppers add products to a cart.

**What you will build**
- Cart data model and server actions
- Add-to-cart button on product pages
- Cart quantity and stock handling
- Persist cart for guests and logged-in users

**Outcome:** Items can be added to a working cart.

---

### Section 6 — Cart & Shipping Pages

**Goal:** Complete the cart review and shipping address steps.

**What you will build**
- Cart page (update quantities, remove items, totals)
- Shipping address form and validation
- Checkout flow navigation between steps

**Outcome:** Users can review the cart and enter a shipping address.

---

### Section 7 — Payment Method & Order Pages

**Goal:** Choose a payment method and create orders.

**What you will build**
- Payment method selection page
- Place-order summary page
- Order creation in the database
- Order details page after checkout

**Outcome:** A full checkout flow that creates real orders.

---

### Section 8 — PayPal Payments

**Goal:** Accept payments with PayPal.

**What you will build**
- PayPal SDK / API integration
- Pay button on the order page
- Mark orders as paid after successful payment

**Outcome:** Orders can be paid through PayPal.

---

### Section 9 — Order History & User Profile

**Goal:** Give users an account area for orders and profile updates.

**What you will build**
- User order history list
- Order details for past purchases
- Profile update form (name, etc.)

**Outcome:** Users can manage their profile and view past orders.

---

### Section 10 — Admin Overview & Orders

**Goal:** Start the admin dashboard with overview stats and order management.

**What you will build**
- Admin layout and navigation
- Overview cards (sales, users, products, orders)
- Admin orders list and order details
- Mark orders as delivered

**Outcome:** Admins can monitor the store and manage orders.

---

### Section 11 — Admin Products & Image Upload

**Goal:** Let admins create and edit products, including images.

**What you will build**
- Admin products list (create / update / delete)
- Product form with validation
- Image upload (e.g. Uploadthing or similar)
- Stock and featured product controls

**Outcome:** Full product CRUD in the admin panel.

---

### Section 12 — Admin Users & Search

**Goal:** Manage users and add search across admin lists.

**What you will build**
- Admin users list and edit user roles
- Search for products, orders, and users
- Pagination for large admin tables

**Outcome:** Admins can find and manage users and records quickly.

---

### Section 13 — Search Filtering, Drawer & Carousel

**Goal:** Improve the storefront discovery experience.

**What you will build**
- Product search and category / price filters
- Filter drawer (mobile-friendly)
- Homepage banner carousel

**Outcome:** Shoppers can browse and filter products more easily.

---

### Section 14 — Ratings & Reviews

**Goal:** Let customers leave product reviews.

**What you will build**
- Review form (rating + comment)
- Reviews list on the product page
- Average rating display on cards / details

**Outcome:** Products show community ratings and reviews.

---

### Section 15 — Stripe Payments

**Goal:** Add Stripe as another payment option.

**What you will build**
- Stripe payment integration
- Payment UI on the order page
- Confirm payment and update order status

**Outcome:** Orders can be paid with Stripe as well as PayPal.

---

### Section 16 — Email Purchase Receipts

**Goal:** Send email confirmations after purchase.

**What you will build**
- Email provider setup (e.g. Resend)
- Purchase receipt template
- Trigger email when an order is paid

**Outcome:** Customers receive order confirmation emails.

---

### Section 17 — Homepage Components & Wrap Up

**Goal:** Polish the homepage and finish remaining UI pieces.

**What you will build**
- Featured deals / promotional homepage sections
- Final layout polish and consistency passes
- Course wrap-up and deployment notes

**Outcome:** A polished, production-ready looking storefront.

---

### Section 18 — Notes & Fixes

**Goal:** Apply course notes, bug fixes, and small improvements.

**What you will build**
- Fixes called out in the course updates
- Small refactors and edge-case handling

**Outcome:** A more stable final version of the app.

---

## Current status (after Sections 1–3)

Already in place:
- Next.js app structure with App Router
- Global layout, theming, header, footer
- Mode toggle and responsive menu
- Loading + 404 pages
- Prisma schema, client, and seed script
- Home page products and product detail pages from the database

**Next up (Section 4):** Authentication with NextAuth (sign-in, sign-up, sessions).

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
