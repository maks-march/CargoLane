import apiClient from '../api/api-client';

export interface ChatDto {
    id: string;
    partnerName: string;
    partnerCompany: string;
    avatarInitials: string;
    avatarColor: 'blue' | 'green';
    loadId: string;
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
    username?: string;
    userCompany?: string;
    lastMessageText?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

interface BackendMessageVm {
    id: string;
    senderId: string;
    text: string;
    created: string;
}

export const messagesService = {
    // 1. Получение списка чатов
    getChats: async (): Promise<ChatDto[]> => {
        const response = await apiClient.get<BackendChatVm[]>('/api/chat/me');
        
        return response.data.map((chat) => ({
            id: chat.id,
            partnerName: chat.username || 'Unknown User', 
            partnerCompany: chat.userCompany || 'CargoLane Partner', 
            avatarInitials: chat.username ? chat.username.substring(0, 2).toUpperCase() : 'U',
            avatarColor: 'blue', 
            loadId: 'CL-00000', 
            lastMessage: chat.lastMessageText || '', 
            lastMessageTime: chat.lastMessageTime || '',
            unreadCount: chat.unreadCount || 0,
            isOnline: true 
        }));
    },

    // 2. Получение истории переписки
    getChatHistory: async (chatId: string): Promise<ChatMessageDto[]> => {
        const response = await apiClient.get<BackendMessageVm[]>(`/api/chat/${chatId}/messages`);
        
        return response.data.map((msg) => ({
            id: msg.id,
            senderId: msg.senderId,
            text: msg.text,
            timestamp: msg.created,
            isSystemMessage: false 
        }));
    },

    // 3. Получение активной сделки для правой панели
    getActiveDeal: async (chatId: string): Promise<ActiveDealDto> => {
        return {
            loadId: 'CL-' + chatId.substring(0, 5),
            route: 'Details unavailable',
            details: 'Backend endpoint removed',
            price: '-',
            status: 'Unknown',
            timeline: []
        };
    },

    // 4. Отправка сообщения
    sendMessage: async (chatId: string, text: string): Promise<void> => {
        await apiClient.post(`/api/chat/${chatId}/message`, { text });
    },

    // 5. Инициализация нового чата
    startChat: async (partnerId: string): Promise<{ chatId: string }> => {
        const response = await apiClient.post(`/api/chat/start/${partnerId}`);
        return typeof response.data === 'string' ? { chatId: response.data } : response.data;
    }
};