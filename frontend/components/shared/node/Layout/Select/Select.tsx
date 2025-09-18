import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import Handle from "@/frontend/organism/Handle";

export function NodeSelect({
  id,
  label,
  choice,
  placeholder,
}: {
  id: string;
  label: string;
  choice: string[];
  placeholder: string;
}) {
  const [value, setValue] = React.useState<string>("Nothing");

  return (
    <Handle type="target" id={id} dataId="">
      <div className="flex items-center justify-between w-full h-full">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="flex justify-end w-full">
          <Select onValueChange={(val) => setValue(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {choice.map((obj: string, key) => {
                  return (
                    <SelectItem value={obj.toLowerCase()} key={key}>
                      {obj}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Handle>
  );
}
