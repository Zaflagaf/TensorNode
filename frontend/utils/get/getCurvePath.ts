import * as d3 from "d3"

export default function getCurvePath(x1: number, y1: number, x2: number, y2: number) {
  const lineGenerator = d3.line().curve(d3.curveBumpX);
  return lineGenerator([
    [x1, y1],
    [x2, y2],
  ])!;
}