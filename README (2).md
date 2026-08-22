# GlobeTrotter 🌍✈️
> **Empowering Personalized Multi-City Travel Planning**  
> *Built for the Odoo Hackathon*

---

## 🌟 Overview & Vision
**GlobeTrotter** is a personalized, intelligent, and collaborative web application designed to simplify the complexity of planning multi-city travel. It empowers travelers to dream, design, budget, and share end-to-end itineraries with complete visibility and interactive control.

---

## 🚀 Live Servers
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Credentials (1-Click Login Enabled)

| Role | Email | Password | Quick Action |
|------|-------|----------|--------------|
| **Traveler Demo** | `demo@globetrotter.com` | `password123` | Click *"Traveler Demo"* button on Login screen |
| **Admin Demo** | `admin@globetrotter.com` | `admin123` | Click *"Admin Demo"* button on Login screen |

---

## 📱 13 Core Screens & Features

1. **Login / Signup Screen (`/login`, `/register`)**
   - Clean split-screen travel visual hero and card UI.
   - 1-Click Instant Demo Login for Traveler and Administrator.
   - Forgot Password modal with simulated reset authorization.
   - Form validation, password hashing with bcrypt, JWT token authentication.

2. **Dashboard / Home Screen (`/dashboard`)**
   - Dynamic greeting adapting to time of day (*Good morning / afternoon / evening*).
   - Summary metric badges: Total Trips, Planned Destinations, Budget Managed, Travel Style.
   - Primary "Plan New Trip" CTA button and quick destination explorer.
   - Active and upcoming trip cards with progress meter and quick actions.
   - Trending destination city recommendations carousel.

3. **Create Trip Screen (`/trips/new`)**
   - Trip title, travel start and end dates with real-time total duration counter.
   - Target budget amount with multi-currency selector ($ USD, € EUR, ₹ INR, £ GBP, ¥ JPY, A$ AUD).
   - Travel style selection (Adventure, Cultural, Foodie, Luxury, Backpacker, Balanced).
   - Visual cover photo gallery presets + custom photo URL support.
   - Optional initial starting city selection.

4. **My Trips Screen (`/trips`)**
   - Grid and List view switchers.
   - Instant search keyword filter and status tabs (*All, Upcoming, Ongoing, Completed, Draft*).
   - Trip summary cards displaying date range, stop counts, and budget utilization progress bar.
   - Actions dropdown: View Itinerary, Edit Builder, Cost Breakdown, Clone Trip, Share, Delete.

5. **Itinerary Builder Screen (`/trips/:id/builder`)**
   - Add, edit, remove, and reorder destination stops with up/down controls.
   - Assign stay accommodation costs and transport modes (Flight, Train, Bus, Car, Ferry) with costs.
   - Add activities from curated city catalog or create custom activities with time slots and categories.
   - Live budget computation widget reflecting expenses in real-time.

6. **Itinerary View Screen (`/trips/:id`)**
   - Day-by-day structured layout with destination city headers and photo cards.
   - Scheduled activity blocks with time pills, category tags, duration, and cost badges.
   - View mode toggle: **Day-Wise List**, **Interactive Vertical Timeline**, and **Calendar Grid**.
   - Print / Save as PDF export button and public sharing modal.

7. **City Search & Explore Screen (`/cities`)**
   - Global destination catalog (Paris, Tokyo, Rome, Barcelona, Bali, New York, Cape Town, Bangkok, Sydney, Jaipur, Dubai, Amsterdam).
   - Filters: Region/Continent, Cost Index ($ to $$$$$), Popularity score, and search queries.
   - City details modal featuring top recommended sights, average daily cost, and 1-click *"Add to Trip"* action.
   - Saved Destinations wishlist toggle.

8. **Activity Search & Catalog Screen (`/activities`)**
   - Browse activities by Category (*Sightseeing, Food & Dining, Adventure, Culture, Nightlife*).
   - Filters: City filter, Max Price slider, Duration filter, and keyword search.
   - Quick view modal with detailed description, ratings, pricing, and 1-click assignment to any trip day.

9. **Trip Budget & Cost Breakdown Screen (`/trips/:id/budget`)**
   - Comprehensive financial dashboard: Target Budget, Total Estimated Cost, Surplus/Deficit.
   - **Interactive Category Donut Chart** (Accommodations, Transport, Sights, Food, Adventure, Culture, Nightlife).
   - **Interactive Day-by-Day Bar Chart** highlighting days exceeding daily allowances.
   - Average cost per day calculation and smart budget optimization alerts.
   - Category expense itemization breakdown table.

10. **Trip Calendar & Timeline Screen (`/trips/:id/calendar`)**
    - Multi-day calendar view with date strip carousel.
    - Clickable day tabs with expandable activity schedules.
    - Vertical timeline with milestone connectors and status completion toggles.

11. **Public / Shared Itinerary Screen (`/share/:token`)**
    - Shareable standalone link accessible by anyone without login.
    - Rich read-only presentation of route stops, daily timeline, and cost breakdown.
    - **"Clone / Copy Trip to My Account"** CTA to immediately copy the entire trip into user's account.
    - 1-Click Social sharing (Copy Link, Twitter/X, WhatsApp).

12. **User Profile & Settings Screen (`/profile`)**
    - Update name, avatar photo, bio / travel motto, and language.
    - Global currency preference switcher ($ USD, € EUR, ₹ INR, £ GBP, ¥ JPY, A$ AUD).
    - Travel style preferences.
    - Saved destination wishlist management.
    - Password update form and account deletion danger zone.

13. **Admin & Analytics Dashboard (`/admin`)**
    - Platform KPIs: Total Registered Users, Total Trips Created, Multi-city Stops, Budget Volume.
    - Popularity charts: Top Visited Cities and Activity Category Distribution.
    - User Management Directory: List all registered travelers, toggle Admin role, remove user.
    - Real-time Platform Audit Log stream.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphism & Animations
- **Icons**: Lucide React
- **Charts & Visualizations**: Chart.js & React-Chartjs-2
- **State & Context**: AuthContext (JWT/Sessions) & CurrencyContext (Multi-Currency converter)

### Backend
- **Server**: Express.js REST API
- **Database**: SQLite with SQL relational schemas, foreign keys, and indexes
- **Security**: JWT Authentication, bcrypt password hashing, input sanitization

---

## 🏃 How to Run Locally

### 1. Backend Server
```bash
cd server
npm install
npm run seed     # Pre-populates cities, activities, demo user & admin
npm start        # Starts server on http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev      # Starts client on http://localhost:3000
```
