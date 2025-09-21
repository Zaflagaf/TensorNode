import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/frontend/components/ui/card";
import { Label } from "@/frontend/components/ui/label";

export function ExcelDropzone({
    onFileDrop,
}: {
    onFileDrop: (file: File) => void;
}) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) onFileDrop(file);
        },
        [onFileDrop]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
        ],
        "application/vnd.ms-excel": [".xls"],
        },
    });

    return (
        <Card
        {...getRootProps()}
        className="w-full p-6 text-center transition border-2 border-dashed cursor-pointer border-muted rounded-2xl hover:bg-muted"
        >
        <input {...getInputProps()} />
        <Label className="text-muted-foreground min-w-52">
            {isDragActive
            ? "Déposez votre fichier Excel ici..."
            : "Glissez un fichier Excel ici ou cliquez pour en choisir un."}
        </Label>
        </Card>
    );
}
