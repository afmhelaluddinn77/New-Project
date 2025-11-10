# Encounter Feature - Prescription Components

This feature module contains reusable prescription header/footer components for the Provider Portal.

## Structure

```
features/encounter/
├── components/
│   ├── PrescriptionHeader.tsx    # Bilingual header (BN left, EN right)
│   ├── PrescriptionFooter.tsx    # Bilingual footer (EN left, BN right)
│   └── index.ts                  # Component exports
├── config/
│   └── prescriptionBrand.ts      # Doctor & hospital info constants
├── styles/
│   └── prescription-print.css    # Print & layout styles with Clarity tokens
└── README.md
```

## Components

### PrescriptionHeader

Displays doctor information in bilingual format:
- **Left side**: Bangla (ডাঃ আ. এফ. এম. হেলাল উদ্দিন)
- **Right side**: English (Dr. A. F. M. Helal Uddin)

**Props:**
- `phone?: string` - Contact phone number
- `email?: string` - Contact email address

**Usage:**
```tsx
import { PrescriptionHeader } from '@/features/encounter/components'

<PrescriptionHeader 
  phone="+88 01715-872634" 
  email="dr.helal.uddin@gmail.com" 
/>
```

### PrescriptionFooter

Displays hospital information in bilingual format:
- **Left side**: English (Green Life Hospital Ltd.)
- **Right side**: Bangla (গ্রিন লাইফ হাসপাতাল লিমিটেড)

**Usage:**
```tsx
import { PrescriptionFooter } from '@/features/encounter/components'

<PrescriptionFooter />
```

## Configuration

Edit `config/prescriptionBrand.ts` to update:
- Doctor credentials and affiliations
- Hospital contact information
- Bilingual text content

## Styling

The components use Clarity Design System tokens:
- `--spacing-*` for consistent spacing
- `--color-border-subtle` for borders
- Custom CSS variables for text colors

### Print Support

The stylesheet includes print-optimized styles:
- A4 page size with 14mm margins
- Black text for better print quality
- Page break avoidance for header/footer
- Hidden non-essential elements

## Integration Example

```tsx
import { PrescriptionHeader, PrescriptionFooter } from '@/features/encounter/components'

export default function PrescriptionPage() {
  return (
    <div className="prescription-container">
      <PrescriptionHeader phone="+88 01715-872634" email="dr.helal.uddin@gmail.com" />
      
      {/* Your prescription content here */}
      <main>
        <section>Chief Complaint...</section>
        <section>Medications...</section>
      </main>
      
      <PrescriptionFooter />
    </div>
  )
}
```

## Print Functionality

To enable printing:
```tsx
const handlePrint = () => {
  window.print()
}

<button onClick={handlePrint} className="no-print">
  Print Prescription
</button>
```

The `.no-print` class will hide the button during printing.
