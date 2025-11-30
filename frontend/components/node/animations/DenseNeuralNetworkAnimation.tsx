"use client";

// (import) bilbiotheques externes
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

export default function DenseNeuralNetworkAnimation() {
  const svgRef = useRef<SVGSVGElement | null>(null);
    const [structure, setStructure] = useState<number[]>([2,3,1])
    

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    for (let x = 0; x < structure.length ;)

    for (let y = 0; y < 2; y++) {
      svg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 50 + y * 100)
        .attr("r", 25)
        .attr("stroke", "rgb(168,213,255)")
        .attr("stroke-width", 5)
        .attr("fill", "rgba(168,213,255,0.5)");
    }
    for (let y = 0; y < 3; y++) {
      svg
        .append("circle")
        .attr("cx", 100)
        .attr("cy", y * 100)
        .attr("r", 25)
        .attr("stroke", "rgb(168,213,255)")
        .attr("stroke-width", 5)
        .attr("fill", "rgba(168,213,255,0.5)");
    }
    for (let y = 0; y < 1; y++) {
      svg
        .append("circle")
        .attr("cx", 200)
        .attr("cy", 100 + y * 100)
        .attr("r", 25)
        .attr("stroke", "rgb(168,213,255)")
        .attr("stroke-width", 5)
        .attr("fill", "rgba(168,213,255,0.5)");
    }
  }, []);

  return (
    <svg ref={svgRef} className="w-[500px] h-[500px] border border-red-500" />
  );
}
