const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const MODEL = "openai/gpt-4o-mini";


// ===============================
// GENERATE AI INTERVIEW QUESTIONS
// ===============================

export async function generateQuestions(role, difficulty,numberOfQuestions) {

  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model: MODEL,

      messages: [
        {
          role: "system",

          content: `You are an expert technical interviewer.

Generate exactly ${numberOfQuestions} interview questions.
Role:${role}
Difficulty:${difficulty}
The questions must be suitable for the selected role and difficulty.

Return ONLY a JSON array of 5 strings.

Do NOT include markdown.
Do NOT include explanations.
Do NOT include numbering.`
        },

        {
          role: "user",

          content: `Role: ${role}
Difficulty: ${difficulty}

Generate ${numberOfQuestions} interview questions for this role.`
        }
      ],

      temperature: 0.7
    })
  });


  // Check whether OpenRouter accepted the request

  if (!response.ok) {

    const errorData = await response.json();

    console.error("OpenRouter error:", errorData);

    throw new Error(
      errorData.error?.message ||
      "OpenRouter API request failed"
    );
  }


  const data = await response.json();

  console.log("AI response:", data);


  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI did not return any questions.");
  }


  // Remove possible markdown ```json ... ```

  const cleanedContent = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();


  const questions = JSON.parse(cleanedContent);


  if (!Array.isArray(questions)) {
    throw new Error("AI response is not an array.");
  }


 
  if (questions.length !== numberOfQuestions) {
  throw new Error(
    `AI generated ${questions.length} questions instead of ${numberOfQuestions}.`
  );
}


  return questions;
}


// ===============================
// AI ANSWER FEEDBACK
// ===============================


export async function getAIFeedback(question, answer) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${
          import.meta.env.VITE_OPENROUTER_API_KEY
        }`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "openai/gpt-4o-mini",

        messages: [
          {
            role: "system",

            content: `
You are an expert technical interviewer.

Evaluate the candidate's answer carefully.

Return ONLY valid JSON in exactly this format:

{
  "score": 8,
  "strengths": "What the candidate explained correctly.",
  "weaknesses": "What is missing or incorrect.",
  "properAnswer": "A clear and technically correct ideal answer to the question.",
  "tips": "How the candidate can improve their answer."
}

Rules:

1. Give a score from 0 to 10.
2. Do NOT give a high score if the answer is incomplete.
3. Identify technically incorrect information.
4. The properAnswer must directly answer the interview question.
5. Keep the properAnswer understandable for a student.
6. Do not make up information.
7. Return ONLY JSON.
`
          },

          {
            role: "user",

            content: `
Interview Question:
${question}

Candidate's Answer:
${answer}
`
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();

  const aiText = data.choices[0].message.content;

  console.log("AI feedback:", aiText);

  return JSON.parse(aiText);
}