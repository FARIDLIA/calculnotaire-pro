# CalcuNotaire Pro - Design Guidelines

## Design Approach

**System: Professional Fintech/Legaltech Design System**

Drawing inspiration from established French professional tools (impots.gouv.fr for trust) combined with modern fintech aesthetics (Stripe's clarity, Qonto's professionalism). This application demands credibility, precision, and effortless navigation through complex financial calculations.

**Core Principles:**
- Trust & Authority: Every element reinforces professional credibility
- Progressive Disclosure: Complex information revealed logically across 6 wizard steps
- Real-time Feedback: Live calculation panel maintains context throughout journey
- Accessibility First: Financial tools must be universally usable (AA compliance)

## Color Palette

**Light Mode:**
- Primary Brand: 215 85% 25% (Deep authoritative blue - trust and finance)
- Primary Hover: 215 85% 20%
- Secondary Accent: 160 50% 45% (Balanced teal for confirmations/success)
- Background Base: 0 0% 100%
- Background Subtle: 210 20% 98%
- Background Card: 0 0% 100%
- Border Default: 214 15% 91%
- Border Focus: 215 85% 55%
- Text Primary: 222 47% 11%
- Text Secondary: 215 16% 47%
- Text Muted: 215 14% 71%

**Dark Mode:**
- Primary Brand: 215 80% 60%
- Primary Hover: 215 80% 55%
- Secondary Accent: 160 45% 55%
- Background Base: 222 47% 11%
- Background Subtle: 217 33% 17%
- Background Card: 217 33% 15%
- Border Default: 215 20% 25%
- Border Focus: 215 80% 50%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%
- Text Muted: 215 15% 50%

**Semantic Colors:**
- Success: 142 71% 45% (green for exemptions, validated calculations)
- Warning: 38 92% 50% (amber for alerts, compliance notices)
- Error: 0 72% 51% (red for validation errors, tax liabilities)
- Info: 199 89% 48% (cyan for DVF comparables, informational notices)
- Tax Highlight: 38 100% 95% (very light amber background for tax amounts in light mode) / 38 50% 15% (dark mode)

## Typography

**Font Families:**
- Primary: 'Inter' (via Google Fonts) - Professional, highly readable for numbers and forms
- Monospace: 'JetBrains Mono' - For financial figures, calculations, formulas

**Scale & Hierarchy:**
- Display (Hero/Marketing): text-5xl (48px), font-bold, tracking-tight
- H1 (Page Title): text-3xl (30px), font-semibold, tracking-tight
- H2 (Section): text-2xl (24px), font-semibold
- H3 (Subsection): text-xl (20px), font-semibold
- H4 (Card Title): text-lg (18px), font-medium
- Body Large: text-base (16px), font-normal
- Body: text-sm (14px), font-normal
- Small: text-xs (12px), font-normal
- Financial Figures: text-lg to text-2xl, font-mono, font-semibold

## Layout System

**Spacing Primitives:**
- Core units: 2, 4, 6, 8, 12, 16, 24 (tailwind units)
- Form spacing: gap-6 between major sections, gap-4 within groups
- Card padding: p-6 (desktop), p-4 (mobile)
- Section margins: mb-8 to mb-12
- Wizard step container: max-w-4xl mx-auto px-4

**Grid System:**
- Wizard Main Content: Single column max-w-2xl for forms
- Results Panel: Sticky sidebar (lg:w-96) on desktop, expandable drawer on mobile
- Admin Tables: Full-width responsive tables with horizontal scroll
- DVF Comparables: Grid 1/2/3 columns (sm/md/lg)

## Component Library

### Navigation
- **Wizard Progress**: Horizontal step indicator with numbered circles, connecting lines, completed/current/future states
- **Admin Sidebar**: Vertical navigation with icons, active state highlighting, collapsible on mobile

### Forms
- **Input Fields**: Rounded borders (rounded-md), focus ring (ring-2 ring-primary), clear labels above, helper text below in text-muted
- **Currency Inputs**: Right-aligned monospace text, € symbol suffix, thousands separator
- **Date Pickers**: Calendar dropdown with French locale, clear format display (DD/MM/YYYY)
- **Autocomplete**: Dropdown with search, highlights matching text, shows commune + INSEE code
- **Radio Groups**: Card-based selection for major choices (PP/SCI IR/SCI IS, RP/RS/1st sale), visual differentiation with border-2 on selected
- **Checkboxes**: Large touch targets, clear labels, used for exemption conditions

### Data Display
- **Results Panel**: Sticky card with sections: Gross Capital Gain, Tax Breakdown (IR/PS/Surcharge), Exemptions Applied, Net Proceeds. Each value in large monospace font with label
- **Calculation Breakdown**: Accordion or tabbed sections showing formulas step-by-step
- **DVF Comparables**: Cards with property image placeholder, address, price, date, link to Etalab
- **DMTO Table**: Striped rows, sortable columns, version badge, source link icon
- **Alert Banners**: Full-width colored backgrounds (warning/info/success) with icon, bold message, dismissible

### Actions
- **Primary Button**: Solid background (bg-primary), white text, rounded-lg, shadow-sm, px-6 py-3
- **Secondary Button**: Outline (border-2 border-primary), primary text, rounded-lg, px-6 py-3
- **Wizard Navigation**: Previous (secondary), Next/Calculate (primary), fixed bottom bar on mobile
- **Paywall CTA**: Large prominent button, contrasting color, micro-animation on hover
- **Icon Buttons**: For admin actions, hover states with tooltip

### Overlays
- **Modals**: Centered, max-w-lg, backdrop blur, used for confirmations, previews
- **Paywall**: Full-screen overlay with pricing cards, feature comparison, payment form integration
- **PDF Preview**: Full-screen modal with download/share actions

### Specialized Components
- **Tax Bracket Visualizer**: Horizontal bar chart showing surcharge calculation by tranches (if PV > 50k€)
- **Net Proceeds Waterfall**: Visual breakdown from sale price → net in pocket with each deduction shown
- **Version Badge**: Small pill showing "DMTO v2025-06" with link icon to source
- **Compliance Checklist**: Green checkmarks or red X's with explanation text for exemption conditions
- **Legal Disclaimer Banner**: Distinct visual treatment (border-l-4 border-warning) with official text

## Animations

**Minimal, Purposeful Only:**
- Wizard step transitions: Subtle fade + slide (200ms)
- Live calculation updates: Number count-up animation (300ms) when values change
- Form validation: Shake animation on error (400ms)
- NO decorative animations, parallax, or scroll effects

## Images

**Strategic Use:**
- **Marketing Pages Only**: Hero section with professional imagery (notary office, documents, French architecture) - blurred background, text overlay
- **Application UI**: Icon-based, no decorative images
- **DVF Comparables**: Property image placeholders with fallback to property type icon
- **Admin**: Data-focused, no images needed

**Hero Image (Marketing/Landing only):**
Large hero banner (h-[70vh]) with professional photograph: elegant French notary office or real estate documents, subtle gradient overlay (from-slate-900/80 to-transparent), centered heading + tagline + CTA

## Platform-Specific Notes

**Desktop (lg+):**
- Two-column layout: Wizard form (flex-1) + sticky results panel (w-96)
- Full wizard progress at top
- Horizontal button groups

**Tablet (md):**
- Single column with expandable results drawer
- Condensed wizard progress

**Mobile:**
- Full-width forms, large touch targets (min 44px)
- Fixed bottom navigation bar for wizard
- Results panel as collapsible sticky bottom sheet
- Simplified tables with card view

**Admin Back-Office:**
- Professional dashboard aesthetic
- Data tables with filter/search
- CSV upload with drag-drop zone
- Version publishing workflow with confirmation dialog
- Audit logs with timestamp + user + action details

This design system creates a professional, trustworthy environment for complex financial calculations while maintaining clarity and usability throughout the 6-step wizard journey.