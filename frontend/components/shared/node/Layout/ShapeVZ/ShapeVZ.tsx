"use client"

import React, { useEffect, useRef } from "react"

interface ShapeVisualizerProps {
  dimensions: number[]
}

const ShapeVisualizer = React.memo(({ dimensions }: ShapeVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions
    canvas.width = 800
    canvas.height = 600

    // Draw based on dimensions
    if (dimensions.length === 1) {
      drawVector(ctx, dimensions[0])
    } else if (dimensions.length === 2) {
      drawMatrix(ctx, dimensions[0], dimensions[1])
    } else if (dimensions.length === 3) {
      draw3DTensor(ctx, dimensions[0], dimensions[1], dimensions[2])
    } else if (dimensions.length === 4) {
      draw4DTensor(ctx, dimensions[0], dimensions[1], dimensions[2], dimensions[3])
    } else {
      drawText(ctx, "Cannot visualize tensors with more than 4 dimensions")
    }
  }, [dimensions])

  const drawVector = (ctx: CanvasRenderingContext2D, length: number) => {
    const cellSize = Math.min(700 / length, 60)
    const startX = (ctx.canvas.width - length * cellSize) / 2
    const startY = ctx.canvas.height / 2 - cellSize / 2

    // Draw cells
    for (let i = 0; i < length; i++) {
      ctx.fillStyle = "#f0f9ff"
      ctx.strokeStyle = "#0284c7"
      ctx.lineWidth = 2

      ctx.fillRect(startX + i * cellSize, startY, cellSize, cellSize)
      ctx.strokeRect(startX + i * cellSize, startY, cellSize, cellSize)

      // Add index
      ctx.fillStyle = "#0284c7"
      ctx.font = `${Math.min(cellSize / 2, 14)}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${i}`, startX + i * cellSize + cellSize / 2, startY + cellSize / 2)
    }

    // Add dimension label
    ctx.fillStyle = "#000"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`Dimension 0: ${length} elements`, ctx.canvas.width / 2, startY + cellSize + 40)

    // Add title
    ctx.font = "bold 18px sans-serif"
    ctx.fillText(`1D Vector - Shape (${length})`, ctx.canvas.width / 2, startY - 40)
  }

  const drawMatrix = (ctx: CanvasRenderingContext2D, rows: number, cols: number) => {
    const maxCellSize = 60
    const cellWidth = Math.min(700 / cols, maxCellSize)
    const cellHeight = Math.min(500 / rows, maxCellSize)

    const startX = (ctx.canvas.width - cols * cellWidth) / 2
    const startY = (ctx.canvas.height - rows * cellHeight) / 2

    // Draw cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.fillStyle = "#f0f9ff"
        ctx.strokeStyle = "#0284c7"
        ctx.lineWidth = 1

        ctx.fillRect(startX + j * cellWidth, startY + i * cellHeight, cellWidth, cellHeight)
        ctx.strokeRect(startX + j * cellWidth, startY + i * cellHeight, cellWidth, cellHeight)

        // Add indices for smaller matrices
        if (rows * cols <= 100) {
          ctx.fillStyle = "#0284c7"
          ctx.font = `${Math.min(cellWidth / 3, 12)}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${i},${j}`, startX + j * cellWidth + cellWidth / 2, startY + i * cellHeight + cellHeight / 2)
        }
      }
    }

    // Add dimension labels
    ctx.fillStyle = "#000"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"

    // Row label (dimension 0)
    ctx.fillText(`Dimension 0: ${rows} rows`, ctx.canvas.width / 2, startY - 20)

    // Column label (dimension 1)
    ctx.save()
    ctx.translate(startX - 20, startY + (rows * cellHeight) / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(`Dimension 1: ${cols} columns`, 0, 0)
    ctx.restore()

    // Add title
    ctx.font = "bold 18px sans-serif"
    ctx.fillText(`2D Matrix - Shape (${rows}, ${cols})`, ctx.canvas.width / 2, startY - 60)
  }

  const draw3DTensor = (ctx: CanvasRenderingContext2D, height: number, width: number, channels: number) => {
    // For 3D tensors, we'll visualize as stacked 2D matrices
    const isImage = height <= 64 && width <= 64 && channels <= 4

    if (isImage) {
      drawImageTensor(ctx, height, width, channels)
    } else {
      drawGeneric3DTensor(ctx, height, width, channels)
    }
  }

  const drawImageTensor = (ctx: CanvasRenderingContext2D, height: number, width: number, channels: number) => {
    const maxSize = 400
    const scale = Math.min(maxSize / width, maxSize / height)

    const pixelSize = Math.max(1, scale)
    const imgWidth = width * pixelSize
    const imgHeight = height * pixelSize

    const startX = (ctx.canvas.width - imgWidth) / 2
    const startY = (ctx.canvas.height - imgHeight) / 2 - 40

    // Draw image representation
    ctx.fillStyle = "#f0f9ff"
    ctx.strokeStyle = "#0284c7"
    ctx.lineWidth = 2
    ctx.fillRect(startX, startY, imgWidth, imgHeight)
    ctx.strokeRect(startX, startY, imgWidth, imgHeight)

    // Draw pixel grid for small images
    if (height * width <= 1024 && pixelSize > 4) {
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 0.5

      // Draw horizontal lines
      for (let i = 1; i < height; i++) {
        ctx.beginPath()
        ctx.moveTo(startX, startY + i * pixelSize)
        ctx.lineTo(startX + imgWidth, startY + i * pixelSize)
        ctx.stroke()
      }

      // Draw vertical lines
      for (let j = 1; j < width; j++) {
        ctx.beginPath()
        ctx.moveTo(startX + j * pixelSize, startY)
        ctx.lineTo(startX + j * pixelSize, startY + imgHeight)
        ctx.stroke()
      }
    }

    // Draw channel representation
    const channelSize = 40
    const channelSpacing = 10
    const channelsWidth = channels * channelSize + (channels - 1) * channelSpacing
    const channelsStartX = (ctx.canvas.width - channelsWidth) / 2
    const channelsStartY = startY + imgHeight + 60

    const channelColors = ["#ef4444", "#22c55e", "#3b82f6", "#a855f7"]

    for (let c = 0; c < channels; c++) {
      const color = c < channelColors.length ? channelColors[c] : "#94a3b8"

      ctx.fillStyle = color
      ctx.strokeStyle = "#475569"
      ctx.lineWidth = 1

      const x = channelsStartX + c * (channelSize + channelSpacing)
      ctx.fillRect(x, channelsStartY, channelSize, channelSize)
      ctx.strokeRect(x, channelsStartY, channelSize, channelSize)

      // Add channel label
      ctx.fillStyle = "#000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Ch ${c}`, x + channelSize / 2, channelsStartY + channelSize + 20)
    }

    // Add dimension labels
    ctx.fillStyle = "#000"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"

    // Add title
    ctx.font = "bold 18px sans-serif"
    ctx.fillText(`3D Tensor (Image) - Shape (${height}, ${width}, ${channels})`, ctx.canvas.width / 2, startY - 40)

    // Add dimension explanations
    ctx.font = "14px sans-serif"
    ctx.fillText(`Dimension 0: ${height} pixels (height)`, ctx.canvas.width / 2, startY + imgHeight + 20)
    ctx.fillText(`Dimension 1: ${width} pixels (width)`, ctx.canvas.width / 2, startY + imgHeight + 40)
    ctx.fillText(`Dimension 2: ${channels} channels`, ctx.canvas.width / 2, channelsStartY + channelSize + 50)
  }

  const drawGeneric3DTensor = (ctx: CanvasRenderingContext2D, dim0: number, dim1: number, dim2: number) => {
    const maxLayers = 5
    const visibleLayers = Math.min(dim2, maxLayers)

    const maxCellSize = 30
    const cellWidth = Math.min(500 / dim1, maxCellSize)
    const cellHeight = Math.min(400 / dim0, maxCellSize)

    const layerWidth = dim1 * cellWidth
    const layerHeight = dim0 * cellHeight

    const layerSpacing = 40
    const totalWidth = layerWidth + (visibleLayers - 1) * layerSpacing

    const startX = (ctx.canvas.width - totalWidth) / 2
    const startY = (ctx.canvas.height - layerHeight) / 2

    // Draw layers from back to front
    for (let z = visibleLayers - 1; z >= 0; z--) {
      const layerX = startX + z * layerSpacing
      const layerY = startY - z * 15 // Slight vertical offset for 3D effect

      // Draw layer background
      ctx.fillStyle = "#f8fafc"
      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 1
      ctx.fillRect(layerX, layerY, layerWidth, layerHeight)
      ctx.strokeRect(layerX, layerY, layerWidth, layerHeight)

      // Draw cells for smaller tensors
      if (dim0 * dim1 <= 100) {
        for (let i = 0; i < dim0; i++) {
          for (let j = 0; j < dim1; j++) {
            ctx.strokeStyle = "#94a3b8"
            ctx.lineWidth = 0.5
            ctx.strokeRect(layerX + j * cellWidth, layerY + i * cellHeight, cellWidth, cellHeight)
          }
        }
      }

      // Add layer label
      ctx.fillStyle = "#000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Layer ${z}`, layerX + layerWidth / 2, layerY + layerHeight + 20)
    }

    // Indicate if there are more layers
    if (dim2 > maxLayers) {
      ctx.fillStyle = "#000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`+ ${dim2 - maxLayers} more layers`, ctx.canvas.width / 2, startY + layerHeight + 50)
    }

    // Add title and dimension labels
    ctx.fillStyle = "#000"
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`3D Tensor - Shape (${dim0}, ${dim1}, ${dim2})`, ctx.canvas.width / 2, startY - 60)

    ctx.font = "14px sans-serif"
    ctx.fillText(`Dimension 0: ${dim0}`, ctx.canvas.width / 2, startY - 30)
    ctx.fillText(`Dimension 1: ${dim1}`, ctx.canvas.width / 2, startY - 10)
    ctx.fillText(`Dimension 2: ${dim2} layers`, ctx.canvas.width / 2, startY + layerHeight + 70)
  }

  const draw4DTensor = (
    ctx: CanvasRenderingContext2D,
    batch: number,
    height: number,
    width: number,
    channels: number,
  ) => {
    const maxBatches = 3
    const visibleBatches = Math.min(batch, maxBatches)

    // Calculate the size for each 3D tensor representation
    const tensorWidth = 200
    const tensorHeight = 150
    const batchSpacing = 40

    const totalWidth = visibleBatches * tensorWidth + (visibleBatches - 1) * batchSpacing
    const startX = (ctx.canvas.width - totalWidth) / 2
    const startY = (ctx.canvas.height - tensorHeight) / 2

    // Draw each batch item
    for (let b = 0; b < visibleBatches; b++) {
      const batchX = startX + b * (tensorWidth + batchSpacing)

      // Draw tensor representation (simplified)
      ctx.fillStyle = "#f0f9ff"
      ctx.strokeStyle = "#0284c7"
      ctx.lineWidth = 2

      // Draw main rectangle
      ctx.fillRect(batchX, startY, tensorWidth, tensorHeight)
      ctx.strokeRect(batchX, startY, tensorWidth, tensorHeight)

      // Draw layers effect
      const layerOffset = 15
      const layers = Math.min(channels, 3)

      for (let l = 0; l < layers; l++) {
        const layerX = batchX + (l + 1) * layerOffset
        const layerY = startY - (l + 1) * 10

        ctx.fillStyle = `rgba(240, 249, 255, ${0.8 - l * 0.2})`
        ctx.strokeStyle = "#0284c7"
        ctx.lineWidth = 1

        ctx.fillRect(layerX, layerY, tensorWidth - (l + 1) * layerOffset * 2, tensorHeight)
        ctx.strokeRect(layerX, layerY, tensorWidth - (l + 1) * layerOffset * 2, tensorHeight)
      }

      // Add batch label
      ctx.fillStyle = "#000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Batch ${b}`, batchX + tensorWidth / 2, startY + tensorHeight + 25)

      // Add dimensions
      ctx.font = "12px sans-serif"
      ctx.fillText(`(${height}×${width}×${channels})`, batchX + tensorWidth / 2, startY + tensorHeight + 45)
    }

    // Indicate if there are more batches
    if (batch > maxBatches) {
      ctx.fillStyle = "#000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`+ ${batch - maxBatches} more batches`, ctx.canvas.width / 2, startY + tensorHeight + 80)
    }

    // Add title
    ctx.fillStyle = "#000"
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`4D Tensor - Shape (${batch}, ${height}, ${width}, ${channels})`, ctx.canvas.width / 2, startY - 40)

    // Add dimension explanation
    ctx.font = "14px sans-serif"
    ctx.fillText(`Dimension 0: ${batch} batches`, ctx.canvas.width / 2, startY + tensorHeight + 110)
    ctx.fillText(
      `Dimensions 1-3: ${height}×${width}×${channels} (height×width×channels)`,
      ctx.canvas.width / 2,
      startY + tensorHeight + 130,
    )
  }

  const drawText = (ctx: CanvasRenderingContext2D, text: string) => {
    ctx.fillStyle = "#000"
    ctx.font = "18px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2)
  }

  return <canvas ref={canvasRef} className="h-auto max-w-full" />
})


export default ShapeVisualizer