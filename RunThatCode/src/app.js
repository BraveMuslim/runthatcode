class CodeEditor {
    constructor() {
        this.currentTab = 'html';
        this.editors = {
            html: document.getElementById('html-editor'),
            css: document.getElementById('css-editor'),
            js: document.getElementById('js-editor')
        };
        this.previewFrame = document.getElementById('preview-frame');
        this.demoFrame = document.getElementById('demo-frame');
        this.errorContainer = document.getElementById('error-container');
        this.errorMessage = document.getElementById('error-message');
        this.hasErrors = false;
        
        this.init();
        this.loadFromStorage();
        this.showDemoPreview();
    }

    init() {
        this.setupTabSwitching();
        this.setupControls();
        this.setupAutoSave();
        this.setupPreviewControls();
        this.setupKeyboardShortcuts();
        this.setupMobileOptimizations();
        this.setupCodeValidation();
        this.setupDemoPreview();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-button').dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.code-editor').forEach(editor => {
            editor.classList.remove('active');
        });
        this.editors[tabName].classList.add('active');
        
        this.currentTab = tabName;
        
        setTimeout(() => {
            if (this.isMobile()) {
                this.editors[tabName].focus();
                this.editors[tabName].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                this.editors[tabName].focus();
            }
        }, 100);
    }

    setupControls() {
        const runButton = document.getElementById('run-btn');
        const clearButton = document.getElementById('clear-btn');
        
        runButton.addEventListener('click', () => this.runCode());
        clearButton.addEventListener('click', () => this.clearCode());
    }

    setupAutoSave() {
        setInterval(() => {
            this.saveToStorage();
        }, 2000);
        
        Object.values(this.editors).forEach(editor => {
            editor.addEventListener('input', () => {
                this.debounce(() => this.saveToStorage(), 1000);
            });
        });
    }

    setupPreviewControls() {
        const refreshButton = document.getElementById('refresh-btn');
        const fullscreenButton = document.getElementById('fullscreen-btn');
        
        refreshButton.addEventListener('click', () => this.runCode());
        fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveToStorage();
                this.showNotification('Code saved!', 'success');
            }
            
            if ((e.ctrlKey || e.metaKey) && ['1', '2', '3'].includes(e.key)) {
                e.preventDefault();
                const tabs = ['html', 'css', 'js'];
                this.switchTab(tabs[parseInt(e.key) - 1]);
            }
        });
    }

    setupMobileOptimizations() {
        if (this.isMobile()) {
            Object.values(this.editors).forEach(editor => {
                editor.addEventListener('focus', () => {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                    }
                });

                editor.addEventListener('blur', () => {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    }
                });

                editor.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = editor.selectionStart;
                        const end = editor.selectionEnd;
                        
                        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
                        editor.selectionStart = editor.selectionEnd = start + 4;
                    }
                });
            });

            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.adjustMobileLayout();
                }, 500);
            });

            window.addEventListener('resize', () => {
                this.handleVirtualKeyboard();
            });
        }
    }

    setupCodeValidation() {
        Object.entries(this.editors).forEach(([type, editor]) => {
            editor.addEventListener('input', () => {
                this.debounce(() => this.validateCode(type), 1500);
            });
        });
    }

    setupDemoPreview() {
        const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RunThatCode Demo</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 500px;
        }
        h1 {
            color: white;
            font-size: 2.5rem;
            margin-bottom: 20px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.2rem;
            margin-bottom: 30px;
        }
        .demo-link {
            color: #9333ea;
            text-decoration: none;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.9);
            padding: 12px 24px;
            border-radius: 25px;
            display: inline-block;
            margin: 10px;
            transition: all 0.3s ease;
        }
        .demo-link:hover {
            background: white;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        button {
            background: rgba(147, 51, 234, 0.8);
            border: none;
            color: white;
            padding: 15px 30px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(147, 51, 234, 0.5);
            margin: 10px;
        }
        button:hover {
            background: rgba(147, 51, 234, 1);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(147, 51, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Live Preview</h1>
        <p>Start coding and see your results instantly</p>
        <div>
        </div>
        <button onclick="window.open('https://www.hasanjanahi.com', '_blank')">Built by hasanjanahi</button>
    </div>
    <script>
    </script>
</body>
</html>`;
        
        const blob = new Blob([demoHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        this.demoFrame.src = url;
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    showDemoPreview() {
        this.previewFrame.style.display = 'none';
        this.demoFrame.style.display = 'block';
    }

    showCodePreview() {
        this.previewFrame.style.display = 'block';
        this.demoFrame.style.display = 'none';
    }

    validateCode(type) {
        const code = this.editors[type].value.trim();
        if (!code) {
            this.updateTabErrorIndicator(type, false);
            return;
        }

        switch (type) {
            case 'html':
                this.validateHTML(code);
                break;
            case 'css':
                this.validateCSS(code);
                break;
            case 'js':
                this.validateJavaScript(code);
                break;
        }
    }

    validateHTML(html) {
        const errors = [];
        
        if (html.includes('<!DOCTYPE html>') || html.includes('<html>')) {
            if (!html.includes('</html>') && html.includes('<html>')) {
                errors.push('Missing closing </html> tag');
            }
            if (!html.includes('</head>') && html.includes('<head>')) {
                errors.push('Missing closing </head> tag');
            }
            if (!html.includes('</body>') && html.includes('<body>')) {
                errors.push('Missing closing </body> tag');
            }
        }

        const openTags = html.match(/<[^/][^>]*>/g) || [];
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        
        openTags.forEach(tag => {
            const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
            if (tagName && !selfClosingTags.includes(tagName) && !tag.endsWith('/>')) {
                const closeTag = `</${tagName}>`;
                if (!html.includes(closeTag)) {
                    errors.push(`Missing closing tag for <${tagName}>`);
                }
            }
        });

        if (html.includes('class=""') || html.includes("class=''")) {
            errors.push('Empty class attribute found');
        }
        if (html.includes('id=""') || html.includes("id=''")) {
            errors.push('Empty id attribute found');
        }

        const idMatches = html.match(/id=["']([^"']+)["']/g);
        if (idMatches) {
            const ids = idMatches.map(match => match.match(/id=["']([^"']+)["']/)[1]);
            const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
            if (duplicateIds.length > 0) {
                errors.push(`Duplicate ID(s) found: ${[...new Set(duplicateIds)].join(', ')}`);
            }
        }

        if (errors.length > 0) {
            this.showCodeError('HTML', errors);
            this.updateTabErrorIndicator('html', true);
        } else {
            this.updateTabErrorIndicator('html', false);
        }
    }

    validateCSS(css) {
        const errors = [];
        
        if (!css || css.trim() === '') {
            this.updateTabErrorIndicator('css', false);
            return;
        }
        
        const openBraces = (css.match(/{/g) || []).length;
        const closeBraces = (css.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
        }

        const rules = css.split('}').filter(rule => rule.trim() && rule.includes('{'));
        rules.forEach((rule) => {
            const parts = rule.split('{');
            if (parts.length < 2) return;
            
            const declarations = parts[1];
            if (declarations) {
                const cleanDeclarations = declarations.replace(/\/\*[\s\S]*?\*\//g, '');
                const lines = cleanDeclarations.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('/*') && !line.startsWith('*') && !line.endsWith('*/'));
                
                lines.forEach(line => {
                    if (line.includes(':') && !line.endsWith(';') && !line.endsWith('{') && line.split(':').length === 2) {
                        errors.push(`Missing semicolon in declaration: "${line}"`);
                    }
                });
            }
        });

        if (errors.length > 0) {
            this.showCodeError('CSS', errors);
            this.updateTabErrorIndicator('css', true);
        } else {
            this.updateTabErrorIndicator('css', false);
        }
    }

    validateJavaScript(js) {
        const errors = [];
        
        if (!js || js.trim() === '') {
            this.updateTabErrorIndicator('js', false);
            return;
        }
        
        try {
            new Function(js);
        } catch (error) {
            errors.push(`Syntax Error: ${error.message}`);
        }

        const openParens = (js.match(/\(/g) || []).length;
        const closeParens = (js.match(/\)/g) || []).length;
        const openBrackets = (js.match(/\[/g) || []).length;
        const closeBrackets = (js.match(/\]/g) || []).length;
        const openBraces = (js.match(/{/g) || []).length;
        const closeBraces = (js.match(/}/g) || []).length;

        if (openParens !== closeParens) {
            errors.push(`Mismatched parentheses: ${openParens} opening, ${closeParens} closing`);
        }
        if (openBrackets !== closeBrackets) {
            errors.push(`Mismatched brackets: ${openBrackets} opening, ${closeBrackets} closing`);
        }
        if (openBraces !== closeBraces) {
            errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
        }

        if (errors.length > 0) {
            this.showCodeError('JavaScript', errors);
            this.updateTabErrorIndicator('js', true);
        } else {
            this.updateTabErrorIndicator('js', false);
        }
    }

    showCodeError(type, errors) {
        const errorTitle = `${type} Issues Detected`;
        const errorList = errors.slice(0, 5).map(error => `• ${error}`).join('\n');
        const additionalErrors = errors.length > 5 ? `\n... and ${errors.length - 5} more issues` : '';
        
        this.showNotification(
            `${errorTitle}\n${errorList}${additionalErrors}`, 
            'warning',
            8000
        );
    }

    updateTabErrorIndicator(tabType, hasError) {
        const tabButton = document.querySelector(`[data-tab="${tabType}"]`);
        if (tabButton) {
            if (hasError) {
                tabButton.classList.add('has-error');
            } else {
                tabButton.classList.remove('has-error');
            }
        }
        
        this.updateGlobalErrorState();
    }

    updateGlobalErrorState() {
        const hasAnyErrors = document.querySelectorAll('.tab-button.has-error').length > 0;
        this.hasErrors = hasAnyErrors;
    }

    clearErrorIndicators() {
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('has-error');
        });
        this.hasErrors = false;
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }

    adjustMobileLayout() {
        if (this.isMobile()) {
            const editorSection = document.querySelector('.editor-section');
            const previewSection = document.querySelector('.preview-section');
            
            if (editorSection && previewSection) {
                const viewportHeight = window.innerHeight;
                const headerHeight = document.querySelector('.app-header').offsetHeight;
                const footerHeight = document.querySelector('.app-footer').offsetHeight;
                const availableHeight = viewportHeight - headerHeight - footerHeight - 40;
                
                editorSection.style.minHeight = `${availableHeight * 0.6}px`;
                previewSection.style.minHeight = `${availableHeight * 0.4}px`;
            }
        }
    }

    handleVirtualKeyboard() {
        if (this.isMobile()) {
            const activeEditor = document.querySelector('.code-editor.active');
            if (activeEditor && document.activeElement === activeEditor) {
                setTimeout(() => {
                    activeEditor.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
    }

    runCode() {
        const htmlCode = this.editors.html.value;
        const cssCode = this.editors.css.value;
        const jsCode = this.editors.js.value;
        
        // Check if all editors are empty
        const isEmpty = !htmlCode.trim() && !cssCode.trim() && !jsCode.trim();
        
        if (isEmpty) {
            this.showDemoPreview();
            this.showNotification('Write some code to see the preview! ✨', 'info');
            return;
        }
        
        this.showCodePreview();
        
        this.hideError();
        this.clearErrorIndicators();
        
        this.validateCode('html');
        this.validateCode('css');
        this.validateCode('js');
        
        const fullHTML = this.createFullHTML(htmlCode, cssCode, jsCode);
        
        this.updatePreview(fullHTML);
        
        const runButton = document.getElementById('run-btn');
        runButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            runButton.style.transform = 'scale(1)';
        }, 150);

        setTimeout(() => {
            if (!this.hasErrors) {
                this.showNotification('Code executed successfully! 🚀', 'success');
            }
        }, 100);
    }

    createFullHTML(html, css, js) {
        let bodyContent = html;
        let headContent = '';
        
        if (html.includes('<!DOCTYPE html>') || html.includes('<html>')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            bodyContent = doc.body ? doc.body.innerHTML : html;
            
            const head = doc.head;
            if (head) {
                const headElements = Array.from(head.children).filter(el => 
                    !el.matches('meta[charset]') && 
                    !el.matches('meta[name="viewport"]') &&
                    !el.matches('title')
                );
                headContent = headElements.map(el => el.outerHTML).join('\n');
            }
        }
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        ${css}
    </style>
    ${headContent}
</head>
<body>
    ${bodyContent}
    <script>
        window.addEventListener('error', function(e) {
            parent.postMessage({
                type: 'error',
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            }, '*');
        });
        
        // Enable link navigation in preview
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                window.open(e.target.href, '_blank');
            }
        });
        
        try {
            ${js}
        } catch (error) {
            parent.postMessage({
                type: 'error',
                message: error.message,
                stack: error.stack
            }, '*');
        }
    </script>
</body>
</html>`;
    }

    updatePreview(html) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        this.previewFrame.src = url;
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        this.previewFrame.onload = () => {
            try {
                this.previewFrame.contentWindow.focus();
            } catch (error) {
                // Ignore cross-origin errors
            }
        };
    }

    showError(message, details = '') {
        this.errorMessage.textContent = details || message;
        this.errorContainer.classList.add('show');
        
        setTimeout(() => {
            this.hideError();
        }, 10000);
    }

    hideError() {
        this.errorContainer.classList.remove('show');
    }

    saveToStorage() {
        const code = {
            html: this.editors.html.value,
            css: this.editors.css.value,
            js: this.editors.js.value
        };
        
        try {
            localStorage.setItem('runthatcode-editor', JSON.stringify(code));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('runthatcode-editor');
            if (saved) {
                const code = JSON.parse(saved);
                
                if (code.html && code.html.trim() !== '' && 
                    (this.editors.html.value === this.editors.html.defaultValue || 
                     this.editors.html.value.trim() === '')) {
                    this.editors.html.value = code.html;
                }
                
                if (code.css && code.css.trim() !== '' && 
                    (this.editors.css.value === this.editors.css.defaultValue || 
                     this.editors.css.value.trim() === '')) {
                    this.editors.css.value = code.css;
                }
                
                if (code.js && code.js.trim() !== '' && 
                    (this.editors.js.value === this.editors.js.defaultValue || 
                     this.editors.js.value.trim() === '')) {
                    this.editors.js.value = code.js;
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }

    toggleFullscreen() {
        const previewSection = document.querySelector('.preview-section');
        
        if (!document.fullscreenElement) {
            previewSection.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.whiteSpace = 'pre-line';
        notification.textContent = message;
        
        const baseStyles = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 1000;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInFromRight 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        let typeStyles = '';
        switch (type) {
            case 'success':
                typeStyles = `
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9));
                    color: white;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                `;
                break;
            case 'warning':
                typeStyles = `
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
                    color: white;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                `;
                break;
            case 'error':
                typeStyles = `
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
                    color: white;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                `;
                break;
            default:
                typeStyles = `
                    background: linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(124, 58, 237, 0.9));
                    color: white;
                    border: 1px solid rgba(147, 51, 234, 0.3);
                `;
        }
        
        notification.style.cssText = baseStyles + typeStyles;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    debounce(func, delay) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, delay);
    }

    clearCode() {
        this.editors.html.value = '';
        this.editors.css.value = '';
        this.editors.js.value = '';
        this.showDemoPreview();
        this.clearErrorIndicators();
        this.hideError();
        this.showNotification('Code cleared! ✨', 'info');
        this.saveToStorage();
    }
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'error') {
        const error = event.data;
        const errorText = error.stack || `${error.message}\nAt line ${error.lineno || 'unknown'}`;
        codeEditor.showError(error.message, errorText);
        codeEditor.showNotification(`Runtime Error: ${error.message}`, 'error', 5000);
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutToRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .tab-button.has-error {
        position: relative;
        border: 1px solid rgba(239, 68, 68, 0.5) !important;
        background: rgba(239, 68, 68, 0.1) !important;
    }
    
    .tab-button.has-error::after {
        content: '⚠️';
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 0.8rem;
        background: rgba(239, 68, 68, 0.9);
        border-radius: 50%;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @media (max-width: 768px) {
        .notification {
            top: 10px !important;
            right: 10px !important;
            left: 10px !important;
            font-size: 0.85rem !important;
            padding: 12px 16px !important;
            max-width: none !important;
        }
    }
`;
document.head.appendChild(style);

let codeEditor;
document.addEventListener('DOMContentLoaded', () => {
    codeEditor = new CodeEditor();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && codeEditor && codeEditor.isMobile()) {
        setTimeout(() => {
            codeEditor.adjustMobileLayout();
        }, 100);
    }
});