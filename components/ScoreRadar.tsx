"use client";

import React from "react";

interface ScoreRadarProps {
  scores: {
    urgence: number;
    faisabilite: number;
    rentabilite: number;
    competition: number;
    timing: number;
  };
  size?: number;
}

const LABELS = ["Urgence", "Faisabilité", "Rentabilité", "Compétition", "Timing"];
const KEYS: (keyof ScoreRadarProps["scores"])[] = [
  "urgence",
  "faisabilite",
  "rentabilite",
  "competition",
  "timing",
];
const GRID_LEVELS = [0.33, 0.66, 1];
const AXIS_COUNT = 5;
const ANGLE_OFFSET = -Math.PI / 2;

function getPoint(
  centerX: number,
  centerY: number,
  radius: number,
  index: number
): [number, number] {
  const angle = ANGLE_OFFSET + (2 * Math.PI * index) / AXIS_COUNT;
  return [
    centerX + radius * Math.cos(angle),
    centerY + radius * Math.sin(angle),
  ];
}

function polygonPoints(
  centerX: number,
  centerY: number,
  radius: number
): string {
  return Array.from({ length: AXIS_COUNT })
    .map((_, i) => {
      const [x, y] = getPoint(centerX, centerY, radius, i);
      return `${x},${y}`;
    })
    .join(" ");
}

export default function ScoreRadar({ scores, size = 200 }: ScoreRadarProps) {
  const padding = 30;
  const svgSize = size + padding * 2;
  const center = svgSize / 2;
  const maxRadius = size / 2;

  const dataPoints: [number, number][] = KEYS.map((key, i) => {
    const value = Math.max(0, Math.min(10, scores[key]));
    const r = (value / 10) * maxRadius;
    return getPoint(center, center, r, i);
  });

  const dataPolygonPoints = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  const labelOffsets: [number, number][] = KEYS.map((_, i) => {
    const [x, y] = getPoint(center, center, maxRadius + 18, i);
    return [x, y];
  });

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Concentric pentagon grid lines */}
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(center, center, maxRadius * level)}
          fill="none"
          stroke="#1e293b"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines from center to each vertex */}
      {Array.from({ length: AXIS_COUNT }).map((_, i) => {
        const [x, y] = getPoint(center, center, maxRadius, i);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#1e293b"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPolygonPoints}
        fill="rgba(99, 102, 241, 0.2)"
        stroke="#6366f1"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#6366f1" />
      ))}

      {/* Labels */}
      {LABELS.map((label, i) => {
        const [x, y] = labelOffsets[i];
        let textAnchor: "middle" | "start" | "end" = "middle";
        let dy = 0;

        // Top label
        if (i === 0) {
          dy = -4;
        }
        // Right-side labels
        else if (i === 1 || i === 4) {
          textAnchor = i === 1 ? "start" : "end";
          dy = 4;
        }
        // Bottom labels
        else if (i === 2 || i === 3) {
          textAnchor = i === 2 ? "start" : "end";
          dy = 12;
        }

        return (
          <text
            key={i}
            x={x}
            y={y + dy}
            textAnchor={textAnchor}
            fill="#94a3b8"
            fontSize={11}
            fontFamily="sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
