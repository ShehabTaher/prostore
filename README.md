# Prostore

A full-stack e-commerce storefront built with **Next.js**, following Brad Traversy’s Prostore course.

**Progress:** Sections **1–10** complete · currently moving into Section 11.

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | Prisma |
| Auth | NextAuth v5 (Auth.js), credentials provider |
| Payments | PayPal *(Section 8)* ✅, Stripe *(Section 15)* |

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
- Cart item count badge in the header

**Outcome:** Shoppers can add products from the detail page, adjust quantity with `+` / `−`, and the cart persists in the database for guests (via cookie) and logged-in users (via `userId`).

---

### ✅ Section 6 — Cart & Shipping Pages

**Goal:** Complete the cart review page, protect checkout routes, merge guest carts on login, and collect a shipping address before payment.

**What you build**

1. **Cart page** (`/cart`) — server page loads `getMyCart()` and renders a client `CartTable` with line items, images, quantity `+` / `−`, empty state, and subtotal.
2. **Currency formatting** — `formatCurrency` in `lib/utils.ts` using `Intl.NumberFormat` for consistent USD display.
3. **Proceed to checkout** — cart summary card navigates to `/shipping-address` (requires auth).
4. **Protected checkout routes** — `authorized` in `auth.config.ts` redirects guests away from `/shipping-address`, `/payment-method`, `/place-order`, `/profile`, `/user/*`, `/order/*`, and `/admin`.
5. **Merge guest cart on sign-in** — JWT callback reads `sessionCartId` cookie and calls `assignSessionCartToUser` so guest items attach to the logged-in user.
6. **Checkout steps UI** — shared `CheckoutSteps` component (User Login → Shipping Address → Payment Method → Place Order).
7. **Shipping address page** — redirects empty carts to `/cart`; loads the signed-in user’s saved address; shows steps + form.
8. **Shipping address form** — React Hook Form + Zod (`shippingAddressSchema`); fields for full name, street, city, postal code, country; submits via `updateUserAddress`.
9. **Persist address on User** — `User.address` JSON field updated by `updateUserAddress` / loaded by `getUserById`.
10. **Default form values** — `shippingAddressDefaultValues` in `lib/constants` when the user has no saved address yet.

**Key folders after this section**
```
app/(root)/
  cart/
    page.tsx                 # load cart, render table
    cart-table.tsx           # client: qty controls, subtotal, checkout CTA
  shipping-address/
    page.tsx                 # auth + cart guards, load user address
    shipping-address-form.tsx
auth.config.ts               # protected path regexes + sessionCartId cookie
auth.ts                      # JWT: merge guest cart on signIn / signUp
lib/
  actions/user.action.ts     # getUserById, updateUserAddress
  db.ts                      # assignSessionCartToUser
  validators.ts              # shippingAddressSchema
  constants/index.ts         # shippingAddressDefaultValues
  utils.ts                   # formatCurrency
components/shared/
  checkout-steps.tsx
types/index.ts               # ShippingAddress
prisma/schema.prisma         # User.address Json?
```

**How it works (short)**
1. **Cart page** — `getMyCart()` → empty message or table of items; `+` / `−` reuse `addToCart` / `removeItemFromCart`; “Proceed to Checkout” goes to shipping.
2. **Auth gate** — middleware `authorized` sees no session on a protected path → redirect to `/sign-in` (with callback URL).
3. **Cart merge** — after credentials sign-in/sign-up, JWT callback attaches the guest `sessionCartId` cart to `userId` (deletes any prior user cart first).
4. **Shipping** — page requires cart items + `userId` → form validates with Zod → `updateUserAddress` saves JSON on `User` → navigate to `/payment-method` (Section 7).

**Issues encountered & how AI helped**

Checkout and cart-merge sit on **NextAuth v5** + **App Router** patterns that differ from older course snippets. **Cursor AI was used to debug and align them**:

| Issue | What went wrong | Fix (with AI) |
| --- | --- | --- |
| **Protect routes in NextAuth v5** | Plain middleware path checks conflict with the auth middleware export | Use `authorized({ request, auth })` in `auth.config.ts` with regex `protectedPaths`; return `false` when `!auth` so NextAuth redirects to sign-in |
| **Guest cart lost after login** | Guest cart keyed by cookie; user cart keyed by `userId` — items “disappear” after sign-in | In JWT callback on `signIn` / `signUp`, call `assignSessionCartToUser(sessionCartId, user.id)` |
| **`cookies()` in JWT callback** | Sync cookie access breaks on newer Next.js | `await cookies()` then read `sessionCartId` |
| **Empty cart on shipping page** | Users can open `/shipping-address` with no items | Server `redirect('/cart')` when cart is missing or `items.length === 0` |
| **`User.address` typing** | Prisma `Json?` is not a typed address object | Cast `user.address as ShippingAddress` for the form; validate writes with `shippingAddressSchema` |
| **Form stack (RHF + Zod)** | Course form patterns vs current shadcn Form / `@hookform/resolvers` | Wire `useForm` + `zodResolver(shippingAddressSchema)` and typed `FormField` renders |
| **Currency display** | Raw price strings look inconsistent next to totals | Add `formatCurrency` with `Intl.NumberFormat` (`USD`, 2 decimals) |
| **Checkout step highlight** | Need a reusable step indicator without duplicating markup | `CheckoutSteps` with `current` index and `cn()` for active step styling |

**Not in this section yet (later in the course)**
- Cart item count badge in the header

**Outcome:** Users can review and update the cart, sign in without losing guest items, and save a shipping address before continuing to payment.

---

### ✅ Section 7 — Payment Method & Order Pages

**Goal:** Choose a payment method, review the order summary, create a real order in the database, and show order details after checkout.

**What you build**

1. **Payment methods constants** — `PAYMENT_METHODS` (`PayPal`, `Stripe`, `CashOnDelivery`) and `DEFAULT_PAYMENT_METHOD` in `lib/constants`.
2. **Payment method validators** — `paymentMethodSchema` (must be one of the allowed methods); `insertOrderSchema` / `insertOrderItemSchema` for order creation.
3. **Prisma models** — `Order` (address, payment, prices, paid/delivered flags) and `OrderItem` (composite PK on `orderId` + `productId`); `User.paymentMethod` string field.
4. **Payment method page** (`/payment-method`) — checkout step 2; loads user’s preferred method; radio group form.
5. **`updateUserPaymentMethod`** — validates and saves `User.paymentMethod`, then navigate to `/place-order`.
6. **Place order page** (`/place-order`) — guards: empty cart → `/cart`, no address → shipping, no payment → payment method; summary of address, payment, items, and totals with Edit links.
7. **`createOrder` server action** — validates cart + address + payment; builds order from cart prices; creates order + line items; clears cart; returns `redirectTo: /order/[id]`.
8. **`createOrderWithItems` DB helper** — creates order, inserts items, resets cart totals/items (Prisma client wrappers in `lib/db.ts`).
9. **Order details page** (`/order/[id]`) — `getOrderById` with items + user; `OrderDetailsTable` shows payment/shipping status badges, line items, and totals.
10. **Display helpers** — `shortenUuid`, `formatDateTime` for order id and paid/delivered timestamps.
11. **Types** — `Order`, `OrderItem` inferred from Zod schemas and extended with id, status flags, and relations.

**Key folders after this section**
```
app/(root)/
  payment-method/
    page.tsx
    payment-method-form.tsx
  place-order/
    page.tsx
    place-order-form.tsx
  order/[id]/
    page.tsx
    order-details-table.tsx
lib/
  actions/order.actions.ts       # createOrder, getOrderById
  actions/user.action.ts         # updateUserPaymentMethod
  db.ts                          # createOrderWithItems (+ Order clients)
  validators.ts                  # paymentMethodSchema, insertOrder*
  constants/index.ts             # PAYMENT_METHODS, DEFAULT_PAYMENT_METHOD
  utils.ts                       # shortenUuid, formatDateTime
types/index.ts                   # Order, OrderItem
prisma/schema.prisma             # Order, OrderItem, User.paymentMethod
components/ui/radio-group.tsx
```

**How it works (short)**
1. **Payment** — form submits selected method → `updateUserPaymentMethod` → `/place-order`.
2. **Review** — place-order page requires cart + address + payment method; shows editable summary and totals.
3. **Place order** — client calls `createOrder` → validate prerequisites (or return `redirectTo`) → insert `Order` + `OrderItem`s → empty cart → redirect to `/order/[id]`.
4. **Order details** — load order by id; show Not Paid / Not Delivered until Section 8+ payment and delivery updates.

**Issues encountered & how AI helped**

Order creation spans **Prisma 7 client typing**, **Decimal serialization**, and **checkout guard redirects**. **Cursor AI was used to debug and align them**:

| Issue | What went wrong | Fix (with AI) |
| --- | --- | --- |
| **Invalid / stale payment method default** | Saved `paymentMethod` not in `PAYMENT_METHODS` broke the radio default | Prefer user’s method only if `PAYMENT_METHODS.includes(...)`; else `DEFAULT_PAYMENT_METHOD` |
| **Checkout step guards** | Users can skip shipping or payment and hit place-order | Server `redirect()` when cart empty, address missing, or payment method missing |
| **`createOrder` soft redirects** | Missing cart/address/payment should send the user back without throwing | Return `{ success: false, message, redirectTo }` and let the client `router.push` |
| **Prisma Order / OrderItem client typing** | Generated client / adapter typing gaps after schema changes | Thin `getOrderClient` / `getOrderItemClient` wrappers in `lib/db.ts` with clear regenerate/restart message |
| **Clear cart after order** | Leaving items in cart after place-order allows duplicate orders | After inserting items, update cart: `items: []` and zero price fields |
| **Order Decimal → client** | Passing Prisma `Decimal` into client components fails serialization | `convertToPlainObject` + `.toString()` on price fields in `getOrderById` |
| **Order type shape** | UI needs `orderItems`, paid/delivered flags, and user — not only insert schema | Extend `Order` type with id, dates, status flags, `orderItems`, and `user` |
| **Long UUID in UI** | Full UUID clutters the order heading | `shortenUuid` shows last 6 characters; `formatDateTime` for paid/delivered badges |

**Not in this section yet (later in the course)**
- PayPal (and Stripe) payment buttons / mark order paid — Sections 8 & 15
- Order history list and user profile — Section 9
- Cart item count badge in the header

**Outcome:** Shoppers can select a payment method, place an order that is persisted with line items, and view the order details page (payment still unpaid until later sections).

---

### ✅ Section 8 — PayPal Payments

**Goal:** Accept payments with PayPal on unpaid orders and mark them paid after capture.

**What you build**

1. **PayPal env + API helper** (`lib/paypal.ts`) — OAuth access token, `createOrder(price)`, `capturePayment(paypalOrderId)` against the sandbox API (`PAYPAL_API_URL`).
2. **Jest tests** (`tests/paypal.test.ts`) — token generation, create order, mocked capture; `npm test` / `npm run test:watch`.
3. **`@paypal/react-paypal-js`** — `PayPalScriptProvider` + `PayPalButtons` on the order details page when method is PayPal and `!isPaid`.
4. **Server actions** (`lib/actions/order.actions.ts`):
   - `createPayPalOrder(orderId)` — create PayPal order for `totalPrice`, store PayPal id in `Order.paymentResult`
   - `approvePayPalOrder(orderId, { orderID })` — capture PayPal payment, verify COMPLETED, then mark paid
   - `updateOrderToPaid` — set `isPaid` / `paidAt` / `paymentResult`; decrement product stock
5. **Order details UI** — loading/error state for the PayPal script; buttons call create/approve actions with toast feedback; `revalidatePath` after pay.
6. **`PaypalPayment` type** — Zod schema for payment result (`id`, `status`, `email_address`, `pricePaid`).
7. **Friendlier PayPal errors** — `format-error.ts` parses PayPal JSON errors (e.g. sandbox `COMPLIANCE_VIOLATION`).

**Key folders after this section**
```
lib/
  paypal.ts                      # PayPal REST helpers
  actions/order.actions.ts       # createPayPalOrder, approvePayPalOrder, updateOrderToPaid
  format-error.ts                # + formatPayPalError
  validators.ts                  # paypalPaymentSchema
types/index.ts                   # PaypalPayment
app/(root)/order/[id]/
  page.tsx                       # pass PAYPAL_CLIENT_ID into table
  order-details-table.tsx        # PayPal buttons when unpaid
tests/
  paypal.test.ts
jest.config.ts / jest.setup.ts
```

**Env vars (do not commit secrets)**
```
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

**How it works (short)**
1. Unpaid PayPal order page loads the JS SDK with `PAYPAL_CLIENT_ID`.
2. Buyer clicks PayPal → `createOrder` → `createPayPalOrder` creates a PayPal order and saves its id on `paymentResult`.
3. Buyer approves → `onApprove` → `approvePayPalOrder` captures payment → `updateOrderToPaid` → stock decrements → UI shows Paid.

**Issues encountered & how AI helped**

| Issue | What went wrong | Fix (with AI) |
| --- | --- | --- |
| **PayPal JSON errors in toast** | Raw API error body is JSON; UI showed unreadable text | `formatPayPalError` parses `details` / `message`; special note for `COMPLIANCE_VIOLATION` |
| **Capture id mismatch** | Capture response id must match the PayPal order id stored on `paymentResult` | Compare `captureResponse.id` to `(order.paymentResult as PaypalPayment)?.id` and require `COMPLETED` |
| **Stock after pay** | Paying should reduce inventory | In `updateOrderToPaid`, loop `orderItems` and `stock.increment: -quantity` |
| **Client needs PayPal client id** | Buttons need the public client id from the server page | Pass `paypalClientId={process.env.PAYPAL_CLIENT_ID!}` into `OrderDetailsTable` |
| **Jest for PayPal helpers** | Need confidence before wiring UI | Token + createOrder live sandbox tests; capture covered with `jest.spyOn` mock |

**Not in this section yet (later in the course)**
- Stripe checkout — Section 15
- Email receipts after paid — Section 16
- Order history list — Section 9 ✅

**Outcome:** Unpaid PayPal orders can be paid in sandbox; after capture the order shows as paid and product stock is updated.

---

### ✅ Section 9 — Order History & User Profile

**Goal:** Give signed-in users an account area to view order history and update their profile.

**What you build**

1. **User layout** (`app/user/layout.tsx`) — dedicated shell with logo, `MainNav` (Profile / Orders), and header `Menu`.
2. **Main nav** (`app/user/main-nav.tsx`) — client nav highlighting the active `/user/profile` or `/user/orders` path.
3. **Order history page** (`/user/orders`) — `getMyOrders({ page })` with `PAGE_SIZE` pagination; table of id, date, total, paid, delivered; **View** links to `/order/[id]`.
4. **Pagination component** — Previous / Next using `formUrlQuery` to update the `page` search param.
5. **Profile page** (`/user/profile`) — wraps form in `SessionProvider` so the client can read/update the session.
6. **Profile form** — React Hook Form + `updateProfileSchema`; email disabled; name editable; `updateUserProfile` server action; `session.update()` + toast + `router.refresh()`.
7. **Header links** — `UserButton` dropdown links to Profile and Orders.
8. **Session name sync** — JWT `trigger === 'update'` writes `session.user.name` onto the token so the header name updates after profile save.

**Key folders after this section**
```
app/user/
  layout.tsx                     # user account chrome
  main-nav.tsx                   # Profile | Orders
  orders/page.tsx                # paginated order history
  profile/
    page.tsx                     # SessionProvider + form
    profile-form.tsx
components/shared/
  pagination.tsx
  header/user-button.tsx        # links to /user/profile and /user/orders
lib/
  actions/order.actions.ts       # getMyOrders
  actions/user.action.ts         # updateUserProfile
  validators.ts                  # updateProfileSchema
  constants/index.ts             # PAGE_SIZE
  utils.ts                       # formUrlQuery
auth.ts                          # jwt/session update for name
```

**How it works (short)**
1. **Orders** — authenticated user opens `/user/orders?page=1` → `getMyOrders` loads their orders (newest first) → table + optional pagination.
2. **Profile** — form defaults from `useSession()` → submit → `updateUserProfile` updates DB name → `update(newSession)` refreshes JWT name → header shows the new name.

**Issues encountered & how AI helped**

| Issue | What went wrong | Fix (with AI) |
| --- | --- | --- |
| **Session name stale after profile update** | DB name changed but header still showed old JWT name | Call `update()` from `next-auth/react` and handle `trigger === 'update'` in the JWT callback |
| **Client needs session on profile page** | `useSession` empty without a provider | Wrap profile page children in `SessionProvider` with the server `auth()` session |
| **Pagination URL building** | Need to change `page` without dropping other query params | Shared `formUrlQuery` helper + `Pagination` client component |
| **Order totals typing** | Prisma `Decimal` on list rows | Format with `formatCurrency(order.totalPrice.toNumber())` (or stringify in the action if preferred) |
| **View link path typo** | Link pointed at `/orders/[id]` (missing singular route) | Use `/order/${order.id}` to match the existing order details page |

**Not in this section yet (later in the course)**
- Admin dashboard and admin order management — Section 10 ✅

**Outcome:** Users can open an account area, browse paginated order history, open order details, and update their display name.

---

### ✅ Section 10 — Admin Overview & Orders

**Goal:** Start the admin dashboard with overview stats and order management (list, delete, mark paid/delivered).

**What you build**

1. **Admin role guard** (`lib/auth-guard.ts`) — `requireAdmin()` checks `session.user.role === 'admin'` and redirects to `/unauthorized`.
2. **Admin layout** (`app/admin/layout.tsx`) — logo, admin `MainNav`, search input placeholder, and header `Menu`.
3. **Admin nav** — Overview, Products, Orders, Users links (Products/Users wired later).
4. **Overview dashboard** (`/admin/overview`) — cards for total sales, orders count, customers, products; Recharts bar chart of monthly sales; recent sales table.
5. **`getOrderSummary`** — counts + `aggregate` total sales + raw SQL monthly sales + latest 6 orders with buyer name.
6. **Admin orders page** (`/admin/orders`) — paginated `getAllOrders`; View + `DeleteDialog` per row.
7. **`deleteOrder`** — deletes order and revalidates `/admin/orders`.
8. **COD / delivery actions on order details** — admin-only **Mark As Paid** (`updateCODOrderToPaid`) for CashOnDelivery; **Mark As Delivered** (`deliverOrder`) when paid and not delivered.
9. **Header Admin link** — `UserButton` shows Admin → `/admin/overview` for admin role.
10. **Helpers** — `formatNumber` for counts; `Charts` client component with Recharts.

**Key folders after this section**
```
app/admin/
  layout.tsx
  main-nav.tsx
  overview/
    page.tsx                 # dashboard cards + chart + recent sales
    charts.tsx               # Recharts BarChart
  orders/page.tsx            # admin order list + delete
lib/
  auth-guard.ts              # requireAdmin
  actions/order.actions.ts   # getOrderSummary, getAllOrders, deleteOrder,
                             # updateCODOrderToPaid, deliverOrder
  utils.ts                   # formatNumber
components/shared/
  delete-dialog.tsx          # confirm + toast for delete actions
app/(root)/order/[id]/
  page.tsx                   # pass isAdmin
  order-details-table.tsx    # Mark As Paid / Mark As Delivered for admins
```

**How it works (short)**
1. **Admin gate** — overview calls `requireAdmin()`; orders page checks `role !== 'admin'`.
2. **Dashboard** — `getOrderSummary()` feeds cards, monthly chart, and recent sales.
3. **Orders admin** — list all orders with pagination; delete via dialog; open `/order/[id]` to manage payment/delivery.
4. **Fulfillment** — on order details, admin can mark COD orders paid and paid orders delivered.

**Issues encountered & how AI helped**

| Issue | What went wrong | Fix (with AI) |
| --- | --- | --- |
| **Non-admins hitting `/admin/*`** | Protected path only requires login, not role | `requireAdmin()` redirects non-admins to `/unauthorized` |
| **Monthly sales chart data** | Need grouped totals by month from Postgres | `$queryRaw` with `to_char("createdAt",'MM/YY')` + `SUM("totalPrice")`, map Decimals to numbers for Recharts |
| **Delete UX** | Hard deletes need confirmation | Shared `DeleteDialog` with `useTransition`, toast, and `revalidatePath` |
| **COD never becomes paid** | PayPal buttons only cover PayPal method | Admin **Mark As Paid** calls `updateCODOrderToPaid` → `updateOrderToPaid` |
| **Deliver before pay** | Delivery must require payment first | `deliverOrder` returns error if `!order.isPaid` |
| **Card labels vs values** | Easy to swap sales $ vs order count | Keep sales currency on the sales aggregate card and counts via `formatNumber` |

**Not in this section yet (later in the course)**
- Admin products CRUD + image upload — Section 11
- Admin users list / search — Section 12

**Outcome:** Admins can open a dashboard with sales stats, manage the orders list (view/delete), and mark COD orders paid / orders delivered.

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

## Current status (after Sections 1–10)

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
- Cart page (`/cart`) with quantity controls, subtotal, and checkout CTA
- Guest cart merge into user cart on sign-in / sign-up
- Protected checkout routes in `auth.config.ts` (Edge `proxy.ts` for Next.js 16)
- Shipping address page + form (Zod + React Hook Form), saved on `User.address`
- Checkout steps indicator
- Payment method page (PayPal / Stripe / CashOnDelivery) saved on `User.paymentMethod`
- Place-order summary with guards, totals, and `createOrder`
- `Order` / `OrderItem` models; order details page at `/order/[id]`
- PayPal sandbox: create + capture payment, mark order paid, decrement stock
- Jest PayPal helper tests (`npm test`)
- User account area: `/user/profile` and `/user/orders` with layout nav
- Paginated order history (`getMyOrders` + `Pagination`)
- Profile update form with session name sync
- Admin area: `/admin/overview` and `/admin/orders` with role guard
- Dashboard cards, monthly sales chart (Recharts), recent sales
- Admin order list with delete dialog; COD mark paid + mark delivered

**Next up (Section 11):** Admin products CRUD and image upload.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run db:seed` | Seed the database |
