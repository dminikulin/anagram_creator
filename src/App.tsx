import React, { useCallback, useMemo, useState } from "react";

export default function App() {
  const [sentenceInput, setSentenceInput] = useState("");
  const [originalSentence, setOriginalSentence] = useState("");
  const [originalSentenceChars, setOriginalSentenceChars] = useState<string[]>(
    [],
  );
  const [anagram, setAnagram] = useState("");
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [allowRepeats, setAllowRepeats] = useState(false);

  const filterChars = useCallback((str: string) => {
    return str
      .toLowerCase()
      .split("")
      .filter((ch) => {
        /[a-zA-Z0-9 ]/.test(ch);
      });
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

    setIsVisible(false);

    setTimeout(() => {
      setOriginalSentence(sentenceInput);
      setOriginalSentenceChars(sentenceInput.split(""));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }, 300);
    setError(false);
  };

  const resetOriginalSentence = () => {
    setIsVisible(false);

    setTimeout(() => {
      setSentenceInput("");
      setAnagram("");
      setOriginalSentence("");
      setOriginalSentenceChars([]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }, 300);
  };

  const toggleStrictCheck = () => {
    setAllowRepeats(!allowRepeats);
  };

  const hasMinRequiredChars = useCallback(() => {
    const originalCounts = countChars(filterChars(originalSentence));
    const anagramCounts = countChars(filterChars(anagram));

    for (const ch of Object.keys(originalCounts)) {
      if ((anagramCounts[ch] || 0) < originalCounts[ch]) {
        return false;
      }
    }

    return true;
  }, [anagram, originalSentence, filterChars]);

  const extraCharPresent = useCallback(() => {
    const originalCounts = countChars(filterChars(originalSentence));
    const anagramChars = filterChars(anagram);
    const anagramCounts = countChars(anagramChars);

    if (!allowRepeats) {
      for (const ch of Object.keys(anagramCounts)) {
        if ((anagramCounts[ch] || 0) > (originalCounts[ch] || 0)) {
          return true;
        }
      }
    } else {
      for (const ch of Object.keys(anagramCounts)) {
        if ((originalCounts[ch] || 0) === 0) {
          return true;
        }
      }
    }

    return false;
  }, [anagram, originalSentence, filterChars, allowRepeats]);

  const createdAnagram = useCallback(() => {
    const normalizedAnagram = anagram.toLowerCase().replace(/\s/g, "");
    const normalizedOriginal = originalSentence
      .toLowerCase()
      .replace(/\s/g, "");

    const isNotSameWord = normalizedAnagram !== normalizedOriginal;
    const hasRequiredLength = !allowRepeats
      ? normalizedAnagram.length === normalizedOriginal.length
      : normalizedAnagram.length >= normalizedOriginal.length;

    if (
      !isNotSameWord ||
      !hasRequiredLength ||
      !hasMinRequiredChars() ||
      extraCharPresent()
    ) {
      return false;
    }

    return true;
  }, [
    anagram,
    originalSentence,
    extraCharPresent,
    hasMinRequiredChars,
    allowRepeats,
  ]);

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
        <span key={idx} className={`${shouldHighlight && "text-stone-400"}`}>
          {ch}
        </span>
      );
    });
  }, [originalSentenceChars, anagram]);

  return (
    <main className="flex min-h-screen flex-col bg-stone-100">
      <h1 className="flex-shrink-0 py-10 text-center text-5xl font-semibold">
        Check your anagram!
      </h1>
      <div className="flex flex-grow flex-col items-center justify-center">
        {originalSentence === "" ? (
          <form
            className={`flex max-w-2xl min-w-xs flex-col transition-all duration-300 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
            onSubmit={submitSentence}
          >
            <h2 className="mb-2 text-center text-3xl">Enter your sentence</h2>
            <input
              className={`ease-in-out" my-1 h-8 rounded-full border bg-zinc-50 px-3 shadow-md shadow-zinc-200 duration-300 placeholder:text-zinc-500 hover:border-zinc-500 hover:bg-zinc-100 ${error ? "border-red-700" : "border-zinc-700"}`}
              type="text"
              name="sentence"
              id="sentence_input"
              placeholder="Your sentence here..."
              value={sentenceInput}
              onChange={(e) => setSentenceInput(e.target.value)}
            />
            {error && <p className="text-red-500">Sentence is empty</p>}
            <button
              type="submit"
              className="button my-2 rounded-full bg-zinc-800 px-5 py-2 text-zinc-50 duration-300 ease-in-out hover:bg-zinc-600"
            >
              Enter
            </button>
          </form>
        ) : (
          <div
            className={`flex max-w-2xl min-w-xs flex-col gap-3 transition-all duration-300 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <h2 className="mb-2 text-center text-3xl">Enter your anagram</h2>
            <input
              className="h-8 rounded-full border border-zinc-700 bg-zinc-50 px-3 shadow-md shadow-zinc-200 duration-300 ease-in-out placeholder:text-zinc-500 hover:border-zinc-500 hover:bg-zinc-100"
              type="text"
              name="anagram"
              placeholder="Your anagram here..."
              onChange={(e) => setAnagram(e.target.value)}
            />
            <div className="flex flex-row justify-center gap-2">
              <input
                id="strict"
                type="checkbox"
                checked={allowRepeats}
                onChange={toggleStrictCheck}
              />
              <label htmlFor="strict">Allow repeats</label>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="mb-2 text-xl">{highlightUsedChars}</p>
              {extraCharPresent() && (
                <p className="text-sm text-red-500">Extra characters found!</p>
              )}
              {createdAnagram() && (
                <p className="text-sm text-green-500">
                  Anagram created successfully!
                </p>
              )}
              <button
                className="button my-4 rounded-full bg-zinc-800 px-5 py-2 text-zinc-50 duration-300 ease-in-out hover:bg-zinc-600"
                onClick={resetOriginalSentence}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex px-10 my-20 items-center justify-center">
        <div className="flex max-w-2xl min-w-xs flex-col items-center">
          <h2 className="mb-4 text-center text-3xl font-semibold">
            How to use:
          </h2>
          <ol className="list-decimal list-inside text-justify">
            <li>
              Enter your original sentence. This will be the basis of your
              anagram.
            </li>
            <li>
              After you submit the sentence, a new field will appear. This is
              where you enter the anagram you have in mind. By default, in the
              anagram each letter of your original sentence is used only once.
              Basic punctuation and spaces are ignored.
            </li>
            <li>
              If you want to have repeating characters in your sentence, click
              "Allow repeats". This way, the characters from your original
              sentence can appear in the anagram more than once.
            </li>
            <li>
              The characters not present in original sentence{" "}
              <span className="font-bold">are not allowed</span> in the anagram.
            </li>
            <li>If you want to start over, just press "Reset".</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
