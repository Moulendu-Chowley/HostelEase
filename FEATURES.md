# 🏠 HostelEase - Features & Pages Overview

HostelEase is an AI-powered smart hostel operations platform and digital warden designed to streamline residential operations. It features an App Router-based Next.js frontend, a Supabase database, and a FastAPI-based DeepFace facial recognition microservice.

---

## 🛠️ Tech Stack & Architecture

### Core Frontend
*   **Framework:** Next.js 15.1.9 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 3
*   **Animations:** Framer Motion for micro-interactions and transitions
*   **Charts:** Recharts for budgets, utility forecasting, and complaint intelligence trends

### Backend & Database (Supabase)
*   **Database:** PostgreSQL database with a normalized schema comprising 11+ tables
*   **Authentication:** Supabase Auth with custom role metadata (`student` vs. `admin`)
*   **Storage:** Supabase Storage (`student-photos` bucket) for reference facial photos
*   **Access Control:** Custom middleware protecting dashboard routes

### AI Facial Recognition Service
*   **Service Core:** Python FastAPI microservice running on port `8000`
*   **Core Model:** ArcFace model with a Cosine distance metric for verification

---

## 🔒 Role-Based Routing & Access Control

| Route Path | Admin (Warden) Access | Student Access | Route Context & Behavioral Rules |
| :--- | :---: | :---: | :--- |
| `/` | ✅ | ✅ | Public landing page |
| `/login` | ✅ | ✅ | Authentication portal |
| `/signup` | ✅ | ✅ | Registration portal |
| `/dashboard` | ✅ | ✅ | Dashboard Overview with **Hostel Health Score** integration |
| `/dashboard/warden-ai` | ✅ | ❌ | **Digital Warden Dashboard:** AI summaries, insights, security metrics |
| `/dashboard/attendance` | ✅ | ✅ | **Gate Camera Sensor:** Admin operates gate scanner; Student views stay stats |
| `/dashboard/rooms` | ✅ | ❌ | **Room Directory & Occupancy Map:** Digital twin visual map with status highlights |
| `/dashboard/allotment` | ✅ | ❌ | **Room Allotment & Matching:** Compatibility scores & AI pairings |
| `/dashboard/students` | ✅ | ❌ | **Student Directory:** Face registrations and uploader |
| `/dashboard/mess` | ✅ | ❌ | **Mess Management:** Weekly menus, AI mess planner, and committee rotation |
| `/dashboard/events` | ✅ | ✅ | **Events & Sports:** League tables and AI captain selector |
| `/dashboard/budget` | ✅ | ✅ | **Budget Dashboard:** Utility forecasting and expense Recharts |
| `/dashboard/leave` | ✅ | ✅ | **Leave Portal:** Apply (Student) & Approve/Reject (Admin) |
| `/dashboard/complaints` | ✅ | ✅ | **Complaints Portal:** File issue (Student) & triage with Root Cause analysis (Admin) |
| `/dashboard/emergency` | ✅ | ✅ | **SOS Alert Console:** Trigger SOS (Student) & resolve alert (Admin) |
| `/dashboard/hostelgpt` | ✅ | ✅ | **HostelGPT Agent:** Operations commands & chatbot |
| `/dashboard/inventory` | ✅ | ❌ | **Inventory Management:** CRUD directory of assets (fans, tables, beds) |

---

## 🖥️ Feature Implementations Status

### 🟢 Fully Implemented Features

1.  **Landing Page (`/`):** Hero section, dynamic metrics, and CTA triggers.
2.  **Authentication (`/login` & `/signup`):** Role-based Supabase Auth redirects.
3.  **Dashboard Overview (`/dashboard`):** Admin live check-in timeline & student roommates portal.
4.  **Digital Attendance (`/dashboard/attendance`):** Read-only stay stats (Student) & gate scanning interface (Admin).
5.  **Room Directory (`/dashboard/rooms`):** CRUD rooms list with floor information.
6.  **Leave Management (`/dashboard/leave`):** Student submission form & Warden approval interface.
7.  **Sports Leagues (`/dashboard/events`):** Football/Cricket leagues, points tables, and AI captain selectors.
8.  **Budgeting Dashboard (`/dashboard/budget`):** Utility tracking charts & bill forecasts.
9.  **Complaints Portal (`/dashboard/complaints`):** Low-to-critical category ticketing.
10. **SOS Emergency (`/dashboard/emergency`):** Simulated multi-step dispatch verification pipeline (Student trigger, Warden console).
11. **HostelGPT AI Chatbot (`/dashboard/hostelgpt`):** Dynamic rich text reply visual cards (vacant rooms, mess duties, absentees, utility forecast, floor complaints).

---

### 🟢 Implemented Upgrades (11/11 Upgrade List)

All advanced intelligence features have been fully implemented to elevate HostelEase into a panel-winning **AI-Powered Smart Hostel Operations Platform**:

#### 1. HostelGPT AI Operations Agent Actions
*   **Status:** *Fully Implemented*
*   **Goal:** Move HostelGPT from passive chat to active operations. Enable executing commands:
    *   *"Allocate Room 102 to Rahul Sharma"* (Calls API to register allotment)
    *   *"Escalate critical complaints to maintenance"* (Updates priority tickets in database)
    *   *"Generate and download monthly warden report"* (Triggers report generator)

#### 2. Digital Warden AI Dashboard (`/dashboard/warden-ai`)
*   **Status:** *Fully Implemented*
*   **Goal:** A new admin page consolidating:
    *   **Daily AI Summary:** Live statistics (curfew violations, active complaints, pending leaves).
    *   **AI Operations Insights:** Grouped recommendations (e.g. "Floor 3 plumbing issues increased by 28%, recommend pipeline inspection").
    *   **Predictive Maintenance Alerts:** Highlights areas likely to require repairs.

#### 3. Digital Twin Occupancy Map
*   **Status:** *Fully Implemented*
*   **Goal:** A visual grid layout on the Room Management page (`/dashboard/rooms`):
    *   Rooms color-coded: **Green** (Occupied), **Blue** (Vacant), **Yellow** (Maintenance), **Red** (Has Active Critical Complaint).
    *   Highlighting: Asking HostelGPT "Show problematic rooms" visually highlights the Red/Yellow rooms.

#### 4. Hostel Health Score Widget
*   **Status:** *Fully Implemented*
*   **Goal:** Integrate a daily health KPI (0-100) widget directly on the main Dashboard home:
    *   Sub-scores: Security, Maintenance, Mess, Attendance.
    *   Reflects live complaints, leave metrics, and security incidents.

#### 5. Complaint Root Cause Intelligence Engine
*   **Status:** *Fully Implemented*
*   **Goal:** Automatically cluster complaints:
    *   If multiple students in the same floor/wing report water leakage, flag a single root cause (e.g. "Suggested Root Cause: 2nd Floor Main Pipeline Breach").
    *   Expose this intelligence in the Complaints Dashboard.

#### 6. Smart Roommate Compatibility Matching
*   **Status:** *Fully Implemented*
*   **Goal:** Enhance Allotments (`/dashboard/allotment`):
    *   Implement an interactive Roommate Preference Form for students to answer compatibility questions (sleep schedule, study habits, department, interests).
    *   Calculate compatibility percentage (0-100%) and display matching badges on allotment cards.

#### 7. AI Mess Menu Recommendation Planner
*   **Status:** *Fully Implemented*
*   **Goal:** Add an interactive panel to Mess Management (`/dashboard/mess`):
    *   Analyze student feedback ratings, budget constraints, and current grocery inventory to recommend dishes.
    *   E.g., *"What should we cook tomorrow?"* -> *"Lunch: Rajma Rice (Reason: Rating: 4.8, Cost: Low, Inventory: Available)"*.

#### 8. Predictive Maintenance Forecasting
*   **Status:** *Fully Implemented*
*   **Goal:** Calculate failure probability trends for hostel assets (fans, plumbing, electrical).
    *   Displays forecast boxes on the Warden Dashboard (e.g. "Floor 2 electrical components require service in ~10 days").

#### 9. Smart Security Analytics Panel
*   **Status:** *Fully Implemented*
*   **Goal:** Create a security telemetry tracker on `/dashboard/warden-ai`:
    *   **Curfew Violations:** List of students entering after 10 PM.
    *   **Frequent Night Exits:** List of students frequently leaving after midnight.
    *   **Unknown Face Detections:** Camera scan failures and unregistered profile warnings.

#### 10. Auto Report Generator (PDF/CSV)
*   **Status:** *Fully Implemented*
*   **Goal:** Warden export tool. An export button to generate and download a comprehensive monthly operation report containing stats, expenses, complaints, and stay logs.

#### 11. Admin Asset & Inventory Management (`/dashboard/inventory`)
*   **Status:** *Fully Implemented*
*   **Goal:** A digital twin asset directory:
    *   List of fans, beds, water coolers, projectors.
    *   Allow the Admin/Warden to dynamically add new assets, update status, and track service history logs without QR scanning.

---

## 🔮 Implementation Checklist & Milestones

*   [x] App Router & Supabase Auth Foundations
*   [x] Basic Attendance log table & Facial Recognition canvas integration
*   [x] Basic CRUD for Rooms, Students, Complaints, and Leaves
*   [x] SOS Emergency dispatch pipeline (Student trigger, Warden console)
*   [x] HostelGPT chatbot interface (Student and Admin view)
*   [x] Milestone 1: Hostel Health Score & AI Warden Dashboard (`/dashboard/warden-ai`)
*   [x] Milestone 2: Digital Twin Room Map & Smart Roommate Matching (Form & Badges)
*   [x] Milestone 3: AI Mess Planner & Admin Asset Inventory Panel (`/dashboard/inventory`)
*   [x] Milestone 4: Smart Security Analytics & Complaint Root Cause Detection
*   [x] Milestone 5: HostelGPT AI Operations Agent Integration
*   [x] Milestone 6: Auto Report Exporter & Production Build Validation

---

**Created with ❤️ using Next.js, TypeScript, Supabase, and FastAPI DeepFace**
