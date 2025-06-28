const chatModal = document.getElementById('chatModal');
const chatToggle = document.getElementById('chatToggle');
const openChatBtn = document.getElementById('openChatBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = mobileMenu.querySelectorAll('a');

// --- AI API Configuration ---
const API_KEY = "sk-default-eOs3LRtMdNOATD3kmyEDf2YxgxUuEMLz";
const AGENT_ID = "685b7d86c7b1c8e387936db1";
const API_ENDPOINT = `https://agent-prod.studio.lyzr.ai/v3/inference/chat/`;

// --- Chat Modal Functionality ---
// Open chat modal
openChatBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    chatModal.style.display = 'flex';
    chatInput.focus();
    // Close mobile menu if open when chat is opened
    mobileMenu.classList.remove('active');
});

// Close chat modal
closeChatBtn.addEventListener('click', () => {
    chatModal.style.display = 'none';
});

// Toggle chat modal visibility
chatToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    if (chatModal.style.display === 'flex') {
        chatModal.style.display = 'none';
    } else {
        chatModal.style.display = 'flex';
        chatInput.focus();
        // Close mobile menu if open when chat is opened
        mobileMenu.classList.remove('active');
    }
});

// Send message
sendMessageBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Async function to send message to AI and handle response
async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        appendMessage(userMessage, 'user-message');
        chatInput.value = '';
        appendTypingIndicator();

        // Generate a session ID if it doesn't exist for this chat session
        // This ensures conversation context is maintained within the current session.
        let currentSessionId = chatBody.dataset.sessionId;
        if (!currentSessionId) {
            // A simple unique ID based on agent_id and a random string
            currentSessionId = AGENT_ID + '-' + Math.random().toString(36).substring(2, 15);
            chatBody.dataset.sessionId = currentSessionId; // Store it on the chat body element
        }

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': `${API_KEY}` // Use x-api-key as per new curl
                },
                body: JSON.stringify({
                    user_id: "anonymous_user@example.com", // Placeholder user ID
                    agent_id: AGENT_ID,
                    session_id: currentSessionId, // Use the generated session ID for context
                    message: userMessage // Send the user's message
                })
            });

            if (!response.ok) {
                // Try to parse error message from response if available
                const errorData = await response.json().catch(() => ({})); // Catch JSON parsing errors
                const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            let botResponse = "I apologize, but I couldn't get a response from the assistant at this time. Please try again later.";

            // The response structure might also change with the new API.
            // Assuming 'response' key for the bot's reply based on common API patterns or 'answer'
            if (data && data.response) {
                botResponse = data.response;
            } else if (data && data.answer) {
                botResponse = data.answer;
            } else {
                console.warn("API response format unexpected:", data);
            }

            removeTypingIndicator();
            appendMessage(botResponse, 'bot-message');

        } catch (error) {
            console.error("Error communicating with AI API:", error);
            removeTypingIndicator();
            appendMessage(`Oops! There was an error getting a response: ${error.message || 'Please try again.'}`, 'bot-message');
        }
    }
}

function appendMessage(message, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${className} mt-5`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
}

function appendTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
    chatBody.appendChild(typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
}

function removeTypingIndicator() {
    const typingIndicator = chatBody.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Close chat modal when clicking outside (on desktop)
window.addEventListener('click', (event) => {
    // Only close if on a large screen and click is outside the modal and toggle button
    // and the modal is currently open
    if (window.innerWidth >= 1024 && !chatModal.contains(event.target) && !chatToggle.contains(event.target) && !openChatBtn.contains(event.target) && chatModal.style.display === 'flex') {
        chatModal.style.display = 'none';
    }
});

// Close chat modal with Escape key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        chatModal.style.display = 'none';
    }
});

// Initialize chat modal visibility
chatModal.style.display = 'none'; // Start with chat modal hidden
chatToggle.classList.add('pulse'); // Add pulse effect to chat toggle button

// --- Mobile Menu Functionality ---
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    // Close chat modal if open when menu is opened
    chatModal.style.display = 'none';

    // Toggle icon between hamburger and close
    const icon = mobileMenuButton.querySelector('i');
    if (mobileMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when a link is clicked (for smoother navigation)
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        // Also reset the icon when a link is clicked and menu closes
        const icon = mobileMenuButton.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Close mobile menu if clicked outside of it
document.addEventListener('click', (event) => {
    if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target) && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        // Reset the icon when clicking outside to close the menu
        const icon = mobileMenuButton.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});
