export default function NationalityFlag({
  flagUrl,
  country,
  size = "sm",
}: {
  flagUrl: string;
  country?: string;
  size?: "xs" | "sm" | "md";
}) {
  if (!flagUrl) return null;

  const sizes = { xs: "h-3 w-4", sm: "h-4 w-5", md: "h-5 w-7" };

  return (
    <img
      src={flagUrl}
      alt={country ?? "Nationalité"}
      title={country}
      className={`${sizes[size]} shrink-0 rounded-sm object-cover ring-1 ring-white/10`}
    />
  );
}
