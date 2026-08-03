import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
const CustomFieldsPage = lazy(() => import("./features/custom-fields/pages/CustomFieldsPage"));
export default function App() {
  return (
    <Suspense fallback={<div className="page-loader">Loading Custom Fields…</div>}>
      <Routes>
        <Route path="/global-settings/user/custom-fields" element={<CustomFieldsPage />} />
        <Route path="*" element={<Navigate to="/global-settings/user/custom-fields" replace />} />
      </Routes>
    </Suspense>
  );
}
