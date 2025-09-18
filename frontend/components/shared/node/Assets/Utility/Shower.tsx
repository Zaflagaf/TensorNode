import { Label } from "@/frontend/components/ui/label"
import React from "react"

interface ArrayShowerProps {
  data: any[]
  title?: string
  className?: string
  showIndices?: boolean
  indent?: number
}

export function ArrayShower({
  data = [],
  title = "Output",
  className = "",
  showIndices = false,
  indent = 2,
}: ArrayShowerProps) {
  const formatValue = (value: any, currentIndent = 0): React.JSX.Element => {
    const indentStr = " ".repeat(currentIndent)
    const nextIndent = currentIndent + indent

    if (value === null) {
      return <span className="text-gray-500">null</span>
    }

    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-600">{value.toString()}</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-700">[]</span>
      }

      return (
        <div className="inline-block">
          <span className="text-gray-700">[</span>
          <div className="ml-4">
            {value.map((item, index) => (
              <div key={index} className="flex">
                <span style={{ paddingLeft: `${indent}px` }}>
                  {formatValue(item, nextIndent)}
                  {index < value.length - 1 && <span className="text-gray-700">,</span>}
                </span>
              </div>
            ))}
          </div>
          <span className="text-gray-700">]</span>
        </div>
      )
    }

    if (typeof value === "object") {
      const keys = Object.keys(value)
      if (keys.length === 0) {
        return <span className="text-gray-700">{"{}"}</span>
      }

      return (
        <div className="inline-block">
          <span className="text-gray-700">{"{"}</span>
          <div className="ml-4">
            {keys.map((key, index) => (
              <div key={key} className="flex">
                <span style={{ paddingLeft: `${indent}px` }}>
                  <span className="text-red-600">"{key}"</span>
                  <span className="text-gray-700">: </span>
                  {formatValue(value[key], nextIndent)}
                  {index < keys.length - 1 && <span className="text-gray-700">,</span>}
                </span>
              </div>
            ))}
          </div>
          <span className="text-gray-700">{"}"}</span>
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  return (
    <div className={`flex flex-col px-5 pb-4 space-y-1 ${className}`}>
      <Label htmlFor="visualization-zone" className="text-muted-foreground">
        {title}
      </Label>
      <div
        id="visualization-zone"
        className="w-full px-5 py-4 overflow-auto font-mono text-sm border rounded-sm bg-gray-50 min-h-10"
      >
        {data.length === 0 ? (
          <div className="py-2 font-sans italic text-gray-500">No data to display</div>
        ) : (
          <div className="whitespace-pre-wrap">
            <span className="text-gray-700">[</span>
            <div className="ml-2">
              {data.map((item, index) => (
                <div key={index} className="my-1">
                  {showIndices && <span className="mr-2 font-sans text-xs text-gray-400">/* [{index}] */</span>}
                  <div className="inline-block" style={{ paddingLeft: `${indent}px` }}>
                    {formatValue(item, indent)}
                    {index < data.length - 1 && <span className="text-gray-700">,</span>}
                  </div>
                </div>
              ))}
            </div>
            <span className="text-gray-700">]</span>
          </div>
        )}
      </div>
    </div>
  )
}