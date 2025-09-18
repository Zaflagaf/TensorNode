import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useFlowContext } from "@/frontend/context/FlowContext";
import { useZoom } from "@/frontend/context/ZoomContext";

type Menu = { [key: string]: any };

type AccordeonProps = {
    menu: Menu;
    setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
};

export default function Accordeon({ menu, setPosition }: AccordeonProps) {
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
    const { addNode, canvasRef } = useFlowContext();
    const { projectPosition } = useZoom()

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleItemClick = (e: React.MouseEvent, item: any) => {
        if (!canvasRef.current) return

        const position = projectPosition({ x: e.clientX, y: e.clientY});
        if (!position) return
        addNode(item, position);
        setPosition(null);
    };

    return (
        <div
            style={{
                fontFamily: "sans-serif",
                backgroundColor: "#f7f7f7",
                color: "#222",
                padding: "4px",
                borderRadius: "6px",
                fontSize: "12px",
                lineHeight: "1.4",
                maxWidth: "350px",
                minWidth: "200px",
                border: "1px solid #ddd",
            }}
        >
            {Object.keys(menu).map((key) => {
                const isOpen = openSections[key];
                const value = menu[key];

                return (
                    <div key={key} style={{ marginBottom: "4px" }}>
                        <div
                            onClick={() => toggleSection(key)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                backgroundColor: isOpen ? "#eaeaea" : "#fff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontWeight: 500,
                                userSelect: "none",
                                boxShadow: isOpen ? "inset 0 0 2px rgba(0, 0, 0, 0.1)" : "none",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <span
                                style={{
                                    marginRight: "6px",
                                    transition: "transform 0.2s",
                                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                                    display: "flex",
                                    alignItems: "center",
                                    color: "#555",
                                }}
                            >
                                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </span>
                            {key}
                        </div>

                        {isOpen && (
                            <div
                                style={{
                                    paddingLeft: "12px",
                                    marginTop: "2px",
                                    marginLeft: "4px",
                                    borderLeft: "1px solid #999",
                                }}
                            >
                                {Array.isArray(value) ? (
                                    value.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            onClick={(e) => handleItemClick(e, item)}
                                            style={{
                                                padding: "2px 6px",
                                                margin: "2px 0",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                backgroundColor: "#f0f0f0",
                                                transition: "background 0.2s",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor = "#e2e2e2")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor = "#f0f0f0")
                                            }
                                        >
                                            <Plus size={10} />
                                            {item}
                                        </div>
                                    ))
                                ) : typeof value === "object" ? (
                                    <Accordeon menu={value} setPosition={setPosition} />
                                ) : (
                                    <div
                                        onClick={(e) => handleItemClick(e, value)}
                                        style={{
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            backgroundColor: "#f0f0f0",
                                            margin: "2px 0",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor = "#e2e2e2")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor = "#f0f0f0")
                                        }
                                    >
                                        <Plus size={10} />
                                        {value}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
