// import { useState, useEffect, useRef, useCallback } from "react";
// import "./pyqs.css";
// import {
//   BookOpen, Star, Trash2, FileText, Search,
//   ListVideo, PlayCircle, Pencil, Home, ArrowLeft,
//   CheckSquare, Square, Save, ExternalLink, FolderOpen, Folder,
//   Image, FileQuestion,
// } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import axios from "axios";

// const API = import.meta.env.VITE_API_URL;

// const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
// const esc = (s) => String(s ?? "");

// const STORAGE_KEY = "edubits_local_pyqs";

// const emptyForm = { question: "", subject: "", year: "", topic: "", marks: "", answer: "" };

// // ─── Data ────────────────────────────────────────────────────────────────────

// const PAPER_SOURCES = [
//   {
//     year: "1st Year",
//     image: "../public/images/1st.svg",
//     subjects: [
//       {
//         subject: "Mathematics-II",
//         image: "../public/images/maths2.svg",
//         papers: [
//           { id: "math-mst1",  title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1587LMIzAkGPijJ7FbCS8qpiTB3lUKqsK/preview", solutionUrl: "" },
//           { id: "math-mst2",  title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/16Q-zKnfSGzNTlJLafuKthQ8JloxISB1A/preview", solutionUrl: "" },
//           { id: "math-est1",  title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/10E2i7EtHD6_WJuVSL-1u7kgmNjF3DgR0/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Digital Electronics",
//         image: "../public/images/fede.svg",
//         papers: [
//           { id: "de-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1ImyfrlPSahDY7jn6llVrNWPgdZObh6re/preview", solutionUrl: "" },
//           { id: "de-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1X7MXH57AHA-uLCG2aORk-TAWQF_fgyWc/preview", solutionUrl: "" },
//           { id: "de-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1BPyBOPekIi3N7b2i-oW5AfEfoCd5kFQB/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Engineering Physics",
//         image: "../public/images/ep.svg",
//         papers: [
//           { id: "ep-mst1", title: "MST 1", type: "pdf", url: "", solutionUrl: "" },
//           { id: "ep-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1w8Ialuz1Yfa-bJ4XEwJJsTSu6CHbsalw/preview", solutionUrl: "" },
//           { id: "ep-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1w8Ialuz1Yfa-bJ4XEwJJsTSu6CHbsalw/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "DSA",
//         image: "../public/images/dsa.svg",
//         papers: [
//           { id: "dsa-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1o6z_egRoKrI7WTkwA5tT5tZbGwMH1mHC/preview", solutionUrl: "" },
//           { id: "dsa-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1X0qFl7mR3sOcwiulVyfWfYPf3HS60TFL/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Biology",
//         image: "../public/images/bio.svg",
//         papers: [
//           { id: "bio-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1ofSik_XcO2gGTUvsdFZdT_2th-K_sj8y/preview", solutionUrl: "" },
//           { id: "bio-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1sMChNTNpI8137MsNZoocTz11BhJOowgr/preview", solutionUrl: "" },
//           { id: "bio-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/19IDIHzvpaCe4gbi-pekZ850hKJtHxsWq/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Semi-conductor Physics",
//         image: "../public/images/semi.svg",
//         papers: [
//           { id: "sc-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1PZSdjk16DTnpNGj0tSjwIGcFkLHoHtGs/preview", solutionUrl: "" },
//           { id: "sc-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1F1Yw8lMvORhKcyIPWrL6ZMSJjz-McPCI/preview", solutionUrl: "" },
//           { id: "sc-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1EOjUvk0nwY3JuBDXUcW9maXTjmio5N-V/preview", solutionUrl: "" },
//         ],
//       },
//     ],
//   },
//   {
//     year: "2nd Year",
//     image: "../public/images/2nd.svg",
//     subjects: [
//       {
//         subject: "COA",
//         image: "../public/images/coa.svg",
//         papers: [
//           { id: "coa-2022",  title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1uDjwVvsbKiJA9PgOTaVfzvHfwsQrCmJ8/preview", solutionUrl: "" },
//           { id: "coa-2024",  title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1MZvRTq6k1Lqm42U1MEr7LK-VWWzSGPzA/preview", solutionUrl: "" },
//           { id: "coa-2025a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1tluGNXvQpey4jKaZQFfhEHfrRboqbszd/preview", solutionUrl: "" },
//           { id: "coa-2025b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview", solutionUrl: "" },
//           { id: "coa-2025c", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview", solutionUrl: "" },
//           { id: "coa-2025d", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/18XKNGn-THu2wY-D7HOo5CqQwjf4JLeFO/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Software Engineering",
//         image: "../public/images/se.svg",
//         papers: [
//           { id: "se-imp",   title: "Important Questions", type: "pdf", url: "https://drive.google.com/file/d/1sAZN2omjcdJdDbsW5-6EM4jQvzWvRYoI/preview", solutionUrl: "" },
//           { id: "se-2022a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1pJDM_KSEQ1LHwz_UzBWVvNXcnFUqQZQq/preview", solutionUrl: "" },
//           { id: "se-2022b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1R_QhIPBYq1ZArm-eLCWSNLKkmcnGHYKR/preview", solutionUrl: "" },
//           { id: "se-2022c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1HIR21u97EsUwdS_OYo90S_1v2IugH55J/preview", solutionUrl: "" },
//           { id: "se-2023",  title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/19mdIZ9ywBlvGKHLnePq2RTTKE_RX58Px/preview", solutionUrl: "" },
//           { id: "se-2024a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1nLLO_IjC9bg_V2eoQBe0233sGiLY7afo/preview", solutionUrl: "" },
//           { id: "se-2024b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1a9JYBJVNxovUmfgzTKDeLg8o-YszreKx/preview", solutionUrl: "" },
//           { id: "se-2024c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/1d3l8mUn9-mAxc1c72cgSA20KPH1Dvf4E/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Operating System",
//         image: "../public/images/os.svg",
//         papers: [
//           { id: "os-0001",  title: "Important Questions", type: "pdf", url: "https://drive.google.com/file/d/1BDOxxGa8fSZqkXKLhtGEqrw4hl4QclIa/preview", solutionUrl: "" },
//           { id: "os-2022a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1ibJ2ZWG07kPhpM2LU4chLAjGlL3Oa9G0/preview", solutionUrl: "" },
//           { id: "os-2022b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1c5EMRXj_LgBRUlRNhWuVGzEPMIVpYYE5/preview", solutionUrl: "" },
//           { id: "os-2022c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1sB0qONnGQyWnVJ_o6qE8VKZp3P3WvwSh/preview", solutionUrl: "" },
//           { id: "os-2022d", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/13qidPE9bYiAV_a_8l7YvlwtQ4TmkqlSE/preview", solutionUrl: "" },
//           { id: "os-2023a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1dC1ZwltNWd-7ovYM_hZTEsqF8J8z_SXV/preview", solutionUrl: "" },
//           { id: "os-2023b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1VxjuTujtJ58PeuNHFXrRX_3fHSz4gQvm/preview", solutionUrl: "" },
//           { id: "os-2023c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/1U3_WL0hT1MzuOuGafpzIZnLzEov9MRVu/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "DAA",
//         image: "../public/images/daa.svg",
//         papers: [
//           { id: "daa-2023a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1znMw3Ve4W4oDl3Vf4UYsjiGk2pz4aQkn/preview", solutionUrl: "" },
//           { id: "daa-2023b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1bc6iNabOnpnVXRqXGmkGpQ7IEhWL1ylQ/preview", solutionUrl: "" },
//           { id: "daa-2024a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/13uQsoRoDsmP2Lvo_ktQH5GxW_eJ_zI8w/preview", solutionUrl: "" },
//           { id: "daa-2024b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1-LSsXZPLpzim7xwRAVECGbzQMZFVkfta/preview", solutionUrl: "" },
//           { id: "daa-2025a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1o8mupEYR7D_JGPrVwlhtpkPtcOE8l2fj/preview", solutionUrl: "" },
//           { id: "daa-2025b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1gTwV6kOFFsOxxVzrYdvh1iHpWJiZcjFw/preview", solutionUrl: "" },
//           { id: "daa-2025c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/17s5yiB5v2mD7MRirNE-QVR7dxW3EH97b/preview", solutionUrl: "" },
//           { id: "daa-2025d", title: "Practice 7", type: "pdf", url: "https://drive.google.com/file/d/1JBF1TEgivsa0zPPDa50fCX0Nepp5D3NW/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Java",
//         image: "../public/images/java.svg",
//         papers: [
//           { id: "java-2023a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1OpVDi58n9svRTlENe52f0f6K1renT3h9/preview", solutionUrl: "" },
//           { id: "java-2023b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1U8gHgZDSz0QXi8mhsuOMXBsyrpPutw1d/preview", solutionUrl: "" },
//           { id: "java-2024a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/16HxigLF5npg1umcBShN67_R3IhXNkBVh/preview", solutionUrl: "" },
//           { id: "java-2024b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/16Ywzd3EMTsLiuWowS_I-Ij4EvQWw2xXJ/preview", solutionUrl: "" },
//           { id: "java-2024c", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1mkGH3kYWVWrlXIeNdd-2rIImEtEOynDU/preview", solutionUrl: "" },
//           { id: "java-2025",  title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1M-JH-3kbRj-8iXT5dOmPwOczBPMCnD9N/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "Machine Learning",
//         image: "../public/images/ml.svg",
//         papers: [
//           { id: "ml-2022", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1Xmg5pZTivaf1kV0MFZji-tctGyzvVAu1/preview", solutionUrl: "" },
//           { id: "ml-2023", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1neFnvSVhotcJ3PCb__tsBpe0P9YO5Jl5/preview", solutionUrl: "" },
//           { id: "ml-2024", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1JAEamc0IeuZXG883wen66p8ogZ2XZqOG/preview", solutionUrl: "" },
//           { id: "ml-2025", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1STPAAosbaysOEOzxRfPWb5tWPjsw87kz/preview", solutionUrl: "" },
//         ],
//       },
//       {
//         subject: "DBMS",
//         image: "../public/images/dbms.svg",
//         papers: [
//           { id: "dbms-2025a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1EUtt2fQUohcXi2GBvlJwf2l2oiOpj-NZ/preview", solutionUrl: "" },
//           { id: "dbms-2025b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1uCINIGKBrvVXouiXgbCaUzl_KIw0ptDe/preview", solutionUrl: "" },
//           { id: "dbms-2025c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1AbsWHulThFsr_Mhsz1NsiGM8RyWAEnEo/preview", solutionUrl: "" },
//           { id: "dbms-2025d", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/10hgvm-jo_9lH4GGYZXybkK_WnyJQblA6/preview", solutionUrl: "" },
//         ],
//       },
//     ],
//   },
//   {
//     year: "3rd Year",
//     image: "../public/images/3rd.svg",
//     subjects: [],
//   },
//   {
//     year: "4th Year",
//     image: "../public/images/4th.svg",
//     subjects: [],
//   },
// ];

// const PLAYLIST_SOURCES = [
//   {
//     year: "1st Year",
//     subjects: [
//       {
//         subject: "Mathematics-II",
//         playlists: [
//           { id: "math2-p1", title: "Complete Math-II Course", channel: "Will add soon.", playlistId: "PLxyz", thumbVideoId: "" },
//         ],
//       },
//     ],
//   },
//   {
//     year: "2nd Year",
//     subjects: [
//       {
//         subject: "Software Engineering",
//         playlists: [
//           { id: "se-all", title: "Complete SE Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiEed7SKZBnC6ypFDWYLRvB2", thumbVideoId: "kcvEiMFOcoE" },
//         ],
//       },
//       {
//         subject: "OOPS Using Java",
//         playlists: [
//           { id: "java-all", title: "Complete Java Playlist", channel: "Easy Engineering Classes", playlistId: "PLV8vIYTIdSnbL_fSaqiYpPh-KwNCavjIr", thumbVideoId: "4Y0N43i2RNs" },
//         ],
//       },
//       {
//         subject: "Operating System",
//         playlists: [
//           { id: "os-all", title: "Complete OS Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", thumbVideoId: "WJ-UaAaumNA" },
//           { id: "os-og",  title: "OS One Shot",          channel: "5 Minutes Engineering", playlistId: "PLhx1hByyAqsYn0JMNNPN-uFiLb0XdZtSG", thumbVideoId: "A4G0hOI6XyQ" },
//         ],
//       },
//       {
//         subject: "DAA",
//         playlists: [
//           { id: "daa-p1", title: "DAA Unit 1", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsZ3ZMkKbN9FcSUYad1ShZ3G", thumbVideoId: "0IAPZzGSbME" },
//           { id: "daa-p2", title: "DAA Unit 2", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsbCKEJu0ntERx33fTeNigw2", thumbVideoId: "I8w2XN0w-fQ" },
//           { id: "daa-p3", title: "DAA Unit 3", channel: "Striver",        playlistId: "PLhx1hByyAqsaJcVgBApIKLaKucaRpW3Om", thumbVideoId: "M3_pLsDdeuU" },
//         ],
//       },
//       {
//         subject: "DBMS",
//         playlists: [
//           { id: "dbms-p1", title: "DBMS Unit 2", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsYFoBvR5gjsfw2qQHfI4IiO", thumbVideoId: "5GDTIUVlHB8" },
//         ],
//       },
//       {
//         subject: "COA",
//         playlists: [
//           { id: "coa-p1", title: "Complete COA Playlist", channel: "5 Minutes Engineering", playlistId: "PLYwpaL_SFmcCaiXeUEjcTzHwIfJqH1qCN", thumbVideoId: "1rUevQ3bSEY" },
//         ],
//       },
//     ],
//   },
// ];

// // ─── Progress hook ────────────────────────────────────────────────────────────

// function useProgress(token) {
//   const [progressMap, setProgressMap] = useState({});

//   useEffect(() => {
//     if (!token) return;
//     axios
//       .get(`${API}/pyq-progress`, { headers: { Authorization: `Bearer ${token}` } })
//       .then(({ data }) => {
//         const map = {};
//         data.forEach((d) => { map[d.paperId] = d; });
//         setProgressMap(map);
//       })
//       .catch(() => {});
//   }, [token]);

//   const saveProgress = useCallback(async (paperId, patch) => {
//     if (!token) return;
//     try {
//       const { data } = await axios.put(
//         `${API}/pyq-progress/${paperId}`,
//         patch,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setProgressMap((prev) => ({ ...prev, [paperId]: data }));
//     } catch {}
//   }, [token]);

//   return { progressMap, saveProgress };
// }

// // ─── ClassBank ────────────────────────────────────────────────────────────────

// function ClassBank() {
//   const { token } = useAuth();
//   const { progressMap, saveProgress } = useProgress(token);

//   const [selectedYear,    setSelectedYear]    = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState(null);
//   const [selectedPaper,   setSelectedPaper]   = useState(null);

//   const openPaper        = (paper) => setSelectedPaper(paper);
//   const goBackToSubjects = () => setSelectedPaper(null);
//   const goBackToYears    = () => { setSelectedSubject(null); setSelectedPaper(null); };
//   const goHome           = () => { setSelectedYear(null); setSelectedSubject(null); setSelectedPaper(null); };

//   const subjectProgress = selectedSubject
//     ? {
//         total:     selectedSubject.papers.length,
//         attempted: selectedSubject.papers.filter((p) => progressMap[p.id]?.attempted).length,
//       }
//     : null;

//   return (
//     <div className="pyq-wrap">
//       <div className="pyq-header">
//         <div className="pyq-header-top">
//           <h1 className="pyq-title"><BookOpen size={27} /> PYQ's</h1>
//           {(selectedYear || selectedSubject || selectedPaper) && (
//             <button className="pyq-btn-home" onClick={goHome}><Home size={16} /><span>Home</span></button>
//           )}
//         </div>
//         {(selectedYear || selectedSubject || selectedPaper) && (
//           <div className="pyq-header-sub">
//             {selectedPaper
//               ? selectedPaper.title
//               : selectedSubject
//               ? selectedSubject.subject
//               : selectedYear.year}
//           </div>
//         )}
//       </div>

//       {selectedSubject && !selectedPaper && subjectProgress && (
//         <div className="pyq-progress-wrap">
//           <div className="pyq-progress-label">
//             <span>Attempted</span>
//             <span>{subjectProgress.attempted} / {subjectProgress.total}</span>
//           </div>
//           <div className="pyq-progress-track">
//             <div
//               className="pyq-progress-fill"
//               style={{ width: `${(subjectProgress.attempted / subjectProgress.total) * 100}%` }}
//             />
//           </div>
//         </div>
//       )}

//       {!selectedYear && (
//         <div className="pyq-card-grid pyq-card-grid--years">
//           {PAPER_SOURCES.map((y) => (
//             <div
//               key={y.year}
//               className="pyq-thumb-card"
//               onClick={() => y.subjects.length > 0 && setSelectedYear(y)}
//               style={{ cursor: y.subjects.length > 0 ? "pointer" : "default" }}
//             >
//               <div className="pyq-thumb-img-wrap">
//                 <img src={y.image} alt={y.year} className="pyq-thumb-img" />
//                 {y.subjects.length === 0 && (
//                   <div className="pyq-thumb-overlay pyq-thumb-overlay--soon">
//                     <span>Coming Soon</span>
//                   </div>
//                 )}
//               </div>
//               <div className="pyq-thumb-title">{y.year}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedYear && !selectedSubject && (
//         <>
//           <div className="pyq-back-row">
//             <button className="pyq-btn-cancel" onClick={goHome}><ArrowLeft size={16} /><span>Back</span></button>
//           </div>
//           <div className="pyq-card-grid pyq-card-grid--subjects">
//             {selectedYear.subjects.map((s) => {
//               const total     = s.papers.length;
//               const attempted = s.papers.filter((p) => progressMap[p.id]?.attempted).length;
//               return (
//                 <div
//                   key={s.subject}
//                   className="pyq-thumb-card"
//                   onClick={() => setSelectedSubject(s)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <div className="pyq-thumb-img-wrap">
//                     <img src={s.image} alt={s.subject} className="pyq-thumb-img" />
//                   </div>
//                   <div className="pyq-thumb-title">{s.subject}</div>
//                   <div className="pyq-thumb-sub">{attempted}/{total} attempted</div>
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}

//       {selectedSubject && !selectedPaper && (
//         <>
//           <div className="pyq-back-row">
//             <button className="pyq-btn-cancel" onClick={goBackToYears}><ArrowLeft size={16} /><span>Back</span></button>
//           </div>
//           <div className="pyq-card-grid pyq-card-grid--papers">
//             {selectedSubject.papers.map((paper) => {
//               const prog      = progressMap[paper.id];
//               const attempted = prog?.attempted ?? false;
//               return (
//                 <div key={paper.id} className={`pyq-thumb-card pyq-thumb-card--paper ${attempted ? "pyq-thumb-card--done" : ""}`}>
//                   <div
//                     className="pyq-thumb-img-wrap"
//                     onClick={() => openPaper(paper)}
//                     style={{ cursor: "pointer" }}
//                   >
//                     <img src={selectedSubject.image} alt={paper.title} className="pyq-thumb-img" />
//                     <div className="pyq-thumb-overlay pyq-thumb-overlay--hover">
//                       <FileText size={28} />
//                       <span>Open</span>
//                     </div>
//                     {attempted && (
//                       <div className="pyq-thumb-done-badge">
//                         <CheckSquare size={14} /> Done
//                       </div>
//                     )}
//                   </div>
//                   <div className="pyq-paper-card-footer">
//                     <span className="pyq-thumb-title">{paper.title}</span>
//                     <button
//                       className={`pyq-attempt-btn ${attempted ? "pyq-attempt-btn--done" : ""}`}
//                       onClick={() => saveProgress(paper.id, { attempted: !attempted })}
//                       title={attempted ? "Mark as not attempted" : "Mark as attempted"}
//                     >
//                       {attempted ? <CheckSquare size={15} /> : <Square size={15} />}
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}

//       {selectedPaper && (
//         <PaperView
//           paper={selectedPaper}
//           progress={progressMap[selectedPaper.id]}
//           onSaveProgress={(patch) => saveProgress(selectedPaper.id, patch)}
//           onBack={goBackToSubjects}
//         />
//       )}
//     </div>
//   );
// }

// // ─── PaperView ────────────────────────────────────────────────────────────────

// function PaperView({ paper, progress, onSaveProgress, onBack }) {
//   const [notes,       setNotes]       = useState(progress?.notes ?? "");
//   const [attempted,   setAttempted]   = useState(progress?.attempted ?? false);
//   const [saveStatus,  setSaveStatus]  = useState("idle"); // idle | saving | saved
//   const debounceRef = useRef(null);

//   useEffect(() => {
//     setNotes(progress?.notes ?? "");
//     setAttempted(progress?.attempted ?? false);
//   }, [progress]);

//   const persistNotes = useCallback(async (val) => {
//     setSaveStatus("saving");
//     await onSaveProgress({ notes: val });
//     setSaveStatus("saved");
//     setTimeout(() => setSaveStatus("idle"), 2000);
//   }, [onSaveProgress]);

//   const handleNotesChange = (e) => {
//     const val = e.target.value;
//     setNotes(val);
//     setSaveStatus("idle");
//     clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => persistNotes(val), 800);
//   };

//   const handleManualSave = () => {
//     clearTimeout(debounceRef.current);
//     persistNotes(notes);
//   };

//   const toggleAttempted = () => {
//     const next = !attempted;
//     setAttempted(next);
//     onSaveProgress({ attempted: next });
//   };

//   return (
//     <>
//       <div className="pyq-back-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <button className="pyq-btn-cancel" onClick={onBack}><ArrowLeft size={16} /><span>Back</span></button>
//         <button
//           className={`pyq-attempt-inline-btn ${attempted ? "pyq-attempt-inline-btn--done" : ""}`}
//           onClick={toggleAttempted}
//         >
//           {attempted ? <CheckSquare size={15} /> : <Square size={15} />}
//           <span>{attempted ? "Attempted" : "Mark as attempted"}</span>
//         </button>
//       </div>

//       <div className="pyq-pdf-wrap">
//         <a
//           href={paper.url.replace("/preview", "/view")}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="pyq-open-tab-btn"
//         >
//           <ExternalLink size={14} /> Open in tab
//         </a>
//         <iframe src={paper.url} title={paper.title} className="pyq-pdf-iframe" />
//       </div>

//       {paper.solutionUrl && (
//         <div className="pyq-section-block">
//           <h3 className="pyq-section-heading">Solutions</h3>
//           <div className="pyq-pdf-wrap">
//             <a
//               href={paper.solutionUrl.replace("/preview", "/view")}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="pyq-open-tab-btn"
//             >
//               <ExternalLink size={14} /> Open in tab
//             </a>
//             <iframe src={paper.solutionUrl} title={`${paper.title} — Solution`} className="pyq-pdf-iframe" />
//           </div>
//         </div>
//       )}

//       <div className="pyq-section-block">
//         <div className="pyq-notes-header">
//           <h3 className="pyq-section-heading">My Notes</h3>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             {saveStatus === "saving" && <span className="pyq-save-status">Saving…</span>}
//             {saveStatus === "saved"  && <span className="pyq-save-status pyq-save-status--ok">Saved ✓</span>}
//             <button className="pyq-manual-save-btn" onClick={handleManualSave}>
//               <Save size={14} /> Save
//             </button>
//           </div>
//         </div>
//         <textarea
//           className="pyq-notes-area"
//           placeholder="Write your notes, key points, or observations here…"
//           value={notes}
//           onChange={handleNotesChange}
//         />
//       </div>
//     </>
//   );
// }

// // ─── Playlists ────────────────────────────────────────────────────────────────

// function Playlists() {
//   const [selectedYear,    setSelectedYear]    = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState(null);

//   const goHome        = () => { setSelectedYear(null); setSelectedSubject(null); };
//   const goBackToYears = () => setSelectedSubject(null);
//   const openPlaylist  = (pl) => window.open(`https://www.youtube.com/playlist?list=${pl.playlistId}`, "_blank", "noopener,noreferrer");
//   const thumbUrl      = (pl) => pl.thumbVideoId ? `https://img.youtube.com/vi/${pl.thumbVideoId}/hqdefault.jpg` : "";

//   return (
//     <div className="pyq-wrap">
//       <div className="pyq-header">
//         <div className="pyq-header-top">
//           <h1 className="pyq-title"><ListVideo size={27} /> Playlists</h1>
//           {(selectedYear || selectedSubject) && (
//             <button className="pyq-btn-home" onClick={goHome}><Home size={16} /><span>Home</span></button>
//           )}
//         </div>
//         <div className="pyq-header-sub">
//           {selectedSubject ? selectedSubject.subject : selectedYear ? selectedYear.year : "Select a folder"}
//         </div>
//       </div>

//       {!selectedYear && (
//         <div className="pyq-card-grid pyq-card-grid--years">
//           {PLAYLIST_SOURCES.map((y) => (
//             <div key={y.year} className="pyq-local-card" onClick={() => setSelectedYear(y)} style={{ cursor: "pointer" }}>
//               <div className="pyq-lc-question"><Folder size={16} /> {y.year}</div>
//               <div className="pyq-lc-tags"><span className="pyq-l-tag lt-sub">{y.subjects.length} subjects</span></div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedYear && !selectedSubject && (
//         <>
//           <div className="pyq-back-row">
//             <button className="pyq-btn-cancel" onClick={goHome}><ArrowLeft size={16} /><span>Back</span></button>
//           </div>
//           <div className="pyq-card-grid pyq-card-grid--subjects">
//             {selectedYear.subjects.map((s) => (
//               <div key={s.subject} className="pyq-local-card" onClick={() => setSelectedSubject(s)} style={{ cursor: "pointer" }}>
//                 <div className="pyq-lc-question"><FolderOpen size={16} /> {s.subject}</div>
//                 <div className="pyq-lc-tags">
//                   <span className="pyq-l-tag lt-yr">{s.playlists.length} playlist{s.playlists.length !== 1 ? "s" : ""}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {selectedSubject && (
//         <>
//           <div className="pyq-back-row">
//             <button className="pyq-btn-cancel" onClick={goBackToYears}><ArrowLeft size={16} /><span>Back</span></button>
//           </div>
//           <div className="pyq-card-grid pyq-card-grid--subjects">
//             {selectedSubject.playlists.map((pl) => {
//               const thumb = thumbUrl(pl);
//               return (
//                 <div key={pl.id} className="pyq-local-card pyq-playlist-card" onClick={() => openPlaylist(pl)} style={{ cursor: "pointer" }}>
//                   {thumb ? (
//                     <div className="pyq-pl-thumb">
//                       <img src={thumb} alt={pl.title} />
//                       <div className="pyq-pl-play-overlay"><PlayCircle size={38} /></div>
//                     </div>
//                   ) : (
//                     <div className="pyq-pl-thumb pyq-pl-thumb--empty"><ListVideo size={32} style={{ opacity: 0.4 }} /></div>
//                   )}
//                   <div className="pyq-lc-question" style={{ marginTop: 4 }}><PlayCircle size={15} /> {pl.title}</div>
//                   {pl.channel && <div className="pyq-lc-tags"><span className="pyq-l-tag lt-top">{pl.channel}</span></div>}
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // ─── QuestionCard & QuestionModal (Revision tab — unchanged logic) ────────────

// function QuestionCard({ p, onStar, onDelete, onEdit, openAnswers, onToggleAnswer }) {
//   return (
//     <div className="pyq-local-card" style={{ animationDelay: "inherit" }}>
//       <div className="pyq-lc-header">
//         <p className="pyq-lc-question pyq-lc-question--text">{esc(p.question)}</p>
//         <div className="pyq-lc-actions">
//           <button className={`pyq-icon-btn ${p.starred ? "starred" : ""}`} onClick={() => onStar(p.id)} title="Star">
//             <Star size={16} fill="currentColor" />
//           </button>
//           <button className="pyq-icon-btn edit" onClick={() => onEdit(p)} title="Edit">
//             <Pencil size={15} />
//           </button>
//           <button className="pyq-icon-btn danger" onClick={() => onDelete(p.id)} title="Delete">
//             <Trash2 size={16} />
//           </button>
//         </div>
//       </div>
//       <div className="pyq-lc-tags">
//         {p.subject && <span className="pyq-l-tag lt-sub">{esc(p.subject)}</span>}
//         {p.year    && <span className="pyq-l-tag lt-yr">{esc(p.year)}</span>}
//         {p.topic   && <span className="pyq-l-tag lt-top">{esc(p.topic)}</span>}
//         {p.marks   && <span className="pyq-l-tag lt-mk">{esc(p.marks)} marks</span>}
//       </div>
//       {p.answer && (
//         <>
//           <div className={`pyq-lc-answer ${openAnswers[p.id] ? "visible" : ""}`}>{esc(p.answer)}</div>
//           <button className="pyq-toggle-ans" onClick={() => onToggleAnswer(p.id)}>
//             {openAnswers[p.id] ? "Hide answer" : "Show answer"}
//           </button>
//         </>
//       )}
//       <div className="pyq-lc-footer">
//         <span className="pyq-lc-date">
//           {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
//         </span>
//       </div>
//     </div>
//   );
// }

// function QuestionModal({ form, setForm, onClose, onSubmit, isEditing, subjects }) {
//   const isValid = form.question.trim().length > 0;
//   return (
//     <div className="pyq-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="pyq-modal">
//         <h3>{isEditing ? "Edit Question" : "Add to My Collection"}</h3>
//         <div className="pyq-form-group">
//           <label className="pyq-form-label">Question *</label>
//           <textarea className="pyq-form-textarea" placeholder="Enter the question..." value={form.question}
//             onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} autoFocus />
//         </div>
//         <div className="pyq-form-row">
//           <div className="pyq-form-group">
//             <label className="pyq-form-label">Subject *</label>
//             <input className="pyq-form-input" placeholder="e.g. Mathematics" list="pyq-subj-list"
//               value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
//             <datalist id="pyq-subj-list">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
//           </div>
//           <div className="pyq-form-group">
//             <label className="pyq-form-label">Year</label>
//             <input className="pyq-form-input" placeholder="e.g. 2023" value={form.year}
//               onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
//           </div>
//         </div>
//         <div className="pyq-form-row">
//           <div className="pyq-form-group">
//             <label className="pyq-form-label">Topic / Unit</label>
//             <input className="pyq-form-input" placeholder="e.g. Integration" value={form.topic}
//               onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
//           </div>
//           <div className="pyq-form-group">
//             <label className="pyq-form-label">Marks</label>
//             <input className="pyq-form-input" placeholder="e.g. 5" value={form.marks}
//               onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))} />
//           </div>
//         </div>
//         <div className="pyq-form-group">
//           <label className="pyq-form-label">Answer / Key Points (optional)</label>
//           <textarea className="pyq-form-textarea" placeholder="Solution approach, key points..." value={form.answer}
//             onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
//         </div>
//         <div className="pyq-modal-actions">
//           <button className="pyq-btn-cancel" onClick={onClose}>Cancel</button>
//           <button className="pyq-btn-confirm" onClick={onSubmit} disabled={!isValid}>
//             {isEditing ? "Update Question" : "Add Question"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Root ─────────────────────────────────────────────────────────────────────

// export default function PYQsPage() {
//   const [mode, setMode] = useState("bank");

//   const [pyqs, setPyqs] = useState(() => {
//     try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; }
//     catch { return []; }
//   });

//   const [search,      setSearch]      = useState("");
//   const [filterSub,   setFilterSub]   = useState("");
//   const [filterYear,  setFilterYear]  = useState("");
//   const [filterStar,  setFilterStar]  = useState("");
//   const [openAnswers, setOpenAnswers] = useState({});
//   const [showModal,   setShowModal]   = useState(false);
//   const [editingId,   setEditingId]   = useState(null);
//   const [form,        setForm]        = useState(emptyForm);

//   useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(pyqs)); }, [pyqs]);

//   const subjects = [...new Set(pyqs.map((p) => p.subject).filter(Boolean))];
//   const years    = [...new Set(pyqs.map((p) => p.year).filter(Boolean))].sort().reverse();

//   const filtered = pyqs
//     .filter((p) => {
//       if (search     && !p.question.toLowerCase().includes(search.toLowerCase()) && !(p.topic || "").toLowerCase().includes(search.toLowerCase())) return false;
//       if (filterSub  && p.subject !== filterSub)  return false;
//       if (filterYear && p.year    !== filterYear) return false;
//       if (filterStar === "starred" && !p.starred) return false;
//       return true;
//     })
//     .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.createdAt - a.createdAt);

//   const openAddModal  = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
//   const openEditModal = (p) => { setEditingId(p.id); setForm({ question: p.question, subject: p.subject, year: p.year, topic: p.topic, marks: p.marks, answer: p.answer }); setShowModal(true); };
//   const closeModal    = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); };

//   const submitForm = () => {
//     if (!form.question.trim()) return;
//     if (editingId) {
//       setPyqs((prev) => prev.map((p) => p.id === editingId ? { ...p, ...form, question: form.question.trim() } : p));
//     } else {
//       setPyqs((prev) => [{ id: uid(), ...form, question: form.question.trim(), starred: false, createdAt: Date.now() }, ...prev]);
//     }
//     closeModal();
//   };

//   const toggleStar   = (id) => setPyqs((prev) => prev.map((p) => p.id === id ? { ...p, starred: !p.starred } : p));
//   const deletePYQ    = (id) => { if (!window.confirm("Delete this question?")) return; setPyqs((prev) => prev.filter((p) => p.id !== id)); };
//   const toggleAnswer = (id) => setOpenAnswers((prev) => ({ ...prev, [id]: !prev[id] }));

//   return (
//     <div className="pyq-page">
//       <div className="pyq-mode-bar">
//         <button className={`pyq-mode-tab ${mode === "bank"      ? "active" : ""}`} onClick={() => setMode("bank")}>
//           <span className="tab-content"><BookOpen size={16} /><span>Pyq's</span></span>
//         </button>
//         <button className={`pyq-mode-tab ${mode === "mine"      ? "active" : ""}`} onClick={() => setMode("mine")}>
//           <span className="tab-content"><FolderOpen size={16} /><span>Revision</span></span>
//         </button>
//         <button className={`pyq-mode-tab ${mode === "playlists" ? "active" : ""}`} onClick={() => setMode("playlists")}>
//           <span className="tab-content"><ListVideo size={16} /><span>Playlists</span></span>
//         </button>
//       </div>

//       {mode === "bank"      && <ClassBank />}
//       {mode === "playlists" && <Playlists />}

//       {mode === "mine" && (
//         <div className="pyq-wrap">
//           <div className="pyq-header">
//             <div>
//               <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}><FolderOpen size={30} /> Revision</h1>
//               <p>Add Your Own questions.</p>
//             </div>
//             <button className="pyq-btn-add" onClick={openAddModal}>+ Add PYQ</button>
//           </div>
//           <div className="pyq-stats-strip">
//             <div className="pyq-strip-item">Total: <strong>{pyqs.length}</strong></div>
//             <div className="pyq-strip-item">Showing: <strong>{filtered.length}</strong></div>
//             <div className="pyq-strip-item">Subjects: <strong>{subjects.length}</strong></div>
//             <div className="pyq-strip-item">Starred: <strong>{pyqs.filter((p) => p.starred).length}</strong></div>
//           </div>
//           <div className="pyq-toolbar">
//             <div className="search-box">
//               <Search size={16} />
//               <input className="pyq-search" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
//             </div>
//             <select className="pyq-select" value={filterSub}  onChange={(e) => setFilterSub(e.target.value)}>
//               <option value="">All Subjects</option>
//               {subjects.map((s) => <option key={s}>{s}</option>)}
//             </select>
//             <select className="pyq-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
//               <option value="">All Years</option>
//               {years.map((y) => <option key={y}>{y}</option>)}
//             </select>
//             <select className="pyq-select" value={filterStar} onChange={(e) => setFilterStar(e.target.value)}>
//               <option value="">All</option>
//               <option value="starred">Starred</option>
//             </select>
//           </div>
//           {filtered.length === 0 ? (
//             <div className="pyq-state-box">
//               <div className="pyq-s-icon"><FolderOpen size={16} /></div>
//               <h3>{pyqs.length ? "No matches" : "Your collection is empty"}</h3>
//               <p>{pyqs.length ? "Try adjusting your filters." : 'Tap "+ Add PYQ" to start building your personal bank.'}</p>
//             </div>
//           ) : (
//             <div className="pyq-grid">
//               {filtered.map((p, i) => (
//                 <div key={p.id} style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}>
//                   <QuestionCard p={p} onStar={toggleStar} onDelete={deletePYQ} onEdit={openEditModal} openAnswers={openAnswers} onToggleAnswer={toggleAnswer} />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {showModal && (
//         <QuestionModal form={form} setForm={setForm} onClose={closeModal} onSubmit={submitForm} isEditing={!!editingId} subjects={subjects} />
//       )}
//     </div>
//   );
// }


import { useState, useEffect, useRef, useCallback } from "react";
import "./pyqs.css";
import {
  BookOpen, Star, Trash2, FileText, Search,
  ListVideo, PlayCircle, Pencil, Home, ArrowLeft,
  CheckSquare, Square, Save, ExternalLink, FolderOpen, Folder,
  Image, FileQuestion,
} from "lucide-react";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const esc = (s) => String(s ?? "");

const STORAGE_KEY = "edubits_local_pyqs";

const emptyForm = { question: "", subject: "", year: "", topic: "", marks: "", answer: "" };

// ─── Data ────────────────────────────────────────────────────────────────────

const PAPER_SOURCES = [
  {
    year: "1st Year",
    image: "../public/images/1st.svg",
    subjects: [
      {
        subject: "Mathematics-II",
        image: "../public/images/maths2.svg",
        papers: [
          { id: "math-mst1",  title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1587LMIzAkGPijJ7FbCS8qpiTB3lUKqsK/preview", solutionUrl: "" },
          { id: "math-mst2",  title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/16Q-zKnfSGzNTlJLafuKthQ8JloxISB1A/preview", solutionUrl: "" },
          { id: "math-est1",  title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/10E2i7EtHD6_WJuVSL-1u7kgmNjF3DgR0/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Digital Electronics",
        image: "../public/images/fede.svg",
        papers: [
          { id: "de-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1ImyfrlPSahDY7jn6llVrNWPgdZObh6re/preview", solutionUrl: "" },
          { id: "de-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1X7MXH57AHA-uLCG2aORk-TAWQF_fgyWc/preview", solutionUrl: "" },
          { id: "de-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1BPyBOPekIi3N7b2i-oW5AfEfoCd5kFQB/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Engineering Physics",
        image: "../public/images/ep.svg",
        papers: [
          { id: "ep-mst1", title: "MST 1", type: "pdf", url: "", solutionUrl: "" },
          { id: "ep-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1w8Ialuz1Yfa-bJ4XEwJJsTSu6CHbsalw/preview", solutionUrl: "" },
          { id: "ep-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1w8Ialuz1Yfa-bJ4XEwJJsTSu6CHbsalw/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "DSA",
        image: "../public/images/dsa.svg",
        papers: [
          { id: "dsa-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1o6z_egRoKrI7WTkwA5tT5tZbGwMH1mHC/preview", solutionUrl: "" },
          { id: "dsa-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1X0qFl7mR3sOcwiulVyfWfYPf3HS60TFL/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Biology",
        image: "../public/images/bio.svg",
        papers: [
          { id: "bio-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1ofSik_XcO2gGTUvsdFZdT_2th-K_sj8y/preview", solutionUrl: "" },
          { id: "bio-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1sMChNTNpI8137MsNZoocTz11BhJOowgr/preview", solutionUrl: "" },
          { id: "bio-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/19IDIHzvpaCe4gbi-pekZ850hKJtHxsWq/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Semi-conductor Physics",
        image: "../public/images/semi.svg",
        papers: [
          { id: "sc-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1PZSdjk16DTnpNGj0tSjwIGcFkLHoHtGs/preview", solutionUrl: "" },
          { id: "sc-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1F1Yw8lMvORhKcyIPWrL6ZMSJjz-McPCI/preview", solutionUrl: "" },
          { id: "sc-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1EOjUvk0nwY3JuBDXUcW9maXTjmio5N-V/preview", solutionUrl: "" },
        ],
      },
    ],
  },
  {
    year: "2nd Year",
    image: "../public/images/2nd.svg",
    subjects: [
      {
        subject: "COA",
        image: "../public/images/coa.svg",
        papers: [
          { id: "coa-2022",  title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1uDjwVvsbKiJA9PgOTaVfzvHfwsQrCmJ8/preview", solutionUrl: "" },
          { id: "coa-2024",  title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1MZvRTq6k1Lqm42U1MEr7LK-VWWzSGPzA/preview", solutionUrl: "" },
          { id: "coa-2025a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1tluGNXvQpey4jKaZQFfhEHfrRboqbszd/preview", solutionUrl: "" },
          { id: "coa-2025b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview", solutionUrl: "" },
          { id: "coa-2025c", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview", solutionUrl: "" },
          { id: "coa-2025d", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/18XKNGn-THu2wY-D7HOo5CqQwjf4JLeFO/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Software Engineering",
        image: "../public/images/se.svg",
        papers: [
          { id: "se-imp",   title: "Important Questions", type: "pdf", url: "https://drive.google.com/file/d/1sAZN2omjcdJdDbsW5-6EM4jQvzWvRYoI/preview", solutionUrl: "" },
          { id: "se-2022a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1pJDM_KSEQ1LHwz_UzBWVvNXcnFUqQZQq/preview", solutionUrl: "" },
          { id: "se-2022b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1R_QhIPBYq1ZArm-eLCWSNLKkmcnGHYKR/preview", solutionUrl: "" },
          { id: "se-2022c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1HIR21u97EsUwdS_OYo90S_1v2IugH55J/preview", solutionUrl: "" },
          { id: "se-2023",  title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/19mdIZ9ywBlvGKHLnePq2RTTKE_RX58Px/preview", solutionUrl: "" },
          { id: "se-2024a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1nLLO_IjC9bg_V2eoQBe0233sGiLY7afo/preview", solutionUrl: "" },
          { id: "se-2024b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1a9JYBJVNxovUmfgzTKDeLg8o-YszreKx/preview", solutionUrl: "" },
          { id: "se-2024c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/1d3l8mUn9-mAxc1c72cgSA20KPH1Dvf4E/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Operating System",
        image: "../public/images/os.svg",
        papers: [
          { id: "os-0001",  title: "Important Questions", type: "pdf", url: "https://drive.google.com/file/d/1BDOxxGa8fSZqkXKLhtGEqrw4hl4QclIa/preview", solutionUrl: "" },
          { id: "os-2022a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1ibJ2ZWG07kPhpM2LU4chLAjGlL3Oa9G0/preview", solutionUrl: "" },
          { id: "os-2022b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1c5EMRXj_LgBRUlRNhWuVGzEPMIVpYYE5/preview", solutionUrl: "" },
          { id: "os-2022c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1sB0qONnGQyWnVJ_o6qE8VKZp3P3WvwSh/preview", solutionUrl: "" },
          { id: "os-2022d", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/13qidPE9bYiAV_a_8l7YvlwtQ4TmkqlSE/preview", solutionUrl: "" },
          { id: "os-2023a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1dC1ZwltNWd-7ovYM_hZTEsqF8J8z_SXV/preview", solutionUrl: "" },
          { id: "os-2023b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1VxjuTujtJ58PeuNHFXrRX_3fHSz4gQvm/preview", solutionUrl: "" },
          { id: "os-2023c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/1U3_WL0hT1MzuOuGafpzIZnLzEov9MRVu/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "DAA",
        image: "../public/images/daa.svg",
        papers: [
          { id: "daa-2023a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1znMw3Ve4W4oDl3Vf4UYsjiGk2pz4aQkn/preview", solutionUrl: "" },
          { id: "daa-2023b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1bc6iNabOnpnVXRqXGmkGpQ7IEhWL1ylQ/preview", solutionUrl: "" },
          { id: "daa-2024a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/13uQsoRoDsmP2Lvo_ktQH5GxW_eJ_zI8w/preview", solutionUrl: "" },
          { id: "daa-2024b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1-LSsXZPLpzim7xwRAVECGbzQMZFVkfta/preview", solutionUrl: "" },
          { id: "daa-2025a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1o8mupEYR7D_JGPrVwlhtpkPtcOE8l2fj/preview", solutionUrl: "" },
          { id: "daa-2025b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1gTwV6kOFFsOxxVzrYdvh1iHpWJiZcjFw/preview", solutionUrl: "" },
          { id: "daa-2025c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/17s5yiB5v2mD7MRirNE-QVR7dxW3EH97b/preview", solutionUrl: "" },
          { id: "daa-2025d", title: "Practice 7", type: "pdf", url: "https://drive.google.com/file/d/1JBF1TEgivsa0zPPDa50fCX0Nepp5D3NW/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Java",
        image: "../public/images/java.svg",
        papers: [
          { id: "java-2023a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1OpVDi58n9svRTlENe52f0f6K1renT3h9/preview", solutionUrl: "" },
          { id: "java-2023b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1U8gHgZDSz0QXi8mhsuOMXBsyrpPutw1d/preview", solutionUrl: "" },
          { id: "java-2024a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/16HxigLF5npg1umcBShN67_R3IhXNkBVh/preview", solutionUrl: "" },
          { id: "java-2024b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/16Ywzd3EMTsLiuWowS_I-Ij4EvQWw2xXJ/preview", solutionUrl: "" },
          { id: "java-2024c", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1mkGH3kYWVWrlXIeNdd-2rIImEtEOynDU/preview", solutionUrl: "" },
          { id: "java-2025",  title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1M-JH-3kbRj-8iXT5dOmPwOczBPMCnD9N/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Machine Learning",
        image: "../public/images/ml.svg",
        papers: [
          { id: "ml-2022", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1Xmg5pZTivaf1kV0MFZji-tctGyzvVAu1/preview", solutionUrl: "" },
          { id: "ml-2023", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1neFnvSVhotcJ3PCb__tsBpe0P9YO5Jl5/preview", solutionUrl: "" },
          { id: "ml-2024", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1JAEamc0IeuZXG883wen66p8ogZ2XZqOG/preview", solutionUrl: "" },
          { id: "ml-2025", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1STPAAosbaysOEOzxRfPWb5tWPjsw87kz/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "DBMS",
        image: "../public/images/dbms.svg",
        papers: [
          { id: "dbms-2025a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1EUtt2fQUohcXi2GBvlJwf2l2oiOpj-NZ/preview", solutionUrl: "" },
          { id: "dbms-2025b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1uCINIGKBrvVXouiXgbCaUzl_KIw0ptDe/preview", solutionUrl: "" },
          { id: "dbms-2025c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1AbsWHulThFsr_Mhsz1NsiGM8RyWAEnEo/preview", solutionUrl: "" },
          { id: "dbms-2025d", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/10hgvm-jo_9lH4GGYZXybkK_WnyJQblA6/preview", solutionUrl: "" },
        ],
      },
    ],
  },
  {
    year: "3rd Year",
    image: "../public/images/3rd.svg",
    subjects: [],
  },
  {
    year: "4th Year",
    image: "../public/images/4th.svg",
    subjects: [],
  },
];

const PLAYLIST_SOURCES = [
  {
    year: "1st Year",
    subjects: [
      {
        subject: "Mathematics-II",
        playlists: [
          { id: "math2-p1", title: "Complete Math-II Course", channel: "Will add soon.", playlistId: "PLxyz", thumbVideoId: "" },
        ],
      },
    ],
  },
  {
    year: "2nd Year",
    subjects: [
      {
        subject: "Software Engineering",
        playlists: [
          { id: "se-all", title: "Complete SE Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiEed7SKZBnC6ypFDWYLRvB2", thumbVideoId: "kcvEiMFOcoE" },
        ],
      },
      {
        subject: "OOPS Using Java",
        playlists: [
          { id: "java-all", title: "Complete Java Playlist", channel: "Easy Engineering Classes", playlistId: "PLV8vIYTIdSnbL_fSaqiYpPh-KwNCavjIr", thumbVideoId: "4Y0N43i2RNs" },
        ],
      },
      {
        subject: "Operating System",
        playlists: [
          { id: "os-all", title: "Complete OS Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", thumbVideoId: "WJ-UaAaumNA" },
          { id: "os-og",  title: "OS One Shot",          channel: "5 Minutes Engineering", playlistId: "PLhx1hByyAqsYn0JMNNPN-uFiLb0XdZtSG", thumbVideoId: "A4G0hOI6XyQ" },
        ],
      },
      {
        subject: "DAA",
        playlists: [
          { id: "daa-p1", title: "DAA Unit 1", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsZ3ZMkKbN9FcSUYad1ShZ3G", thumbVideoId: "0IAPZzGSbME" },
          { id: "daa-p2", title: "DAA Unit 2", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsbCKEJu0ntERx33fTeNigw2", thumbVideoId: "I8w2XN0w-fQ" },
          { id: "daa-p3", title: "DAA Unit 3", channel: "Striver",        playlistId: "PLhx1hByyAqsaJcVgBApIKLaKucaRpW3Om", thumbVideoId: "M3_pLsDdeuU" },
        ],
      },
      {
        subject: "DBMS",
        playlists: [
          { id: "dbms-p1", title: "DBMS Unit 2", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsYFoBvR5gjsfw2qQHfI4IiO", thumbVideoId: "5GDTIUVlHB8" },
        ],
      },
      {
        subject: "COA",
        playlists: [
          { id: "coa-p1", title: "Complete COA Playlist", channel: "5 Minutes Engineering", playlistId: "PLYwpaL_SFmcCaiXeUEjcTzHwIfJqH1qCN", thumbVideoId: "1rUevQ3bSEY" },
        ],
      },
    ],
  },
];

// ─── Progress hook (localStorage) ────────────────────────────────────────────

const PROGRESS_KEY = "edubits_pyq_progress";

function loadProgressMap() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) ?? {}; }
  catch { return {}; }
}

function useProgress() {
  const [progressMap, setProgressMap] = useState(loadProgressMap);

  const saveProgress = useCallback((paperId, patch) => {
    setProgressMap((prev) => {
      const existing = prev[paperId] ?? { paperId, attempted: false, notes: "" };
      const updated  = { ...existing, ...patch };
      const next     = { ...prev, [paperId]: updated };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { progressMap, saveProgress };
}

// ─── ClassBank ────────────────────────────────────────────────────────────────

function ClassBank() {
  const { progressMap, saveProgress } = useProgress();

  const [selectedYear,    setSelectedYear]    = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedPaper,   setSelectedPaper]   = useState(null);

  const openPaper        = (paper) => setSelectedPaper(paper);
  const goBackToSubjects = () => setSelectedPaper(null);
  const goBackToYears    = () => { setSelectedSubject(null); setSelectedPaper(null); };
  const goHome           = () => { setSelectedYear(null); setSelectedSubject(null); setSelectedPaper(null); };

  const handleSavePaper = useCallback((paperId, patch) => {
    saveProgress(paperId, patch);
  }, [saveProgress]);

  const subjectProgress = selectedSubject
    ? {
        total:     selectedSubject.papers.length,
        attempted: selectedSubject.papers.filter((p) => progressMap[p.id]?.attempted).length,
      }
    : null;

  return (
    <div className="pyq-wrap">
      {/* Header */}
      <div className="pyq-header">
        <div className="pyq-header-top">
          <h1 className="pyq-title"><BookOpen size={27} /> PYQ's</h1>
          {(selectedYear || selectedSubject || selectedPaper) && (
            <button className="pyq-btn-home" onClick={goHome}><Home size={16} /><span>Home</span></button>
          )}
        </div>
        {(selectedYear || selectedSubject || selectedPaper) && (
          <div className="pyq-header-sub">
            {selectedPaper
              ? selectedPaper.title
              : selectedSubject
              ? selectedSubject.subject
              : selectedYear.year}
          </div>
        )}
      </div>

      {/* Progress bar — shown when inside a subject */}
      {selectedSubject && !selectedPaper && subjectProgress && (
        <div className="pyq-progress-wrap">
          <div className="pyq-progress-label">
            <span>Attempted</span>
            <span>{subjectProgress.attempted} / {subjectProgress.total}</span>
          </div>
          <div className="pyq-progress-track">
            <div
              className="pyq-progress-fill"
              style={{ width: `${(subjectProgress.attempted / subjectProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Year grid */}
      {!selectedYear && (
        <div className="pyq-card-grid pyq-card-grid--years">
          {PAPER_SOURCES.map((y) => (
            <div
              key={y.year}
              className="pyq-thumb-card"
              onClick={() => y.subjects.length > 0 && setSelectedYear(y)}
              style={{ cursor: y.subjects.length > 0 ? "pointer" : "default" }}
            >
              <div className="pyq-thumb-img-wrap">
                <img src={y.image} alt={y.year} className="pyq-thumb-img" />
                {y.subjects.length === 0 && (
                  <div className="pyq-thumb-overlay pyq-thumb-overlay--soon">
                    <span>Coming Soon</span>
                  </div>
                )}
              </div>
              <div className="pyq-thumb-title">{y.year}</div>
            </div>
          ))}
        </div>
      )}

      {/* Subject grid */}
      {selectedYear && !selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goHome}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-card-grid pyq-card-grid--subjects">
            {selectedYear.subjects.map((s) => {
              const total     = s.papers.length;
              const attempted = s.papers.filter((p) => progressMap[p.id]?.attempted).length;
              return (
                <div
                  key={s.subject}
                  className="pyq-thumb-card"
                  onClick={() => setSelectedSubject(s)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="pyq-thumb-img-wrap">
                    <img src={s.image} alt={s.subject} className="pyq-thumb-img" />
                  </div>
                  <div className="pyq-thumb-title">{s.subject}</div>
                  <div className="pyq-thumb-sub">{attempted}/{total} attempted</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Paper grid */}
      {selectedSubject && !selectedPaper && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goBackToYears}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-card-grid pyq-card-grid--papers">
            {selectedSubject.papers.map((paper) => {
              const prog      = progressMap[paper.id];
              const attempted = prog?.attempted ?? false;
              return (
                <div key={paper.id} className={`pyq-thumb-card pyq-thumb-card--paper ${attempted ? "pyq-thumb-card--done" : ""}`}>
                  <div
                    className="pyq-thumb-img-wrap"
                    onClick={() => openPaper(paper)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={selectedSubject.image} alt={paper.title} className="pyq-thumb-img" />
                    <div className="pyq-thumb-overlay pyq-thumb-overlay--hover">
                      <FileText size={28} />
                      <span>Open</span>
                    </div>
                    {attempted && (
                      <div className="pyq-thumb-done-badge">
                        <CheckSquare size={14} /> Done
                      </div>
                    )}
                  </div>
                  <div className="pyq-paper-card-footer">
                    <span className="pyq-thumb-title">{paper.title}</span>
                    <button
                      className={`pyq-attempt-btn ${attempted ? "pyq-attempt-btn--done" : ""}`}
                      onClick={() => handleSavePaper(paper.id, { attempted: !attempted })}
                      title={attempted ? "Mark as not attempted" : "Mark as attempted"}
                    >
                      {attempted ? <CheckSquare size={15} /> : <Square size={15} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Paper view — PDF + notes + solutions */}
      {selectedPaper && (
        <PaperView
          paper={selectedPaper}
          progress={progressMap[selectedPaper.id]}
          onSaveProgress={handleSavePaper}
          onBack={goBackToSubjects}
        />
      )}
    </div>
  );
}

// ─── PaperView ────────────────────────────────────────────────────────────────

function PaperView({ paper, progress, onSaveProgress, onBack }) {
  const [notes,      setNotes]      = useState(progress?.notes ?? "");
  const [attempted,  setAttempted]  = useState(progress?.attempted ?? false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const debounceRef = useRef(null);

  // Only sync from external progress when the paper itself changes, not on every re-render
  useEffect(() => {
    setNotes(progress?.notes ?? "");
    setAttempted(progress?.attempted ?? false);
  }, [paper.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const persistNotes = useCallback((val) => {
    setSaveStatus("saving");
    onSaveProgress(paper.id, { notes: val });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [onSaveProgress, paper.id]);

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus("idle");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persistNotes(val), 800);
  };

  const handleManualSave = () => {
    clearTimeout(debounceRef.current);
    persistNotes(notes);
  };

  const toggleAttempted = () => {
    const next = !attempted;
    setAttempted(next);
    onSaveProgress(paper.id, { attempted: next });
  };

  return (
    <>
      <div className="pyq-back-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="pyq-btn-cancel" onClick={onBack}><ArrowLeft size={16} /><span>Back</span></button>
        <button
          className={`pyq-attempt-inline-btn ${attempted ? "pyq-attempt-inline-btn--done" : ""}`}
          onClick={toggleAttempted}
        >
          {attempted ? <CheckSquare size={15} /> : <Square size={15} />}
          <span>{attempted ? "Attempted" : "Mark as attempted"}</span>
        </button>
      </div>

      {/* PDF */}
      <div className="pyq-pdf-wrap">
        <a
          href={paper.url.replace("/preview", "/view")}
          target="_blank"
          rel="noopener noreferrer"
          className="pyq-open-tab-btn"
        >
          <ExternalLink size={14} /> Open in tab
        </a>
        <iframe src={paper.url} title={paper.title} className="pyq-pdf-iframe" />
      </div>

      {/* Solutions */}
      {paper.solutionUrl && (
        <div className="pyq-section-block">
          <h3 className="pyq-section-heading">Solutions</h3>
          <div className="pyq-pdf-wrap">
            <a
              href={paper.solutionUrl.replace("/preview", "/view")}
              target="_blank"
              rel="noopener noreferrer"
              className="pyq-open-tab-btn"
            >
              <ExternalLink size={14} /> Open in tab
            </a>
            <iframe src={paper.solutionUrl} title={`${paper.title} — Solution`} className="pyq-pdf-iframe" />
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="pyq-section-block">
        <div className="pyq-notes-header">
          <h3 className="pyq-section-heading">My Notes</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {saveStatus === "saving" && <span className="pyq-save-status">Saving…</span>}
            {saveStatus === "saved"  && <span className="pyq-save-status pyq-save-status--ok">Saved ✓</span>}
            <button className="pyq-manual-save-btn" onClick={handleManualSave}>
              <Save size={14} /> Save
            </button>
          </div>
        </div>
        <textarea
          className="pyq-notes-area"
          placeholder="Write your notes, key points, or observations here…"
          value={notes}
          onChange={handleNotesChange}
        />
      </div>
    </>
  );
}

// ─── Playlists ────────────────────────────────────────────────────────────────

function Playlists() {
  const [selectedYear,    setSelectedYear]    = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const goHome        = () => { setSelectedYear(null); setSelectedSubject(null); };
  const goBackToYears = () => setSelectedSubject(null);
  const openPlaylist  = (pl) => window.open(`https://www.youtube.com/playlist?list=${pl.playlistId}`, "_blank", "noopener,noreferrer");
  const thumbUrl      = (pl) => pl.thumbVideoId ? `https://img.youtube.com/vi/${pl.thumbVideoId}/hqdefault.jpg` : "";

  return (
    <div className="pyq-wrap">
      <div className="pyq-header">
        <div className="pyq-header-top">
          <h1 className="pyq-title"><ListVideo size={27} /> Playlists</h1>
          {(selectedYear || selectedSubject) && (
            <button className="pyq-btn-home" onClick={goHome}><Home size={16} /><span>Home</span></button>
          )}
        </div>
        <div className="pyq-header-sub">
          {selectedSubject ? selectedSubject.subject : selectedYear ? selectedYear.year : "Select a folder"}
        </div>
      </div>

      {!selectedYear && (
        <div className="pyq-card-grid pyq-card-grid--years">
          {PLAYLIST_SOURCES.map((y) => (
            <div key={y.year} className="pyq-local-card" onClick={() => setSelectedYear(y)} style={{ cursor: "pointer" }}>
              <div className="pyq-lc-question"><Folder size={16} /> {y.year}</div>
              <div className="pyq-lc-tags"><span className="pyq-l-tag lt-sub">{y.subjects.length} subjects</span></div>
            </div>
          ))}
        </div>
      )}

      {selectedYear && !selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goHome}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-card-grid pyq-card-grid--subjects">
            {selectedYear.subjects.map((s) => (
              <div key={s.subject} className="pyq-local-card" onClick={() => setSelectedSubject(s)} style={{ cursor: "pointer" }}>
                <div className="pyq-lc-question"><FolderOpen size={16} /> {s.subject}</div>
                <div className="pyq-lc-tags">
                  <span className="pyq-l-tag lt-yr">{s.playlists.length} playlist{s.playlists.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSubject && (
        <>
          <div className="pyq-back-row">
            <button className="pyq-btn-cancel" onClick={goBackToYears}><ArrowLeft size={16} /><span>Back</span></button>
          </div>
          <div className="pyq-card-grid pyq-card-grid--subjects">
            {selectedSubject.playlists.map((pl) => {
              const thumb = thumbUrl(pl);
              return (
                <div key={pl.id} className="pyq-local-card pyq-playlist-card" onClick={() => openPlaylist(pl)} style={{ cursor: "pointer" }}>
                  {thumb ? (
                    <div className="pyq-pl-thumb">
                      <img src={thumb} alt={pl.title} />
                      <div className="pyq-pl-play-overlay"><PlayCircle size={38} /></div>
                    </div>
                  ) : (
                    <div className="pyq-pl-thumb pyq-pl-thumb--empty"><ListVideo size={32} style={{ opacity: 0.4 }} /></div>
                  )}
                  <div className="pyq-lc-question" style={{ marginTop: 4 }}><PlayCircle size={15} /> {pl.title}</div>
                  {pl.channel && <div className="pyq-lc-tags"><span className="pyq-l-tag lt-top">{pl.channel}</span></div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── QuestionCard & QuestionModal (Revision tab — unchanged logic) ────────────

function QuestionCard({ p, onStar, onDelete, onEdit, openAnswers, onToggleAnswer }) {
  return (
    <div className="pyq-local-card" style={{ animationDelay: "inherit" }}>
      <div className="pyq-lc-header">
        <p className="pyq-lc-question pyq-lc-question--text">{esc(p.question)}</p>
        <div className="pyq-lc-actions">
          <button className={`pyq-icon-btn ${p.starred ? "starred" : ""}`} onClick={() => onStar(p.id)} title="Star">
            <Star size={16} fill="currentColor" />
          </button>
          <button className="pyq-icon-btn edit" onClick={() => onEdit(p)} title="Edit">
            <Pencil size={15} />
          </button>
          <button className="pyq-icon-btn danger" onClick={() => onDelete(p.id)} title="Delete">
            <Trash2 size={16} />
          </button>
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
          <div className={`pyq-lc-answer ${openAnswers[p.id] ? "visible" : ""}`}>{esc(p.answer)}</div>
          <button className="pyq-toggle-ans" onClick={() => onToggleAnswer(p.id)}>
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
  );
}

function QuestionModal({ form, setForm, onClose, onSubmit, isEditing, subjects }) {
  const isValid = form.question.trim().length > 0;
  return (
    <div className="pyq-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pyq-modal">
        <h3>{isEditing ? "Edit Question" : "Add to My Collection"}</h3>
        <div className="pyq-form-group">
          <label className="pyq-form-label">Question *</label>
          <textarea className="pyq-form-textarea" placeholder="Enter the question..." value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} autoFocus />
        </div>
        <div className="pyq-form-row">
          <div className="pyq-form-group">
            <label className="pyq-form-label">Subject *</label>
            <input className="pyq-form-input" placeholder="e.g. Mathematics" list="pyq-subj-list"
              value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            <datalist id="pyq-subj-list">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
          </div>
          <div className="pyq-form-group">
            <label className="pyq-form-label">Year</label>
            <input className="pyq-form-input" placeholder="e.g. 2023" value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
          </div>
        </div>
        <div className="pyq-form-row">
          <div className="pyq-form-group">
            <label className="pyq-form-label">Topic / Unit</label>
            <input className="pyq-form-input" placeholder="e.g. Integration" value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
          </div>
          <div className="pyq-form-group">
            <label className="pyq-form-label">Marks</label>
            <input className="pyq-form-input" placeholder="e.g. 5" value={form.marks}
              onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))} />
          </div>
        </div>
        <div className="pyq-form-group">
          <label className="pyq-form-label">Answer / Key Points (optional)</label>
          <textarea className="pyq-form-textarea" placeholder="Solution approach, key points..." value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
        </div>
        <div className="pyq-modal-actions">
          <button className="pyq-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pyq-btn-confirm" onClick={onSubmit} disabled={!isValid}>
            {isEditing ? "Update Question" : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function PYQsPage() {
  const [mode, setMode] = useState("bank");

  const [pyqs, setPyqs] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const [search,      setSearch]      = useState("");
  const [filterSub,   setFilterSub]   = useState("");
  const [filterYear,  setFilterYear]  = useState("");
  const [filterStar,  setFilterStar]  = useState("");
  const [openAnswers, setOpenAnswers] = useState({});
  const [showModal,   setShowModal]   = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form,        setForm]        = useState(emptyForm);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(pyqs)); }, [pyqs]);

  const subjects = [...new Set(pyqs.map((p) => p.subject).filter(Boolean))];
  const years    = [...new Set(pyqs.map((p) => p.year).filter(Boolean))].sort().reverse();

  const filtered = pyqs
    .filter((p) => {
      if (search     && !p.question.toLowerCase().includes(search.toLowerCase()) && !(p.topic || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSub  && p.subject !== filterSub)  return false;
      if (filterYear && p.year    !== filterYear) return false;
      if (filterStar === "starred" && !p.starred) return false;
      return true;
    })
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.createdAt - a.createdAt);

  const openAddModal  = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEditModal = (p) => { setEditingId(p.id); setForm({ question: p.question, subject: p.subject, year: p.year, topic: p.topic, marks: p.marks, answer: p.answer }); setShowModal(true); };
  const closeModal    = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); };

  const submitForm = () => {
    if (!form.question.trim()) return;
    if (editingId) {
      setPyqs((prev) => prev.map((p) => p.id === editingId ? { ...p, ...form, question: form.question.trim() } : p));
    } else {
      setPyqs((prev) => [{ id: uid(), ...form, question: form.question.trim(), starred: false, createdAt: Date.now() }, ...prev]);
    }
    closeModal();
  };

  const toggleStar   = (id) => setPyqs((prev) => prev.map((p) => p.id === id ? { ...p, starred: !p.starred } : p));
  const deletePYQ    = (id) => { if (!window.confirm("Delete this question?")) return; setPyqs((prev) => prev.filter((p) => p.id !== id)); };
  const toggleAnswer = (id) => setOpenAnswers((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="pyq-page">
      <div className="pyq-mode-bar">
        <button className={`pyq-mode-tab ${mode === "bank"      ? "active" : ""}`} onClick={() => setMode("bank")}>
          <span className="tab-content"><BookOpen size={16} /><span>Pyq's</span></span>
        </button>
        <button className={`pyq-mode-tab ${mode === "mine"      ? "active" : ""}`} onClick={() => setMode("mine")}>
          <span className="tab-content"><FolderOpen size={16} /><span>Revision</span></span>
        </button>
        <button className={`pyq-mode-tab ${mode === "playlists" ? "active" : ""}`} onClick={() => setMode("playlists")}>
          <span className="tab-content"><ListVideo size={16} /><span>Playlists</span></span>
        </button>
      </div>

      {mode === "bank"      && <ClassBank />}
      {mode === "playlists" && <Playlists />}

      {mode === "mine" && (
        <div className="pyq-wrap">
          <div className="pyq-header">
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}><FolderOpen size={30} /> Revision</h1>
              <p>Add Your Own questions.</p>
            </div>
            <button className="pyq-btn-add" onClick={openAddModal}>+ Add PYQ</button>
          </div>
          <div className="pyq-stats-strip">
            <div className="pyq-strip-item">Total: <strong>{pyqs.length}</strong></div>
            <div className="pyq-strip-item">Showing: <strong>{filtered.length}</strong></div>
            <div className="pyq-strip-item">Subjects: <strong>{subjects.length}</strong></div>
            <div className="pyq-strip-item">Starred: <strong>{pyqs.filter((p) => p.starred).length}</strong></div>
          </div>
          <div className="pyq-toolbar">
            <div className="search-box">
              <Search size={16} />
              <input className="pyq-search" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="pyq-select" value={filterSub}  onChange={(e) => setFilterSub(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="pyq-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
            <select className="pyq-select" value={filterStar} onChange={(e) => setFilterStar(e.target.value)}>
              <option value="">All</option>
              <option value="starred">Starred</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="pyq-state-box">
              <div className="pyq-s-icon"><FolderOpen size={16} /></div>
              <h3>{pyqs.length ? "No matches" : "Your collection is empty"}</h3>
              <p>{pyqs.length ? "Try adjusting your filters." : 'Tap "+ Add PYQ" to start building your personal bank.'}</p>
            </div>
          ) : (
            <div className="pyq-grid">
              {filtered.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}>
                  <QuestionCard p={p} onStar={toggleStar} onDelete={deletePYQ} onEdit={openEditModal} openAnswers={openAnswers} onToggleAnswer={toggleAnswer} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <QuestionModal form={form} setForm={setForm} onClose={closeModal} onSubmit={submitForm} isEditing={!!editingId} subjects={subjects} />
      )}
    </div>
  );
}