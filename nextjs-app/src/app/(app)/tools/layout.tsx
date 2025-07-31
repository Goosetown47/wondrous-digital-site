export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Access control is handled by middleware
  return <>{children}</>;
}