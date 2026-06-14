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

export const messagesService = {
    // 1. Получение списка чатов
    getChats: async (): Promise<ChatDto[]> => {
        const response = await apiClient.get('/api/Messages/chats');
        return response.data;
    },

    // 2. Получение истории переписки
    getChatHistory: async (chatId: string): Promise<ChatMessageDto[]> => {
        const response = await apiClient.get(`/api/Messages/${chatId}/history`);
        return response.data;
    },

    // 3. Получение активной сделки для правой панели
    getActiveDeal: async (chatId: string): Promise<ActiveDealDto> => {
        const response = await apiClient.get(`/api/Messages/${chatId}/deal`);
        return response.data;
    },

    // 4. Отправка сообщения
    sendMessage: async (chatId: string, text: string, isSystem: boolean = false): Promise<void> => {
        await apiClient.post(`/api/Messages/${chatId}/send`, { text, isSystem });
    },

    // 5. ПАЗ ДЛЯ БЭКЕНДЕРА: Инициализация нового чата при переходе со страницы груза
    startChat: async (partnerId: string, loadId: string): Promise<{ chatId: string }> => {
        const response = await apiClient.post('/api/Messages/start', { partnerId, loadId });
        return response.data;
    }
};