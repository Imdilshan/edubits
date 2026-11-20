const RECENT_KEY = "edubits_recent_activities";

/**
 * Record a new activity in the browser cache (localStorage)
 */
export function recordRecentActivity(item) {
  if (!item || !item.id) return;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((x) => x.id !== item.id && x.href !== item.href);
    const updated = [
      {
        ...item,
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not record recent activity:", e);
  }
}

/**
 * Retrieve recent activities from browser cache.
 * If empty, auto-discovers relevant activities from existing cached data
 * (academic year, saved calculator courses, tracker).
 */
export function getRecentActivities(user) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];

    if (list.length > 0) {
      return list;
    }

    // Auto-discover from browser cache if no direct activity recorded yet
    const discovered = [];
    const cachedYear = localStorage.getItem("edubits_academic_year") || user?.academicYear;
    const cachedProgram = localStorage.getItem("edubits_academic_program") || user?.academicProgram;
    const cachedSubjects = localStorage.getItem("subjects");
    const cachedCgpa = localStorage.getItem("semHistory");
    const cachedTracker = localStorage.getItem("ug_life_tracker");

    if (cachedYear) {
      discovered.push({
        id: `year-${cachedYear}`,
        type: "resource",
        title: `${cachedYear} PYQs & Notes`,
        subtitle: cachedProgram ? `${cachedProgram.toUpperCase()} curriculum resources` : "Subject papers & study notes",
        href: `/resources/${encodeURIComponent(cachedYear)}`,
        icon: "Layers",
        badge: "Your Year",
        timestamp: Date.now() - 1000 * 60 * 25,
      });
    }

    discovered.push({
      id: "res-cn",
      type: "resource",
      title: "Computer Networks",
      subtitle: "3rd Year • PYQs & Solutions",
      href: "/resources/3rd%20Year/Computer%20Networks",
      icon: "Layers",
      badge: "Recent",
      timestamp: Date.now() - 1000 * 60 * 45,
    });

    discovered.push({
      id: "quiz-html",
      type: "quiz",
      title: "HTML Fundamentals",
      subtitle: "QuizEngine • Viva Practice",
      href: "/quizzes/6ad9f06bb89b42e0a84593e4",
      icon: "BrainCircuit",
      badge: "Quiz",
      timestamp: Date.now() - 1000 * 60 * 120,
    });

    if (cachedSubjects) {
      discovered.push({
        id: "tool-sgpa",
        type: "tool",
        title: "SGPA Course Plan",
        subtitle: "Saved semester grade tracker",
        href: "/tasks?tab=sgpa",
        icon: "GraduationCap",
        badge: "Saved",
        timestamp: Date.now() - 1000 * 60 * 180,
      });
    }

    if (cachedCgpa) {
      discovered.push({
        id: "tool-cgpa",
        type: "tool",
        title: "CGPA Projection",
        subtitle: "Calculated semester history",
        href: "/tasks?tab=cgpa",
        icon: "GraduationCap",
        badge: "Calculator",
        timestamp: Date.now() - 1000 * 60 * 240,
      });
    }

    if (cachedTracker) {
      discovered.push({
        id: "tool-tracker",
        type: "tool",
        title: "UG Life Tracker",
        subtitle: "Active student tasks & habits",
        href: "/tasks?tab=todos",
        icon: "ClipboardList",
        badge: "Tracker",
        timestamp: Date.now() - 1000 * 60 * 300,
      });
    }

    return discovered.slice(0, 4);
  } catch (e) {
    console.warn("Could not retrieve recent activities:", e);
    return [];
  }
}

/**
 * Format relative timestamp string
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return "Recently";
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return "Recently";
}
