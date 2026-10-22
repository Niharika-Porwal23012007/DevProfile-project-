import axios from 'axios';
import { z } from 'zod';
import { config } from '../config';

export interface PlannerInput {
  weakTopics: string[];
  reviewsDue: string[];
  daysSinceLastCommit: { [repo: string]: number };
  goalProgress: { leetcode: number; commits: number; codingMin: number };
  availableMinutes: number;
  streak: number;
}

export interface PlannerTask {
  type: 'practice' | 'project' | 'review' | 'learning';
  title: string;
  problemSlug?: string;
  minutes: number;
  reason: string;
  completed?: boolean;
}

export interface DailyPlanResult {
  date: string;
  tasks: PlannerTask[];
  source: 'ai' | 'rule-based-fallback';
}

// Zod Schema to strictly validate AI output
const PlannerOutputSchema = z.object({
  tasks: z.array(
    z.object({
      type: z.enum(['practice', 'project', 'review', 'learning']),
      title: z.string().min(3),
      minutes: z.number().int().positive(),
      reason: z.string().min(5),
      problemSlug: z.string().optional()
    })
  ).length(3)
});

// Curated problem catalog to prevent hallucination (Section 7.2)
export const PROBLEM_CATALOG: { [topic: string]: { slug: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard' }[] } = {
  'dynamic programming': [
    { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium' },
    { slug: 'house-robber', title: 'House Robber', difficulty: 'Medium' },
    { slug: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'Medium' },
    { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy' }
  ],
  'graphs': [
    { slug: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium' },
    { slug: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium' },
    { slug: 'clone-graph', title: 'Clone Graph', difficulty: 'Medium' },
    { slug: 'network-delay-time', title: 'Network Delay Time', difficulty: 'Medium' }
  ],
  'trees': [
    { slug: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium' },
    { slug: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
    { slug: 'invert-binary-tree', title: 'Invert Binary Tree', difficulty: 'Easy' }
  ],
  'two pointers': [
    { slug: 'two-sum-ii-input-array-is-sorted', title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium' },
    { slug: '3sum', title: '3Sum', difficulty: 'Medium' },
    { slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium' }
  ],
  'sliding window': [
    { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
    { slug: 'minimum-window-substring', title: 'Minimum Window Substring', difficulty: 'Hard' }
  ],
  'arrays': [
    { slug: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium' },
    { slug: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium' }
  ]
};

export class PlannerService {
  /**
   * Rule-based plan fallback as guaranteed safeguard
   */
  static generateRuleBasedPlan(input: PlannerInput): PlannerTask[] {
    const totalMin = Math.max(45, input.availableMinutes || 90);

    // 1. Practice Task
    const weakest = (input.weakTopics && input.weakTopics.length > 0)
      ? input.weakTopics[0].toLowerCase()
      : 'dynamic programming';

    const catalogList = PROBLEM_CATALOG[weakest] || PROBLEM_CATALOG['dynamic programming'];
    const chosenProblem = catalogList[0];
    const practiceMins = Math.round(totalMin * 0.45);

    const practiceTask: PlannerTask = {
      type: 'practice',
      title: `Solve ${chosenProblem.title} (${chosenProblem.difficulty})`,
      problemSlug: chosenProblem.slug,
      minutes: practiceMins,
      reason: `${weakest.toUpperCase()} is your most under-practiced topic with the highest weakness score.`
    };

    // 2. Project Task
    const repos = Object.keys(input.daysSinceLastCommit);
    let stalestRepo = 'devprofile';
    let maxDays = 0;
    for (const r of repos) {
      if (input.daysSinceLastCommit[r] > maxDays) {
        maxDays = input.daysSinceLastCommit[r];
        stalestRepo = r;
      }
    }
    const projectMins = Math.round(totalMin * 0.35);
    const projectReason = maxDays > 0
      ? `No commits recorded to ${stalestRepo} in ${maxDays} days.`
      : `Continue feature development on ${stalestRepo}.`;

    const projectTask: PlannerTask = {
      type: 'project',
      title: `Ship a commit to ${stalestRepo}`,
      minutes: projectMins,
      reason: projectReason
    };

    // 3. Review or Learning Task
    const reviewMins = totalMin - practiceMins - projectMins;
    let reviewTask: PlannerTask;

    if (input.reviewsDue && input.reviewsDue.length > 0) {
      const reviewSlug = input.reviewsDue[0];
      reviewTask = {
        type: 'review',
        title: `Redo ${reviewSlug.replace(/-/g, ' ')}`,
        problemSlug: reviewSlug,
        minutes: reviewMins,
        reason: 'Scheduled spaced-repetition interval reached for this struggled problem.'
      };
    } else {
      reviewTask = {
        type: 'learning',
        title: 'Review pattern notes & time complexity',
        minutes: reviewMins,
        reason: 'Consolidate algorithmic patterns before tomorrow’s practice session.'
      };
    }

    return [practiceTask, projectTask, reviewTask];
  }

  /**
   * AI-generated daily plan with Gemini / LLM integration and strict fallback
   */
  static async generateDailyPlan(input: PlannerInput, userApiKey?: string): Promise<DailyPlanResult> {
    const todayStr = new Date().toISOString().split('T')[0];
    const apiKey = userApiKey || config.geminiApiKey;

    if (!apiKey) {
      // Use rock-solid rule-based plan when no API key configured
      return {
        date: todayStr,
        tasks: this.generateRuleBasedPlan(input),
        source: 'rule-based-fallback'
      };
    }

    const prompt = `
You are an AI planner for a software engineering student.
Analyze these facts from the student's database:
${JSON.stringify(input, null, 2)}

Strict instruction:
Return ONLY a valid JSON object matching this schema:
{
  "tasks": [
    {
      "type": "practice",
      "title": "<exact action: e.g. Solve one medium DP problem>",
      "minutes": <number>,
      "reason": "<one sentence using only the supplied facts>"
    },
    {
      "type": "project",
      "title": "<exact action: e.g. Commit a small fix to repository>",
      "minutes": <number>,
      "reason": "<one sentence using only the supplied facts>"
    },
    {
      "type": "review",
      "title": "<exact action: e.g. Redo coin-change>",
      "minutes": <number>,
      "reason": "<one sentence using only the supplied facts>"
    }
  ]
}
Do not invent facts. Sum of minutes must be approximately ${input.availableMinutes}. Return JSON only. No markdown fences.
`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        },
        { timeout: 8000 }
      );

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty AI response');

      const parsed = JSON.parse(rawText.trim());
      const validated = PlannerOutputSchema.parse(parsed);

      return {
        date: todayStr,
        tasks: validated.tasks,
        source: 'ai'
      };
    } catch (err) {
      // Log failure and gracefully fallback
      console.warn('AI plan generation failed or timed out. Gracefully falling back to rule-based engine:', (err as Error).message);
      return {
        date: todayStr,
        tasks: this.generateRuleBasedPlan(input),
        source: 'rule-based-fallback'
      };
    }
  }
}
