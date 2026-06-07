import { Route } from "react-router";
import XAppLayout from "../components/layout/AppLayout";

export const appRoutes = (
  <>
    <Route index element={<div>Landing Page</div>} />
    <Route element={<XAppLayout />}>
      <Route path="dashboard" element={<div>Dashboard Page</div>} />
      <Route path="tournaments" element={<div>Tournaments Page</div>} />
    </Route>
  </>
);