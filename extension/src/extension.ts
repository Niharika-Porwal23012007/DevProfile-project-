import * as vscode from 'vscode';
import { SessionTracker } from './sessionTracker';
import { TimerManager } from './timerManager';
import { PomodoroTimer } from './pomodoro';

let sessionTracker: SessionTracker;
let timerManager: TimerManager;
let pomodoroTimer: PomodoroTimer;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log('DevProfile extension is now active!');

  // Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(pulse) DevProfile: Active';
  statusBarItem.tooltip = 'Click to open DevProfile dashboard';
  statusBarItem.command = 'devprofile.openDashboard';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Initialize managers
  sessionTracker = new SessionTracker(context);
  timerManager = new TimerManager(statusBarItem);
  pomodoroTimer = new PomodoroTimer(statusBarItem);

  // 1. Text document edits
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      sessionTracker.onActivity(e.document);
    })
  );

  // 2. Text document saves
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      sessionTracker.onActivity(doc);
    })
  );

  // 3. Active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        sessionTracker.onActivity(editor.document);
      }
    })
  );

  // 4. Window focus changes
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState((state) => {
      if (!state.focused) {
        sessionTracker.closeActiveSession();
      }
    })
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devprofile.startProblem', () => timerManager.startProblem()),
    vscode.commands.registerCommand('devprofile.markSolved', () => timerManager.markSolved()),
    vscode.commands.registerCommand('devprofile.logSession', () => timerManager.logManualSession()),
    vscode.commands.registerCommand('devprofile.togglePomodoro', () => pomodoroTimer.toggle()),
    vscode.commands.registerCommand('devprofile.openDashboard', () => {
      const config = vscode.workspace.getConfiguration('devprofile');
      const apiUrl = config.get<string>('apiUrl', 'http://localhost:5000');
      vscode.env.openExternal(vscode.Uri.parse(apiUrl.replace(':5000', ':5173')));
    }),
    vscode.commands.registerCommand('devprofile.toggleTracking', () => {
      const isPaused = sessionTracker.isTrackingPaused();
      sessionTracker.setPaused(!isPaused);
      if (!isPaused) {
        statusBarItem.text = '$(circle-slash) DevProfile: Paused';
        vscode.window.showInformationMessage('DevProfile: Activity tracking paused.');
      } else {
        statusBarItem.text = '$(pulse) DevProfile: Active';
        vscode.window.showInformationMessage('DevProfile: Activity tracking resumed.');
      }
    })
  );
}

export function deactivate() {
  if (sessionTracker) {
    sessionTracker.dispose();
  }
  if (timerManager) {
    timerManager.dispose();
  }
  if (pomodoroTimer) {
    pomodoroTimer.dispose();
  }
}
