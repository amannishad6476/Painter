# Munnalal Painter 🎨 - Professional Painting & Home Renovation Services

A modern, high-performance web application built for **Munnalal Painter**, a premier painting contractor providing professional residential and commercial painting solutions in **Lucknow, Uttar Pradesh, India**.

🌐 **Live Website**: [https://munnalalpainter.in](https://munnalalpainter.in/)

---

## 📌 About the Project

The **Munnalal Painter** web application is designed to help homeowners, business owners, and property managers in Lucknow seamlessly discover professional painting services. Through this platform, customers can:

- Explore a comprehensive catalog of interior, exterior, and specialized decorative painting services.
- Estimate painting project costs instantly using an interactive square-foot price calculator.
- View a showcase of completed projects with before/after transformations and video walk-throughs.
- Read verified customer reviews and submit custom feedback.
- Contact the business directly via instant WhatsApp chat, phone calls, or online estimate requests.
- Manage website content dynamically through an integrated Admin CMS Dashboard.

---

## ✨ Features

- 🏠 **Comprehensive Service Catalog**: Detailed pages for interior, exterior, texture, waterproofing, POP, wood polish, and full house painting services.
- 🧮 **Interactive Price Estimator**: Instant cost estimates based on carpet area (sq.ft) and selected paint quality tier.
- 🖼️ **Project Gallery**: Interactive before/after comparisons and video showcases highlighting completed projects across Lucknow.
- ⭐ **Customer Reviews & Testimonials**: Interactive rating system allowing customers to submit reviews.
- 💬 **Instant Contact CTAs**: Floating WhatsApp and direct call buttons for immediate site inspection requests.
- 🔐 **Admin CMS Panel**: Secure administration dashboard to manage services, gallery items, reviews, banner text, and leads.
- 🗄️ **Persistent REST API & Database**: Express backend connected to Neon PostgreSQL Database with local offline persistent storage fallback.
- 📱 **Mobile-First & Responsive**: Fully optimized layout for mobile devices, tablets, and desktops.
- ⚡ **SEO Optimized**: Pre-configured meta tags, Schema.org local business structured data, and canonical URL setup.

---

## 🛠️ Services Offered

| Service | Description | Typical Scope |
| :--- | :--- | :--- |
| **Interior Painting** | Premium interior wall coatings, crack filling, and smooth velvet finishes. | Living rooms, bedrooms, kitchens, offices |
| **Exterior Painting** | Weather-proof, UV-resistant exterior wall coatings protecting against Lucknow climate. | Villas, apartments, commercial buildings |
| **Texture Painting** | Luxury feature walls including 3D metallic, Royale Play, velvet, and stencil patterns. | Accent walls, living rooms, hotel foyers |
| **Wall Putty** | High-grade white cement putty application ensuring smooth level bases. | Pre-paint wall preparation & sanding |
| **Waterproofing** | Advanced elastomeric damp-proof sealants for roofs, terraces, and damp walls. | Damp walls, roof slabs, bathrooms |
| **POP Design** | Modern false ceilings, plaster mouldings, cornices, and LED groove prep. | Ceilings, hall lighting grooves |
| **Wood Polish** | Polyurethane (PU), melamine, and spirit polish for wooden doors and furniture. | Main doors, staircases, wooden cabinets |
| **Full House Painting** | Complete end-to-end dust-free machine sanding, putty, and paint transformation. | 1BHK - 5BHK flats, duplexes, bungalows |

---

## 🧰 Technologies Used

### Frontend
- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Middleware**: `cors`, `dotenv`
- **Database**: [Neon Database](https://neon.tech/) (Serverless PostgreSQL) / PostgreSQL via `pg`

### Deployment
- **Hosting Platform**: [Vercel](https://vercel.com/) (Serverless Function Architecture for Backend & Static Hosting for Frontend)

---

## 📁 Project Structure

```text
Painter/
├── backend/                  # Express REST API server
│   ├── config/               # Database client connection configuration
│   ├── db/                   # Table initialization & initial data seeding
│   ├── routes/               # API route endpoints (services, gallery, leads, auth)
│   ├── server.js             # Entry point for Node.js Express backend
│   ├── package.json          # Backend dependencies & scripts
│   └── vercel.json           # Vercel Serverless configuration for backend
├── public/                   # Static assets & favicon files
├── src/                      # React frontend application
│   ├── components/           # UI components
│   │   ├── About.jsx         # About company section
│   │   ├── AdminPanel.jsx    # CMS Content Management Dashboard
│   │   ├── Contact.jsx       # Contact form & location map details
│   │   ├── FloatingCTA.jsx   # Quick action call/WhatsApp floating buttons
│   │   ├── Footer.jsx        # Website footer
│   │   ├── Gallery.jsx       # Photo/Video portfolio gallery
│   │   ├── Hero.jsx          # Hero banner section
│   │   ├── Navbar.jsx        # Navigation header
│   │   ├── PriceEstimate.jsx # Interactive sq.ft cost calculator
│   │   ├── ReviewModal.jsx  # Customer review submission modal
│   │   ├── SEO.jsx           # Dynamic Meta Tags & Schema.org JSON-LD
│   │   ├── ServicePage.jsx   # Individual service detail pages
│   │   ├── Services.jsx      # Service cards grid
│   │   └── Testimonials.jsx  # Customer reviews section
│   ├── context/
│   │   └── cmsContext.jsx    # React CMS Context State & Backend API sync logic
│   ├── App.jsx               # Application main layout & routing logic
│   ├── index.css             # Tailwind CSS base styles & design system tokens
│   └── main.jsx              # React application root DOM renderer
├── index.html                # Main HTML page template
├── package.json              # Client dependencies & scripts
├── tailwind.config.js        # Tailwind CSS styling configuration
├── vercel.json               # Vercel deployment configuration for client
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Clone the Repository

```bash
git clone https://github.com/amannishad6476/Painter.git
cd Painter
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

*(Note: If `DATABASE_URL` is omitted, the backend will automatically fall back to local persistent storage for development).*

### 5. Run the Application

Start the backend server:

```bash
npm run backend
```

In a separate terminal, start the frontend development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📦 Building & Deployment

### Production Build

To build the client application for production:

```bash
npm run build
```

The optimized static assets will be generated in the `dist/` directory.

### Deploying to Vercel

This repository is pre-configured for seamless serverless deployment on [Vercel](https://vercel.com/):

1. **Deploy Backend (`/backend`)**:
   - Import the repository and set the **Root Directory** to `backend`.
   - Add the `DATABASE_URL` environment variable under Vercel project settings.
   - Deploy to get your live backend URL (e.g. `https://painter-backend.vercel.app`).

2. **Deploy Frontend (Root `/`)**:
   - Import the repository and leave the **Root Directory** as `./`.
   - Add the environment variable: `VITE_API_URL=https://painter-backend.vercel.app`.
   - Deploy to connect the frontend to your live backend server.

---

## 🔍 Search Engine Optimization (SEO)

The website incorporates comprehensive SEO best practices:

- **Canonical URL**: `https://munnalalpainter.in/`
- **Target Keywords**: *Painter in Lucknow, House Painting Services Lucknow, Wall Putty Lucknow, Texture Painter Gomti Nagar, Waterproofing Lucknow*.
- **Structured Data**: `LocalBusiness` JSON-LD schema embedded dynamically in `src/components/SEO.jsx` for enhanced Google Search Rich Snippets.
- **Social Sharing**: Open Graph (`og:title`, `og:image`, `og:description`) and Twitter Card tags.

---

## 🌐 Domain Information

- **Primary Domain**: [https://munnalalpainter.in](https://munnalalpainter.in/)
- **Alternative Access**: [https://www.munnalalpainter.in](https://www.munnalalpainter.in)

---

## 📞 Contact & Business Information

- **Business Name**: Munnalal Painter
- **Service Category**: House Painting, Waterproofing & Home Renovation Contractor
- **Primary Service Location**: Lucknow, Uttar Pradesh, India
- **Key Coverage Areas**: Gomti Nagar, Hazratganj, Alambagh, Indira Nagar, Mahanagar, Ashiyana, Jankipuram, Vikas Nagar
- **Contact Phone**: `+91 76684 15684` / `+91 83037 19864` *(or `[Add phone number]`)*
- **Contact Email**: `info@lucknowpainter.in` *(or `[Add email address]`)*

---

## 🔮 Future Improvements

- [ ] **AI Wall Color Visualizer**: Interactive tool allowing users to preview paint shades on uploaded room photos.
- [ ] **Real-Time Job Tracking**: Customer dashboard to monitor daily painting progress and milestone photos.
- [ ] **Automated Booking Calendar**: Instant scheduling for free on-site measurements and inspections.
- [ ] **Multi-Language Support**: Option to toggle between English and Hindi text.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

*Copyright © 2026 Munnalal Painter. All Rights Reserved.*
