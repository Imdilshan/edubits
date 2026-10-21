# University Assessment Model

This document defines the assessment structure and marks distribution
for Theory, Hybrid, and Practical courses.

IMPORTANT:
- Max Marks represents the original assessment marks.
- Weighted Marks represents the contribution to the final assessment.
- Do not assume that original marks and weighted marks are interchangeable.
- Preserve decimal values in weighted marks.
- Implement the three assessment categories separately.

---

# 1. Theory Assessment Model

| Sr No | Exam Name                 | Max Marks | Weighted Marks |
|-------|---------------------------|-----------|----------------|
| 1     | External Theory           | 60        | 60             |
| 2     | Assignment/PBL            | 10        | 10             |
| 3     | Attendance Marks          | 2         | 2              |
| 4     | Mid-Semester Test-1        | 20        | 10             |
| 5     | Quiz                      | 4         | 4              |
| 6     | Surprise Test             | 12        | 4              |
| 7     | Mid-Semester Test-2        | 20        | 10             |

## Theory Notes

- External Theory contributes 60 weighted marks.
- Assignment/PBL contributes 10 weighted marks.
- Attendance contributes 2 weighted marks.
- MST-1 contributes 10 weighted marks from 20 original marks.
- Quiz contributes 4 weighted marks.
- Surprise Test contributes 4 weighted marks from 12 original marks.
- MST-2 contributes 10 weighted marks from 20 original marks.

Total weighted marks: 100.

---

# 2. Hybrid Assessment Model

| Sr No | Exam Name                    | Max Marks | Weighted Marks |
|-------|------------------------------|-----------|----------------|
| 1     | Practical Evaluations        | 40        | 20             |
| 2     | End Term Hybrid Theory       | 60        | 30             |
| 3     | Attendance Marks             | 2         | 2              |
| 4     | Surprise Test                | 12        | 4              |
| 5     | Practical MST                | 10        | 4              |
| 6     | Practical Worksheet/Projects 1 | 30      | 2              |
| 7     | Practical Worksheet/Projects 2 | 30      | 2              |
| 8     | Practical Worksheet/Projects 3 | 30      | 2              |
| 9     | Practical Worksheet/Projects 4 | 30      | 2              |
| 10    | Practical Worksheet/Projects 5 | 30      | 2              |
| 11    | Practical Worksheet/Projects 6 | 30      | 2              |
| 12    | Practical Worksheet/Projects 7 | 30      | 2              |
| 13    | Practical Worksheet/Projects 8 | 30      | 2              |
| 14    | Practical Worksheet/Projects 9 | 30      | 2              |
| 15    | Practical Worksheet/Projects 10 | 30     | 2              |
| 16    | Quiz                         | 4         | 4              |
| 17    | Assignment/PBL               | 10        | 6              |
| 18    | MST-1 Hybrid                 | 20        | 5              |
| 19    | MST-2 Hybrid                 | 20        | 5              |

## Hybrid Notes

- Practical Evaluations contribute 20 weighted marks.
- End Term Hybrid Theory contributes 30 weighted marks.
- Attendance contributes 2 weighted marks.
- Surprise Test contributes 4 weighted marks.
- Practical MST contributes 4 weighted marks.
- Each of the 10 Practical Worksheet/Projects contributes 2 weighted marks.
- Quiz contributes 4 weighted marks.
- Assignment/PBL contributes 6 weighted marks.
- MST-1 Hybrid contributes 5 weighted marks.
- MST-2 Hybrid contributes 5 weighted marks.

Total weighted marks: 100.

---

# 3. Practical Assessment Model

| Sr No | Exam Name          | Max Marks | Weighted Marks |
|-------|--------------------|-----------|----------------|
| 1     | External Viva/Voce | 40        | 40             |
| 2     | Experiment-1       | 30        | 4.5           |
| 3     | Experiment-2       | 30        | 4.5           |
| 4     | Experiment-3       | 30        | 4.5           |
| 5     | Experiment-4       | 30        | 4.5           |
| 6     | Experiment-5       | 30        | 4.5           |
| 7     | Experiment-6       | 30        | 4.5           |
| 8     | Experiment-7       | 30        | 4.5           |
| 9     | Experiment-8       | 30        | 4.5           |
| 10    | Experiment-9       | 30        | 4.5           |
| 11    | Experiment-10      | 30        | 4.5           |
| 12    | Mid-Term Test      | 15        | 15             |

## Practical Notes

- External Viva/Voce contributes 40 weighted marks.
- Each of the 10 experiments contributes 4.5 weighted marks
  from 30 original marks.
- Mid-Term Test contributes 15 weighted marks from 15 original marks.

Total weighted marks: 100.

---

# 4. Calculation Requirements

For each assessment component:

weightedScore = (obtainedMarks / maxMarks) * weightedMarks

Examples:

1. Theory MST-1:
   - Max Marks: 20
   - Weighted Marks: 10
   - If the student obtains 16:
     weightedScore = (16 / 20) * 10 = 8

2. Hybrid Practical Evaluation:
   - Max Marks: 40
   - Weighted Marks: 20
   - If the student obtains 30:
     weightedScore = (30 / 40) * 20 = 15

3. Practical Experiment:
   - Max Marks: 30
   - Weighted Marks: 4.5
   - If the student obtains 24:
     weightedScore = (24 / 30) * 4.5 = 3.6

The total weighted score is the sum of the weighted scores
of all applicable assessment components.

Do not round individual component scores prematurely.
Round only for display, according to the application's conventions.

---

# 5. Validation Requirements

1. Obtained marks cannot be negative.
2. Obtained marks cannot exceed the component's Max Marks.
3. Zero marks must be accepted.
4. Decimal weighted scores must be supported.
5. Components must be selected according to the course assessment type.
6. Theory, Hybrid, and Practical assessment structures must remain separate.
7. Do not silently omit an assessment component.
8. Do not change the assessment weightages without explicit approval.

---

# 6. Important Verification

The assessment structures above are transcribed from the supplied tables.

Before implementing the model, verify:
- Whether all components are mandatory.
- Whether the university permits missing assessments.
- Whether final grades use any additional rules beyond these tables.
- Whether the displayed total must be calculated from raw weighted
  scores or from rounded component scores.

Do not invent additional grading rules.