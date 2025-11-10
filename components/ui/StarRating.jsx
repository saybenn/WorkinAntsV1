// /components/ui/StarRating.jsx
export default function StarRating({ value = 0, size = 16 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const star = (type, i) => (
    <span key={type + i} style={{ fontSize: size, lineHeight: 1 }}>
      {type === "full" ? "★" : type === "half" ? "☆" : "☆"}
    </span>
  );
  return (
    <span aria-label={`${value} out of 5`}>
      {Array.from({ length: full }).map((_, i) => star("full", i))}
      {half ? star("half", 0) : null}
      {Array.from({ length: empty }).map((_, i) => star("empty", i))}
    </span>
  );
}
