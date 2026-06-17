import { clsx } from "clsx";
import { useXTheme, type XTheme } from "../context/XThemeContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useHeaderDropdown } from "../context/HeaderDropdownContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { CheckLineIcon } from "../../icons";

const themes: { id: XTheme; label: string; Icon: React.FC<{ className?: string }> }[] = [
  {
    id: "light",
    label: "Clair",
    Icon: ({ className }) => (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2.5zm0 13a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm7.25-2.25a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5zM4.25 12.5a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5zm11.78-5.03a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-9.9 0a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06L5.03 8.53a.75.75 0 010-1.06zm9.9 7.78a.75.75 0 00-1.06 0l-1.06 1.06a.75.75 0 101.06 1.06l1.06-1.06a.75.75 0 000-1.06zm-9.9 0a.75.75 0 00-1.06 1.06l1.06 1.06a.75.75 0 101.06-1.06L6.97 15.28a.75.75 0 00-1.06 0zM10 14.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75z" />
      </svg>
    ),
  },
  {
    id: "dark",
    label: "Slate",
    Icon: ({ className }) => (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M15.98 10.79a6.5 6.5 0 01-7.18-7.18 6.75 6.75 0 107.18 7.18z" />
      </svg>
    ),
  },
  {
    id: "zinc",
    label: "Zinc",
    Icon: ({ className }) => (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.455 2.697A7.5 7.5 0 1012.8 16.3 6.5 6.5 0 017.455 2.697z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function XThemeSwitcher() {
  const { theme, setTheme } = useXTheme();
  const t = useThemeTokens();
  const { isOpen, toggle, close } = useHeaderDropdown();
  const open = isOpen("theme");
  const current = themes.find((th) => th.id === theme) ?? themes[2];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => toggle("theme")}
        className={clsx(
          "dropdown-toggle flex h-10 w-10 items-center justify-center rounded-lg border transition-colors lg:h-11 lg:w-11",
          t.headerIconBtn
        )}
        title="Thème"
      >
        <current.Icon className="size-[18px]" />
      </button>
      <Dropdown
        isOpen={open}
        onClose={close}
        className={clsx("w-44 border p-2", t.headerDropdown)}
      >
        <p className={clsx("px-2 py-1.5 text-xs font-semibold uppercase tracking-wider", t.textMuted)}>
          Apparence
        </p>
        {themes.map((th) => {
          const active = theme === th.id;
          return (
            <button
              key={th.id}
              type="button"
              onClick={() => {
                setTheme(th.id);
                close();
              }}
              className={clsx(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                active ? t.dropdownActive : clsx(t.textSecondary, t.navHover)
              )}
            >
              <th.Icon className="size-4 shrink-0" />
              <span className="flex-1 font-medium">{th.label}</span>
              {active && <CheckLineIcon className="size-4 shrink-0" />}
            </button>
          );
        })}
      </Dropdown>
    </div>
  );
}
