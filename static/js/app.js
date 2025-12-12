// Chat application JavaScript
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const providerSelect = document.getElementById('providerSelect');
const modelSelect = document.getElementById('modelSelect');
const memoriToggle = document.getElementById('memoriToggle');

// Simple preset lists; tweak as desired in UI
const modelOptions = {
    openai: [
        { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
        { value: 'gpt-4o', label: 'gpt-4o' },
        { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
        { value: 'gpt-4-turbo', label: 'gpt-4-turbo' },
        { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
    ],
    gemini: [
        { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
        { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite' },
        { value: 'gemma-3-12b-it', label: 'gemma-3-12b-it' },
    ],
};

function syncModelOptions() {
    const provider = providerSelect.value;
    const options = modelOptions[provider] || [];
    modelSelect.innerHTML = '';
    options.forEach((opt) => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        modelSelect.appendChild(optionEl);
    });
}

providerSelect.addEventListener('change', syncModelOptions);
syncModelOptions();

// Remove welcome message when user starts chatting
let welcomeRemoved = false;

function removeWelcomeMessage() {
    if (!welcomeRemoved) {
        const welcome = document.querySelector('.welcome-message');
        if (welcome) {
            welcome.remove();
            welcomeRemoved = true;
        }
    }
}

function addMessage(content, isUser, useMemori = true, provider = 'openai', model = '') {
    removeWelcomeMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    
    const label = document.createElement('div');
    label.className = 'message-label';
    if (isUser) {
        label.textContent = 'You';
    } else {
        const memoriStatus = useMemori ? '🧠 With Memori' : '⚡ Without Memori';
        const providerName = provider === 'gemini' ? 'Gemini' : 'OpenAI';
        const modelText = model ? ` / ${model}` : '';
        label.textContent = `AI (${providerName}${modelText} - ${memoriStatus})`;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
    removeWelcomeMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.id = 'loading-message';
    
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = 'AI';
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    
    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'loading-dots';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'loading-dot';
        dotsDiv.appendChild(dot);
    }
    
    loadingDiv.appendChild(dotsDiv);
    messageDiv.appendChild(label);
    messageDiv.appendChild(loadingDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoadingMessage() {
    const loading = document.getElementById('loading-message');
    if (loading) {
        loading.remove();
    }
}

async function sendMessage(message) {
    if (!message.trim()) return;
    
    // Get current settings
    const useMemori = memoriToggle.checked;
    const provider = providerSelect.value;
    const model = modelSelect.value;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    messageInput.value = '';
    
    // Disable input while processing
    messageInput.disabled = true;
    sendBtn.disabled = true;
    providerSelect.disabled = true;
    modelSelect.disabled = true;
    memoriToggle.disabled = true;
    
    // Show loading
    addLoadingMessage();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                use_memori: useMemori,
                provider: provider,
                model: model,
            }),
        });
        
        const data = await response.json();
        
        removeLoadingMessage();
        
        if (response.ok) {
            addMessage(data.response, false, data.use_memori, data.provider, data.model);
        } else {
            addMessage(`Error: ${data.error || 'Something went wrong'}`, false, useMemori, provider, model);
        }
    } catch (error) {
        removeLoadingMessage();
        addMessage(`Error: ${error.message}`, false, useMemori, provider, model);
    } finally {
        // Re-enable input
        messageInput.disabled = false;
        sendBtn.disabled = false;
        providerSelect.disabled = false;
        modelSelect.disabled = false;
        memoriToggle.disabled = false;
        messageInput.focus();
    }
}

// Form submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        sendMessage(message);
    }
});

// Reset session
resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset your session? This will clear all memories for this conversation.')) {
        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
            });
            
            if (response.ok) {
                // Clear chat messages
                chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <p>👋 Welcome! Compare AI with and without Memori.</p>
                        <p class="example">Try this:</p>
                        <ol style="text-align: left; display: inline-block; color: var(--text-secondary);">
                            <li>With Memori ON: Tell me "My name is Alex"</li>
                            <li>Then ask "What's my name?" - I'll remember!</li>
                            <li>Toggle Memori OFF and ask again - I won't remember</li>
                        </ol>
                    </div>
                `;
                welcomeRemoved = false;
            }
        } catch (error) {
            alert(`Error resetting session: ${error.message}`);
        }
    }
});

// Update toggle text based on state
function updateToggleText() {
    const toggleText = document.querySelector('.toggle-text');
    if (toggleText) {
        toggleText.textContent = memoriToggle.checked ? 'With Memori' : 'Without Memori';
    }
}

memoriToggle.addEventListener('change', updateToggleText);
updateToggleText();

// Focus input on load
messageInput.focus();
