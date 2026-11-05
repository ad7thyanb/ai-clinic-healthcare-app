# AI Clinic & Healthcare Management

A web platform for clinic operations and patient experience. It brings appointment booking, live triage status, role-based dashboards and an AI assistant into one app.

Built with Google AI Studio (Gemini) as part of the Ziro Digital Internship, AI Product App Engineer track.

**Live app:** https://ai.studio/apps/ec1e75fd-e7eb-492e-a1d1-fc7bc65a27de

> **Disclaimer:** This is a student/demo project. It uses sample data only and is not a certified medical or compliance-ready system. Do not enter real patient information.

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

## Team

- `<Your name>`: data and analytics (SQL, analysis, dashboards)
- `<Teammate 2>`: `<role>`
- `<Teammate 3>`: `<role>`

## Roadmap

- Connect analytics dashboards (SQL and Power BI) to clinic data
- Retrieval-augmented AI assistant over clinic information
- Patient intake and document upload
- Expanded reporting for clinic operations

## License

Add a license of your choice (for example MIT) before sharing publicly.
