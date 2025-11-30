import { uploadImages } from "@/frontend/lib/fetch/api";
import { Node } from "@/frontend/types";
import { FolderOpen, ImageIcon, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

import { useNodesStore } from "@/frontend/store/nodesStore";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";

import { useDropzone } from "react-dropzone";
import { Button } from "../../ui/shadcn/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/shadcn/carousel";
import { Progress } from "../../ui/shadcn/progress";

interface ImageFile {
  url: string;
  name: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default function ImagesNodeComponent({ node }: { node: Node }) {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const setNodeInput = useNodesStore((state) => state.actions.setNodeInput);

  const [progressString, setProgressString] = useState<string>("");

  /** 🔹 Traite et stocke localement les images (sans conversion lourde) */
  const handleFiles = async (files: File[]) => {
    setIsProcessing(true);
    setDone(false);
    setProgress(0);

    const total = files.length;
    const previews: ImageFile[] = [];

    const formData = new FormData();

    files.forEach((file, i) => {
      // Ajoute le fichier directement (File est déjà un Blob)
      formData.append("images", file);

      // Génère un aperçu local rapide
      previews.push({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      });

      setProgressString(`Processing ${i + 1} of ${total} images...`);
      setProgress(Math.round(((i + 1) / total) * 100));
    });

    await uploadImages(formData);

    setNodeInput(
      node.id,
      "in-images",
      previews.map((file) => file.name)
    );
    setImageFiles(previews);
    setIsProcessing(false);
    setDone(true);
  };

  /** 🔹 Gestion du drop */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((f) => f.type.startsWith("image/"));
    handleFiles(imageFiles);
  }, []);

  const handleClear = () => {
    imageFiles.forEach((file) => URL.revokeObjectURL(file.url));
    setImageFiles([]);
    setDone(false);
    setProgress(0);
    setProgressString("");
  };

  /** 🔹 Config Dropzone */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    useFsAccessApi: true, // Permet le drop de dossiers complets
  });

  const totalSize = imageFiles.reduce((acc, file) => acc + file.size, 0);

  return (
    <WorkflowNode node={node} className="w-[250px]">
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-250"
      />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-data" node={node}>
          <WorkflowDefault>Images</WorkflowDefault>
        </WorkflowHandle>

        {/* 🔹 Zone de drop */}
        <div className="flex flex-col gap-3">
          <div
            {...getRootProps()}
            className={`bg-background border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-3 text-primary">
                <Upload className="size-12 stroke-[1.5]" />
                <div>
                  <p className="font-medium">Drop your images here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Release to upload
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <ImageIcon className="size-12 stroke-[1.5]" />
                <div>
                  <p className="font-medium text-foreground">
                    Drop images or click to browse
                  </p>
                  <p className="text-sm mt-1">
                    Supports multiple files and folders
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 🔹 Barre de progression */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress
                value={progress}
                className="h-2"
                classNameSecondary="bg-hue-150"
              />
              <p className="text-sm text-muted-foreground text-center">
                {progressString}
              </p>
            </div>
          )}

          {done && !isProcessing && imageFiles.length > 0 && (
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2">
                <FolderOpen className="size-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium text-foreground">
                    {imageFiles.length} image
                    {imageFiles.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    • {formatFileSize(totalSize)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 px-2 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <Carousel className="w-full undraggable">
                <CarouselContent>
                  {imageFiles.map((file, i) => (
                    <CarouselItem key={i} className="basis-2/3">
                      <div className="space-y-2">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                          <img
                            src={file.url || "/placeholder.svg"}
                            alt={file.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="px-1">
                          <p
                            className="text-xs font-medium text-foreground truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {imageFiles.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            </div>
          )}
        </div>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
