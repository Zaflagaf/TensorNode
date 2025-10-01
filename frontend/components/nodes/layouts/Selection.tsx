"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/frontend/lib/utils"

interface WorkflowSelectionProps {
  selection: string
  setSelection: React.Dispatch<React.SetStateAction<string>>
  choices: string[]
  label: string
}

export default function WorkflowSelection({ selection, setSelection, choices, label }: WorkflowSelectionProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ferme le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 150) // Small delay to allow moving from button to menu
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full" ref={containerRef} onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter}>
      <div
        className="bg-node-input rounded-[4px] py-[4px] px-[8px] flex justify-between items-center gap-[5px] text-node-text hover:text-node-text-hover text-xs cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <p>{selection || label}</p>
        <ChevronDown className="w-4 h-4 stroke-1" />
      </div>

      {open && (
        <div className="absolute mt-1 py-[4px] w-full bg-node-select rounded-[4px] shadow-lg z-10 border border-node-select-outline flex flex-col gap-[2px]">
          {choices.map((choice) => (
            <div
              key={choice}
              className={cn("px-[4px] mx-[4px] py-[2px] text-xs text-node-text hover:bg-node-select-hover/60 rounded-xs cursor-pointer", choice===selection? "from-blue-500 to-blue-600 bg-gradient-to-br hover:bg-gradient-to-br" : "")}
              onClick={() => {
                setSelection(choice)
                setOpen(false)
              }}
            >
              {choice}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
