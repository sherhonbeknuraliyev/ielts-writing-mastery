export const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
  smallMobile: { width: 320, height: 568 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

// Apple HIG / Google Material Design minimum interactive target
export const MIN_TOUCH_TARGET = 44; // px

// WCAG / browser minimum readable font size
export const MIN_FONT_SIZE = 12; // px

// The sidebar is shown at widths > 768px (CSS uses this breakpoint)
export const SIDEBAR_BREAKPOINT = 768; // px

// Expected sidebar width from CSS --sidebar-width variable
export const SIDEBAR_WIDTH = 260; // px
