import { clsx } from "clsx";
import { resolveUserAvatar, type UserAvatarSource } from "./userAvatarAssets";
import { ACCOUNT_ROLE_COLORS, resolveAccountType } from "./userRoleTheme";

type UserAvatarProps = {
  user?: UserAvatarSource | null;
  name?: string;
  className?: string;
  /** Show a colored ring matching the account role */
  showRoleRing?: boolean;
};

export default function UserAvatar({ user, name, className, showRoleRing = false }: UserAvatarProps) {
  const displayName = name ?? (user && "name" in user ? String((user as { name?: string }).name ?? "Utilisateur") : "Utilisateur");
  const accountType = resolveAccountType(user);
  const ringColor = ACCOUNT_ROLE_COLORS[accountType].ring;

  return (
    <div
      className={clsx("relative shrink-0 overflow-hidden rounded-full", className)}
      style={showRoleRing ? { boxShadow: `0 0 0 2px ${ringColor}` } : undefined}
    >
      <img
        src={resolveUserAvatar(user)}
        alt={displayName}
        className="h-full w-full scale-110 object-cover"
      />
    </div>
  );
}
