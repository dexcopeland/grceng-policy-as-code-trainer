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

export interface ProgressWriteResult {
  state: ProgressState;
  persisted: boolean;
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

function isFrameworkId(value: unknown): value is FrameworkId {
  return typeof value === "string" && value.length > 0;
}

function isRecentDrill(
  value: unknown,
): value is ProgressState["recentDrills"][number] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.controlId === "string" &&
    typeof record.title === "string" &&
    Array.isArray(record.frameworkIds) &&
    record.frameworkIds.every(isFrameworkId) &&
    typeof record.at === "string"
  );
}

function isQuizScore(
  value: unknown,
): value is ProgressState["quizScores"][number] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.controlId === "string" &&
    typeof record.score === "number" &&
    typeof record.total === "number" &&
    typeof record.at === "string"
  );
}

function normalizeProgress(value: unknown): ProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyProgress();
  }

  const record = value as Record<string, unknown>;
  return {
    recentDrills: Array.isArray(record.recentDrills)
      ? record.recentDrills.filter(isRecentDrill)
      : [],
    quizScores: Array.isArray(record.quizScores)
      ? record.quizScores.filter(isQuizScore)
      : [],
    frameworksPracticed: Array.isArray(record.frameworksPracticed)
      ? record.frameworksPracticed.filter(isFrameworkId)
      : [],
  };
}

function writeProgress(
  state: ProgressState,
  storage?: Storage,
): ProgressWriteResult {
  const target = resolveStorage(storage);
  if (!target) {
    // No storage available — treat as not persisted so callers do not claim save success.
    return { state, persisted: false };
  }

  try {
    target.setItem(STORAGE_KEY, JSON.stringify(state));
    return { state, persisted: true };
  } catch {
    // Persistence is best-effort; drills/quizzes must still work offline.
    return { state, persisted: false };
  }
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
): ProgressWriteResult {
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
): ProgressWriteResult {
  const current = loadProgress(storage);
  const state: ProgressState = {
    ...current,
    quizScores: [entry, ...current.quizScores],
  };

  return writeProgress(state, storage);
}

export function clearProgress(storage?: Storage): ProgressWriteResult {
  const target = resolveStorage(storage);
  if (!target) {
    return { state: emptyProgress(), persisted: true };
  }

  try {
    target.removeItem(STORAGE_KEY);
    return { state: emptyProgress(), persisted: true };
  } catch {
    // Clear failed; keep whatever is still on disk so UI does not pretend it cleared.
    return { state: loadProgress(storage), persisted: false };
  }
}
