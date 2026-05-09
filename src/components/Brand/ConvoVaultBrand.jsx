import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import convoVaultLogo from "@/assets/ConvoVault_transparent_logo.png";

/** Width of text content, ignoring stretched block layout (e.g. w-full when stacked). */
function getIntrinsicTextWidth(element) {
  if (!element || element.childNodes.length === 0) return 0;
  const range = document.createRange();
  range.selectNodeContents(element);
  const { width } = range.getBoundingClientRect();
  return width;
}

function ConvoVaultBrand({ className }) {
  const brandRowRef = useRef(null);
  const logoImgRef = useRef(null);
  const brandTextRef = useRef(null);
  const [stackBrand, setStackBrand] = useState(false);

  const updateBrandLayout = useCallback(() => {
    const row = brandRowRef.current;
    const img = logoImgRef.current;
    const text = brandTextRef.current;
    if (!row || !img || !text) return;

    const gapRaw = getComputedStyle(row).gap;
    const gapPx = Number.parseFloat(gapRaw);
    const gap = Number.isFinite(gapPx) ? gapPx : 12;

    const rowWidth = row.clientWidth;
    const imgWidth = img.getBoundingClientRect().width;
    const textWidth = getIntrinsicTextWidth(text);

    setStackBrand(imgWidth + gap + textWidth > rowWidth + 0.5);
  }, []);

  useEffect(() => {
    const row = brandRowRef.current;
    if (!row) return;

    updateBrandLayout();
    const ro = new ResizeObserver(updateBrandLayout);
    ro.observe(row);

    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) updateBrandLayout();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [updateBrandLayout]);

  return (
    <div
      ref={brandRowRef}
      className={cn(
        "mb-4 flex w-full min-w-0 gap-3",
        stackBrand ? "flex-col items-center" : "flex-row items-center",
        className,
      )}
    >
      <img
        ref={logoImgRef}
        src={convoVaultLogo}
        alt=""
        className="h-32 w-auto shrink-0 object-contain"
        onLoad={updateBrandLayout}
      />
      <span
        ref={brandTextRef}
        className={cn(
          "whitespace-nowrap text-xl font-semibold tracking-tight text-foreground",
          stackBrand && "w-full text-center",
        )}
      >
        ConvoVault
      </span>
    </div>
  );
}

export default ConvoVaultBrand;
