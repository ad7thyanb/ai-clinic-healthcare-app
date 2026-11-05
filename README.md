## AI Clinic & Healthcare Management

A web platform for clinic operations and patient experience. It brings appointment booking, live triage status, role-based dashboards and an AI assistant into one app.

Built with Google AI Studio (Gemini) as part of the Ziro Digital Internship, AI Product App Engineer track.

**Live app:** https://ai.studio/apps/ec1e75fd-e7eb-492e-a1d1-fc7bc65a27de

> **Disclaimer:** This is a student/demo project. It uses sample data only and is not a certified medical or compliance-ready system. Do not enter real patient information.

## Project Status
 Currently in Development

## Features

- **Home / landing page** with an overview of the platform and quick access to the dashboards
- **Doctors directory** to browse physicians and book appointments
- **Role-based dashboards**
  - **Physician dashboard:** doctors see notifications and appointment updates only for patients assigned to them
  - **Clinic staff / admin dashboard:** staff see real-time updates and notifications for all appointments across departments
  - **Appointment management:** create appointments, update their status and check patients in
- **Live Status:** a live triage queue and appointment counters that update in real time
- **AI Assistant:** a chat assistant powered by Gemini
- **Authentication:** secure sign-in with Supabase
- **Real-time updates:** appointment changes are streamed to dashboards using Server-Sent Events (SSE)

## Tech stack

- **Frontend:** React with TypeScript
- **Backend:** Node.js REST API (`/api/appointments` routes)
- **Auth & database:** Supabase
- **AI:** Google Gemini, via Google AI Studio
- **Real-time:** Server-Sent Events (SSE)

## Project structure

Key components:

```
AdminDashboard.tsx         Clinic admin dashboard
StaffDashboard.tsx         Clinic staff dashboard
AppointmentManagement.tsx  Create, update and check in appointments
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/appointments` | Create an appointment |
| PUT | `/api/appointments/:id/status` | Update appointment status |
| PUT | `/api/appointments/:id/check-in` | Check in a patient |
| GET | `/api/tests/run` | Run the backend acceptance test suite |

## Testing

- TypeScript type-check passes with no errors (`tsc --noEmit`)
- Production build compiles successfully (`npm run build`)
- 27 automated backend acceptance tests, all passing, covering the appointment creation, status update and check-in workflow with real-time streaming

## Data & Analytics

This part of the project covers the data side of a clinic: a SQL schema, KPI queries, exploratory analysis and a simple prediction model. It runs on **synthetic data** (6,000 generated appointments over 6 months), so no real patient information is used.

### What's included

| Folder | Contents |
|---|---|
| `data/` | `generate_sample_data.py` creates `appointments.csv` and `doctors.csv` with a fixed random seed |
| `sql/` | `schema.sql` (PostgreSQL/Supabase-compatible tables) and `kpi_queries.sql` (6 KPI queries using aggregation, `CASE`, and a `RANK()` window function) |
| `analysis/` | `clinic_analysis.py` runs the KPIs, charts and no-show model |
| `images/` | Charts produced by the analysis |

### KPIs tracked

- Monthly appointment volume and completion rate
- No-show rate by department, booking lead time and hour
- Average wait time by triage level
- Busiest hours of the day
- Doctor workload ranking within each department

### Sample results (on the synthetic data)

- 6,000 appointments, 76.0% completed, 16.2% no-shows
- Average wait time for completed visits: about 26 minutes
- No-show rates rise as the booking lead time gets longer (built into the generated data, and the analysis recovers it)

![Monthly volume](images/monthly_volume.png)
![No-show by lead time](images/noshow_by_lead_time.png)
![Wait by triage](images/wait_by_triage.png)

### No-show prediction model

A logistic regression predicts whether an appointment will end in a no-show, using lead time, hour, triage level, department, visit type, age group and day of week.

- ROC-AUC: **0.63** on a held-out 25% test set. The signal in this synthetic data is weak, so this is a baseline and not a production-ready model.
- The model uses class weighting to handle the imbalance between no-shows and attended visits.
- Next steps would be trying tree-based models, adding features such as patient history, and tuning the decision threshold.

![Top drivers of no-shows](images/noshow_drivers.png)

### Run the analysis

```bash
pip install -r analysis/requirements.txt
python data/generate_sample_data.py
python analysis/clinic_analysis.py
```

The SQL files can be run in Supabase (PostgreSQL) after importing `data/appointments.csv` into an `appointments` table.

## Getting started

### Prerequisites

- Node.js 18 or newer
- A Supabase project
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Setup

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

Create a `.env` file in the project root. **Never commit this file.**

```
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Roadmap

- Connect Power BI dashboards to the clinic data
- Replace synthetic data with live Supabase data (with proper de-identification)
- Retrieval-augmented AI assistant over clinic information
- Patient intake and document upload
- Expanded reporting for clinic operations


