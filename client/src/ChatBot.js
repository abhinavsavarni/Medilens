import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaPaperPlane, FaUpload, FaMicrophone, FaUserCircle, FaRobot, FaArrowDown } from "react-icons/fa";

function formatTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ScrollToBottom({ onClick, visible }) {
  return visible ? (
    <button className="scroll-to-bottom-btn" onClick={onClick} aria-label="Scroll to latest message">
      <FaArrowDown />
    </button>
  ) : null;
}

function TypingIndicator() {
  return (
    <div className="typing-indicator-advanced">
      <span></span><span></span><span></span>
      <span className="typing-label">MediLens AI is typing…</span>
    </div>
  );
}

function ChatBot({ activeChat, onMessageSent }) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const messagesEndRef = useRef();
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Initialize messages if empty
  const messages = activeChat?.messages?.length > 0 ? activeChat.messages : [
    { from: "bot", text: "Hello! I'm MediLens AI. I can help you with health consultations, medicine analysis, and symptom checking. What would you like to know?", time: new Date() }
  ];

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, uploading]);

  // Show scroll-to-bottom button if not at bottom
  useEffect(() => {
    const container = document.querySelector('.messages-container');
    if (!container) return;
    const handleScroll = () => {
      setShowScrollBtn(container.scrollHeight - container.scrollTop - container.clientHeight > 80);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate chat POST—wire up to your backend in production
  const sendMessage = async (msg, type = "text", file = null) => {
    const userMessage = { from: "user", text: msg, file, time: new Date(), status: "sent" };
    onMessageSent(activeChat.id, userMessage);
    setUploading(true);

    let aiReply = "";
    if (type === "text") {
      // Send text chat to backend (replace with your endpoint as needed)
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: msg })
      });
      const data = await response.json();
      aiReply = data.reply || "I'm here to help with your health questions. Could you please provide more details about your concern?";
    } else if (type === "image") {
      // Send image upload to backend (/upload endpoint)
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      aiReply = data.aiInsight || "I've analyzed your image. This appears to be a medication. Please consult with a healthcare professional for proper medical advice.";
    }
    
    const botMessage = { from: "bot", text: aiReply, time: new Date(), status: "sent" };
    onMessageSent(activeChat.id, botMessage);
    setUploading(false);
  };

  const handleSend = e => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input, "text");
    setInput("");
  };

  const handleFileInput = e => {
    const file = e.target.files[0];
    if (file) sendMessage("Photo attached.", "image", file);
  };

  const handleCamera = async () => {
    fileInputRef.current.setAttribute("capture", "environment");
    fileInputRef.current.click();
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="chatbot-container">
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.from === "user" ? "user-message" : "bot-message"}`}
          >
            <div className="message-avatar">
              {msg.from === "user" ? <FaUserCircle /> : <FaRobot />}
            </div>
            <div className="message-content">
              {msg.file instanceof File && (
                <img
                  src={URL.createObjectURL(msg.file)}
                  alt="user upload"
                  className="message-image"
                />
              )}
              <div className="message-bubble">
                <div className="message-text">{msg.text}</div>
                <div className="message-meta">
                  <span className="message-time">{formatTime(msg.time)}</span>
                  <span className="message-status">{msg.status === "sent" ? "✓" : ""}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {uploading && (
          <div className="message bot-message">
            <div className="message-avatar"><FaRobot /></div>
            <div className="message-content">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        <ScrollToBottom onClick={scrollToBottom} visible={showScrollBtn} />
      </div>

      <div className="input-container">
        <form className="input-form" onSubmit={handleSend}>
          <div className="input-wrapper">
            <button type="button" className="input-btn" onClick={() => fileInputRef.current.click()} title="Attach file">
              <FaUpload />
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileInput}
            />
            <input
              className="message-input"
              placeholder="Message MediLens AI..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={uploading}
              aria-label="Type your message"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
