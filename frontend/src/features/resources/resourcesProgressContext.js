import { createContext, useContext } from "react";

const ResourcesProgressContext = createContext(null);

export function useResourcesProgress() {
  const value = useContext(ResourcesProgressContext);
  if (!value) throw new Error("useResourcesProgress must be used inside ResourcesLayout");
  return value;
}

export default ResourcesProgressContext;
