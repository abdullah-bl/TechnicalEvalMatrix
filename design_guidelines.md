# Design Guidelines: Technical Evaluation Matrix Application

## Design Approach: Minimal Productivity System

**Selected Approach**: Clean, functional design system inspired by Linear and Notion
**Rationale**: Data-heavy evaluation tool requiring clarity, efficiency, and Arabic RTL support
**Core Principle**: Information hierarchy through spacing and typography, not decorative elements

---

## Typography System

**Font Family**: 
- Primary: 'Inter' or 'IBM Plex Sans Arabic' (excellent Arabic support)
- Monospace: 'JetBrains Mono' for numerical scores

**Type Scale**:
- Page Title: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Criteria/Company Names: text-base font-medium
- Body/Labels: text-sm
- Scores/Percentages: text-2xl font-bold (tabular numbers)
- Helper Text: text-xs

---

## Layout & Spacing System

**Tailwind Units**: Consistently use 4, 6, 8, 12, 16 spacing units
- Component padding: p-6 or p-8
- Section gaps: space-y-8 or space-y-12
- Card margins: m-4
- Input spacing: space-y-4

**Page Structure**:
- Single page container: max-w-6xl mx-auto px-6 py-12
- Workflow steps displayed as collapsible sections with clear visual states
- Print layout: Separate optimized view triggered by print button

**RTL Support**: Full Arabic RTL with dir="rtl" and proper text alignment

---

## Component Library

### Core Navigation
**Step Indicator**: Horizontal progress steps (Setup Criteria → Add Competitors → Evaluate → Report)
- Linear line connecting steps with numbered circles
- Active step highlighted, completed steps with checkmarks

### Forms & Inputs
**Criteria Form**:
- Clean input fields with floating labels
- Inline add/remove buttons
- Percentage slider with numerical input
- Delete icon on hover for each criterion

**Competitor Form**:
- Simple text input with add button
- List of added competitors with inline edit/delete
- Visual cards showing competitor names

**Scoring Interface**:
- Table/grid layout: Criteria (rows) × Competitors (columns)
- Numerical input fields (0-100) for each cell
- Auto-calculated pass/fail indicators
- Real-time score totals at bottom

### Data Display
**Evaluation Table**:
- Clean bordered table with minimal lines
- Header row: criterion name + passing percentage
- Score cells: Large numbers with pass/fail visual indicator
- Footer row: Total scores with ranking

**Report View**:
- Summary cards: Total competitors, criteria count, highest/lowest scores
- Full scoring matrix
- Visual ranking list (1st, 2nd, 3rd badges)
- Pass/fail breakdown per competitor

### Interactive Elements
**Buttons**:
- Primary: Solid with rounded corners (rounded-lg px-6 py-3)
- Secondary: Outlined/ghost style
- Icon buttons: Square with hover state
- Print button: Fixed position top-right

**Cards**:
- Subtle border (border border-gray-200)
- Padding: p-6
- Rounded corners: rounded-xl
- Shadow on hover: transition-shadow

---

## Key Features & Interactions

**Workflow Steps**: Accordion-style collapsible sections that expand/collapse
**Real-time Calculation**: Scores update immediately as user inputs
**Validation**: Visual feedback for incomplete criteria/scores
**Print Optimization**: Clean table layout, remove interactive elements, show company logo/header
**Empty States**: Helpful messages when no criteria/competitors added yet
**Data Persistence**: Auto-save to localStorage on every change

---

## Visual Hierarchy Principles

1. **Numerical Emphasis**: Scores and percentages are largest elements
2. **Clear Sections**: Generous spacing between workflow steps
3. **Minimal Borders**: Use sparingly, prefer spacing for separation
4. **Status Indicators**: Simple icons (✓/✗) for pass/fail without heavy styling
5. **Focus on Content**: No decorative elements, pure functionality

---

## Print Layout Specifications

**Print-specific CSS**:
- Remove: Navigation, buttons, interactive elements
- Optimize: Tables fill page width, appropriate margins
- Add: Page header with evaluation title and date
- Typography: Smaller sizes for dense information
- Page breaks: After summary section, avoid breaking tables

---

## Responsive Behavior

**Desktop (Primary)**: Full table view with all columns visible
**Tablet**: Horizontal scroll for wide tables, collapsible sections
**Mobile**: Stack criteria vertically, one competitor at a time view

**Note**: Given the data-heavy nature, this is optimized for desktop/tablet use with print functionality as primary output method.