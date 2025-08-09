"use client";

import TimetableView from "./_components/TimetableView";
import { TimetableProvider } from "./context/TimetableContext";

export default function TimetablePage() {
  return (
    <TimetableProvider>
      <TimetableView />
    </TimetableProvider>
  );
}
