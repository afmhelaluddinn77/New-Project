import type {
  CreateReportPayload,
  ImagingAsset,
  RadiologyOrder,
} from "../types/radiology";
import { radiologyClient } from "./httpClient";

export async function fetchPendingStudies(): Promise<RadiologyOrder[]> {
  const response =
    await radiologyClient.get<RadiologyOrder[]>("/orders/pending");
  return response.data;
}

export async function submitRadiologyReport(
  orderId: string,
  payload: CreateReportPayload
): Promise<RadiologyOrder> {
  const response = await radiologyClient.post<RadiologyOrder>(
    `/orders/${orderId}/report`,
    payload
  );
  return response.data;
}

/**
 * Upload an image to a radiology order
 * Supports both file uploads and URL-based images (for web images)
 */
export async function uploadRadiologyImage(
  orderId: string,
  imageFile: File | string,
  isUrl: boolean = false
): Promise<ImagingAsset> {
  if (isUrl && typeof imageFile === "string") {
    // For URL-based images, we'll create a blob from the URL and upload it
    // This allows us to upload images from the web
    const response = await fetch(imageFile);
    const blob = await response.blob();
    const file = new File([blob], "image.png", { type: blob.type });

    const formData = new FormData();
    formData.append("image", file);

    const uploadResponse = await radiologyClient.post<ImagingAsset>(
      `/orders/${orderId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return uploadResponse.data;
  } else if (imageFile instanceof File) {
    // Standard file upload
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await radiologyClient.post<ImagingAsset>(
      `/orders/${orderId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } else {
    throw new Error("Invalid image source. Must be a File or URL string.");
  }
}

/**
 * Fetch a radiology order with all details including images
 */
export async function fetchRadiologyOrder(
  orderId: string
): Promise<RadiologyOrder> {
  const response = await radiologyClient.get<RadiologyOrder>(
    `/orders/${orderId}`
  );
  return response.data;
}
