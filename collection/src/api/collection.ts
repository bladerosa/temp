// Single seam to swap mock data for real backend later.
// Today every method wraps `mockData` in a Promise (with a tiny delay
// to mimic round-trip), but the signatures match what an HTTP client
// will eventually return — so the stores never change.

import { initialTasks } from '../data/mockData';
import { queryUncollected, type UncollectedQueryResult } from '../data/mockData';
import * as mock from '../data/mockData';
import type { AutoTask, CollectionRecord } from '../data/types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Hold an in-memory mutable copy so create/update/delete work without a backend.
const tasks: AutoTask[] = initialTasks.map((t) => structuredClone(t));
const jobs: CollectionRecord[] = (mock.initialRecords ?? []).map((r) => structuredClone(r));

export const collectionApi = {
  async listTasks(): Promise<AutoTask[]> {
    await wait(80);
    return tasks.map((t) => structuredClone(t));
  },
  async createTask(t: AutoTask): Promise<AutoTask> {
    await wait(120);
    tasks.push(structuredClone(t));
    return structuredClone(t);
  },
  async updateTask(t: AutoTask): Promise<AutoTask> {
    await wait(120);
    const i = tasks.findIndex((x) => x.id === t.id);
    if (i >= 0) tasks[i] = structuredClone(t);
    return structuredClone(t);
  },
  async toggleEnabled(id: string, enabled: boolean): Promise<AutoTask> {
    await wait(60);
    const t = tasks.find((x) => x.id === id);
    if (!t) throw new Error(`task ${id} not found`);
    t.enabled = enabled;
    return structuredClone(t);
  },
  async deleteTask(id: string): Promise<void> {
    await wait(80);
    const i = tasks.findIndex((x) => x.id === id);
    if (i >= 0) tasks.splice(i, 1);
  },

  async listJobs(): Promise<CollectionRecord[]> {
    await wait(80);
    return jobs.map((j) => structuredClone(j));
  },
  async abortJob(id: string, reason: string): Promise<CollectionRecord> {
    await wait(120);
    const j = jobs.find((x) => x.id === id);
    if (!j) throw new Error(`job ${id} not found`);
    j.status = 'aborted';
    j.abortedAt = new Date().toISOString();
    j.abortedReason = reason;
    return structuredClone(j);
  },

  async queryUncollected(chainId: string, tokenId: string): Promise<UncollectedQueryResult> {
    await wait(600);
    return queryUncollected(chainId, tokenId);
  },

  async submitManualCollection(_payload: {
    chainId: string; tokenId: string; minAmount: number; convertible: boolean;
  }): Promise<{ jobId: string }> {
    await wait(1400);
    return { jobId: `job_${Date.now()}` };
  },
};
