import { useState, useEffect, useRef, useCallback } from "react";
import { trackEvent } from "../../utils/analytics";
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

const PAPER_SOURCES = [
  {
    year: "1st Year",
    image: "/images/1st.svg",
    subjects: [
      {
        subject: "Mathematics-I",
        image: "/images/maths2.svg",
        papers: [
          // { id: "math-mst1",  title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1587LMIzAkGPijJ7FbCS8qpiTB3lUKqsK/preview", solutionUrl: "" },
          // { id: "math-mst2",  title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/16Q-zKnfSGzNTlJLafuKthQ8JloxISB1A/preview", solutionUrl: "" },
          // { id: "math-est1",  title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/10E2i7EtHD6_WJuVSL-1u7kgmNjF3DgR0/preview", solutionUrl: "" },
          { id: "math-mst1",  title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1SHASHyHuVHyFFHRtY98qOm2WTyeb9JZi/preview", solutionUrl: "" }, 
        ],
      },
      {
        subject: "Digital Electronics",
        image: "/images/fede.svg",
        papers: [
           { id: "de-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1DT1ZcQQJed1XBjpt0KYtI-5caziuvjnk/preview", solutionUrl: "" },
          // { id: "de-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1X7MXH57AHA-uLCG2aORk-TAWQF_fgyWc/preview", solutionUrl: "" },
          // { id: "de-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1BPyBOPekIi3N7b2i-oW5AfEfoCd5kFQB/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Engineering Physics",
        image: "/images/ep.svg",
        papers: [
           { id: "ep-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1cEV_CehOoDN-Brb36PrTv_PwuIfDLoho/preview", solutionUrl: "" },
          // { id: "ep-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1yeOJ3gkZiyvUheOzfQusK1aIzvhzT5z2/preview", solutionUrl: "" },
          // { id: "ep-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1bbhygnl7EsdvdQxeiciUztm_a72ZFxdA/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "LTPS",
        image: "/images/dsa.svg",
        papers: [
          { id: "dsa-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1J8YpqOEmQZSET_MtDLTim98OpD6m55ia/preview", solutionUrl: "" },
          // { id: "dsa-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1X0qFl7mR3sOcwiulVyfWfYPf3HS60TFL/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Biology",
        image: "/images/bio.svg",
        papers: [
          { id: "bio-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1B99tsBJjJSHS4q1En8y1UJLFZ0-AqKAd/preview", solutionUrl: "" },
          // { id: "bio-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1sMChNTNpI8137MsNZoocTz11BhJOowgr/preview", solutionUrl: "" },
          // { id: "bio-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/19IDIHzvpaCe4gbi-pekZ850hKJtHxsWq/preview", solutionUrl: "" },
        ],
      },
      // {
      //   subject: "Semi-conductor Physics",
      //   image: "/images/semi.svg",
      //   papers: [
      //     // { id: "sc-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1PZSdjk16DTnpNGj0tSjwIGcFkLHoHtGs/preview", solutionUrl: "" },
      //     // { id: "sc-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1F1Yw8lMvORhKcyIPWrL6ZMSJjz-McPCI/preview", solutionUrl: "" },
      //     // { id: "sc-est1", title: "EST 1", type: "pdf", url: "https://drive.google.com/file/d/1EOjUvk0nwY3JuBDXUcW9maXTjmio5N-V/preview", solutionUrl: "" },
      //   ],
      // },
    ],
  },
  {
    year: "2nd Year",
    image: "/images/2nd.svg",
    subjects: [
      {
        subject: "COA",
        image: "/images/coa.svg",
        papers: [
           { id: "coa-mst1",  title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/10fWPcZyGFJrKX4Eqrl-zZoaIIrt6gOTh/preview", solutionUrl: "" },
           { id: "coa-unit1",  title: "Unit1 Important", type: "pdf", url: "https://drive.google.com/file/d/1CLYc8Ul44LlbZTCkPmbTgg465rFUqrtv/preview", solutionUrl: "" },
           { id: "coa-mst2",  title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1aSk0bOan6xvDzj61Thoc4UcwLiluyajd/preview", solutionUrl: "" },
           
          // { id: "coa-2024",  title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1MZvRTq6k1Lqm42U1MEr7LK-VWWzSGPzA/preview", solutionUrl: "" },
          // { id: "coa-2025a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1tluGNXvQpey4jKaZQFfhEHfrRboqbszd/preview", solutionUrl: "" },
          // { id: "coa-2025b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview", solutionUrl: "" },
          // { id: "coa-2025c", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1MgKPlMGl6HTxwMtV625CJ77pQKpWaLPF/preview", solutionUrl: "" },
          // { id: "coa-2025d", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/18XKNGn-THu2wY-D7HOo5CqQwjf4JLeFO/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "DBMS",
        image: "/images/dbms.svg",
        papers: [
           { id: "dbms-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1pDuxHqu4MGeR_7CLB2SZY1O5c9qujBFG/preview", solutionUrl: "" },
           { id: "dbms-unit1", title: "Unit1 Important", type: "pdf", url: "https://drive.google.com/file/d/1z_r3e6Q7_SplGhEAVD2EJBGnh9bXJMk0/preview", solutionUrl: "" },
           { id: "dbms-mst2", title: "MST 2", type: "pdf", url: "", solutionUrl: "https://drive.google.com/file/d/1a4CW3XK1VB8xTj9T8dXMJKesevYCjqhT/preview" },
           

          // { id: "dbms-2025b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1uCINIGKBrvVXouiXgbCaUzl_KIw0ptDe/preview", solutionUrl: "" },
          // { id: "dbms-2025c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1AbsWHulThFsr_Mhsz1NsiGM8RyWAEnEo/preview", solutionUrl: "" },
          // { id: "dbms-2025d", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/10hgvm-jo_9lH4GGYZXybkK_WnyJQblA6/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "ADSA",
        image: "/images/daa.svg",
        papers: [
           { id: "adsa-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1Zs41Fit4qBTTicd3Cg6r9gsbGeOin4Et/preview", solutionUrl: "" },
           { id: "adsa-unit1", title: "Unit1 Important", type: "pdf", url: "https://drive.google.com/file/d/13cUCyNs6wdC_CSa1opg3QbQwjdAj4mh1/preview", solutionUrl: "" },
           { id: "adsa-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1ay0D36-AF_lUvQnLd2n0YfsUqSVpB1I_/preview", solutionUrl: "" },
           
          // { id: "daa-2023b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1bc6iNabOnpnVXRqXGmkGpQ7IEhWL1ylQ/preview", solutionUrl: "" },
          // { id: "daa-2024a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/13uQsoRoDsmP2Lvo_ktQH5GxW_eJ_zI8w/preview", solutionUrl: "" },
          // { id: "daa-2024b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1-LSsXZPLpzim7xwRAVECGbzQMZFVkfta/preview", solutionUrl: "" },
          // { id: "daa-2025a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1o8mupEYR7D_JGPrVwlhtpkPtcOE8l2fj/preview", solutionUrl: "" },
          // { id: "daa-2025b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1gTwV6kOFFsOxxVzrYdvh1iHpWJiZcjFw/preview", solutionUrl: "" },
          // { id: "daa-2025c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/17s5yiB5v2mD7MRirNE-QVR7dxW3EH97b/preview", solutionUrl: "" },
          // { id: "daa-2025d", title: "Practice 7", type: "pdf", url: "https://drive.google.com/file/d/1JBF1TEgivsa0zPPDa50fCX0Nepp5D3NW/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Java",
        image: "/images/java.svg",
        papers: [
          { id: "java-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1DTbKrEeSitX1Oq7JRbHooie--nAycyXZ/preview", solutionUrl: "" },
          { id: "java-unit1", title: "Unit1 Important", type: "pdf", url: "https://drive.google.com/file/d/1oZ6VzXxDQ0J23AcnfdZ2bxPN8nw_MxnE/preview", solutionUrl: "" },
          { id: "java-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1bAFf12SHsuGeMcfFWZO7PUwBkvJzQYfr/preview", solutionUrl: "" },

          
          // { id: "java-2023b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1U8gHgZDSz0QXi8mhsuOMXBsyrpPutw1d/preview", solutionUrl: "" },
          // { id: "java-2024a", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/16HxigLF5npg1umcBShN67_R3IhXNkBVh/preview", solutionUrl: "" },
          // { id: "java-2024b", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/16Ywzd3EMTsLiuWowS_I-Ij4EvQWw2xXJ/preview", solutionUrl: "" },
          // { id: "java-2024c", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1mkGH3kYWVWrlXIeNdd-2rIImEtEOynDU/preview", solutionUrl: "" },
          // { id: "java-2025",  title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1M-JH-3kbRj-8iXT5dOmPwOczBPMCnD9N/preview", solutionUrl: "" },
        ],
      },
      // {
      //   subject: "Software Engineering",
      //   image: "/images/se.svg",
      //   papers: [
      //     // { id: "se-imp",   title: "Important Questions", type: "pdf", url: "https://drive.google.com/file/d/1sAZN2omjcdJdDbsW5-6EM4jQvzWvRYoI/preview", solutionUrl: "" },
      //     // { id: "se-2022a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1pJDM_KSEQ1LHwz_UzBWVvNXcnFUqQZQq/preview", solutionUrl: "" },
      //     // { id: "se-2022b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1R_QhIPBYq1ZArm-eLCWSNLKkmcnGHYKR/preview", solutionUrl: "" },
      //     // { id: "se-2022c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1HIR21u97EsUwdS_OYo90S_1v2IugH55J/preview", solutionUrl: "" },
      //     // { id: "se-2023",  title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/19mdIZ9ywBlvGKHLnePq2RTTKE_RX58Px/preview", solutionUrl: "" },
      //     // { id: "se-2024a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1nLLO_IjC9bg_V2eoQBe0233sGiLY7afo/preview", solutionUrl: "" },
      //     // { id: "se-2024b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1a9JYBJVNxovUmfgzTKDeLg8o-YszreKx/preview", solutionUrl: "" },
      //     // { id: "se-2024c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/1d3l8mUn9-mAxc1c72cgSA20KPH1Dvf4E/preview", solutionUrl: "" },
      //   ],
      // },
      // {
      //   subject: "Operating System",
      //   image: "/images/os.svg",
      //   papers: [
      //     // { id: "os-0001",  title: "Important Questions", type: "pdf", url: "https://drive.google.com/file/d/1BDOxxGa8fSZqkXKLhtGEqrw4hl4QclIa/preview", solutionUrl: "" },
      //     // { id: "os-2022a", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1ibJ2ZWG07kPhpM2LU4chLAjGlL3Oa9G0/preview", solutionUrl: "" },
      //     // { id: "os-2022b", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1c5EMRXj_LgBRUlRNhWuVGzEPMIVpYYE5/preview", solutionUrl: "" },
      //     // { id: "os-2022c", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1sB0qONnGQyWnVJ_o6qE8VKZp3P3WvwSh/preview", solutionUrl: "" },
      //     // { id: "os-2022d", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/13qidPE9bYiAV_a_8l7YvlwtQ4TmkqlSE/preview", solutionUrl: "" },
      //     // { id: "os-2023a", title: "Practice 4", type: "pdf", url: "https://drive.google.com/file/d/1dC1ZwltNWd-7ovYM_hZTEsqF8J8z_SXV/preview", solutionUrl: "" },
      //     // { id: "os-2023b", title: "Practice 5", type: "pdf", url: "https://drive.google.com/file/d/1VxjuTujtJ58PeuNHFXrRX_3fHSz4gQvm/preview", solutionUrl: "" },
      //     // { id: "os-2023c", title: "Practice 6", type: "pdf", url: "https://drive.google.com/file/d/1U3_WL0hT1MzuOuGafpzIZnLzEov9MRVu/preview", solutionUrl: "" },
      //   ],
      // },
      // {
      //   subject: "Machine Learning",
      //   image: "/images/ml.svg",
      //   papers: [
      //     // { id: "ml-2022", title: "Practice 0", type: "pdf", url: "https://drive.google.com/file/d/1Xmg5pZTivaf1kV0MFZji-tctGyzvVAu1/preview", solutionUrl: "" },
      //     // { id: "ml-2023", title: "Practice 1", type: "pdf", url: "https://drive.google.com/file/d/1neFnvSVhotcJ3PCb__tsBpe0P9YO5Jl5/preview", solutionUrl: "" },
      //     // { id: "ml-2024", title: "Practice 2", type: "pdf", url: "https://drive.google.com/file/d/1JAEamc0IeuZXG883wen66p8ogZ2XZqOG/preview", solutionUrl: "" },
      //     // { id: "ml-2025", title: "Practice 3", type: "pdf", url: "https://drive.google.com/file/d/1STPAAosbaysOEOzxRfPWb5tWPjsw87kz/preview", solutionUrl: "" },
      //   ],
      // },
    ],
  },
  {
    year: "3rd Year",
    image: "/images/3rd.svg",
    subjects: [
      {
        subject: "PBL_Java",
        image: "/images/java.svg",
        papers: [
          { id: "pbljava-mst1", title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1JYD58KolF18T5OJZK-0Ta5zsA_W63Y2l/preview", solutionUrl: "" },
          { id: "pbljava-mst2", title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1h7PaCGcs1w9vL-2c6fxeAYsexeHoDQ7z/preview", solutionUrl: "" },
        ], 
      },
      {
        subject: "Computer Networks",
        image: "/images/coa.svg",
        papers: [
          { id: "cn-mst1",   title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1hLFRsS21KBTWWpk_EwM6FWDbDqtmQLas/preview", solutionUrl: "" },
          { id: "cn-unit1", title: "Unit1 Important", type: "pdf", url: "https://drive.google.com/file/d/18ZynhlQDVKh__CcJdV8Vl_RW_iK0hg_o/preview", solutionUrl: "" },
          { id: "cn-mst2",   title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1yfIXN8CFkusPGIkpkkRNyBbzO_9gunAb/preview", solutionUrl: "" },
          { id: "cn-unit2", title: "Unit2 Important", type: "pdf", url: "https://drive.google.com/file/d/1WU8PlWlt9y66tJrFjzYEWpN7eNah5uKY/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Probability & Statistics",
        image: "/images/pns.svg",
        papers: [
          { id: "pns-mst1",   title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/14riyvaf1gpva_MI7aggc4u2TTPMBylYQ/preview", solutionUrl: "" },
          { id: "pns-unit1", title: "Unit1 Important", type: "pdf", url: "https://drive.google.com/file/d/1T20eyExpHoeOyIAiXxYit5JKxqoLuwa6/preview", solutionUrl: "" },
          { id: "pns-mst2",   title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1zau3NzZQfxb14hj6DdGS2SfX8_rcUbjh/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Web Development Fundamentals",
        image: "/images/daa.svg",
        papers: [
          { id: "wdf-mst1",   title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1sNKkbr1jFWBmRbBXBzAxWeov3bJ72kxY/preview", solutionUrl: "" },
          { id: "wdf-imp1",   title: "Important Questions(Unit 1)", type: "pdf", url: "https://drive.google.com/file/d/1MzLa9tD0M3etQbF-cvkXSlKdWF3qrJV-/preview", solutionUrl: "" },

          { id: "wdf-mst2",   title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1WPi1g6uVICXjoOd5VQ8HQoR8O23xjKfe/preview", solutionUrl: "" },
        ],
      },
      {
        subject: "Business Analytics",
        image: "/images/business.svg",
        papers: [
          { id: "business-mst1",   title: "MST 1", type: "pdf", url: "https://drive.google.com/file/d/1cb_QXCnYDQGSdy64K6wGYVv42w6YNjrv/preview", solutionUrl: "" },
          { id: "business-imp1",   title: "Important Questions(Unit 1)", type: "pdf", url: "https://drive.google.com/file/d/1v50_pV7wP7c01LvQpDGY7y9kjdHPgKs6/preview", solutionUrl: "" },

          { id: "business-mst1",   title: "MST 2", type: "pdf", url: "https://drive.google.com/file/d/1BAMUJx_AcocTbUHlYTv6wH8gx9E3pysN/preview", solutionUrl: "" },
        ],
      },
    ],
  },
  {
    year: "4th Year",
    image: "/images/4th.svg",
    subjects: [
      {
        subject: "Ethical Hacking",
        image: "/images/java.svg",
        papers: [
          { id: "eh-mst1", title: "EST", type: "pdf", url: "https://drive.google.com/file/d/1wtHYNmC7syKb5zxvZSRGjCrY_6VWU5PN/preview", solutionUrl: "" },
        ],
      },

    ],
  },
];

const PLAYLIST_SOURCES = [
  {
    year: "1st Year",
    image: "/images/1st.svg",
    subjects: [
      {
        subject: "Mathematics-II",
        image: "/images/maths2.svg",
        playlists: [
          { id: "set_theory", title: "Set Theory", channel: "Ganitya", playlistId: "PL15h-I4HvELIY_Odms6A5Ekl8Durr6d_0", thumbVideoId: "-BiRPYH5OLA" },
          { id: "relations", title: "Relations", channel: "Ganitya", playlistId: "PL15h-I4HvELIXZVZ8X7GBWgYWoPM_7YBY", thumbVideoId: "fPzLXQ80jqQ" },
          { id: "relations_and_functions", title: "Relaions and Functions", channel: "Pradeep Giri Academy", playlistId: "PLT3bOBUU3L9gF5nz4y1j2lb6q6IDbA6PQ", thumbVideoId: "ynHoB_0li_o" },
          { id: "propositional_calculus", title: "Propositional Calculus", channel: "Ganitya", playlistId: "PL15h-I4HvELJVQvge-ZdEXC-1RHWJtAbx", thumbVideoId: "MbZVsM39Ufw" },
          { id: "recurrence_relations", title: "Recurrence Relations", channel: "Ganitya", playlistId: "PL15h-I4HvELIYna1VWmeaWmWv0e3tFHaR", thumbVideoId: "5BYGJbqCqy0" },
          { id: "recurrence_relations_practice", title: "Recurrence Relation (Practice-Heavy)", channel: "MATHS HUB by Dr. Tania Bose", playlistId: "PLh2qFr0QFywExmizxtQywAJtAHQh6Xq3O", thumbVideoId: "pMCFs-EyfQI" },
          { id: "algebraic_structure", title: "Algebraic Structure", channel: "Pradeep Giri Academy", playlistId: "PLT3bOBUU3L9hF90HlMkgIHAm5kecjmK_X", thumbVideoId: "UP2SX1aLJ60" },
          { id: "combinatorial_mathematics", title: "Combinatorial Mathematics", channel: "Pradeep Giri Academy", playlistId: "PLhx1hByyAqsZ-v0QBKgBTcUIn8IbyC6pe", thumbVideoId: "lG1tGGpqye0" },
          { id: "graph_theory", title: "Graph Theory", channel: "Ganitya", playlistId: "PL15h-I4HvELIhCh5VwKcvh9BQFFRnAFJr", thumbVideoId: "Vscfb6fKBck" },
          { id: "trees", title: "Trees", channel: "Ganitya", playlistId: "PL15h-I4HvELKNfNZdrIpS0b_orXoCMO3f", thumbVideoId: "KbExLoAlWdw" },
          { id: "graph_theory_practice", title: "Graph Theory (Practice-Heavy)", channel: "MATHS HUB by Dr. Tania Bose", playlistId: "PLh2qFr0QFywHC2lxeFquAOyr85Y74fEMu", thumbVideoId: "C2It_eG88EU" },
          { id: "trees_practice", title: "Trees (Practice-Heavy)", channel: "MATHS HUB by Dr. Tania Bose", playlistId: "PLh2qFr0QFywFz0FhE14Zu_e2xd2806wVv", thumbVideoId: "boi_v4rd9eM" }
        ],
      },
      {
        subject: "Digital Electronics",
        image: "/images/fede.svg",
        playlists: [
          { id: "digital_electronics0", title: "G.O.A.T", channel: "Neso Academy", playlistId: "PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm", thumbVideoId: "M0mx8S05v60" },
          { id: "digital_electronics1", title: "Animated Explainations", channel: "ALL ABOUT ELECTRONICS", playlistId: "PLwjK_iyK4LLBC_so3odA64E2MLgIRKafl", thumbVideoId: "DBTna2ydmC0" },
          { id: "digital_electronics2", title: "Last night study", channel: "ALL ABOUT ELECTRONICS", playlistId: "PLhx1hByyAqsYaznnTI13Qoc9Ck2P9Dfq0", thumbVideoId: "9Tn9M98yER8" },
        ],
      },
      {
        subject: "Biology",
        image: "/images/bio.svg",
        playlists: [
          { id: "biology0", title: "G.O.A.T", channel: "Prep 4 Semester", playlistId: "PLbCAq4ggAQuHRqN2HnIVa_yOGy-FnMnNL", thumbVideoId: "O_bpzGe6rGA" },
        ],
      },
    ],
  },
  {
    year: "2nd Year",
    image: "/images/2nd.svg",
    subjects: [
      {
        subject: "Probability & Statistics",
        image: "/images/maths2.svg",
        playlists: [
          { id: "pns1", title: "Measures of Central Tendency", channel: "Dream Maths", playlistId: "PLceBS6W7XAAI", thumbVideoId: "rqQjkhuraws" },
          { id: "pns2", title: "Measure of Dispersion", channel: "Dream Maths", playlistId: "PLBbrgHyZKZGE", thumbVideoId: "a-5S15o_N7U" },
          { id: "pns3", title: "Moments skewness and kurtosis", channel: "Dream Maths", playlistId: "PLEHGYFbPuuMF_DhK0YZ4AXAvwrtULsQac", thumbVideoId: "AJmkNqqZBH4" },
          { id: "pns4", title: "Probability Distributions", channel: "Dream Maths", playlistId: "PLaTRYhg5SXFI", thumbVideoId: "XifBOZPO5HI" },
          { id: "pnsunit2", title: "Unit 2", channel: "Dr.Gajendra Purohit", playlistId: "PLZLOq5_kK0xg", thumbVideoId: "Q-J-pa0-rRw" },
        ],
      },
      {
        subject: "ADSA",
        image: "/images/dsa.svg",
        playlists: [
          { id: "adsa0", title: "Unit 1", channel: "Gate Smashers", playlistId: "PLPuiHzboWKoM", thumbVideoId: "7dz8Iaf_weM" },
          { id: "adsa1", title: "Unit 2", channel: "Gate Smashers", playlistId: "PLWi2ZpoRTIJs", thumbVideoId: "Y3Ckd3OW0_g" },
          // { id: "adsa2", title: "Unit 3", channel: "Striver",        playlistId: "PLhx1hByyAqsaJcVgBApIKLaKucaRpW3Om", thumbVideoId: "M3_pLsDdeuU" },
        ],
      },
      {
        subject: "DBMS",
        image: "/images/dbms.svg",
        playlists: [
          { id: "dbms0", title: "DBMS Unit 1", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y", thumbVideoId: "kBdlM6hNDAE" },
          { id: "dbms1", title: "DBMS Unit 2", channel: "Gate Smashers", playlistId: "PLTPcM_Aw-dNQ", thumbVideoId: "kBdlM6hNDAE" },
        ],
      },
      {
        subject: "COA",
        image: "/images/coa.svg",
        playlists: [
          { id: "coa0", title: "Complete COA Playlist", channel: "5 Minutes Engineering", playlistId: "PLYwpaL_SFmcCaiXeUEjcTzHwIfJqH1qCN", thumbVideoId: "1rUevQ3bSEY" },
          { id: "coa1", title: "COA Unit 2", channel: "Shanu Kuttan CSE Classes", playlistId: "PLX8o_28PTo48", thumbVideoId: "k5YMLXPy1SE" },
        ],
      },
      // {
      //   subject: "Software Engineering",
      //   image: "/images/se.svg",
      //   playlists: [
      //     { id: "se", title: "Complete SE Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiEed7SKZBnC6ypFDWYLRvB2", thumbVideoId: "kcvEiMFOcoE" },
      //   ],
      // },
      {
        subject: "OOPS Using Java",
        image: "/images/java.svg",
        playlists: [
          { id: "pbljava1", title: "Java Fundamentals", channel: "Learn Coding", playlistId: "PLE2cF7tVvXPQ", thumbVideoId: "4Y0N43i2RNs" },
          { id: "pbljava2", title: "OOPS using Java", channel: "Easy Engineering Classes", playlistId: "PLSPR4nZ76QqY", thumbVideoId: "Hs6CnxTNvxg" },
          { id: "pbljava3", title: "Exception Handling", channel: "Learn Coding", playlistId: "PLceHdQTUTGTE", thumbVideoId: "bxcZ7cXbDI0" },
          { id: "pbljava4", title: "Unit 2", channel: "Learn Coding", playlistId: "PLYdlFpZruBUI", thumbVideoId: "kD_HqZP8MLY" },
        ],
      },
      // {
      //   subject: "Operating System",
      //   image: "/images/os.svg",
      //   playlists: [
      //     { id: "os0", title: "Complete OS Playlist", channel: "Gate Smashers", playlistId: "PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", thumbVideoId: "WJ-UaAaumNA" },
      //     { id: "os1",  title: "OS One Shot",          channel: "5 Minutes Engineering", playlistId: "PLhx1hByyAqsYn0JMNNPN-uFiLb0XdZtSG", thumbVideoId: "A4G0hOI6XyQ" },
      //   ],
      // },
      // {
      //   subject: "DAA",
      //   image: "/images/daa.svg",
      //   playlists: [
      //     { id: "daa0", title: "Unit 1", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsZ3ZMkKbN9FcSUYad1ShZ3G", thumbVideoId: "0IAPZzGSbME" },
      //     { id: "daa1", title: "Unit 2", channel: "Gate Smashers", playlistId: "PLhx1hByyAqsbCKEJu0ntERx33fTeNigw2", thumbVideoId: "I8w2XN0w-fQ" },
      //     { id: "daa2", title: "Unit 3", channel: "Striver",        playlistId: "PLhx1hByyAqsaJcVgBApIKLaKucaRpW3Om", thumbVideoId: "M3_pLsDdeuU" },
      //   ],
      // },
      //  {
      //   subject: "Discrete Mathematics",
      //   image: "/images/maths2.svg",
      //   playlists: [
      //     { id: "set_theory", title: "Set Theory", channel: "Ganitya", playlistId: "PL15h-I4HvELIY_Odms6A5Ekl8Durr6d_0", thumbVideoId: "-BiRPYH5OLA" },
      //     { id: "relations", title: "Relations", channel: "Ganitya", playlistId: "PL15h-I4HvELIXZVZ8X7GBWgYWoPM_7YBY", thumbVideoId: "fPzLXQ80jqQ" },
      //     { id: "relations_and_functions", title: "Relaions and Functions", channel: "Pradeep Giri Academy", playlistId: "PLT3bOBUU3L9gF5nz4y1j2lb6q6IDbA6PQ", thumbVideoId: "ynHoB_0li_o" },
      //     { id: "propositional_calculus", title: "Propositional Calculus", channel: "Ganitya", playlistId: "PL15h-I4HvELJVQvge-ZdEXC-1RHWJtAbx", thumbVideoId: "MbZVsM39Ufw" },
      //     { id: "recurrence_relations", title: "Recurrence Relations", channel: "Ganitya", playlistId: "PL15h-I4HvELIYna1VWmeaWmWv0e3tFHaR", thumbVideoId: "5BYGJbqCqy0" },
      //     { id: "recurrence_relations_practice", title: "Recurrence Relation (Practice-Heavy)", channel: "MATHS HUB by Dr. Tania Bose", playlistId: "PLh2qFr0QFywExmizxtQywAJtAHQh6Xq3O", thumbVideoId: "pMCFs-EyfQI" },
      //     { id: "graph_theory", title: "Graph Theory", channel: "Ganitya", playlistId: "PL15h-I4HvELIhCh5VwKcvh9BQFFRnAFJr", thumbVideoId: "Vscfb6fKBck" },
      //     { id: "combinatorial_mathematics", title: "Combinatorial Mathematics", channel: "Pradeep Giri Academy", playlistId: "PLhx1hByyAqsZ-v0QBKgBTcUIn8IbyC6pe", thumbVideoId: "lG1tGGpqye0" },
      //     { id: "trees", title: "Trees", channel: "Ganitya", playlistId: "PL15h-I4HvELKNfNZdrIpS0b_orXoCMO3f", thumbVideoId: "KbExLoAlWdw" },
      //     { id: "graph_theory_practice", title: "Graph Theory (Practice-Heavy)", channel: "MATHS HUB by Dr. Tania Bose", playlistId: "PLh2qFr0QFywHC2lxeFquAOyr85Y74fEMu", thumbVideoId: "C2It_eG88EU" },
      //     { id: "trees_practice", title: "Trees (Practice-Heavy)", channel: "MATHS HUB by Dr. Tania Bose", playlistId: "PLh2qFr0QFywFz0FhE14Zu_e2xd2806wVv", thumbVideoId: "boi_v4rd9eM" }
      //   ],
      // },
    ],
  },
  {
    year: "3rd Year",
    image: "/images/3rd.svg",
    
    subjects: [
      {
        subject: "Computer Networks",
        image: "/images/coa.svg",
        playlists: [
          { id: "cn1", title: "Unit 1", channel: "Gate Smashers", playlistId: "PLNlA76cRprwA", thumbVideoId: "4D55Cmj2t-A" },
          { id: "cn2", title: "Unit 2", channel: "Gate Smashers", playlistId: "PLHZF_-qCQZSU", thumbVideoId: "lQiSWt2mwXE" },
        ],
      },
      {
        subject: "PBL in Java",
        image: "/images/java.svg",
        playlists: [
          { id: "pbljava1", title: "Java Fundamentals", channel: "Learn Coding", playlistId: "PLE2cF7tVvXPQ", thumbVideoId: "4Y0N43i2RNs" },
          { id: "pbljava2", title: "OOPS using Java", channel: "Easy Engineering Classes", playlistId: "PLSPR4nZ76QqY", thumbVideoId: "Hs6CnxTNvxg" },
          { id: "pbljava3", title: "Exception Handling", channel: "Learn Coding", playlistId: "PLceHdQTUTGTE", thumbVideoId: "bxcZ7cXbDI0" },
          { id: "pbljava4", title: "Unit 2", channel: "Learn Coding", playlistId: "PLI4zpCDkpnJk", thumbVideoId: "8SoPJYABryI" },
        ],
      },
      {
        subject: "Probability & Statistics",
        image: "/images/maths2.svg",
        playlists: [
          { id: "pns1", title: "Measures of Central Tendency", channel: "Dream Maths", playlistId: "PLceBS6W7XAAI", thumbVideoId: "rqQjkhuraws" },
          { id: "pns2", title: "Measure of Dispersion", channel: "Dream Maths", playlistId: "PLBbrgHyZKZGE", thumbVideoId: "a-5S15o_N7U" },
          { id: "pns3", title: "Moments skewness and kurtosis", channel: "Dream Maths", playlistId: "PLEHGYFbPuuMF_DhK0YZ4AXAvwrtULsQac", thumbVideoId: "AJmkNqqZBH4" },
          { id: "pns4", title: "Probability Distributions", channel: "Dream Maths", playlistId: "PLaTRYhg5SXFI", thumbVideoId: "XifBOZPO5HI" },
          { id: "pns5", title: "Unit 2", channel: "Dream Maths", playlistId: "PLd4fFq5PB6TU", thumbVideoId: "EwKNl22uE14" },
        ],
      },
    ],
  },
  {
    year: "4th Year",
    image: "/images/4th.svg",
    subjects: [],
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

  const applyBankState = useCallback((state) => {
    const year    = state?.yearIdx != null ? PAPER_SOURCES[state.yearIdx] : null;
    const subject = year && state?.subjectIdx != null ? year.subjects[state.subjectIdx] : null;
    const paper   = subject && state?.paperId ? subject.papers.find((p) => p.id === state.paperId) : null;
    setSelectedYear(year || null);
    setSelectedSubject(subject || null);
    setSelectedPaper(paper || null);
  }, []);

  useEffect(() => {
    if (window.history.state?.pyqBank === undefined) {
      window.history.replaceState({ ...window.history.state, pyqBank: {} }, "");
    }
    const onPopState = (e) => applyBankState(e.state?.pyqBank);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyBankState]);

  const pushBankState = (state) => window.history.pushState({ pyqBank: state }, "");

  const openYear = (year) => {
    setSelectedYear(year);
    pushBankState({ yearIdx: PAPER_SOURCES.indexOf(year) });
  };

  const openSubject = (subject) => {
    setSelectedSubject(subject);
    pushBankState({
      yearIdx: PAPER_SOURCES.indexOf(selectedYear),
      subjectIdx: selectedYear.subjects.indexOf(subject),
    });
  };

  const openPaper = (paper) => {
    trackEvent("resource_open", {
      paper_name: paper.title,
      paper_id: paper.id,
      resource_type: "pyq",
    });
    setSelectedPaper(paper);
    pushBankState({
      yearIdx: PAPER_SOURCES.indexOf(selectedYear),
      subjectIdx: selectedYear.subjects.indexOf(selectedSubject),
      paperId: paper.id,
    });
  };

  const goHome = () => {
    const depth = (selectedYear ? 1 : 0) + (selectedSubject ? 1 : 0) + (selectedPaper ? 1 : 0);
    if (depth > 0) window.history.go(-depth);
  };

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

      {!selectedYear && (
        <div className="pyq-card-grid pyq-card-grid--years">
          {PAPER_SOURCES.map((y) => (
            <div
              key={y.year}
              className="pyq-thumb-card"
              onClick={() => y.subjects.length > 0 && openYear(y)}
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

      {selectedYear && !selectedSubject && (
        <div className="pyq-card-grid pyq-card-grid--subjects">
          {selectedYear.subjects.map((s) => {
            const total     = s.papers.length;
            const attempted = s.papers.filter((p) => progressMap[p.id]?.attempted).length;
            return (
              <div
                key={s.subject}
                className="pyq-thumb-card"
                onClick={() => {
                  trackEvent("resource_open", {
                    year: selectedYear.year,
                    subject: s.subject,
                  });
                  openSubject(s);
                }}
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
      )}

      {selectedSubject && !selectedPaper && (
        <>
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

      {selectedPaper && (
        <PaperView
          paper={selectedPaper}
          progress={progressMap[selectedPaper.id]}
          onSaveProgress={handleSavePaper}
        />
      )}
    </div>
  );
}

// ─── PaperView ────────────────────────────────────────────────────────────────

function PaperView({ paper, progress, onSaveProgress }) {
  const [notes,      setNotes]      = useState(progress?.notes ?? "");
  const [attempted,  setAttempted]  = useState(progress?.attempted ?? false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const debounceRef = useRef(null);

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
        <button
          className={`pyq-attempt-inline-btn ${attempted ? "pyq-attempt-inline-btn--done" : ""}`}
          onClick={toggleAttempted}
        >
          {attempted ? <CheckSquare size={15} /> : <Square size={15} />}
          <span>{attempted ? "Attempted" : "Mark as attempted"}</span>
        </button>
      </div>

      <div className="pyq-pdf-wrap">
        <a
          href={paper.url.replace("/preview", "/view")}
          onClick={() =>
            trackEvent("resource_tab_open", {
            paper_name: paper.title,
            paper_id: paper.id,
            })
          }
          target="_blank"
          rel="noopener noreferrer"
          className="pyq-open-tab-btn"
        >
          <ExternalLink size={14} /> Open in tab
        </a>
        <iframe src={paper.url} title={paper.title} className="pyq-pdf-iframe" />
      </div>

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

  const applyPlaylistState = useCallback((state) => {
    const year    = state?.yearIdx != null ? PLAYLIST_SOURCES[state.yearIdx] : null;
    const subject = year && state?.subjectIdx != null ? year.subjects[state.subjectIdx] : null;
    setSelectedYear(year || null);
    setSelectedSubject(subject || null);
  }, []);

  useEffect(() => {
    if (window.history.state?.pyqPlaylists === undefined) {
      window.history.replaceState({ ...window.history.state, pyqPlaylists: {} }, "");
    }
    const onPopState = (e) => applyPlaylistState(e.state?.pyqPlaylists);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyPlaylistState]);

  const pushPlaylistState = (state) => window.history.pushState({ pyqPlaylists: state }, "");

  const openYear = (year) => {
    setSelectedYear(year);
    pushPlaylistState({ yearIdx: PLAYLIST_SOURCES.indexOf(year) });
  };

  const openSubject = (subject) => {
    setSelectedSubject(subject);
    pushPlaylistState({
      yearIdx: PLAYLIST_SOURCES.indexOf(selectedYear),
      subjectIdx: selectedYear.subjects.indexOf(subject),
    });
  };

  const goHome = () => {
    const depth = (selectedYear ? 1 : 0) + (selectedSubject ? 1 : 0);
    if (depth > 0) window.history.go(-depth);
  };

  const openPlaylist = (pl) => {
    trackEvent("playlist_open", {
      playlist_name: pl.title,
      channel: pl.channel,
    });

    window.open(
      `https://www.youtube.com/playlist?list=${pl.playlistId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };
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
        {(selectedYear || selectedSubject) && (
          <div className="pyq-header-sub">
            {selectedSubject ? selectedSubject.subject : selectedYear.year}
          </div>
        )}
      </div>

      {!selectedYear && (
        <div className="pyq-card-grid pyq-card-grid--years">
          {PLAYLIST_SOURCES.map((y) => (
            <div
              key={y.year}
              className="pyq-thumb-card"
              onClick={() => y.subjects.length > 0 && openYear(y)}
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

      {selectedYear && !selectedSubject && (
        <div className="pyq-card-grid pyq-card-grid--subjects">
          {selectedYear.subjects.map((s) => (
            <div
              key={s.subject}
              className="pyq-thumb-card"
              onClick={() => {
                trackEvent("resource_open", {
                  year: selectedYear.year,
                  subject: s.subject,
                });
                openSubject(s);
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="pyq-thumb-img-wrap">
                <img src={s.image} alt={s.subject} className="pyq-thumb-img" />
              </div>
              <div className="pyq-thumb-title">{s.subject}</div>
              <div className="pyq-thumb-sub">{s.playlists.length} playlist{s.playlists.length !== 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>
      )}

      {selectedSubject && (
        <div className="pyq-card-grid pyq-card-grid--subjects">
          {selectedSubject.playlists.map((pl) => {
              const thumb = thumbUrl(pl);
              return (
                <div key={pl.id} className="pyq-thumb-card pyq-playlist-card" onClick={() => openPlaylist(pl)} style={{ cursor: "pointer" }}>
                  <div className="pyq-thumb-img-wrap">
                    {thumb
                      ? <img src={thumb} alt={pl.title} className="pyq-thumb-img" />
                      : <div className="pyq-thumb-img pyq-pl-thumb--empty"><ListVideo size={32} style={{ opacity: 0.4 }} /></div>
                    }
                    <div className="pyq-thumb-overlay pyq-thumb-overlay--hover">
                      <PlayCircle size={28} />
                      <span>Watch</span>
                    </div>
                  </div>
                  <div className="pyq-thumb-title">{pl.title}</div>
                  {pl.channel && <div className="pyq-thumb-sub">{pl.channel}</div>}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ─── QuestionCard & QuestionModal (Revision tab) ──────────────────────────────

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
        <button className={`pyq-mode-tab ${mode === "bank" ? "active" : ""}`} onClick={() => setMode("bank")}>
          Pyq's
        </button>
        <button className={`pyq-mode-tab ${mode === "playlists" ? "active" : ""}`} onClick={() => setMode("playlists")}>
          Playlists
        </button>
        <button className={`pyq-mode-tab ${mode === "mine" ? "active" : ""}`} onClick={() => setMode("mine")}>
          Revision
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