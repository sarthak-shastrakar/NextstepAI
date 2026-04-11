import MinimalTemplate from "./Minimal";
import ModernTemplate from "./Modern";
import ProfessionalTemplate from "./Professional";

export const RESUME_TEMPLATES = {
  minimal: {
    id: "minimal",
    name: "Minimal (ATS-Friendly)",
    component: MinimalTemplate,
    description: "Classic single-column layout optimized for machine readers.",
  },
  modern: {
    id: "modern",
    name: "Modern (2-Column)",
    component: ModernTemplate,
    description: "Elegant layout with a sidebar for skills and contact info.",
  },
  professional: {
    id: "professional",
    name: "Executive (Adaptive)",
    component: ProfessionalTemplate,
    description: "High-impact layout that automatically adapts to your industry's standards.",
  },
};
