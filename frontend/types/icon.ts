import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

export type IconKeys = {
  [K in keyof typeof Icons]: (typeof Icons)[K] extends React.ComponentType<LucideProps>
    ? K
    : never;
}[keyof typeof Icons];
