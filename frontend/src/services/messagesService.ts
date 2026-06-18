import apiClient from '../api/api-client';
import { loadsService } from './loadsService';

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
    date: string; // ИСПРАВЛЕНО: Поле для отображения даты в стиле Телеграм
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
    getChats: async (): Promise<ChatDto[]> => {
        try {
            const response = await apiClient.get<BackendChatVm[]>('/api/chat/me');
            
            const rawChats = response.data.map((chat) => {
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

            const uniqueChats = Array.from(new Map(rawChats.map(item => [item.id, item])).values());
            return uniqueChats;

        } catch (error) {
            console.warn('Failed to load chat history from backend.', error);
            return [];
        }
    },

    getChatHistory: async (chatId: string): Promise<ChatMessageDto[]> => {
        try {
            const response = await apiClient.get<BackendMessageVm[]>(`/api/chat/${chatId}/messages`);
            
            const mappedMessages = response.data.map((msg) => {
                const d = new Date(msg.created);
                return {
                    id: msg.id,
                    senderId: msg.senderId,
                    text: msg.text,
                    timestamp: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' }), // Пример: "18 June"
                    isSystemMessage: false 
                };
            });

            return mappedMessages.reverse();

        } catch (error) {
            console.error(`Failed to fetch chat history for ${chatId}:`, error);
            return [];
        }
    },

    getActiveDeal: async (loadId: string): Promise<ActiveDealDto | null> => {
        if (!loadId || loadId === 'Support') return null;

        try {
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

    sendMessage: async (chatId: string, text: string): Promise<void> => {
        await apiClient.post(`/api/chat/${chatId}/message`, JSON.stringify(text), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    startChat: async (partnerId: string, loadId: string | null): Promise<{ chatId: string }> => {
        const url = loadId 
            ? `/api/chat/start/${partnerId}?loadId=${loadId}` 
            : `/api/chat/start/${partnerId}`;
            
        const response = await apiClient.post(url);
        
        return typeof response.data === 'string' 
            ? { chatId: response.data } 
            : { chatId: response.data.id || response.data };
    }
};