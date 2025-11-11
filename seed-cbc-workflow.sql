-- Seed data for CBC workflow testing
-- Run with: PGPASSWORD=clinical psql -h localhost -p 5433 -U clinical -d clinical -f seed-cbc-workflow.sql

-- Switch to encounter schema for test patient encounter
SET search_path TO encounter;

-- Insert a test encounter for CBC workflow
INSERT INTO encounters (
  id,
  "encounterNumber",
  "patientId",
  "providerId",
  "encounterDate",
  "encounterType",
  "encounterClass",
  status,
  priority,
  "chiefComplaint",
  "createdBy",
  "updatedBy",
  "updatedAt"
) VALUES (
  'ENC-CBC-001',
  'ENC001',
  'PAT001',
  '2',
  NOW(),
  'INPATIENT',
  'INPATIENT',
  'IN_PROGRESS',
  'ROUTINE',
  'Routine checkup - CBC required',
  '2',
  '2',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'IN_PROGRESS',
  "updatedAt" = NOW();

-- Insert a CBC investigation order
INSERT INTO investigations (
  id,
  "encounterId",
  "investigationType",
  name,
  "loincCode",
  status,
  priority,
  "orderedDate",
  "orderedBy"
) VALUES (
  'INV-CBC-001',
  'ENC-CBC-001',
  'LABORATORY',
  'Complete Blood Count (CBC)',
  '58410-2',
  'ORDERED',
  'ROUTINE',
  NOW(),
  '2'
) ON CONFLICT (id) DO UPDATE SET
  status = 'ORDERED',
  "updatedAt" = NOW();

-- Switch to workflow schema for unified orders
SET search_path TO workflow;

-- Insert unified order for the CBC
INSERT INTO "UnifiedOrder" (
  id,
  "orderNumber",
  "patientId",
  "providerId",
  "encounterId",
  priority,
  status,
  "updatedAt"
) VALUES (
  'UO-CBC-001',
  'ORD-CBC-001',
  'PAT001',
  '2',
  'ENC-CBC-001',
  'ROUTINE',
  'NEW',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'NEW',
  "updatedAt" = NOW();

-- Insert order item for CBC test
INSERT INTO "UnifiedOrderItem" (
  id,
  "unifiedOrderId",
  "itemType",
  "targetServiceOrderId",
  status,
  metadata
) VALUES (
  'UOI-CBC-001',
  'UO-CBC-001',
  'LAB_TEST',
  'LAB-ORDER-CBC-001',
  'REQUESTED',
  '{"testCode": "CBC", "testName": "Complete Blood Count", "instructions": "Fasting sample preferred"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  status = 'REQUESTED',
  "updatedAt" = NOW();

-- Switch to lab schema for lab-specific tables
SET search_path TO lab;

-- Insert lab order
INSERT INTO "LabOrder" (
  id,
  "orderId",
  "patientId",
  "providerId",
  "encounterId",
  "orderDate",
  priority,
  status,
  notes,
  "createdBy",
  "updatedBy"
) VALUES (
  'LAB-ORDER-CBC-001',
  'ORD-CBC-001',
  'PAT001',
  '2',
  'ENC-CBC-001',
  NOW(),
  'ROUTINE',
  'PENDING',
  'CBC requested for routine checkup',
  '4',
  '4'
) ON CONFLICT (id) DO UPDATE SET
  status = 'PENDING',
  "updatedAt" = NOW();

-- Insert lab order test for CBC
INSERT INTO "LabOrderTest" (
  id,
  "labOrderId",
  "testCode",
  "testName",
  "testCategory",
  status,
  priority
) VALUES (
  'LOT-CBC-001',
  'LAB-ORDER-CBC-001',
  'CBC',
  'Complete Blood Count',
  'HEMATOLOGY',
  'PENDING',
  'ROUTINE'
) ON CONFLICT (id) DO UPDATE SET
  status = 'PENDING',
  "updatedAt" = NOW();

-- Display summary
SELECT 'Seed data created successfully!' as message;
SELECT 'encounter.encounters:' as table_name, COUNT(*) as count FROM encounter.encounters WHERE id = 'ENC-CBC-001'
UNION ALL
SELECT 'encounter.investigations:', COUNT(*) FROM encounter.investigations WHERE id = 'INV-CBC-001'
UNION ALL
SELECT 'workflow.UnifiedOrder:', COUNT(*) FROM workflow."UnifiedOrder" WHERE id = 'UO-CBC-001'
UNION ALL
SELECT 'workflow.UnifiedOrderItem:', COUNT(*) FROM workflow."UnifiedOrderItem" WHERE id = 'UOI-CBC-001'
UNION ALL
SELECT 'lab.LabOrder:', COUNT(*) FROM lab."LabOrder" WHERE id = 'LAB-ORDER-CBC-001'
UNION ALL
SELECT 'lab.LabOrderTest:', COUNT(*) FROM lab."LabOrderTest" WHERE id = 'LOT-CBC-001';
