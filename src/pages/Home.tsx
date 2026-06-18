import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chapters } from "../utils/chapters";

export default function Home() {
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [isLoading, setIsLoading] = useState(false);
  const [recent, setRecent] = useState<Array<{ id: string; score: number; max: number }>>([]);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("neet_recent_tests");
      if (raw) setRecent(JSON.parse(raw));
      console.debug("[Home] Loaded recent tests");
    } catch (e) {
      console.error("[Home] Failed to load recent tests", e);
    }
  }, []);

  // Visitor counter using countapi.xyz with local fallback
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://api.countapi.xyz/hit/neet-mocktest/homepage");
        const data = await res.json();
        if (!cancelled) setVisitorCount(Number(data?.value) || null);
      } catch {
        // Fallback: device-only counter
        try {
          const k = "neet_device_visits";
          const n = Number(localStorage.getItem(k) || "0") + 1;
          localStorage.setItem(k, String(n));
          if (!cancelled) setVisitorCount(n);
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleStart = async () => {
    if (!selectedChapter || selectedConcepts.length === 0) {
      alert("Select a chapter and at least one concept!");
      return;
    }

    setIsLoading(true);
    const testId = `${Date.now()}`;
    console.info("[Home] Starting test", { testId, selectedChapter, concepts: selectedConcepts.length, difficulty });
    setTimeout(() => {
      navigate("/test", { state: { chapter: selectedChapter, concepts: selectedConcepts, difficulty, testId } });
    }, 1200);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-600";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-blue-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-start sm:items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Header like Facebook */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-[#1877f2]">NEET Mock</h1>
          <p className="text-gray-600">Practice biology with curated questions</p>
          {visitorCount !== null && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-xs shadow-sm">
              <span>Visitors</span>
              <span className="font-semibold">{visitorCount}</span>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#1877f2] font-bold">N</div>
              <div>
                <div className="font-semibold text-gray-900">Create a test</div>
                <div className="text-xs text-gray-500">Choose chapter, concepts and difficulty</div>
              </div>
            </div>
            <span className={`hidden sm:inline-block text-xs px-2 py-1 rounded-full text-white ${getDifficultyColor(difficulty)}`}>{difficulty}</span>
          </div>

          <div className="p-5 space-y-6">
            {/* Chapter Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Select Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  setSelectedConcepts([]);
                  console.debug("[Home] Chapter selected", e.target.value);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:border-[#1877f2]"
              >
                <option value="">-- Choose a Chapter --</option>
                {Object.entries(chapters).map(([domain, chaps]) =>
                  Object.keys(chaps).map((ch) => (
                    <option key={ch} value={ch}>{domain.toUpperCase()} - {ch}</option>
                  ))
                )}
              </select>
            </div>

            {/* Concepts Selection */}
            {selectedChapter && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Select Concepts</p>
                {chapters.botany[selectedChapter as keyof typeof chapters.botany] || chapters.zoology[selectedChapter as keyof typeof chapters.zoology] ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(chapters.botany[selectedChapter as keyof typeof chapters.botany] || chapters.zoology[selectedChapter as keyof typeof chapters.zoology]).map((c: string) => (
                      <label key={c} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer bg-white">
                        <input
                          type="checkbox"
                          checked={selectedConcepts.includes(c)}
                          onChange={() => {
                            setSelectedConcepts((prev) =>
                              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                            );
                            console.debug("[Home] Toggle concept", c);
                          }}
                          className="accent-[#1877f2]"
                        />
                        <span className="text-gray-800 text-sm">{c}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Difficulty Selection */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Difficulty</p>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => { setDifficulty(diff); console.debug("[Home] Difficulty set", diff); }}
                    className={`px-3 py-2 rounded-lg border text-sm transition ${
                      difficulty === diff ? "bg-[#1877f2] border-[#1877f2] text-white" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button 
              onClick={handleStart} 
              disabled={!selectedChapter || selectedConcepts.length === 0 || isLoading}
              className={`w-full py-3 rounded-lg font-semibold text-sm transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#1877f2] hover:bg-[#166fe0] text-white"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Test...
                </div>
              ) : (
                "Start Test"
              )}
            </button>
          </div>
        </div>

        {/* Recent Tests */}
        {recent.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Tests</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {recent.slice(0, 4).map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Test ID</div>
                    <div className="font-semibold text-gray-900 text-sm">{r.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Score</div>
                    <div className="font-semibold text-gray-900 text-sm">{r.score} / {r.max}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
