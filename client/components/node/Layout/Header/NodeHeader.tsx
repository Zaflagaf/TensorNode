import { useFlowContext } from "@/context/FlowContext";
import { useEffect, useState } from "react";
import Image from "next/image"; // Use Next.js Image component for better optimization
import circleHelp from "@/public/circle-help.svg";

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
}: {
  label: string;
  id: string;
  logo: string;
  illustration?: string;
}) {
  const { nodeInfo } = useFlowContext();
  const [info, setInfo] = useState<string | undefined>();

  useEffect(() => {
    if (nodeInfo) {
      const inf = nodeInfo(id);
      setInfo(inf?.type);
    }
  }, [nodeInfo, id]);

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
          minWidth: "350px",
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
          {label || info}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src={circleHelp} alt="Help Icon" width={30} height={30} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, laudantium rerum libero magnam alias, temporibus debitis reprehenderit quod suscipit, quos labore consequatur voluptate. Quam similique consectetur dolores quo aperiam illo.
                Eveniet dolorem laborum tenetur porro assumenda neque, laboriosam dicta minus inventore explicabo quae minima, consectetur voluptatum suscipit nobis autem eius rerum vel similique, repellendus pariatur officia excepturi quibusdam? Ea, cupiditate.
                Quas, ipsam illum! Cumque neque voluptatem maiores voluptatibus dolorum doloribus tenetur dolor? Magni odit hic qui, obcaecati iste fugiat dolores voluptatibus praesentium placeat. Vero dolore exercitationem, quaerat in dolor recusandae.
                Esse maxime similique quasi libero illo consequatur sunt mollitia enim officia sint! Dicta ullam ab sunt mollitia deleniti odio, ad voluptatem! Qui dignissimos incidunt repellat dolorem architecto veniam molestiae tenetur!
                Molestiae eos deserunt magni iure ut impedit soluta doloremque, nisi earum iusto voluptatum ex. Omnis quo praesentium, nihil fugit alias doloribus nemo odio totam optio tempora officiis sit vitae sed.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
              width={120}
              height={120}
            />
            <div style={{ color: "rgb(100,100,100)", fontWeight: 600 }}>
              8 x 32
            </div>
          </div>
          <Separator className="my-4 bg-gray-300 h-[2px]" />
        </>
      )}
    </>
  );
}
