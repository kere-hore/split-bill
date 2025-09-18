import { extractOCR, OCRExtractRequest } from "@/shared/api/contract/ocr";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useExtractDataOCR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OCRExtractRequest) => extractOCR(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["ocr"], data);
    },
    retry: false,
  });
};
