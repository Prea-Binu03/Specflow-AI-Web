import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import axios from "axios";
import "./AIAssistant.css"
import API_URL from "../config";;

export default function AIAssistant() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [projectContext, setProjectContext] = useState(null);

  const [userInfo] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return {
          name: parsed.name || parsed.username || "SpecFlow User",
          email: parsed.email || "user@specflow.com"
        };
      }
    } catch (e) {
      console.error("Error reading user data", e);
    }
    return { name: "SpecFlow User", email: "user@specflow.com" };
  });

  const [chats, setChats] = useState([
    { 
      id: 1, 
      title: projectId ? "Loading Project..." : "Welcome Chat", 
      messages: [
        {
          role: "assistant",
          content: projectId 
            ? "Loading project context and details... Please wait a moment." 
            : "Hello! I am your advanced SpecFlow AI Assistant. You can ask me to write code, design diagrams (flowcharts, architecture), or format outputs for Word, PPT, and PDF reports with direct professional file downloads.",
        }
      ], 
      active: true 
    }
  ]);
  
  const activeChat = chats.find(c => c.active) || chats[0];
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Chat renaming states
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Message editing states
  const [editingMsgIndex, setEditingMsgIndex] = useState(null);
  const [editMsgText, setEditMsgText] = useState("");

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages, loading]);

  // Fetch Project Context & auto-update welcome message if projectId is present in URL
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectContext = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${projectId}/ai-context`);
        if (response.data && response.data.project) {
          const proj = response.data.project;
          setProjectContext(proj);
          
          const projectOverview = proj.aiPlan?.overview || proj.projectIdea || "No overview available.";
          
          setChats(prev => prev.map(c => c.active ? { 
            ...c, 
            title: proj.projectName,
            messages: [
              {
                role: "assistant",
                content: `Hello! I have successfully loaded the context for your project **${proj.projectName}**.\n\n**Overview:** ${projectOverview}\n\nAsk me anything about architecture, database schema, or ask for visual diagrams (flowcharts, system design) and professional report exports!`
              }
            ]
          } : c));
        }
      } catch (err) {
        console.error("Error loading project context for AI:", err);
        setErrorMsg("Failed to load project details for AI context.");
      }
    };

    fetchProjectContext();
  }, [projectId]);

  const handleSendMessage = async (e, customMessages = null) => {
    if (e) e.preventDefault();
    
    let updatedMessages = customMessages;
    if (!updatedMessages) {
      if (!input.trim() && !selectedFile) {
        setErrorMsg("Please enter a message or attach a file.");
        return;
      }
      setErrorMsg("");

      let fileContentDesc = "";
      if (selectedFile) {
        fileContentDesc = `[Attached File: ${selectedFile.name}] `;
      }

      const userMessageContent = fileContentDesc + input.trim();
      const newUserMsg = { role: "user", content: userMessageContent };
      updatedMessages = [...activeChat.messages, newUserMsg];
    }

    setChats(chats.map(chat => {
      if (chat.id === activeChat.id) {
        let newTitle = chat.title;
        if ((chat.title.startsWith("New Chat") || chat.title === "Welcome Chat" || chat.title === "Loading Project...") && !customMessages && !projectContext) {
          newTitle = input.trim().length > 22 ? input.trim().substring(0, 22) + "..." : (input.trim() || "Advanced Chat");
        }
        return { ...chat, title: newTitle, messages: updatedMessages };
      }
      return chat;
    }));

    if (!customMessages) {
      setInput("");
      setSelectedFile(null);
    }
    
    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem("token");
      
      const apiMessages = updatedMessages.map(m => {
        let content = m.content;
        if (m.role === "user") {
          const lower = content.toLowerCase();
          if (lower.includes("diagram") || lower.includes("flowchart") || lower.includes("architecture") || lower.includes("chart")) {
            content += "\n\n[Format instruction: Provide a clear Mermaid.js diagram code block (using ```mermaid ... ```) so it can be rendered as a visual image.]";
          }
          if (lower.includes("word") || lower.includes("doc")) {
            content += "\n\n[Format instruction: Format cleanly with clear headings and bullet points suitable for a Word document.]";
          } else if (lower.includes("ppt") || lower.includes("presentation") || lower.includes("slides")) {
            content += "\n\n[Format instruction: Structure slide-by-slide with 'Slide Title' and 'Bullet Points' for a presentation.]";
          } else if (lower.includes("pdf") || lower.includes("report")) {
            content += "\n\n[Format instruction: Format like a professional project report suitable for a PDF document.]";
          }
        }
        return { role: m.role, content };
      });

      const response = await axios.post(
        `${API_URL}/api/ai/chat`,
        { 
          messages: apiMessages,
          projectContext: projectContext || null
        },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: abortControllerRef.current.signal
        }
      );

      const aiReply = response.data.message || response.data.reply || "I have processed your request.";
      
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            messages: [...updatedMessages, { role: "assistant", content: aiReply }]
          };
        }
        return chat;
      }));
    } catch (err) {
      if (axios.isCancel(err)) {
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              messages: [...updatedMessages, { role: "assistant", content: "[Response generation stopped by user.]" }]
            };
          }
          return chat;
        }));
      } else {
        setErrorMsg(err.response?.data?.message || "AI service is temporarily unavailable.");
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Professional Download Handler calling backend formatted exporters
  const handleDownload = async (content, type) => {
    try {
      let endpoint = "";
      let filename = "project-report";

      if (type === "doc") {
        endpoint = "docx";
        filename = "project-document.docx";
      } else if (type === "ppt") {
        endpoint = "pptx";
        filename = "project-presentation.pptx";
      } else if (type === "pdf") {
        endpoint = "pdf";
        filename = "project-report.pdf";
      }

      const response = await axios.post(
        `http://localhost:5000/api/ai/download/${endpoint}`,
        { content },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download Error:", err);
      alert("Failed to download formatted file. Please try again.");
    }
  };

  // Helper to render message text and automatically convert Mermaid code blocks into image URLs using mermaid.ink
  const renderMessageContentWithDiagrams = (content) => {
    if (!content) return null;

    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mermaidRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", value: content.substring(lastIndex, match.index) });
      }

      const mermaidCode = match[1].trim();
      const encoded = btoa(unescape(encodeURIComponent(mermaidCode)));
      const imageUrl = `https://mermaid.ink/svg/${encoded}`;

      parts.push({ type: "diagram", value: imageUrl, code: mermaidCode });
      lastIndex = mermaidRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({ type: "text", value: content.substring(lastIndex) });
    }

    if (parts.length === 0) {
      return <p style={{ whiteSpace: "pre-wrap", margin: "6px 0 0 0" }}>{content}</p>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "6px" }}>
        {parts.map((part, i) => {
          if (part.type === "text") {
            return <p key={i} style={{ whiteSpace: "pre-wrap", margin: 0 }}>{part.value}</p>;
          } else {
            return (
              <div key={i} style={{ background: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #334155", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold" }}>📊 Generated Visual Diagram</span>
                  <a
                    href={part.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="diagram.svg"
                    style={{ background: "#3b82f6", color: "#fff", textDecoration: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}
                  >
                    📥 Download Diagram Image
                  </a>
                </div>
                <div style={{ background: "#ffffff", padding: "12px", borderRadius: "6px", overflowX: "auto" }}>
                  <img src={part.value} alt="System Diagram" style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }} />
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const handleStartEditMsg = (index, content) => {
    setEditingMsgIndex(index);
    setEditMsgText(content);
  };

  const handleSaveEditMsg = (index) => {
    if (!editMsgText.trim()) return;
    const truncatedMessages = activeChat.messages.slice(0, index);
    const updatedMessages = [...truncatedMessages, { role: "user", content: editMsgText }];
    setEditingMsgIndex(null);
    setEditMsgText("");
    handleSendMessage(null, updatedMessages);
  };

  const handleDeleteMsg = (index) => {
    const updatedMessages = activeChat.messages.filter((_, idx) => {
      if (idx === index) return false;
      if (idx === index + 1 && activeChat.messages[idx].role === "assistant") return false;
      return true;
    });

    setChats(chats.map(chat => {
      if (chat.id === activeChat.id) {
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    }));
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNewChat = () => {
    const newChatObj = { 
      id: Date.now(), 
      title: projectContext ? `Discussion: ${projectContext.projectName}` : `New Chat ${chats.length + 1}`, 
      messages: [
        {
          role: "assistant",
          content: projectContext 
            ? `I am ready to help you with your project "${projectContext.projectName}". Ask for architecture diagrams, code tasks, or professional document exports!` 
            : "Started a new conversation. Ask for diagrams, code, or formatted outputs like Word, PPT, and PDF!",
        }
      ], 
      active: true 
    };
    setChats(chats.map(c => ({ ...c, active: false })).concat(newChatObj));
    setErrorMsg("");
  };

  const handleSelectChat = (id) => {
    setChats(chats.map(c => ({ ...c, active: c.id === id })));
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    const remainingChats = chats.filter((chat) => chat.id !== id);
    if (remainingChats.length === 0) {
      setChats([{ id: Date.now(), title: "New Chat", messages: [{ role: "assistant", content: "How can I help you?" }], active: true }]);
    } else {
      if (chats.find(c => c.id === id)?.active) {
        remainingChats[0].active = true;
      }
      setChats(remainingChats);
    }
  };

  const handleStartEdit = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (e, id) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    setChats(
      chats.map((chat) => (chat.id === id ? { ...chat, title: editTitle } : chat))
    );
    setEditingChatId(null);
  };

  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "US";
  };

  return (
    <div className="gemini-layout">
      {/* Sidebar */}
      <aside className="gemini-sidebar">
        <div className="sidebar-top">
          <button className="gemini-back-btn" onClick={() => navigate(projectId ? `/project/${projectId}` : "/dashboard")}>
            <span className="back-icon">←</span> {projectId ? "Back to Project" : "Back to Dashboard"}
          </button>
          <button className="gemini-new-chat-btn" onClick={handleNewChat}>
            <span className="plus-icon">+</span> <span>New Chat</span>
          </button>
        </div>

        <div className="sidebar-section-title">Recent Conversations</div>
        <div className="sidebar-chat-list custom-scrollbar">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`sidebar-chat-item ${chat.active ? "active" : ""}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              {editingChatId === chat.id ? (
                <div className="edit-chat-wrapper" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="edit-chat-input"
                    autoFocus
                  />
                  <button onClick={(e) => handleSaveEdit(e, chat.id)} className="save-edit-btn">✓</button>
                </div>
              ) : (
                <div className="chat-item-content">
                  <div className="chat-title-group">
                    <span className="chat-bubble-icon">💬</span>
                    <span className="chat-text" title={chat.title}>{chat.title}</span>
                  </div>
                  <div className="chat-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => handleStartEdit(e, chat)} title="Rename" className="action-icon">✏️</button>
                    <button onClick={(e) => handleDeleteChat(e, chat.id)} title="Delete" className="action-icon">🗑️</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="sidebar-footer">
          <div className="user-profile-card clickable-profile" onClick={() => navigate("/profile")} title="Go to Profile">
            <div className="avatar-circle">{getInitials(userInfo.name)}</div>
            <div className="user-profile-details">
              <span className="user-name" title={userInfo.name}>{userInfo.name}</span>
              <span className="user-status" title={userInfo.email}>View Profile →</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="gemini-main">
        <header className="gemini-header">
          <div className="header-title-wrapper">
            <div className="header-left">
              <h2>SpecFlow AI Assistant</h2>
              <p className="header-subtitle">Advanced Multi-Format AI Companion</p>
            </div>
            <div className="active-topic-badge">
              <span className="pulse-dot"></span> Topic: {activeChat.title}
            </div>
          </div>
        </header>

        {/* Project Context Active Banner */}
        {projectContext && (
          <div style={{ background: "#1e293b", padding: "12px 24px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <div>
                <span style={{ fontSize: "10px", color: "#38bdf8", fontWeight: "bold", textTransform: "uppercase", display: "block", letterSpacing: "0.5px" }}>Active Project Context</span>
                <strong style={{ color: "#f8fafc", fontSize: "15px" }}>{projectContext.projectName}</strong>
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#94a3b8", background: "#0f172a", padding: "4px 10px", borderRadius: "6px", border: "1px solid #334155" }}>
              AI is tailored to this project
            </span>
          </div>
        )}

        <div className="gemini-chat-window custom-scrollbar">
          {activeChat.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`gemini-message-row ${
                msg.role === "user" ? "user-row" : "assistant-row"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="message-avatar ai-av">✨</div>
              )}
              
              <div className="gemini-bubble" style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="msg-sender">
                    {msg.role === "user" ? userInfo.name : "SpecFlow AI"}
                  </span>
                  
                  {msg.role === "user" && editingMsgIndex !== idx && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button 
                        onClick={() => handleStartEditMsg(idx, msg.content)} 
                        title="Edit prompt"
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "12px" }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteMsg(idx)} 
                        title="Delete prompt"
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "12px" }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}

                  {msg.role === "assistant" && (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        title="Copy text"
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "11px", color: "#a0aec0" }}
                      >
                        {copiedIndex === idx ? "Copied! ✓" : "📋 Copy"}
                      </button>
                      <button
                        onClick={() => handleDownload(msg.content, "doc")}
                        title="Download as Professional Word Document (.docx)"
                        style={{ background: "#2b6cb0", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
                      >
                        📄 Word
                      </button>
                      <button
                        onClick={() => handleDownload(msg.content, "ppt")}
                        title="Download as Styled PowerPoint Presentation (.pptx)"
                        style={{ background: "#d69e2e", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
                      >
                        📊 PPT
                      </button>
                      <button
                        onClick={() => handleDownload(msg.content, "pdf")}
                        title="Download as Professional PDF Report (.pdf)"
                        style={{ background: "#c53030", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}
                      >
                        📑 Report
                      </button>
                    </div>
                  )}
                </div>

                {editingMsgIndex === idx ? (
                  <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <textarea
                      value={editMsgText}
                      onChange={(e) => setEditMsgText(e.target.value)}
                      style={{ width: "100%", background: "#1a202c", color: "#fff", border: "1px solid #4a5568", borderRadius: "4px", padding: "6px" }}
                      rows={2}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button onClick={() => setEditingMsgIndex(null)} style={{ background: "#4a5568", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => handleSaveEditMsg(idx)} style={{ background: "#0bc5ea", color: "#000", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Save & Submit</button>
                    </div>
                  </div>
                ) : (
                  msg.role === "assistant" ? renderMessageContentWithDiagrams(msg.content) : <p style={{ whiteSpace: "pre-wrap", margin: "6px 0 0 0" }}>{msg.content}</p>
                )}
              </div>

              {msg.role === "user" && <div className="message-avatar user-av">{getInitials(userInfo.name)}</div>}
            </div>
          ))}

          {loading && (
            <div className="gemini-message-row assistant-row">
              <div className="message-avatar ai-av">✨</div>
              <div className="gemini-bubble">
                <span className="msg-sender">SpecFlow AI</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                  <p style={{ margin: 0, color: "#0bc5ea", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="spinner"></span> Generating diagram and response...
                  </p>
                  <button onClick={handleStopGeneration} className="stop-gen-btn" title="Stop generating">
                    ■ Stop
                  </button>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {errorMsg && <div className="gemini-error-banner">{errorMsg}</div>}

        <div className="gemini-input-container">
          {selectedFile && (
            <div className="file-preview-pill">
              <span>📎 {selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)}>×</button>
            </div>
          )}
          <form className="gemini-form" onSubmit={(e) => handleSendMessage(e)}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button 
              type="button" 
              className="attach-btn" 
              title="Upload file or document"
              onClick={() => fileInputRef.current.click()}
            >
              📎
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={projectContext ? `Ask for system diagram or info about ${projectContext.projectName}...` : "Ask for diagrams, code, or Word/PPT/PDF format..."}
              disabled={loading}
            />
            <button type="submit" disabled={loading || (!input.trim() && !selectedFile)}>
              ➤
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}