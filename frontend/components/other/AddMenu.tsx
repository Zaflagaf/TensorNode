"use client"
import { useFlowContext } from "@/frontend/context/FlowContext"
import { useEffect, useRef, useState } from "react"
import Accordeon from "./Accordeon"

export default function AddMenu() {
    const [position, setPosition] = useState<{x: number, y: number} | null>(null)
    const { canvasRef, editorRef } = useFlowContext()
    const menuRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = (e: MouseEvent) => {

        if (e.button === 2) {
            e.preventDefault()

            if (!editorRef.current) return
            const editorBound = editorRef.current.getBoundingClientRect()

            setPosition({x: e.clientX - editorBound.x, y: e.clientY - editorBound.y})
        } else {
            // Ferme le menu si on clique ailleurs (optionnel mais pratique)
            setPosition(null)
        }
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault()

    useEffect(() => {
        canvasRef.current = document.getElementById("canvas")

        canvasRef.current?.addEventListener("mousedown", handleMouseDown)
        document.addEventListener("contextmenu", handleContextMenu)

        return () => {
            canvasRef.current?.removeEventListener("mousedown", handleMouseDown)
            document.removeEventListener("contextmenu", handleContextMenu)
        }
    }, [canvasRef])

    useEffect(() => {
        const ref = menuRef.current
        if (!ref) return

        const handleMouseLeave = () => {
            setTimeout(() => {
                // sécurité : on vérifie que la souris n'est pas revenue vite fait
                if (!ref.matches(":hover")) {
                    setPosition(null)
                }
            }, 100)
        }

        ref.addEventListener("mouseleave", handleMouseLeave)
        return () => {
            ref.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [position]) // on met à jour quand le menu s'affiche

    return (
        position && (
            <div
                ref={menuRef}
                style={{
                    position: "absolute",
                    top: position.y,
                    left: position.x,
                    zIndex: 10,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    padding: "4px",
                }}
            >
                <Accordeon setPosition={setPosition}
menu={{
    "Layers": {
      "Core": [
        "Dense",
        "Dropout",
        "Activation",
        "Flatten",
        "Reshape",
        "Permute"
      ],
      "Convolutional": [
        "Conv1D",
        "Conv2D",
        "Conv3D",
        "SeparableConv2D",
        "DepthwiseConv2D"
      ],
      "Pooling": [
        "MaxPooling2D",
        "AveragePooling2D",
        "GlobalMaxPooling2D",
        "GlobalAveragePooling2D"
      ],
      "Recurrent": [
        "LSTM",
        "GRU",
        "SimpleRNN",
        "Bidirectional"
      ],
      "Normalization": [
        "BatchNormalization",
        "LayerNormalization"
      ],
      "Embedding": [
        "Embedding",
        "CategoryEncoding"
      ]
    },
  
    "Preprocessing": {
      "Text": [
        "TextVectorization",
        "Tokenizer"
      ],
      "Image": [
        "Rescaling",
        "CenterCrop",
        "RandomFlip"
      ],
      "Normalization": [
        "Normalization",
        "Rescaling"
      ]
    },
  
    "Model Architecture": {
      "Model Blocks": [
        "Sequential",
        "Functional (Inputs/Outputs)"
      ],
      "Merge Layers": [
        "Concatenate",
        "Add",
        "Subtract",
        "Multiply",
        "Average"
      ]
    },
  
    "Training": {
      "Compile Options": [
        "Loss",
        "Optimizer",
        "Metrics"
      ],
      "Callbacks": [
        "EarlyStopping",
        "ModelCheckpoint",
        "TensorBoard"
      ]
    },
  
    "Utilities": [
      "Input Layer",
      "Output Layer",
      "Custom Lambda",
      "RepeatVector",
      "TimeDistributed"
    ]
  }}
                />
            </div>
        )
    )
}