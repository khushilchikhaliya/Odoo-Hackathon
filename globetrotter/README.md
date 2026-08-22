# GlobeTrotter — Empowering Personalized Travel Planning

Hackathon project: a multi-city travel planning platform built with Django
(backend + templates) and vanilla HTML/CSS/JS (frontend).

## Tech Stack
- Backend: Django (Python)
- Frontend: HTML5, CSS3, Vanilla JS
- Database: SQLite (dev) — relational structure, PostgreSQL-ready
- Auth: Django sessions

## Phase 1 — Project Setup (current)
- Django project + `core` app scaffolded
- Base template with navbar
- Static homepage rendering
- SQLite configured

## How to run
```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

Visit: http://127.0.0.1:8000/

## Roadmap
- Phase 2: User auth (signup/login/logout) + Dashboard
- Phase 3: Trip model + Create Trip + My Trips
- Phase 4: City & Activity search
- Phase 5: Itinerary builder (stops + activities)
- Phase 6: Budget & cost breakdown
- Phase 7: Calendar/timeline view
- Phase 8: Public/shared itinerary
- Phase 9: Profile/settings
- Phase 10: Admin/analytics dashboard
