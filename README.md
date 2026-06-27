<div align="center">

<img src="public/logo.png" alt="Friendly Camera Rentals" width="120" />

# 📸 Friendly Camera Rentals

### Premium Camera Rental Marketplace — Rent · Buy · Sell · Book

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-2.10.0-4A8F29?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

<br />

> Friendly Camera Rentals is a full-featured marketplace for camera gear and services. It supports rental inventory, used product sales, sell request submissions, service bookings, testimonials, and admin management with drag-and-drop ordering.

<br />

</div>

---

## Project Overview

Friendly Camera Rentals is a production-quality marketplace built with Next.js App Router. It enables users to:

- Browse rental gear and service offerings
- Search and filter buyable camera products
- Submit sell requests with image upload
- Book photography and videography services
- Submit testimonials for moderation

The admin area supports product management, request review, customer listings, testimonial moderation, and drag-and-drop ordering of buy and rental products.

---

## Tech Stack

| Category            | Technology                    |
| ------------------- | ----------------------------- |
| Framework           | Next.js 16 App Router         |
| Frontend            | React 19.2.4                  |
| Styling             | Tailwind CSS v4               |
| Animations          | Framer Motion 12.40.0         |
| Drag & Drop         | @dnd-kit                      |
| ORM                 | Prisma 6.15.0                 |
| Database            | PostgreSQL                    |
| Image Upload        | Cloudinary                    |
| Notifications       | Sonner                        |
| Icons               | Lucide React, React Icons     |
| Date Input          | React Datepicker              |
| Linting             | ESLint, eslint-config-next    |

---

## Project Structure

```
fcr/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
│   ├── images/
│   ├── sounds/
│   └── logo.png
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── not-found.jsx
│   │   ├── page.js
│   │   ├── buy/
│   │   │   ├── page.jsx
│   │   │   └── [slug]/page.jsx
│   │   ├── rental/
│   │   │   ├── page.jsx
│   │   │   └── [id]/page.jsx
│   │   ├── sell/page.jsx
│   │   ├── services/page.jsx
│   │   ├── contact/page.jsx
│   │   ├── api/
│   │   │   ├── buy-products/route.js
│   │   │   ├── buy-products/reorder/route.js
│   │   │   ├── rental-products/route.js
│   │   │   ├── rental-products/reorder/route.js
│   │   │   ├── sell-requests/route.js
│   │   │   ├── services/route.js
│   │   │   ├── testimonials/route.js
│   │   │   ├── customers/route.js
│   │   │   ├── contact/route.js
│   │   │   ├── upload/route.js
│   │   │   ├── admin/login/route.js
│   │   │   └── admin/logout/route.js
│   │   └── (admin)/
│   │       └── admin/
│   │           ├── layout.jsx
│   │           ├── page.jsx
│   │           ├── buy-products/
│   │           ├── rental-products/
│   │           ├── sell-requests/page.jsx
│   │           ├── services/page.jsx
│   │           ├── customers/page.jsx
│   │           └── testimonials/page.jsx
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   └── utils/
├── proxy.js
├── package.json
├── next.config.mjs
├── postcss.config.mjs
├── jsconfig.json
└── README.md
```

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/fcr.git
cd fcr
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

NEXT_PUBLIC_WHATSAPP_NUMBER="your_whatsapp_number"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"
JWT_SECRET="your_jwt_secret"

NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"
```

> Do not commit `.env.local` to version control.

---

## Database Setup

Generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

For production deployments:

```bash
npx prisma migrate deploy
```

---

## Cloudinary Configuration

Cloudinary is used for image uploads in this project. Configure the following environment variables in `.env.local`:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The Cloudinary client is initialized in `src/lib/cloudinary.js`.

---

## Running the Project

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Build & Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## User Module

### Rental

- Browse rental products with search and filters
- View product details with image gallery and specifications
- Add rental items to a cart and submit booking requests
- WhatsApp booking message integration

### Buy Products

- Browse used equipment with database-driven listings
- Search and filter products
- View product detail pages with specs and enquiry actions
- WhatsApp enquiry flow for purchases

### Sell Requests

- Submit sell requests with brand, model, condition, and expected price
- Upload images via Cloudinary
- Persist submissions through the backend API

### Services Booking

- Select photography and videography services
- Book service slots with form submissions
- Capture service booking requests through API

### Testimonials

- Submit testimonial content through the site
- Admin moderation for approval and display

---

## Admin Module

### Dashboard

- Admin overview entry page
- Access points for product, booking, customer, and testimonial management

### Rental Products

- Manage rental inventory from the admin portal
- Add, edit, and delete rental products
- Maintain availability and product details

### Buy Products

- Admin management for buy products
- Add, edit, and delete listings
- Update product status and category metadata

### Sell Requests

- Review and manage incoming sell requests
- Delete request records as needed

### Service Bookings

- View service booking submissions
- Manage booking status and details

### Customers

- List collected customers from application interactions
- Manage customer records in admin

### Testimonials Moderation

- Approve or reject testimonials
- Control testimonial display on the site

### Product Ordering (Drag & Drop)

- Reorder rental and buy products in admin
- Uses `@dnd-kit` for drag-and-drop sorting
- Saves `display_order` in the database
- User product lists render in the saved order

### Image Upload System

- Cloudinary-based image uploads for products and sell requests
- Backend upload/delete routes
- Product forms handle thumbnail and gallery image storage

---

## API Structure

| Route | Purpose |
| --- | --- |
| `/api/buy-products` | List and create buy products |
| `/api/buy-products/[id]` | Get, update, delete buy product |
| `/api/buy-products/reorder` | Save buy product display order |
| `/api/rental-products` | List and create rental products |
| `/api/rental-products/[id]` | Get, update, delete rental product |
| `/api/rental-products/reorder` | Save rental product display order |
| `/api/sell-requests` | Create and list sell requests |
| `/api/services` | Submit service bookings |
| `/api/testimonials` | Submit testimonials |
| `/api/customers` | List customer records |
| `/api/contact` | Contact form submissions |
| `/api/upload` | Upload and delete images |
| `/api/admin/login` | Admin login |
| `/api/admin/logout` | Admin logout |

---

## Deployment

Deploy this Next.js application on Vercel or any Node.js hosting provider that supports Next.js 16. Configure environment variables and apply Prisma migrations before starting.

---

## Author

Friendly Camera Rentals

---

## License

No license specified. Add a license file if you want to open source this repository.
