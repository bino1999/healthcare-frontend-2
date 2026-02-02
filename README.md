# Healthcare Management Frontend

React frontend application for Healthcare Management System using Directus as backend.

## Features

✅ **Authentication & Authorization**
- Login/Logout
- Role-based access (Doctor vs Hospital Staff)

✅ **Patient Management (CRUD)**
- Create patients (Doctor only)
- View all patients (Both roles)
- Edit patients (Doctor only)
- Delete patients (Doctor only)

✅ **Dashboards**
- Doctor Dashboard: Full CRUD access to patients
- Staff Dashboard: View-only access to patients

## Folder Structure

```
healthcare-frontend/
├── src/
│   ├── api/                    # API layer
│   │   ├── directus.js        # Directus connection
│   │   ├── auth.js            # Authentication API
│   │   └── patients.js        # Patients API
│   │
│   ├── pages/                  # Page components
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── StaffDashboard.jsx
│   │   ├── CreatePatientPage.jsx
│   │   └── EditPatientPage.jsx
│   │
│   ├── components/             # Reusable components
│   │   └── Navbar.jsx
│   │
│   ├── utils/                  # Helper functions
│   │   └── auth.js
│   │
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # Entry point
│   └── styles.css              # Global styles
│
├── .env                        # Environment variables
├── package.json
└── vite.config.js
```

## Prerequisites

- Node.js 18+ installed
- Directus backend running (default: http://localhost:8055)
- Directus collections set up:
  - `Patient` collection
  - User roles: `Doctor` and `Hospital Staff`

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Directus URL:**
Edit `.env` file and update your Directus URL:
```
VITE_DIRECTUS_URL=http://localhost:8055
```

3. **Start development server:**
```bash
npm run dev
```

The app will run on `http://localhost:3000`

## Usage

### Login
1. Go to `http://localhost:3000`
2. Enter your Directus email and password
3. You'll be redirected based on your role:
   - **Doctor** → Doctor Dashboard (full CRUD)
   - **Hospital Staff** → Staff Dashboard (view only)

### Doctor Features
- View all patients in a table
- Create new patients
- Edit existing patients
- Delete patients

### Staff Features
- View all patients in a table (read-only)

## Directus Setup Requirements

### Collections

**Patient Collection Fields:**
- `id` (UUID, Primary Key)
- `patient_name` (String, required)
- `mrn` (String, required, unique)
- `date_of_birth` (Date, required)
- `NRIC` (String, required)
- `gender` (String, required)
- `contact_number` (String, required)
- `email` (String, optional)
- `date_created` (Timestamp)
- `created_doctor` (Many-to-One relationship to directus_users)

### Roles & Permissions

**Doctor Role:**
- Patient collection: Create, Read, Update, Delete

**Hospital Staff Role:**
- Patient collection: Read only

## Build for Production

```bash
npm run build
```

The production files will be in the `dist/` folder.

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Directus SDK** - Backend connection
- **CSS** - Styling

## Project Structure Benefits

✅ **Organized API Logic** - All API calls in dedicated files
✅ **Easy to Find** - Need patient API? Check `api/patients.js`
✅ **No Duplication** - Reusable API methods across pages
✅ **Easy to Update** - Change API logic in one place
✅ **Team Friendly** - Different devs can work on different API files
✅ **Simple** - Junior devs can understand in 1 hour

## Common Issues

### CORS Error
If you get CORS errors, make sure your Directus backend allows requests from `http://localhost:3000`.

In Directus `.env` file:
```
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000
```

### Authentication Failed
Make sure:
1. Directus is running
2. The user exists in Directus
3. The user has the correct role assigned

### Cannot Create/Edit/Delete
Check that:
1. You're logged in as a Doctor
2. The Doctor role has proper permissions in Directus

## Next Steps

To add more features:
1. **Admissions** - Add `api/admissions.js` and admission pages
2. **Insurance** - Add `api/insurance.js` and insurance pages
3. **Procedures** - Add `api/procedures.js` and procedure pages
4. **Referrals** - Add `api/referrals.js` and referral pages

Follow the same pattern as the patient API for consistency!
