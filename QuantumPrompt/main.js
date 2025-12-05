import './style.css'
import { ComicEngine } from './src/comic-engine/Engine.js';
import { TaskConductor } from './src/taskconductor/api.js';

const userInput = document.getElementById('userInput');
const translateBtn = document.getElementById('translateBtn');
const outputSection = document.getElementById('outputSection');

// Initialize Comic Engine
const comicEngine = new ComicEngine('comicCanvas');

const PROMPT_TYPES = [
  {
    type: 'Detailed & Structured',
    description: 'A comprehensive prompt with clear context, constraints, and formatting.',
    template: (input) => `Act as an expert in the field related to: "${input}".\n\nYour task is to provide a comprehensive solution/creation based on the following request:\n"${input}"\n\nPlease ensure the output includes:\n1. A detailed analysis or creative concept.\n2. Step-by-step instructions or logical flow.\n3. Key considerations and best practices.\n\nFormat the response using clear headings and bullet points.`
  },
  {
    type: 'Creative & Abstract',
    description: 'Focuses on generating unique, out-of-the-box ideas.',
    template: (input) => `You are a visionary creative director. I need you to brainstorm unique and innovative concepts for: "${input}".\n\nFocus on:\n- Unconventional approaches.\n- Emotional impact and aesthetics.\n- Future-forward thinking.\n\nProvide 3 distinct concepts with vivid descriptions.`
  },
  {
    description: 'Straight to the point, optimized for quick results.',
    template: (input) => `Task: ${input}\n\nRequirements:\n- Be concise and direct.\n- Focus on the most critical information.\n- Avoid unnecessary fluff.\n\nOutput format: A single paragraph or a short list.`
  },
  {
    type: 'Socratic & Educational',
    description: 'Helps you learn by asking the right questions.',
    template: (input) => `I want to explore the topic: "${input}".\n\nInstead of just giving me the answer, act as a Socratic tutor.\n1. Ask me 3 guiding questions to help me clarify my intent.\n2. Provide a brief overview of the fundamental concepts involved.\n3. Suggest a learning path to master this topic.`
  }
];

translateBtn.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (!text) return;

  // Animation state
  translateBtn.disabled = true;
  translateBtn.querySelector('.btn-content').textContent = 'TRANSLATING...';

  // Start Comic Engine
  comicEngine.start();

  // Run TaskConductor
  TaskConductor.run(text, PROMPT_TYPES).then((results) => {
    generatePrompts(results);
    translateBtn.disabled = false;
    translateBtn.querySelector('.btn-content').textContent = 'QUANTUM TRANSLATE';

    // Stop Comic Engine
    comicEngine.stop();

    // Scroll to results
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Listen for TaskConductor events to update Comic
TaskConductor.on('onStart', () => {
  // Ideally, trigger a specific "Conductor Spawning" scene here
});

TaskConductor.on('onProgress', (data) => {
  // Show worker action in comic
  console.log(`[Comic] ${data.worker} is working on ${data.subtask}`);
});

function generatePrompts(results) {
  outputSection.innerHTML = '';
  outputSection.classList.remove('hidden');

  results.forEach((result, index) => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const generatedContent = result.content;

    card.innerHTML = `
      <div class="card-header">
        <span class="card-type">${result.type}</span>
        <button class="copy-btn" title="Copy to clipboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <div class="card-content">${escapeHtml(generatedContent)}</div>
    `;

    // Copy functionality
    const copyBtn = card.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(generatedContent);
      const originalIcon = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span>Copied!</span>';
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
      }, 2000);
    });

    outputSection.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
