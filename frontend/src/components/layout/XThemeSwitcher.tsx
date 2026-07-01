import { clsx } from "clsx";
import { useXTheme, type XTheme } from "../context/XThemeContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useHeaderDropdown } from "../context/HeaderDropdownContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Sun, Moon, Contrast } from "lucide-react";
import { CheckLineIcon } from "../../icons";

const themes: { id: XTheme; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "light", label: "Clair", Icon: ({ className }) => <Sun className={className} /> },
  { id: "dark", label: "Slate", Icon: ({ className }) => <Contrast className={className} /> },
  { id: "zinc", label: "Zinc", Icon: ({ className }) => <Moon className={className} /> },
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
          "dropdown-toggle flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
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
