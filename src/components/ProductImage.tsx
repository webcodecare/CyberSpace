import type { CategoryId } from "@/data/catalog";

const INK = "var(--navy)";
const SOFT = "var(--blue-soft)";

function Art({ category }: { category: CategoryId }) {
  switch (category) {
    case "servers":
      return (
        <g>
          {[40, 66, 92].map((y) => (
            <g key={y}>
              <rect
                x="30"
                y={y}
                width="140"
                height="20"
                rx="2"
                fill={SOFT}
                stroke={INK}
                strokeWidth="2"
              />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect
                  key={i}
                  x={40 + i * 9}
                  y={y + 6}
                  width="6"
                  height="8"
                  fill={INK}
                  opacity=".55"
                />
              ))}
              <circle cx="154" cy={y + 10} r="3" fill="var(--green)" />
            </g>
          ))}
        </g>
      );
    case "networking":
      return (
        <g>
          <rect
            x="20"
            y="56"
            width="160"
            height="30"
            rx="3"
            fill={SOFT}
            stroke={INK}
            strokeWidth="2"
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={30 + i * 11.5} y={64} width="8" height="9" fill={INK} opacity=".6" />
          ))}
          <path
            d="M60 56V38M100 56V30M140 56V38"
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="34" r="4" fill="var(--blue-bright)" />
          <circle cx="100" cy="26" r="4" fill="var(--blue-bright)" />
          <circle cx="140" cy="34" r="4" fill="var(--blue-bright)" />
        </g>
      );
    case "security":
      return (
        <g>
          <path
            d="M100 24 148 40v32c0 26-20 42-48 52-28-10-48-26-48-52V40z"
            fill={SOFT}
            stroke={INK}
            strokeWidth="2.5"
          />
          <path
            d="m80 72 15 15 28-30"
            fill="none"
            stroke="var(--blue-bright)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "computers":
      return (
        <g>
          <rect
            x="45"
            y="30"
            width="110"
            height="72"
            rx="4"
            fill={SOFT}
            stroke={INK}
            strokeWidth="2.5"
          />
          <rect x="53" y="38" width="94" height="56" fill="var(--navy)" opacity=".9" />
          <path d="M28 110h144l-8 10H36z" fill={INK} opacity=".8" />
        </g>
      );
    case "storage":
      return (
        <g>
          <rect
            x="30"
            y="34"
            width="140"
            height="78"
            rx="3"
            fill={SOFT}
            stroke={INK}
            strokeWidth="2"
          />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3, 4].map((c) => (
              <rect
                key={`${r}${c}`}
                x={38 + c * 26}
                y={42 + r * 17}
                width="22"
                height="12"
                rx="1.5"
                fill="none"
                stroke={INK}
                strokeWidth="1.6"
              />
            )),
          )}
        </g>
      );
    case "software":
      return (
        <g>
          <path d="M62 36h76l10 14v62H52V50z" fill={SOFT} stroke={INK} strokeWidth="2.5" />
          <rect x="66" y="62" width="68" height="34" fill="var(--blue-bright)" />
          <path d="M100 68v22M89 79h22" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "printing":
      return (
        <g>
          <rect x="62" y="28" width="76" height="30" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <rect
            x="36"
            y="56"
            width="128"
            height="46"
            rx="5"
            fill={SOFT}
            stroke={INK}
            strokeWidth="2.5"
          />
          <rect x="62" y="86" width="76" height="30" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <circle cx="148" cy="68" r="3.5" fill="var(--green)" />
        </g>
      );
    default:
      return (
        <g>
          <path
            d="M100 30c24 0 38 16 38 40v22c0 20-16 32-38 32s-38-12-38-32V70c0-24 14-40 38-40z"
            fill={SOFT}
            stroke={INK}
            strokeWidth="2.5"
          />
          <path d="M100 30v34M62 70h76" stroke={INK} strokeWidth="2.5" />
        </g>
      );
  }
}

export default function ProductImage({
  category,
  label,
}: {
  category: CategoryId;
  label?: string;
}) {
  return (
    <svg
      className="pimg"
      viewBox="0 0 200 140"
      role="img"
      aria-label={label ?? category}
      preserveAspectRatio="xMidYMid meet"
    >
      <Art category={category} />
    </svg>
  );
}
