import { CircleHelp } from "lucide-react";
import Image from "next/image"; // Use Next.js Image component for better optimization

import { Separator } from "@/frontend/components/ui/separator";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";

export default function NodeHeader({
  label,
  logo,
  illustration,
  illSize = 120,
  info,
}: {
  label: string;
  logo: string;
  illustration?: string;
  illSize?: number;
  info?: string;
}) {
  return (
    <>
      <div
        className="node-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 10px",
          fontSize: "1.25rem",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Image src={logo} alt="Help Icon" width={30} height={30} />
          {label}
        </div>

        {true && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleHelp width={30} height={30} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {illustration && (
        <>
          <Separator className="my-4 bg-gray-300 h-[2px]" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              height: "100px",
            }}
          >
            <Image
              src={illustration}
              alt="Help Icon"
              width={illSize}
              height={illSize}
            />
            <div
              style={{
                color: "rgb(100,100,100)",
                fontWeight: 600,
              }}
            >
              8 x 32
            </div>
          </div>
          <Separator className="my-4 bg-gray-300 h-[2px]" />
        </>
      )}
    </>
  );
}
