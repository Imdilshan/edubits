import { useState, useEffect, useRef } from "react";
import "./pyqs.css";

import { Folder, BookOpen, Star, Trash2, FileText, Image, FileQuestion, Search } from "lucide-react";
import { FolderOpen } from "lucide-react";
import { ArrowLeft, Home } from "lucide-react";


const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const esc  = (s) => String(s ?? "");
const STORAGE_KEY = "edubits_local_pyqs";
const STARS_KEY   = "edubits_pyq_stars";

const SEED = [
  {
    id: uid(),
    question: "Explain asymptotic notations (Big-O, Big-Theta, Big-Omega) with examples.",
    subject: "DAA",
    year: "2023",
    topic: "Complexity Analysis",
    marks: "10",
    answer: "Big-O gives upper bound, Big-Omega lower bound, Big-Theta tight bound. Example: f(n)=3n^2+2n → O(n^2).",
    starred: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: uid(),
    question: "Solve recurrence T(n) = 2T(n/2) + n using Master Theorem.",
    subject: "DAA",
    year: "2022",
    topic: "Recurrence",
    marks: "5",
    answer: "a=2, b=2 → n^log_b(a)=n → case 2 → T(n)=O(n log n).",
    starred: false,
    createdAt: Date.now() - 200000000,
  },
  {
    id: uid(),
    question: "Compare arrays and linked lists with advantages and disadvantages.",
    subject: "DAA",
    year: "2023",
    topic: "Data Structures",
    marks: "10",
    answer: "Arrays are contiguous, fast access. Linked lists are dynamic but slower access.",
    starred: false,
    createdAt: Date.now() - 150000000,
  },
  {
    id: uid(),
    question: "Explain Quick Sort with time complexity analysis.",
    subject: "DAA",
    year: "2023",
    topic: "Divide & Conquer",
    marks: "10",
    answer: "Divide using pivot, recursively sort. Avg: O(n log n), Worst: O(n^2).",
    starred: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: uid(),
    question: "Explain Merge Sort and its advantages over Quick Sort.",
    subject: "DAA",
    year: "2022",
    topic: "Divide & Conquer",
    marks: "10",
    answer: "Merge sort is stable and guarantees O(n log n), but uses extra space.",
    starred: false,
    createdAt: Date.now() - 300000000,
  },
  {
    id: uid(),
    question: "Solve Fractional Knapsack using greedy method.",
    subject: "DAA",
    year: "2023",
    topic: "Greedy",
    marks: "5",
    answer: "Sort items by value/weight ratio and pick highest first.",
    starred: true,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: uid(),
    question: "Explain Prim’s and Kruskal’s algorithm for Minimum Spanning Tree.",
    subject: "DAA",
    year: "2022",
    topic: "Greedy",
    marks: "10",
    answer: "Prim grows MST from a node; Kruskal adds smallest edges avoiding cycles.",
    starred: false,
    createdAt: Date.now() - 400000000,
  },
  {
    id: uid(),
    question: "Explain 0/1 Knapsack using Dynamic Programming.",
    subject: "DAA",
    year: "2023",
    topic: "DP",
    marks: "5",
    answer: "Use DP table dp[i][w] storing max value for i items and weight w.",
    starred: true,
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: uid(),
    question: "Explain Longest Common Subsequence (LCS) problem.",
    subject: "DAA",
    year: "2022",
    topic: "DP",
    marks: "10",
    answer: "Find longest subsequence common to two strings using DP.",
    starred: false,
    createdAt: Date.now() - 500000000,
  },
  {
    id: uid(),
    question: "Explain N-Queens problem using backtracking.",
    subject: "DAA",
    year: "2023",
    topic: "Backtracking",
    marks: "10",
    answer: "Place queens row by row ensuring no conflicts in column/diagonal.",
    starred: true,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: uid(),
    question: "Explain BFS and DFS with differences.",
    subject: "DAA",
    year: "2023",
    topic: "Graphs",
    marks: "10",
    answer: "BFS uses queue (level order), DFS uses stack/recursion.",
    starred: true,
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: uid(),
    question: "Explain Dijkstra’s algorithm for shortest path.",
    subject: "DAA",
    year: "2022",
    topic: "Graphs",
    marks: "10",
    answer: "Greedy approach selecting minimum distance node each time.",
    starred: false,
    createdAt: Date.now() - 600000000,
  },
  {
    id: uid(),
    question: "Explain Floyd Warshall algorithm.",
    subject: "DAA",
    year: "2023",
    topic: "Graphs",
    marks: "10",
    answer: "DP approach for all-pairs shortest paths.",
    starred: false,
    createdAt: Date.now() - 700000000,
  },
  {
    id: uid(),
    question: "What are P, NP, NP-Complete problems? Give examples.",
    subject: "DAA",
    year: "2023",
    topic: "Complexity",
    marks: "10",
    answer: "P = solvable in polynomial time, NP = verifiable, NP-complete = hardest problems.",
    starred: true,
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: uid(),
    question: "Explain KMP string matching algorithm.",
    subject: "DAA",
    year: "2022",
    topic: "String Matching",
    marks: "10",
    answer: "Uses LPS array to avoid rechecking characters.",
    starred: false,
    createdAt: Date.now() - 800000000,
  },
  {
    id: uid(),
    question: "Explain Euclid’s algorithm for GCD.",
    subject: "DAA",
    year: "2023",
    topic: "Misc",
    marks: "5",
    answer: "GCD(a,b) = GCD(b, a % b) until b=0.",
    starred: false,
    createdAt: Date.now() - 900000000,
  },

];


const emptyForm = { question: "", subject: "", year: "", topic: "", marks: "", answer: "" };

// ─── Class Bank Component ─────────────────────────────────────────
//
// HOW TO ADD YOUR OWN PAPERS:
//
// 1. Upload your PDF/image to Google Drive
//    → Right-click → "Share" → "Anyone with the link can view"
//    → Copy the link. It looks like: https://drive.google.com/file/d/FILE_ID/view
//    → Set type: "pdf" and url: "https://drive.google.com/file/d/FILE_ID/preview"
//
// 2. Or upload an image (JPG/PNG) anywhere (Imgur, GitHub, etc.)
//    → Set type: "image" and url: the direct image URL
//
// 3. Add an entry to PAPER_SOURCES below and redeploy.
//

const PAPER_SOURCES=[
  {
    year: "1st Year",
    subjects:[
      {
        subject: "Mathematics",
        papers: [
          {
            id: "math-2023-mid",
            title: "Mid Sem 2023",
            type: "questions",
            questions: []
          }
        ]
      }
    ]
  },

  {
    year: "2nd Year",
    subjects: [
      {
        subject: "COA",
        papers: [
          {
            id: "coa-2022",
            title: "Practice 0",
            type: "pdf",
            url: "https://drive.google.com/file/d/1uDjwVvsbKiJA9PgOTaVfzvHfwsQrCmJ8/preview"
          },
          {
            id: "coa-2024",
            title: "Practice 1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1MZvRTq6k1Lqm42U1MEr7LK-VWWzSGPzA/preview"
          },
          {
            id: "coa-2025",
            title: "Practice 2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1tluGNXvQpey4jKaZQFfhEHfrRboqbszd/preview"
          },
          {
            id: "coa-2025",
            title: "Practice 3",
            type: "pdf",
            url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview"
          },
          {
            id: "coa-2025",
            title: "Practice 4",
            type: "pdf",
            url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview"
          },
          {
            id: "coa-2025",
            title: "Practice 5",
            type: "pdf",
            url: "https://drive.google.com/file/d/18XKNGn-THu2wY-D7HOo5CqQwjf4JLeFO/preview"
          },
        ]
      },
      {
        subject: "Software Engineering",
        papers: [
          {
            id: "se-2022",
            title: "Practice 0",
            type: "pdf",
            url: "https://drive.google.com/file/d/1pJDM_KSEQ1LHwz_UzBWVvNXcnFUqQZQq/preview"
          },
          {
            id: "se-2022",
            title: "Practice 1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1R_QhIPBYq1ZArm-eLCWSNLKkmcnGHYKR/preview"
          },
          {
            id: "se-2022",
            title: "Practice 2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1HIR21u97EsUwdS_OYo90S_1v2IugH55J/preview"
          },
          {
            id: "se-2023",
            title: "Practice 3",
            type: "pdf",
            url: "https://drive.google.com/file/d/19mdIZ9ywBlvGKHLnePq2RTTKE_RX58Px/preview"
          },
          {
            id: "se-2024",
            title: "Practice 4",
            type: "pdf",
            url: "https://drive.google.com/file/d/1nLLO_IjC9bg_V2eoQBe0233sGiLY7afo/preview"
          },
          {
            id: "se-2024",
            title: "Practice 5",
            type: "pdf",
            url: "https://drive.google.com/file/d/1a9JYBJVNxovUmfgzTKDeLg8o-YszreKx/preview"
          },
          {
            id: "se-2024",
            title: "Practice 6",
            type: "pdf",
            url: "https://drive.google.com/file/d/1d3l8mUn9-mAxc1c72cgSA20KPH1Dvf4E/preview"
          }
        ]
      },
      {
        subject: "Operating System",
        papers: [
          {
            id: "os-2022",
            title: "Practice 0",
            type: "pdf",
            url: "https://drive.google.com/file/d/1ibJ2ZWG07kPhpM2LU4chLAjGlL3Oa9G0/preview"
          },
          {
            id: "os-2022",
            title: "Practice 1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1c5EMRXj_LgBRUlRNhWuVGzEPMIVpYYE5/preview"
          },
          {
            id: "os-2022",
            title: "Practice 2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1sB0qONnGQyWnVJ_o6qE8VKZp3P3WvwSh/preview"
          },
          {
            id: "os-2022",
            title: "Practice 3",
            type: "pdf",
            url: "https://drive.google.com/file/d/13qidPE9bYiAV_a_8l7YvlwtQ4TmkqlSE/preview"
          },
          {
            id: "os-2023",
            title: "Practice 4",
            type: "pdf",
            url: "https://drive.google.com/file/d/1dC1ZwltNWd-7ovYM_hZTEsqF8J8z_SXV/preview"
          },
          {
            id: "os-2023",
            title: "Practice 5",
            type: "pdf",
            url: "https://drive.google.com/file/d/1VxjuTujtJ58PeuNHFXrRX_3fHSz4gQvm/preview"
          },
          {
            id: "os-2023",
            title: "Practice 6",
            type: "pdf",
            url: "https://drive.google.com/file/d/1U3_WL0hT1MzuOuGafpzIZnLzEov9MRVu/preview"
          }
        ]
      },
      {
        subject: "DAA",
        papers: [
          {
            id: "daa-2023",
            title: "Practice 0",
            type: "pdf",
            url: "https://drive.google.com/file/d/1znMw3Ve4W4oDl3Vf4UYsjiGk2pz4aQkn/preview"
          },
          {
            id: "daa-2023",
            title: "Practice 1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1bc6iNabOnpnVXRqXGmkGpQ7IEhWL1ylQ/preview"
          },
          {
            id: "daa-2024",
            title: "Practice 2",
            type: "pdf",
            url: "https://drive.google.com/file/d/13uQsoRoDsmP2Lvo_ktQH5GxW_eJ_zI8w/preview"
          },
          {
            id: "daa-2024",
            title: "Practice 3",
            type: "pdf",
            url: "https://drive.google.com/file/d/1-LSsXZPLpzim7xwRAVECGbzQMZFVkfta/preview"
          },
          {
            id: "daa-2025",
            title: "Practice 4",
            type: "pdf",
            url: "https://drive.google.com/file/d/1o8mupEYR7D_JGPrVwlhtpkPtcOE8l2fj/preview"
          },
          {
            id: "daa-2025",
            title: "Practice 5",
            type: "pdf",
            url: "https://drive.google.com/file/d/1gTwV6kOFFsOxxVzrYdvh1iHpWJiZcjFw/preview"
          },
          {
            id: "daa-2025",
            title: "Practice 6",
            type: "pdf",
            url: "https://drive.google.com/file/d/17s5yiB5v2mD7MRirNE-QVR7dxW3EH97b/preview"
          },
          {
            id: "daa-2025",
            title: "Practice 7",
            type: "pdf",
            url: "https://drive.google.com/file/d/1JBF1TEgivsa0zPPDa50fCX0Nepp5D3NW/preview"
          }
        ]
      },
      {
        subject: "Java",
        papers: [
          {
            id: "java-2023",
            title: "Practice 0",
            type: "pdf",
            url: "https://drive.google.com/file/d/1OpVDi58n9svRTlENe52f0f6K1renT3h9/preview"
          },
          {
            id: "java-2023",
            title: "Practice 1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1U8gHgZDSz0QXi8mhsuOMXBsyrpPutw1d/preview"
          },
          {
            id: "java-2024",
            title: "Practice 2",
            type: "pdf",
            url: "https://drive.google.com/file/d/16HxigLF5npg1umcBShN67_R3IhXNkBVh/preview"
          },
          {
            id: "java-2024",
            title: "Practice 3",
            type: "pdf",
            url: "https://drive.google.com/file/d/16Ywzd3EMTsLiuWowS_I-Ij4EvQWw2xXJ/preview"
          },
          {
            id: "java-2024",
            title: "Practice 4",
            type: "pdf",
            url: "https://drive.google.com/file/d/1mkGH3kYWVWrlXIeNdd-2rIImEtEOynDU/preview"
          },
          {
            id: "java-2025",
            title: "Practice 5",
            type: "pdf",
            url: "https://drive.google.com/file/d/1M-JH-3kbRj-8iXT5dOmPwOczBPMCnD9N/preview"
          },
        ]
      },
      {
        subject: "Machine Learning",
        papers: [
          {
            id: "ml-2022",
            title: "Practice 0",
            type: "pdf",
            url: "https://drive.google.com/file/d/1Xmg5pZTivaf1kV0MFZji-tctGyzvVAu1/preview"
          },
          {
            id: "ml-2023",
            title: "Practice 1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1neFnvSVhotcJ3PCb__tsBpe0P9YO5Jl5/preview"
          },
          {
            id: "ml-2024",
            title: "Practice 2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1JAEamc0IeuZXG883wen66p8ogZ2XZqOG/preview"
          },
          {
            id: "ml-2025",
            title: "Practice 3",
            type: "pdf",
            url: "https://drive.google.com/file/d/1STPAAosbaysOEOzxRfPWb5tWPjsw87kz/preview"
          }
        ]
      },
      {
        subject: "DBMS",
        papers: [
          {
            id: "dbms-2025",
            title: "Practice 0",
            type: "pdf",
            url: "https://drive.google.com/file/d/1EUtt2fQUohcXi2GBvlJwf2l2oiOpj-NZ/preview"
          },
          {
            id: "dbms-2025",
            title: "Practice 1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1uCINIGKBrvVXouiXgbCaUzl_KIw0ptDe/preview"
          },
          {
            id: "dbms-2025",
            title: "Practice 2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1AbsWHulThFsr_Mhsz1NsiGM8RyWAEnEo/preview"
          },
          {
            id: "dbms-2025",
            title: "Practice 3",
            type: "pdf",
            url: "https://drive.google.com/file/d/10hgvm-jo_9lH4GGYZXybkK_WnyJQblA6/preview"
          }
        ]
      }
    ]
  }
]


function ClassBank() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const [search, setSearch] = useState("");
  const [openAns, setOpenAns] = useState({});

  const openPaper = (paper) => {
    setSelectedPaper(paper);
    setSearch("");
    setOpenAns({});
  };

  const goBackToSubjects = () => {
    setSelectedPaper(null);
  };

  const goBackToYears = () => {
    setSelectedSubject(null);
    setSelectedPaper(null);
  };

  const goHome = () => {
    setSelectedYear(null);
    setSelectedSubject(null);
    setSelectedPaper(null);
  };

  const filtered = selectedPaper?.questions
    ? selectedPaper.questions.filter(q =>
        !search ||
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        (q.topic || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="pyq-wrap">
      <div className="pyq-header">
      <div className="pyq-header-top">
        <h1 className="pyq-title"> <BookOpen size={27} /> PYQ's Collection</h1>

        {(selectedYear || selectedSubject || selectedPaper) && (
          <button className="pyq-btn-home" onClick={goHome}>
            <Home size={16} />
            <span>Home</span>
          </button>
        )}
      </div>

      <div className="pyq-header-sub">
        {selectedPaper
          ? selectedPaper.title
          : selectedSubject
          ? selectedSubject.subject
          : selectedYear
          ? selectedYear.year
          : "Select a folder"}
      </div>
    </div>

      {/* 🟢 LEVEL 1 — YEARS */}
      {!selectedYear && (
        <div className="pyq-grid">
          {PAPER_SOURCES.map((y) => (
            <div
              key={y.year}
              className="pyq-local-card"
              onClick={() => setSelectedYear(y)}
              style={{ cursor: "pointer" }}
            >
              <div className="pyq-lc-question"> <Folder size={16} /> {y.year}</div>
            </div>
          ))}
        </div>
      )}

      {/* 🟡 LEVEL 2 — SUBJECTS */}
      {selectedYear && !selectedSubject && (
        <>
        <div className="pyq-back-row">
          <button className="pyq-btn-cancel" onClick={goHome}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
          
          <div className="pyq-grid">
            {selectedYear.subjects.map((s) => (
              <div
                key={s.subject}
                className="pyq-local-card"
                onClick={() => setSelectedSubject(s)}
                style={{ cursor: "pointer" }}
              >
                <div className="pyq-lc-question"> <FolderOpen size={16} /> {s.subject}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🔵 LEVEL 3 — PAPERS */}
      {selectedSubject && !selectedPaper && (
        <>
          <div className="pyq-back-row">
          <button className="pyq-btn-cancel" onClick={goBackToYears}>
            <ArrowLeft size={16} />
            <span>Back</span>
            </button>
          </div>

          <div className="pyq-grid">
            {selectedSubject.papers.map((paper) => (
              <div
                key={paper.id}
                className="pyq-local-card"
                onClick={() => openPaper(paper)}
                style={{ cursor: "pointer" }}
              >

                <div className="pyq-lc-question">
                  {paper.type === "pdf" && <FileText size={16} />}
                  {paper.type === "image" && <Image size={16} />}
                  {paper.type === "questions" && <FileQuestion size={16} />}
                  {paper.title}
                </div>


              </div>
            ))}
          </div>
        </>
      )}

      {/* LEVEL 4 — VIEW PAPER */}

      {selectedPaper && selectedPaper.type === "pdf" && (
        <>
        <div className="pyq-back-row">
           <button className="pyq-btn-cancel" onClick={goBackToSubjects}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
         

          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
            <iframe
              src={selectedPaper.url}
              title={selectedPaper.title}
              style={{ width: "100%", height: "80vh", border: "none" }}
            />
          </div>
        </>
      )}

      {selectedPaper && selectedPaper.type === "image" && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goBackToSubjects}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>
          

          <div style={{ textAlign: "center" }}>
            <img
              src={selectedPaper.url}
              alt={selectedPaper.title}
              style={{ maxWidth: "100%", borderRadius: 12 }}
            />
          </div>
        </>
      )}

      {selectedPaper && selectedPaper.type === "questions" && (
        <>
        <div className="pyq-back-row">
          <button className="pyq-btn-cancel" onClick={goBackToSubjects}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
          

          <div className="pyq-toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                className="pyq-search"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="pyq-grid">
            {filtered.map((q) => (
              <div key={q.id} className="pyq-local-card">
                <div className="pyq-lc-question">{q.question}</div>
                <div className="pyq-lc-tags">
                  {q.topic && <span className="pyq-l-tag lt-top">{q.topic}</span>}
                  {q.marks && <span className="pyq-l-tag lt-mk">{q.marks} marks</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}




export default function PYQsPage() {
  const [mode, setMode]         = useState("mine"); // "mine" | "bank"
  const [pyqs, setPyqs]         = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED;
    } catch { return SEED; }
  });
  const [stars, setStars]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(STARS_KEY) || "[]"); } catch { return []; }
  });
  const [search, setSearch]     = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStar, setFilterStar] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [openAnswers, setOpenAnswers] = useState({});

  // persist
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(pyqs)); }, [pyqs]);
  useEffect(() => { localStorage.setItem(STARS_KEY, JSON.stringify(stars)); }, [stars]);

  // ── derived ─────────────────────────────────────────────────────
  const subjects = [...new Set(pyqs.map(p => p.subject).filter(Boolean))];
  const years    = [...new Set(pyqs.map(p => p.year).filter(Boolean))].sort().reverse();

  const filtered = pyqs
    .filter(p => {
      if (search     && !p.question.toLowerCase().includes(search.toLowerCase()) && !(p.topic || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSub  && p.subject !== filterSub)  return false;
      if (filterYear && p.year    !== filterYear) return false;
      if (filterStar === "starred" && !p.starred) return false;
      return true;
    })
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.createdAt - a.createdAt);

  // ── actions ─────────────────────────────────────────────────────
  const toggleStar = (id) => {
    setPyqs(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));
  };

  const deletePYQ = (id) => {
    if (!window.confirm("Delete this question?")) return;
    setPyqs(prev => prev.filter(p => p.id !== id));
  };

  const toggleAnswer = (id) => {
    setOpenAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const submitForm = () => {
    if (!form.question.trim()) return;
    setPyqs(prev => [{
      id: uid(),
      ...form,
      question: form.question.trim(),
      starred: false,
      createdAt: Date.now(),
    }, ...prev]);
    setForm(emptyForm);
    setShowModal(false);
  };

  // ── render ──────────────────────────────────────────────────────
  return (
    <div className="pyq-page">

      {/* Mode tabs — inside the page (Navbar handles top nav) */}
      <div className="pyq-mode-bar">
        <button
          className={`pyq-mode-tab ${mode === "bank" ? "active" : ""}`}
          onClick={() => setMode("bank")}
        > 
        <span className="tab-content">
          <BookOpen size={16} />
          <span>Pyq's Collection</span>
        </span>
        
        </button>
        <button
          className={`pyq-mode-tab ${mode === "mine" ? "active" : ""}`}
          onClick={() => setMode("mine")}
        > 
        <span className="tab-content">
          <Folder size={16} />
          <span>My Collection</span>
        </span>
        
        </button>
      </div>

      {/* ── CLASS BANK VIEW ─────────────────────────────────────── */}
      {mode === "bank" && <ClassBank />}

      {/* ── MY COLLECTION VIEW ──────────────────────────────────── */}
      {mode === "mine" && (
        <div className="pyq-wrap">
          <div className="pyq-header">
            <div>
              
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}> <Folder size={30} /> My Collection </h1>
              <p> Add Your Own questions. </p>
            </div>
            <button className="pyq-btn-add" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
              + Add PYQ
            </button>
          </div>

          {/* Stats */}
          <div className="pyq-stats-strip">
            <div className="pyq-strip-item">Total: <strong>{pyqs.length}</strong></div>
            <div className="pyq-strip-item">Showing: <strong>{filtered.length}</strong></div>
            <div className="pyq-strip-item">Subjects: <strong>{subjects.length}</strong></div>
            <div className="pyq-strip-item">Starred: <strong>{pyqs.filter(p => p.starred).length}</strong></div>
          </div>

          {/* Toolbar */}
          <div className="pyq-toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                className="pyq-search"
                placeholder="Search questions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="pyq-select" value={filterSub} onChange={e => setFilterSub(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="pyq-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
            <select className="pyq-select" value={filterStar} onChange={e => setFilterStar(e.target.value)}>
              <option value="">All</option>
              <option value="starred">Starred</option>
            </select>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="pyq-state-box">
              <div className="pyq-s-icon"><Folder size={16} /></div>
              <h3>{pyqs.length ? "No matches" : "Your collection is empty"}</h3>
              <p>{pyqs.length ? "Try adjusting your filters." : 'Tap "+ Add PYQ" to start building your personal bank.'}</p>
            </div>
          ) : (
            <div className="pyq-grid">
              {filtered.map((p, i) => (
                <div className="pyq-local-card" key={p.id} style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}>
                  <div className="pyq-lc-header">
                    <div className="pyq-lc-question">{esc(p.question)}</div>
                    <div className="pyq-lc-actions">
                      <button
                        className={`pyq-icon-btn ${p.starred ? "starred" : ""}`}
                        onClick={() => toggleStar(p.id)}
                        title="Star"
                      ><Star size={16} fill="currentColor" /></button>
                      <button
                        className="pyq-icon-btn danger"
                        onClick={() => deletePYQ(p.id)}
                        title="Delete"
                      ><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="pyq-lc-tags">
                    {p.subject && <span className="pyq-l-tag lt-sub">{esc(p.subject)}</span>}
                    {p.year    && <span className="pyq-l-tag lt-yr">{esc(p.year)}</span>}
                    {p.topic   && <span className="pyq-l-tag lt-top">{esc(p.topic)}</span>}
                    {p.marks   && <span className="pyq-l-tag lt-mk">{esc(p.marks)} marks</span>}
                  </div>

                  {p.answer && (
                    <>
                      <div className={`pyq-lc-answer ${openAnswers[p.id] ? "visible" : ""}`}>
                        {esc(p.answer)}
                      </div>
                      <button className="pyq-toggle-ans" onClick={() => toggleAnswer(p.id)}>
                        {openAnswers[p.id] ? "Hide answer" : "Show answer"}
                      </button>
                    </>
                  )}

                  <div className="pyq-lc-footer">
                    <span className="pyq-lc-date">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div className="pyq-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="pyq-modal">
            <h3>Add to My Collection</h3>

            <div className="pyq-form-group">
              <label className="pyq-form-label">Question *</label>
              <textarea
                className="pyq-form-textarea"
                placeholder="Enter the question..."
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="pyq-form-row">
              <div className="pyq-form-group">
                <label className="pyq-form-label">Subject *</label>
                <input
                  className="pyq-form-input"
                  placeholder="e.g. Mathematics"
                  list="pyq-subj-list"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
                <datalist id="pyq-subj-list">
                  {subjects.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="pyq-form-group">
                <label className="pyq-form-label">Year</label>
                <input
                  className="pyq-form-input"
                  placeholder="e.g. 2023"
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                />
              </div>
            </div>

            <div className="pyq-form-row">
              <div className="pyq-form-group">
                <label className="pyq-form-label">Topic / Unit</label>
                <input
                  className="pyq-form-input"
                  placeholder="e.g. Integration"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                />
              </div>
              <div className="pyq-form-group">
                <label className="pyq-form-label">Marks</label>
                <input
                  className="pyq-form-input"
                  placeholder="e.g. 5"
                  value={form.marks}
                  onChange={e => setForm(f => ({ ...f, marks: e.target.value }))}
                />
              </div>
            </div>

            <div className="pyq-form-group">
              <label className="pyq-form-label">Answer / Key Points (optional)</label>
              <textarea
                className="pyq-form-textarea"
                placeholder="Solution approach, key points..."
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              />
            </div>

            <div className="pyq-modal-actions">

              <button className="pyq-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="pyq-btn-confirm"
                onClick={submitForm}
                disabled={!form.question.trim()}
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}