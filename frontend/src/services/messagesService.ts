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
    date: string; 
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
    senderName?: string;
    text?: string;
    created?: string;
    isRead?: boolean;
    isSystem?: boolean;
}

export const messagesService = {
    getChats: async (): Promise<ChatDto[]> => {
        try {
            const response = await apiClient.get<BackendChatVm[]>('/api/chat/me');
            
            return response.data.map(chat => {
                const name = chat.username || chat.chatName || 'Unknown Partner';
                const company = chat.userCompany || 'Verified Shipper';
                const initials = name.substring(0, 2).toUpperCase();
                
                let timeFormatted = '';
                if (chat.lastMessageTime) {
                    const date = new Date(chat.lastMessageTime);
                    timeFormatted = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                }

                return {
                    id: chat.id,
                    partnerName: name,
                    partnerCompany: company,
                    avatarInitials: initials,
                    avatarColor: initials.charCodeAt(0) % 2 === 0 ? 'blue' : 'green',
                    loadId: chat.loadId || null,
                    lastMessage: chat.lastMessageText || '',
                    lastMessageTime: timeFormatted,
                    unreadCount: chat.unreadCount || 0,
                    isOnline: Math.random() > 0.5
                };
            });
        } catch (error) {
            console.error("Failed to fetch chats from backend", error);
            return [];
        }
    },

    getChatHistory: async (chatId: string): Promise<ChatMessageDto[]> => {
        try {
            const response = await apiClient.get<BackendMessageVm[]>(`/api/chat/${chatId}/messages`);
            
            const history = response.data.reverse().map(msg => {
                const dateObj = msg.created ? new Date(msg.created) : new Date();
                const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const dateStr = `${months[dateObj.getMonth()]} ${dateObj.getDate()}`;

                return {
                    id: msg.id,
                    senderId: msg.senderId,
                    text: msg.text || '',
                    timestamp: timeStr,
                    date: dateStr,
                    isSystemMessage: msg.isSystem
                };
            });
            return history;
        } catch (error) {
            console.error(`Failed to fetch history for chat ${chatId}`, error);
            return [];
        }
    },

    getActiveDeal: async (loadId: string): Promise<ActiveDealDto | null> => {
        try {
            const item = await loadsService.getLoadById(loadId);
            if (!item) return null;
            
            // ИСПРАВЛЕНО: Безопасное извлечение городов из routePoints для LoadDetailsVm
            const startCity = item.routePoints?.[0]?.city || 'Origin';
            const endCity = item.routePoints?.[(item.routePoints?.length || 1) - 1]?.city || 'Destination';

            return {
                loadId: item.article ? String(item.article) : item.id.substring(0,8).toUpperCase(),
                route: `${startCity} → ${endCity}`,
                details: `${item.cargoType || 'General Cargo'} • ${item.totalWeight || 0}t`,
                price: `€${(item.payment || 0).toLocaleString('en-US')}`,
                status: item.status === 'Active' || item.status === '0' ? 'Active' : 'Closed',
                timeline: [
                    { title: 'Load Created', time: new Date(item.created || new Date()).toLocaleDateString(), status: 'completed' },
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
            : response.data;
    }
};