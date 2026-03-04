# ⚡ Electro Bill Flow
**Cloth Store Billing Management System — MERN Stack**

---

## 🚀 Quick Start (3 Steps)

### Step 1 — Install dependencies
```bash
# From inside the EBF folder:
npm install
cd client && npm install && cd ..
```

### Step 2 — Configure MongoDB
Edit `.env` in the root folder:
```
MONGO_URI=mongodb://127.0.0.1:27017/electro_bill_flow
```
> For MongoDB Atlas: `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/electro_bill_flow`

### Step 3 — Run the app
```bash
npm run dev
```
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 📁 Structure
```
EBF/
├── .env                    MongoDB + JWT config
├── package.json            Root scripts
├── server/
│   ├── index.js            Express server
│   ├── config/db.js        MongoDB connection
│   ├── models/             User, Item, Bill schemas
│   ├── routes/             Auth, Items, Bills endpoints
│   └── middleware/         JWT auth guard
└── client/
    └── src/
        ├── pages/          Login, Register, Dashboard, Items, Bills, CreateBill
        ├── components/     Navbar
        └── context/        AuthContext (JWT)
```

## 🔑 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET/POST/PUT/DELETE | /api/items | Manage items |
| GET/POST/DELETE | /api/bills | Manage bills |
| GET | /api/bills/stats | Dashboard stats |
