const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Lab Test Templates Seeding
 *
 * Following PROJECT LAW: Always provide comprehensive test templates
 * Includes CBC, CMP, Lipid Panel, and Thyroid Panel
 */

async function main() {
  console.log('🧪 Seeding lab test templates...');

  // CBC Template (Complete Blood Count)
  const cbcTemplate = await prisma.labTestTemplate.upsert({
    where: { loincCode: '24323-8' },
    update: {},
    create: {
      loincCode: '24323-8',
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      description:
        'Comprehensive blood cell analysis including white cells, red cells, and platelets',
      specimenType: 'Whole blood',
      turnaroundTime: 120, // 2 hours
      isActive: true,
      components: {
        create: [
          {
            code: '6690-2',
            name: 'White Blood Cells',
            displayName: 'WBC',
            unit: 'x10^9/L',
            referenceRangeLow: 4.0,
            referenceRangeHigh: 10.0,
            referenceRangeText: '4.0 - 10.0',
            sortOrder: 1,
            isCritical: true,
            isRequired: true,
          },
          {
            code: '789-8',
            name: 'Red Blood Cells',
            displayName: 'RBC',
            unit: 'x10^12/L',
            referenceRangeLow: 4.5,
            referenceRangeHigh: 5.5,
            referenceRangeText: '4.5 - 5.5',
            sortOrder: 2,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '718-7',
            name: 'Hemoglobin',
            displayName: 'Hgb',
            unit: 'g/dL',
            referenceRangeLow: 12.0,
            referenceRangeHigh: 16.0,
            referenceRangeText: '12.0 - 16.0',
            sortOrder: 3,
            isCritical: true,
            isRequired: true,
          },
          {
            code: '4544-3',
            name: 'Hematocrit',
            displayName: 'Hct',
            unit: '%',
            referenceRangeLow: 37.0,
            referenceRangeHigh: 47.0,
            referenceRangeText: '37.0 - 47.0',
            sortOrder: 4,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '777-3',
            name: 'Platelets',
            displayName: 'PLT',
            unit: 'x10^9/L',
            referenceRangeLow: 150,
            referenceRangeHigh: 400,
            referenceRangeText: '150 - 400',
            sortOrder: 5,
            isCritical: true,
            isRequired: true,
          },
        ],
      },
    },
  });

  // CMP Template (Comprehensive Metabolic Panel)
  const cmpTemplate = await prisma.labTestTemplate.upsert({
    where: { loincCode: '24362-6' },
    update: {},
    create: {
      loincCode: '24362-6',
      testName: 'Comprehensive Metabolic Panel (CMP)',
      category: 'Chemistry',
      description:
        'Comprehensive panel of 14 tests measuring glucose, electrolytes, kidney and liver function',
      specimenType: 'Serum',
      turnaroundTime: 180, // 3 hours
      isActive: true,
      components: {
        create: [
          {
            code: '2345-7',
            name: 'Glucose',
            displayName: 'Glucose',
            unit: 'mg/dL',
            referenceRangeLow: 70,
            referenceRangeHigh: 100,
            referenceRangeText: '70 - 100',
            sortOrder: 1,
            isCritical: true,
            isRequired: true,
          },
          {
            code: '3094-0',
            name: 'Blood Urea Nitrogen',
            displayName: 'BUN',
            unit: 'mg/dL',
            referenceRangeLow: 7,
            referenceRangeHigh: 20,
            referenceRangeText: '7 - 20',
            sortOrder: 2,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '2160-0',
            name: 'Creatinine',
            displayName: 'Creatinine',
            unit: 'mg/dL',
            referenceRangeLow: 0.6,
            referenceRangeHigh: 1.2,
            referenceRangeText: '0.6 - 1.2',
            sortOrder: 3,
            isCritical: true,
            isRequired: true,
          },
          {
            code: '2951-2',
            name: 'Sodium',
            displayName: 'Na+',
            unit: 'mmol/L',
            referenceRangeLow: 136,
            referenceRangeHigh: 145,
            referenceRangeText: '136 - 145',
            sortOrder: 4,
            isCritical: true,
            isRequired: true,
          },
          {
            code: '2823-3',
            name: 'Potassium',
            displayName: 'K+',
            unit: 'mmol/L',
            referenceRangeLow: 3.5,
            referenceRangeHigh: 5.1,
            referenceRangeText: '3.5 - 5.1',
            sortOrder: 5,
            isCritical: true,
            isRequired: true,
          },
          {
            code: '2075-0',
            name: 'Chloride',
            displayName: 'Cl-',
            unit: 'mmol/L',
            referenceRangeLow: 98,
            referenceRangeHigh: 107,
            referenceRangeText: '98 - 107',
            sortOrder: 6,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '1975-2',
            name: 'Total Bilirubin',
            displayName: 'T.Bili',
            unit: 'mg/dL',
            referenceRangeLow: 0.3,
            referenceRangeHigh: 1.2,
            referenceRangeText: '0.3 - 1.2',
            sortOrder: 7,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '1742-6',
            name: 'Alanine Aminotransferase',
            displayName: 'ALT',
            unit: 'U/L',
            referenceRangeLow: 7,
            referenceRangeHigh: 56,
            referenceRangeText: '7 - 56',
            sortOrder: 8,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '1920-8',
            name: 'Aspartate Aminotransferase',
            displayName: 'AST',
            unit: 'U/L',
            referenceRangeLow: 10,
            referenceRangeHigh: 40,
            referenceRangeText: '10 - 40',
            sortOrder: 9,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '2885-2',
            name: 'Total Protein',
            displayName: 'TP',
            unit: 'g/dL',
            referenceRangeLow: 6.0,
            referenceRangeHigh: 8.3,
            referenceRangeText: '6.0 - 8.3',
            sortOrder: 10,
            isCritical: false,
            isRequired: true,
          },
        ],
      },
    },
  });

  // Lipid Panel Template
  const lipidTemplate = await prisma.labTestTemplate.upsert({
    where: { loincCode: '24331-1' },
    update: {},
    create: {
      loincCode: '24331-1',
      testName: 'Lipid Panel',
      category: 'Chemistry',
      description:
        'Comprehensive cholesterol and triglyceride analysis for cardiovascular risk assessment',
      specimenType: 'Serum (fasting)',
      turnaroundTime: 240, // 4 hours
      isActive: true,
      components: {
        create: [
          {
            code: '2093-3',
            name: 'Total Cholesterol',
            displayName: 'Total Chol',
            unit: 'mg/dL',
            referenceRangeLow: 0,
            referenceRangeHigh: 200,
            referenceRangeText: '< 200 (Desirable)',
            sortOrder: 1,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '2571-8',
            name: 'Triglycerides',
            displayName: 'Triglycerides',
            unit: 'mg/dL',
            referenceRangeLow: 0,
            referenceRangeHigh: 150,
            referenceRangeText: '< 150 (Normal)',
            sortOrder: 2,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '2085-9',
            name: 'HDL Cholesterol',
            displayName: 'HDL',
            unit: 'mg/dL',
            referenceRangeLow: 40,
            referenceRangeHigh: 999,
            referenceRangeText: '> 40 (M), > 50 (F)',
            sortOrder: 3,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '2089-1',
            name: 'LDL Cholesterol',
            displayName: 'LDL',
            unit: 'mg/dL',
            referenceRangeLow: 0,
            referenceRangeHigh: 100,
            referenceRangeText: '< 100 (Optimal)',
            sortOrder: 4,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '11054-4',
            name: 'Non-HDL Cholesterol',
            displayName: 'Non-HDL',
            unit: 'mg/dL',
            referenceRangeLow: 0,
            referenceRangeHigh: 130,
            referenceRangeText: '< 130 (Desirable)',
            sortOrder: 5,
            isCritical: false,
            isRequired: false,
          },
        ],
      },
    },
  });

  // Thyroid Panel Template
  const thyroidTemplate = await prisma.labTestTemplate.upsert({
    where: { loincCode: '24348-5' },
    update: {},
    create: {
      loincCode: '24348-5',
      testName: 'Thyroid Function Panel',
      category: 'Endocrinology',
      description:
        'Comprehensive thyroid function assessment including TSH, T3, and T4',
      specimenType: 'Serum',
      turnaroundTime: 360, // 6 hours
      isActive: true,
      components: {
        create: [
          {
            code: '3016-3',
            name: 'Thyroid Stimulating Hormone',
            displayName: 'TSH',
            unit: 'mIU/L',
            referenceRangeLow: 0.4,
            referenceRangeHigh: 4.0,
            referenceRangeText: '0.4 - 4.0',
            sortOrder: 1,
            isCritical: true,
            isRequired: true,
          },
          {
            code: '3024-7',
            name: 'Free Thyroxine',
            displayName: 'Free T4',
            unit: 'ng/dL',
            referenceRangeLow: 0.8,
            referenceRangeHigh: 1.8,
            referenceRangeText: '0.8 - 1.8',
            sortOrder: 2,
            isCritical: false,
            isRequired: true,
          },
          {
            code: '3051-0',
            name: 'Free Triiodothyronine',
            displayName: 'Free T3',
            unit: 'pg/mL',
            referenceRangeLow: 2.3,
            referenceRangeHigh: 4.2,
            referenceRangeText: '2.3 - 4.2',
            sortOrder: 3,
            isCritical: false,
            isRequired: false,
          },
        ],
      },
    },
  });

  console.log('✅ Created CBC template:', cbcTemplate.testName);
  console.log('✅ Created CMP template:', cmpTemplate.testName);
  console.log('✅ Created Lipid Panel template:', lipidTemplate.testName);
  console.log('✅ Created Thyroid Panel template:', thyroidTemplate.testName);

  // Create some clinical interpretation rules
  await prisma.clinicalInterpretationRule.createMany({
    data: [
      {
        testCode: '24323-8',
        componentCode: '6690-2',
        condition: 'value > 15',
        interpretation:
          'Elevated WBC count may indicate infection, inflammation, or hematologic malignancy. Clinical correlation recommended.',
        severity: 'HIGH',
        actionRequired: true,
      },
      {
        testCode: '24323-8',
        componentCode: '718-7',
        condition: 'value < 8',
        interpretation:
          'Low hemoglobin indicates anemia. Further evaluation for cause recommended.',
        severity: 'MEDIUM',
        actionRequired: true,
      },
      {
        testCode: '24362-6',
        componentCode: '2345-7',
        condition: 'value > 200',
        interpretation:
          'Significantly elevated glucose. Diabetes evaluation and management indicated.',
        severity: 'HIGH',
        actionRequired: true,
      },
      {
        testCode: '24331-1',
        componentCode: '2093-3',
        condition: 'value > 240',
        interpretation:
          'High cholesterol increases cardiovascular risk. Lifestyle modifications and possible medication indicated.',
        severity: 'MEDIUM',
        actionRequired: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created clinical interpretation rules');
  console.log('🎉 Lab templates seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
