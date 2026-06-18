import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateQuestions } from "../utils/geminiApi";
import Timer from "../componenets/Timer";
import QuestionCard from "../componenets/QuestionCard";

export default function Test() {
  const navigate = useNavigate();
  const { state } = useLocation() as any; 
  const { chapter, concepts, difficulty, testId } = state;

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // Calculate total time: 20 seconds per question
  const totalTime = questions.length * 20;

  useEffect(() => {
    console.info("[Test] Mount", { testId, chapter, conceptsCount: concepts?.length, difficulty });
    (async () => {
      try {
        const q = await generateQuestions(chapter, concepts, difficulty);
        console.info("[Test] Questions loaded", { count: q.length });
        setQuestions(q);
      } catch (error) {
        console.error("[Test] Failed to generate questions", error);
        const fallback = [
          { question: "What is the basic unit of life?", options: ["Cell", "Tissue", "Organ", "System"], answer: 0 },
          { question: "Which kingdom includes bacteria?", options: ["Monera", "Protista", "Fungi", "Plantae"], answer: 0 }
        ];
        setQuestions(fallback);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [chapter, concepts, difficulty]);

  const handleAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
    console.debug("[Test] Answer set", { qIndex, optionIndex });
  };

  const submitTest = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) score += 4;
      else if (answers[i] !== undefined) score -= 1;
    });
    console.info("[Test] Submit", { answered: Object.keys(answers).length, total: questions.length, score });

    const detail = {
      id: testId || `${Date.now()}`,
      score,
      total: questions.length,
      max: questions.length * 4,
      chapter,
      difficulty,
      questions,
      answers,
      createdAt: Date.now(),
    };

    try {
      const raw = localStorage.getItem("neet_recent_tests");
      const existing = raw ? JSON.parse(raw) : [];
      const next = [{ id: detail.id, score: detail.score, max: detail.max }, ...existing].slice(0, 10);
      localStorage.setItem("neet_recent_tests", JSON.stringify(next));

      const detailMapRaw = localStorage.getItem("neet_tests_by_id");
      const detailMap = detailMapRaw ? JSON.parse(detailMapRaw) : {};
      detailMap[detail.id] = detail;
      localStorage.setItem("neet_tests_by_id", JSON.stringify(detailMap));
      console.debug("[Test] Saved detail", { id: detail.id });
    } catch (e) {
      console.error("[Test] Saving detail failed", e);
    }

    navigate("/result", { state: { score: detail.score, total: detail.total, testId: detail.id } });
  };

  const handleSubmitClick = () => { setShowConfirm(true); console.debug("[Test] Show confirm"); };
  const handleConfirmSubmit = () => { setShowConfirm(false); submitTest(); };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Preparing your feed</h2>
          <p className="text-gray-500">Fetching questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar like Twitter */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-[#1d9bf0] font-semibold hover:opacity-90">Back</button>
          <div className="text-center">
            <div className="text-base font-bold text-gray-900">{chapter}</div>
            <div className="text-xs text-gray-500 capitalize">{difficulty} • {questions.length} questions</div>
          </div>
          <Timer duration={totalTime} onTimeUp={submitTest} />
        </div>
      </div>

      {/* Feed container */}
      <div className="max-w-2xl mx-auto border-x border-gray-200 min-h-screen">
        {/* TestId banner */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white sticky top-[42px] z-10">
          <div className="text-xs text-gray-500">Test ID</div>
          <div className="text-sm font-semibold text-gray-800">{testId}</div>
        </div>

        {/* Questions tiles */}
        <div className="divide-y divide-gray-200">
          {questions.map((q, i) => (
            <div key={i} className="px-4 py-4 hover:bg-gray-50 transition">
              <QuestionCard
                qIndex={i}
                question={q.question}
                options={q.options}
                selected={answers[i]}
                onSelect={handleAnswer}
              />
            </div>
          ))}
        </div>

        {/* Submit footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleSubmitClick}
            className="w-full bg-[#1d9bf0] text-white px-4 py-3 rounded-full font-bold hover:bg-[#1a8cd8] transition"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Submit test?</h3>
            <p className="text-gray-600 mb-5">Are you sure you want to submit? You cannot change your answers after submission.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleConfirmSubmit} className="flex-1 px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8]">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
