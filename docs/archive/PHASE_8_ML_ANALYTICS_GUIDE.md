# Phase 8: ML & Analytics Implementation Guide

**Priority:** LOW  
**Duration:** 7 days  
**Status:** ⏳ Ready for Implementation  
**Owner:** Data Science Lead + Backend Team

---

## 🎯 Objectives

1. Design and deploy an end-to-end data pipeline that extracts, transforms, and loads clinical encounter data for analytics and ML training.  
2. Implement clinical decision support models for diagnosis prediction, medication recommendation, and patient risk stratification.  
3. Integrate predictive insights into the Encounter Service and frontend UI (alerts, recommendations, dashboards).  
4. Establish MLOps practices (model registry, monitoring, retraining schedule).

---

## 🗓️ Timeline & Milestones

| Day | Milestone | Deliverables |
|-----|-----------|--------------|
| 1 | Data Audit & Pipeline Design | Data dictionary, pipeline architecture diagram |
| 2 | ETL Pipeline Implementation | Airflow DAGs / Prefect flows, feature extraction scripts |
| 3 | Feature Store & Dataset Creation | Feature definitions, training datasets |
| 4 | Model Training (Diagnosis, Medication) | Notebooks, metrics report (AUROC, F1) |
| 5 | Risk Stratification Model & API | Model artifacts, inference microservice |
| 6 | Integration with Encounter Service | REST endpoints, UI hooks, alert templates |
| 7 | Monitoring & MLOps Setup | Model registry, drift detection jobs, ops runbook |

---

## 🧱 Prerequisites

- ✅ Phase 4 & 5 data persistence and security layers complete.  
- ✅ Terminology service (Phase 6) available for code normalization.  
- 🔄 ML infrastructure (GPU/CPU) provisioned (AWS Sagemaker, GCP Vertex, or Azure ML).  
- 🔄 Access to de-identified historical encounter data.  
- 🔄 Data governance approvals for ML model usage.

---

## 🏗️ Architecture Overview

```
PostgreSQL (Encounter DB)
    ↓ (Change Data Capture)
Apache Airflow / Prefect
    ↓ (Transform & Anonymize)
Feature Store (Feast / Snowflake / Redis)
    ↓
ML Training (SageMaker Notebook / Databricks)
    ↓
Model Registry (MLflow)
    ↓
Inference Service (FastAPI + Docker)
    ↓
Encounter Service (NestJS)
    ↓
Provider Portal (React UI)
```

---

## 📊 Data Pipeline Architecture

### Pipeline Stages

1. **Extraction:**  
   - Use CDC (Debezium) or nightly dumps from PostgreSQL.  
   - Extract encounters, prescriptions, investigations, vitals.

2. **Transformation:**  
   - De-identify PHI (hash patient IDs, remove names).  
   - Normalize codes (SNOMED, LOINC, RxNorm).  
   - Aggregate features (lab trends, visit frequency).

3. **Loading:**  
   - Store features in Feast or a custom feature store table.  
   - Save training datasets to S3/Google Cloud Storage.

```python
# airflow/dags/encounter_etl.py
with DAG('encounter_etl', schedule='0 2 * * *') as dag:
    extract = PythonOperator(
        task_id='extract_encounters',
        python_callable=extract_from_postgres,
    )

    transform = PythonOperator(
        task_id='transform_features',
        python_callable=transform_encounter_features,
    )

    load = PythonOperator(
        task_id='load_feature_store',
        python_callable=load_into_feature_store,
    )

    extract >> transform >> load
```

---

## 🧠 Clinical Decision Support Models

### 1. Diagnosis Prediction

**Goal:** Suggest probable diagnoses based on history, symptoms, vitals, lab results.

- Model: Gradient Boosting (XGBoost) or Transformer-based (ClinicalBERT).  
- Inputs: Chief complaint, HPI features, vitals, lab code embeddings.  
- Output: Top 5 SNOMED diagnosis codes with confidence.

**Training Example:**
```python
from xgboost import XGBClassifier

model = XGBClassifier(
    max_depth=6,
    learning_rate=0.1,
    n_estimators=500,
    objective='multi:softprob'
)
model.fit(X_train, y_train)
y_pred = model.predict_proba(X_test)
```

**Inference API:**
```python
@app.post('/predict/diagnosis')
def predict_diagnosis(request: DiagnosisRequest):
    features = feature_transformer.transform(request)
    probabilities = diagnosis_model.predict_proba(features)
    top_indices = probabilities.argsort()[::-1][:5]
    return {
        "suggestions": [
            {
                "code": diagnosis_labels[idx],
                "confidence": float(probabilities[idx])
            }
            for idx in top_indices
        ]
    }
```

### 2. Medication Recommendation

**Goal:** Recommend medications based on diagnosis, allergies, and comorbidities.

- Model: Collaborative filtering or knowledge graph + rules.  
- Inputs: Diagnosis codes, lab abnormalities, allergies, demographics.  
- Output: Ranked medication suggestions with contraindication checks.

### 3. Risk Stratification

**Goal:** Predict readmission risk / adverse events.

- Model: Logistic Regression / Random Forest.  
- Inputs: Age, comorbidities, vital trends, medication load.  
- Output: Risk score (0-1) with threshold-based alerting.

**Monitoring:**  
- Track AUROC, Precision-Recall, calibration plots.  
- Use Evidently AI or WhyLabs for drift detection.

---

## 🧮 Feature Engineering

### Core Feature Groups

| Category | Features |
|----------|----------|
| Demographics | Age, sex, ethnicity, BMI |
| History | Chronic conditions, smoking status, previous visits |
| Vitals | BP, HR, temperature, SpO2 trends |
| Labs | LOINC-coded lab values, normalized z-scores |
| Medications | Active prescriptions, polypharmacy count |
| Utilization | ED visits, hospitalization history |

**Example Feature Pipeline:**
```python
def build_features(encounter_df, lab_df, meds_df):
    features = {}
    features['age'] = calculate_age(encounter_df['birthDate'])
    features['bp_mean'] = lab_df[lab_df['loinc'] == '8480-6']['value'].mean()
    features['active_med_count'] = meds_df[meds_df['status'] == 'ACTIVE'].count()
    features['recent_visits'] = encounter_df['encounterDate'].apply(lambda d: d > now - timedelta(days=180)).sum()
    return features
```

---

## 🔗 Integration with Encounter Service

### Inference Microservice

- Deploy FastAPI service `ml-service` on internal network.  
- Endpoints: `/predict/diagnosis`, `/recommend/medication`, `/predict/risk`.  
- Authenticate using service-to-service JWT.

### Encounter Service Integration

```typescript
@Injectable()
export class ClinicalDecisionService {
  constructor(private readonly http: HttpService) {}

  async getDiagnosisSuggestions(encounterId: string) {
    const payload = await this.buildDiagnosisPayload(encounterId);
    const { data } = await this.http
      .post('http://ml-service.predict/diagnosis', payload, {
        headers: { Authorization: `Bearer ${await this.getServiceToken()}` },
      })
      .toPromise();
    return data.suggestions;
  }
}
```

### Frontend UI Hooks

- Display diagnosis suggestions in Assessment panel.  
- Show medication recommendations in Prescription form.  
- Trigger risk alerts (high risk → red banner).

```typescript
const { data: diagnosisSuggestions } = useQuery({
  queryKey: ['diagnosis', encounterId],
  queryFn: () => mlService.getDiagnosisSuggestions(encounterId),
});
```

---

## 📊 Analytics Dashboard

- Build provider dashboard with encounter summaries, risk scores, prescription trends.  
- Use React + victory charts / recharts.  
- Integrate with analytics service (Metabase, Superset, custom UI).

---

## 🧪 MLOps & Monitoring

### Model Registry & Versioning

- Use MLflow or SageMaker Model Registry.  
- Tag models with version, metrics, training data hash.

### Monitoring Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Prediction Latency | < 200ms | Prometheus + Grafana |
| Drift Detection | Weekly checks | Evidently AI |
| Model Accuracy | AUROC ≥ 0.80 | MLflow metrics |
| Alert Rate | < 5% false positives | Ops dashboard |

### Retraining Schedule

- Monthly retrain using latest 6 months of data.  
- Automate via Airflow DAG (retrain → evaluate → deploy).  
- Manual approval workflow for production promotion.

---

## ✅ Completion Checklist

- [ ] ETL pipeline deployed (daily schedule).  
- [ ] Feature store populated with validated features.  
- [ ] Diagnosis, medication, risk models trained & registered.  
- [ ] Inference service deployed with health checks.  
- [ ] Encounter Service integrated with ML endpoints.  
- [ ] Provider UI showing recommendations and risk alerts.  
- [ ] Monitoring dashboards live.  
- [ ] Retraining pipeline documented.  
- [ ] Governance & bias assessment completed.

---

## 📚 Resources & References

- [MLflow Documentation](https://mlflow.org/docs/latest/index.html)  
- [Feast Feature Store](https://docs.feast.dev/)  
- [Evidently AI Monitoring](https://docs.evidentlyai.com/)  
- [AWS HealthLake ML Guide](https://docs.aws.amazon.com/healthlake/latest/devguide/)

---

**Project Status:**  
- Phases 1-3 ✅ Completed  
- Phases 4-5 🔄 In progress  
- Phase 6 ✅ Planned  
- Phase 7 ✅ Planned  
- Phase 8 ✅ Planned
