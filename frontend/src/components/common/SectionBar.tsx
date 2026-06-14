interface SectionBarProps {
  children?: React.ReactNode;
  action?: React.ReactNode;
}

/** Horizontal toolbar: tabs/filters on the left, action button on the right. */
export default function SectionBar({ children, action }: SectionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {children && <div className="flex flex-wrap items-center gap-4">{children}</div>}
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}
