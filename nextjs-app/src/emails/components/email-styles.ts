/**
 * Shared email styles matching the billing-change-reminder template
 * These styles ensure consistency across all email templates
 */

// Color Palette
export const colors = {
  // Background
  background: '#f3f4f6',
  cardBackground: '#ffffff',
  
  // Text
  titleText: '#111827',
  bodyText: '#374151',
  headerText: '#9ca3af',
  footerText: '#6b7280',
  linkText: '#9333ea',
  linkTextBlue: '#067df7', // Old blue color (deprecated)
  
  // Accent
  checkmark: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  
  // Button gradient colors
  gradientStart: '#9333ea',
  gradientEnd: '#ec4899',
} as const;

// Typography
export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  
  // Font sizes
  titleSize: '28px',
  bodySize: '16px',
  headerSize: '14px',
  footerSize: '14px',
  buttonSize: '16px',
  
  // Font weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: 'bold',
  
  // Line heights
  bodyLineHeight: '1.5',
  bulletLineHeight: '1.5', // Reduced from 1.75 for tighter spacing
} as const;

// Layout
export const layout = {
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
} as const;

// Spacing
export const spacing = {
  // Container padding
  containerPadding: '40px 20px',
  
  // Logo section
  logoPadding: '32px 0',
  
  // Content
  contentPadding: '0 48px 32px', // Reduced bottom padding
  
  // Sections
  sectionMargin: '32px 0 16px 0',
  
  // Items
  itemMargin: '0 0 16px 0',
  checkItemMargin: '12px',
  bulletMargin: '32px',
  
  // Button
  buttonPadding: '14px 32px',
  buttonMargin: '32px 0',
} as const;

// Component Styles
export const styles = {
  // Main container
  container: {
    backgroundColor: colors.background,
    padding: spacing.containerPadding,
  },
  
  // Card wrapper
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: layout.borderRadius,
    boxShadow: layout.boxShadow,
    maxWidth: layout.maxWidth,
    margin: '0 auto',
    overflow: 'hidden',
  },
  
  // Logo section
  logoSection: {
    textAlign: 'center' as const,
    padding: spacing.logoPadding,
  },
  
  // Content wrapper
  content: {
    padding: spacing.contentPadding,
  },
  
  // Typography styles
  title: {
    fontSize: typography.titleSize,
    fontWeight: typography.bold,
    color: colors.titleText,
    margin: '0 0 32px 0',
    fontFamily: typography.fontFamily,
  },
  
  text: {
    fontSize: typography.bodySize,
    lineHeight: typography.bodyLineHeight,
    color: colors.bodyText,
    margin: spacing.itemMargin,
    fontFamily: typography.fontFamily,
  },
  
  sectionHeader: {
    fontSize: typography.headerSize,
    fontWeight: typography.medium,
    color: colors.headerText,
    margin: spacing.sectionMargin,
    fontFamily: typography.fontFamily,
  },
  
  // Checkmark list
  checkItem: {
    display: 'flex',
    marginBottom: spacing.checkItemMargin,
  },
  
  checkmark: {
    color: colors.checkmark,
    fontSize: '18px',
    marginRight: spacing.checkItemMargin,
    flexShrink: 0,
  },
  
  checkText: {
    fontSize: typography.bodySize,
    lineHeight: typography.bodyLineHeight,
    color: colors.bodyText,
    fontFamily: typography.fontFamily,
    margin: 0,
  },
  
  // Bullet list
  bulletList: {
    marginLeft: spacing.bulletMargin,
    marginTop: '16px',
  },
  
  bulletItem: {
    fontSize: typography.bodySize,
    lineHeight: typography.bulletLineHeight,
    color: colors.bodyText,
    fontFamily: typography.fontFamily,
    margin: 0,
  },
  
  // Button
  button: {
    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
    color: '#ffffff',
    fontSize: typography.buttonSize,
    fontWeight: typography.semibold,
    padding: spacing.buttonPadding,
    borderRadius: layout.borderRadius,
    textDecoration: 'none',
    display: 'inline-block',
    margin: spacing.buttonMargin,
    fontFamily: typography.fontFamily,
  },
  
  // Button wrapper for centering
  buttonWrapper: {
    textAlign: 'center' as const,
    margin: spacing.buttonMargin,
  },
  
  // Footer
  footer: {
    fontSize: typography.footerSize,
    color: colors.footerText,
    textAlign: 'center' as const,
    margin: '16px 0 0 0', // Reduced top margin to decrease gap
    fontFamily: typography.fontFamily,
  },
  
  // Footer with bottom padding (for copyright)
  footerWithPadding: {
    fontSize: typography.footerSize,
    color: colors.footerText,
    textAlign: 'center' as const,
    margin: '16px 0 0 0',
    paddingBottom: '25px', // Added bottom padding for copyright
    fontFamily: typography.fontFamily,
  },
  
  // Link in footer
  footerLink: {
    color: colors.linkText,
    textDecoration: 'none',
  },
  
  // General text styles
  paragraph: {
    fontSize: typography.bodySize,
    lineHeight: typography.bodyLineHeight,
    color: colors.bodyText,
    margin: '0 0 16px 0',
    fontFamily: typography.fontFamily,
  },
  
  subtitle: {
    fontSize: typography.bodySize,
    fontWeight: typography.semibold,
    color: colors.bodyText,
    margin: '0 0 16px 0',
    fontFamily: typography.fontFamily,
  },
  
  link: {
    color: colors.linkText,
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
  },
  
  divider: {
    borderColor: '#e5e7eb',
    margin: '32px 0',
  },
  
  list: {
    marginLeft: '20px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  
  listItem: {
    fontSize: typography.bodySize,
    lineHeight: typography.bulletLineHeight,
    color: colors.bodyText,
    fontFamily: typography.fontFamily,
    marginBottom: '8px',
  },
  
  // Warning box styles (deprecated, but kept for reference)
  warningBox: {
    backgroundColor: '#fef2f2',
    borderRadius: '6px',
    padding: '12px',
    marginTop: '16px',
  },
  
  warningText: {
    color: '#991b1b',
    fontSize: '13px',
    lineHeight: '20px',
    margin: 0,
  },
} as const;

// Logo configuration
export const logoConfig = {
  url: 'https://app.wondrousdigital.com/images/wondrous-logo.png',
  width: '80',
  height: '80',
  alt: 'Wondrous Digital',
} as const;

// URLs
export const urls = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.wondrousdigital.com',
  supportEmail: 'hello@wondrousdigital.com',
} as const;