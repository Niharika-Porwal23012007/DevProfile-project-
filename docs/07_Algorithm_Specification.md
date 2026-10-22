# Algorithm Specification & Mathematical Models
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. Daily Consistency Score Formula (Section 6.1)

### 1.1 Mathematical Formulation
For any given day $d$, the consistency score $S(d) \in [0, 100]$ is computed as:

$$S(d) = P_{\text{LeetCode}}(d) + P_{\text{GitHub}}(d) + P_{\text{Coding}}(d)$$

Where:
$$P_{\text{LeetCode}}(d) = \begin{cases} 40, & \text{if } \text{solves}(d) \ge 1 \\ 0, & \text{otherwise} \end{cases}$$

$$P_{\text{GitHub}}(d) = \begin{cases} 30, & \text{if } \text{commits}(d) \ge 1 \\ 0, & \text{otherwise} \end{cases}$$

$$P_{\text{Coding}}(d) = \min\left(30, \left(\frac{\text{minutes}(d)}{\text{target\_minutes}(d)}\right) \times 30\right)$$

### 1.2 Weekly Average Score
$$S_{\text{weekly}} = \frac{1}{7} \sum_{i=0}^{6} S(d - i)$$

---

## 2. Streak Calculation with Freeze Day Allowance

### 2.1 Logic & Rules
- **Active Day Threshold:** A day is considered active if $S(d) \ge 30$.
- **Freeze Day:** Each student receives **1 Freeze Day per 7-day rolling window**. A freeze day maintains the current streak without adding to it when a student takes a planned rest day.

### 2.2 Pseudocode
```python
def calculate_streak(scores_descending, threshold=30):
    streak = 0
    freeze_days_used = 0
    days_examined = 0

    for day in scores_descending:
        days_examined += 1
        if day.score >= threshold:
            streak += 1
        else:
            if freeze_days_used == 0:
                freeze_days_used += 1  # Streak preserved
            else:
                break  # Second miss breaks the streak

    return streak, freeze_days_used
```

---

## 3. Weakness Analyzer Algorithm (Section 6.2)

### 3.1 Objective
Ranks algorithmic topics to highlight areas where the student is under-practiced or lacks advanced problem depth.

### 3.2 Formulation
Let $T$ be the set of topics. The average solves across all topics is:
$$\mu_{\text{solves}} = \frac{1}{|T|} \sum_{t \in T} \text{total}(t)$$

For each topic $t$:
$$\text{advanced\_ratio}(t) = \frac{\text{medium}(t) + \text{hard}(t)}{\text{total}(t)}$$

$$\text{volume\_deficit}(t) = \max(0, \mu_{\text{solves}} - \text{total}(t))$$

$$\text{weakness\_score}(t) = 1.5 \times \text{volume\_deficit}(t) + 10 \times (1 - \text{advanced\_ratio}(t))$$

Topics are sorted in descending order of $\text{weakness\_score}(t)$, with the top 3 ranked as the primary weak points.

---

## 4. Spaced Repetition Scheduling (Section 6.3)

### 4.1 Interval Progression
Problems marked as struggled (e.g. solve duration $> 40$ minutes, user struggled flag, or multi-attempt failures) are queued according to Ebbinghaus' retention intervals:

$$\text{Interval Progression:} \quad 3 \text{ days} \longrightarrow 7 \text{ days} \longrightarrow 21 \text{ days} \longrightarrow 30 \text{ days (Mastery)}$$

$$\text{Failure Rule:} \quad \text{If review fails or user struggles, } \text{interval} \longleftarrow 3 \text{ days}.$$

### 4.2 State Machine Transition
```python
def next_interval(current_interval, passed):
    if not passed:
        return 3
    if current_interval <= 3:
        return 7
    if current_interval <= 7:
        return 21
    return 30
```

---

## 5. Balance Detector (Section 6.4)

### 5.1 Objective
Identifies when a student disproportionately focuses on algorithmic problem solving while abandoning project development, or vice-versa.

### 5.2 Mathematical Formulation
- **Recent Window ($R$):** Last 14 days.
- **Baseline Window ($B$):** Prior 28 days.

$$\Delta_{\text{LC}} = \frac{\overline{\text{LC}}_R - \overline{\text{LC}}_B}{\overline{\text{LC}}_B} \times 100\%$$

$$\Delta_{\text{Build}} = \frac{\overline{\text{Build}}_R - \overline{\text{Build}}_B}{\overline{\text{Build}}_B} \times 100\%$$

Where $\text{Build} = \text{commits} + \frac{\text{coding\_seconds}}{3600}$.

### 5.3 Diagnostic Conditions
1. **Practice Heavy:** $\Delta_{\text{LC}} \ge +25\%$ and $\Delta_{\text{Build}} \le -30\%$.  
   *Message:* "You are practising a lot but building less. Consider shipping project features or committing your recent local code."
2. **Build Heavy:** $\Delta_{\text{Build}} \ge +25\%$ and $\Delta_{\text{LC}} \le -30\%$.  
   *Message:* "You are building a lot but LeetCode practice has slowed down. Maintain your problem solving habit with 1 daily medium problem."
3. **Balanced:** $|\Delta_{\text{LC}}| < 30\%$ or both progressing steadily.

---

## 6. Interview Readiness Score (Section 6.7)

### 6.1 Weighted Evaluation Model
The interview readiness score $R \in [0, 100]$ evaluates four distinct pillars:

$$R = 0.30 \cdot W_{\text{diff}} + 0.25 \cdot W_{\text{topic}} + 0.25 \cdot W_{\text{consist}} + 0.20 \cdot W_{\text{proj}}$$

Where:
1. **Difficulty Mix ($W_{\text{diff}} \in [0, 100]$):** Proportion of Medium and Hard problems solved.
2. **Topic Coverage ($W_{\text{topic}} \in [0, 100]$):** Breadth across 14 fundamental DSA topics.
3. **Consistency ($W_{\text{consist}} \in [0, 100]$):** 30-day consistency score average and streak stability.
4. **Project Activity ($W_{\text{proj}} \in [0, 100]$):** Active GitHub repositories, stars, and regular commit cadence.
