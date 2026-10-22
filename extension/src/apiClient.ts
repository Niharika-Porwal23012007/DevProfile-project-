import * as https from 'https';
import * as http from 'http';
import * as url from 'url';

export interface SessionPayload {
  project: string;
  repoUrl?: string;
  language: string;
  file?: string;
  start: string;
  durationSec: number;
}

export class ApiClient {
  static async sendSessions(apiUrl: string, apiKey: string, sessions: SessionPayload[]): Promise<void> {
    if (!apiKey || sessions.length === 0) return;
    const endpoint = `${apiUrl.replace(/\/$/, '')}/api/sessions`;
    await this.post(endpoint, apiKey, { sessions });
  }

  static async sendProblemTime(
    apiUrl: string,
    apiKey: string,
    data: { problem: string; durationSec: number; difficultyFeeling: string }
  ): Promise<any> {
    if (!apiKey) throw new Error('API key not configured in DevProfile settings.');
    const endpoint = `${apiUrl.replace(/\/$/, '')}/api/problem-times`;
    return await this.post(endpoint, apiKey, data);
  }

  private static post(targetUrl: string, apiKey: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsed = new url.URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const dataString = JSON.stringify(payload);

      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString),
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'DevProfile-VSCode/1.0.0'
        },
        timeout: 8000
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve({ raw: body });
            }
          } else {
            reject(new Error(`Server returned HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      req.write(dataString);
      req.end();
    });
  }
}
