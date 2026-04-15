"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface PageHeaderContextType {
  title: string;
  setTitle: (title: string) => void;
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(
  undefined,
);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  const [actions, setActions] = useState<ReactNode | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <PageHeaderContext.Provider
      value={{
        title,
        setTitle,
        actions,
        setActions,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
}

export const usePageHeader = () => {
  const context = useContext(PageHeaderContext);
  if (!context)
    throw new Error("usePageHeader must be used within PageHeaderProvider");
  return context;
};
