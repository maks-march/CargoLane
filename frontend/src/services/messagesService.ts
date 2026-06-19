import apiClient from '../api/api-client';
import { loadsService } from './loadsService';
import useAuthStore from '../store/auth.store';

export interface ChatDto {
    id: string;
    partnerName: string;
    partnerCompany: string;
    avatarInitials: string;
    avatarColor: 'blue' | 'green';
    avatarUrl?: string; 
    loadId: string | null; 
    lastMessage: string;
    lastMessageTime: string;
    rawMessageTime: string; 
    unreadCount: number;
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
    companyName?: string; 
    chatAvatarUrl?: string;
    lastMessageText?: string;
    lastMessageTime?: string;
    unreadCount: number;
    loadId?: string | null; 
}

interface BackendMessageVm {
    id: string;
    senderId: string;
    text: string;
    created: string;
}

const partnerInfoCache = new Map<string, { name: string; company: string; avatar?: string }>();
let cachedTimezone: number | null = null;

const getUserTimezone = async (): Promise<number> => {
    if (cachedTimezone !== null) return cachedTimezone;
    try {
        const res = await apiClient.get('/api/user/me');
        cachedTimezone = Number(res.data.timezone) || 0;
        return cachedTimezone;
    } catch {
        return 0;
    }
};

const fetchPartnerInfoSafe = async (loadId: string) => {
    if (!loadId) return null;
    if (partnerInfoCache.has(loadId)) return partnerInfoCache.get(loadId);

    try {
        const load = await loadsService.getLoadById(loadId);
        const currentUserId = useAuthStore.getState().user?.id;
        
        if (load && load.userId && load.userId !== 'system_id' && load.userId !== currentUserId) {
            const userRes = await apiClient.get(`/api/user/${load.userId}`);
            const u = userRes.data;
            const info = {
                name: u.displayName || u.firstName || '',
                company: u.companyName || '',
                avatar: u.avatarPath || u.avatarUrl || undefined
            };
            partnerInfoCache.set(loadId, info);
            return info;
        }
    } catch (e) {
    }
    
    const emptyInfo = { name: '', company: '' };
    partnerInfoCache.set(loadId, emptyInfo);
    return emptyInfo;
};

export const messagesService = {
    markChatAsRead: (chatId: string, rawMessageTime: string) => {
        try {
            const readMap = JSON.parse(localStorage.getItem('cargo_chat_read_states') || '{}');
            readMap[chatId] = rawMessageTime;
            localStorage.setItem('cargo_chat_read_states', JSON.stringify(readMap));
        } catch (e) {
            console.error("Local storage error", e);
        }
    },

    getChats: async (): Promise<ChatDto[]> => {
        try {
            const response = await apiClient.get<BackendChatVm[]>('/api/chat/me');
            
            let readMap: Record<string, string> = {};
            try {
                readMap = JSON.parse(localStorage.getItem('cargo_chat_read_states') || '{}');
            } catch (e) {}

            const tz = await getUserTimezone();

            const enrichedChats = await Promise.all(response.data.map(async (chat) => {
                let name = chat.chatName || 'Unknown Partner';
                let company = chat.companyName || ''; 
                let avatar = chat.chatAvatarUrl || undefined;

                if (chat.loadId) {
                    const partnerInfo = await fetchPartnerInfoSafe(chat.loadId);
                    if (partnerInfo && partnerInfo.name) {
                        name = partnerInfo.name;
                        if (partnerInfo.company) company = partnerInfo.company;
                        if (partnerInfo.avatar) avatar = partnerInfo.avatar;
                    }
                }

                const rawTime = chat.lastMessageTime || '';
                
                let unread = chat.unreadCount || 0;
                if (rawTime && readMap[chat.id] === rawTime) {
                    unread = 0; 
                } else if (unread > 0) {
                    unread = 1; 
                }

                let formattedTime = '';
                if (rawTime) {
                    let s = rawTime;
                    if (!s.endsWith('Z')) s += 'Z'; 
                    const d = new Date(s);
                    const targetMs = d.getTime() + (tz * 3600 * 1000);
                    const targetDate = new Date(targetMs);
                    const hours = targetDate.getUTCHours().toString().padStart(2, '0');
                    const minutes = targetDate.getUTCMinutes().toString().padStart(2, '0');
                    formattedTime = `${hours}:${minutes}`;
                }

                let initials = 'U';
                const parts = name.trim().split(' ');
                if (parts.length >= 2 && parts[0] && parts[1]) {
                    initials = (parts[0][0] + parts[1][0]).toUpperCase();
                } else if (parts.length === 1 && parts[0].length > 0) {
                    initials = parts[0].substring(0, 2).toUpperCase();
                }

                return {
                    id: chat.id,
                    partnerName: name, 
                    partnerCompany: company, 
                    avatarInitials: initials,
                    avatarColor: name.toLowerCase().includes('admin') ? 'green' : 'blue',
                    avatarUrl: avatar,
                    loadId: chat.loadId || null, 
                    lastMessage: chat.lastMessageText || '', 
                    lastMessageTime: formattedTime,
                    rawMessageTime: rawTime,
                    unreadCount: unread
                } as ChatDto;
            }));

            const uniqueChatsMap = new Map<string, ChatDto>();
            enrichedChats.forEach(chat => {
                uniqueChatsMap.set(chat.id, chat);
            });

            return Array.from(uniqueChatsMap.values()).sort((a, b) => {
                if (!a.rawMessageTime) return 1;
                if (!b.rawMessageTime) return -1;
                return new Date(b.rawMessageTime).getTime() - new Date(a.rawMessageTime).getTime();
            });
        } catch (error) {
            console.warn('Failed to load chat history from backend.', error);
            return [];
        }
    },

    getChatHistory: async (chatId: string): Promise<ChatMessageDto[]> => {
        try {
            const response = await apiClient.get<BackendMessageVm[]>(`/api/chat/${chatId}/messages`);
            
            const tz = await getUserTimezone();
            
            const mappedMessages = response.data.map((msg) => {
                let s = msg.created;
                if (!s.endsWith('Z')) s += 'Z'; 
                const d = new Date(s);
                
                const targetMs = d.getTime() + (tz * 3600 * 1000);
                const targetDate = new Date(targetMs);
                
                const hours = targetDate.getUTCHours().toString().padStart(2, '0');
                const minutes = targetDate.getUTCMinutes().toString().padStart(2, '0');
                const timeStr = `${hours}:${minutes}`;
                
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const dateStr = `${months[targetDate.getUTCMonth()]} ${targetDate.getUTCDate()}`;

                return {
                    id: msg.id,
                    senderId: msg.senderId,
                    text: msg.text,
                    timestamp: timeStr,
                    date: dateStr, 
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
            const startCity = item.from || 'Unknown';
            const endCity = item.to || 'Unknown';
            
            return {
                loadId: item.article ? String(item.article) : item.id.substring(0, 8).toUpperCase(),
                route: `${startCity} → ${endCity}`,
                details: `${item.cargo || 'General Cargo'} • ${item.weight || 0}t`,
                price: `€${item.price || 0}`,
                // ИСПРАВЛЕНО: Теперь статус берется строго из БД. Убран костыль с "Closed"
                status: item.status || 'Active', 
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
            
        const response = await apiClient.post<{ id: string } | string>(url);
        
        return typeof response.data === 'string' 
            ? { chatId: response.data } 
            : { chatId: response.data.id };
    }
};