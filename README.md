# DefineMe - Chrome Extension

A powerful Chrome extension that provides instant word definitions and translations with a simple double-click. DefineMe intelligently prioritizes translations to your target language, with English definitions as a smart fallback.

## 🚀 Features

- 🖱️ **Advanced double-click lookup** - Intelligent word detection on any website
- 🌍 **Translation-first approach** - Prioritizes accurate translation to your target language
- 📖 **Smart fallback system** - English definitions when translation isn't available
- 🎯 **15 language support** - Including Hindi, Arabic, Hebrew, Urdu, Bengali, Tamil, and more
- 🎨 **Enhanced UI** - Beautiful tooltips with close button, ESC key support, and service attribution
- ⚙️ **Flexible modes** - Auto, Define Only, or Translate Only with intelligent switching
- 🔄 **Multi-tier API system** - LibreTranslate + MyMemory + multi-source fallbacks for maximum accuracy
- 📱 **Universal compatibility** - Works on complex sites like ChatGPT, Gmail, and extension pages
- 🛡️ **Bulletproof error handling** - Never crashes, graceful degradation always
- 🎯 **Accuracy-focused** - Multiple translation attempts with quality validation

## 📥 Installation Options

### Option 1: Chrome Web Store (Recommended for General Users)
*Coming soon - Extension will be published to Chrome Web Store*

### Option 2: Developer Mode (For Developers/Advanced Users)

1. **Download/Clone** this repository
2. **Open Chrome** → Navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** → Select the DefineMe folder
5. **Extension ready!** Icon appears in browser toolbar

## 🌟 How to Use

### Basic Usage
1. **Double-click any word** on any webpage
2. **Tooltip appears** with translation/definition
3. **Close tooltip** by:
   - Clicking the × button
   - Pressing ESC key
   - Clicking outside the tooltip

### Configuration
1. **Click DefineMe icon** in toolbar
2. **Select "Open Settings"**
3. **Configure:**
   - **Mode**: Auto/Define Only/Translate Only
   - **Target Language**: Choose from 15 languages
4. **Test functionality** - Use built-in demo section with test button and interactive text

## 🧠 Intelligent Logic

**Auto Mode Priority:**
1. 🌍 **Translation to target language** (if set)
2. 📖 **English definition** (fallback)
3. 🔄 **Translation retry** (last resort)

**Examples:**
- Target = Hindi → "Hello" shows Hindi translation
- Target = English → Always English definition
- No target set → Always English definitions

## 🌐 Supported Languages

| Language | Code | Native Script |
|----------|------|---------------|
| Spanish | es | Español |
| French | fr | Français |
| German | de | Deutsch |
| Italian | it | Italiano |
| Portuguese | pt | Português |
| Russian | ru | Русский |
| Japanese | ja | 日本語 |
| Korean | ko | 한국어 |
| Chinese | zh | 中文 |
| Arabic | ar | العربية |
| Hindi | hi | हिन्दी |
| Hebrew | he | עברית |
| Urdu | ur | اردو |
| Bengali | bn | বাংলা |
| Tamil | ta | தமிழ் |

## 🔧 Technical Architecture

### Core Components
- **Manifest V3** - Latest Chrome extension standard
- **Content Script** (`content.js`) - Word detection & UI rendering
- **Service Worker** (`background.js`) - API calls & data processing
- **Shadow DOM** - Style isolation from host websites

### API Services
- **Definitions**: Dictionary API (api.dictionaryapi.dev) - Free, comprehensive English definitions
- **Primary Translation**: LibreTranslate (libretranslate.de) - Open-source, privacy-focused
- **Fallback Translation**: MyMemory API - Reliable backup with auto-detection
- **Multi-source Strategy**: Automatic fallback through multiple language pairs for accuracy

### Security & Privacy
- ✅ **No data collection** - Zero personal data harvesting
- ✅ **Local storage only** - Settings stored in Chrome sync
- ✅ **HTTPS only** - Secure API communications
- ✅ **Isolated execution** - Content scripts run in sandboxed environments

## 📁 Project Structure

```
DefineMe/
├── manifest.json          # Extension configuration (MV3)
├── content.js            # Word detection & tooltip UI
├── background.js         # API handling & service worker
├── options.html          # Settings page interface
├── options.js            # Settings page logic
├── popup.html            # Extension popup interface
└── README.md            # Documentation
```

## 🌐 Publishing to Chrome Web Store

### Preparation Steps

1. **Create Chrome Web Store Developer Account**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay one-time $5 registration fee
   - Verify your identity

2. **Prepare Extension Package**
   ```bash
   # Create distribution package
   zip -r defineme-extension.zip * -x "*.git*" "*.DS_Store*" "node_modules/*"
   ```

3. **Required Assets for Store Listing**
   - **Icon**: 128x128px PNG (high-quality)
   - **Screenshots**: 1280x800px (show extension in action)
   - **Promotional images**: 440x280px (optional but recommended)

### Store Listing Information

**Title**: "DefineMe - Word Definitions & Translations"

**Short Description** (132 chars max):
"Double-click any word for instant definitions or translations. Supports 15 languages with smart fallback system."

**Detailed Description** (16,000 chars max):
```
🚀 INSTANT WORD LOOKUP
Double-click any word on any website to get instant definitions in English or translations to your preferred language. Perfect for language learners, students, and curious readers.

✨ KEY FEATURES
• Translation-first approach with smart English fallback
• 15 language support including Hindi, Arabic, Hebrew, Urdu, Bengali, Tamil
• Beautiful tooltips with close button and keyboard shortcuts
• Three flexible modes: Auto, Define Only, Translate Only
• Works on all websites with zero conflicts
• Completely free and open-source

🎯 HOW IT WORKS
1. Set your preferred target language in settings
2. Double-click any word while browsing
3. Get instant translation or definition in a clean tooltip
4. Close with × button, ESC key, or click outside

🌍 SUPPORTED LANGUAGES
Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Hebrew, Urdu, Bengali, Tamil

🔒 PRIVACY & SECURITY
• No data collection or tracking
• Settings stored locally on your device
• Secure HTTPS API communications
• Open-source code available on GitHub

Perfect for students, language learners, researchers, and anyone who reads content in multiple languages!
```

**Categories**:
- Primary: Education
- Secondary: Productivity

### Submission Process

1. **Upload Package**
   - Go to Chrome Web Store Developer Dashboard
   - Click "Add new item"
   - Upload your ZIP file

2. **Fill Store Listing**
   - Add all required information
   - Upload screenshots and icons
   - Set pricing (Free)
   - Select target countries (Worldwide)

3. **Privacy & Permissions**
   - Justify each permission requested
   - Provide privacy policy (if collecting data)
   - Complete security questionnaire

4. **Submit for Review**
   - Review takes 1-7 days typically
   - Address any feedback from Google
   - Once approved, extension goes live

### Publishing Checklist

- [ ] Developer account created and verified
- [ ] Extension thoroughly tested across multiple websites
- [ ] All icons and screenshots prepared
- [ ] Store listing information written
- [ ] Privacy policy created (if needed)
- [ ] Extension package created and validated
- [ ] Permissions justified in listing
- [ ] Target audience and categories selected

### Post-Publication

1. **Monitor Reviews** - Respond to user feedback
2. **Track Analytics** - Use Chrome Web Store analytics
3. **Regular Updates** - Keep extension current with Chrome updates
4. **Marketing** - Share on social media, GitHub, relevant communities

### Distribution Alternatives

**Direct Distribution (Enterprise/Education)**:
- Host CRX file on your website
- Provide installation instructions
- Suitable for organizations with specific deployment needs

**GitHub Releases**:
- Tag stable versions
- Provide installation guide for developer mode
- Maintain changelog for updates

The Chrome Web Store is the recommended distribution method for maximum reach and automatic updates for users.

## 🛠️ Development & Contributing

### Local Development Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/AMANFSD/DefineMe.git
   cd DefineMe
   ```

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select project folder

3. **Make changes and test**
   - Edit source files
   - Click refresh icon in extensions page
   - Test on various websites

### Contributing Guidelines

- **Bug Reports**: Use GitHub issues with detailed reproduction steps
- **Feature Requests**: Open issues with clear use cases
- **Pull Requests**: Follow existing code style and include tests
- **Documentation**: Update README for any new features

### Adding New Languages

1. Update language dropdown in `options.html`
2. Add language mapping in `background.js` (`getLanguageName` method)
3. Verify API support for the language code
4. Test translation functionality

## 📞 Support

- **Documentation**: See this README and inline code comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Changelog

### Version 1.0.0
- ✨ **Translation-first logic** - Prioritizes target language translation over definitions
- 🌍 **15 language support** - Including Hindi, Arabic, Hebrew, Urdu, Bengali, Tamil
- 🎨 **Enhanced tooltips** - Shadow DOM isolation, close button, ESC key support
- 🔄 **Multi-tier API system** - LibreTranslate + MyMemory + multi-source fallbacks
- 🧠 **Advanced word detection** - Works on complex sites (ChatGPT, Gmail, extension pages)
- 🛡️ **Bulletproof error handling** - Extension context validation, graceful degradation
- 🎯 **Accuracy improvements** - Word cleaning, duplicate detection, capitalization
- ⚙️ **Interactive options page** - Built-in testing with demo text and test button
- 🔒 **Privacy-focused design** - No data collection, local storage only
- 📊 **Service attribution** - Shows which translation service provided results

---

**Built with ❤️ for global language learners and curious minds. Happy learning! 🌟**