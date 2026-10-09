export function evaluateAnswer(answer) {
  let score = 5;

  if (answer.length > 30) score += 2;
  if (answer.length > 80) score += 2;

  if (
    answer.toLowerCase().includes("because") ||
    answer.toLowerCase().includes("example")
  ) {
    score += 1;
  }

  if (score > 10) score = 10;

  let strengths = "Good attempt.";

  if (answer.length > 80) {
    strengths = "Your answer is detailed and well explained.";
  }

  let weaknesses = "Try giving more details and examples.";

  if (answer.length > 80) {
    weaknesses = "Minor improvements needed in clarity.";
  }

  return {
    score,
    strengths,
    weaknesses,
    tips:
      "Speak confidently, give real-life examples, and keep your answer structured."
  };
}