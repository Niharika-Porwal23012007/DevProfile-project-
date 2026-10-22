import * as vscode from 'vscode';

export class PomodoroTimer {
  private isRunning: boolean = false;
  private isBreak: boolean = false;
  private secondsRemaining: number = 25 * 60;
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(private statusBarItem: vscode.StatusBarItem) {}

  public toggle() {
    if (this.isRunning) {
      this.stop();
      vscode.window.showInformationMessage('Pomodoro timer stopped.');
    } else {
      this.start();
      vscode.window.showInformationMessage('Pomodoro session started (25 minutes). Happy focusing!');
    }
  }

  private start() {
    this.isRunning = true;
    this.isBreak = false;
    this.secondsRemaining = 25 * 60;
    this.tick();
    this.intervalHandle = setInterval(() => this.tick(), 1000);
  }

  private stop() {
    this.isRunning = false;
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.statusBarItem.text = '$(pulse) DevProfile: Active';
  }

  private tick() {
    this.secondsRemaining--;
    const m = Math.floor(this.secondsRemaining / 60);
    const s = this.secondsRemaining % 60;
    const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;

    if (this.secondsRemaining <= 0) {
      if (!this.isBreak) {
        this.isBreak = true;
        this.secondsRemaining = 5 * 60;
        vscode.window.showInformationMessage('🎉 Pomodoro complete! Take a well-deserved 5-minute break.');
      } else {
        this.isBreak = false;
        this.secondsRemaining = 25 * 60;
        vscode.window.showInformationMessage('☕ Break finished! Ready to begin next 25-minute focus session?');
      }
    }

    const icon = this.isBreak ? '$(coffee)' : '$(flame)';
    this.statusBarItem.text = `${icon} Pomodoro: ${timeStr}`;
  }

  public dispose() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }
}
