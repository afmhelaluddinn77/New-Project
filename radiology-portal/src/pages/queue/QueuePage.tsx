import {
  FileSignature,
  Image as ImageIcon,
  Link as LinkIcon,
  Scan,
  Upload,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import {
  fetchRadiologyOrder,
  uploadRadiologyImage,
} from "../../services/radiologyApi";
import { getWorkflowSocket } from "../../services/socketClient";
import { useRadiologyStore } from "../../store/radiologyStore";
import type { ImagingAsset, RadiologyOrder } from "../../types/radiology";
import "./QueuePage.css";

export default function RadiologyQueuePage() {
  const orders = useRadiologyStore((state) => state.orders);
  const loading = useRadiologyStore((state) => state.loading);
  const fetchOrders = useRadiologyStore((state) => state.fetchOrders);
  const submitReport = useRadiologyStore((state) => state.submitReport);
  const refreshOrder = useRadiologyStore((state) => state.refreshOrder);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");
  const [impression, setImpression] = useState("");
  const [critical, setCritical] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image upload state
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImagingAsset[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && orders.length === 0) {
      void fetchOrders();
    }
  }, [orders.length, loading, fetchOrders]);

  useEffect(() => {
    const socket = getWorkflowSocket();
    const handler = ({ orderId }: { orderId: string }) => {
      void refreshOrder(orderId);
    };
    socket.on("order.updated", handler);
    return () => {
      socket.off("order.updated", handler);
    };
  }, [refreshOrder]);

  const selectedOrder: RadiologyOrder | null = useMemo(() => {
    if (!selectedOrderId) {
      return orders[0] ?? null;
    }
    return orders.find((order) => order.id === selectedOrderId) ?? null;
  }, [orders, selectedOrderId]);

  useEffect(() => {
    if (selectedOrder?.report) {
      setReportText(selectedOrder.report.reportText);
      setImpression(selectedOrder.report.impression ?? "");
      setCritical(selectedOrder.report.criticalFinding);
    } else {
      setReportText("");
      setImpression("");
      setCritical(false);
    }

    // Load images when order changes
    if (selectedOrder?.id) {
      loadOrderImages(selectedOrder.id);
    } else {
      setUploadedImages([]);
    }
  }, [selectedOrder]);

  const loadOrderImages = async (orderId: string) => {
    try {
      const order = await fetchRadiologyOrder(orderId);
      setUploadedImages(order.imagingAssets || []);
    } catch (error) {
      console.error("Failed to load images:", error);
      setUploadedImages([]);
    }
  };

  const handleImageUrlUpload = async () => {
    if (!selectedOrder || !imageUrl.trim()) return;

    setUploadingImage(true);
    setImageUploadError(null);

    try {
      // Validate URL
      new URL(imageUrl);

      const asset = await uploadRadiologyImage(
        selectedOrder.id,
        imageUrl,
        true
      );
      setUploadedImages([...uploadedImages, asset]);
      setImageUrl("");
    } catch (error: any) {
      setImageUploadError(
        error.message ||
          "Failed to upload image. Please check the URL is valid and accessible."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      !selectedOrder ||
      !event.target.files ||
      event.target.files.length === 0
    )
      return;

    const file = event.target.files[0];
    setUploadingImage(true);
    setImageUploadError(null);

    try {
      const asset = await uploadRadiologyImage(selectedOrder.id, file, false);
      setUploadedImages([...uploadedImages, asset]);
    } catch (error: any) {
      setImageUploadError(error.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport(selectedOrder.id, {
        reportText,
        impression,
        criticalFinding: critical,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rad-queue-page">
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Imaging Queue" },
        ]}
      />

      <div className="queue-header">
        <div>
          <h1>Imaging Queue</h1>
          <p>
            Read studies, dictate findings, and publish radiology reports in
            real time.
          </p>
        </div>
      </div>

      <div className="queue-layout">
        <section className="queue-orders">
          <header>
            <Scan size={18} /> Studies
          </header>
          <ul>
            {orders.map((order) => (
              <li
                key={order.id}
                className={
                  order.id === selectedOrder?.id
                    ? "order-row active"
                    : "order-row"
                }
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div>
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="order-meta">
                    {order.studyType} • {order.bodyPart}
                  </span>
                </div>
                <span
                  className={`status-pill status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </li>
            ))}
            {!loading && orders.length === 0 && (
              <li className="muted">No studies awaiting interpretation.</li>
            )}
          </ul>
        </section>

        <section className="report-panel">
          {selectedOrder ? (
            <form className="report-form" onSubmit={handleSubmit}>
              <header>
                <div>
                  <h2>{selectedOrder.orderNumber}</h2>
                  <p>
                    Patient #{selectedOrder.patientId} • Priority{" "}
                    {selectedOrder.priority}
                  </p>
                </div>
                <span
                  className={`status-pill status-${selectedOrder.status.toLowerCase()}`}
                >
                  {selectedOrder.status}
                </span>
              </header>

              <label>
                <span>Report Text</span>
                <textarea
                  rows={6}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Impression</span>
                <textarea
                  rows={3}
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                />
              </label>

              <label className="critical-flag">
                <input
                  type="checkbox"
                  checked={critical}
                  onChange={(e) => setCritical(e.target.checked)}
                />
                <span>Mark as critical finding</span>
              </label>

              {/* Image Upload Section */}
              <div className="image-upload-section">
                <h3 className="section-title">
                  <ImageIcon size={18} />
                  Imaging Assets ({uploadedImages.length})
                </h3>

                {/* Uploaded Images Gallery */}
                {uploadedImages.length > 0 && (
                  <div className="image-gallery">
                    {uploadedImages.map((asset) => (
                      <div key={asset.id} className="image-preview-card">
                        <div className="image-preview">
                          <img
                            src={asset.uri}
                            alt="Radiology image"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="image-meta">
                          <span className="image-type">{asset.mimeType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Upload Controls */}
                <div className="image-upload-controls">
                  <div className="upload-method-tabs">
                    <div className="upload-tab active">
                      <LinkIcon size={16} />
                      <span>From URL</span>
                    </div>
                    <label className="upload-tab file-upload-tab">
                      <Upload size={16} />
                      <span>From File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  <div className="url-upload-form">
                    <div className="url-input-group">
                      <input
                        type="url"
                        placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleImageUrlUpload();
                          }
                        }}
                        disabled={uploadingImage}
                        className="url-input"
                      />
                      <button
                        type="button"
                        onClick={handleImageUrlUpload}
                        disabled={uploadingImage || !imageUrl.trim()}
                        className="url-upload-button"
                      >
                        {uploadingImage ? "Uploading..." : "Add Image"}
                      </button>
                    </div>
                    {imageUploadError && (
                      <div className="error-message">{imageUploadError}</div>
                    )}
                  </div>

                  {/* Sample Image URLs for Quick Testing */}
                  <div className="sample-images">
                    <p className="sample-images-label">
                      Quick Add Sample Images:
                    </p>
                    <div className="sample-image-buttons">
                      {[
                        {
                          url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
                          label: "USG Sample 1",
                        },
                        {
                          url: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop",
                          label: "USG Sample 2",
                        },
                        {
                          url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
                          label: "USG Sample 3",
                        },
                      ].map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setImageUrl(sample.url);
                            setTimeout(() => handleImageUrlUpload(), 100);
                          }}
                          disabled={uploadingImage}
                          className="sample-image-button"
                          title={sample.label}
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="error-banner">{error}</div>}

              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                <FileSignature size={18} />{" "}
                {submitting ? "Publishing…" : "Publish Report"}
              </button>
            </form>
          ) : (
            <p className="muted">
              Select a study from the queue to begin reporting.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
