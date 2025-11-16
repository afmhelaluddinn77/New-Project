import React from "react";
import { useEncounterStore } from "../../store/encounterStore";

const COMMON_GYNE_CONDITIONS: string[] = [
  "Polycystic ovary syndrome",
  "Endometriosis",
  "Uterine fibroids",
  "Dysmenorrhea",
];

export const WizardStep7ObgynHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const obgyn = history.obgynHistory || { obstetric: {}, gynecologic: {} };
  const obstetric: any = obgyn.obstetric || {};
  const gynecologic: any = obgyn.gynecologic || {};

  const updateObstetric = (partial: any) => {
    updateHistory("obgynHistory", {
      obstetric: { ...obstetric, ...partial },
      gynecologic,
    });
  };

  const updateGynecologic = (partial: any) => {
    updateHistory("obgynHistory", {
      obstetric,
      gynecologic: { ...gynecologic, ...partial },
    });
  };

  const conditions: any[] = gynecologic.gynecologicConditions || [];

  const addCondition = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    const exists = conditions.some((c) => c.condition === trimmed);
    if (exists) return;

    updateGynecologic({
      gynecologicConditions: [...conditions, { condition: trimmed }],
    });
  };

  const removeCondition = (index: number) => {
    updateGynecologic({
      gynecologicConditions: conditions.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 7: OB/GYN History</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Capture obstetric and gynecologic history. These fields feed into FHIR
        Condition and Observation resources using appropriate SNOMED and LOINC
        codes.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Obstetric history */}
        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h4 style={{ marginBottom: 8 }}>Obstetric history</h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <label>
              Gravida
              <input
                type="number"
                min={0}
                value={obstetric.gravida ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    gravida: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Para
              <input
                type="number"
                min={0}
                value={obstetric.para ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    para: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Abortions
              <input
                type="number"
                min={0}
                value={obstetric.abortions ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    abortions: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Living children
              <input
                type="number"
                min={0}
                value={obstetric.livingChildren ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    livingChildren: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            <input
              type="checkbox"
              checked={!!obstetric.currentlyPregnant}
              onChange={(e) =>
                updateObstetric({ currentlyPregnant: e.target.checked })
              }
            />
            Currently pregnant
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <label>
              Last menstrual period
              <input
                type="date"
                value={obstetric.lastMenstrualPeriod ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    lastMenstrualPeriod: e.target.value || undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Estimated due date
              <input
                type="date"
                value={obstetric.estimatedDueDate ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    estimatedDueDate: e.target.value || undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <label>
              Contraception method
              <input
                type="text"
                value={obstetric.contraceptionMethod ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    contraceptionMethod: e.target.value || undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Contraception code (optional)
              <input
                type="text"
                value={obstetric.contraceptionCode ?? ""}
                onChange={(e) =>
                  updateObstetric({
                    contraceptionCode: e.target.value || undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
          </div>

          <label style={{ fontSize: 13 }}>
            Notes
            <textarea
              value={obstetric.notes ?? ""}
              onChange={(e) =>
                updateObstetric({ notes: e.target.value || undefined })
              }
              rows={3}
              placeholder="Additional obstetric notes"
              style={{
                marginTop: 4,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
                resize: "vertical",
              }}
            />
          </label>
        </div>

        {/* Gynecologic history */}
        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h4 style={{ marginBottom: 8 }}>Gynecologic history</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <label>
              Age at menarche
              <input
                type="number"
                min={0}
                value={gynecologic.menarcheAge ?? ""}
                onChange={(e) =>
                  updateGynecologic({
                    menarcheAge: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Age at menopause
              <input
                type="number"
                min={0}
                value={gynecologic.menopauseAge ?? ""}
                onChange={(e) =>
                  updateGynecologic({
                    menopauseAge: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Cycle length (days)
              <input
                type="number"
                min={0}
                value={gynecologic.cycleLengthDays ?? ""}
                onChange={(e) =>
                  updateGynecologic({
                    cycleLengthDays: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            <input
              type="checkbox"
              checked={!!gynecologic.cycleRegular}
              onChange={(e) =>
                updateGynecologic({ cycleRegular: e.target.checked })
              }
            />
            Cycles regular
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <label>
              Last Pap smear date
              <input
                type="date"
                value={gynecologic.lastPapSmearDate ?? ""}
                onChange={(e) =>
                  updateGynecologic({
                    lastPapSmearDate: e.target.value || undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
            <label>
              Last Pap smear result
              <input
                type="text"
                value={gynecologic.lastPapSmearResult ?? ""}
                onChange={(e) =>
                  updateGynecologic({
                    lastPapSmearResult: e.target.value || undefined,
                  })
                }
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
              Gynecologic conditions
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COMMON_GYNE_CONDITIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => addCondition(label)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 9999,
                    border: "1px solid var(--color-border-light)",
                    background: "var(--color-provider-light)",
                    fontSize: 13,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Add custom gynecologic condition"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCondition((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {conditions.map((c, index) => (
              <span
                key={index}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 9999,
                  border: "1px solid var(--color-border-light)",
                  background: "rgba(255,255,255,0.9)",
                  fontSize: 12,
                }}
              >
                <span>{c.condition}</span>
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#DC2626",
                    fontSize: 11,
                  }}
                >
                  x
                </button>
              </span>
            ))}
          </div>

          <label style={{ fontSize: 13, marginTop: 8, display: "block" }}>
            Notes
            <textarea
              value={gynecologic.notes ?? ""}
              onChange={(e) =>
                updateGynecologic({ notes: e.target.value || undefined })
              }
              rows={3}
              placeholder="Additional gynecologic notes"
              style={{
                marginTop: 4,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
                resize: "vertical",
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
