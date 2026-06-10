import { Link } from "react-router";

const variants = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-400",
};

export default function Alert({
  variant,
  title,
  message,
  showLink,
  linkHref = "#",
  linkText = "En savoir plus",
}: {
  variant: keyof typeof variants;
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}) {
  return (
    <div className={`rounded-md border p-4 ${variants[variant]}`}>
      <h4 className="mb-1 text-sm font-semibold text-white">{title}</h4>
      <p className="text-sm text-slate-400">{message}</p>
      {showLink && (
        <Link to={linkHref} className="mt-2 inline-block text-sm font-medium text-brand-400 hover:text-brand-300">
          {linkText}
        </Link>
      )}
    </div>
  );
}
