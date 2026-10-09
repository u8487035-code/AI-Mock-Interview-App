
import "./App.css";
import { useState, useEffect } from "react";
import { getAIFeedback, generateQuestions } from "./ai";

function App() {
  const [name, setName] = useState("");
  const[numberOfQuestions,setNumberOfQuestions]=useState(5);
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  

  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(60);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState(() => {
  const savedHistory = localStorage.getItem("interviewHistory");
  return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // =========================
  // START INTERVIEW
  // =========================

  const startInterview = async () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!role) {
      alert("Please select a role");
      return;
    }

    try {
      alert("Generating AI interview questions...");

      const aiQuestions = await generateQuestions(role, difficulty,numberOfQuestions);

      console.log("Generated questions:", aiQuestions);

      if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
        throw new Error("AI did not generate questions.");
      }

      setQuestions(aiQuestions);

      setQuestionIndex(0);
      setQuestion(aiQuestions[0]);

      setAnswer("");
      setFeedback(null);
      setTotalScore(0);
      setTimeLeft(60);
      setInterviewCompleted(false);

    } catch (error) {
      console.error("Question generation error:", error);

      alert("Unable to generate AI questions.");
    }
  };
  const startVoiceAnswer = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;

    setAnswer((prev) =>
      prev ? prev + " " + spokenText : spokenText
    );
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    alert("Could not recognize your voice.");
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};


  // =========================
  // SUBMIT ANSWER
  // =========================
  
 
  const submitAnswer = async () => {
  if (!answer.trim()) {
    alert("Please type your answer.");
    return;
  }

  if (isEvaluating) {
    return;
  }

  try {
    setIsEvaluating(true);

    const result = await getAIFeedback(question, answer);

    setFeedback(result);
    setTotalScore((prev) => prev + result.score);

  } catch (error) {
    console.error("Feedback error:", error);
    alert("Failed to generate AI feedback.");

  } finally {
    setIsEvaluating(false);
  }
};


  // =========================
  // NEXT QUESTION
  // =========================

  const nextQuestion = () => {

    if (questionIndex < questions.length - 1) {

      const next = questionIndex + 1;

      setQuestionIndex(next);

      setQuestion(questions[next]);

      setAnswer("");
      setFeedback(null);
      setTimeLeft(60);

    } 
    else {
  const maximumScore = questions.length * 10;

  const percentage =
    maximumScore > 0
      ? Math.round((totalScore / maximumScore) * 100)
      : 0;

  const newInterview = {
    name: name,
    role: role,
    difficulty: difficulty,
    totalQuestions: questions.length,
    score: totalScore,
    maximumScore: maximumScore,
    percentage: percentage,
    date: new Date().toLocaleString(),
  };

  const updatedHistory = [
    ...interviewHistory,
    newInterview,
  ];

  setInterviewHistory(updatedHistory);

  localStorage.setItem(
    "interviewHistory",
    JSON.stringify(updatedHistory)
  );

  setInterviewCompleted(true);
}
  };


  // =========================
  // TIMER
  // =========================

  useEffect(() => {

    if (!question) {
      return;
    }

    if (interviewCompleted) {
      return;
    }

    if (feedback) {
      return;
    }

    if (timeLeft <= 0) {

      nextQuestion();

      return;
    }

    const timer = setTimeout(() => {

      setTimeLeft((prev) => prev - 1);

    }, 1000);

    return () => clearTimeout(timer);

  }, [timeLeft, question, feedback, interviewCompleted]);


  // =========================
  // INTERVIEW COMPLETED
  // =========================

  if (interviewCompleted) {

    const maximumScore = questions.length * 10;

    const percentage =
      maximumScore > 0
        ? Math.round((totalScore / maximumScore) * 100)
        : 0;


    return (
      <div
        style={{
          maxWidth: "500px",
          margin: "60px auto",
          textAlign: "center",
          padding: "20px",
        }}
      >

        <h1
          style={{
            fontSize: "36px",
            marginBottom: "20px",
            lineHeight: "1.2",
          }}
        >
          Interview Completed! 🎉
        </h1>


        <h2>Interview Report</h2>


        <p>
          <b>Name:</b> {name}
        </p>


        <p>
          <b>Role:</b> {role}
        </p>


        <p>
          <b>Difficulty:</b> {difficulty}
        </p>
        
         <div
  style={{
    background: "#f5f7ff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
  }}
>
  <p>
    <b>Total Questions:</b> {questions.length}
  </p>

  <p>
    <b>Answered Questions:</b> {questions.length}
  </p>

  <p>
    <b>Maximum Score:</b> {maximumScore}
  </p>

  <p>
    <b>Final Score:</b> {totalScore}/{maximumScore}
  </p>

  <p>
    <b>Percentage:</b> {percentage}%
  </p>

  <p>
    <b>Performance:</b>{" "}
    {percentage >= 80
      ? "Excellent 🌟"
      : percentage >= 60
      ? "Good 👍"
      : percentage >= 40
      ? "Average 🙂"
      : "Needs Improvement 💪"}
  </p>
</div>
      


        <button
          onClick={() => {

            setInterviewCompleted(false);

            setQuestions([]);

            setQuestion("");

            setQuestionIndex(0);

            setAnswer("");

            setFeedback(null);

            setTotalScore(0);

            setTimeLeft(30);

            setRole("");

            setName("");

          }}

          style={{
            padding: "10px 20px",
            marginTop: "20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Restart Interview
        </button>
        {interviewHistory.length > 0 && (
  <div
    style={{
      marginTop: "30px",
      padding: "20px",
      background: "#f5f7ff",
      borderRadius: "12px",
      textAlign: "left",
    }}
  >
    <h2 style={{ textAlign: "center" }}>
      📋 Interview History
    </h2>

    {interviewHistory.map((interview, index) => (
      <div
        key={index}
        style={{
          background: "white",
          padding: "15px",
          marginTop: "15px",
          borderRadius: "10px",
          boxShadow: "0 0 5px rgba(0,0,0,0.1)",
        }}
      >
        <p>
          <b>Interview {index + 1}</b>
        </p>

        <p>
          <b>Name:</b> {interview.name}
        </p>

        <p>
          <b>Role:</b> {interview.role}
        </p>

        <p>
          <b>Difficulty:</b> {interview.difficulty}
        </p>

        <p>
          <b>Score:</b>{" "}
          {interview.score}/{interview.maximumScore}
        </p>

        <p>
          <b>Percentage:</b> {interview.percentage}%
        </p>

        <p>
          <b>Date:</b> {interview.date}
        </p>
      </div>
    ))}
  </div>
)}

      </div>
    );
  }


  // =========================
  // MAIN PAGE
  // =========================

  return (

    <div
      style={{
        maxWidth: "600px",
        margin: "80px auto",
        padding: "30px",
        textAlign: "center",
        background: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >

      <h1 className="title">
        AI Mock Interview
      </h1>


      {/* NAME */}

      
      
      <input
  type="text"
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
/>

<input
  type="number"
  min="1"
  max="20"
  placeholder="Number of questions"
  value={numberOfQuestions}
  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
/>



      {/* ROLE */}

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}

        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      >

        <option value="">
          Select Role
        </option>

        <option value="Python Developer">
          Python Developer
        </option>

        <option value="Java Developer">
          Java Developer
        </option>

        <option value="Frontend Developer">
          Frontend Developer
        </option>

        <option value="Backend Developer">
          Backend Developer
        </option>

        <option value="Full Stack Developer">
          Full Stack Developer
        </option>

        <option value="Data Analyst">
          Data Analyst
        </option>

        <option value="AI/ML Engineer">
          AI/ML Engineer
        </option>

      </select>


      {/* DIFFICULTY */}

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}

        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      >

        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>

      </select>


      {/* START */}

      <button
        onClick={startInterview}

        style={{
          padding: "10px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Start Interview
      </button>


      {/* QUESTIONS */}

      {question && questions.length > 0 && (

        <div className="container">


          {/* TIMER */}

          <h3
            style={{
              color: "red",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            ⏳ Time Left: {timeLeft} seconds
          </h3>


          {/* QUESTION NUMBER */}

          <h2>

            Question {questionIndex + 1} of{" "}
            {questions.length}


            <div className="progress-bar">

              <div
                className="progress-fill"

                style={{
                  width: `${
                    ((questionIndex + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />

            </div>

          </h2>


          {/* QUESTION */}

          <h3
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              color: "#333",
            }}
          >
            {question}
          </h3>


          {/* PROGRESS */}

          <p>

            {Math.round(
              ((questionIndex + 1) /
                questions.length) *
                100
            )}

            % Completed

          </p>


          {/* ANSWER */}

          <textarea
            rows={6}
            value={answer}

            onChange={(e) =>
              setAnswer(e.target.value)
            }

            placeholder="Type your answer here..."

            style={{
              width: "100%",
              padding: "10px",
            }}
          />


          <br />
          <button
        onClick={startVoiceAnswer}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: isListening ? "red" : "#7c3aed",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {isListening ? "🎤 Listening..." : "🎤 Speak Answer"}
</button>


          {/* SUBMIT */}

          {!feedback && (
             
             

             <button
            onClick={submitAnswer}
            disabled={isEvaluating}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: isEvaluating ? "#999" : "green",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isEvaluating ? "not-allowed" : "pointer",
            }}
          >
            {isEvaluating ? "🤖 Evaluating..." : "Submit Answer"}
          </button>

          )}


          {/* FEEDBACK */}

          {feedback && (

            <div className="feedback">

              <h3>
                AI Feedback
              </h3>


              <p>
                <b>Score:</b>{" "}
                {feedback.score}/10
              </p>


              <p>
                <b>Strengths:</b>{" "}
                {feedback.strengths}
              </p>


              <p>
                <b>Weaknesses:</b>{" "}
                {feedback.weaknesses}
              </p>

              <p>
                <b>Proper Answer:</b>{" "}
                {feedback.properAnswer}
              </p>


              <p>
                <b>Tips:</b>{" "}
                {feedback.tips}
              </p>


              <h3>
                Total Score: {totalScore}
              </h3>


              <button
                onClick={nextQuestion}

                style={{
                  marginTop: "10px",
                  padding: "10px 20px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {questionIndex <
                questions.length - 1
                  ? "Next Question"
                  : "Finish Interview"}
              </button>

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default App;