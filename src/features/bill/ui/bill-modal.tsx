"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { BillImageDropzone } from "./bill-image-dropzone";
import { BillForm } from "./bill-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useBillExtraction } from "../model/use-bill-extraction";
import { useCreateBill } from "@/entities/bill/model/use-bill";
import { BillFormData } from "../lib/bill-schema";
import { toast } from "sonner";

export default function BillFormModal() {
  const param = useSearchParams();
  const router = useRouter();
  const isOpen = param.has("bill");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);

  const { isExtracting, extractedData, extractFromImage, resetExtraction } =
    useBillExtraction();

  const { mutate: createBill, isPending: isSaving } = useCreateBill();

  const handleClose = () => {
    const params = new URLSearchParams(param);
    setSelectedFile(null);
    setHasExtracted(false);
    resetExtraction();
    params.delete("bill");
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setHasExtracted(false);
  }, []);

  const handleBillSubmit = useCallback((data: BillFormData) => {
    console.log("handleBillSubmit called with data:", data);
    
    createBill(data, {
      onSuccess: (response) => {
        console.log("Bill creation success:", response);
        if (response.success) {
          toast.success("Bill saved successfully!");
          router.push(`/settlement/${response.data.id}`);
          handleClose();
        } else {
          toast.error("Failed to save bill");
        }
      },
      onError: (error) => {
        console.error("Save bill error:", error);
        toast.error("Failed to save bill");
      },
    });
  }, [createBill, router, handleClose]);

  useEffect(() => {
    if (selectedFile && !isExtracting && !hasExtracted) {
      extractFromImage(selectedFile);
      setHasExtracted(true);
    }
  }, [selectedFile, isExtracting, hasExtracted, extractFromImage]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(state) => {
        if (!state) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh]">
        <DialogTitle></DialogTitle>
        <div className="flex flex-col sm:flex-row gap-6 max-h-[75vh] overflow-y-auto sm:overflow-visible">
          <div className="flex-1 sm:flex-1">
            <BillImageDropzone
              onFileSelect={handleFileSelect}
              className="h-full min-h-[200px] sm:min-h-[300px]"
            />
          </div>
          {selectedFile ? (
            <div className="flex-2 sm:flex-1 sm:max-h-[75vh] sm:overflow-y-scroll">
              {isExtracting ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      Extracting bill data...
                    </p>
                  </div>
                </div>
              ) : (
                <BillForm
                  initialData={extractedData || undefined}
                  onSubmit={handleBillSubmit}
                  isLoading={isSaving}
                />
              )}
            </div>
          ) : (
            <div className="flex-2 sm:flex-1 flex justify-center items-center">
              <Image
                src="/images/illustration/money-stress.gif"
                alt="placeholder money stress"
                width={300}
                height={225}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}