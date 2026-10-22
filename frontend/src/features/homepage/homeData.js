import { Layers, BrainCircuit, GraduationCap, ClipboardList, Code } from "lucide-react";

export const featuredTools = [
  {
    href: "/resources",
    icon: Layers,
    name: "Resources",
    desc: "Notes, PYQs & Playlists",
  },
  {
    href: "/quizzes",
    icon: BrainCircuit,
    name: "QuizEngine",
    desc: "NPTEL Prep & College Viva",
  },
];

export const otherTools = [
  {
    href: "/sgpa",
    icon: GraduationCap,
    name: "GPA Calculator",
    desc: "Calculate SGPA & CGPA",
  },
  {
    href: "/internal",
    icon: ClipboardList,
    name: "Internal Marks Calculator",
    desc: "Calculate internal marks for each subject",
  },
];

export const proofStats = [
  { value: "725+", label: "students using Edubits" },
  { value: "5.5K+", label: "page views in the last 30 days" },
];

export const features = [
  {
    id: "resources",
    eyebrow: "Resources",
    title: "Every paper, note and playlist in one place",
    desc: "Previous year papers with and without solutions, plus notes and playlists, sorted by year and subject.",
    image: "/images/landing/resources.png",
    alt: "Edubits Resources page",
  },
  {
    id: "quizzes",
    eyebrow: "QuizEngine",
    title: "Practice for NPTEL and college viva",
    desc: "Take quizzes by topic, review your results and history, and see where you rank on the leaderboard.",
    image: "/images/landing/quizengine.png",
    alt: "Edubits QuizEngine page",
  },
];