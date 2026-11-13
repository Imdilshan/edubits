import { Outlet } from "react-router-dom";
import { useProgress } from "./hooks/useProgress";
import ResourcesProgressContext from "./resourcesProgressContext";

export default function ResourcesLayout() {
  const progress = useProgress();
  return (
    <ResourcesProgressContext.Provider value={progress}>
      <Outlet />
    </ResourcesProgressContext.Provider>
  );
}
