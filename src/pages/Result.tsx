import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type Detail = {
  id: string;
  score: number;
  total: number;
  max: number;
  chapter: string;
  difficulty: string;
  questions: { question: string; options: string[]; answer: number }[];
  answers: { [k: number]: number };
  createdAt: number;
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location as any)?.state as { score?: number; total?: number; testId?: string } | undefined;

  const detail: Detail | null = useMemo(() => {
    const id = navState?.testId;
    try {
      const mapRaw = localStorage.getItem("neet_tests_by_id");
      const map = mapRaw ? JSON.parse(mapRaw) : {};
      return id && map[id] ? map[id] : null;
    } catch {
      return null;
    }
  }, [navState?.testId]);

  const fallback = useMemo(() => {
    try {
      const raw = localStorage.getItem("neet_recent_tests");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  }, []);

  const score = detail?.score ?? navState?.score ?? fallback?.score ?? 0;
  const total = detail?.total ?? navState?.total ?? (fallback ? Math.round((fallback.max ?? 0) / 4) : 0);
  const testId = detail?.id ?? navState?.testId ?? fallback?.id ?? "";

  const [showScore, setShowScore] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const maxScore = Math.max((detail?.max ?? total * 4), 0);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  const getPerformanceData = () => {
    if (percentage >= 80) {
      return { level: "Excellent! 🎉", color: "from-green-400 to-emerald-500", bgColor: "from-green-50 to-emerald-50", message: "Outstanding performance! You're ready for NEET!" };
    } else if (percentage >= 60) {
      return { level: "Good! 👍", color: "from-blue-400 to-purple-500", bgColor: "from-blue-50 to-purple-50", message: "Well done! Keep practicing to improve further." };
    } else if (percentage >= 40) {
      return { level: "Fair! 📚", color: "from-yellow-400 to-orange-500", bgColor: "from-yellow-50 to-orange-50", message: "You're on the right track. More practice needed." };
    } else {
      return { level: "Keep Learning! 💪", color: "from-red-400 to-pink-500", bgColor: "from-red-50 to-pink-50", message: "Don't give up! Review the concepts and try again." };
    }
  };

  const performance = getPerformanceData();

  useEffect(() => { setTimeout(() => setShowScore(true), 300); }, []);

  if (!navState && !fallback) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No result to display</h2>
          <p className="text-gray-600 mb-6">Start a test to see your results here.</p>
          <button onClick={() => navigate("/")} className="w-full bg-[#1877f2] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#166fe0]">Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${performance.bgColor} flex items-center justify-center p-6`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-2xl text-center">
        {testId && (
          <div className="mb-2 text-sm text-gray-500">Test ID: <span className="font-semibold text-gray-700">{testId}</span></div>
        )}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Test Complete!
          </h2>
          <p className="text-gray-600">Here's how you performed</p>
        </div>

        <div className="mb-6">
          <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${performance.color} text-white font-semibold mb-3`}>
            {performance.level}
          </div>
          <p className="text-gray-700">{performance.message}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`text-5xl font-black bg-gradient-to-r ${performance.color} bg-clip-text text-transparent`}>
              {showScore ? score : 0}
            </div>
            <div className="text-2xl text-gray-400 font-bold">/ {maxScore}</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div className={`h-3 bg-gradient-to-r ${performance.color} rounded-full transition-all duration-700 ease-out`} style={{ width: showScore ? `${percentage}%` : '0%' }}></div>
          </div>
          <p className="text-sm text-gray-600">{showScore ? `${percentage.toFixed(1)}%` : '0%'} accuracy</p>
        </div>

        <div className="space-y-3 mb-4">
          <button onClick={() => navigate("/")} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:from-purple-700 hover:to-blue-700 transition">🏠 Take Another Test</button>
          <button onClick={() => setShowReview((v) => !v)} className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:border-purple-400 hover:text-purple-600 transition">↩️ Review Answers</button>
        </div>

        {showReview && detail && (
          <div className="text-left space-y-4 max-h-[60vh] overflow-auto pr-1">
            {detail.questions.map((q, i) => {
              const user = detail.answers?.[i];
              const correct = q.answer;
              return (
                <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white">
                  <div className="text-sm text-gray-500 mb-1">Question {i + 1}</div>
                  <div className="font-semibold text-gray-900 mb-3">{q.question}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, idx) => {
                      const isCorrect = idx === correct;
                      const isUser = idx === user;
                      return (
                        <div key={idx} className={`px-3 py-2 rounded-lg border text-sm ${
                          isCorrect ? 'border-green-500 bg-green-50 text-green-800' : isUser ? 'border-red-500 bg-red-50 text-red-800' : 'border-gray-200'
                        }`}>
                          {opt}
                          {isCorrect ? '  ✓' : isUser ? '  ✗' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
