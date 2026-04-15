"use client";

import { usePageHeader } from "@/context/PageHeaderContext";
import TimetableView from "./_components/TimetableView";
import { TimetableProvider } from "./context/TimetableContext";
import { useEffect } from "react";
import ButtonGroupHeader from "./_components/ButtonGroupHeader";

export default function TimetablePage() {
  // const { setTitle, setActions } = usePageHeader();

  // useEffect(() => {
  //   setTitle("Grade de Atribuições");
  //   // Aqui passamos os botões que antes estavam na ActionBar
  //   setActions(
  //     <ButtonGroupHeader
  //       onExecute={() => {}}
  //       onClean={() => {}}
  //       download={() => {}}
  //       saveAlterations={() => {}}
  //     />,
  //   );

  //   // Limpa ao sair da página
  //   return () => {
  //     setTitle("");
  //     setActions(null);
  //   };
  // }, [setTitle, setActions]);

  return (
    <TimetableProvider>
      <TimetableView />
    </TimetableProvider>
  );
}
