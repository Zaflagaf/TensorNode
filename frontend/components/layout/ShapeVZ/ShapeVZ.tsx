"use client";

import React, { useEffect, useRef } from "react";

interface ShapeVisualizerProps {
  dimensions: number[];
}

const COLORS = {
  background: "#1a1a1a", // canvas background
  cellFill: "#1a1a1a", // dark gray cells
  cellStroke: "#aaaaaa", // light gray strokes
  textLight: "#aaaaaa", // light text inside cells
  textGray: "#cacaca", // labels and titles
  grid: "#aaaaaa", // medium gray grid lines
  channels: ["#ef4444", "#22c55e", "#3b82f6", "#a855f7"], // 3D channels
};

const ShapeVisualizer = React.memo(({ dimensions }: ShapeVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

/*     ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height); */

    if (dimensions.length === 1) {
      drawVector(ctx, dimensions[0]);
    } else if (dimensions.length === 2) {
      drawMatrix(ctx, dimensions[0], dimensions[1]);
    } else if (dimensions.length === 3) {
      draw3DTensor(ctx, dimensions[0], dimensions[1], dimensions[2]);
    } else if (dimensions.length === 4) {
      draw4DTensor(
        ctx,
        dimensions[0],
        dimensions[1],
        dimensions[2],
        dimensions[3]
      );
    } else {
      drawText(ctx, "Cannot visualize tensors with more than 4 dimensions");
    }
  }, [dimensions]);

  const drawVector = (ctx: CanvasRenderingContext2D, length: number) => {
    const cellSize = Math.min(700 / length, 60);
    const startX = (ctx.canvas.width - length * cellSize) / 2;
    const startY = ctx.canvas.height / 2 - cellSize / 2;

    for (let i = 0; i < length; i++) {
      ctx.fillStyle = COLORS.cellFill;
      ctx.strokeStyle = COLORS.cellStroke;
      ctx.lineWidth = 2;
      ctx.fillRect(startX + i * cellSize, startY, cellSize, cellSize);
      ctx.strokeRect(startX + i * cellSize, startY, cellSize, cellSize);

      ctx.fillStyle = COLORS.textLight;
      ctx.font = `${Math.min(cellSize / 2, 14)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${i}`,
        startX + i * cellSize + cellSize / 2,
        startY + cellSize / 2
      );
    }

    ctx.fillStyle = COLORS.textGray;
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Dimension 0: ${length} elements`,
      ctx.canvas.width / 2,
      startY + cellSize + 40
    );

    ctx.font = "bold 18px sans-serif";
    ctx.fillText(
      `1D Vector - Shape (${length})`,
      ctx.canvas.width / 2,
      startY - 40
    );
  };

  const drawMatrix = (
    ctx: CanvasRenderingContext2D,
    rows: number,
    cols: number
  ) => {
    const maxCellSize = 60;
    const cellWidth = Math.min(700 / cols, maxCellSize);
    const cellHeight = Math.min(500 / rows, maxCellSize);
    const startX = (ctx.canvas.width - cols * cellWidth) / 2;
    const startY = (ctx.canvas.height - rows * cellHeight) / 2;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.fillStyle = COLORS.cellFill;
        ctx.strokeStyle = COLORS.cellStroke;
        ctx.lineWidth = 1;
        ctx.fillRect(
          startX + j * cellWidth,
          startY + i * cellHeight,
          cellWidth,
          cellHeight
        );
        ctx.strokeRect(
          startX + j * cellWidth,
          startY + i * cellHeight,
          cellWidth,
          cellHeight
        );

        if (rows * cols <= 100) {
          ctx.fillStyle = COLORS.textLight;
          ctx.font = `${Math.min(cellWidth / 3, 12)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            `${i},${j}`,
            startX + j * cellWidth + cellWidth / 2,
            startY + i * cellHeight + cellHeight / 2
          );
        }
      }
    }

    ctx.fillStyle = COLORS.textGray;
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Dimension 0: ${rows} rows`,
      ctx.canvas.width / 2,
      startY - 20
    );
    ctx.save();
    ctx.translate(startX - 20, startY + (rows * cellHeight) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Dimension 1: ${cols} columns`, 0, 0);
    ctx.restore();

    ctx.font = "bold 18px sans-serif";
    ctx.fillText(
      `2D Matrix - Shape (${rows}, ${cols})`,
      ctx.canvas.width / 2,
      startY - 60
    );
  };

  const draw3DTensor = (
    ctx: CanvasRenderingContext2D,
    height: number,
    width: number,
    channels: number
  ) => {
    const isImage = height <= 64 && width <= 64 && channels <= 4;
    if (isImage) drawImageTensor(ctx, height, width, channels);
    else drawGeneric3DTensor(ctx, height, width, channels);
  };

  const drawImageTensor = (
    ctx: CanvasRenderingContext2D,
    height: number,
    width: number,
    channels: number
  ) => {
    const maxSize = 400;
    const scale = Math.min(maxSize / width, maxSize / height);
    const pixelSize = Math.max(1, scale);
    const imgWidth = width * pixelSize;
    const imgHeight = height * pixelSize;
    const startX = (ctx.canvas.width - imgWidth) / 2;
    const startY = (ctx.canvas.height - imgHeight) / 2 - 40;

    ctx.fillStyle = COLORS.cellFill;
    ctx.strokeStyle = COLORS.cellStroke;
    ctx.lineWidth = 2;
    ctx.fillRect(startX, startY, imgWidth, imgHeight);
    ctx.strokeRect(startX, startY, imgWidth, imgHeight);

    if (height * width <= 1024 && pixelSize > 4) {
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.5;
      for (let i = 1; i < height; i++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * pixelSize);
        ctx.lineTo(startX + imgWidth, startY + i * pixelSize);
        ctx.stroke();
      }
      for (let j = 1; j < width; j++) {
        ctx.beginPath();
        ctx.moveTo(startX + j * pixelSize, startY);
        ctx.lineTo(startX + j * pixelSize, startY + imgHeight);
        ctx.stroke();
      }
    }

    const channelSize = 40;
    const channelSpacing = 10;
    const channelsWidth =
      channels * channelSize + (channels - 1) * channelSpacing;
    const channelsStartX = (ctx.canvas.width - channelsWidth) / 2;
    const channelsStartY = startY + imgHeight + 60;

    for (let c = 0; c < channels; c++) {
      const color =
        c < COLORS.channels.length ? COLORS.channels[c] : COLORS.grid;
      const x = channelsStartX + c * (channelSize + channelSpacing);

      ctx.fillStyle = color;
      ctx.strokeStyle = COLORS.cellStroke;
      ctx.lineWidth = 1;
      ctx.fillRect(x, channelsStartY, channelSize, channelSize);
      ctx.strokeRect(x, channelsStartY, channelSize, channelSize);

      ctx.fillStyle = COLORS.textGray;
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `Ch ${c}`,
        x + channelSize / 2,
        channelsStartY + channelSize + 20
      );
    }

    ctx.fillStyle = COLORS.textGray;
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `3D Tensor (Image) - Shape (${height}, ${width}, ${channels})`,
      ctx.canvas.width / 2,
      startY - 40
    );

    ctx.font = "14px sans-serif";
    ctx.fillText(
      `Dimension 0: ${height} pixels (height)`,
      ctx.canvas.width / 2,
      startY + imgHeight + 20
    );
    ctx.fillText(
      `Dimension 1: ${width} pixels (width)`,
      ctx.canvas.width / 2,
      startY + imgHeight + 40
    );
    ctx.fillText(
      `Dimension 2: ${channels} channels`,
      ctx.canvas.width / 2,
      channelsStartY + channelSize + 50
    );
  };

  const drawGeneric3DTensor = (
    ctx: CanvasRenderingContext2D,
    dim0: number,
    dim1: number,
    dim2: number
  ) => {
    const maxLayers = 5;
    const visibleLayers = Math.min(dim2, maxLayers);
    const maxCellSize = 30;
    const cellWidth = Math.min(500 / dim1, maxCellSize);
    const cellHeight = Math.min(400 / dim0, maxCellSize);
    const layerWidth = dim1 * cellWidth;
    const layerHeight = dim0 * cellHeight;
    const layerSpacing = 40;
    const startX =
      (ctx.canvas.width - layerWidth - (visibleLayers - 1) * layerSpacing) / 2;
    const startY = (ctx.canvas.height - layerHeight) / 2;

    for (let z = visibleLayers - 1; z >= 0; z--) {
      const layerX = startX + z * layerSpacing;
      const layerY = startY - z * 15;

      ctx.fillStyle = COLORS.cellFill;
      ctx.strokeStyle = COLORS.cellStroke;
      ctx.lineWidth = 1;
      ctx.fillRect(layerX, layerY, layerWidth, layerHeight);
      ctx.strokeRect(layerX, layerY, layerWidth, layerHeight);

      if (dim0 * dim1 <= 100) {
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < dim0; i++) {
          for (let j = 0; j < dim1; j++) {
            ctx.strokeRect(
              layerX + j * cellWidth,
              layerY + i * cellHeight,
              cellWidth,
              cellHeight
            );
          }
        }
      }

      ctx.fillStyle = COLORS.textLight;
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `Layer ${z}`,
        layerX + layerWidth / 2,
        layerY + layerHeight + 20
      );
    }

    if (dim2 > maxLayers) {
      ctx.fillStyle = COLORS.textGray;
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `+ ${dim2 - maxLayers} more layers`,
        ctx.canvas.width / 2,
        startY + layerHeight + 50
      );
    }

    ctx.fillStyle = COLORS.textGray;
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `3D Tensor - Shape (${dim0}, ${dim1}, ${dim2})`,
      ctx.canvas.width / 2,
      startY - 60
    );
  };

  const draw4DTensor = (
    ctx: CanvasRenderingContext2D,
    batch: number,
    height: number,
    width: number,
    channels: number
  ) => {
    const maxBatches = 3;
    const visibleBatches = Math.min(batch, maxBatches);
    const tensorWidth = 200;
    const tensorHeight = 150;
    const batchSpacing = 40;
    const totalWidth =
      visibleBatches * tensorWidth + (visibleBatches - 1) * batchSpacing;
    const startX = (ctx.canvas.width - totalWidth) / 2;
    const startY = (ctx.canvas.height - tensorHeight) / 2;

    for (let b = 0; b < visibleBatches; b++) {
      const batchX = startX + b * (tensorWidth + batchSpacing);
      ctx.fillStyle = COLORS.cellFill;
      ctx.strokeStyle = COLORS.cellStroke;
      ctx.lineWidth = 2;
      ctx.fillRect(batchX, startY, tensorWidth, tensorHeight);
      ctx.strokeRect(batchX, startY, tensorWidth, tensorHeight);
    }

    if (batch > maxBatches) {
      ctx.fillStyle = COLORS.textGray;
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `+ ${batch - maxBatches} more batches`,
        ctx.canvas.width / 2,
        startY + tensorHeight + 80
      );
    }

    ctx.fillStyle = COLORS.textGray;
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `4D Tensor - Shape (${batch}, ${height}, ${width}, ${channels})`,
      ctx.canvas.width / 2,
      startY - 40
    );
  };

  const drawText = (ctx: CanvasRenderingContext2D, text: string) => {
    ctx.fillStyle = COLORS.textGray;
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2);
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-auto max-w-full bg-transparent rounded-lg z-1"
    />
  );
});

export default ShapeVisualizer;
