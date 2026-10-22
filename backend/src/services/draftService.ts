export interface WeeklyStatsForDraft {
  totalSolves: number;
  topTopic: string;
  topTopicCount: number;
  totalCommits: number;
  activeRepo: string;
  codingHours: number;
  currentStreak: number;
  consistencyScore: number;
}

export interface ProjectStatsForDraft {
  repoName: string;
  commitsCount: number;
  primaryLanguage: string;
  stars: number;
  recentFeatures: string[];
}

export interface ProfileChecklist {
  suggestedHeadline: string;
  suggestedAbout: string;
  suggestedSkills: string[];
  recommendations: string[];
}

export class DraftService {
  /**
   * Generates a weekly LinkedIn progress post adhering strictly to the Anti-fabrication rule:
   * uses only real numbers from the database.
   */
  static generateWeeklyPost(stats: WeeklyStatsForDraft): string {
    const topicMention = stats.topTopic
      ? `deepened my problem-solving skills in ${stats.topTopic} (${stats.topTopicCount} problems)`
      : `solved algorithmic problems consistently`;

    return `🚀 Weekly Dev & DSA Progress Update

Consistent execution compounds over time. Here is my verified weekly breakdown:

• 🧠 Problem Solving: Solved ${stats.totalSolves} LeetCode problems (focused on ${stats.topTopic || 'Core DSA'}).
• 💻 Software Engineering: Shipped ${stats.totalCommits} commits to my repositories, actively developing "${stats.activeRepo}".
• ⏱ Focused Coding: Logged ${stats.codingHours} hours of focused development tracked in VS Code.
• 🔥 Habit & Discipline: Current active streak at ${stats.currentStreak} days with a weekly consistency score of ${stats.consistencyScore}/100.

Key Takeaway: ${stats.topTopic ? `Mastering ${stats.topTopic} patterns helped improve pattern recognition and edge case handling.` : 'Balancing practical building with algorithmic foundations is key.'}

How was your development week? Let's connect and build!

#Coding #DSA #SoftwareEngineering #Consistency #BuildInPublic #DevProfile`;
  }

  /**
   * Generates a project milestone / announcement post
   */
  static generateProjectPost(stats: ProjectStatsForDraft): string {
    return `🎉 Project Milestone: ${stats.repoName} Update

Over the past few days, I pushed ${stats.commitsCount} new commits to "${stats.repoName}", built with ${stats.primaryLanguage}.

What was implemented:
${stats.recentFeatures.map(f => `• ${f}`).join('\n')}

All progress is tracked with verified Git commits and development time.
Check out the repository here: https://github.com/niharikaporwal/${stats.repoName}

Feedback, code reviews, and discussions are welcome!

#WebDevelopment #OpenSource #${stats.primaryLanguage} #SoftwareEngineering`;
  }

  /**
   * Profile checklist: headline, about, and skills suggestions based on verified data
   */
  static generateProfileChecklist(
    topLanguages: string[],
    topTopics: string[],
    totalSolves: number,
    totalCommits: number
  ): ProfileChecklist {
    const langStr = topLanguages.slice(0, 3).join(' | ');
    const headline = `Software Engineering Student @ Medi-Caps University | ${langStr} | ${totalSolves}+ DSA Problems Solved`;

    const about = `Aspiring Software Engineer passionate about writing clean, resilient code and solving complex algorithmic problems.

My journey in numbers (DevProfile Verified):
- ${totalSolves}+ algorithmic problems solved across ${topTopics.slice(0, 4).join(', ')}.
- ${totalCommits}+ commits shipped across multiple full-stack and systems projects.
- Core languages & technologies: ${topLanguages.join(', ')}.

Currently building reliable web platforms and advancing data structures knowledge. Open to software engineering internships and collaborations!`;

    const suggestedSkills = [
      ...topLanguages,
      'Data Structures & Algorithms',
      ...topTopics.slice(0, 4),
      'Git & Version Control',
      'REST APIs'
    ];

    const recommendations = [
      `Add "${langStr}" to your primary LinkedIn headline.`,
      `Feature your top GitHub repository in the LinkedIn "Featured" section with live demo link.`,
      `Include verified metrics (${totalSolves} problems, ${totalCommits} commits) in your About section to stand out with objective proof.`,
      `Pin your DevProfile public portfolio link on your contact info.`
    ];

    return {
      suggestedHeadline: headline,
      suggestedAbout: about,
      suggestedSkills,
      recommendations
    };
  }
}
