import Node from "../../Node";
import React from "react";
import Handle from "@/components/handle/Handle";

import "./node1.scss";

export default function Node1({ id, position, label } : { id: string, position: { x: number, y: number }, label: string }) {

    return (
        <Node id={id} defaultPosition={position}>
            <div className="node1" id={id}>
                <div className="node1-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px"}}>
                    <div style={{fontWeight: "bold"}}>{label}</div>
                </div>
                <Handle type="source" id="h1">
                    <div style={{width: "200px", display: "flex", justifyContent: "end", alignItems: "center", padding: "15px 20px"}}>
                            Output
                    </div>
                </Handle>
                <Handle type="target" id="h2">
                    <div style={{width: "200px", display: "flex", alignItems: "center", padding: "15px 20px"}}>
                        Input
                    </div>
                </Handle>
            </div>
        </Node>
    )
}