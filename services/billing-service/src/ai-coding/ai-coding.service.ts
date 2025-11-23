import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

export interface CodingSuggestionRequest {
  clinicalText: string;
  serviceType?: string;
  specialty?: string;
  patientAge?: number;
  patientGender?: string;
}

export interface CodeSuggestion {
  code: string;
  description: string;
  confidence: number;
  rationale?: string;
}

export interface CodingSuggestionResult {
  icd10Codes: CodeSuggestion[];
  cptCodes: CodeSuggestion[];
  modifiers: Array<{ modifier: string; reason: string }>;
  overallConfidence: number;
}

@Injectable()
export class AiCodingService {
  private readonly icd10Database = {
    // Common diagnosis codes
    hypertension: [
      { code: "I10", description: "Essential (primary) hypertension" },
      {
        code: "I11.9",
        description: "Hypertensive heart disease without heart failure",
      },
    ],
    diabetes: [
      {
        code: "E11.9",
        description: "Type 2 diabetes mellitus without complications",
      },
      {
        code: "E11.65",
        description: "Type 2 diabetes mellitus with hyperglycemia",
      },
      {
        code: "E10.9",
        description: "Type 1 diabetes mellitus without complications",
      },
    ],
    covid: [
      { code: "U07.1", description: "COVID-19" },
      {
        code: "Z20.828",
        description:
          "Contact with and exposure to other viral communicable diseases",
      },
    ],
    pneumonia: [
      { code: "J18.9", description: "Pneumonia, unspecified organism" },
      {
        code: "J44.0",
        description: "COPD with acute lower respiratory infection",
      },
    ],
    "chest pain": [
      { code: "R07.9", description: "Chest pain, unspecified" },
      { code: "R07.89", description: "Other chest pain" },
    ],
    anxiety: [
      { code: "F41.9", description: "Anxiety disorder, unspecified" },
      { code: "F41.1", description: "Generalized anxiety disorder" },
    ],
    depression: [
      {
        code: "F32.9",
        description: "Major depressive disorder, single episode, unspecified",
      },
      {
        code: "F33.9",
        description: "Major depressive disorder, recurrent, unspecified",
      },
    ],
    "back pain": [
      { code: "M54.5", description: "Low back pain" },
      { code: "M54.9", description: "Dorsalgia, unspecified" },
    ],
    headache: [
      { code: "R51.9", description: "Headache, unspecified" },
      {
        code: "G43.909",
        description:
          "Migraine, unspecified, not intractable, without status migrainosus",
      },
    ],
    fracture: [
      {
        code: "S72.001A",
        description:
          "Fracture of unspecified part of neck of right femur, initial encounter",
      },
      {
        code: "S52.501A",
        description:
          "Unspecified fracture of the lower end of right radius, initial encounter",
      },
    ],
  };

  private readonly cptDatabase = {
    // Common procedure codes
    "office visit": {
      new: [
        {
          code: "99202",
          description: "Office visit, new patient, straightforward",
        },
        {
          code: "99203",
          description: "Office visit, new patient, low complexity",
        },
        {
          code: "99204",
          description: "Office visit, new patient, moderate complexity",
        },
        {
          code: "99205",
          description: "Office visit, new patient, high complexity",
        },
      ],
      established: [
        {
          code: "99212",
          description: "Office visit, established patient, straightforward",
        },
        {
          code: "99213",
          description: "Office visit, established patient, low complexity",
        },
        {
          code: "99214",
          description: "Office visit, established patient, moderate complexity",
        },
        {
          code: "99215",
          description: "Office visit, established patient, high complexity",
        },
      ],
    },
    preventive: [
      { code: "99385", description: "Initial preventive exam, 18-39 years" },
      { code: "99386", description: "Initial preventive exam, 40-64 years" },
      { code: "99387", description: "Initial preventive exam, 65+ years" },
      { code: "99395", description: "Periodic preventive exam, 18-39 years" },
      { code: "99396", description: "Periodic preventive exam, 40-64 years" },
      { code: "99397", description: "Periodic preventive exam, 65+ years" },
    ],
    laboratory: [
      { code: "80053", description: "Comprehensive metabolic panel" },
      { code: "85025", description: "Complete blood count with differential" },
      { code: "80061", description: "Lipid panel" },
      { code: "83036", description: "Hemoglobin A1C" },
      { code: "87086", description: "Urine culture" },
    ],
    radiology: [
      { code: "71045", description: "Chest X-ray, single view" },
      { code: "71046", description: "Chest X-ray, 2 views" },
      { code: "72170", description: "Pelvis X-ray" },
      { code: "73610", description: "Ankle X-ray" },
      { code: "74177", description: "CT abdomen and pelvis with contrast" },
    ],
    vaccination: [
      {
        code: "90460",
        description: "Immunization administration, first component",
      },
      {
        code: "90461",
        description: "Immunization administration, each additional component",
      },
      { code: "90686", description: "Influenza vaccine" },
      { code: "90732", description: "Pneumococcal vaccine" },
    ],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Generate AI-powered coding suggestions
   */
  async generateCodingSuggestions(
    request: CodingSuggestionRequest,
    userId?: string
  ): Promise<CodingSuggestionResult> {
    const startTime = Date.now();

    // Analyze clinical text
    const keywords = this.extractKeywords(request.clinicalText.toLowerCase());
    const context = this.determineContext(keywords, request.serviceType);

    // Generate ICD-10 suggestions
    const icd10Codes = this.suggestIcd10Codes(keywords, context);

    // Generate CPT suggestions
    const cptCodes = this.suggestCptCodes(keywords, context, request.specialty);

    // Generate modifier suggestions
    const modifiers = this.suggestModifiers(context, request);

    // Calculate overall confidence
    const overallConfidence = this.calculateConfidence(icd10Codes, cptCodes);

    const processingTime = Date.now() - startTime;

    // Store suggestion for analytics and learning
    const suggestionRecord = await this.prisma.codingSuggestion.create({
      data: {
        clinicalText: request.clinicalText,
        serviceType: request.serviceType,
        specialty: request.specialty,
        suggestedIcd10: icd10Codes,
        suggestedCpt: cptCodes,
        suggestedModifiers: modifiers,
        aiModel: "rule-based-v1",
        aiVersion: "1.0.0",
        confidence: overallConfidence,
        processingTime,
        usedBy: userId,
      },
    });

    return {
      icd10Codes,
      cptCodes,
      modifiers,
      overallConfidence,
    };
  }

  /**
   * Extract medical keywords from clinical text
   */
  private extractKeywords(text: string): string[] {
    const medicalTerms = [
      "hypertension",
      "diabetes",
      "covid",
      "pneumonia",
      "chest pain",
      "anxiety",
      "depression",
      "back pain",
      "headache",
      "fracture",
      "fever",
      "cough",
      "shortness of breath",
      "fatigue",
      "nausea",
      "vomiting",
      "diarrhea",
      "abdominal pain",
      "rash",
      "dizziness",
      "office visit",
      "follow-up",
      "consultation",
      "preventive",
      "annual",
      "physical exam",
      "vaccination",
      "immunization",
      "lab",
      "blood work",
      "x-ray",
      "ct scan",
      "mri",
      "ultrasound",
      "ekg",
      "ecg",
    ];

    const keywords: string[] = [];

    for (const term of medicalTerms) {
      if (text.includes(term)) {
        keywords.push(term);
      }
    }

    // Extract specific patterns
    if (text.includes("type 2") && text.includes("diabetes")) {
      keywords.push("diabetes type 2");
    }
    if (text.includes("type 1") && text.includes("diabetes")) {
      keywords.push("diabetes type 1");
    }
    if (text.includes("new patient")) {
      keywords.push("new patient");
    }
    if (text.includes("established patient")) {
      keywords.push("established patient");
    }

    return keywords;
  }

  /**
   * Determine clinical context
   */
  private determineContext(keywords: string[], serviceType?: string): any {
    const context = {
      isEmergency: false,
      isPreventive: false,
      isFollowUp: false,
      isNewPatient: false,
      complexity: "moderate",
      primarySystem: "",
    };

    // Determine patient status
    if (keywords.includes("new patient")) {
      context.isNewPatient = true;
    }
    if (keywords.includes("follow-up")) {
      context.isFollowUp = true;
    }
    if (keywords.includes("preventive") || keywords.includes("annual")) {
      context.isPreventive = true;
    }

    // Determine complexity based on keyword count and types
    if (keywords.length > 5) {
      context.complexity = "high";
    } else if (keywords.length < 2) {
      context.complexity = "low";
    }

    // Determine primary system
    if (
      keywords.some((k) => ["hypertension", "chest pain", "ekg"].includes(k))
    ) {
      context.primarySystem = "cardiovascular";
    } else if (keywords.some((k) => ["diabetes", "a1c"].includes(k))) {
      context.primarySystem = "endocrine";
    } else if (
      keywords.some((k) =>
        ["pneumonia", "cough", "shortness of breath"].includes(k)
      )
    ) {
      context.primarySystem = "respiratory";
    } else if (keywords.some((k) => ["anxiety", "depression"].includes(k))) {
      context.primarySystem = "psychiatric";
    } else if (keywords.some((k) => ["back pain", "fracture"].includes(k))) {
      context.primarySystem = "musculoskeletal";
    }

    return context;
  }

  /**
   * Suggest ICD-10 codes based on keywords
   */
  private suggestIcd10Codes(
    keywords: string[],
    context: any
  ): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];
    const addedCodes = new Set<string>();

    // Match keywords to ICD-10 codes
    for (const keyword of keywords) {
      if (this.icd10Database[keyword]) {
        for (const code of this.icd10Database[keyword]) {
          if (!addedCodes.has(code.code)) {
            suggestions.push({
              code: code.code,
              description: code.description,
              confidence: this.calculateKeywordConfidence(
                keyword,
                keywords.length
              ),
              rationale: `Matched keyword: ${keyword}`,
            });
            addedCodes.add(code.code);
          }
        }
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // Limit to top 5 suggestions
    return suggestions.slice(0, 5);
  }

  /**
   * Suggest CPT codes based on context
   */
  private suggestCptCodes(
    keywords: string[],
    context: any,
    specialty?: string
  ): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Office visit codes
    if (keywords.includes("office visit") || context.isFollowUp) {
      const visitType = context.isNewPatient ? "new" : "established";
      const visitCodes = this.cptDatabase["office visit"][visitType];

      // Select based on complexity
      let selectedCode;
      switch (context.complexity) {
        case "low":
          selectedCode = visitCodes[0];
          break;
        case "moderate":
          selectedCode = visitCodes[2];
          break;
        case "high":
          selectedCode = visitCodes[3];
          break;
        default:
          selectedCode = visitCodes[1];
      }

      suggestions.push({
        code: selectedCode.code,
        description: selectedCode.description,
        confidence: 0.8,
        rationale: `${visitType} patient visit, ${context.complexity} complexity`,
      });
    }

    // Preventive care codes
    if (context.isPreventive) {
      const preventiveCodes = this.cptDatabase.preventive;
      suggestions.push({
        code: preventiveCodes[3].code, // Default to periodic exam
        description: preventiveCodes[3].description,
        confidence: 0.75,
        rationale: "Preventive care visit",
      });
    }

    // Lab codes
    if (keywords.some((k) => ["lab", "blood work"].includes(k))) {
      this.cptDatabase.laboratory.forEach((lab) => {
        if (keywords.some((k) => lab.description.toLowerCase().includes(k))) {
          suggestions.push({
            code: lab.code,
            description: lab.description,
            confidence: 0.7,
            rationale: "Laboratory test",
          });
        }
      });
    }

    // Radiology codes
    if (keywords.some((k) => ["x-ray", "ct", "mri"].includes(k))) {
      this.cptDatabase.radiology.forEach((rad) => {
        if (keywords.some((k) => rad.description.toLowerCase().includes(k))) {
          suggestions.push({
            code: rad.code,
            description: rad.description,
            confidence: 0.7,
            rationale: "Imaging study",
          });
        }
      });
    }

    // Vaccination codes
    if (keywords.some((k) => ["vaccination", "immunization"].includes(k))) {
      suggestions.push({
        code: this.cptDatabase.vaccination[0].code,
        description: this.cptDatabase.vaccination[0].description,
        confidence: 0.75,
        rationale: "Vaccination administration",
      });
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions.slice(0, 5);
  }

  /**
   * Suggest modifiers based on context
   */
  private suggestModifiers(
    context: any,
    request: CodingSuggestionRequest
  ): Array<{ modifier: string; reason: string }> {
    const modifiers = [];

    // Bilateral procedures
    if (
      request.clinicalText.includes("bilateral") ||
      request.clinicalText.includes("both")
    ) {
      modifiers.push({
        modifier: "50",
        reason: "Bilateral procedure",
      });
    }

    // Multiple procedures
    if (context.complexity === "high") {
      modifiers.push({
        modifier: "51",
        reason: "Multiple procedures",
      });
    }

    // Professional component
    if (
      request.clinicalText.includes("interpretation") ||
      request.clinicalText.includes("reading")
    ) {
      modifiers.push({
        modifier: "26",
        reason: "Professional component",
      });
    }

    return modifiers;
  }

  /**
   * Calculate keyword confidence
   */
  private calculateKeywordConfidence(
    keyword: string,
    totalKeywords: number
  ): number {
    // Higher confidence for more specific keywords
    const specificKeywords = [
      "covid",
      "diabetes",
      "hypertension",
      "pneumonia",
      "fracture",
    ];
    const baseConfidence = specificKeywords.includes(keyword) ? 0.9 : 0.7;

    // Adjust based on total keywords (fewer keywords = higher confidence per keyword)
    const adjustment = totalKeywords > 3 ? -0.1 : totalKeywords < 2 ? 0.1 : 0;

    return Math.min(Math.max(baseConfidence + adjustment, 0.5), 1.0);
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(
    icd10Codes: CodeSuggestion[],
    cptCodes: CodeSuggestion[]
  ): number {
    if (icd10Codes.length === 0 && cptCodes.length === 0) {
      return 0;
    }

    const icd10Confidence =
      icd10Codes.length > 0
        ? icd10Codes.reduce((sum, c) => sum + c.confidence, 0) /
          icd10Codes.length
        : 0;

    const cptConfidence =
      cptCodes.length > 0
        ? cptCodes.reduce((sum, c) => sum + c.confidence, 0) / cptCodes.length
        : 0;

    // Weight ICD-10 and CPT equally
    const totalConfidence = (icd10Confidence + cptConfidence) / 2;

    return Math.round(totalConfidence * 100) / 100;
  }

  /**
   * Record feedback on suggestions
   */
  async recordFeedback(
    suggestionId: string,
    wasAccepted: boolean,
    finalIcd10: string[],
    finalCpt: string[],
    feedbackNotes?: string
  ): Promise<void> {
    await this.prisma.codingSuggestion.update({
      where: { id: suggestionId },
      data: {
        wasAccepted,
        finalIcd10,
        finalCpt,
        feedbackNotes,
        usedAt: new Date(),
      },
    });
  }

  /**
   * Get suggestion analytics
   */
  async getSuggestionAnalytics(dateFrom: Date, dateTo: Date) {
    const suggestions = await this.prisma.codingSuggestion.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    const totalSuggestions = suggestions.length;
    const acceptedSuggestions = suggestions.filter(
      (s) => s.wasAccepted === true
    ).length;
    const rejectedSuggestions = suggestions.filter(
      (s) => s.wasAccepted === false
    ).length;
    const avgConfidence =
      suggestions.reduce((sum, s) => sum + s.confidence, 0) / totalSuggestions;
    const avgProcessingTime =
      suggestions.reduce((sum, s) => sum + s.processingTime, 0) /
      totalSuggestions;

    return {
      totalSuggestions,
      acceptedSuggestions,
      rejectedSuggestions,
      acceptanceRate:
        totalSuggestions > 0 ? acceptedSuggestions / totalSuggestions : 0,
      avgConfidence,
      avgProcessingTime,
    };
  }
}
