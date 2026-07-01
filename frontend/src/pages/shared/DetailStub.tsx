import { Link } from "react-router";
import PageStack from "../../components/common/PageStack";
import GlassCard from "../../components/common/GlassCard";
import Button from "../../components/common/Button";

interface DetailStubProps {
  backTo: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export default function DetailStub({
  backTo,
  backLabel = "Retour",
  children,
}: DetailStubProps) {
  return (
    <PageStack>
      <Link to={backTo}>
        <Button variant="secondary" className="w-fit">
          ← {backLabel}
        </Button>
      </Link>
      {children ?? (
        <GlassCard>
          <p className="text-sm opacity-70">
            Page de détail — prototype mockup. Les formulaires de modification
            sont disponibles via les modals sur la page liste.
          </p>
        </GlassCard>
      )}
    </PageStack>
  );
}
