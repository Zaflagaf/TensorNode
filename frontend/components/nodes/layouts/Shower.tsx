import type React from "react"
import WorkflowSubGrid from "./sublayouts/Grid"

interface ArrayShowerProps {
  data: any[]
  className?: string
  showIndices?: boolean
  indent?: number
}

export function WorkflowDataShower({ data = [], className = "", showIndices = false, indent = 2 }: ArrayShowerProps) {
  const formatValue = (value: any, currentIndent = 0): React.JSX.Element => {
    const indentStr = " ".repeat(currentIndent)
    const nextIndent = currentIndent + indent

    if (value === null) {
      return <span className="text-node-text">null</span>
    }

    if (typeof value === "string") {
      return <span className="text-node-text-hover">"{value}"</span>
    }

    if (typeof value === "number") {
      return <span className="text-node-text-hover">{value}</span>
    }

    if (typeof value === "boolean") {
      return <span className="text-node-text-hover">{value.toString()}</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-node-text">[]</span>
      }

      return (
        <div className="inline-block">
          <span className="text-node-text">[</span>
          <div className="ml-4">
            {value.map((item, index) => (
              <div key={index} className="flex">
                <span style={{ paddingLeft: `${indent}px` }}>
                  {formatValue(item, nextIndent)}
                  {index < value.length - 1 && <span className="text-node-text">,</span>}
                </span>
              </div>
            ))}
          </div>
          <span className="text-node-text">]</span>
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
          <span className="text-node-text">{"{"}</span>
          <div className="ml-4">
            {keys.map((key, index) => (
              <div key={key} className="flex">
                <span style={{ paddingLeft: `${indent}px` }}>
                  <span className="text-node-text">"{key}"</span>
                  <span className="text-node-text">: </span>
                  {formatValue(value[key], nextIndent)}
                  {index < keys.length - 1 && <span className="text-node-text">,</span>}
                </span>
              </div>
            ))}
          </div>
          <span className="text-node-text">{"}"}</span>
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  return (
    <div
      className={`flex flex-col mt-1 ${className} transform-freeze-all rounded-lg bg-background/50 backdrop-blur-sm`}
    >
      <WorkflowSubGrid>
        <div className="w-full px-5 py-4 font-mono text-sm bg-transparent max-h-[400px] overflow-y-auto overflow-x-auto scrollbar-thin">
          {data.length === 0 ? (
            <div className="py-2 font-sans italic text-node-text">No data to display</div>
          ) : (
            <div className="whitespace-pre-wrap">
              <span className="text-node-text">[</span>
              <div className="ml-2">
                {data.map((item, index) => (
                  <div key={index} className="my-1">
                    {showIndices && (
                      <span className="mr-2 font-sans text-xs text-node-text/70">/* [{index}] */</span>
                    )}
                    <div className="inline-block" style={{ paddingLeft: `${indent}px` }}>
                      {formatValue(item, indent)}
                      {index < data.length - 1 && <span className="text-node-text">,</span>}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-node-text">]</span>
            </div>
          )}
        </div>
      </WorkflowSubGrid>
    </div>
  )
}

export default WorkflowDataShower
