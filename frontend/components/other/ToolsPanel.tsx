import React from "react";
import { BiPlus } from "react-icons/bi";
import { BiMinus } from "react-icons/bi";
import { BiRevision } from "react-icons/bi";

export default function ToolsPanel() {
    const Box: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
        <div
            style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "5px 5px",
            backgroundColor: "rgb(255,255,255)",
            border: "2px solid rgb(100,100,100)",
            borderRadius: "5px",
            cursor: "pointer",
            }}
        >
            {children}
        </div>
        );
    };

    return (
        <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            backgroundColor: "rgb(245,240,240)",
            width: "100%",
            height: "100%",
        }}
        >
        <div
            style={{
            display: "flex",
            outline: "1px solid #ccc",
            height: "50px",
            width: "100%",
            alignItems: "center",
            fontWeight: "bold",
            padding: "0 20px",
            }}
        >
            Tools
        </div>
        <div style={{ display: "flex", width: "100%", padding: "0px 20px" }}>
            Inhalt
        </div>
        </div>
    );
}
