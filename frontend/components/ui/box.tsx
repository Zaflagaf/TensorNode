import React, { ReactNode } from "react";

export default function Box({ children }: { children: ReactNode }) {
    return (
        <div style={{ width: "350px", display: "flex", alignItems: "center", padding: "15px 20px" }}>
            {children}
        </div>
    );
}