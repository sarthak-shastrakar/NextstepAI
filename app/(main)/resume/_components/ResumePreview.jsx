"use client";

import { useRef, useEffect, useState } from "react";
import { RESUME_TEMPLATES } from "./templates";

const A4_WIDTH_PX = 794;

export default function ResumePreview({ values, user, templateId = "minimal", forPDF = false }) {
  const SelectedTemplate = RESUME_TEMPLATES[templateId]?.component || RESUME_TEMPLATES.minimal.component;
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (forPDF) return; // No scaling for PDF export

    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(1, containerWidth / A4_WIDTH_PX);
        setScale(newScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [forPDF]);

  if (forPDF) {
    // No wrapper, no scale — raw A4 template for PDF
    return <SelectedTemplate values={values} user={user} />;
  }

  return (
    // Outer ref div tracks available width
    <div ref={containerRef} className="w-full overflow-hidden">
      {/* Inner div: always A4 width, scaled down on small screens */}
      <div
        style={{
          width: `${A4_WIDTH_PX}px`,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          // Shrink container height to match scaled content
          marginBottom: scale < 1 ? `${(A4_WIDTH_PX * 1.414 * scale) - (A4_WIDTH_PX * 1.414)}px` : 0,
        }}
        className="selection:bg-primary/10"
      >
        <SelectedTemplate values={values} user={user} />
      </div>
    </div>
  );
}
