document.addEventListener('DOMContentLoaded', () => {
  const promptForm = document.getElementById('promptForm');
  const promptList = document.getElementById('promptList');
  const searchInput = document.getElementById('searchPrompts');

  // Load prompts on popup open
  loadPrompts();

  // Save prompt
  promptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('promptName').value;
    const tool = document.getElementById('promptTool').value;
    const text = document.getElementById('promptText').value;

    if (name && tool && text) {
      savePrompt({ name, tool, text });
      promptForm.reset();
      loadPrompts();
    }
  });

  // Search prompts
  searchInput.addEventListener('input', () => {
    loadPrompts();
  });

  function savePrompt(prompt) {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      prompts.push(prompt);
      chrome.storage.sync.set({ prompts }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving prompt:', chrome.runtime.lastError);
        }
      });
    });
  }

  function loadPrompts() {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      const searchTerm = searchInput.value.toLowerCase();
      const filteredPrompts = prompts.filter(prompt => 
        prompt.name.toLowerCase().includes(searchTerm) ||
        prompt.tool.toLowerCase().includes(searchTerm) ||
        prompt.text.toLowerCase().includes(searchTerm)
      );
      displayPrompts(filteredPrompts);
    });
  }

  function displayPrompts(prompts) {
    promptList.innerHTML = '';
    prompts.forEach((prompt, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="prompt-header">
          <strong>${prompt.name}</strong> (${prompt.tool})
          <span class="preview">${prompt.text.substring(0, 50)}...</span>
        </div>
        <div class="prompt-actions">
          <button class="copy-btn" data-index="${index}">Copy</button>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </div>
        <div class="prompt-full" style="display: none;">
          ${prompt.text}
        </div>
      `;

      li.querySelector('.prompt-header').addEventListener('click', () => {
        const fullText = li.querySelector('.prompt-full');
        fullText.style.display = fullText.style.display === 'none' ? 'block' : 'none';
      });

      li.querySelector('.copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(prompt.text).then(() => {
          alert('Prompt copied to clipboard!');
        });
      });

      li.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this prompt?')) {
          deletePrompt(index);
        }
      });

      promptList.appendChild(li);
    });
  }

  function deletePrompt(index) {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      prompts.splice(index, 1);
      chrome.storage.sync.set({ prompts }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error deleting prompt:', chrome.runtime.lastError);
        } else {
          loadPrompts();
        }
      });
    });
  }
});
