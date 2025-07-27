import React, { useState, useRef } from "react";
import { FaCamera, FaPaperPlane, FaUpload } from "react-icons/fa";

const COLORS = {
  blue: "#325dfa",
  light: "#eef6fa",
  accent: "#ff6f61",
  bot: "#fff",
  user: "#e0edff"
};

function ChatBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I’m Medilens. Ask anything about health or upload a medicine photo!" }
  ]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Simulate chat POST—wire up to your backend in production
  const sendMessage = async (msg, type = "text", file = null) => {
    setMessages(m => [...m, { from: "user", text: msg, file }]);
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
      aiReply = data.reply || "Sorry, I couldn't find an answer.";
    } else if (type === "image") {
      // Send image upload to backend (/upload endpoint)
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      aiReply = data.aiInsight || "Sorry, I couldn't analyze that image.";
    }
    setMessages(m => [...m, { from: "bot", text: aiReply }]);
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

  return (
    <div className="chat-container">
      <div className="chat-title">Medilens Chat</div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${msg.from === "user" ? "user" : "bot"}`}
          >
            {msg.file && (
              <img
                src={URL.createObjectURL(msg.file)}
                alt="user upload"
                style={{ maxWidth: 160, borderRadius: 8, marginBottom: 6 }}
              />
            )}
            {msg.text}
          </div>
        ))}
        {uploading && (
          <div className="chat-bubble bot loading">
            <span className="loader"></span> Analyzing...
          </div>
        )}
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <button type="button" className="icon-btn" onClick={() => fileInputRef.current.click()} title="Attach file">
          <FaUpload size={23} />
        </button>
        <button type="button" className="icon-btn" onClick={handleCamera} title="Take photo">
          <FaCamera size={23} />
        </button>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileInput}
        />
        <input
          className="chat-input"
          placeholder="Type your health query…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={uploading}
        />
        <button className="icon-btn send-btn" type="submit" disabled={uploading || !input.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default ChatBot;
