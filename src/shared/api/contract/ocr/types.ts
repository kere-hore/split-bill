import { ApiResponse } from '@/shared/types/api-response'
import { ExtractedBillData } from '@/shared/types/ocr'

export interface OCRExtractRequest {
  image: File
}

export type OCRExtractResponse = ApiResponse<ExtractedBillData>

export interface OCRContract {
  extract: {
    request: OCRExtractRequest
    response: OCRExtractResponse
  }
}