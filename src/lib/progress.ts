import type { FrameworkId } from "@/types/domain";

const STORAGE_KEY = "pac-trainer-progress-v1";

export interface ProgressState {
  recentDrills: Array<{
    controlId: string;
    title: string;
    frameworkIds: FrameworkId[];
    at: string;
  }>;
  quizScores: Array<{
    controlId: string;
    score: number;
    total: number;
    at: string;
  }>;
  frameworksPracticed: FrameworkId[];
}

const EMPTY: ProgressState = {
  recentDrills: [],
  quizScores: [],
  frameworksPracticed: [],
};

function emptyProgress(): ProgressState {
  return {
    recentDrills: [...EMPTY.recentDrills],
    quizScores: [...EMPTY.quizScores],
    frameworksPracticed: [...EMPTY.frameworksPracticed],
  };
}

function resolveStorage(storage?: Storage): Storage | undefined {
  if (storage) {
    return storage;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function normalizeProgress(value: unknown): ProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyProgress();
  }

  const record = value as Record<string, unknown>;
  return {
    recentDrills: Array.isArray(record.recentDrills)
      ? (record.recentDrills as ProgressState["recentDrills"])
      : [],
    quizScores: Array.isArray(record.quizScores)
      ? (record.quizScores as ProgressState["quizScores"])
      : [],
    frameworksPracticed: Array.isArray(record.frameworksPracticed)
      ? (record.frameworksPracticed as ProgressState["frameworksPracticed"])
      : [],
  };
}

function writeProgress(state: ProgressState, storage?: Storage): ProgressState {
  const target = resolveStorage(storage);
  if (target) {
    target.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

export function loadProgress(storage?: Storage): ProgressState {
  const target = resolveStorage(storage);
  if (!target) {
    return emptyProgress();
  }

  try {
    const value = target.getItem(STORAGE_KEY);
    return value ? normalizeProgress(JSON.parse(value)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveDrillProgress(
  entry: ProgressState["recentDrills"][number],
  storage?: Storage,
): ProgressState {
  const current = loadProgress(storage);
  const state: ProgressState = {
    ...current,
    recentDrills: [entry, ...current.recentDrills].slice(0, 10),
    frameworksPracticed: [
      ...new Set([...current.frameworksPracticed, ...entry.frameworkIds]),
    ],
  };

  return writeProgress(state, storage);
}

export function saveQuizScore(
  entry: ProgressState["quizScores"][number],
  storage?: Storage,
): ProgressState {
  const current = loadProgress(storage);
  const state: ProgressState = {
    ...current,
    quizScores: [entry, ...current.quizScores],
  };

  return writeProgress(state, storage);
}

export function clearProgress(storage?: Storage): ProgressState {
  const target = resolveStorage(storage);
  if (target) {
    target.removeItem(STORAGE_KEY);
  }

  return emptyProgress();
}
