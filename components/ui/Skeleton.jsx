// /components/ui/Skeleton.jsx
export default function Skeleton({
  className = "",
  lines = 1,
  rounded = "md",
}) {
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "xl"
      ? "rounded-xl"
      : "rounded-md";

  // Render multiple shimmer lines if lines > 1
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 w-full bg-[var(--card-800)] ${radius}`} />
      ))}
    </div>
  );
}
