const historyList = document.querySelector('#history-list');
const refreshButton = document.querySelector('#refresh-history');

async function loadHistory() {
  historyList.innerHTML = '<div class="loading-state"><span class="loader"></span><p>Loading workflow history…</p></div>';
  try {
    // Expected API: GET /api/workflows returns { workflows: [{id,title,prompt,createdAt,steps}] }.
    const response = await fetch('/api/workflows', {credentials: 'include'});
    if (response.status === 401) {
      showEmpty('Log in to see your history.', 'Go to login', 'login.html');
      return;
    }
    if (!response.ok) throw new Error('History service is not configured yet.');
    const data = await response.json();
    const workflows = Array.isArray(data) ? data : (data.workflows || []);
    if (!workflows.length) {
      showEmpty('No workflows yet.', 'Create your first workflow', 'index.html');
      return;
    }
    historyList.replaceChildren();
    workflows.forEach(workflow => {
      const item = document.createElement('article');
      item.className = 'history-item';
      const icon = document.createElement('div');
      icon.className = 'history-icon';
      icon.textContent = '✳';
      const content = document.createElement('div');
      content.className = 'history-item-content';
      const title = document.createElement('h3');
      title.textContent = workflow.title || 'Untitled workflow';
      const prompt = document.createElement('p');
      prompt.textContent = workflow.prompt || workflow.description || 'No prompt details saved.';
      const meta = document.createElement('div');
      meta.className = 'history-meta';
      const date = workflow.createdAt ? new Date(workflow.createdAt).toLocaleString() : 'Date unavailable';
      meta.textContent = `${date}${workflow.steps?.length ? ` · ${workflow.steps.length} steps` : ''}`;
      content.append(title, prompt, meta);
      item.append(icon, content);
      historyList.appendChild(item);
    });
  } catch (error) {
    historyList.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'error-state';
    box.textContent = 'Could not load saved history. Connect GET /api/workflows to your database-backed API, then refresh.';
    historyList.appendChild(box);
  }
}

function showEmpty(title, actionText, href) {
  historyList.replaceChildren();
  const state = document.createElement('div');
  state.className = 'empty-state';
  const strong = document.createElement('strong');
  strong.textContent = title;
  const link = document.createElement('a');
  link.href = href;
  link.textContent = actionText;
  state.append(strong, link);
  historyList.appendChild(state);
}
refreshButton.addEventListener('click', loadHistory);
loadHistory();
