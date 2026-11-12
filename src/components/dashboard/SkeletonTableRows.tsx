type SkelCol = "thumb" | "text" | "sm" | "badge";

const COL_CLASS: Record<SkelCol, string> = {
  thumb: "skel--thumb",
  text: "skel--md",
  sm: "skel--sm",
  badge: "skel--badge",
};

export default function SkeletonTableRows({
  columns,
  rows = 5,
}: {
  columns: SkelCol[];
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {columns.map((col, j) => (
            <td key={j}>
              <span className={`skel ${COL_CLASS[col]}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
