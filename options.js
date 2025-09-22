class OptionsManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      mode: 'auto',
      targetLanguage: 'es'
    });

    document.querySelector(`input[value="${settings.mode}"]`).checked = true;
    document.getElementById('target-language').value = settings.targetLanguage;

    this.updateRadioStyles();
  }

  setupEventListeners() {
    const radioButtons = document.querySelectorAll('input[name="mode"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        this.updateRadioStyles();
      });
    });

    document.getElementById('save-button').addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('target-language').addEventListener('change', () => {
      this.markUnsaved();
    });

    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        this.markUnsaved();
      });
    });

    // Add test button functionality
    document.getElementById('test-button').addEventListener('click', () => {
      this.testDefineMe();
    });

    // Add double-click functionality to demo text
    document.getElementById('demo-text').addEventListener('dblclick', (event) => {
      this.handleDemoDoubleClick(event);
    });
  }

  testDefineMe() {
    // For the test button, directly lookup "Hello"
    this.performLookup('Hello');
  }

  handleDemoDoubleClick(event) {
    try {
      console.log('DefineMe Options: Double-click detected');

      // Get the clicked word
      const selection = window.getSelection();
      let word = null;

      // Method 1: Check for selected text
      if (selection.toString().trim()) {
        word = selection.toString().trim();
        console.log('DefineMe Options: Found selected text:', word);
      }
      // Method 2: Extract word from position
      else {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
          const textNode = range.startContainer;
          const textContent = textNode.textContent;
          const offset = range.startOffset;

          // Find word boundaries
          let start = offset;
          let end = offset;

          const wordRegex = /[a-zA-Z]/;

          // Find start of word
          while (start > 0 && wordRegex.test(textContent[start - 1])) {
            start--;
          }

          // Find end of word
          while (end < textContent.length && wordRegex.test(textContent[end])) {
            end++;
          }

          word = textContent.substring(start, end).trim();
          console.log('DefineMe Options: Extracted word from position:', word);
        }
      }

      if (word && word.length > 0 && word.length < 30) {
        event.preventDefault();
        this.performLookup(word);
      } else {
        console.log('DefineMe Options: No valid word found');
      }
    } catch (error) {
      console.error('DefineMe Options: Double-click error:', error);
    }
  }

  async performLookup(word) {
    try {
      console.log('DefineMe Options: Looking up word:', word);

      // Get current settings
      const settings = await chrome.storage.sync.get({
        mode: 'auto',
        targetLanguage: 'es'
      });

      // Send message to background script
      chrome.runtime.sendMessage(
        { action: 'lookup', word: word },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('DefineMe Options: Runtime error:', chrome.runtime.lastError);
            this.showResult(word, { error: 'Extension error' });
            return;
          }

          console.log('DefineMe Options: Received response:', response);
          this.showResult(word, response);
        }
      );
    } catch (error) {
      console.error('DefineMe Options: Lookup error:', error);
      this.showResult(word, { error: 'Failed to lookup word' });
    }
  }

  showResult(word, result) {
    // Create or update result display
    let resultDiv = document.getElementById('lookup-result');
    if (!resultDiv) {
      resultDiv = document.createElement('div');
      resultDiv.id = 'lookup-result';
      resultDiv.style.cssText = `
        margin-top: 15px;
        padding: 15px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;

      const demoSection = document.querySelector('.demo-section');
      demoSection.appendChild(resultDiv);
    }

    if (result.error) {
      resultDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <strong style="color: #d32f2f;">${word}</strong>
          <span style="margin-left: 8px; padding: 2px 6px; background: #ffebee; border-radius: 12px; font-size: 12px; color: #d32f2f;">Error</span>
        </div>
        <div style="color: #d32f2f;">${result.error}</div>
      `;
    } else if (result.definition) {
      resultDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <strong style="color: #1976d2;">${word}</strong>
          <span style="margin-left: 8px; padding: 2px 6px; background: #e3f2fd; border-radius: 12px; font-size: 12px; color: #1976d2;">Definition</span>
        </div>
        <div>${result.definition}</div>
        ${result.phonetic ? `<div style="color: #666; font-style: italic; margin-top: 4px;">${result.phonetic}</div>` : ''}
      `;
    } else if (result.translation) {
      resultDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <strong style="color: #388e3c;">${word}</strong>
          <span style="margin-left: 8px; padding: 2px 6px; background: #e8f5e8; border-radius: 12px; font-size: 12px; color: #388e3c;">Translation</span>
        </div>
        <div>${result.translation}</div>
        <div style="color: #666; font-size: 12px; margin-top: 4px;">
          ${result.detectedLang ? `From: ${result.detectedLang}` : ''}
          ${result.service ? ` • ${result.service}` : ''}
        </div>
      `;
    }
  }

  updateRadioStyles() {
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio.checked) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  markUnsaved() {
    const button = document.getElementById('save-button');
    button.textContent = 'Save Settings';
    button.classList.remove('saved');
  }

  async saveSettings() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const targetLanguage = document.getElementById('target-language').value;

    await chrome.storage.sync.set({
      mode: mode,
      targetLanguage: targetLanguage
    });

    const button = document.getElementById('save-button');
    button.textContent = '✓ Saved!';
    button.classList.add('saved');

    setTimeout(() => {
      button.textContent = 'Save Settings';
      button.classList.remove('saved');
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});