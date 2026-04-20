
import { useState, useEffect, useRef } from "react";
import "./pyqs.css";

import { Folder, BookOpen, Star, Trash2, FileText, Image, FileQuestion, Search, ListVideo, PlayCircle } from "lucide-react";
import { FolderOpen } from "lucide-react";
import { ArrowLeft, Home } from "lucide-react";


const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const esc  = (s) => String(s ?? "");
const STORAGE_KEY = "edubits_local_pyqs";
const STARS_KEY   = "edubits_pyq_stars";

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
        subject: "Mathematics-II",
        papers: [
          {
            id: "mst1",
            title: "mst1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1587LMIzAkGPijJ7FbCS8qpiTB3lUKqsK/preview"
          },
          {
            id: "mst2",
            title: "mst2",
            type: "pdf",
            url: "https://drive.google.com/file/d/16Q-zKnfSGzNTlJLafuKthQ8JloxISB1A/preview"
          },
          {
            id: "est1",
            title: "est1",
            type: "pdf",
            url: "https://drive.google.com/file/d/10E2i7EtHD6_WJuVSL-1u7kgmNjF3DgR0/preview"
          },
        ]
      },
      {
        subject: "Digital Electronics",
        papers: [
          {
            id: "mst1",
            title: "mst1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1ImyfrlPSahDY7jn6llVrNWPgdZObh6re/preview"
          },
          {
            id: "mst2",
            title: "mst2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1X7MXH57AHA-uLCG2aORk-TAWQF_fgyWc/preview"
          },
          {
            id: "est1",
            title: "est1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1BPyBOPekIi3N7b2i-oW5AfEfoCd5kFQB/preview"
          }
        ]
      },
      {
        subject: "Engineering physics",
        papers: [
          {
            id: "mst1",
            title: "mst1",
            type: "pdf",
            url: ""
          },
          {
            id: "mst2",
            title: "mst2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1w8Ialuz1Yfa-bJ4XEwJJsTSu6CHbsalw/preview"
          },
          {
            id: "est1",
            title: "est1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1w8Ialuz1Yfa-bJ4XEwJJsTSu6CHbsalw/preview"
          }
        ]
      },
      {
        subject: "DSA",
        papers: [
          {
            id: "mst1",
            title: "mst1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1o6z_egRoKrI7WTkwA5tT5tZbGwMH1mHC/preview"
          },
          {
            id: "mst2",
            title: "mst2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1X0qFl7mR3sOcwiulVyfWfYPf3HS60TFL/preview"
          },
        ]
      },
      {
        subject: "Biology",
        papers: [
          {
            id: "mst1",
            title: "mst1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1ofSik_XcO2gGTUvsdFZdT_2th-K_sj8y/preview"
          },
          {
            id: "mst2",
            title: "mst2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1sMChNTNpI8137MsNZoocTz11BhJOowgr/preview"
          },
          {
            id: "est1",
            title: "est1",
            type: "pdf",
            url: "https://drive.google.com/file/d/19IDIHzvpaCe4gbi-pekZ850hKJtHxsWq/preview"
          },
        ]
      },
      {
        subject: "Semi-conductor physics",
        papers: [
          {
            id: "mst1",
            title: "mst1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1PZSdjk16DTnpNGj0tSjwIGcFkLHoHtGs/preview"
          },
          {
            id: "mst2",
            title: "mst2",
            type: "pdf",
            url: "https://drive.google.com/file/d/1F1Yw8lMvORhKcyIPWrL6ZMSJjz-McPCI/preview"
          },
          {
            id: "est1",
            title: "est1",
            type: "pdf",
            url: "https://drive.google.com/file/d/1EOjUvk0nwY3JuBDXUcW9maXTjmio5N-V/preview"
          },
        ]
      },
      
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


// ─── Playlist Data ────────────────────────────────────────────────
//
// HOW TO ADD PLAYLISTS:
// 1. Go to the YouTube playlist page.
// 2. Copy the playlist ID from the URL: ?list=PLxxxxxxxx
//    → Set playlistId: "PLxxxxxxxx"
// 3. Open any video in the playlist, copy its video ID from the URL (?v=VIDEO_ID)
//    → Set thumbVideoId: "VIDEO_ID"  (used for the thumbnail image)
// 4. Clicking the card opens the full playlist on YouTube in a new tab.
//
const PLAYLIST_SOURCES = [
  {
    year: "1st Year",
    subjects: [
      {
        subject: "Mathematics-II",
        playlists: [
          {
            id: "math2-p1",
            title: "Complete Math-II Course",
            channel: "Example Channel",
            playlistId: "PLxxxxxx",
            thumbVideoId: "",
          },
        ],
      },
    ],
  },
  {
    year: "2nd Year",
    subjects: [
      {
        subject: "Operating System",
        playlists: [
          {
            id: "os-p2",
            title: "OS Unit 2",
            channel: "Gate Smashers",
            playlistId: "PLhx1hByyAqsYy-hBX7zxbHRFjSKc-kQeY",
            thumbVideoId: "P_dA8VGJjA8",
          },
        ],
      },
      {
        subject: "DAA",
        playlists: [
          {
            id: "daa-p2",
            title: "DAA Unit 2",
            channel: "Gate Smashers",
            playlistId: "PLhx1hByyAqsbCKEJu0ntERx33fTeNigw2",
            thumbVideoId: "I8w2XN0w-fQ",
          },
        ],
      },
      {
        subject: "DBMS",
        playlists: [
          {
            id: "dbms-p1",
            title: "DBMS Unit 2",
            channel: "Example Channel",
            playlistId: "PLhx1hByyAqsYFoBvR5gjsfw2qQHfI4IiO",
            thumbVideoId: "5GDTIUVlHB8",
          },
        ],
      },
    ],
  },
];

// ─── Playlists Component ──────────────────────────────────────────
function Playlists() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const goHome = () => {
    setSelectedYear(null);
    setSelectedSubject(null);
  };
  const goBackToYears = () => {
    setSelectedSubject(null);
  };

  const openPlaylist = (pl) => {
    window.open(
      `https://www.youtube.com/playlist?list=${pl.playlistId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const thumbUrl = (pl) =>
    pl.thumbVideoId
      ? `https://img.youtube.com/vi/${pl.thumbVideoId}/hqdefault.jpg`
      : "";

  return (
    <div className="pyq-wrap">
      <div className="pyq-header">
        <div className="pyq-header-top">
          <h1 className="pyq-title"><ListVideo size={27} /> Playlists</h1>
          {(selectedYear || selectedSubject) && (
            <button className="pyq-btn-home" onClick={goHome}>
              <Home size={16} />
              <span>Home</span>
            </button>
          )}
        </div>
        <div className="pyq-header-sub">
          {selectedSubject
            ? selectedSubject.subject
            : selectedYear
            ? selectedYear.year
            : "Select a folder"}
        </div>
      </div>

      {/* LEVEL 1 — YEARS */}
      {!selectedYear && (
        <div className="pyq-grid">
          {PLAYLIST_SOURCES.map((y) => (
            <div
              key={y.year}
              className="pyq-local-card"
              onClick={() => setSelectedYear(y)}
              style={{ cursor: "pointer" }}
            >
              <div className="pyq-lc-question"><Folder size={16} /> {y.year}</div>
              <div className="pyq-lc-tags">
                <span className="pyq-l-tag lt-sub">{y.subjects.length} subjects</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEVEL 2 — SUBJECTS */}
      {selectedYear && !selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goHome}>
              <ArrowLeft size={16} /><span>Back</span>
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
                <div className="pyq-lc-question"><FolderOpen size={16} /> {s.subject}</div>
                <div className="pyq-lc-tags">
                  <span className="pyq-l-tag lt-yr">{s.playlists.length} playlist{s.playlists.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* LEVEL 3 — PLAYLIST CARDS (click → opens YouTube) */}
      {selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goBackToYears}>
              <ArrowLeft size={16} /><span>Back</span>
            </button>
          </div>
          <div className="pyq-grid">
            {selectedSubject.playlists.map((pl) => {
              const thumb = thumbUrl(pl);
              return (
                <div
                  key={pl.id}
                  className="pyq-local-card pyq-playlist-card"
                  onClick={() => openPlaylist(pl)}
                  style={{ cursor: "pointer" }}
                >
                  {thumb ? (
                    <div className="pyq-pl-thumb">
                      <img src={thumb} alt={pl.title} />
                      <div className="pyq-pl-play-overlay"><PlayCircle size={38} /></div>
                    </div>
                  ) : (
                    <div className="pyq-pl-thumb pyq-pl-thumb--empty">
                      <ListVideo size={32} style={{ opacity: 0.4 }} />
                    </div>
                  )}
                  <div className="pyq-lc-question" style={{ marginTop: 4 }}>
                    <PlayCircle size={15} /> {pl.title}
                  </div>
                  {pl.channel && (
                    <div className="pyq-lc-tags">
                      <span className="pyq-l-tag lt-top">{pl.channel}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

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
        <h1 className="pyq-title"> <BookOpen size={27} /> PYQ's</h1>

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
  const [mode, setMode]         = useState("bank"); // "mine" | "bank"
  const [pyqs, setPyqs]         = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
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
          <span>Pyq's</span>
        </span>
        
        </button>
        <button
          className={`pyq-mode-tab ${mode === "mine" ? "active" : ""}`}
          onClick={() => setMode("mine")}
        > 
        <span className="tab-content">
          <Folder size={16} />
          <span>Revision</span>
        </span>
        
        </button>
        <button
          className={`pyq-mode-tab ${mode === "playlists" ? "active" : ""}`}
          onClick={() => setMode("playlists")}
        >
          <span className="tab-content">
            <ListVideo size={16} />
            <span>Playlists</span>
          </span>
        </button>
      </div>

      {/* ── CLASS BANK VIEW ─────────────────────────────────────── */}
      {mode === "bank" && <ClassBank />}

      {/* ── PLAYLISTS VIEW ───────────────────────────────────────── */}
      {mode === "playlists" && <Playlists />}

      {/* ── MY COLLECTION VIEW ──────────────────────────────────── */}
      {mode === "mine" && (
        <div className="pyq-wrap">
          <div className="pyq-header">
            <div>
              
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}> <Folder size={30} /> Revision </h1>
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