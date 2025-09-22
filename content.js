class DefineMe {
  constructor() {
    this.tooltip = null;
    this.shadowRoot = null;
    this.init();
  }

  init() {
    // Add event listeners with capture to ensure we catch events early
    document.addEventListener('dblclick', this.handleDoubleClick.bind(this), true);
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('keydown', this.handleKeydown.bind(this));

    console.log('DefineMe: Extension initialized and ready');
  }

  handleDoubleClick(event) {
    try {
      console.log('DefineMe: Double-click detected on element:', event.target.tagName, event.target.className);

      // Allow some time for text selection to complete
      setTimeout(() => {
        try {
          const selectedText = this.getSelectedWord(event);
          console.log('DefineMe: Detected word:', selectedText); // Debug log

          if (selectedText && selectedText.trim().length > 0) {
            event.preventDefault();
            this.showTooltip(event, selectedText.trim());
          } else {
            console.log('DefineMe: No word detected, trying alternative method...');
            // Try alternative method for stubborn sites
            const altWord = this.getWordAlternativeMethod(event);
            if (altWord) {
              console.log('DefineMe: Alternative method found word:', altWord);
              event.preventDefault();
              this.showTooltip(event, altWord.trim());
            } else {
              console.log('DefineMe: No word detected at coordinates:', event.clientX, event.clientY);
              console.log('DefineMe: Target element text content:', event.target.textContent?.substring(0, 100));
            }
          }
        } catch (innerError) {
          console.warn('DefineMe inner double-click error:', innerError.message);
        }
      }, 10);
    } catch (error) {
      console.warn('DefineMe double-click error:', error.message);
    }
  }

  getWordAlternativeMethod(event) {
    try {
      // Method 1: Check for any selected text first
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        console.log('DefineMe: Found selection:', selectedText);
        if (selectedText.split(' ').length === 1 && selectedText.length < 30) {
          return selectedText;
        }
      }

      // Method 2: Parse the clicked element's text content
      const element = event.target;
      const text = element.textContent || element.innerText || '';
      console.log('DefineMe: Element text:', text.substring(0, 100));

      if (text) {
        // Split text into words and find the one closest to click position
        const words = text.match(/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u0250\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\']+/g);
        console.log('DefineMe: Found words in element:', words);

        if (words && words.length > 0) {
          // For demo purposes, just return the first reasonable word
          for (const word of words) {
            if (word.length >= 2 && word.length <= 30) {
              console.log('DefineMe: Returning word from alternative method:', word);
              return word;
            }
          }
        }
      }

      // Method 3: Try to use document.elementFromPoint
      const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      if (elementAtPoint && elementAtPoint !== element) {
        const altText = elementAtPoint.textContent || elementAtPoint.innerText || '';
        if (altText) {
          const words = altText.match(/[a-zA-Z]+/g);
          if (words && words.length > 0) {
            return words[0];
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('DefineMe alternative method error:', error.message);
      return null;
    }
  }

  getSelectedWord(event) {
    try {
      // Method 1: Check for existing text selection
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const selectedText = selection.toString().trim();
        if (selectedText && selectedText.length > 0 && selectedText.length < 50) {
          return selectedText;
        }
      }

      // Method 2: Use caretRangeFromPoint for precise word detection
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = range.startContainer;
        const textContent = textNode.textContent;
        const offset = range.startOffset;

        if (textContent && offset >= 0 && offset < textContent.length) {
          const word = this.extractWordAtOffset(textContent, offset);
          if (word) return word;
        }
      }

      // Method 3: Fallback - search in target element and its children
      const element = event.target;
      const word = this.findWordInElement(element, event.clientX, event.clientY);
      if (word) return word;

      // Method 4: Last resort - check parent elements
      let parent = element.parentElement;
      let attempts = 0;
      while (parent && attempts < 3) {
        const word = this.findWordInElement(parent, event.clientX, event.clientY);
        if (word) return word;
        parent = parent.parentElement;
        attempts++;
      }

      return null;
    } catch (error) {
      console.warn('DefineMe word detection error:', error.message);
      return null;
    }
  }

  extractWordAtOffset(text, offset) {
    if (!text || offset < 0 || offset >= text.length) return null;

    // More comprehensive word boundary detection
    const wordRegex = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u0250\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\'-]/;

    // Find the start of the word
    let start = offset;
    while (start > 0 && wordRegex.test(text[start - 1])) {
      start--;
    }

    // Find the end of the word
    let end = offset;
    while (end < text.length && wordRegex.test(text[end])) {
      end++;
    }

    // Extract the word
    const word = text.substring(start, end).trim();

    // Validate word (should be 1-30 characters, mostly letters)
    if (word.length >= 1 && word.length <= 30 && /[a-zA-Z]/.test(word)) {
      return word;
    }

    return null;
  }

  findWordInElement(element, x, y) {
    try {
      if (!element) return null;

      // Get all text nodes within the element
      const textNodes = this.getTextNodes(element);

      for (const textNode of textNodes) {
        const word = this.findWordInTextNode(textNode, x, y);
        if (word) return word;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip nodes with only whitespace
          if (node.textContent.trim().length === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  findWordInTextNode(textNode, x, y) {
    try {
      if (!textNode || !textNode.textContent) return null;

      const text = textNode.textContent;
      const range = document.createRange();
      range.selectNodeContents(textNode);

      // Try to find the character closest to the click point
      for (let i = 0; i < text.length; i++) {
        try {
          range.setStart(textNode, i);
          range.setEnd(textNode, i + 1);

          const rect = range.getBoundingClientRect();

          // Check if click is within reasonable distance of this character
          if (rect.width > 0 && rect.height > 0) {
            const distance = Math.sqrt(
              Math.pow(x - (rect.left + rect.width / 2), 2) +
              Math.pow(y - (rect.top + rect.height / 2), 2)
            );

            // If click is close to this character (within 50px), extract word
            if (distance < 50) {
              const word = this.extractWordAtOffset(text, i);
              if (word) return word;
            }
          }
        } catch (rangeError) {
          // Continue if range operation fails
          continue;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async showTooltip(event, word) {
    try {
      this.hideTooltip();

      this.tooltipContainer = document.createElement('div');
      this.tooltipContainer.style.cssText = `
        position: fixed;
        z-index: 999999;
        pointer-events: auto;
      `;
      this.tooltipContainer.className = 'defineme-tooltip-container';

      this.shadowRoot = this.tooltipContainer.attachShadow({ mode: 'closed' });

      this.tooltip = document.createElement('div');
      this.tooltip.style.cssText = `
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 12px;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: #333;
        position: relative;
      `;

      const safeWord = this.escapeHtml(word);
      this.tooltip.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center;">
            <strong style="margin-right: 8px;">${safeWord}</strong>
            <div style="width: 16px; height: 16px; border: 2px solid #007bff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
          <button id="close-btn" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;" title="Close">×</button>
        </div>
        <div style="color: #666;">Loading...</div>
      `;

      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #close-btn:hover {
          background: #f0f0f0;
        }
      `;

      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this.tooltip);
      document.body.appendChild(this.tooltipContainer);

      const closeBtn = this.shadowRoot.getElementById('close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.hideTooltip();
        });
      }

      const x = Math.min(event.clientX, window.innerWidth - 320);
      const y = Math.max(20, event.clientY - 80);

      this.tooltipContainer.style.left = x + 'px';
      this.tooltipContainer.style.top = y + 'px';

      try {
        const result = await this.lookupWord(word);
        this.updateTooltipContent(word, result);
      } catch (error) {
        console.warn('DefineMe lookup error:', error.message);
        this.updateTooltipContent(word, { error: 'Lookup temporarily unavailable' });
      }
    } catch (error) {
      console.warn('DefineMe tooltip error:', error.message);
      // Silently fail if tooltip creation fails
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async lookupWord(word) {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime || !chrome.runtime.sendMessage) {
          resolve({ error: 'Extension temporarily unavailable' });
          return;
        }

        chrome.runtime.sendMessage(
          { action: 'lookup', word: word },
          (response) => {
            if (chrome.runtime.lastError) {
              console.warn('Extension context error:', chrome.runtime.lastError.message);
              resolve({ error: 'Extension temporarily unavailable' });
              return;
            }
            resolve(response || { error: 'No response received' });
          }
        );
      } catch (error) {
        console.warn('Lookup error:', error.message);
        resolve({ error: 'Extension temporarily unavailable' });
      }
    });
  }

  updateTooltipContent(word, result) {
    if (!this.tooltip) return;

    const createCloseButton = () =>
      `<button id="close-btn" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;" title="Close">×</button>`;

    if (result.error) {
      this.tooltip.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <strong>${word}</strong>
          ${createCloseButton()}
        </div>
        <div style="color: #d32f2f;">${result.error}</div>
      `;
    } else if (result.definition) {
      this.tooltip.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center;">
            <strong style="color: #1976d2;">${word}</strong>
            <span style="margin-left: 8px; padding: 2px 6px; background: #e3f2fd; border-radius: 12px; font-size: 12px; color: #1976d2;">Definition</span>
          </div>
          ${createCloseButton()}
        </div>
        <div>${result.definition}</div>
        ${result.phonetic ? `<div style="color: #666; font-style: italic; margin-top: 4px;">${result.phonetic}</div>` : ''}
      `;
    } else if (result.translation) {
      this.tooltip.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center;">
            <strong style="color: #388e3c;">${word}</strong>
            <span style="margin-left: 8px; padding: 2px 6px; background: #e8f5e8; border-radius: 12px; font-size: 12px; color: #388e3c;">Translation</span>
          </div>
          ${createCloseButton()}
        </div>
        <div>${result.translation}</div>
        <div style="color: #666; font-size: 12px; margin-top: 4px;">
          ${result.detectedLang ? `From: ${result.detectedLang}` : ''}
          ${result.service ? ` • ${result.service}` : ''}
        </div>
      `;
    }

    const closeBtn = this.shadowRoot.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideTooltip();
      });
    }
  }

  handleClick(event) {
    try {
      if (!this.tooltipContainer) return;

      if (!this.tooltipContainer.contains(event.target)) {
        this.hideTooltip();
      }
    } catch (error) {
      console.warn('DefineMe click error:', error.message);
    }
  }

  handleKeydown(event) {
    try {
      if (event.key === 'Escape' && this.tooltipContainer) {
        this.hideTooltip();
      }
    } catch (error) {
      console.warn('DefineMe keydown error:', error.message);
    }
  }

  hideTooltip() {
    try {
      if (this.tooltipContainer) {
        this.tooltipContainer.remove();
        this.tooltip = null;
        this.shadowRoot = null;
        this.tooltipContainer = null;
      }
    } catch (error) {
      console.warn('DefineMe hide tooltip error:', error.message);
      // Force cleanup even if removal fails
      this.tooltip = null;
      this.shadowRoot = null;
      this.tooltipContainer = null;
    }
  }
}

// Only initialize if extension context is valid
try {
  if (chrome && chrome.runtime && chrome.runtime.id) {
    new DefineMe();
  }
} catch (error) {
  console.warn('DefineMe: Extension context not available');
}