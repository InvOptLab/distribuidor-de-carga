"use client";

import { Suspense } from "react";
import CompareView from "./CompareView";

// useSearchParams exige um limite de Suspense
export default function CompararSolucoes() {
  return (
    <Suspense fallback={null}>
      <CompareView />
    </Suspense>
  );
}
