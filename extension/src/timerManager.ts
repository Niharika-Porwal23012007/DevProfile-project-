import * as vscode from 'vscode';
import { ApiClient } from './apiClient';

export class TimerManager {
  private activeProblem: string | null = null;
  private startTime: Date | null = null;
  private statusBarItem: vscode.StatusBarItem;
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(statusBarItem: vscode.StatusBarItem) {
    this.statusBarItem = statusBarItem;
  }

  public async startProblem() {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter LeetCode problem title or slug (e.g. coin-change)',
      placeHolder: 'coin-change'
    });

    if (!input || !input.trim()) return;

    this.activeProblem = input.trim();
    this.startTime = new Date();

    // Create a local scratch file for testing
    const doc = await vscode.workspace.openTextDocument({
      language: 'typescript',
      content: `// LeetCode Problem: ${this.activeProblem}\n// Started: ${this.startTime.toLocaleTimeString()}\n\nfunction solve() {\n  // Your code here\n}\n`
    });
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(`DevProfile: Started timer for "${this.activeProblem}"`);
    this.updateStatus();
    this.intervalHandle = setInterval(() => this.updateStatus(), 1000);
  }

  public async markSolved() {
    if (!this.activeProblem || !this.startTime) {
      vscode.window.showWarningMessage('DevProfile: No active LeetCode problem timer running.');
      return;
    }

    const durationSec = Math.round((Date.now() - this.startTime.getTime()) / 1000);
    const problemName = this.activeProblem;

    // Clear timer
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.activeProblem = null;
    this.startTime = null;
    this.statusBarItem.text = '$(pulse) DevProfile: Active';

    // Prompt for difficulty feeling
    const feeling = await vscode.window.showQuickPick(
      [
        { label: 'Easy', description: 'Solved smoothly with no major hurdles' },
        { label: 'Medium', description: 'Required moderate thought and debugging' },
        { label: 'Hard', description: 'Challenging optimal solution' },
        { label: 'Struggled', description: 'Needed hints or took a long time (will schedule spaced repetition)' }
      ],
      { placeHolder: 'How did this problem feel?' }
    );

    const difficultyFeeling = feeling ? feeling.label : 'Medium';

    const config = vscode.workspace.getConfiguration('devprofile');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:5000');
    const apiKey = config.get<string>('apiKey', '');

    try {
      const res = await ApiClient.sendProblemTime(apiUrl, apiKey, {
        problem: problemName,
        durationSec,
        difficultyFeeling
      });

      const mins = Math.round(durationSec / 60);
      let msg = `DevProfile: Solved "${problemName}" in ${mins}m (${difficultyFeeling}).`;
      if (res.spacedRepetitionScheduled) {
        msg += ' Spaced-repetition review scheduled in 3 days!';
      }
      vscode.window.showInformationMessage(msg);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Failed to record solve time: ${err.message}`);
    }
  }

  public async logManualSession() {
    const minutesStr = await vscode.window.showInputBox({
      prompt: 'Enter offline/manual coding minutes to log',
      placeHolder: '45'
    });
    if (!minutesStr) return;
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) return;

    const config = vscode.workspace.getConfiguration('devprofile');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:5000');
    const apiKey = config.get<string>('apiKey', '');

    try {
      await ApiClient.sendSessions(apiUrl, apiKey, [
        {
          project: 'Manual Work',
          language: 'Mixed',
          start: new Date().toISOString(),
          durationSec: minutes * 60
        }
      ]);
      vscode.window.showInformationMessage(`DevProfile: Successfully logged ${minutes} minutes of manual work.`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Failed to log session: ${err.message}`);
    }
  }

  private updateStatus() {
    if (!this.activeProblem || !this.startTime) return;
    const elapsedSec = Math.round((Date.now() - this.startTime.getTime()) / 1000);
    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;
    const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;
    this.statusBarItem.text = `$(watch) ${this.activeProblem} [${timeStr}]`;
  }

  public dispose() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }
}
