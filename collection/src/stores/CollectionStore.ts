import { makeAutoObservable, runInAction } from 'mobx';
import type { AutoTask, CollectionRecord } from '../data/types';
import { collectionApi } from '../api/collection';

// Holds auto-task list + collection-job records. Pages observe this.
// Mutations route through `collectionApi`, which today wraps mock data
// but is the single seam to swap for real backend later.

export class CollectionStore {
  tasks: AutoTask[] = [];
  jobs: CollectionRecord[] = [];

  loadingTasks = false;
  loadingJobs = false;
  loaded = false;

  constructor() { makeAutoObservable(this); }

  loadAll = async () => {
    if (this.loaded) return;
    this.loadingTasks = true;
    this.loadingJobs = true;
    const [tasks, jobs] = await Promise.all([
      collectionApi.listTasks(),
      collectionApi.listJobs(),
    ]);
    runInAction(() => {
      this.tasks = tasks;
      this.jobs = jobs;
      this.loadingTasks = false;
      this.loadingJobs = false;
      this.loaded = true;
    });
  };

  addTask = async (t: AutoTask) => {
    const saved = await collectionApi.createTask(t);
    runInAction(() => { this.tasks.push(saved); });
  };

  updateTask = async (t: AutoTask) => {
    const saved = await collectionApi.updateTask(t);
    runInAction(() => {
      const i = this.tasks.findIndex((x) => x.id === saved.id);
      if (i >= 0) this.tasks[i] = saved;
    });
  };

  toggleEnabled = async (id: string, enabled: boolean) => {
    const saved = await collectionApi.toggleEnabled(id, enabled);
    runInAction(() => {
      const i = this.tasks.findIndex((x) => x.id === id);
      if (i >= 0) this.tasks[i] = saved;
    });
  };

  deleteTask = async (id: string) => {
    await collectionApi.deleteTask(id);
    runInAction(() => { this.tasks = this.tasks.filter((x) => x.id !== id); });
  };

  abortJob = async (id: string, reason: string) => {
    const saved = await collectionApi.abortJob(id, reason);
    runInAction(() => {
      const i = this.jobs.findIndex((x) => x.id === id);
      if (i >= 0) this.jobs[i] = saved;
    });
  };
}
