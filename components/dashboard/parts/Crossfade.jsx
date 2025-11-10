import { useEffect, useState } from "react";
export default function Crossfade({ keyProp, children }) {
  const [show, setShow] = useState(true);
  const [slot, setSlot] = useState(children);
  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => {
      setSlot(children);
      setShow(true);
    }, 120);
    return () => clearTimeout(t);
  }, [keyProp]);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <div
      className={`transition-opacity duration-200`}
      style={{ opacity: reduced ? 1 : show ? 1 : 0 }}
    >
      {slot}
    </div>
  );
}
