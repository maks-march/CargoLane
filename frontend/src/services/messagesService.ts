import apiClient from '../api/api-client';
import { loadsService } from './loadsService'; // Импортируем для получения данных сделки

export interface ChatDto {
    id: string;
    partnerName: string;
    partnerCompany: string;
    avatarInitials: string;
    avatarColor: 'blue' | 'green';
    loadId: string | null; 
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
}

export interface ChatMessageDto {
    id: string;
    senderId: string; 
    text: string;
    timestamp: string;
    isSystemMessage?: boolean;
}

export interface TimelineEventDto {
    title: string;
    time: string;
    status: 'completed' | 'current' | 'pending';
}

export interface ActiveDealDto {
    loadId: string;
    route: string;
    details: string;
    price: string;
    status: string;
    timeline: TimelineEventDto[];
}

interface BackendChatVm {
    id: string;
    chatName?: string;
    username?: string;
    userCompany?: string;
    lastMessageText?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    loadId?: string | null; 
}

interface BackendMessageVm {
    id: string;
    senderId: string;
    text: string;
    created: string;
}

export const messagesService = {
    // 1. Получение списка чатов (ТОЛЬКО ИЗ БД, без фейковых админов)
    getChats: async (): Promise<ChatDto[]> => {
        try {
            const response = await apiClient.get<BackendChatVm[]>('/api/chat/me');
            
            return response.data.map((chat) => {
                const name = chat.chatName || chat.username || 'Unknown User';
                return {
                    id: chat.id,
                    partnerName: name, 
                    partnerCompany: chat.userCompany || 'CargoLane Partner', 
                    avatarInitials: name.substring(0, 2).toUpperCase(),
                    avatarColor: 'blue' as const,
                    loadId: chat.loadId || null, 
                    lastMessage: chat.lastMessageText || '', 
                    lastMessageTime: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unreadCount: chat.unreadCount || 0,
                    isOnline: true 
                };
            });
        } catch (error) {
            console.warn('Failed to load chat history from backend.', error);
            return [];
        }
    },

    // 2. Получение истории переписки и правильная сортировка
    getChatHistory: async (chatId: string): Promise<ChatMessageDto[]> => {
        try {
            const response = await apiClient.get<BackendMessageVm[]>(`/api/chat/${chatId}/messages`);
            
            const mappedMessages = response.data.map((msg) => ({
                id: msg.id,
                senderId: msg.senderId,
                text: msg.text,
                timestamp: new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystemMessage: false 
            }));

            // ИСПРАВЛЕНО: Переворачиваем массив, чтобы новые сообщения были внизу
            return mappedMessages.reverse();

        } catch (error) {
            console.error(`Failed to fetch chat history for ${chatId}:`, error);
            return [];
        }
    },

    // 3. Получение информации о сделке по LoadId для правой панели
    getActiveDeal: async (loadId: string): Promise<ActiveDealDto | null> => {
        if (!loadId || loadId === 'Support') return null;

        try {
            // Дергаем реальные данные маршрута из базы
            const item = await loadsService.getLoadById(loadId);
            const startCity = item.routePoints?.[0]?.city || item.from || 'Unknown';
            const endCity = item.routePoints?.[(item.routePoints?.length || 1) - 1]?.city || item.to || 'Unknown';
            
            return {
                loadId: item.id.substring(0, 8).toUpperCase(),
                route: `${startCity} → ${endCity}`,
                details: `${item.cargo || 'General Cargo'} • ${item.weight || 0}kg`,
                price: `€${item.price || 0}`,
                status: item.status === 'Active' || item.status === '0' ? 'Active' : 'Closed',
                timeline: [
                    { title: 'Load Created', time: new Date().toLocaleDateString(), status: 'completed' },
                    { title: 'Chat Started', time: 'Now', status: 'current' },
                    { title: 'Pending Agreement', time: '', status: 'pending' }
                ]
            };
        } catch (error) {
            console.warn(`Failed to fetch deal info for load ${loadId}`, error);
            return null;
        }
    },

    // 4. Отправка сообщения
    sendMessage: async (chatId: string, text: string): Promise<void> => {
        await apiClient.post(`/api/chat/${chatId}/messages`, JSON.stringify(text), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    // 5. Инициализация нового чата
    startChat: async (partnerId: string, loadId: string | null): Promise<{ chatId: string }> => {
        const payload: Record<string, string> = { targetUserId: partnerId };
        if (loadId) {
            payload.loadId = loadId; 
        }
        
        const response = await apiClient.post(`/api/chat`, payload);
        return typeof response.data === 'string' ? { chatId: response.data } : { chatId: response.data.id || response.data };
    }
};