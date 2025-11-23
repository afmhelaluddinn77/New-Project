# Clarity Healthcare Design System - Implementation Rules

## System Overview
The 'Clarity' design system is a healthcare-focused, Apple-inspired minimalist design system that prioritizes clarity, performance, and accessibility over decorative effects. This system replaces the previous glassmorphism approach with a token-based, performance-optimized architecture.

## Core Implementation Rules

### 1. USE TOKENS, NOT VALUES (MANDATORY)
**NEVER** use hardcoded values for colors, spacing, fonts, shadows, or border radii.
**ALWAYS** use CSS custom properties from the clarity-tokens.css file.

**❌ WRONG:**
```css
background-color: #007AFF;
padding: 16px;
font-size: 1rem;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

**✅ CORRECT:**
```css
background-color: var(--color-primary-500);
padding: var(--spacing-4);
font-size: var(--font-size-md);
box-shadow: var(--shadow-md);
```

### 2. ELIMINATE OBSOLETE CSS (MANDATORY)
**REMOVE ALL** glassmorphism-related CSS properties:
- `backdrop-filter` (performance-intensive)
- `background` with `rgba()` transparency for glass effects
- Any class starting with `.glass-`
- Portal-specific styling classes like `.glass-patient`, `.glass-provider`

**❌ REMOVE:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}
```

**✅ REPLACE WITH:**
```css
.clarity-card {
  background-color: var(--color-surface);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-subtle);
}
```

### 3. COMPONENT CLASS MAPPING (MANDATORY)
| Old Class | New Class | Purpose |
|-----------|-----------|---------|
| `.glass-card` | `.clarity-card` | Primary container |
| `.glass-container` | `.clarity-container` | Layout container |
| `.glass-panel` | `.clarity-panel` | Section container |
| `.glass-strong` | `.clarity-card-elevated` | Elevated content |

### 4. COLOR USAGE RULES
- **Primary Interactive**: `var(--color-primary-500)` for buttons, links, active states
- **Text Hierarchy**: `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-tertiary)`
- **Backgrounds**: `var(--color-background)` for main, `var(--color-surface)` for cards
- **Semantic Colors**: Use specific semantic colors for status indicators
  - Normal/Success: `var(--color-success-500)`
  - Warning/Caution: `var(--color-warning-500)`
  - Error/Critical: `var(--color-error-500)`
  - Info/Pending: `var(--color-info-500)`

### 5. TYPOGRAPHY RULES
- **Headings**: Use `var(--font-weight-semibold)` with appropriate size tokens
- **Body Text**: `var(--font-size-md)` with `var(--font-weight-regular)`
- **Labels/UI Elements**: `var(--font-size-sm)` with `var(--font-weight-medium)`
- **Font Stack**: Always use `var(--font-family-sans)` for text elements

### 6. SPACING SYSTEM (4px GRID)
Use the 4px-based spacing system consistently:
- `--spacing-1` (4px): Micro gaps
- `--spacing-2` (8px): Small gaps, icon-text spacing
- `--spacing-3` (12px): Form field spacing
- `--spacing-4` (16px): Standard padding/gap
- `--spacing-5` (24px): Card padding, section spacing
- `--spacing-6` (32px): Page-level padding
- `--spacing-7` (48px): Large section spacing
- `--spacing-8` (64px): Hero section spacing

### 7. BORDER RADIUS SYSTEM
- `--border-radius-sm` (4px): Small elements, badges
- `--border-radius-md` (8px): Default for inputs, buttons, cards
- `--border-radius-lg` (12px): Larger containers, modals
- `--border-radius-full` (9999px): Pills, circular elements

### 8. ELEVATION SYSTEM (SHADOWS)
Use shadows instead of backdrop-filter for depth:
- `--shadow-sm`: Subtle lifts, hover states
- `--shadow-md`: Default for cards
- `--shadow-lg`: Dropdowns, elevated elements
- `--shadow-xl`: Modals, popovers

### 9. INTERACTION STATES
All interactive elements must have:
- **Hover**: Subtle background color change or shadow enhancement
- **Active**: `transform: scale(0.98)` for tactile feedback
- **Focus**: Visible outline using `var(--color-primary-500)`
- **Disabled**: `opacity: 0.6` and `cursor: not-allowed`

### 10. HEALTHCARE-SPECIFIC COMPONENTS
Use semantic medical status classes:
```css
.medical-status-normal { /* Green for healthy */ }
.medical-status-caution { /* Yellow for warning */ }
.medical-status-critical { /* Red for urgent */ }
.medical-status-pending { /* Blue for processing */ }
```

## React Component Rules

### 1. COMPONENT STRUCTURE
```tsx
// ✅ CORRECT: Clean, semantic component structure
const Card = ({ children, className = '' }) => {
  const combinedClassName = `clarity-card ${className}`
  return <div className={combinedClassName}>{children}</div>
}
```

### 2. PROP HANDLING
- Maintain existing props unless refactoring requires changes
- Remove `portalType` props used only for styling
- Ensure all functionality remains intact

### 3. ICONOGRAPHY
- Use Lucide React icons consistently
- Default size: 20px × 20px
- Stroke width: 1.5px
- Color: `currentColor` (inherits from text)

## Performance Requirements

### 1. CSS PERFORMANCE
- **NO** `backdrop-filter` (computationally expensive)
- **NO** complex gradients for primary elements
- **YES** solid colors and optimized shadows
- **YES** CSS transitions instead of animations where possible

### 2. BUNDLE SIZE
- Import only needed icons from Lucide React
- Use CSS custom properties for maintainability
- Avoid duplicate style definitions

## Accessibility Requirements

### 1. CONTRAST RATIOS
- All text must meet WCAG AA contrast ratios
- Use `var(--color-text-primary)` on `var(--color-background)`
- Use `var(--color-text-on-accent)` on colored backgrounds

### 2. KEYBOARD NAVIGATION
- All interactive elements must be keyboard accessible
- Focus states must be clearly visible
- Use `tabindex` appropriately

### 3. SCREEN READERS
- Icons must have `aria-label` when used without text
- Use semantic HTML elements
- Provide descriptive alt text for images

## Responsive Design Rules

### 1. BREAKPOINTS
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 767px and below
- **Small Mobile**: 480px and below

### 2. MOBILE-FIRST APPROACH
- Design for mobile first, then enhance for larger screens
- Use flexible grid layouts
- Ensure touch targets are at least 44px × 44px

## Healthcare-Specific Rules

### 1. MEDICAL DATA DISPLAY
- Use clear, readable fonts for medical data
- Implement proper data hierarchy
- Use semantic colors for medical status indicators
- Ensure critical information is prominently displayed

### 2. ERROR HANDLING
- Use `var(--color-error-500)` for critical errors
- Provide clear, actionable error messages
- Include help links for common issues

### 3. TRUST INDICATORS
- Display security badges prominently
- Use consistent trust messaging
- Include HIPAA compliance indicators

## File Organization

### 1. CSS FILE STRUCTURE
```
src/styles/
├── clarity-tokens.css     # Design tokens (NEVER edit directly)
├── clarity-global.css     # Global styles and utilities
├── clarity-components.css # Component styles
└── [component].css       # Component-specific styles
```

### 2. IMPORT ORDER
```tsx
// ✅ CORRECT import order
import './styles/clarity-tokens.css'
import './styles/clarity-global.css'
import './styles/clarity-components.css'
import './components/Component.css'
```

## Migration Checklist

### 1. BEFORE MIGRATION
- [ ] Identify all glassmorphism classes
- [ ] List all hardcoded values
- [ ] Document component dependencies

### 2. DURING MIGRATION
- [ ] Replace hardcoded values with tokens
- [ ] Remove glassmorphism CSS properties
- [ ] Update component class names
- [ ] Test all interactive states

### 3. AFTER MIGRATION
- [ ] Verify accessibility compliance
- [ ] Test responsive behavior
- [ ] Check performance improvements
- [ ] Validate visual consistency

## Quality Assurance

### 1. VISUAL TESTING
- Check all color contrasts
- Verify spacing consistency
- Test hover and focus states
- Validate responsive layouts

### 2. FUNCTIONAL TESTING
- Test all interactive elements
- Verify form submissions
- Check navigation flows
- Test error scenarios

### 3. PERFORMANCE TESTING
- Measure load times
- Check animation performance
- Verify bundle size reduction
- Test on lower-end devices

## Future Development Guidelines

### 1. NEW COMPONENTS
- Always use design tokens
- Follow established naming conventions
- Include accessibility attributes
- Test across all breakpoints

### 2. DESIGN TOKENS
- Never modify existing token values
- Add new tokens for new design needs
- Document token usage patterns
- Maintain semantic naming

### 3. CONSISTENCY
- Use established patterns for similar functionality
- Maintain visual hierarchy across components
- Follow healthcare UX best practices
- Keep user experience consistent across portals

## Emergency Override Rules

### 1. CRITICAL ISSUES
If a component breaks functionality:
1. Temporarily revert to working state
2. Document the issue
3. Create a fix following design system rules
4. Test thoroughly before deployment

### 2. PERFORMANCE CRITICAL
If performance issues arise:
1. Identify the bottleneck
2. Optimize using system-approved methods
3. Never revert to glassmorphism for performance reasons

---

**Remember**: The Clarity design system is not just about aesthetics—it's about creating a healthcare interface that enhances clinical outcomes through clarity, performance, and accessibility. Every design decision should serve the primary goal of helping healthcare providers deliver better patient care.
