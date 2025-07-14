import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Circle } from "lucide-react"

interface TerminalOutputProps {
  lines: string[]
  title?: string
  showHeader?: boolean
  showLineNumbers?: boolean
  maxHeight?: string
}

export function TerminalOutput({
  lines,
  title = "terminal",
  showHeader = false,
  showLineNumbers = false,
  maxHeight = "max-h-96",
}: TerminalOutputProps) {
  return (
    <Card className="mx-2 mb-2 font-mono bg-gray-900 border-gray-700">
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Circle className="w-3 h-3 text-red-500 fill-red-500" />
            <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <Circle className="w-3 h-3 text-green-500 fill-green-500" />
            <span className="ml-4 text-sm text-gray-300">{title}</span>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className={`${maxHeight} overflow-auto p-4 bg-black`}>
          <pre className="text-sm leading-relaxed text-green-400">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && <span className="w-8 mr-4 text-right text-gray-500 select-none">{index + 1}</span>}
                <span className="flex-1">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
