// src/Dashboard.js
import React, { useState, useEffect } from "react";
import { setToken, getToken } from "./api";
import ChatBot from "./ChatBot";
import { FaPlus, FaSignOutAlt, FaUser, FaCog, FaChevronLeft, FaChevronRight, FaComments, FaArchive, FaInbox, FaShareAlt } from "react-icons/fa";
import { useToast, useTheme } from "./App";

export default function Dashboard({ user, onLogout, showSettings, setShowSettings }) {
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Renamed from showSettings
  const [showShare, setShowShare] = useState(false);
  const getActiveChat = () => chats.find(chat => chat.active) || chats[0];
  const activeChat = getActiveChat();

  // Load chats from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem(`medilens_chats_${user?.email}`);
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
      } catch (error) {
        console.error('Error loading saved chats:', error);
        // If there's an error, initialize with default chats
        initializeDefaultChats();
      }
    } else {
      // Initialize with default chats for new users
      initializeDefaultChats();
    }
  }, [user?.email]);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (user?.email && chats.length > 0) {
      localStorage.setItem(`medilens_chats_${user.email}`, JSON.stringify(chats));
    }
  }, [chats, user?.email]);

  const initializeDefaultChats = () => {
    const defaultChats = [
      { id: 1, title: "New Chat", active: true, messages: [] }
    ];
    setChats(defaultChats);
  };

  function logout() {
    setToken(null);
    if (onLogout) onLogout();
  }

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      active: true,
      messages: []
    };
    setChats(prev => prev.map(chat => ({ ...chat, active: false })).concat(newChat));
  };

  const switchChat = (chatId) => {
    setChats(prev => prev.map(chat => ({ ...chat, active: chat.id === chatId })));
  };

  const updateChatTitle = (chatId, firstMessage) => {
    // Generate a title based on the first message
    let title = "New Chat";
    if (firstMessage && firstMessage.trim()) {
      const words = firstMessage.trim().split(' ').slice(0, 3);
      title = words.join(' ') + (words.length >= 3 ? '...' : '');
    }
    
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ));
  };

  const addMessageToChat = (chatId, message) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, message];
        // Update title on first user message
        if (message.from === "user" && chat.messages.length === 0) {
          updateChatTitle(chatId, message.text);
        }
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    }));
  };

  const deleteChat = (chatId) => {
    setChats(prev => {
      const filteredChats = prev.filter(chat => chat.id !== chatId);
      // If we're deleting the active chat, make the first remaining chat active
      const activeChat = prev.find(chat => chat.id === chatId);
      if (activeChat?.active && filteredChats.length > 0) {
        filteredChats[0].active = true;
      }
      return filteredChats;
    });
    showToast("Chat deleted", "error");
  };

  const archiveChat = (chatId) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, archived: true } : chat
    ));
    showToast("Chat archived", "info");
  };

  const unarchiveChat = (chatId) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, archived: false } : chat
    ));
    showToast("Chat unarchived", "success");
  };

  function getChatText(chat) {
    return chat.messages.map(m => `${m.from === "user" ? "You" : "MediLens"}: ${m.text}`).join("\n\n");
  }
  function copyChat() {
    navigator.clipboard.writeText(getChatText(activeChat));
    showToast("Chat copied to clipboard!", "success");
    setShowShare(false);
  }
  function downloadChat() {
    const blob = new Blob([getChatText(activeChat)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medilens-chat.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowShare(false);
  }

  return (
    <div className="dashboard-container">
      {/* Settings Drawer */}
      <div className={`settings-drawer${showSettings ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Settings drawer" onClick={() => setShowSettings(false)}>
        <div className="settings-drawer-content" onClick={e => e.stopPropagation()}>
          <div className="settings-drawer-header">
            <h2>Settings</h2>
            <button className="close-btn" onClick={() => setShowSettings(false)} aria-label="Close settings">×</button>
          </div>
          <div className="settings-drawer-section profile">
            <div className="profile-avatar-lg"><FaUser /></div>
            <div className="profile-info">
              <h3>{user?.name || "User"}</h3>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="settings-drawer-section">
            <label className="settings-label">Theme</label>
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
          <div className="settings-drawer-section">
            <label className="settings-label">Account</label>
            <button className="logout-btn" onClick={onLogout} aria-label="Sign out">
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
          <div className="settings-drawer-section about">
            <label className="settings-label">About</label>
            <div className="about-content">
              <div><b>MediLens</b> &copy; {new Date().getFullYear()}</div>
              <div>by <a href="https://github.com/abhinavsavarni" target="_blank" rel="noopener noreferrer">abhinav savarni</a></div>
              <div><a href="https://github.com/abhinavsavarni" target="_blank" rel="noopener noreferrer">@github.com/abhinavsavarni</a></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} role="navigation" aria-label="Chat sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat} aria-label="New Chat">
            <FaPlus style={{ marginRight: 6 }} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="chat-history" role="list" aria-label="Chat list">
          {/* Active Chats */}
          {chats.filter(chat => !chat.archived).map(chat => (
            <div key={chat.id} className="chat-item-container" role="listitem">
              <button
                className={`chat-item ${chat.active ? 'active' : ''}`}
                onClick={() => switchChat(chat.id)}
                aria-label={`Open chat: ${chat.title}`}
                tabIndex={0}
              >
                <FaComments style={{ marginRight: 7, color: chat.active ? 'var(--primary)' : '#888' }} />
                <span className="chat-title">{chat.title}</span>
              </button>
              {chat.messages.length > 0 && (
                <div className="chat-actions">
                  <button
                    className="archive-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveChat(chat.id);
                    }}
                    title="Archive chat"
                    aria-label={`Archive chat: ${chat.title}`}
                  >
                    <FaArchive />
                  </button>
                  <button
                    className="delete-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    title="Delete chat"
                    aria-label={`Delete chat: ${chat.title}`}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* Archived Chats */}
          {chats.filter(chat => chat.archived).length > 0 && (
            <div className="archived-section">
              <div className="archived-header"><FaInbox style={{ marginRight: 5 }} />Archived</div>
              {chats.filter(chat => chat.archived).map(chat => (
                <div key={chat.id} className="chat-item-container archived" role="listitem">
                  <button
                    className="chat-item archived"
                    onClick={() => switchChat(chat.id)}
                    aria-label={`Open archived chat: ${chat.title}`}
                    tabIndex={0}
                  >
                    <FaArchive style={{ marginRight: 7, color: '#aaa' }} />
                    <span className="chat-title">{chat.title}</span>
                  </button>
                  <div className="chat-actions">
                    <button
                      className="unarchive-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        unarchiveChat(chat.id);
                      }}
                      title="Unarchive chat"
                      aria-label={`Unarchive chat: ${chat.title}`}
                    >
                      <FaComments />
                    </button>
                    <button
                      className="delete-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      title="Delete chat"
                      aria-label={`Delete chat: ${chat.title}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Floating Action Button for New Chat on Mobile */}
        <button className="fab-new-chat" onClick={createNewChat} aria-label="New Chat">
          <FaPlus />
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat-area" role="main">
        <div className="chat-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          <div className="chat-title-center"><h1 className="chat-title">MediLens AI</h1></div>
          <button className="share-btn" type="button" onClick={() => setShowShare(true)} aria-label="Share chat"><FaShareAlt /></button>
        </div>
        {showShare && (
          <div className="share-modal-overlay" onClick={() => setShowShare(false)}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
              <h3>Share Chat</h3>
              <button className="share-modal-btn" type="button" onClick={copyChat}>Copy chat to clipboard</button>
              <button className="share-modal-btn" type="button" onClick={downloadChat}>Download chat as .txt</button>
              <button className="share-modal-close" type="button" onClick={() => setShowShare(false)} aria-label="Close share modal">×</button>
            </div>
          </div>
        )}

        <div className="chat-content">
          <ChatBot 
            activeChat={getActiveChat()}
            onMessageSent={addMessageToChat}
          />
        </div>
      </div>
    </div>
  );
}
