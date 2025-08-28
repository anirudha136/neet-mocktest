interface Props {
    qIndex: number;
    question: string;
    options: string[];
    selected?: number;
    onSelect: (qIndex: number, optIndex: number) => void;
  }
  
  export default function QuestionCard({ qIndex, question, options, selected, onSelect }: Props) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        {/* Question Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {qIndex + 1}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">{question}</h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt, i) => (
            <label 
              key={i} 
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selected === i
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={`q-${qIndex}`}
                checked={selected === i}
                onChange={() => onSelect(qIndex, i)}
                className="w-5 h-5 accent-purple-600"
              />
              <span className={`font-medium ${
                selected === i ? "text-purple-800" : "text-gray-800"
              }`}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  