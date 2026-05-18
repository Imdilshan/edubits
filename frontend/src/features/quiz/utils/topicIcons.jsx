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

  if (normalized.includes("html")) return FileCode2;
  if (normalized.includes("css")) return Code2;
  if (normalized.includes("javascript")) return Braces;
  if (normalized.includes("java")) return Coffee;
  if (normalized.includes("algorithm") || normalized.includes("daa")) return Network;

  return Binary;
}
