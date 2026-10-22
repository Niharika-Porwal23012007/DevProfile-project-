import * as vscode from 'vscode';
import { ApiClient, SessionPayload } from './apiClient';

interface ActiveSession {
  project: string;
  repoUrl?: string;
  language: string;
  file?: string;
  startTime: Date;
  lastActivity: Date;
  durationSec: number;
}

export class SessionTracker {
  private activeSession: ActiveSession | null = null;
  private finishedBuffer: SessionPayload[] = [];
  private isPaused: boolean = false;
  private uploadTimer: NodeJS.Timeout | null = null;

  constructor(private context: vscode.ExtensionContext) {
    this.startUploadInterval();
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused && this.activeSession) {
      this.closeActiveSession();
    }
  }

  public isTrackingPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Called on editor activity (keystroke, save, cursor change)
   */
  public onActivity(document?: vscode.TextDocument) {
    if (this.isPaused) return;
    if (!document || document.isUntitled) return;

    const config = vscode.workspace.getConfiguration('devprofile');
    const idleMinutes = config.get<number>('idleMinutes', 2);
    const trackFileNames = config.get<boolean>('trackFileNames', false);
    const ignored = config.get<string[]>('ignoredProjects', []);

    // Check project name
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const projectName = workspaceFolder ? workspaceFolder.name : 'Unknown';

    if (ignored.some(pattern => projectName.toLowerCase().includes(pattern.toLowerCase()))) {
      return;
    }

    const now = new Date();
    const language = document.languageId || 'plaintext';
    let fileMeta: string;

    if (trackFileNames) {
      fileMeta = vscode.workspace.asRelativePath(document.uri);
    } else {
      const ext = document.fileName.split('.').pop();
      fileMeta = ext ? `*.${ext}` : 'file';
    }

    // Check if continuing current session or starting a new one
    if (this.activeSession) {
      const gapSec = (now.getTime() - this.activeSession.lastActivity.getTime()) / 1000;
      const isSameContext =
        this.activeSession.project === projectName &&
        this.activeSession.language === language &&
        this.activeSession.file === fileMeta;

      if (gapSec <= idleMinutes * 60 && isSameContext) {
        // Continue active session
        this.activeSession.durationSec += Math.round(gapSec);
        this.activeSession.lastActivity = now;
        return;
      } else {
        // Gap exceeded idle limit or context changed -> close session
        this.closeActiveSession();
      }
    }

    // Start a new session
    this.activeSession = {
      project: projectName,
      repoUrl: undefined,
      language,
      file: fileMeta,
      startTime: now,
      lastActivity: now,
      durationSec: 5
    };
  }

  /**
   * Closes active session and moves to buffer
   */
  public closeActiveSession() {
    if (!this.activeSession) return;

    if (this.activeSession.durationSec >= 10) {
      this.finishedBuffer.push({
        project: this.activeSession.project,
        repoUrl: this.activeSession.repoUrl,
        language: this.activeSession.language,
        file: this.activeSession.file,
        start: this.activeSession.startTime.toISOString(),
        durationSec: this.activeSession.durationSec
      });
      this.mergeBuffer();
    }

    this.activeSession = null;
  }

  /**
   * Merges contiguous sessions on the same file/project
   */
  private mergeBuffer() {
    if (this.finishedBuffer.length < 2) return;

    const merged: SessionPayload[] = [];
    for (const curr of this.finishedBuffer) {
      const prev = merged[merged.length - 1];
      if (
        prev &&
        prev.project === curr.project &&
        prev.language === curr.language &&
        prev.file === curr.file
      ) {
        prev.durationSec += curr.durationSec;
      } else {
        merged.push(curr);
      }
    }
    this.finishedBuffer = merged;
  }

  /**
   * Flushes sessions to backend
   */
  public async flush(): Promise<void> {
    this.closeActiveSession();
    if (this.finishedBuffer.length === 0) return;

    const config = vscode.workspace.getConfiguration('devprofile');
    const apiUrl = config.get<string>('apiUrl', 'http://localhost:5000');
    const apiKey = config.get<string>('apiKey', '');

    if (!apiKey) return;

    const toSend = [...this.finishedBuffer];
    this.finishedBuffer = [];

    try {
      await ApiClient.sendSessions(apiUrl, apiKey, toSend);
    } catch (err: any) {
      console.warn('[DevProfile] Session upload deferred, will retry later:', err.message);
      // Re-insert un-sent sessions back into buffer
      this.finishedBuffer.unshift(...toSend);
    }
  }

  private startUploadInterval() {
    // Flush buffered sessions every 3 minutes
    this.uploadTimer = setInterval(() => {
      this.flush();
    }, 3 * 60 * 1000);
  }

  public dispose() {
    if (this.uploadTimer) clearInterval(this.uploadTimer);
    this.flush();
  }
}
