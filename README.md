# SmartBill — Invoice Generator App

A full-stack Invoice Generator web application built using the MERN stack. SmartBill allows users to manage inventory items, create invoices with live GST and discount calculations, save them to a cloud database, and download them as formatted PDFs.

---

## Live Demo

> Run locally by following the setup instructions below.

---

## Features

- **Item Management** — Add, edit, and delete inventory items with variants (Size, Color, Weight etc.) and base price
- **Invoice Creation** — Auto-generated invoice numbers, customer details, and invoice date
- **Live Calculations** — Real-time GST (5%, 12%, 18%, 28%) and discount (percentage or fixed amount) calculations per line item
- **PDF Generation** — Download a professionally formatted PDF of any invoice
- **Invoice Dashboard** — View all previously created invoices with customer name, date, grand total, and PDF download
- **Responsive UI** — Works on mobile, tablet, and desktop with hamburger navigation menu
- **MongoDB Atlas** — Cloud database for persistent storage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| PDF | PDFKit |
| Styling | CSS3 (separate CSS files per component) |
| HTTP Client | Axios |
| Notifications | React Hot Toast |

---

## Project Structure

```
smartbill-invoice/
├── backend/
│   ├── models/
│   │   ├── Item.js          # Item schema with variants
│   │   └── Invoice.js       # Invoice schema with auto invoice number
│   ├── routes/
│   │   ├── itemRoutes.js    # CRUD APIs for items
│   │   └── invoiceRoutes.js # Invoice APIs + PDF generation
│   ├── server.js            # Express server entry point
│   ├── .env                 # Environment variables (not committed)
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── pages/
        │   ├── Dashboard.js     # Invoice history page
        │   ├── Dashboard.css
        │   ├── Items.js         # Item management page
        │   ├── Items.css
        │   ├── NewInvoice.js    # Create invoice page
        │   └── NewInvoice.css
        ├── utils/
        │   └── api.js           # Axios API helper functions
        ├── App.js               # Main app with routing + sidebar
        ├── App.css              # Sidebar + hamburger styles
        ├── index.js             # React entry point
        └── index.css            # Global styles
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB Atlas account (free tier works)

### Step 1 — Clone the repository
```bash
git clone https://github.com/Shrihasthajain/smartbill-invoice.git
cd smartbill-invoice
```

### Step 2 — Backend setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

Start the backend:
```bash
npm run dev
```

You should see:
```
MongoDB Connected
Server running on port 5000
```

### Step 3 — Frontend setup (new terminal)
```bash
cd frontend
npm install
npm start
```

App opens at: **http://localhost:3000**

---

## 📡 API Endpoints

### Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | Get all items |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Invoices
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/invoices` | Get all invoices |
| POST | `/api/invoices` | Create new invoice |
| GET | `/api/invoices/:id/pdf` | Download invoice as PDF |

---

## GST Calculation Logic

```
Base Amount   = Price × Quantity
Discount      = Base × (Discount% / 100)  OR  Fixed Amount
After Discount = Base - Discount
GST Amount    = After Discount × (GST% / 100)
Row Total     = After Discount + GST Amount
```

> Note: GST is applied after discount as per Indian GST rules.

---

## PDF Invoice Includes

- Company branding (SmartBill header)
- Auto-generated invoice number and dates
- Customer details (name, phone, email, address)
- Line items table with GST and discount per item
- Calculation summary (subtotal, discount, GST, grand total)
- Terms & Conditions

---

## Screenshots

### Dashboard
> View all invoices with invoice number, customer name, date, grand total, and PDF download button.

### Items Management
> Add and manage inventory items with name, description, base price, and variants.

### New Invoice
> Create invoices with dynamic line items, live GST + discount calculations, and customer details.

---

## Future Improvements

- User authentication with JWT
- Edit and delete invoices
- Search and filter invoices
- TypeScript support
- Deployment on AWS / Vercel
- Unit tests with Jest
