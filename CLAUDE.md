# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Run development server (opens http://localhost:3000)
- `npm test` - Run Jest test suite in watch mode
- `npm run build` - Build production bundle to build/ folder
- `npm run eject` - Eject from Create React App (one-way operation)

## Architecture Overview

This is a React portfolio management application built with Create React App. The architecture follows a component-based structure with Firebase backend integration.

### Key Technologies
- **Frontend**: React 19.1.0 with React Router DOM for routing
- **Styling**: Tailwind CSS (config at tailwind.config.js)
- **Backend**: Firebase (Auth, Firestore, Storage, Analytics)
- **Testing**: React Testing Library with Jest
- **Icons**: Lucide React
- **File Uploads**: Cloudinary integration with Multer

### Core Architecture Patterns

**Authentication Flow**: 
- Centralized auth state management via `src/contexts/AuthContext.js`
- Protected routes using `RequireAuth` and `RequireAdmin` components in `src/components/PrivateRoute.js`
- Firebase Auth integration in `src/firebase.js`

**Routing Structure**:
- Root redirects to `/dashboard`
- User dashboard routes nested under `UserLayout` component at `/dashboard/*`
- Admin routes protected at `/admin-dashboard/*`
- All user routes require authentication

**Firebase Configuration**:
- Environment variables support both CRA (REACT_APP_*) and Vite (VITE_*) formats
- Services: Auth, Firestore, Storage, Analytics (conditional)
- Configuration in `src/firebase.js` with fallback environment variable handling

### Component Organization

**Layout Components**:
- `UserLayout.js` - Main dashboard layout wrapper
- `PrivateRoute.js` - Authentication guards

**Feature Components** (in src/components/):
- User management: `UserProfile.js`, `UserManagement.js`, `UserRole.js`, `UserStatus.js`
- Content management: `Education.js`, `WorkManagement.js`, `PortfolioBuilder.js`
- Admin features: `AdminDashboard.js`, `TemplateEdit.js`, `TemplateStyle.js`
- Authentication: `Login.js`, `Signup.js`, `RegisterAdmin.js`

**Data Layer**:
- Firestore utilities in `src/lib/firestore.js`
- Firebase services exported from `src/firebase.js`

### Environment Setup

Requires Firebase configuration via environment variables:
- REACT_APP_FIREBASE_API_KEY / VITE_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN / VITE_FIREBASE_AUTH_DOMAIN  
- REACT_APP_FIREBASE_PROJECT_ID / VITE_FIREBASE_PROJECT_ID
- REACT_APP_FIREBASE_STORAGE_BUCKET / VITE_FIREBASE_STORAGE_BUCKET
- REACT_APP_FIREBASE_MESSAGING_SENDER_ID / VITE_FIREBASE_MESSAGING_SENDER_ID
- REACT_APP_FIREBASE_APP_ID / VITE_FIREBASE_APP_ID
- REACT_APP_FIREBASE_MEASUREMENT_ID / VITE_FIREBASE_MEASUREMENT_ID (optional)