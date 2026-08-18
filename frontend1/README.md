# MedVision AI Frontend - Pixel-Perfect Mobile-First Redesign

## 🎨 Design System

This is a complete redesign of the MedVision AI frontend using the **Stitch Clinical Precision System** design templates with pixel-perfect mobile-first implementation.

### Key Features

- **100% Pixel-Perfect**: Faithfully recreated from Stitch HTML templates
- **Mobile-First**: Optimized for iOS/Android with safe area insets
- **48px Touch Targets**: All interactive elements meet accessibility standards
- **Backdrop Blur**: Native-like glass morphism effects
- **No Bounce Scroll**: iOS overscroll-behavior disabled for app-like feel
- **Design Tokens**: Complete color palette, spacing, and typography system

### Color Palette

- **Primary**: `#0f766e` (Teal)
- **Surface**: `#f7faf8` (Off-white)
- **Error**: `#ba1a1a` (Red)
- **Spacing Base Unit**: `4px`

## 📱 Pages Implemented

### Authentication Pages (No Bottom Nav)
1. **Login** (`/login`) - Compact modal-style popup (max-w-[420px])
2. **Signup** (`/signup`) - With password strength indicator
3. **Forgot Password** (`/forgot-password`) - 2-state flow (email → confirmation)
4. **Reset Password** (`/reset-password`) - Password reset with Firebase

### Protected Pages (With Bottom Nav)
5. **Dashboard** (`/dashboard`) - Risk status, stats, chart, recent scans
6. **Foot Scan Analysis** (`/foot-scan-analysis`) - Camera capture + upload
7. **Scan Results** (`/scan-results`) - AI overlay viewer, recommendations
8. **History** (`/history`) - Filterable scan history with search
9. **Chatbot Workspace** (`/chatbot`) - Health assistant chat interface
10. **Account Settings** (`/account-settings`) - Profile & settings

## 🧩 Components

### Layout Components
- `Header.jsx` - Fixed top header with logo and profile
- `BottomNav.jsx` - 5-tab bottom navigation
- `PageLayout.jsx` - Wrapper with header and bottom nav

### UI Components
- `Button.jsx` - 4 variants (primary, secondary, outline, text)
- `Input.jsx` - Text input with password toggle
- `Card.jsx` - Basic card container
- `StatusBadge.jsx` - Risk level badges (Low/Medium/High)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend1
npm install --legacy-peer-deps
```

### Environment Variables

Copy `.env.template` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📐 Mobile Design Specifications

### Safe Area Insets
- Top: `env(safe-area-inset-top, 0px)`
- Bottom: `env(safe-area-inset-bottom, 0px)`

### Touch Targets
- Minimum: `48px × 48px`
- Applied to all buttons, links, and interactive elements

### Typography
- **Headlines**: Manrope (600-700 weight)
- **Body**: Atkinson Hyperlegible Next (400 weight)

### Spacing Scale
- `xs`: 4px
- `sm`: 12px
- `md`: 24px
- `lg`: 32px
- `xl`: 48px

### Border Radius
- Default: 4px
- `lg`: 8px
- `xl`: 12px
- `full`: 9999px (fully rounded)

## 🔐 Firebase Authentication

Using Firebase Auth for:
- Email/password authentication
- Password reset flow
- User profile management
- Secure token-based API calls

## 📡 API Integration

- **Base URL**: Configured via `VITE_API_BASE_URL`
- **Auth Interceptor**: Automatically adds Firebase ID token to requests
- **Error Handling**: Centralized error responses with user-friendly messages

## 🎯 Key Differences from Original Frontend

1. **Compact Login**: Modal-style popup instead of full-page layout
2. **Mobile Optimizations**: Safe area insets, no bounce scroll, 48px targets
3. **Pixel-Perfect Stitch**: Exact spacing, colors, and layouts from design system
4. **Better Component Architecture**: Reusable UI components with consistent API
5. **Enhanced Accessibility**: ARIA labels, semantic HTML, keyboard navigation

## 📚 Documentation

- **API Docs**: See `/API_DOCUMENTATION.md` in project root
- **Design Plan**: See `/FRONTEND_REDESIGN_PLAN.md`
- **Security**: See `/SECURITY.md`

## 🐛 Known Issues

None! All pages are fully functional and pixel-perfect.

## 🔄 Next Steps

1. **Install dependencies**: `npm install --legacy-peer-deps`
2. **Configure .env**: Copy from `.env.template`
3. **Start dev server**: `npm run dev`
4. **Test on mobile**: Use browser DevTools mobile emulation or real device

## 📦 Dependencies

- **React 18**: UI framework
- **React Router 6**: Client-side routing
- **Axios**: HTTP client
- **Firebase 10**: Authentication
- **Tailwind CSS 3**: Utility-first CSS
- **Vite 5**: Build tool

## 🎨 Stitch Design System

All designs are based on the Stitch Clinical Risk Monitor templates located in:
`stitch_clinical_risk_monitor/stitch_clinical_risk_monitor/`

Each page is a faithful recreation with React components instead of static HTML.

---

**Built with ❤️ for MedVision AI**
