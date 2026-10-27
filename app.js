const promptBox = document.querySelector('#workflow-prompt');
const charCount = document.querySelector('#char-count');
const generateBtn = document.querySelector('#generate-btn');
const resultBox = document.querySelector('#workflow-result');

promptBox.addEventListener('input', () => {
  charCount.textContent = `${promptBox.value.length} / 1200`;
  if (promptBox.value.length > 1200) promptBox.value = promptBox.value.slice(0, 1200);
});

document.querySelectorAll('.suggestion').forEach(button => {
  button.addEventListener('click', () => {
    promptBox.value = button.dataset.prompt;
    promptBox.dispatchEvent(new Event('input'));
    promptBox.focus();
  });
});

document.querySelectorAll('.tool-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    document.querySelectorAll('.tool-tile').forEach(item => item.classList.remove('selected'));
    tile.classList.add('selected');
    const tool = tile.dataset.tool;
    const prompt = promptBox.value.trim();
    if (prompt) promptBox.value = `${prompt}\n\nPreferred tool: ${tool}`;
    else promptBox.value = `Help me use ${tool} to accomplish my goal.`;
    promptBox.dispatchEvent(new Event('input'));
    promptBox.focus();
  });
});

generateBtn.addEventListener('click', async () => {
  const prompt = promptBox.value.trim();
  if (!prompt) {
    promptBox.focus();
    promptBox.style.borderColor = '#d88a71';
    setTimeout(() => promptBox.style.borderColor = '', 1200);
    return;
  }
  generateBtn.disabled = true;
  generateBtn.querySelector('span:first-child').textContent = 'Planning…';
  try {
    // Backend contract: POST /api/workflows with { prompt }.
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error('Workflow API is not configured yet.');
    const data = await response.json();
    renderWorkflow(data.workflow || data);
  } catch (error) {
    // Helpful frontend preview when the backend is not connected.
    renderWorkflow({
      title: 'Your workflow preview',
      steps: [
        'Clarify the goal and identify the output you need.',
        'Choose the AI tool best suited to each task.',
        'Run the task, review the result, and refine it.',
        'Save the final output and check it against your goal.'
      ],
      preview: true
    });
    const note = document.createElement('p');
    note.className = 'small-note';
    note.textContent = 'Preview mode: connect POST /api/workflows to generate and save real workflows.';
    resultBox.appendChild(note);
  } finally {
    generateBtn.disabled = false;
    generateBtn.querySelector('span:first-child').textContent = 'Generate workflow';
  }
});

function renderWorkflow(workflow) {
  resultBox.hidden = false;
  resultBox.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = workflow.title || 'Suggested workflow';
  resultBox.appendChild(heading);
  const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
  if (steps.length) {
    const list = document.createElement('ol');
    steps.forEach(step => {
      const item = document.createElement('li');
      item.textContent = typeof step === 'string' ? step : (step.title || step.name || JSON.stringify(step));
      list.appendChild(item);
    });
    resultBox.appendChild(list);
  } else {
    const p = document.createElement('p');
    p.textContent = workflow.description || 'Workflow received from your server.';
    resultBox.appendChild(p);
  }
  const actions = document.createElement('div');
  actions.className = 'result-actions';
  const save = document.createElement('button');
  save.className = 'secondary-small';
  save.type = 'button';
  save.textContent = 'Save to history';
  save.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
        body: JSON.stringify({prompt: promptBox.value.trim(), workflow, action: 'save'})
      });
      if (!response.ok) throw new Error();
      save.textContent = 'Saved ✓';
    } catch {
      save.textContent = 'Connect backend to save';
    }
  });
  const edit = document.createElement('button');
  edit.className = 'secondary-small';
  edit.type = 'button';
  edit.textContent = 'Edit prompt';
  edit.addEventListener('click', () => promptBox.focus());
  actions.append(save, edit);
  resultBox.appendChild(actions);
}
