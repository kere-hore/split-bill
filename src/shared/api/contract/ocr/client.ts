import { api } from "@/shared/api/axios";
import { OCRExtractRequest, OCRExtractResponse } from "./types";

export async function extractOCR(
  data: OCRExtractRequest
): Promise<OCRExtractResponse> {
  const { image } = data;
  const formData = new FormData();

  formData.append("image", image);

  const response = await api.post("/ocr/extract", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
