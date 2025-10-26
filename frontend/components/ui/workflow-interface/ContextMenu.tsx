"use client"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/frontend/components/ui/shadcn/context-menu"
import { Kbd } from "@/frontend/components/ui/shadcn/kbd"

import { cn } from "@/frontend/lib/utils"
import {
  ArrowDownToLine,
  ArrowLeftFromLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Combine,
  Dot,
  Droplet,
  Layers,
  Minus,
  Search,
  Sigma,
  SquareFunction,
  X,
} from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/frontend/components/ui/shadcn/input-group"
import { Separator } from "@/frontend/components/ui/shadcn/separator"

const modelData = {
  Other: {
    icon: null,
    color: null,
    items: [
      {
        name: "Tensor",
        type: "tensor",
        icon: null,
        color: null,
        description: "Tensor",
      },
      {
        name: "Excel",
        type: "excel",
        icon: null,
        color: null,
        description: "table from excel",
      },
      {
        name: "Model",
        type: "model",
        icon: null,
        color: null,
        description: "Model",
      },
      {
        name: "Label Encoding",
        type: "labelEncoding",
        icon: null,
        color: null,
        description: "Encode or Decode labels",
      },
      {
        name: "Scaling",
        type: "scaling",
        icon: null,
        color: null,
        description: "Scale data",
      },
      {
        name: "Kaggle",
        type: "kaggle",
        icon: null,
        color: null,
        description: "Kaggle",
      },
      {
        name: "Latent Vector",
        type: "latentVector",
        icon: null,
        color: null,
        description: "Latent vector of size x",
      },
      {
        name: "Concatenate",
        type: "concatenate",
        icon: null,
        color: null,
        description: "Concatenate A and B",
      },
      {
        name: "Fill",
        type: "fill",
        icon: null,
        color: null,
        description: "Fill with x",
      },
      {
        name: "Score",
        type: "score",
        icon: null,
        color: null,
        description: "Calculate gradient",
      },
      {
        name: "Math",
        type: "math",
        icon: null,
        color: null,
        description: "Apply mathematic function",
      },
      {
        name: "Images",
        type: "images",
        icon: null,
        color: null,
        description: "Add Images to the workflow",
      },
      {
        name: "Loss Function",
        type: "lossFunction",
        icon: null,
        color: null,
        description: "Add a loss function",
      },
    ],
  },
  Input: {
    icon: ArrowRightToLine,
    color: "bg-hue-0",
    items: [
      {
        name: "Input",
        type: "input",
        icon: null,
        color: null,
        description: "Couche d'entrée",
      },
    ],
  },
  Output: {
    icon: ArrowLeftFromLine,
    color: "bg-hue-0",
    items: [
      {
        name: "Output",
        type: "output",
        icon: null,
        color: null,
        description: "Couche de sortie",
      },
    ],
  },
  Layer: {
    icon: Layers,
    color: "bg-hue-0",
    items: [
      {
        name: "Dense",
        type: "dense",
        icon: null,
        color: null,
        description: "Couche entièrement connectée (comme un graphe complet)",
      },
      {
        name: "Conv2D",
        type: "conv2d",
        icon: null,
        color: null,
        description: "Convolution 2D",
      },
      {
        name: "Conv2D Transpose",
        type: "conv2dTranspose",
        icon: null,
        color: null,
        description: "Convolution Transpose 2D",
      },
      {
        name: "Max pooling 2D",
        type: "maxPooling2d",
        icon: null,
        color: null,
        description: "Sous-échantillonnage maximum",
      },
      {
        name: "Dropout",
        type: "dropout",
        icon: Droplet,
        color: null,
        description: "Régularisation, simule des blancs",
      },
      {
        name: "Flatten",
        type: "flatten",
        icon: Minus,
        color: null,
        description: "Aplatissement",
      },
      {
        name: "Reshape",
        type: "reshape",
        icon: null,
        color: null,
        description: "Changement de forme du tenseur",
      },
      {
        name: "Batch Normalization",
        type: "batchNormalization",
        icon: null,
        color: null,
        description: "Normalisation par lot",
      },
      {
        name: "Activation",
        type: "activation",
        icon: null,
        color: null,
        description: "Applique une fonction d'activation",
      },
    ],
  },
  Math: {
    icon: SquareFunction,
    color: "bg-hue-0",
    items: [
      {
        name: "Lambda",
        icon: null,
        color: null,
        description: "Applique une fonction personnalisée",
      },
      {
        name: "Add",
        icon: Sigma,
        color: null,
        description: "Additionne plusieurs tenseurs",
      },
      {
        name: "Substract",
        icon: Minus,
        color: null,
        description: "Soustrait des tenseurs",
      },
      {
        name: "Multiply",
        icon: X,
        color: null,
        description: "Multiplie plusieurs tenseurs",
      },
      {
        name: "Average",
        icon: null,
        color: null,
        description: "Moyenne de plusieurs tenseurs",
      },
      {
        name: "Maximum",
        icon: ArrowUpToLine,
        color: null,
        description: "Renvoie le maximum élément par élément",
      },
      {
        name: "Minimum",
        icon: ArrowDownToLine,
        color: null,
        description: "Renvoie le minimum élément par élémenet",
      },
      {
        name: "Concatenate",
        icon: Combine,
        color: null,
        description: "Concatène des tenseurs",
      },
      {
        name: "Dot product",
        icon: Dot,
        color: null,
        description: "Produit scalaire entre deux tenseurs",
      },
    ],
  },
}

interface MLContextMenuProps {
  children: React.ReactNode
  onSelect?: (mousePos: { x: number; y: number }, item: any) => void
}

export default function WorkflowContextMenu({ children, onSelect = () => {} }: MLContextMenuProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const getAllItems = () => {
    const items: { category: string; name: string; raw: any }[] = []
    Object.entries(modelData).forEach(([category, value]) => {
      Object.entries(value.items).forEach(([key, subValue]) => {
        items.push({ category, name: subValue.name || key, raw: subValue })
      })
    })
    return items
  }

  const filteredItems = searchTerm
    ? getAllItems().filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearching || !isOpen) return

      if (e.key === "Escape") {
        if (searchTerm) {
          setSearchTerm("")
          setIsSearching(false)
          setSelectedIndex(0)
          e.preventDefault()
        }
        return
      }

      if (isSearching && filteredItems.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setSelectedIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1))
        }
      }

      if (!isSearching && e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        inputRef.current?.focus()
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isSearching, searchTerm, filteredItems.length])

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm])

  return (
    <ContextMenu
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setSearchTerm("")
          setIsSearching(false)
          setSelectedIndex(0)
        }
      }}
    >
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent
        className={cn("transition-all duration-200 ease-out")}
      >
        <ContextMenuItem disabled className="text-muted-foreground/50">
          Add
        </ContextMenuItem>
        <div className="relative py-1">
          <InputGroup className="dark:bg-transparent border-0">
            <InputGroupAddon>
              <Search className="w-4 h-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              ref={inputRef}
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsSearching(e.target.value.length > 0)
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                e.stopPropagation()
                if (e.key === "Enter" && filteredItems.length > 0) {
                  onSelect(mousePos, filteredItems[selectedIndex].raw)
                  setSearchTerm("")
                  setIsSearching(false)
                  setIsOpen(false)
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm border-none transition-all duration-150"
            />
            <InputGroupAddon align="inline-end">
              {searchTerm ? (
                <div className="flex items-center gap-1">
                  <Kbd className="text-xs">↵</Kbd>
                  <Kbd className="text-xs">Esc</Kbd>
                </div>
              ) : null}
            </InputGroupAddon>
          </InputGroup>
          <Separator />
        </div>

        {!isSearching ? (
          <div className="animate-in fade-in-50 duration-150">
            {Object.entries(modelData).map(([category, value]) => (
              <ContextMenuSub key={category}>
                <ContextMenuSubTrigger className="transition-colors duration-150">
                  {value.icon && <value.icon className="w-4 h-4 mr-2 text-muted-foreground" />}
                  {category}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="animate-in slide-in-from-left-1 fade-in-50 duration-200">
                  {Object.entries(value.items).map(([key, subValue]) => {
                    const ItemIcon = subValue.icon
                    return (
                      <ContextMenuItem
                        key={key}
                        onClick={() => {
                          onSelect(mousePos, subValue)
                          setIsOpen(false)
                        }}
                        className="transition-colors duration-150 cursor-pointer"
                      >
                        {ItemIcon && <ItemIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
                        <div className="flex flex-col">
                          <span>{subValue.name || key}</span>
                          {subValue.description && (
                            <span className="text-xs text-muted-foreground">{subValue.description}</span>
                          )}
                        </div>
                      </ContextMenuItem>
                    )
                  })}
                </ContextMenuSubContent>
              </ContextMenuSub>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in-50 duration-150 max-h-[300px] overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const ItemIcon = item.raw.icon
                return (
                  <ContextMenuItem
                    key={index}
                    className={cn(
                      "transition-all duration-150 cursor-pointer",
                      index === selectedIndex && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => {
                      onSelect(mousePos, item.raw)
                      setIsOpen(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {ItemIcon && <ItemIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{item.category}</span>
                      </div>
                      {item.raw.description && (
                        <span className="text-xs text-muted-foreground mt-0.5">{item.raw.description}</span>
                      )}
                    </div>
                  </ContextMenuItem>
                )
              })
            ) : (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No results found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
 /*}

/* const menuData = {
  Layers: {
    icon: Layers,
    color: "bg-blue-500",
    items: {
      Core: {
        icon: Cpu,
        color: "bg-blue-400",
        items: [
          {
            name: "Dense",
            description: "Fully connected layer",
            shortcut: "D",
          },
          {
            name: "Dropout",
            description: "Regularization layer",
            shortcut: "⌘D",
          },
          {
            name: "Activation",
            description: "Activation function",
            shortcut: "A",
          },
          { name: "Flatten", description: "Flatten input", shortcut: "F" },
          { name: "Reshape", description: "Reshape tensor", shortcut: "R" },
          { name: "Permute", description: "Permute dimensions", shortcut: "P" },
        ],
      },
      Convolutional: {
        icon: Grid3X3,
        color: "bg-green-500",
        items: [
          { name: "Conv1D", description: "1D convolution", shortcut: "C1" },
          { name: "Conv2D", description: "2D convolution", shortcut: "C2" },
          { name: "Conv3D", description: "3D convolution", shortcut: "C3" },
          {
            name: "SeparableConv2D",
            description: "Separable convolution",
            shortcut: "SC",
          },
          {
            name: "DepthwiseConv2D",
            description: "Depthwise convolution",
            shortcut: "DC",
          },
        ],
      },
      Pooling: {
        icon: Target,
        color: "bg-yellow-500",
        items: [
          {
            name: "MaxPooling2D",
            description: "Max pooling operation",
            shortcut: "MP",
          },
          {
            name: "AveragePooling2D",
            description: "Average pooling",
            shortcut: "AP",
          },
          {
            name: "GlobalMaxPooling2D",
            description: "Global max pooling",
            shortcut: "GMP",
          },
          {
            name: "GlobalAveragePooling2D",
            description: "Global average pooling",
            shortcut: "GAP",
          },
        ],
      },
      Recurrent: {
        icon: RotateCcw,
        color: "bg-purple-500",
        items: [
          {
            name: "LSTM",
            description: "Long Short-Term Memory",
            shortcut: "L",
          },
          { name: "GRU", description: "Gated Recurrent Unit", shortcut: "G" },
          {
            name: "SimpleRNN",
            description: "Simple RNN layer",
            shortcut: "RNN",
          },
          {
            name: "Bidirectional",
            description: "Bidirectional wrapper",
            shortcut: "BI",
          },
        ],
      },
      Normalization: {
        icon: Gauge,
        color: "bg-indigo-500",
        items: [
          {
            name: "BatchNormalization",
            description: "Batch normalization",
            shortcut: "BN",
          },
          {
            name: "LayerNormalization",
            description: "Layer normalization",
            shortcut: "LN",
          },
        ],
      },
      Embedding: {
        icon: Database,
        color: "bg-pink-500",
        items: [
          { name: "Embedding", description: "Embedding layer", shortcut: "E" },
          {
            name: "CategoryEncoding",
            description: "Category encoding",
            shortcut: "CE",
          },
        ],
      },
    },
  },
  Preprocessing: {
    icon: Settings,
    color: "bg-orange-500",
    items: {
      Text: {
        icon: Type,
        color: "bg-orange-400",
        items: [
          {
            name: "TextVectorization",
            description: "Text to vectors",
            shortcut: "TV",
          },
          {
            name: "Tokenizer",
            description: "Text tokenization",
            shortcut: "TK",
          },
        ],
      },
      Image: {
        icon: ImageIcon,
        color: "bg-orange-400",
        items: [
          {
            name: "Rescaling",
            description: "Rescale pixel values",
            shortcut: "RS",
          },
          {
            name: "CenterCrop",
            description: "Center crop image",
            shortcut: "CC",
          },
          {
            name: "RandomFlip",
            description: "Random flip augmentation",
            shortcut: "RF",
          },
        ],
      },
      Normalization: {
        icon: Gauge,
        color: "bg-orange-400",
        items: [
          {
            name: "Normalization",
            description: "Data normalization",
            shortcut: "N",
          },
          { name: "Rescaling", description: "Value rescaling", shortcut: "RS" },
        ],
      },
    },
  },
  "Model Architecture": {
    icon: Layers,
    color: "bg-teal-500",
    items: {
      "Model Blocks": {
        icon: Layers,
        color: "bg-teal-400",
        items: [
          {
            name: "Sequential",
            description: "Sequential model",
            shortcut: "SEQ",
          },
          {
            name: "Functional",
            description: "Functional API",
            shortcut: "FUNC",
          },
        ],
      },
      "Merge Layers": {
        icon: Shuffle,
        color: "bg-teal-400",
        items: [
          {
            name: "Concatenate",
            description: "Concatenate tensors",
            shortcut: "CAT",
          },
          { name: "Add", description: "Element-wise addition", shortcut: "+" },
          {
            name: "Subtract",
            description: "Element-wise subtraction",
            shortcut: "-",
          },
          {
            name: "Multiply",
            description: "Element-wise multiplication",
            shortcut: "×",
          },
          {
            name: "Average",
            description: "Element-wise average",
            shortcut: "AVG",
          },
        ],
      },
    },
  },
  Training: {
    icon: Zap,
    color: "bg-red-500",
    items: {
      "Compile Options": {
        icon: Settings,
        color: "bg-red-400",
        items: [
          { name: "Loss", description: "Loss function", shortcut: "LOSS" },
          {
            name: "Optimizer",
            description: "Optimization algorithm",
            shortcut: "OPT",
          },
          {
            name: "Metrics",
            description: "Evaluation metrics",
            shortcut: "MET",
          },
        ],
      },
      Callbacks: {
        icon: FileText,
        color: "bg-red-400",
        items: [
          {
            name: "EarlyStopping",
            description: "Early stopping callback",
            shortcut: "ES",
          },
          {
            name: "ModelCheckpoint",
            description: "Model checkpointing",
            shortcut: "MC",
          },
          {
            name: "TensorBoard",
            description: "TensorBoard logging",
            shortcut: "TB",
          },
        ],
      },
    },
  },
  Utilities: {
    icon: Settings,
    color: "bg-gray-500",
    items: [
      { name: "Input Layer", description: "Model input", shortcut: "IN" },
      { name: "Output Layer", description: "Model output", shortcut: "OUT" },
      { name: "Custom Lambda", description: "Custom function", shortcut: "λ" },
      { name: "RepeatVector", description: "Repeat vector", shortcut: "REP" },
      {
        name: "TimeDistributed",
        description: "Time distributed wrapper",
        shortcut: "TD",
      },
    ],
  },
};

function MLContextMenu({ children, onSelect = () => {} }: MLContextMenuProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching, searchTerm]);

  const handleSelect = (item: any, category: string, e: React.MouseEvent) => {
    const itemName = typeof item === "string" ? item : item.name;
    onSelect(itemName.toLowerCase(), category, e);

    // Don't clear search immediately to prevent focus issues
    setTimeout(() => {
      setSearchTerm("");
      setIsSearching(false);
    }, 100);
  };

  // Flatten all items for search
  const allItems = useMemo(() => {
    const items: Array<{ item: any; category: string; subcategory?: string }> =
      [];

    Object.entries(menuData).forEach(([categoryKey, categoryValue]) => {
      if (Array.isArray(categoryValue.items)) {
        categoryValue.items.forEach((item) => {
          items.push({ item, category: categoryKey });
        });
      } else {
        Object.entries(categoryValue.items).forEach(([subKey, subValue]) => {
          if (Array.isArray(subValue.items)) {
            subValue.items.forEach((item) => {
              items.push({ item, category: categoryKey, subcategory: subKey });
            });
          } else if (Array.isArray(subValue)) {
            subValue.forEach((item) => {
              items.push({ item, category: categoryKey, subcategory: subKey });
            });
          }
        });
      }
    });

    return items;
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];

    return allItems
      .filter(({ item }) => {
        const itemName = typeof item === "string" ? item : item.name;
        const itemDesc = typeof item === "object" ? item.description : "";
        return (
          itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          itemDesc.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .slice(0, 8); // Limit results
  }, [searchTerm, allItems]);

  const getItemColor = (
    item: any,
    category: string,
    subcategory?: string
  ): string => {
    const itemName = typeof item === "string" ? item : item.name;

    // Specific color mapping based on layer types
    const colorMap: Record<string, string> = {
      // Core layers
      Dense: "bg-blue-500",
      Dropout: "bg-blue-400",
      Activation: "bg-blue-600",
      Flatten: "bg-blue-300",
      Reshape: "bg-blue-300",
      Permute: "bg-blue-300",

      // Convolutional layers
      Conv1D: "bg-green-500",
      Conv2D: "bg-green-600",
      Conv3D: "bg-green-700",
      SeparableConv2D: "bg-green-400",
      DepthwiseConv2D: "bg-green-400",

      // Pooling layers
      MaxPooling2D: "bg-yellow-500",
      AveragePooling2D: "bg-yellow-400",
      GlobalMaxPooling2D: "bg-yellow-600",
      GlobalAveragePooling2D: "bg-yellow-600",

      // Recurrent layers
      LSTM: "bg-purple-500",
      GRU: "bg-purple-600",
      SimpleRNN: "bg-purple-400",
      Bidirectional: "bg-purple-700",

      // Normalization
      BatchNormalization: "bg-indigo-500",
      LayerNormalization: "bg-indigo-600",

      // Embedding
      Embedding: "bg-pink-500",
      CategoryEncoding: "bg-pink-400",

      // Text processing
      TextVectorization: "bg-orange-500",
      Tokenizer: "bg-orange-400",

      // Image processing
      Rescaling: "bg-orange-300",
      CenterCrop: "bg-orange-400",
      RandomFlip: "bg-orange-500",

      // Model architecture
      Sequential: "bg-teal-500",
      Functional: "bg-teal-600",
      Concatenate: "bg-teal-400",
      Add: "bg-teal-300",
      Subtract: "bg-teal-300",
      Multiply: "bg-teal-300",
      Average: "bg-teal-400",

      // Training
      Loss: "bg-red-500",
      Optimizer: "bg-red-600",
      Metrics: "bg-red-400",
      EarlyStopping: "bg-red-300",
      ModelCheckpoint: "bg-red-400",
      TensorBoard: "bg-red-500",

      // Utilities
      "Input Layer": "bg-gray-500",
      "Output Layer": "bg-gray-600",
      "Custom Lambda": "bg-gray-400",
      RepeatVector: "bg-gray-500",
      TimeDistributed: "bg-gray-600",
    };

    return colorMap[itemName] || "bg-gray-400";
  };

  const renderItem = (item: any, category: string, subcategory?: string) => {
    const itemName = typeof item === "string" ? item : item.name;
    const itemDesc = typeof item === "object" ? item.description : "";
    const shortcut = typeof item === "object" ? item.shortcut : "";
    const itemColor = getItemColor(item, category, subcategory);

    return (
      <ContextMenuItem
        key={`${itemName}-${category}-${subcategory}`}
        onClick={(e) => handleSelect(item, category, e)}
        className="flex items-center justify-between min-h-[40px] px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors group relative"
      >
        <div className="flex flex-col flex-1 min-w-0 pr-3">
          <span className="text-sm font-medium truncate">{itemName}</span>
          {itemDesc && (
            <span className="text-xs truncate text-muted-foreground">
              {itemDesc}
            </span>
          )}
        </div>
        <div className="flex items-center flex-shrink-0 gap-2">
          {shortcut && (
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 h-5 font-mono"
            >
              {shortcut}
            </Badge>
          )}
        </div>
        {/* Color indicator - positioned absolutely for consistency */ /*
        <div
          className={`absolute right-0 top-0 bottom-0 w-1 ${itemColor} opacity-60 group-hover:opacity-100 transition-opacity rounded-r-sm`}
        />
      </ContextMenuItem>
    );
  };

  const renderMenuItems = (items: any, category: string, level = 0) => {
    if (Array.isArray(items)) {
      return items.map((item) => renderItem(item, category));
    }

    return Object.entries(items).map(([key, value], index, array) => {
      const IconComponent = (value as any).icon || Settings;
      const color = (value as any).color || "bg-gray-400";

      if (Array.isArray((value as any).items)) {
        return (
          <ContextMenuSub key={key}>
            <ContextMenuSubTrigger className="flex items-center gap-3 px-3 py-2 min-h-[40px] hover:bg-accent/50 transition-colors relative">
              <IconComponent className="flex-shrink-0 w-4 h-4" />
              <span className="flex-1 font-medium">{key}</span>
              <div
                className={`absolute right-0 top-0 bottom-0 w-1 ${color} opacity-60 rounded-r-sm`}
              />
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-72">
              {(value as any).items.map((item: any) =>
                renderItem(item, category, key)
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
        );
      }

      return (
        <React.Fragment key={key}>
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-3 px-3 py-2 min-h-[40px] hover:bg-accent/50 transition-colors relative">
              <IconComponent className="flex-shrink-0 w-4 h-4" />
              <span className="flex-1 font-medium">{key}</span>
              <div
                className={`absolute right-0 top-0 bottom-0 w-1 ${color} opacity-60 rounded-r-sm`}
              />
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-72">
              {renderMenuItems((value as any).items, category, level + 1)}
            </ContextMenuSubContent>
          </ContextMenuSub>
          {index < array.length - 1 && level === 0 && <ContextMenuSeparator />}
        </React.Fragment>
      );
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="p-2 w-80">
        {/* Search Input */ /*}
        <div className="relative mb-2">
          <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search layers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearching(e.target.value.length > 0);
            }}
            onKeyDown={(e) => {
              // Prevent event propagation to stop menu from closing
              e.stopPropagation();
            }}
            onClick={(e) => {
              // Prevent event propagation to stop menu from closing
              e.stopPropagation();
            }}
            className="pl-10 text-sm h-9"
          />
          {searchTerm && (
            <Keyboard className="absolute w-4 h-4 transform -translate-y-1/2 right-3 top-1/2 text-muted-foreground" />
          )}
        </div>

        {/* Search Results */ /*}
        {isSearching && searchTerm && (
          <>
            {filteredItems.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
                  Search Results ({filteredItems.length})
                </div>
                {filteredItems.map(({ item, category, subcategory }) =>
                  renderItem(item, category, subcategory)
                )}
                <ContextMenuSeparator />
              </>
            ) : (
              <div className="px-3 py-6 text-sm text-center text-muted-foreground">
                No layers found for "{searchTerm}"
              </div>
            )}
          </>
        )}

        {/* Main Menu */ /*}
        {!isSearching && (
          <>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
              <Layers className="w-3 h-3" />
              TensorNodes
            </div>
            {Object.entries(menuData).map(([key, value], index, array) => {
              const IconComponent = value.icon;
              const color = value.color;

              return (
                <React.Fragment key={key}>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger className="flex items-center gap-3 px-3 py-2 min-h-[40px] hover:bg-accent/50 transition-colors relative">
                      <IconComponent className="flex-shrink-0 w-4 h-4" />
                      <span className="flex-1 font-medium">{key}</span>
                      <div
                        className={`absolute right-0 top-0 bottom-0 w-1 ${color} opacity-60 rounded-r-sm`}
                      />
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-72">
                      {renderMenuItems(value.items, key)}
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  {index < array.length - 1 && <ContextMenuSeparator />}
                </React.Fragment>
              );
            })}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
*/
