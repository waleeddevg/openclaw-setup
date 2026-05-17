import { NodeSSH } from 'node-ssh';

export class SSHService {
  private ssh: NodeSSH;

  constructor() {
    this.ssh = new NodeSSH();
  }

  async connect(host: string, username: string, password?: string, privateKey?: string) {
    try {
      await this.ssh.connect({
        host,
        username,
        password,
        privateKey,
        readyTimeout: 20000,
      });
      return true;
    } catch (error) {
      console.error('SSH Connection Error:', error);
      throw new Error(`Failed to connect to ${host}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async execute(command: string, onStdout?: (chunk: string) => void, onStderr?: (chunk: string) => void) {
    try {
      const result = await this.ssh.execCommand(command, {
        onStdout: (chunk) => {
          const text = chunk.toString('utf8');
          if (onStdout) onStdout(text);
        },
        onStderr: (chunk) => {
          const text = chunk.toString('utf8');
          if (onStderr) onStderr(text);
        },
      });
      return result;
    } catch (error) {
      console.error('Command Execution Error:', error);
      throw error;
    }
  }

  /**
   * Execute a command with environment variables set safely.
   * This prevents command injection by passing user data as env vars
   * rather than interpolating into shell strings.
   */
  async executeWithEnv(
    command: string,
    envVars: Record<string, string>,
    onStdout?: (chunk: string) => void,
    onStderr?: (chunk: string) => void
  ) {
    // Build env var export statements safely (using single-quoted values to prevent expansion)
    const envExports = Object.entries(envVars)
      .map(([key, value]) => {
        // Escape single quotes in the value by ending the string, adding escaped quote, and starting a new string
        const safeValue = value.replace(/'/g, "'\\''");
        return `export ${key}='${safeValue}'`;
      })
      .join(' && ');

    const fullCommand = envExports ? `${envExports} && ${command}` : command;

    return this.execute(fullCommand, onStdout, onStderr);
  }

  async dispose() {
    this.ssh.dispose();
  }
}

export const createDeploymentLogs = (logs: string[], newLog: string) => {
  const timestamp = new Date().toISOString();
  return [...logs, `[${timestamp}] ${newLog}`];
};
