import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
        className="border-dashed border-2 border-muted p-6 rounded-2xl text-center cursor-pointer hover:bg-muted transition w-full"
        >
        <input {...getInputProps()} />
        <Label className="text-muted-foreground">
            {isDragActive
            ? "Déposez votre fichier Excel ici..."
            : "Glissez un fichier Excel ici ou cliquez pour en choisir un."}
        </Label>
        </Card>
    );
}
