import { clsx } from "clsx";
import { useSeasonData } from "../context/SeasonContext";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useHeaderDropdown } from "../context/HeaderDropdownContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { CalenderIcon, CheckLineIcon } from "../../icons";

export default function SeasonSwitcher() {
  const { season, seasons, setSeasonId } = useSeasonData();
  const t = useThemeTokens();
  const { isOpen, toggle, close } = useHeaderDropdown();
  const open = isOpen("season");

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => toggle("season")}
        className={clsx(
          "dropdown-toggle flex h-10 max-w-[220px] items-center gap-2 rounded-lg border px-3 text-left transition-colors lg:h-11",
          t.headerIconBtn
        )}
        title="Changer de saison"
      >
        <CalenderIcon className="size-4 shrink-0 opacity-70" />
        <span className={clsx("min-w-0 flex-1 truncate text-sm font-medium", t.textPrimary)}>
          {season.name.replace("Saison ", "")}
        </span>
        <svg className={clsx("size-4 shrink-0 opacity-50", open && "rotate-180")} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      <Dropdown
        isOpen={open}
        onClose={close}
        className={clsx("w-64 border p-2", t.headerDropdown)}
      >
        <p className={clsx("px-2 py-1.5 text-xs font-semibold uppercase tracking-wider", t.textMuted)}>
          Saison active
        </p>
        {seasons.map((s) => {
          const active = s.id === season.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSeasonId(s.id);
                close();
              }}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                active ? t.dropdownActive : clsx(t.textSecondary, t.navHover)
              )}
            >
              <CalenderIcon className="size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.name}</p>
                <p className={clsx("text-xs", t.textMuted)}>
                  {s.status === "active" ? "En cours" : "Terminée"}
                </p>
              </div>
              {active && <CheckLineIcon className="size-4 shrink-0" />}
            </button>
          );
        })}
      </Dropdown>
    </div>
  );
}
