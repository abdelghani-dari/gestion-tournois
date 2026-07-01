import { clsx } from "clsx";
import {
  accountRoleLabel,
  ACCOUNT_ROLE_COLORS,
  resolveAccountType,
  type AccountType,
} from "./userRoleTheme";
import type { UserAvatarSource } from "./userAvatarAssets";

type RoleBadgeProps = {
  user?: UserAvatarSource | null;
  type?: AccountType;
  className?: string;
  size?: "sm" | "md";
};

export default function RoleBadge({ user, type, className, size = "md" }: RoleBadgeProps) {
  const accountType = type ?? resolveAccountType(user);
  const colors = ACCOUNT_ROLE_COLORS[accountType];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
      style={{
        color: colors.main,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.ring}`,
      }}
    >
      {accountRoleLabel(accountType)}
    </span>
  );
}
