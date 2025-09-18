"use client";

import { useFlowContext } from "@/frontend/context/FlowContext";
import { useEffect, useState } from "react";

export default function PropertiesPanel() {
    const { activeNode, nodeInfo } = useFlowContext();
    const [nodeData, setNodeData] = useState<any>(null);

    useEffect(() => {
        const node = nodeInfo(activeNode);
        setNodeData(node || null);
    }, [activeNode, nodeInfo]);

    return (
        <div
        style={{
            backgroundColor: "#f9fafb",
            borderLeft: "1px solid #e5e7eb",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
        }}
        >
        <div
            style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#ffffff",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            fontSize: "16px",
            height: "50px",
            fontWeight: 600,
            color: "#111827",
            gap: "10px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
        >
            Properties
        </div>

        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
            {nodeData ? (
            <div
                style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
                <Section title="Node">
                <InfoRow label="ID" value={nodeData.id} />
                <InfoRow label="Type" value={nodeData.type} />
                <CustomInfoRow
                    label="Label"
                    value={nodeData?.data?.label}
                    path="label"
                />
                </Section>

                {nodeData?.data?.values && (
                <Section title="Values">
                    {Object.entries(nodeData.data.values.input).map(
                    ([key, value]) => (
                        <CustomInfoRow
                        key={key}
                        label={key}
                        value={value}
                        path={`values.${key}`}
                        />
                    )
                    )}
                </Section>
                )}
            </div>
            ) : (
            <p style={{ color: "#6b7280" }}>Aucune donnée disponible</p>
            )}
        </div>
        </div>
    );
    }

    function Section({
    title,
    children,
    }: {
    title: string;
    children: React.ReactNode;
    }) {
    return (
        <div
        style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
        >
        <h3
            style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#6b7280",
            marginBottom: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            }}
        >
            {title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {children}
        </div>
        </div>
    );
    }

    function InfoRow({ label, value }: { label: string; value: any }) {
    return (
        <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
        }}
        >
        <span
            style={{
            color: "#6b7280",
            fontSize: "14px",
            width: "75px",
            flexShrink: 0,
            }}
        >
            {label}
        </span>
        <span
            style={{
            fontSize: "14px",
            color: "#374151",
            padding: "4px 8px",
            backgroundColor: "#f3f4f6",
            borderRadius: "6px",
            flex: 1,
            }}
        >
            {value ?? <i style={{ color: "#9ca3af" }}>Non défini</i>}
        </span>
        </div>
    );
    }

    function CustomInfoRow({
    label,
    value,
    path,
    }: {
    label: string;
    value: any;
    path: string;
    }) {
    const { activeNode, updateNode } = useFlowContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        updateNode(activeNode, path, newValue);
    };

    return (
        <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
        }}
        >
        <span
            style={{
            color: "#6b7280",
            fontSize: "14px",
            width: "75px",
            flexShrink: 0,
            }}
        >
            {label}
        </span>
        <input
            type="text"
            value={value}
            onChange={handleChange}
            style={{
            fontSize: "14px",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            padding: "6px 10px",
            flex: 1,
            cursor: "url('/cursor/text-cursor.svg') 0 0, text",
            outline: "none",
            backgroundColor: "#ffffff",
            transition: "border 0.2s",
            }}
            onFocus={(e) =>
            (e.currentTarget.style.border = "1px solid rgb(179, 0, 255)")
            }
            onBlur={(e) => (e.currentTarget.style.border = "1px solid #d1d5db")}
        />
        </div>
    );
}
