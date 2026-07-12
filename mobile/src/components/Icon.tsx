import React from "react";
import Svg, { Path, Circle, Line, Rect, Polyline, Polygon } from "react-native-svg";

interface Props {
  name: string;
  size?: number;
  color?: string;
}

/**
 * Custom SVG icon set (subset of Lucide). Each returns simple stroked shapes
 * matching the web app's iconography for consistent branding.
 */
export function Icon({ name, size = 20, color = "#0f172a" }: Props) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "wallet":
      return (
        <Svg {...common}>
          <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </Svg>
      );
    case "landmark":
      return (
        <Svg {...common}>
          <Line x1="3" y1="22" x2="21" y2="22" />
          <Line x1="6" y1="18" x2="6" y2="11" />
          <Line x1="10" y1="18" x2="10" y2="11" />
          <Line x1="14" y1="18" x2="14" y2="11" />
          <Line x1="18" y1="18" x2="18" y2="11" />
          <Polygon points="12 2 20 7 4 7" />
        </Svg>
      );
    case "smartphone":
      return (
        <Svg {...common}>
          <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <Line x1="12" y1="18" x2="12" y2="18" />
        </Svg>
      );
    case "credit-card":
      return (
        <Svg {...common}>
          <Rect x="2" y="5" width="20" height="14" rx="2" />
          <Line x1="2" y1="10" x2="22" y2="10" />
        </Svg>
      );
    case "trending-up":
      return (
        <Svg {...common}>
          <Polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <Polyline points="16 7 22 7 22 13" />
        </Svg>
      );
    case "trending-down":
      return (
        <Svg {...common}>
          <Polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
          <Polyline points="16 17 22 17 22 11" />
        </Svg>
      );
    case "briefcase":
      return (
        <Svg {...common}>
          <Rect x="2" y="7" width="20" height="14" rx="2" />
          <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </Svg>
      );
    case "gift":
      return (
        <Svg {...common}>
          <Rect x="3" y="8" width="18" height="4" rx="1" />
          <Path d="M12 8v13" />
          <Path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
          <Path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" />
          <Path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
        </Svg>
      );
    case "laptop":
      return (
        <Svg {...common}>
          <Path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
        </Svg>
      );
    case "utensils":
      return (
        <Svg {...common}>
          <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <Path d="M7 2v20" />
          <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
        </Svg>
      );
    case "car":
      return (
        <Svg {...common}>
          <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <Circle cx="7" cy="17" r="2" />
          <Path d="M9 17h6" />
          <Circle cx="17" cy="17" r="2" />
        </Svg>
      );
    case "shopping-cart":
      return (
        <Svg {...common}>
          <Circle cx="8" cy="21" r="1" />
          <Circle cx="19" cy="21" r="1" />
          <Path d="M2 2h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L22 6H5" />
        </Svg>
      );
    case "zap":
      return (
        <Svg {...common}>
          <Path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </Svg>
      );
    case "home":
      return (
        <Svg {...common}>
          <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <Path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </Svg>
      );
    case "heart-pulse":
      return (
        <Svg {...common}>
          <Path d="M19 14c1.5-1.5 3-3 3-5.5A5.5 5.5 0 0 0 16.5 3 5 5 0 0 0 12 5.5 5 5 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.5 1.5 4 3 5.5L12 21z" />
          <Path d="M4 12h3l2-4 2 8 2-6 2 4h3" />
        </Svg>
      );
    case "book-open":
      return (
        <Svg {...common}>
          <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </Svg>
      );
    case "clapperboard":
      return (
        <Svg {...common}>
          <Path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9z" />
          <Path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5V9H2z" />
          <Path d="m6.9 4-1.4 5" />
          <Path d="m13.9 4-1.4 5" />
        </Svg>
      );
    case "hand-heart":
      return (
        <Svg {...common}>
          <Path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
          <Path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8l-3.2 3" />
          <Path d="M2 15l5 5" />
          <Path d="M20 4c-2 0-3.5 1.5-3.5 3 .5-1 2-2 3.5-2 2 0 3.5 1.5 3.5 3 0 2-2 3-3.5 4-1.5-1-3.5-2-3.5-4 0-1.5 1.5-3 3.5-3z" />
        </Svg>
      );
    case "piggy-bank":
      return (
        <Svg {...common}>
          <Path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
          <Path d="M2 9v1c0 1.1.9 2 2 2h1" />
          <Path d="M16 11h.01" />
        </Svg>
      );
    case "receipt":
      return (
        <Svg {...common}>
          <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
          <Path d="M16 8H8" />
          <Path d="M16 12H8" />
          <Path d="M13 16H8" />
        </Svg>
      );
    case "more-horizontal":
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="1" />
          <Circle cx="19" cy="12" r="1" />
          <Circle cx="5" cy="12" r="1" />
        </Svg>
      );
    case "tag":
      return (
        <Svg {...common}>
          <Path d="M12.6 3H3v9.6L14.4 24l9.6-9.6L12.6 3z" />
          <Circle cx="7" cy="7" r="1.5" />
        </Svg>
      );
    case "target":
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="10" />
          <Circle cx="12" cy="12" r="6" />
          <Circle cx="12" cy="12" r="2" />
        </Svg>
      );
    case "shield":
      return (
        <Svg {...common}>
          <Path d="M20 13c0 5-3.5 7.5-7.7 9-.2.1-.5.1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
        </Svg>
      );
    case "plane":
      return (
        <Svg {...common}>
          <Path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </Svg>
      );
    case "bike":
      return (
        <Svg {...common}>
          <Circle cx="18.5" cy="17.5" r="3.5" />
          <Circle cx="5.5" cy="17.5" r="3.5" />
          <Circle cx="15" cy="5" r="1" />
          <Path d="M12 17.5V14l-3-3 4-3 2 3h2" />
        </Svg>
      );
    case "coins":
      return (
        <Svg {...common}>
          <Circle cx="8" cy="8" r="6" />
          <Path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
          <Path d="M7 6h1v4" />
          <Path d="m16.71 13.88.7.71-2.82 2.82" />
        </Svg>
      );
    case "arrow-down-left":
      return (
        <Svg {...common}>
          <Line x1="17" y1="7" x2="7" y2="17" />
          <Polyline points="17 17 7 17 7 7" />
        </Svg>
      );
    case "arrow-up-right":
      return (
        <Svg {...common}>
          <Line x1="7" y1="17" x2="17" y2="7" />
          <Polyline points="7 7 17 7 17 17" />
        </Svg>
      );
    case "repeat":
      return (
        <Svg {...common}>
          <Path d="m2 9 3-3 3 3" />
          <Path d="M13 18H7a2 2 0 0 1-2-2V6" />
          <Path d="m22 15-3 3-3-3" />
          <Path d="M11 6h6a2 2 0 0 1 2 2v10" />
        </Svg>
      );
    case "handshake":
      return (
        <Svg {...common}>
          <Path d="m11 17 2 2a1 1 0 1 0 3-3" />
          <Path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5.8 5.8 0 0 1 7.1-.9l.5.3c.4.3 1 .3 1.4.2L21 4" />
          <Path d="M21 3l1 11h-2" />
          <Path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <Path d="M3 4h8" />
        </Svg>
      );
    case "plus":
      return (
        <Svg {...common}>
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </Svg>
      );
    case "check":
      return (
        <Svg {...common}>
          <Polyline points="20 6 9 17 4 12" />
        </Svg>
      );
    case "trash":
      return (
        <Svg {...common}>
          <Path d="M3 6h18" />
          <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </Svg>
      );
    case "settings":
      return (
        <Svg {...common}>
          <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case "chart":
      return (
        <Svg {...common}>
          <Line x1="18" y1="20" x2="18" y2="10" />
          <Line x1="12" y1="20" x2="12" y2="4" />
          <Line x1="6" y1="20" x2="6" y2="14" />
        </Svg>
      );
    case "list":
      return (
        <Svg {...common}>
          <Line x1="8" y1="6" x2="21" y2="6" />
          <Line x1="8" y1="12" x2="21" y2="12" />
          <Line x1="8" y1="18" x2="21" y2="18" />
          <Line x1="3" y1="6" x2="3.01" y2="6" />
          <Line x1="3" y1="12" x2="3.01" y2="12" />
          <Line x1="3" y1="18" x2="3.01" y2="18" />
        </Svg>
      );
    case "layout":
      return (
        <Svg {...common}>
          <Rect x="3" y="3" width="18" height="18" rx="2" />
          <Line x1="3" y1="9" x2="21" y2="9" />
          <Line x1="9" y1="21" x2="9" y2="9" />
        </Svg>
      );
    case "download":
      return (
        <Svg {...common}>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <Polyline points="7 10 12 15 17 10" />
          <Line x1="12" y1="15" x2="12" y2="3" />
        </Svg>
      );
    case "share":
      return (
        <Svg {...common}>
          <Circle cx="18" cy="5" r="3" />
          <Circle cx="6" cy="12" r="3" />
          <Circle cx="18" cy="19" r="3" />
          <Line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          <Line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
        </Svg>
      );
    case "chevron-left":
      return (
        <Svg {...common}>
          <Polyline points="15 18 9 12 15 6" />
        </Svg>
      );
    case "chevron-right":
      return (
        <Svg {...common}>
          <Polyline points="9 18 15 12 9 6" />
        </Svg>
      );
    case "search":
      return (
        <Svg {...common}>
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Svg>
      );
    case "x":
      return (
        <Svg {...common}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );
    default:
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="9" />
        </Svg>
      );
  }
}
