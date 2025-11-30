import { ScrollArea } from "@/frontend/components/ui/shadcn/scroll-area";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/shadcn/table";

const WorkflowTable = ({ data }: { data: any[] }) => {
  const getTableHeaders = (): string[] => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  return (
    <div className="undraggable">
      <div className="mt-2 overflow-hidden border border-node-vz-outline shadow-sm rounded-[4px] undraggable">
        <ScrollArea className="flex min-w-52 undraggable">
          <Table className="min-w-full bg-node-vz">
            <TableHeader className=" bg-node-vz-outline">
              <TableRow className="border-b border-node-vz-outline">
                {getTableHeaders().map((header) => (
                  <TableHead
                    key={header}
                    className="text-node-text text-left text-sm sticky top-0 bg-node-vz-line px-4 min-w-[120px] align-top"
                  >
                    <div className="flex flex-col gap-2 py-2">
                      <span className="font-medium">{header}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={index}
                  className="transition-colors text-node-text hover:bg-node-vz-line border-node-vz-line"
                >
                  {getTableHeaders().map((header) => (
                    <TableCell key={header}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default WorkflowTable;
