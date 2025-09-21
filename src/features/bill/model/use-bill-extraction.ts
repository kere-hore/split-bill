"use client";

import { useState, useEffect } from "react";
import { useExtractDataOCR } from "@/entities/ocr";
import { BillFormData } from "../lib/bill-schema";
import { toast } from "sonner";

export function useBillExtraction() {
  const [extractedData, setExtractedData] =
    useState<Partial<BillFormData> | null>(null);
  const {
    mutate: extractOCR,
    isPending: isExtracting,
    isSuccess,
    data,
  } = useExtractDataOCR();

  const extractFromImage = (file: File) => {
    extractOCR({ image: file });
  };

  const resetExtraction = () => {
    setExtractedData(null);
  };

  useEffect(() => {
    if (isSuccess && data?.success && data.data) {
      setExtractedData(data.data);
      toast.success("Bill data extracted successfully!");
    } else if (isSuccess && !data?.success) {
      toast.error("Failed to extract bill data");
    }
  }, [isSuccess, data]);

  return {
    isExtracting,
    extractedData,
    extractFromImage,
    resetExtraction,
  };
}
