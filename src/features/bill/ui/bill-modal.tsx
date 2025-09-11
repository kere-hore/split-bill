"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { BillImageDropzone } from "./bill-image-dropzone";
import { BillForm } from "./bill-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function BillFormModal() {
  const param = useSearchParams();
  const router = useRouter();
  const isOpen = param.has("bill");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleClose = () => {
    const params = new URLSearchParams(param);
    params.delete("bill");
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  console.log({ selectedFile });
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
              onFileSelect={setSelectedFile}
              className="h-full min-h-[200px] sm:min-h-[300px]"
            />
          </div>
          {selectedFile ? (
            <div className="flex-2 sm:flex-1 sm:max-h-[75vh] sm:overflow-y-scroll">
              <BillForm onSubmit={() => {}} />
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
