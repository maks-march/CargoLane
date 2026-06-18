import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
// ИСПРАВЛЕННЫЙ ИМПОРТ: Точное название твоего файла (с буквой 's')
import { messagesService, type ChatDto, type ChatMessageDto, type ActiveDealDto } from "../../services/messagesService";
import useAuthStore from "../../store/auth.store";

export const MessagesPage: React.FC = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  
  // URL-параметры для сохранения открытого чата при F5
  const [searchParams, setSearchParams] = useSearchParams();
  const activeChatId = searchParams.get('chatId');

  const [chats, setChats] = useState<ChatDto[]>([]);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [activeDeal, setActiveDeal] = useState<ActiveDealDto | null>(null);
  
  const [inputText, setInputText] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Определяем, админ это или обычный пользователь по URL
  const isAdmin = location.pathname.startsWith('/admin');

  // 1. Загрузка списка чатов
  const fetchChats = async () => {
    setIsLoadingChats(true);
    try {
      const data = await messagesService.getChats();
      setChats(data);
    } catch (error) {
      console.error("Failed to load chats", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // 2. Загрузка истории сообщений и сделки при выборе чата
  useEffect(() => {
    if (activeChatId) {
      const loadChatData = async () => {
        setIsLoadingMessages(true);
        try {
          const history = await messagesService.getChatHistory(activeChatId);
          setMessages(history);

          const chat = chats.find(c => c.id === activeChatId);
          if (chat && chat.loadId) {
            const deal = await messagesService.getActiveDeal(chat.loadId);
            setActiveDeal(deal);
          } else {
            setActiveDeal(null);
          }
        } catch (error) {
          console.error("Failed to load messages", error);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      loadChatData();
    } else {
      setMessages([]);
      setActiveDeal(null);
    }
  }, [activeChatId, chats]);

  // 3. Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Отправка сообщения
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const textToSend = inputText.trim();
    setInputText(""); // Очищаем инпут сразу для UX

    try {
      await messagesService.sendMessage(activeChatId, textToSend);
      // После отправки сразу запрашиваем обновленную историю из БД
      const updatedHistory = await messagesService.getChatHistory(activeChatId);
      setMessages(updatedHistory);
      // Обновляем список чатов, чтобы подтянулось lastMessage
      fetchChats();
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.partnerCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden", background: "#FFFFFF" }}>
      
      {/* ХЕДЕР С ДИНАМИЧЕСКИМИ КРОШКАМИ */}
      <header className="dash-header" style={{ padding: "16px 32px", borderBottom: "1px solid #E6E8EE", background: "white", flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb" style={{ fontSize: "13px", marginBottom: "4px" }}>
            <span style={{ color: "#A0AAB9", cursor: "default" }}>{isAdmin ? 'Other' : 'Workspace'}</span>
            <span style={{ margin: "0 8px", color: "#E6E8EE" }}>›</span>
            <strong style={{ color: "#0E1116", fontWeight: 500 }}>Messages</strong>
          </div>
          <h1 className="dash-title" style={{ fontSize: "24px", fontWeight: 500, color: "#0E1116", letterSpacing: "-0.5px", margin: 0 }}>Messages</h1>
        </div>
      </header>

      {/* СПЛИТ-ЛЕЙАУТ МЕССЕНДЖЕРА */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* ЛЕВАЯ ПАНЕЛЬ: СПИСОК ЧАТОВ */}
        <div style={{ width: "340px", borderRight: "1px solid #E6E8EE", display: "flex", flexDirection: "column", background: "white" }}>
          
          <div style={{ padding: "20px", borderBottom: "1px solid #E6E8EE" }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A0AAB9', fontSize: '14px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px 16px 10px 36px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none', color: '#0E1116', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {isLoadingChats ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#A0AAB9" }}>Loading chats...</div>
            ) : filteredChats.length === 0 ? (
              <div style={{ padding: "48px 32px", textAlign: "center", color: "#A0AAB9" }}>No chats found.</div>
            ) : (
              filteredChats.map(chat => {
                const isSelected = activeChatId === chat.id;
                return (
                  <div 
                    key={chat.id} 
                    onClick={() => setSearchParams({ chatId: chat.id })}
                    style={{ 
                      padding: "16px 20px", 
                      borderBottom: "1px solid #E6E8EE", 
                      cursor: "pointer",
                      background: isSelected ? "#EEF1FF" : "white",
                      borderLeft: isSelected ? "3px solid #3D5AFE" : "3px solid transparent",
                      display: "flex",
                      gap: "12px",
                      transition: "background 0.2s ease"
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: chat.avatarColor === 'green' ? '#ECFDF5' : '#EEF1FF', color: chat.avatarColor === 'green' ? '#10B981' : '#3D5AFE', display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "16px" }}>
                        {chat.avatarInitials}
                      </div>
                      {chat.isOnline && (
                        <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "12px", height: "12px", background: "#10B981", border: "2px solid white", borderRadius: "50%" }}></div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#0E1116", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chat.partnerName}</span>
                        <span style={{ fontSize: "12px", color: "#A0AAB9" }}>{chat.lastMessageTime}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#5C6470", marginBottom: "4px" }}>{chat.partnerCompany}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: chat.unreadCount > 0 ? "#0E1116" : "#A0AAB9", fontWeight: chat.unreadCount > 0 ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {chat.lastMessage || "No messages yet"}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span style={{ background: "#3D5AFE", color: "white", fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "100px" }}>{chat.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ПАНЕЛЬ: ЧАТ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FAFAFA" }}>
          {!activeChatId ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#A0AAB9", fontSize: "15px" }}>
              Select a chat to start messaging
            </div>
          ) : (
            <>
              {/* Шапка чата */}
              <div style={{ padding: "20px 32px", background: "white", borderBottom: "1px solid #E6E8EE", display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: activeChat?.avatarColor === 'green' ? '#ECFDF5' : '#EEF1FF', color: activeChat?.avatarColor === 'green' ? '#10B981' : '#3D5AFE', display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                  {activeChat?.avatarInitials}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#0E1116", marginBottom: "2px" }}>{activeChat?.partnerName}</div>
                  <div style={{ fontSize: "13px", color: "#10B981", fontWeight: 500 }}>Active now</div>
                </div>
              </div>

              {/* Зона сообщений */}
              <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                {isLoadingMessages ? (
                  <div style={{ textAlign: "center", color: "#A0AAB9" }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#A0AAB9", marginTop: "auto", marginBottom: "auto" }}>This is the beginning of your conversation.</div>
                ) : (
                  messages.map((msg) => {
                    const isSystem = msg.isSystemMessage;
                    // Проверка: сообщение мое, если senderId совпадает с ID текущего пользователя
                    const isMine = msg.senderId === user?.id; 

                    if (isSystem) {
                      return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: "center" }}>
                          <span style={{ background: "#F6F7FB", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", color: "#5C6470", border: "1px solid #E6E8EE" }}>
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "70%" }}>
                          <div style={{ 
                            background: isMine ? "#3D5AFE" : "white", 
                            color: isMine ? "white" : "#0E1116", 
                            padding: "12px 16px", 
                            borderRadius: isMine ? "12px 12px 0 12px" : "12px 12px 12px 0",
                            border: isMine ? "none" : "1px solid #E6E8EE",
                            fontSize: "14px",
                            lineHeight: 1.5,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                          }}>
                            {msg.text}
                          </div>
                          <div style={{ fontSize: "11px", color: "#A0AAB9", marginTop: "6px", textAlign: isMine ? "right" : "left" }}>
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <div style={{ padding: "24px 32px", background: "white", borderTop: "1px solid #E6E8EE", flexShrink: 0 }}>
                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <button type="button" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#A0AAB9", display: "flex", alignItems: "center", padding: "8px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{ flex: 1, padding: "12px 16px", background: "#F6F7FB", border: "1px solid #E6E8EE", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0E1116" }}
                  />
                  <button type="submit" disabled={!inputText.trim()} style={{ background: "#3D5AFE", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: 600, cursor: inputText.trim() ? "pointer" : "not-allowed", opacity: inputText.trim() ? 1 : 0.5, transition: "all 0.2s" }}>
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ: АКТИВНАЯ СДЕЛКА */}
        {activeChatId && activeDeal && (
          <div style={{ width: "320px", background: "white", borderLeft: "1px solid #E6E8EE", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E6E8EE" }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#0E1116" }}>Active deal</div>
            </div>
            
            <div style={{ padding: "24px", overflowY: "auto" }}>
              <div style={{ background: "#F9FAFB", border: "1px solid #E6E8EE", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#5C6470", fontWeight: 600 }}>LOAD ID {activeDeal.loadId}</span>
                  <span style={{ background: "#ECFDF5", color: "#10B981", border: "1px solid #A7F3D0", padding: "2px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 600 }}>{activeDeal.status}</span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0E1116", marginBottom: "4px" }}>{activeDeal.route}</div>
                <div style={{ fontSize: "13px", color: "#5C6470", marginBottom: "12px" }}>{activeDeal.details}</div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: "#0E1116" }}>{activeDeal.price}</div>
              </div>

              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0E1116", marginBottom: "16px" }}>Timeline</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                  {activeDeal.timeline.map((event, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", position: "relative" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                        <div style={{ 
                          width: "16px", height: "16px", borderRadius: "50%", 
                          background: event.status === 'completed' ? "#10B981" : event.status === 'current' ? "#3D5AFE" : "white",
                          border: `2px solid ${event.status === 'pending' ? '#E6E8EE' : 'transparent'}`,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {event.status === 'completed' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          {event.status === 'current' && <div style={{ width: "6px", height: "6px", background: "white", borderRadius: "50%" }}></div>}
                        </div>
                        {idx < activeDeal.timeline.length - 1 && (
                          <div style={{ position: "absolute", top: "16px", bottom: "-16px", width: "2px", background: event.status === 'completed' ? "#10B981" : "#E6E8EE" }}></div>
                        )}
                      </div>
                      <div style={{ paddingBottom: "16px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: event.status === 'pending' ? "#A0AAB9" : "#0E1116" }}>{event.title}</div>
                        {event.time && <div style={{ fontSize: "12px", color: "#5C6470", marginTop: "2px" }}>{event.time}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MessagesPage;