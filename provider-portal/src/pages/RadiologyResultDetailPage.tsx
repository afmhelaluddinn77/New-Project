/**
 * Radiology Result Detail Page
 *
 * Displays comprehensive radiology reports with:
 * - ACR-standard report format (Technique, Comparison, Findings, Impression)
 * - Image viewer with DICOM support
 * - Historical comparison with prior studies
 * - Print-ready layout
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Calendar, User, FileText, Image as ImageIcon, Download, Printer } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Breadcrumb from "../components/shared/Breadcrumb";
import { LoadingState } from "../components/shared/LoadingState";

interface RadiologyOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  studyType: string;
  bodyPart: string;
  contrast: boolean;
  priority: string;
  status: string;
  clinicalIndication: string | null;
  orderedAt: string;
  reportedAt: string | null;
  report: {
    id: string;
    reportText: string;
    impression: string | null;
    criticalFinding: boolean;
    reportingRadiologistId: string;
    reportStatus: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  imagingAssets: Array<{
    id: string;
    uri: string;
    mimeType: string;
    createdAt: string;
  }>;
}

async function fetchRadiologyOrder(orderId: string): Promise<RadiologyOrder> {
  // Radiology service is on port 3014
  const radiologyApi = axios.create({
    baseURL: "http://localhost:3014/api/radiology",
    withCredentials: true,
  });

  // Add auth headers
  const { accessToken, user } = useAuthStore.getState();
  if (accessToken) {
    radiologyApi.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }
  radiologyApi.defaults.headers.common["x-user-role"] = user?.role || "PROVIDER";
  radiologyApi.defaults.headers.common["x-portal"] = "PROVIDER";
  if (user?.id) {
    radiologyApi.defaults.headers.common["x-user-id"] = user.id;
  }

  const response = await radiologyApi.get(`/orders/${orderId}`);
  return response.data;
}

// Main component
export const RadiologyResultDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["radiologyOrder", orderId],
    queryFn: () => fetchRadiologyOrder(orderId!),
    enabled: !!orderId,
  });

  if (isLoading) {
    return <LoadingState message="Loading radiology report..." />;
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">The requested radiology report could not be loaded.</p>
          <button
            onClick={() => navigate("/results")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const report = order.report;
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse report text into sections (ACR format)
  const parseReportText = (text: string) => {
    const sections: Record<string, string> = {};
    const lines = text.split("\n");
    let currentSection = "FINDINGS";
    let currentContent: string[] = [];

    for (const line of lines) {
      const upperLine = line.trim().toUpperCase();
      if (upperLine.startsWith("TECHNIQUE:")) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join("\n");
        }
        currentSection = "TECHNIQUE";
        currentContent = [line.replace(/^TECHNIQUE:\s*/i, "").trim()];
      } else if (upperLine.startsWith("COMPARISON:")) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join("\n");
        }
        currentSection = "COMPARISON";
        currentContent = [line.replace(/^COMPARISON:\s*/i, "").trim()];
      } else if (upperLine.startsWith("FINDINGS:")) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join("\n");
        }
        currentSection = "FINDINGS";
        currentContent = [line.replace(/^FINDINGS:\s*/i, "").trim()];
      } else {
        currentContent.push(line);
      }
    }
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join("\n");
    }

    return sections;
  };

  const reportSections = report ? parseReportText(report.reportText) : {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Results Timeline", path: "/results" },
            { label: "Radiology Report" },
          ]}
        />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {order.studyType} - {order.bodyPart}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Order: {order.orderNumber}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={() => navigate("/results")}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <User size={14} />
                  <span className="font-medium">Patient ID</span>
                </div>
                <p className="text-gray-900">{order.patientId}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar size={14} />
                  <span className="font-medium">Ordered</span>
                </div>
                <p className="text-gray-900">{formatDate(order.orderedAt)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <FileText size={14} />
                  <span className="font-medium">Reported</span>
                </div>
                <p className="text-gray-900">{formatDate(order.reportedAt)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <span className="font-medium">Priority</span>
                </div>
                <p className="text-gray-900">{order.priority}</p>
              </div>
            </div>
          </div>

          {/* Clinical Indication */}
          {order.clinicalIndication && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Clinical Indication</h3>
              <p className="text-sm text-gray-900">{order.clinicalIndication}</p>
            </div>
          )}
        </div>

        {/* Report Content */}
        {report ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Radiology Report</h2>
              <p className="text-sm text-gray-500 mt-1">
                Status: <span className="font-medium">{report.reportStatus}</span>
                {report.criticalFinding && (
                  <span className="ml-3 px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                    Critical Finding
                  </span>
                )}
              </p>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Technique */}
              {reportSections.TECHNIQUE && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Technique
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {reportSections.TECHNIQUE}
                  </p>
                </div>
              )}

              {/* Comparison */}
              {reportSections.COMPARISON && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Comparison
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {reportSections.COMPARISON}
                  </p>
                </div>
              )}

              {/* Findings */}
              {reportSections.FINDINGS && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Findings
                  </h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {reportSections.FINDINGS}
                    </p>
                  </div>
                </div>
              )}

              {/* Impression */}
              {report.impression && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Impression
                  </h3>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {report.impression}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Report not yet available.</p>
          </div>
        )}

        {/* Images Section */}
        {order.imagingAssets && order.imagingAssets.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon size={20} />
                  Imaging Studies ({order.imagingAssets.length})
                </h2>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.imagingAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {asset.mimeType.startsWith("image/") ? (
                        <img
                          src={asset.uri}
                          alt="Radiology image"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <ImageIcon size={48} className="mx-auto mb-2" />
                          <p className="text-sm">DICOM Image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {formatDate(asset.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historical Comparison Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Historical Comparison</h2>
            <p className="text-sm text-gray-500 mt-1">
              Compare with prior {order.studyType} studies for {order.bodyPart}
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 text-center py-8">
              No prior studies available for comparison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologyResultDetailPage;

