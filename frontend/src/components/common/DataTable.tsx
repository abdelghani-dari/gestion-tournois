import { clsx } from "clsx";
import GlassCard from "./GlassCard";
import { useThemeTokens } from "../theme/useThemeTokens";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  emptyMessage = "Aucune donnée disponible",
}: DataTableProps<T>) {
  const t = useThemeTokens();

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="x-scroll overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className={clsx("border-b", t.border, t.tableHead)}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider md:px-6",
                    col.className ?? ""
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={clsx("divide-y", t.tableDivide)}>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={clsx("px-6 py-10 text-center text-sm", t.textMuted)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className={clsx("transition-colors", t.tableRow)}>
                  {columns.map((col) => (
                    <td key={col.key} className={clsx("px-4 py-3.5 text-sm md:px-6", col.className ?? "")}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
