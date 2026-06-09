import { join } from 'node:path';

import { Codex } from '@openai/codex-sdk';

export interface AttemptStartRequest {
  attemptId: string;
  taskId: string;
  requirements: string;
  prompts?: Array<{
    id: string;
    index: number;
    title: string;
    requirements: string;
  }>;
  domIds: Record<string, string>;
  submission: {
    method: 'POST';
    url: string;
    token: string;
  };
}

const processed = new Set<string>();

export async function acceptReferenceAttempt(request: AttemptStartRequest): Promise<void> {
  if (processed.has(request.attemptId)) return;
  processed.add(request.attemptId);
  void runCodexGeneration(request).catch((error) => {
    console.error('Codex reference generation failed:', error);
  });
}

async function runCodexGeneration(request: AttemptStartRequest): Promise<string> {
  const codex = new Codex({ codexPathOverride: codexCliPath() });
  const thread = codex.startThread({
    approvalPolicy: 'never',
    networkAccessEnabled: true,
    sandboxMode: 'workspace-write',
    workingDirectory: process.cwd(),
  });
  const turn = await thread.run(`You are the generic Ranked AA reference agent.

Implement software that satisfies the requirements below without assuming any fixed problem domain. Build the requested application, deploy it to a public URL, then submit that URL to Ranked AA using the submission API.

attemptId: ${request.attemptId}
taskId: ${request.taskId}
requirements:
${combinedRequirements(request)}

DOM IDs:
${JSON.stringify(request.domIds, undefined, 2)}

提出先:
${JSON.stringify(request.submission, undefined, 2)}

Submission body shape:
{
  "appUrl": "https://public-url.example"
}

Use the exact submission method, URL, and bearer token provided above. Do not use any bundled fallback application or hard-coded problem knowledge.`);
  return turn.finalResponse;
}

/**
 * Returns the full requirements text for an attempt. Ranked AA sends only the first
 * stage in `requirements`, so the staged prompts must be concatenated to expose every
 * requirement the submitted app will be judged against.
 */
function combinedRequirements(request: AttemptStartRequest): string {
  if (!request.prompts || request.prompts.length <= 1) return request.requirements;
  const stages = request.prompts.map((prompt) => `### Stage ${prompt.index}: ${prompt.title}\n${prompt.requirements}`);
  return `The task consists of ${request.prompts.length} stages. The single app you submit must satisfy ALL stages.\n\n${stages.join('\n\n')}`;
}

function codexCliPath(): string {
  if (process.env.CODEX_CLI_PATH) return process.env.CODEX_CLI_PATH;
  return join(process.cwd(), 'node_modules', '@openai', 'codex', 'bin', 'codex.js');
}
