import { createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import { useProgress } from "./hooks/useProgress";

const ResourcesProgressContext = createContext(null);

export function useResourcesProgress() {
  const value = useContext(ResourcesProgressContext);
  if (!value) throw new Error("useResourcesProgress must be used inside ResourcesLayout");
  return value;
}

export default function ResourcesLayout() {
  const progress = useProgress();
  return (
    <ResourcesProgressContext.Provider value={progress}>
      <Outlet />
    </ResourcesProgressContext.Provider>
  );
}
