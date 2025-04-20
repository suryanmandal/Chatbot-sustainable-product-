// Toggle Chatbot
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeChatbot = document.querySelector(".close-chatbot");
const chatbotContainer = document.querySelector(".chatbot-container");
const tryNowButton = document.getElementById("try-now-button");

if (chatbotToggler && closeChatbot && chatbotContainer) {
  chatbotToggler.addEventListener("click", () => {
    chatbotContainer.classList.toggle("active");
  });

  closeChatbot.addEventListener("click", () => {
    chatbotContainer.classList.remove("active");
  });
}

// Try Now Button Click Handler
if (tryNowButton) {
  tryNowButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (chatbotContainer) {
      chatbotContainer.classList.add("active");
      // Focus on input field after opening
      setTimeout(() => {
        const inputField = document.querySelector(".chatbot-input");
        if (inputField) inputField.focus();
      }, 300);
    }
  });
}

// Full Chatbot Button Click Handler
const fullChatbotButton = document.getElementById("full-chatbot-button");
if (fullChatbotButton) {
  fullChatbotButton.addEventListener("click", (e) => {
    // No need to prevent default as we want the link to navigate
    console.log("Navigating to full sustainable product finder experience");
  });
}

// Chatbot Interaction
const inputField = document.querySelector(".chatbot-input");
const sendButton = document.querySelector("#send-button");
const chatMessages = document.querySelector(".chatbot-messages");

// Check if we're on the full chatbot page
const isFullChatbotPage = document.querySelector(".chatbot-fullpage") !== null;

// Initialize chat if elements exist
if (inputField && sendButton && chatMessages) {
  // If we're on the full chatbot page, we might want to focus the input field
  if (isFullChatbotPage) {
    inputField.focus();
  }

  // Add event listeners for sending messages
  sendButton.addEventListener("click", sendMessage);

  // Allow pressing Enter to send message
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

// Add suggested questions for sustainable products
function addSuggestedQuestions() {
  const suggestionsDiv = document.createElement("div");
  suggestionsDiv.classList.add("suggested-questions");
  suggestionsDiv.innerHTML = `
    <p class="suggestions-title">Try asking about:</p>
    <div class="suggestion-chips">
      <button class="suggestion-chip">Eco-friendly cleaning products</button>
      <button class="suggestion-chip">Sustainable fashion brands</button>
      <button class="suggestion-chip">Zero waste alternatives</button>
    </div>
  `;
  
  chatMessages.appendChild(suggestionsDiv);
  
  // Add event listeners to suggestion chips
  const chips = document.querySelectorAll(".suggestion-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      inputField.value = chip.textContent;
      inputField.focus();
    });
  });
}

// Add suggested questions after the welcome message
if (chatMessages) {
  setTimeout(addSuggestedQuestions, 1000);
}

function addUserMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("user-message");
  messageDiv.innerHTML = `<p>${message}</p>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add Markdown parser function
function parseMarkdown(text) {
  // Replace bold text
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Replace italic text
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Replace headers
  text = text.replace(/#{1,6}\s+(.*?)(?:\n|$)/g, "<h3>$1</h3>");

  // Replace lists
  text = text.replace(/^\s*\*\s+(.*?)$/gm, "<li>$1</li>");
  text = text.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Replace paragraphs
  text = text.replace(/\n\n/g, "</p><p>");

  // Wrap in paragraph tags if not already wrapped
  if (!text.startsWith("<p>")) {
    text = "<p>" + text;
  }
  if (!text.endsWith("</p>")) {
    text = text + "</p>";
  }

  return text;
}

// Add text-to-speech functionality
let speechSynthesis = window.speechSynthesis;
let speaking = false;
let ttsEnabled = true; // Default to enabled

function speakText(text) {
  // Only speak if TTS is enabled
  if (!ttsEnabled) return;

  // Stop any ongoing speech
  if (speaking) {
    speechSynthesis.cancel();
  }

  // Create a new speech utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Set properties
  utterance.rate = 1.0; // Speed
  utterance.pitch = 1.0; // Pitch
  utterance.volume = 1.0; // Volume

  // Get available voices and set to a female voice if available
  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(
    (voice) => voice.name.includes("female") || voice.name.includes("Female")
  );
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  // Set speaking flag
  speaking = true;

  // Handle end of speech
  utterance.onend = () => {
    speaking = false;
  };

  // Speak the text
  speechSynthesis.speak(utterance);
}

// Toggle TTS button
const ttsButton = document.getElementById("tts-button");
if (ttsButton) {
  // Set initial state
  ttsButton.classList.add("active");

  ttsButton.addEventListener("click", () => {
    ttsEnabled = !ttsEnabled;

    if (ttsEnabled) {
      ttsButton.classList.add("active");
      ttsButton.title = "Disable Text-to-Speech";
    } else {
      ttsButton.classList.remove("active");
      ttsButton.title = "Enable Text-to-Speech";

      // Stop any ongoing speech
      if (speaking) {
        speechSynthesis.cancel();
      }
    }
  });
}

function addBotMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("bot-message");

  // Parse Markdown and set as HTML
  messageDiv.innerHTML = parseMarkdown(message);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Speak the message
  speakText(message);
  
  // Add follow-up suggestions if appropriate
  if (message.toLowerCase().includes("sustainable") || 
      message.toLowerCase().includes("eco-friendly") || 
      message.toLowerCase().includes("environmental")) {
    setTimeout(addFollowUpSuggestions, 500);
  }
}

// Add follow-up suggestions based on the conversation
function addFollowUpSuggestions() {
  const lastUserMessage = document.querySelector(".user-message:last-of-type p")?.textContent.toLowerCase() || "";
  
  let suggestions = [];
  
  if (lastUserMessage.includes("cleaning") || lastUserMessage.includes("clean")) {
    suggestions = ["What are the best eco-friendly cleaning brands?", "How to make DIY cleaning products?", "Are natural cleaning products effective?"];
  } else if (lastUserMessage.includes("fashion") || lastUserMessage.includes("clothing") || lastUserMessage.includes("clothes")) {
    suggestions = ["What are some sustainable fashion brands?", "How to identify greenwashing in fashion?", "What materials are most sustainable for clothing?"];
  } else if (lastUserMessage.includes("food") || lastUserMessage.includes("eating") || lastUserMessage.includes("diet")) {
    suggestions = ["What are sustainable food packaging options?", "How to reduce food waste?", "What are the most sustainable food choices?"];
  } else {
    suggestions = ["Tell me more about sustainable certifications", "What are common greenwashing tactics?", "How to start a zero-waste lifestyle?"];
  }
  
  const suggestionsDiv = document.createElement("div");
  suggestionsDiv.classList.add("follow-up-suggestions");
  suggestionsDiv.innerHTML = `
    <p class="suggestions-title">You might also want to know:</p>
    <div class="suggestion-chips">
      ${suggestions.map(suggestion => `<button class="suggestion-chip">${suggestion}</button>`).join('')}
    </div>
  `;
  
  chatMessages.appendChild(suggestionsDiv);
  
  // Add event listeners to suggestion chips
  const chips = document.querySelectorAll(".follow-up-suggestions .suggestion-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      inputField.value = chip.textContent;
      inputField.focus();
    });
  });
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("typing-indicator");
  typingDiv.innerHTML = `
    <div class="typing-content">
      <span class="typing-text">EcoFinder is finding sustainable alternatives</span>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingDiv = document.querySelector(".typing-indicator");
  if (typingDiv) {
    typingDiv.remove();
  }
}

function sendMessage() {
  const messageInput = document.querySelector(".chatbot-input");
  const message = messageInput.value.trim();

  if (message === "") return;

  // Add user message to chat
  addUserMessage(message);
  messageInput.value = "";

  // Show typing indicator
  showTypingIndicator();

  // Send message to backend
  fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Hide typing indicator
      hideTypingIndicator();

      if (data.status === "success") {
        // Add bot response to chat
        addBotMessage(data.response);
      } else if (data.status === "rate_limit") {
        // Handle rate limit error
        addBotMessage(data.response);
        // Add a note about retrying
        setTimeout(() => {
          addBotMessage("You can try your question again now.");
        }, 2000);
      } else {
        // Handle other errors
        addBotMessage("Sorry, I'm having trouble connecting. Please check your internet connection and try again.");
        console.error("Error:", data.error);
      }
    })
    .catch((error) => {
      // Hide typing indicator
      hideTypingIndicator();

      // Add error message to chat
      addBotMessage("Sorry, I'm having trouble connecting. Please check your internet connection and try again.");
      console.error("Error:", error);
    });
}

// Dark mode toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
  });
}

// Add CSS for suggestion chips
const style = document.createElement('style');
style.textContent = `
  .suggested-questions, .follow-up-suggestions {
    margin-top: 15px;
    margin-bottom: 15px;
    width: 100%;
  }
  
  .suggestions-title {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 10px;
  }
  
  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .suggestion-chip {
    background-color: rgba(76, 175, 80, 0.1);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.3);
    border-radius: 20px;
    padding: 8px 15px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .suggestion-chip:hover {
    background-color: rgba(76, 175, 80, 0.2);
    transform: translateY(-2px);
  }
  
  .dark-mode .suggestion-chip {
    background-color: rgba(76, 175, 80, 0.2);
    color: #c8e6c9;
    border-color: rgba(76, 175, 80, 0.4);
  }
  
  .dark-mode .suggestions-title {
    color: #aaa;
  }
`;
document.head.appendChild(style);
