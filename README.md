# ShopZone — E-Commerce Angular App
## Premium Minimalist Design | Angular 21 + JSON Server 0.17

---

## 🚀 Quick Start (3 steps)

```bash
# 1. Install dependencies (first time only)
npm install

# 2a. Run both together ✅ RECOMMENDED
npm run dev

# 2b. Or run separately:
#  Terminal 1 — JSON Server on port 3000
npm run server

#  Terminal 2 — Angular on port 4200  
npm start
```

Open: **http://localhost:4200**

---

## ⚠️ Common Issue: Products/Cart show skeleton forever

**Cause:** JSON Server is NOT running.

**Fix:** Make sure you run `npm run server` BEFORE or WITH `npm start`.

The safest command is: `npm run dev` — it starts both automatically.

```
json-server --watch db.json --port 3000
```

You should see output like:
```
Resources
  http://localhost:3000/users
  http://localhost:3000/products
  http://localhost:3000/cart
  http://localhost:3000/orders
```

---

## 🔐 Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| ahmed@shopzone.com | 12345678 | user |
| sara@shopzone.com  | abcdefgh | admin |

---

## ✅ CORS Fix — Angular Proxy

```
Browser → Angular (:4200) → Proxy → JSON Server (:3000)
```

- `proxy.conf.json` — routes `/products`, `/users`, `/cart`, `/orders` → `:3000`
- `angular.json` → `proxyConfig: "proxy.conf.json"`  
- `package.json` → `start: "ng serve --proxy-config proxy.conf.json"`
- All services use **relative URLs** (no `http://localhost:3000`)

---

## 📁 Structure

```
src/app/
├── pages/           login, register, products, cart, orders, profile
├── components/      navbar, not-found
├── services/        auth, product, cart, order
├── interceptors/    auth.interceptor.ts (attaches userId header)
├── guards/          auth.guard.ts (protects cart/orders/profile)
└── models/          User, Product, CartItem, Order
```
