const Groq = require('groq-sdk');
const { HfInference } = require('@huggingface/inference');
const fs = require('fs');

// Groq for text generation (fast + free + reliable)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Hugging Face only for image verification (CLIP)
const hf = new HfInference(process.env.HF_TOKEN);


// ── 1. GENERATE A TASK ──────────────────────────────────────────────
// Uses Groq (Llama 3.1)
async function generateTask(difficulty) {
  let difficultyConstraint = "";
  if (difficulty === 'easy') {
    difficultyConstraint = "simple, silly, and safe tasks that can be done instantly (e.g., 'Do a silly dance for 5 seconds', 'Take a selfie with a spoon'). Focus on low-effort fun.";
  } else if (difficulty === 'medium') {
    difficultyConstraint = "tasks requiring moderate effort, coordination, or mild social bravery (e.g., 'Do 15 squats while singing a song', 'Balance a full glass of water on your palm for 20 seconds'). No simple selfies.";
  } else if (difficulty === 'hard') {
    difficultyConstraint = "genuinely challenging, unhinged, or physically demanding tasks (e.g., 'Do a handstand against a wall for 10 seconds', 'Bark like a dog loudly in a public area or hallway', 'Hold a plank for 60 seconds while describing your deepest fear'). Must be undeniably difficult.";
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are the Chaos Master. Generate a task for a user. 
Difficulty: ${difficulty}. 
Type: ${difficultyConstraint}.
Return a JSON object with:
"task": one short crazy sentence,
"taskLabel": a 1-2 word label summarizing it (e.g. "wave", "pushups", "bark").`
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = JSON.parse(response.choices[0].message.content);
  return content;
}


// ── 2. VERIFY IMAGE ──────────────────────────────────────────────────
// Uses Hugging Face CLIP for zero-shot image classification
async function verifyImage(imagePath, taskLabel) {
  const imageData = fs.readFileSync(imagePath);

  // We add specialized "Hard Negatives" to force CLIP to be more specific.
  // If we only give it the taskLabel, it might default to it even for poor matches.
  const candidateLabels = [
    taskLabel,
    `a photo of a person ${taskLabel}`,
    'a blank or blurry screen',
    'a static room with no activity',
    'random household objects',
    'a person doing something completely different',
    'nonsense'
  ];

  try {
    const result = await hf.zeroShotImageClassification({
      model: 'openai/clip-vit-base-patch32',
      inputs: { image: imageData },
      parameters: { candidate_labels: candidateLabels }
    });

    // Sort results to see the top match
    const sorted = result.sort((a, b) => b.score - a.score);
    const topResult = sorted[0];

    // Logging all scores for backend transparency
    console.log(`[CLIP Scores] Top 3:`);
    sorted.slice(0, 3).forEach((r, i) => console.log(`  ${i+1}. ${r.label}: ${(r.score * 100).toFixed(1)}%`));

    // STRICTOR RULES:
    // 1. Top label must actually be the task label (or its persona version)
    // 2. Score must be > 0.55 (previously 0.3)
    const isTaskLabel = topResult.label === taskLabel || topResult.label.includes(taskLabel);
    const passed = isTaskLabel && topResult.score > 0.55;

    return {
      passed,
      topLabel: topResult.label,
      confidence: topResult.score
    };

  } catch (error) {
    console.error('[CLIP Error]:', error.message);
    return {
      passed: false,
      topLabel: 'error',
      confidence: 0,
      error: error.message
    };
  }
}


// ── 3. GENERATE REWARD / JUDGMENT ────────────────────────────────────
async function generateJudgment(taskText, passed) {
  const mood = passed 
    ? 'celebrate them sarcastically' 
    : 'mock them gently and encourage them';

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: `The user was given this task: "${taskText}".
They ${passed ? 'completed' : 'failed'} it.
Write one short funny sentence to ${mood}. 
Return only that sentence.`
      }
    ],
    max_tokens: 60,
    temperature: 0.8,
  });

  return response.choices[0].message.content.trim();
}


module.exports = { generateTask, verifyImage, generateJudgment };
