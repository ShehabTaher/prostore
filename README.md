# Prostore

A full-stack e-commerce storefront built with **Next.js**, following Brad Traversy’s Prostore course.

**Progress:** Sections **1–5** complete · currently moving into Section 6.

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | Prisma |
| Auth | NextAuth v5 (Auth.js), credentials provider |
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

### ✅ Section 4 — Authentication With Next Auth

**Goal:** Let users sign up, sign in, and access protected routes.

**What you build**
- **NextAuth v5 (Auth.js)** in `auth.ts` with a **credentials** provider (email + password)
- **JWT session strategy** (required for credentials; database sessions are not used for login)
- **Prisma Adapter** and auth-related models: `User`, `Account`, `Session`, `VerificationToken`
- **API route** at `app/api/auth/[...nextauth]/route.ts` exporting NextAuth handlers
- **Sign-in** (`/sign-in`) and **sign-up** (`/sign-up`) pages under the `(auth)` route group
- **Server actions** in `lib/actions/user.action.ts`: sign in, sign up (hash password, auto sign-in), sign out
- **Zod validators** (`signInSchema`, `signUpSchema`) for form validation
- **Password hashing** with `bcrypt-ts-edge` (edge-compatible for Next.js server actions)
- **Header session UI**: `UserButton` dropdown (name, email, sign out) or “Sign In” link when logged out
- **Session typing** extended in `types/next-auth.d.ts` so `session.user` includes `id` and `role`
- **JWT callbacks** to persist `role` on the token and expose it on the session
- **Seed users** in `db/sample-data.ts` (admin + regular user with hashed passwords)
- **Error formatting** in `lib/format-error.ts` for Zod and duplicate-email (Prisma `P2002`) errors
- **User DB helpers** in `lib/db.ts` for `getUserByEmail`, `createUser`, `updateUserName`

**Key folders after this section**
```
auth.ts                          # NextAuth config, providers, callbacks
app/
  (auth)/                        # centered auth layout
    sign-in/                     # sign-in page + credentials form
    sign-up/                     # sign-up page + form
  api/auth/[...nextauth]/route.ts
components/
  shared/header/
    user-button.tsx              # session-aware header control
    sign-out-form.tsx
  ui/input.tsx, label.tsx        # form primitives
lib/
  actions/user.action.ts
  db.ts                          # user queries (used by auth + actions)
  format-error.ts
  validators.ts                  # + sign-in / sign-up schemas
types/
  next-auth.d.ts                 # Session & JWT type extensions
prisma/
  schema.prisma                  # User, Account, Session, VerificationToken
```

**How it works (short)**
1. **Sign up** — form submits to `signUpUser` → validates with Zod → hashes password → creates user in DB → signs in with credentials.
2. **Sign in** — `signInWithCredentials` validates input → `signIn('credentials', …)` → `authorize` loads user by email and compares password with `compareSync`.
3. **Session** — JWT holds `role` and user id; `session` callback attaches them to `session.user` for server components (e.g. header).
4. **Sign out** — `signOutUser` server action calls NextAuth `signOut`.

**Issues encountered & how AI helped**

The course targets an older NextAuth setup; this project uses **Next.js App Router**, **NextAuth v5**, and **Prisma 7 with the Neon driver adapter**. Several errors did not match the course verbatim — **Cursor AI was used to debug and fix them**:

| Issue | What went wrong | Fix (with AI) |
| --- | --- | --- |
| **Redirect treated as error** | `signIn()` throws a Next.js redirect; catching it in server actions showed “Invalid email or password” on success | Re-throw redirect via `isRedirectError(error)` in `user.action.ts` |
| **Prisma duplicate email message** | Neon adapter reports `P2002` with a different `meta` shape than classic Prisma | `format-error.ts` reads both `driverAdapterError` and legacy `meta.target` to show “Email already exists” |
| **User queries / client typing** | Extended `prisma` client vs base client for auth tables | Thin `lib/db.ts` wrapper with explicit user client types on `prismaBase` |
| **Password compare in auth** | `bcrypt` vs edge runtime | `compareSync` from `bcrypt-ts-edge/browser` in `authorize`; `hashSync` from `bcrypt-ts-edge` in actions |
| **PrismaAdapter types** | Adapter expects a compatible Prisma client type | `PrismaAdapter(prismaBase as never)` until types align with generated client |
| **Default name `NO_NAME`** | New users may have placeholder name from schema default | JWT callback sets name from email prefix and `updateUserName` in DB |

**Not in this section yet (later in the course)**
- `middleware.ts` for protected routes
- Admin-only route guards using `session.user.role`

**Outcome:** Users can register, log in, and see their session in the header. Role is available on the session for upcoming admin features.

---

### ✅ Section 5 — Add To Cart

**Goal:** Let shoppers add products to a cart, persist that cart in the database, and show quantity controls on the product page.

**What you build**

1. **Cart model in Prisma** — `Cart` table with `sessionCartId` (guest identifier), optional `userId` (logged-in user), `items` as a JSON array, and price fields (`itemsPrice`, `shippingPrice`, `taxPrice`, `totalPrice`).
2. **Guest cart cookie** — middleware sets a `sessionCartId` cookie on first visit so anonymous users still get a stable cart.
3. **Zod validators & types** — `cartSchema` (single line item) and `insertCartSchema` (full cart row); `Cart` / `CartItem` types inferred in `types/index.ts`.
4. **Price helpers** — `roundTo2DecimalPlaces` and `convertToPlainObject` in `lib/utils.ts` so Prisma `Decimal` values serialize cleanly for the client.
5. **Server actions** (`lib/actions/cart.actions.ts`):
   - `calcPrice` — subtotal, shipping (free over $100, else $10), 15% tax, total
   - `getMyCart` — load cart by `userId` when signed in, otherwise by `sessionCartId`
   - `addToCart` — validate item, check stock, create or update cart, `revalidatePath` on the product page
   - `removeItemFromCart` — decrement quantity or remove line item, recalculate prices
6. **`AddToCart` client component** — full “Add to Cart” button when item is not in cart; `+` / `−` controls when it is; loading state via `useTransition`; toast feedback with “Go to Cart” action; `router.refresh()` after mutations.
7. **Product details page wiring** — fetch cart with `getMyCart()`, pass cart + item props into `AddToCart`, hide controls when `stock === 0`.

**Key folders after this section**
```
auth.config.ts                   # sessionCartId cookie in authorized callback
middleware.ts                    # NextAuth middleware (runs cookie logic)
prisma/
  schema.prisma                  # Cart model + User relation
  migrations/..._add_cart/       # Cart table migration
lib/
  actions/cart.actions.ts        # add, remove, get cart
  validators.ts                  # cartSchema, insertCartSchema
  utils.ts                       # roundTo2DecimalPlaces, convertToPlainObject
types/index.ts                   # Cart, CartItem
components/shared/product/
  add-to-cart.tsx                # client UI + server action calls
app/(root)/product/[slug]/page.tsx
```

**How it works (short)**
1. **First visit** — middleware sees no `sessionCartId` cookie → generates UUID → sets cookie on the response.
2. **Product page** — server loads product + current cart; passes a `CartItem` snapshot (id, name, slug, qty 1, image, price) to `AddToCart`.
3. **Add to cart** — client calls `addToCart` server action → validates with Zod → loads product from DB → checks stock → creates new cart or merges/updates items → recalculates prices → saves to DB → revalidates product page.
4. **Already in cart** — UI switches to quantity controls; `+` calls `addToCart` again, `−` calls `removeItemFromCart`.
5. **Guest vs signed-in** — guests are tracked by `sessionCartId`; logged-in users by `userId` (cart merge on login comes in a later section).

**Issues encountered & how AI helped**

The course uses an older Next.js / NextAuth middleware pattern and does not cover every Prisma 7 + App Router edge case. **Cursor AI was used to debug and align the implementation**:

| Issue | What went wrong | Fix (with AI) |
| --- | --- | --- |
| **Guest cart cookie in NextAuth v5** | Course sets cookies in plain `middleware.ts`; v5 expects auth config split into `auth.config.ts` + `middleware.ts` | Move cookie logic into `authorized` callback in `auth.config.ts`; export `NextAuth(authConfig)` as middleware |
| **`cookies()` is async (Next.js 15+)** | `cookies().get('sessionCartId')` fails or warns — `cookies()` must be awaited | Use `(await cookies()).get('sessionCartId')` in all server actions |
| **Prisma `Decimal` not serializable** | Cart price fields return `Decimal` objects; passing cart to client components throws serialization errors | `convertToPlainObject()` + `.toString()` on price fields in `getMyCart` |
| **`Json[]` items typing** | Prisma stores `items` as `Json[]`; TypeScript does not know the shape | Cast `(cart.items as CartItem[])` when reading/updating line items |
| **UI not updating after add/remove** | Server action succeeds but product page still shows old quantity | Call `revalidatePath` in the action **and** `router.refresh()` in the client after success |
| **Stock checks** | Adding beyond available stock silently or with unclear errors | Compare `product.stock` against existing quantity + requested quantity before update; return formatted error via `formatError` |
| **Price math precision** | Floating-point totals (e.g. `0.1 + 0.2`) drift from DB `Decimal(12,2)` | Centralize totals in `calcPrice` using `roundTo2DecimalPlaces` and store fixed 2-decimal strings |
| **Server action errors vs success** | Uncaught exceptions crash the action or show raw Prisma messages | Wrap actions in `try/catch` and return `{ success, message }` consistently (same pattern as auth actions) |

**Not in this section yet (later in the course)**
- Full `/cart` page (update quantities, remove items, totals UI) — Section 6
- Merge guest cart into user cart on sign-in
- Cart item count badge in the header

**Outcome:** Shoppers can add products from the detail page, adjust quantity with `+` / `−`, and the cart persists in the database for guests (via cookie) and logged-in users (via `userId`).

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

## Current status (after Sections 1–5)

Already in place:
- Next.js app structure with App Router
- Global layout, theming, header, footer
- Mode toggle and responsive menu
- Loading + 404 pages
- Prisma schema, client, and seed script
- Home page products and product detail pages from the database
- NextAuth credentials auth: sign-in, sign-up, sign-out
- Session-aware header (`UserButton`) with user name and role on JWT/session
- Seeded test users (e.g. admin and regular user — see `db/sample-data.ts`)
- Cart model, `sessionCartId` guest cookie, and cart server actions (`addToCart`, `removeItemFromCart`, `getMyCart`)
- Add-to-cart UI on product pages with quantity controls, stock checks, and toast feedback

**Next up (Section 6):** Cart page and shipping address form.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
