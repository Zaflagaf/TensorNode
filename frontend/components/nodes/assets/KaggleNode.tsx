import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import { Node } from "@/frontend/types";
import { fetchKaggle } from "@/frontend/services/kaggle";
import {
  Calendar,
  Download,
  ExternalLink,
  Eye,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";

type MetadataType = {
  title: string;
  subtitle: string;
  creator: string;
  thumbnail: string;
  currentVersionNumber: number;
  downloadCount: number;
  viewCount: number;
  voteCount: number;
  lastUpdated: string;

  isPrivate: boolean;
  url: string;
};

export default function KaggleNodeComponent({ node }: { node: Node }) {
  const [meta, setMeta] = React.useState<MetadataType>();

  React.useEffect(() => {
    async function loadMetadata() {
      const metadata = await fetchKaggle<MetadataType>(
        "joosthazelzet/lego-brick-images",
        "GET"
      );
      setMeta(metadata);
    }

    loadMetadata();
  }, []);

  return (
    <WorkflowNode node={node} className="w-[350px]">
      <WorkflowHeader label={node.content.name} className="bg-hue-250" />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="out-features" type="source">
          <WorkflowDefault label="Features" />
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="out-labels" type="source">
          <WorkflowDefault label="Labels" />
        </WorkflowHandle>
        {meta && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-foreground font-bold text-xl">{meta.title}</p>{" "}
              <h4 className="text-muted-foreground text-xs">{meta.subtitle}</h4>{" "}
            </div>
            <div className="w-full h-fit flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-3.5" />{" "}
                <span className="text-foreground">{meta.creator}</span>
              </div>
              <Link
                href="https://www.kaggle.com/datasets/joosthazelzet/lego-brick-images"
                target="_blank"
              >
                <div className="rounded-sm border-border border w-full overflow-hidden h-auto relative group bg-background cursor-pointer">
                  <div className="absolute hidden group-hover:flex items-center top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 transition-all gap-2 font-semibold ">
                    Open In Kaggle <ExternalLink />
                  </div>
                  <img
                    className="w-full object-cover group-hover:opacity-10 transition-opacity"
                    src={meta.thumbnail}
                    alt="dataset vignette"
                  />

                  <div className="w-full h-fit bg-background/95  border-t-border absolute bottom-0 left-0 grid grid-cols-2 grid-rows-2 p-2 transition-transform group-hover:[&:not(:hover)]:translate-y-full">
                    <div className="flex items-center gap-2">
                      <div className="bg-foreground/5 p-1 rounded-sm">
                        <Download />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">
                          Downloads
                        </span>
                        <span className="font-semibold text-sm">
                          {String(meta.downloadCount)?.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            " "
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-foreground/5 p-1 rounded-sm">
                        <Eye />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">
                          Views
                        </span>
                        <span className="font-semibold text-sm">
                          {String(meta.viewCount)?.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            " "
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-foreground/5 p-1 rounded-sm">
                        <ThumbsUp />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">
                          Votes
                        </span>
                        <span className="font-semibold text-sm">
                          {String(meta.voteCount)?.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            " "
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-foreground/5 p-1 rounded-sm">
                        <Calendar />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">
                          Updated
                        </span>
                        <span className="font-semibold text-sm">
                          {meta.lastUpdated.split("T")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            {/* {meta.vignette} */}
          </div>
        )}
      </WorkflowBody>
      <WorkflowFooter></WorkflowFooter>
    </WorkflowNode>
  );
}
