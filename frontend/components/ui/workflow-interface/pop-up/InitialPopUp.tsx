"use client";

import { cn } from "@/frontend/lib/utils";
import { File, FilePlus, Folder, Github, Heart } from "lucide-react";
import { useEffect, useState } from "react";

const imageSelection = [
  /*   "https://media.istockphoto.com/id/1470617656/vector/ai-artificial-intelligence-chipset-on-circuit-board-in-futuristic-concept-suitable-for.jpg?s=612x612&w=0&k=20&c=_wC-pphyNI2muaUHG4N9JuYXxJEMDuzx56Dvzr8ZDUk=", */
  "https://static.vecteezy.com/system/resources/previews/028/636/686/non_2x/integrated-circuit-board-wallpaper-technology-digital-motherboard-background-free-vector.jpg",
  /* "https://png.pngtree.com/thumb_back/fh260/background/20230711/pngtree-a-futuristic-mesh-of-data-transfer-abstract-neural-network-technology-as-image_3837535.jpg", */
  /*   "https://content.presentermedia.com/files/clipart/00031000/31269/neural_network_visualization_800_wht.jpg",
  "https://static.vecteezy.com/system/resources/thumbnails/020/937/878/original/digital-plexus-wave-triangulation-shapes-futuristic-technology-neural-networks-animation-loop-background-free-video.jpg", */
];

function PLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        `flex items-center gap-1 hover:bg-accent p-0.5 rounded-xs`,
        className
      )}
    >
      {children}
    </li>
  );
}

export default function InitialPopup() {
  const [open, setOpen] = useState(true);
  const [randomImage, setRandomImage] = useState<string | null>(null);

  useEffect(() => {
    const img =
      imageSelection[Math.floor(Math.random() * imageSelection.length)];

    setRandomImage(img);
  }, []);

  // Tant que l’image n’est pas chargée → rien (évite mismatch)
  if (!open || !randomImage) return null;

  return (
    <div
      className="absolute z-10 w-full h-full items-center justify-center flex bg-background/75"
      onClick={() => setOpen(false)} // Ferme quand on clique en dehors
    >
      <div
        className="aspect-video w-100 h-100 bg-background border border-border rounded-xs shadow-[0px_0px_8px_4px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture si clic dans la popup
      >
        <div className="h-50 rounded-t-xs overflow-hidden relative ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="314"
            height="220"
            viewBox="0 0 314 220"
            fill="none"
            className="w-12 h-12 absolute top-3 left-4"
          >
            <rect width="313" height="220" fill="none" />
            <path
              d="M59.2266 109.552L59.8839 97.0691L59.2266 97.0344L58.5693 97.0691L59.2266 109.552ZM109.553 109.62L122.053 109.62L122.053 97.1201H109.553V109.62ZM157.237 192.294L163.49 203.118L182.197 192.311L163.505 181.479L157.237 192.294ZM109.553 205.038L109.553 217.538L109.553 217.538L109.553 205.038ZM14 157.262L1.5 157.262L1.5 157.262L14 157.262ZM252.814 14L252.815 1.5H252.814V14ZM300.59 61.7764L313.09 61.7764V61.7764H300.59ZM252.814 109.553L252.814 122.053L252.815 122.053L252.814 109.553ZM205.038 109.553L192.538 109.632L192.617 122.053H205.038V109.553ZM205.03 108.319L217.53 108.24L217.53 108.201L217.529 108.161L205.03 108.319ZM157.237 26.8105L150.97 15.9954L132.277 26.8281L150.985 37.6345L157.237 26.8105ZM59.2266 109.552L58.5693 122.034C59.6186 122.09 60.6883 122.12 61.7764 122.12V109.62V97.1201C61.1538 97.1201 60.5233 97.1027 59.8839 97.0691L59.2266 109.552ZM61.7764 109.62V122.12H109.553V109.62V97.1201H61.7764V109.62ZM109.553 109.62L97.0527 109.62C97.0528 149.556 118.755 184.44 150.97 203.109L157.237 192.294L163.505 181.479C138.689 167.097 122.053 140.279 122.053 109.62L109.553 109.62ZM157.237 192.294L150.985 181.47C138.805 188.506 124.671 192.538 109.553 192.538L109.553 205.038L109.553 217.538C129.179 217.538 147.612 212.29 163.49 203.118L157.237 192.294ZM109.553 205.038V192.538H61.7764V205.038V217.538H109.553V205.038ZM61.7764 205.038V192.538C42.2765 192.538 26.5001 176.717 26.5 157.262L14 157.262L1.5 157.262C1.50018 190.501 28.4463 217.538 61.7764 217.538V205.038ZM14 157.262H26.5C26.5 138.399 41.3098 123.012 59.8838 122.034L59.2266 109.552L58.5693 97.0691C26.8101 98.7414 1.5 125.01 1.5 157.262H14ZM252.814 14L252.814 26.5C272.314 26.5002 288.09 42.3207 288.09 61.7764H300.59H313.09C313.09 28.5369 286.145 1.50029 252.815 1.5L252.814 14ZM300.59 61.7764L288.09 61.7763C288.09 81.2765 272.27 97.0526 252.814 97.0527L252.814 109.553L252.815 122.053C286.054 122.052 313.09 95.1061 313.09 61.7764L300.59 61.7764ZM252.814 109.553V97.0527H205.038V109.553V122.053H252.814V109.553ZM205.038 109.553L217.538 109.474L217.53 108.24L205.03 108.319L192.531 108.399L192.538 109.632L205.038 109.553ZM205.03 108.319L217.529 108.161C217.03 68.7499 195.401 34.4199 163.49 15.9866L157.237 26.8105L150.985 37.6345C175.567 51.8341 192.148 78.2295 192.531 108.478L205.03 108.319ZM157.237 26.8105L163.505 37.6257C175.707 30.5541 189.878 26.5 205.038 26.5V14V1.5C185.358 1.5 166.877 6.77659 150.97 15.9954L157.237 26.8105ZM205.038 14V26.5H252.814V14V1.5H205.038V14Z"
              fill="white"
            />
            <path
              d="M205.038 109.485H252.814C279.162 109.485 300.59 130.846 300.59 157.261C300.59 183.609 279.229 205.038 252.814 205.038H205.038C152.275 205.038 109.553 162.248 109.553 109.553H61.7763C35.4286 109.553 14 88.1914 14 61.7763C14 35.4286 35.3612 14 61.7763 14H109.553C162.315 14 205.038 56.7898 205.038 109.485Z"
              stroke="white"
              strokeWidth="25"
            />
          </svg>

          <p className="absolute text-4xl font-bold top-3.5 left-18">
            Tensornode
          </p>
          <p className="absolute text-xxs right-5 top-6">v4.0.0 BTM</p>

          <img src={randomImage} className="object-fill" />

          <p className="absolute bottom-2 left-2 text-xxs">
            © Zafir Ibriz
          </p>
        </div>{/* studio.tensornode.org */}

        <div className="py-5 px-5 flex w-full gap-15 text-xxs">
          <ul className="flex flex-col gap-0.5">
            <li className="text-muted-foreground mb-1">New File</li>

            <PLink>
              <FilePlus className="size-3" />
              Multi Layer Perceptron
            </PLink>

            <PLink>
              <FilePlus className="size-3" />
              Generator Antagonist Network
            </PLink>

            <PLink className="mt-2">
              <Folder className="size-3" />
              Open...
            </PLink>
          </ul>

          <ul className="flex flex-col gap-0.5">
            <li className="text-muted-foreground mb-1">Recent Files</li>
            <PLink>
              <File className="size-3" />
              mlp-file-for-tm.json
            </PLink>

            <PLink>
              <File className="size-3" />
              gan-file.json
            </PLink>

            <PLink>
              <File className="size-3" />
              multiheadattention-file.json
            </PLink>

            <PLink className="mt-2">
              <Heart className="size-3 stroke-hue-20 fill-hue-20" />
              Donate
            </PLink>
            <PLink>
              <Github className="size-3" />
              Github
            </PLink>
          </ul>
        </div>
      </div>
    </div>
  );
}
