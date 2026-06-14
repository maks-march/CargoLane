import React from 'react';
import { useNavigate } from 'react-router-dom';

import type { ChatDto, ChatMessageDto, ActiveDealDto } from '../../services/messagesService';
import { messagesService } from '../../services/messagesService';

interface Props {
  onNavigate: (page: string) => void;
}

interface State {
  chats: ChatDto[];
  activeChatId: string | null;
  messages: ChatMessageDto[];
  activeDeal: ActiveDealDto | null;
  newMessage: string;
  isLoading: boolean;
  searchQuery: string;
}

// СТРОГАЯ КЛАССОВАЯ АРХИТЕКТУРА ДЛЯ БЭКЕНДЕРА
class MessagesPageClass extends React.Component<Props, State> {
  private messagesEndRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      chats: [], // АБСОЛЮТНО ПУСТОЙ СТЕЙТ
      activeChatId: null,
      messages: [],
      activeDeal: null,
      newMessage: '',
      isLoading: true,
      searchQuery: ''
    };
  }

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const partnerId = params.get('partnerId');
    const loadId = params.get('loadId');

    try {
      if (partnerId && loadId) {
        // БЕКЕНДЕРУ: Создание или получение чата при переходе из Load Board
        const { chatId } = await messagesService.startChat(partnerId, loadId);
        await this.handleSelectChat(chatId);
      }

      // БЕКЕНДЕРУ: Загрузка всех чатов текущего пользователя
      const realChats = await messagesService.getChats();
      this.setState({ chats: realChats, isLoading: false });
    } catch (_error) {
      console.warn('Backend API missing. Database is empty or disconnected.');
      this.setState({ isLoading: false }); // Отключаем лоадер, показываем пустую страницу
    }
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.messages.length !== this.state.messages.length) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  handleSelectChat = async (chatId: string) => {
    this.setState({ activeChatId: chatId, messages: [], activeDeal: null });

    try {
      // БЕКЕНДЕРУ: Параллельная загрузка истории чата и данных сделки
      const [realMessages, realDeal] = await Promise.all([
        messagesService.getChatHistory(chatId),
        messagesService.getActiveDeal(chatId)
      ]);
      this.setState({ messages: realMessages, activeDeal: realDeal });
    } catch (_error) {
      console.warn('Failed to load chat history and deal from backend');
    }
  };

  handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { newMessage, activeChatId, messages } = this.state;
    if (!newMessage.trim() || !activeChatId) return;

    let textToSend = newMessage;
    let isSystem = false;

    // Распознавание ссылок на груз (формат CL-12345)
    const loadIdMatch = newMessage.match(/CL-\d{5,}/i);
    if (loadIdMatch) {
      isSystem = true;
      const isNewChat = messages.length === 0;
      textToSend = isNewChat 
        ? `You shared ${loadIdMatch[0]} • Chat started` 
        : `You shared ${loadIdMatch[0]} • View route details`;
    }

    const newMsgObj: ChatMessageDto = {
      id: Date.now().toString(),
      senderId: isSystem ? 'system' : 'me',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemMessage: isSystem
    };

    // Оптимистичное обновление UI
    this.setState({ 
      messages: [...messages, newMsgObj],
      newMessage: '' 
    });

    try {
      // БЕКЕНДЕРУ: Сохранение сообщения в БД
      await messagesService.sendMessage(activeChatId, textToSend, isSystem);
    } catch (_error) {
      console.error('Failed to save message to DB');
    }
  };

  handleViewLoad = () => {
    const { activeChatId, chats } = this.state;
    const activeChat = chats.find(c => c.id === activeChatId);
    
    if (activeChat && activeChat.loadId) {
      this.props.onNavigate(`load-details?loadId=${activeChat.loadId}`);
    }
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: e.target.value });
  };

  render() {
    const { chats, activeChatId, messages, activeDeal, newMessage, isLoading, searchQuery } = this.state;
    
    const filteredChats = chats.filter(chat => 
      chat.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      chat.partnerCompany.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeChat = chats.find(c => c.id === activeChatId);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
        
        {/* ХЕДЕР - Заменил 5% на фиксированные 32px */}
        <header className="dash-header" style={{ borderBottom: '1px solid #E6E8EE', background: 'white', width: '100%', padding: '16px 32px', flexShrink: 0, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              <div className="dash-breadcrumb">
                <span style={{ color: '#A0AAB9', cursor: 'default' }}>Workspace</span>
                <span className="dash-detail-breadcrumb-arrow" style={{ margin: '0 8px' }}>›</span>
                <strong style={{ color: '#0E1116', fontWeight: 500 }}>Messages</strong>
              </div>
              <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 400, color: '#0E1116', letterSpacing:'-1px',marginTop: '4px' }}>Messages</h1>
            </div>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕЙНЕР ЧАТА */}
        <div className="messages-container" style={{ display: 'flex', width: '100%', flex: 1, overflow: 'hidden', margin: 0, padding: 0 }}>
          
          <aside className="msg-list-sidebar" style={{ height: '100%', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div className="msg-search-box" style={{ flexShrink: 0 }}>
              <input 
                type="text" 
                className="msg-search-input" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={this.handleSearch}
              />
            </div>
            <div className="msg-list" style={{ flex: 1, overflowY: 'auto' }}>
              {isLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#A0AAB9' }}>Loading chats from DB...</div>
              ) : filteredChats.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#A0AAB9' }}>No active chats</div>
              ) : (
                filteredChats.map(chat => (
                  <div 
                    key={chat.id} 
                    className={`msg-item ${activeChatId === chat.id ? 'active' : ''}`}
                    onClick={() => this.handleSelectChat(chat.id)}
                  >
                    <div className={`msg-avatar ${chat.avatarColor}`}>{chat.avatarInitials}</div>
                    <div className="msg-item-content">
                      <div className="msg-item-header">
                        <div className="msg-item-name">{chat.partnerName}</div>
                        <div className="msg-item-time">{chat.lastMessageTime}</div>
                      </div>
                      <div className="msg-item-company">{chat.partnerCompany}</div>
                      <div className="msg-item-preview">{chat.lastMessage}</div>
                    </div>
                    {chat.unreadCount > 0 && <div className="msg-unread-dot"></div>}
                  </div>
                ))
              )}
            </div>
          </aside>

          {activeChat ? (
            <div className="msg-chat-area" style={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div className="msg-chat-header" style={{ flexShrink: 0 }}>
                <div className="msg-chat-user">
                  <div className={`msg-avatar ${activeChat.avatarColor}`}>{activeChat.avatarInitials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>{activeChat.partnerName}</div>
                    <div style={{ fontSize: '13px', color: activeChat.isOnline ? '#00C48C' : '#A0AAB9', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                      {activeChat.isOnline && <span className="msg-status-dot"></span>}
                      {activeChat.isOnline ? 'Online' : 'Offline'} • {activeChat.partnerCompany}
                    </div>
                  </div>
                </div>
                <div className="msg-chat-actions">
                  <button className="btn-figma-secondary" onClick={this.handleViewLoad} style={{ padding: '6px 16px', fontSize: '13px' }}>
                    <span style={{ marginRight: '6px' }}>👁</span> View load
                  </button>
                  <button style={{ background: 'none', border: 'none', fontSize: '18px', color: '#5C6470', cursor: 'pointer', padding: '0 8px' }}>•••</button>
                </div>
              </div>

              <div className="msg-history" style={{ flex: 1, overflowY: 'auto' }}>
                {messages.map((msg) => {
                  if (msg.isSystemMessage) {
                    return (
                      <div key={msg.id} className="msg-system-badge">✓ {msg.text}</div>
                    );
                  }
                  const isMe = msg.senderId === 'me';
                  return (
                    <div key={msg.id} className={`msg-bubble-row ${isMe ? 'me' : 'them'}`}>
                      <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>{msg.text}</div>
                    </div>
                  );
                })}
                <div ref={this.messagesEndRef} />
              </div>

              <div className="msg-input-area" style={{ flexShrink: 0 }}>
                <form className="msg-input-wrapper" onSubmit={this.handleSendMessage}>
                  <input 
                    type="text" 
                    className="msg-input-field" 
                    placeholder={`Reply to ${activeChat.partnerName.split(' ')[0]}...`}
                    value={newMessage}
                    onChange={(e) => this.setState({ newMessage: e.target.value })}
                  />
                  <button type="submit" className="msg-send-btn">
                    <span style={{ transform: 'rotate(-45deg)' }}>➤</span> Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="dash-empty-state" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Select a chat to view messages
            </div>
          )}

          {activeChat && activeDeal && (
            <aside className="msg-deal-sidebar" style={{ height: '100%', overflowY: 'auto', flexShrink: 0 }}>
              <div className="deal-section-title">Active Deal</div>
              <div className="deal-summary-card">
                <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '4px' }}>{activeDeal.loadId}</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>{activeDeal.route}</div>
                <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '16px' }}>{activeDeal.details}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E6E8EE', paddingTop: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#A0AAB9' }}>{activeDeal.status}</span>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: '#0E1116' }}>{activeDeal.price}</span>
                </div>
              </div>

              <div className="deal-section-title">Timeline</div>
              <div className="deal-timeline">
                {activeDeal.timeline.map((event, _index) => (
                  <div key={_index} className="timeline-item">
                    <div className="timeline-line"></div>
                    <div className={`timeline-dot ${event.status === 'completed' ? 'green' : event.status === 'current' ? 'blue' : 'gray'}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-title" style={{ color: event.status === 'pending' ? '#5C6470' : '#0E1116' }}>
                        {event.title}
                      </div>
                      <div className="timeline-time">{event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
        
        {/* CSS Хак: Скрываем системные ползунки скролла */}
        <style>{`
          ::-webkit-scrollbar {
            width: 0px;
            height: 0px;
            background: transparent;
          }
          * {
            scrollbar-width: none; 
            -ms-overflow-style: none;
          }
        `}</style>
      </div>
    );
  }
}

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  return <MessagesPageClass onNavigate={(path) => navigate(`/${path}`)} />;
};

export default MessagesPage;