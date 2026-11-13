import {
  Binary,
  Braces,
  Code2,
  Coffee,
  FileCode2,
  Network,
} from "lucide-react";

export function getTopicIcon(name = "") {
  const normalized = name.toLowerCase();
  const props = { size: 25, strokeWidth: 2.2 };

  if (normalized.includes("html")) return <FileCode2 {...props} />;
  if (normalized.includes("css")) return <Code2 {...props} />;
  if (normalized.includes("javascript")) return <Braces {...props} />;
  if (normalized.includes("java")) return <Coffee {...props} />;
  if (normalized.includes("algorithm") || normalized.includes("daa")) return <Network {...props} />;

  return <Binary {...props} />;
}
