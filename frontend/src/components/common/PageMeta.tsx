import { Helmet, HelmetProvider } from "react-helmet-async";

export function XPageMeta({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Helmet>
      <title>{title} | Gestion Tournois</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}

export function XAppWrapper({ children }: { children: React.ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
