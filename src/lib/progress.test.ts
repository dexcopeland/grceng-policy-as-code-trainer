import { clearProgress, loadProgress, saveDrillProgress, saveQuizScore } from "./progress";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
  };
}

describe("progress", () => {
  it("returns empty state for corrupt JSON", () => {
    const storage = memoryStorage();
    storage.setItem("pac-trainer-progress-v1", "{not-json");
    expect(loadProgress(storage).recentDrills).toEqual([]);
  });

  it("filters malformed progress entries instead of trusting them", () => {
    const storage = memoryStorage();
    storage.setItem(
      "pac-trainer-progress-v1",
      JSON.stringify({
        recentDrills: [
          null,
          {
            controlId: "AC-2",
            title: "Account Management",
            frameworkIds: ["nist-800-53"],
            at: "2026-08-04T00:00:00.000Z",
          },
        ],
        quizScores: [
          { controlId: "AC-2" },
          {
            controlId: "AC-2",
            score: 4,
            total: 5,
            at: "2026-08-04T00:01:00.000Z",
          },
        ],
        frameworksPracticed: ["nist-800-53", null, 12],
      }),
    );

    const loaded = loadProgress(storage);
    expect(loaded.recentDrills).toHaveLength(1);
    expect(loaded.recentDrills[0].controlId).toBe("AC-2");
    expect(loaded.quizScores).toHaveLength(1);
    expect(loaded.quizScores[0].score).toBe(4);
    expect(loaded.frameworksPracticed).toEqual(["nist-800-53"]);
  });

  it("keeps drill saves usable when persistence writes fail", () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error("quota exceeded");
    };

    const next = saveDrillProgress(
      {
        controlId: "AC-2",
        title: "Account Management",
        frameworkIds: ["nist-800-53"],
        at: "2026-08-04T00:00:00.000Z",
      },
      storage,
    );

    expect(next.persisted).toBe(false);
    expect(next.state.recentDrills[0].controlId).toBe("AC-2");
    expect(next.state.frameworksPracticed).toContain("nist-800-53");
  });

  it("reports clear failure when removeItem throws", () => {
    const storage = memoryStorage();
    saveDrillProgress(
      {
        controlId: "AC-2",
        title: "Account Management",
        frameworkIds: ["nist-800-53"],
        at: "2026-08-04T00:00:00.000Z",
      },
      storage,
    );
    storage.removeItem = () => {
      throw new Error("read-only");
    };

    const cleared = clearProgress(storage);
    expect(cleared.persisted).toBe(false);
    expect(cleared.state.recentDrills[0]?.controlId).toBe("AC-2");
  });

  it("saves drills and quiz scores and tracks frameworks", () => {
    const storage = memoryStorage();
    const drillSave = saveDrillProgress(
      {
        controlId: "AC-2",
        title: "Account Management",
        frameworkIds: ["nist-800-53"],
        at: "2026-08-04T00:00:00.000Z",
      },
      storage,
    );
    expect(drillSave.persisted).toBe(true);

    const next = saveQuizScore(
      {
        controlId: "AC-2",
        score: 4,
        total: 5,
        at: "2026-08-04T00:01:00.000Z",
      },
      storage,
    );
    expect(next.persisted).toBe(true);
    expect(next.state.recentDrills[0].controlId).toBe("AC-2");
    expect(next.state.quizScores[0].score).toBe(4);
    expect(next.state.frameworksPracticed).toContain("nist-800-53");

    const cleared = clearProgress(storage);
    expect(cleared.persisted).toBe(true);
    expect(loadProgress(storage).quizScores).toEqual([]);
  });
});
