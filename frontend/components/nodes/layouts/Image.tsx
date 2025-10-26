"use client";

import { cn } from "@/frontend/lib/utils";
import React, { useRef, useState } from "react";

interface WorkflowImageProps {
  imageUrl?: string;
  setImageUrl?: (url: string) => void;
  label: string;
}

const WorkflowImage: React.FC<WorkflowImageProps> = React.memo(
  ({ imageUrl, setImageUrl, label }) => {
    const [preview, setPreview] = useState<string | null>(imageUrl || null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        if (setImageUrl) setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    };

    return (
      <div
        className={cn(
          "bg-node-input rounded-[4px] py-[6px] px-[8px] gap-[6px] flex flex-col items-center text-node-text hover:text-node-text-hover text-xs focus-within:bg-node-input-focus w-full h-auto"
        )}
      >
        <p className="w-full text-left text-xs font-medium mb-1">{label}:</p>

        <div
          className={cn(
            "relative w-full overflow-hidden rounded-[6px] border border-muted bg-muted/10 cursor-pointer hover:border-node-text-hover transition-all aspect-square"
          )}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-[11px]">
              Cliquez pour importer une image
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    );
  }
);

WorkflowImage.displayName = "WorkflowImage";
export default WorkflowImage;
