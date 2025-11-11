import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

/**
 * PDF Export Service for Lab Results
 *
 * Following PROJECT LAW: Always provide professional, print-ready reports
 * Generates high-quality PDF reports matching clinical standards
 */

@Injectable()
export class PdfExportService {
  private readonly exportDir = path.join(process.cwd(), 'exports');

  constructor() {
    this.ensureExportDirectory();
  }

  /**
   * Generate PDF report for lab results
   */
  async generateLabResultPdf(resultData: any): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Set page format for medical reports
      await page.setViewport({ width: 1200, height: 1600 });

      // Generate HTML content
      const htmlContent = this.generateLabResultHtml(resultData);

      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const fileName = `lab-result-${resultData.orderId}-${Date.now()}.pdf`;
      const filePath = path.join(this.exportDir, fileName);

      await page.pdf({
        path: filePath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(resultData),
        footerTemplate: this.getFooterTemplate(),
      });

      return filePath;
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate comprehensive HTML for lab result
   */
  private generateLabResultHtml(resultData: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab Result Report - ${resultData.orderId}</title>
    <style>
        ${this.getLabResultStyles()}
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header Section -->
        <div class="report-header">
            <div class="lab-logo">
                <h1>Central Clinical Laboratory</h1>
                <p>Comprehensive Laboratory Services</p>
            </div>
            <div class="report-info">
                <h2>Laboratory Report</h2>
                <p><strong>Report ID:</strong> ${resultData.orderId}</p>
                <p><strong>Date:</strong> ${new Date(resultData.resultedAt).toLocaleDateString()}</p>
            </div>
        </div>

        <!-- Patient Information -->
        <div class="patient-section">
            <h3>Patient Information</h3>
            <div class="patient-grid">
                <div class="patient-field">
                    <label>Patient ID:</label>
                    <span>${resultData.patientId}</span>
                </div>
                <div class="patient-field">
                    <label>Encounter:</label>
                    <span>${resultData.encounterId}</span>
                </div>
                <div class="patient-field">
                    <label>Date of Birth:</label>
                    <span>01/15/1980</span>
                </div>
                <div class="patient-field">
                    <label>Gender:</label>
                    <span>Female</span>
                </div>
            </div>
        </div>

        <!-- Test Information -->
        <div class="test-section">
            <h3>Test Information</h3>
            <div class="test-grid">
                <div class="test-field">
                    <label>Test Name:</label>
                    <span>${resultData.testName}</span>
                </div>
                <div class="test-field">
                    <label>LOINC Code:</label>
                    <span>${resultData.testCode}</span>
                </div>
                <div class="test-field">
                    <label>Performed:</label>
                    <span>${new Date(resultData.performedAt).toLocaleString()}</span>
                </div>
                <div class="test-field">
                    <label>Resulted:</label>
                    <span>${new Date(resultData.resultedAt).toLocaleString()}</span>
                </div>
                <div class="test-field">
                    <label>Verified By:</label>
                    <span>${resultData.verifiedBy}</span>
                </div>
                <div class="test-field">
                    <label>Status:</label>
                    <span class="status-final">${resultData.status}</span>
                </div>
            </div>
        </div>

        <!-- Results Table -->
        <div class="results-section">
            <h3>Test Results</h3>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Value</th>
                        <th>Unit</th>
                        <th>Reference Range</th>
                        <th>Status</th>
                        <th>Trend</th>
                    </tr>
                </thead>
                <tbody>
                    ${resultData.components
                      .map(
                        (component) => `
                        <tr class="result-row ${this.getRowClass(component.interpretation)}">
                            <td class="component-name">
                                <strong>${component.displayName}</strong>
                                <br><small>${component.name}</small>
                            </td>
                            <td class="component-value">${component.value}</td>
                            <td class="component-unit">${component.unit}</td>
                            <td class="reference-range">${component.referenceRangeText}</td>
                            <td class="status-cell">
                                <span class="status-badge status-${component.interpretation.toLowerCase()}">
                                    ${this.getStatusLabel(component.interpretation)}
                                </span>
                            </td>
                            <td class="trend-cell">
                                <span class="trend-${component.trend?.toLowerCase()}">
                                    ${this.getTrendSymbol(component.trend)}
                                </span>
                            </td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        </div>

        <!-- Clinical Interpretation -->
        <div class="interpretation-section">
            <h3>Clinical Interpretation</h3>
            <div class="interpretation-content">
                <p>${resultData.interpretation}</p>
            </div>
        </div>

        <!-- Historical Comparison -->
        ${
          resultData.historicalResults.length > 0
            ? `
        <div class="history-section">
            <h3>Historical Comparison</h3>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Current</th>
                        ${resultData.historicalResults
                          .map(
                            (h) => `
                            <th>${new Date(h.date).toLocaleDateString()}</th>
                        `,
                          )
                          .join('')}
                    </tr>
                </thead>
                <tbody>
                    ${resultData.components
                      .map(
                        (component) => `
                        <tr>
                            <td><strong>${component.displayName}</strong></td>
                            <td class="current-value">${component.value}</td>
                            ${resultData.historicalResults
                              .map(
                                (h) => `
                                <td>${h.components[component.displayName] || '—'}</td>
                            `,
                              )
                              .join('')}
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        `
            : ''
        }

        <!-- Footer Information -->
        <div class="report-footer">
            <div class="footer-section">
                <h4>Laboratory Information</h4>
                <p><strong>Performing Laboratory:</strong> ${resultData.performingLab}</p>
                <p><strong>Laboratory Director:</strong> Dr. Sarah Johnson, MD</p>
                <p><strong>CLIA Number:</strong> 12D3456789</p>
            </div>
            <div class="footer-section">
                <h4>Contact Information</h4>
                <p><strong>Phone:</strong> (555) 123-4567</p>
                <p><strong>Fax:</strong> (555) 123-4568</p>
                <p><strong>Email:</strong> results@centrallab.com</p>
            </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
            <p><strong>Important:</strong> This report contains confidential medical information.
            Results should be interpreted by a qualified healthcare professional in the context
            of clinical findings and patient history. Reference ranges may vary by laboratory
            and methodology.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * CSS styles for professional lab report
   */
  private getLabResultStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }

        .report-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 0;
        }

        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .lab-logo h1 {
            font-size: 24px;
            color: #2563eb;
            margin-bottom: 5px;
        }

        .lab-logo p {
            color: #666;
            font-size: 14px;
        }

        .report-info {
            text-align: right;
        }

        .report-info h2 {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 10px;
        }

        .report-info p {
            margin-bottom: 5px;
            font-size: 13px;
        }

        .patient-section, .test-section, .results-section,
        .interpretation-section, .history-section {
            margin-bottom: 25px;
        }

        h3 {
            font-size: 16px;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }

        .patient-grid, .test-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 20px;
        }

        .patient-field, .test-field {
            display: flex;
            align-items: center;
        }

        .patient-field label, .test-field label {
            font-weight: bold;
            margin-right: 10px;
            min-width: 100px;
        }

        .status-final {
            background: #10b981;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }

        .results-table, .history-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .results-table th, .results-table td,
        .history-table th, .history-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        .results-table th, .history-table th {
            background: #f3f4f6;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
        }

        .component-name {
            min-width: 120px;
        }

        .component-name strong {
            color: #1f2937;
        }

        .component-name small {
            color: #6b7280;
            font-size: 10px;
        }

        .component-value {
            font-weight: bold;
            text-align: center;
        }

        .status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-n { background: #d1fae5; color: #065f46; }
        .status-l { background: #dbeafe; color: #1e40af; }
        .status-h { background: #fed7aa; color: #c2410c; }
        .status-ll, .status-hh { background: #fecaca; color: #dc2626; }
        .status-a { background: #fef3c7; color: #d97706; }

        .result-row.abnormal {
            background: #fef9f9;
        }

        .result-row.critical {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
        }

        .trend-up { color: #2563eb; }
        .trend-down { color: #dc2626; }
        .trend-stable { color: #6b7280; }

        .interpretation-content {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            font-size: 13px;
            line-height: 1.5;
        }

        .current-value {
            font-weight: bold;
            background: #ecfdf5;
        }

        .report-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }

        .footer-section h4 {
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 10px;
        }

        .footer-section p {
            margin-bottom: 5px;
            font-size: 11px;
        }

        .disclaimer {
            margin-top: 20px;
            padding: 15px;
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            font-size: 11px;
            line-height: 1.4;
        }

        @media print {
            .report-container {
                max-width: none;
            }

            .results-section, .history-section {
                page-break-inside: avoid;
            }
        }
    `;
  }

  private getHeaderTemplate(resultData: any): string {
    return `
      <div style="font-size: 10px; padding: 0 15mm; width: 100%; display: flex; justify-content: space-between;">
        <span>Lab Report - ${resultData.testName}</span>
        <span>Patient: ${resultData.patientId}</span>
      </div>
    `;
  }

  private getFooterTemplate(): string {
    return `
      <div style="font-size: 10px; padding: 0 15mm; width: 100%; display: flex; justify-content: space-between;">
        <span>Central Clinical Laboratory - CONFIDENTIAL</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `;
  }

  private getRowClass(interpretation: string): string {
    if (['LL', 'HH'].includes(interpretation)) return 'critical';
    if (['L', 'H', 'A'].includes(interpretation)) return 'abnormal';
    return '';
  }

  private getStatusLabel(interpretation: string): string {
    const labels = {
      N: '✓ Normal',
      L: '↓ Low',
      H: '↑ High',
      LL: '↓↓ Critical Low',
      HH: '↑↑ Critical High',
      A: '⚠ Abnormal',
    };
    return labels[interpretation] || interpretation;
  }

  private getTrendSymbol(trend?: string): string {
    const symbols = {
      UP: '↑──',
      DOWN: '↓──',
      STABLE: '───',
      RECENT_UP: '──↑',
      RECENT_DOWN: '──↓',
    };
    return symbols[trend || 'STABLE'] || '───';
  }

  private async ensureExportDirectory(): Promise<void> {
    try {
      await fs.access(this.exportDir);
    } catch {
      await fs.mkdir(this.exportDir, { recursive: true });
    }
  }
}
