"use client"

import React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

// Menu data structure
const menu = {
  Layers: {
    Core: ["Dense", "Dropout", "Activation", "Flatten", "Reshape", "Permute"],
    Convolutional: ["Conv1D", "Conv2D", "Conv3D", "SeparableConv2D", "DepthwiseConv2D"],
    Pooling: ["MaxPooling2D", "AveragePooling2D", "GlobalMaxPooling2D", "GlobalAveragePooling2D"],
    Recurrent: ["LSTM", "GRU", "SimpleRNN", "Bidirectional"],
    Normalization: ["BatchNormalization", "LayerNormalization"],
    Embedding: ["Embedding", "CategoryEncoding"],
  },
  Preprocessing: {
    Text: ["TextVectorization", "Tokenizer"],
    Image: ["Rescaling", "CenterCrop", "RandomFlip"],
    Normalization: ["Normalization", "Rescaling"],
  },
  "Model Architecture": {
    "Model Blocks": ["Sequential", "Functional (Inputs/Outputs)"],
    "Merge Layers": ["Concatenate", "Add", "Subtract", "Multiply", "Average"],
  },
  Training: {
    "Compile Options": ["Loss", "Optimizer", "Metrics"],
    Callbacks: ["EarlyStopping", "ModelCheckpoint", "TensorBoard"],
  },
  Utilities: ["Input Layer", "Output Layer", "Custom Lambda", "RepeatVector", "TimeDistributed"],
}

interface MLContextMenuProps {
  children: React.ReactNode
  onSelect?: (item: string, e: React.MouseEvent) => void
}

export function MLContextMenu({ children, onSelect = () => {} }: MLContextMenuProps) {
  const handleSelect = (item: string, e: React.MouseEvent) => {
    onSelect(item.toLowerCase(), e)
  }

  const renderMenuItems = (items: any, level = 0) => {
    if (Array.isArray(items)) {
      return items.map((item, index) => (
        <ContextMenuItem key={`${item}-${index}`} onClick={(e) => handleSelect(item, e)}>
          {item}
        </ContextMenuItem>
      ))
    }

    return Object.entries(items).map(([key, value], index, array) => {
      // If the value is an array, render a submenu
      if (Array.isArray(value)) {
        return (
          <ContextMenuSub key={key}>
            <ContextMenuSubTrigger>{key}</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {value.map((item, idx) => (
                <ContextMenuItem key={`${item}-${idx}`} onClick={(e) => handleSelect(item, e)}>
                  {item}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )
      }

      // If the value is an object, render a submenu with nested items
      return (
        <React.Fragment key={key}>
          <ContextMenuSub>
            <ContextMenuSubTrigger>{key}</ContextMenuSubTrigger>
            <ContextMenuSubContent>{renderMenuItems(value)}</ContextMenuSubContent>
          </ContextMenuSub>
          {index < array.length - 1 && level === 0 && <ContextMenuSeparator />}
        </React.Fragment>
      )
    })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">{renderMenuItems(menu, 0)}</ContextMenuContent>
    </ContextMenu>
  )
}
