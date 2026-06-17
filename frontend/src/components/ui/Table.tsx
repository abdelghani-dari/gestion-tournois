import type { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

const Table = ({ children, className }: TableProps) => (
  <table className={`min-w-full ${className ?? ""}`}>{children}</table>
);

const TableHeader = ({ children, className }: TableProps) => (
  <thead className={className}>{children}</thead>
);

const TableBody = ({ children, className }: TableProps) => (
  <tbody className={className}>{children}</tbody>
);

const TableRow = ({ children, className }: TableProps) => (
  <tr className={className}>{children}</tr>
);

const TableCell = ({
  children,
  isHeader = false,
  className,
}: {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
}) => {
  const Tag = isHeader ? "th" : "td";
  return <Tag className={className}>{children}</Tag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
