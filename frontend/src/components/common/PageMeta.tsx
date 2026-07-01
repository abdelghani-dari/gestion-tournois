import { Helmet, HelmetProvider } from "react-helmet-async";
import { APP_NAME } from "../../config/app";

export function XPageMeta({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Helmet>
      <title>{title} | {APP_NAME}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}

export function XAppWrapper({ children }: { children: React.ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
