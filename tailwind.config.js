/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      "colors": {
        "background": "#f8fafc",
        "on-background": "#0f172a",
        
        "surface": "#ffffff",
        "on-surface": "#0f172a",
        "on-surface-variant": "#64748b",
        
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8fafc",
        "surface-container": "#f1f5f9",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",
        
        "primary": "#0f172a",
        "on-primary": "#ffffff",
        "primary-container": "#f1f5f9",
        "on-primary-container": "#0f172a",
        "primary-fixed": "#e2e8f0",
        "primary-fixed-dim": "#cbd5e1",
        "on-primary-fixed": "#0f172a",
        "on-primary-fixed-variant": "#475569",
        "inverse-primary": "#94a3b8",
        
        "secondary": "#0f172a",
        "on-secondary": "#ffffff",
        "secondary-fixed": "#2563eb",
        "secondary-fixed-dim": "#1d4ed8",
        "on-secondary-fixed": "#ffffff",
        "on-secondary-fixed-variant": "#1e40af",
        "secondary-container": "#eff6ff",
        "on-secondary-container": "#1e40af",
        
        "tertiary": "#0284c7",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#f0f9ff",
        "on-tertiary-container": "#0369a1",
        "tertiary-fixed": "#e0f2fe",
        "tertiary-fixed-dim": "#bae6fd",
        "on-tertiary-fixed": "#0c4a6e",
        
        "outline": "#94a3b8",
        "outline-variant": "#e2e8f0",
        
        "error": "#dc2626",
        "on-error": "#ffffff",
        "error-container": "#fef2f2",
        "on-error-container": "#991b1b",
        
        "inverse-surface": "#0f172a",
        "inverse-on-surface": "#f8fafc",
        "surface-tint": "#2563eb"
      },
      "borderRadius": {
        "DEFAULT": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      "spacing": {
        "unit": "8px",
        "stack-lg": "64px",
        "margin-mobile": "20px",
        "gutter": "24px",
        "container-max": "1440px",
        "stack-sm": "16px",
        "margin-desktop": "64px",
        "stack-md": "32px"
      },
      "fontFamily": {
        "display-sm": ["Montserrat", "sans-serif"],
        "headline-lg": ["Montserrat", "sans-serif"],
        "label-sm": ["Geist", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Montserrat", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "display-lg": ["Montserrat", "sans-serif"],
        "label-bold": ["Geist", "sans-serif"]
      },
      "fontSize": {
        "display-sm": ["36px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "800"}],
        "headline-lg": ["30px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "display-lg": ["56px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}],
        "label-bold": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.03em", "fontWeight": "600"}]
      }
    },
  },
  plugins: [],
}
