import React, { useCallback, useMemo, useState } from "react";

export default function App() {
  const [sentenceInput, setSentenceInput] = useState("");
  const [originalSentence, setOriginalSentence] = useState("");
  const [originalSentenceChars, setOriginalSentenceChars] = useState<string[]>(
    [],
  );
  const [anagram, setAnagram] = useState("");
  const [error, setError] = useState(false);

  const filterChars = useCallback((str: string) => {
    const IGNORED_CHARS = [" ", ",", "."];
    return str
      .toLowerCase()
      .split("")
      .filter((ch) => !IGNORED_CHARS.includes(ch));
  }, []);

  const countChars = (chars: string[]) => {
    const counts: { [ch: string]: number } = {};
    for (const ch of chars) {
      counts[ch] = (counts[ch] || 0) + 1;
    }
    return counts;
  };

  const submitSentence = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sentenceInput === "") {
      setError(true);
      return;
    }

    setOriginalSentence(sentenceInput);
    setOriginalSentenceChars(sentenceInput.split(""));
  };

  const resetOriginalSentence = () => {
    setSentenceInput("");
    setAnagram("");
    setOriginalSentence("");
    setOriginalSentenceChars([]);
  };

  const extraCharPresent = useCallback(() => {
    const originalCounts = countChars(filterChars(originalSentence));
    const anagramChars = filterChars(anagram);
    const anagramCounts = countChars(anagramChars);

    for (const ch of Object.keys(anagramCounts)) {
      if ((anagramCounts[ch] || 0) > (originalCounts[ch] || 0)) {
        return true;
      }
    }

    return false;
  }, [anagram, originalSentence, filterChars]);

  const createdAnagram = useCallback(() => {
    return (
      anagram.toLowerCase() !== originalSentence.toLowerCase() &&
      anagram.split(" ").join("").length ===
        originalSentence.split(" ").join("").length &&
      !extraCharPresent()
    );
  }, [anagram, originalSentence, extraCharPresent]);

  const highlightUsedChars = useMemo(() => {
    if (!originalSentenceChars.length) return null;

    const typedLower = anagram.toLowerCase();
    const typedCounts: { [ch: string]: number } = {};

    for (const ch of typedLower) {
      typedCounts[ch] = (typedCounts[ch] || 0) + 1;
    }

    const highlightTracker: { [char: string]: number } = {};

    return originalSentenceChars.map((ch, idx) => {
      const chLower = ch.toLowerCase();

      highlightTracker[chLower] = highlightTracker[chLower] || 0;
      const typedCount = typedCounts[chLower] || 0;

      const shouldHighlight = highlightTracker[chLower] < typedCount;
      if (shouldHighlight) {
        highlightTracker[chLower]++;
      }

      return (
        <span
          key={idx}
          className={`${shouldHighlight && 'text-stone-400'}`}
        >
          {ch}
        </span>
      );
    });
  }, [originalSentenceChars, anagram]);

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col">
      <h1 className="text-5xl font-semibold text-center py-10 flex-shrink-0">
        Anagram creator
      </h1>
      <div className="flex-grow flex flex-col justify-center items-center">
        {originalSentence === "" ? (
          <form
            className="flex flex-col min-w-xs max-w-2xl"
            onSubmit={submitSentence}
          >
            <h2 className="text-3xl text-center mb-2">Enter your sentence</h2>
            <input
              className={`border bg-zinc-50 shadow-md shadow-zinc-200 hover:bg-zinc-100 hover:border-zinc-500 h-8 rounded-full my-1 px-3 placeholder:text-zinc-500 duration-300 ease-in-out" ${error ? "border-red-700" : "border-zinc-700"}`}
              type="text"
              name="sentence"
              id="sentence_input"
              placeholder="Your sentence here..."
              value={sentenceInput}
              onChange={(e) => setSentenceInput(e.target.value)}
            />
            {error && <p className="text-red-500">Sentence is empty</p>}
          </form>
        ) : (
          <div className="flex flex-col gap-3 min-w-xs max-w-2xl">
            <h2 className="text-3xl text-center mb-2">Enter your anagram</h2>
            <input
              className="border border-zinc-700 bg-zinc-50 shadow-md shadow-zinc-200 hover:bg-zinc-100 hover:border-zinc-500 h-8 rounded-full px-3 placeholder:text-zinc-500 duration-300 ease-in-out"
              type="text"
              name="anagram"
              placeholder="Your anagram here..."
              onChange={(e) => setAnagram(e.target.value)}
            />
            <div className="flex flex-col justify-center items-center">
              <p className="mb-2 text-xl">{highlightUsedChars}</p>
              {extraCharPresent() && (
                <p className="text-sm text-red-500">Extra characters found!</p>
              )}
              {createdAnagram() && (
                <p className="text-sm text-green-500">Anagram created successfully!</p>
              )}
              <button
                className="button bg-zinc-800 hover:bg-zinc-600 text-zinc-50 my-4 px-5 py-2 rounded-full duration-300 ease-in-out"
                onClick={resetOriginalSentence}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
