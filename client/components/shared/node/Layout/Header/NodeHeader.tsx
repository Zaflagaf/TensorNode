import { useFlowContext } from "@/context/FlowContext";
import circleHelp from "@/public/circle-help.svg";
import Image from "next/image"; // Use Next.js Image component for better optimization

import { Separator } from "@/components/ui/separator";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NodeHeader({
  label,
  id,
  logo,
  illustration,
  illSize = 120,
  info,
}: {
  label: string;
  id: string;
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
                <Image
                  src={circleHelp}
                  alt="Help Icon"
                  width={30}
                  height={30}
                />
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
