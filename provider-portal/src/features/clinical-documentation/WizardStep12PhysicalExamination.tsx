import React from "react";
import {
  AbdominalExam,
  CardiovascularExam,
  GeneralExamination,
  MusculoskeletalExam,
  NeurologicalExam,
  RespiratoryExam,
  VitalSigns,
} from "../encounter/components/examination";

export const WizardStep12PhysicalExamination: React.FC = () => {
  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 12: Physical Examination</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Record vital signs and key examination findings. This step reuses the
        same examination components as the tabbed editor, so all data remains
        synchronized.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h4 style={{ marginBottom: 8 }}>Vital Signs</h4>
          <VitalSigns />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h4 style={{ marginBottom: 8 }}>General Examination</h4>
          <GeneralExamination />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--color-border-light)",
              padding: 16,
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <h4 style={{ marginBottom: 8 }}>Cardiovascular</h4>
            <CardiovascularExam />
          </div>

          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--color-border-light)",
              padding: 16,
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <h4 style={{ marginBottom: 8 }}>Respiratory</h4>
            <RespiratoryExam />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--color-border-light)",
              padding: 16,
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <h4 style={{ marginBottom: 8 }}>Abdominal</h4>
            <AbdominalExam />
          </div>

          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--color-border-light)",
              padding: 16,
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <h4 style={{ marginBottom: 8 }}>Neurological</h4>
            <NeurologicalExam />
          </div>
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h4 style={{ marginBottom: 8 }}>Musculoskeletal</h4>
          <MusculoskeletalExam />
        </div>
      </div>
    </div>
  );
};
