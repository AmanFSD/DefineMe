class DefineService {
  constructor() {
    this.setupMessageListener();
    this.initializeSettings();
  }

  async initializeSettings() {
    const settings = await chrome.storage.sync.get({
      mode: 'auto',
      targetLanguage: 'es'
    });

    if (!settings.mode || !settings.targetLanguage) {
      await chrome.storage.sync.set({
        mode: 'auto',
        targetLanguage: 'es'
      });
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'lookup') {
        this.handleLookup(request.word).then(sendResponse);
        return true;
      }
    });
  }

  async handleLookup(word) {
    try {
      // Clean and validate the word
      const cleanWord = this.cleanWord(word);
      if (!cleanWord) {
        return { error: 'Invalid word provided' };
      }

      const settings = await chrome.storage.sync.get({
        mode: 'auto',
        targetLanguage: 'es'
      });

      console.log(`Processing "${cleanWord}" in ${settings.mode} mode, target: ${settings.targetLanguage}`);

      if (settings.mode === 'define') {
        return await this.getDefinition(cleanWord);
      } else if (settings.mode === 'translate') {
        return await this.getTranslation(cleanWord, settings.targetLanguage);
      } else {
        return await this.autoLookup(cleanWord, settings.targetLanguage);
      }
    } catch (error) {
      console.error('Lookup error:', error);
      return { error: 'Failed to lookup word' };
    }
  }

  cleanWord(word) {
    if (!word || typeof word !== 'string') return null;

    // Remove extra whitespace and special characters
    let cleaned = word.trim()
      .replace(/["""'']/g, '') // Remove smart quotes
      .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u0250\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\'-]/g, ''); // Keep only word characters and international chars

    // Validate length and content
    if (cleaned.length < 1 || cleaned.length > 50) return null;
    if (!/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u0250\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/.test(cleaned)) return null;

    return cleaned;
  }

  async autoLookup(word, targetLanguage) {
    // Priority 1: Try translation to target language (if target language is set and not English)
    if (targetLanguage && targetLanguage !== 'en') {
      const translation = await this.getTranslation(word, targetLanguage);
      if (translation && !translation.error) {
        return translation;
      }
      console.log(`Translation to ${targetLanguage} failed for "${word}", falling back to English definition`);
    }

    // Priority 2: Fall back to English definition
    const definition = await this.getDefinition(word);
    if (definition && !definition.error) {
      return definition;
    }

    // Priority 3: If definition also fails, try translation again (last resort)
    if (targetLanguage && targetLanguage !== 'en') {
      console.log(`Definition failed for "${word}", trying translation as last resort`);
      return await this.getTranslation(word, targetLanguage);
    }

    // If everything fails
    return { error: 'Unable to lookup word' };
  }

  isEnglishWord(word) {
    return /^[a-zA-Z\-']+$/.test(word);
  }

  async getDefinition(word) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

      if (!response.ok) {
        throw new Error('Definition not found');
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const meaning = entry.meanings?.[0];
        const definition = meaning?.definitions?.[0];

        if (definition) {
          return {
            definition: definition.definition,
            phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
            partOfSpeech: meaning.partOfSpeech
          };
        }
      }

      throw new Error('No definition found');
    } catch (error) {
      console.error('Definition error:', error);
      return { error: 'Definition not found' };
    }
  }

  async getTranslation(word, targetLanguage) {
    console.log(`Translating "${word}" to ${targetLanguage}`);

    // First try LibreTranslate with better parameters
    try {
      const translateResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: word.toLowerCase().trim(),
          source: 'auto',
          target: targetLanguage,
          format: 'text'
        })
      });

      if (translateResponse.ok) {
        const responseText = await translateResponse.text();

        try {
          const translateData = JSON.parse(responseText);

          if (translateData.translatedText && !translateData.error &&
              translateData.translatedText.toLowerCase() !== word.toLowerCase()) {
            return {
              translation: this.capitalizeFirst(translateData.translatedText),
              detectedLang: 'Auto-detected',
              targetLang: this.getLanguageName(targetLanguage),
              service: 'LibreTranslate'
            };
          }
        } catch (parseError) {
          console.warn('LibreTranslate parse error, trying fallback');
        }
      }
    } catch (error) {
      console.warn('LibreTranslate failed, trying fallback:', error.message);
    }

    // Fallback 1: MyMemory API with auto-detection
    try {
      const autoResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=auto|${targetLanguage}`
      );

      if (autoResponse.ok) {
        const autoData = await autoResponse.json();

        if (autoData.responseStatus === 200 && autoData.responseData?.translatedText &&
            autoData.responseData.translatedText.toLowerCase() !== word.toLowerCase()) {
          return {
            translation: this.capitalizeFirst(autoData.responseData.translatedText),
            detectedLang: 'Auto-detected',
            targetLang: this.getLanguageName(targetLanguage),
            service: 'MyMemory'
          };
        }
      }
    } catch (autoError) {
      console.warn('MyMemory auto translation failed:', autoError.message);
    }

    // Fallback 2: MyMemory API assuming English source
    try {
      const enResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${targetLanguage}`
      );

      if (enResponse.ok) {
        const enData = await enResponse.json();

        if (enData.responseStatus === 200 && enData.responseData?.translatedText &&
            enData.responseData.translatedText.toLowerCase() !== word.toLowerCase()) {
          return {
            translation: this.capitalizeFirst(enData.responseData.translatedText),
            detectedLang: 'English',
            targetLang: this.getLanguageName(targetLanguage),
            service: 'MyMemory'
          };
        }
      }
    } catch (enError) {
      console.warn('MyMemory EN translation failed:', enError.message);
    }

    // Fallback 3: Try a few other common source languages
    const commonSources = ['es', 'fr', 'de', 'it', 'pt'];
    for (const sourceLang of commonSources) {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${sourceLang}|${targetLanguage}`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.responseStatus === 200 && data.responseData?.translatedText &&
              data.responseData.translatedText.toLowerCase() !== word.toLowerCase()) {
            return {
              translation: this.capitalizeFirst(data.responseData.translatedText),
              detectedLang: this.getLanguageName(sourceLang),
              targetLang: this.getLanguageName(targetLanguage),
              service: 'MyMemory'
            };
          }
        }
      } catch (sourceError) {
        // Continue to next source language
        continue;
      }
    }

    // If all services fail, return a helpful error
    return {
      error: `No accurate translation found for "${word}" to ${this.getLanguageName(targetLanguage)}`
    };
  }

  capitalizeFirst(text) {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  getLanguageName(code) {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'he': 'Hebrew',
      'ur': 'Urdu',
      'bn': 'Bengali',
      'ta': 'Tamil'
    };

    return languages[code] || code.toUpperCase();
  }
}

new DefineService();