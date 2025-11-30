"use client";

import { ButtonStatus } from "@/frontend/types";
import React, { useRef } from "react";
import WorkflowButton from "./Button";

export function ExcelDropzone({
  onFileDrop,
}: {
  onFileDrop: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click(); // ouvre le dialogue de fichier
  };

  const status = ButtonStatus.idle

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileDrop(file);
      e.target.value = ""; // reset pour pouvoir re-sélectionner le même fichier
    }
  };

  return (
    <div className="w-full text-center">
      <WorkflowButton
        label="Add Data"
        onClick={handleButtonClick}
        status={status}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
    </div>
  );
}
