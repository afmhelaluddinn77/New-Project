import React from "react";
import { useEncounterStore } from "../../../../store/encounterStore";
import styles from "../../styles/history.module.css";

export const ObgynHistory: React.FC = () => {
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

  return (
    <div className={styles.section}>
      <h3>OB/GYN History</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-gravida">Gravida</label>
          <input
            id="obgyn-gravida"
            type="number"
            min={0}
            value={obstetric.gravida ?? ""}
            onChange={(e) =>
              updateObstetric({
                gravida: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-para">Para</label>
          <input
            id="obgyn-para"
            type="number"
            min={0}
            value={obstetric.para ?? ""}
            onChange={(e) =>
              updateObstetric({
                para: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-abortions">Abortions</label>
          <input
            id="obgyn-abortions"
            type="number"
            min={0}
            value={obstetric.abortions ?? ""}
            onChange={(e) =>
              updateObstetric({
                abortions: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-living-children">Living children</label>
          <input
            id="obgyn-living-children"
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
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-lmp">Last menstrual period</label>
          <input
            id="obgyn-lmp"
            type="date"
            value={obstetric.lastMenstrualPeriod ?? ""}
            onChange={(e) =>
              updateObstetric({
                lastMenstrualPeriod: e.target.value || undefined,
              })
            }
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-edd">Estimated due date</label>
          <input
            id="obgyn-edd"
            type="date"
            value={obstetric.estimatedDueDate ?? ""}
            onChange={(e) =>
              updateObstetric({
                estimatedDueDate: e.target.value || undefined,
              })
            }
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-contraception">Contraception method</label>
          <input
            id="obgyn-contraception"
            type="text"
            value={obstetric.contraceptionMethod ?? ""}
            onChange={(e) =>
              updateObstetric({
                contraceptionMethod: e.target.value || undefined,
              })
            }
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-menarche-age">Age at menarche</label>
          <input
            id="obgyn-menarche-age"
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
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="obgyn-menopause-age">Age at menopause</label>
          <input
            id="obgyn-menopause-age"
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
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="obgyn-last-pap-date">Last Pap smear date</label>
        <input
          id="obgyn-last-pap-date"
          type="date"
          value={gynecologic.lastPapSmearDate ?? ""}
          onChange={(e) =>
            updateGynecologic({
              lastPapSmearDate: e.target.value || undefined,
            })
          }
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="obgyn-last-pap-result">Last Pap smear result</label>
        <input
          id="obgyn-last-pap-result"
          type="text"
          value={gynecologic.lastPapSmearResult ?? ""}
          onChange={(e) =>
            updateGynecologic({
              lastPapSmearResult: e.target.value || undefined,
            })
          }
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="obgyn-notes">Notes</label>
        <textarea
          id="obgyn-notes"
          value={gynecologic.notes ?? ""}
          onChange={(e) =>
            updateGynecologic({ notes: e.target.value || undefined })
          }
          className={styles.textarea}
          rows={3}
        />
      </div>
    </div>
  );
};
