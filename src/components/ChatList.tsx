import React from 'react';
import { User } from '../models/User';

interface ChatListProps {
  users: User[];
  activeUserId: string;
  newMessages: { [userId: string]: number };
  lastActiveChatId: string | null;
  onChatSelect: (user: User) => void;
  getLastMessageTimeForUser: (userId: string) => number | null; // Получаем время последнего сообщения
}

const ChatList: React.FC<ChatListProps> = ({
  users,
  activeUserId,
  newMessages,
  lastActiveChatId,
  onChatSelect,
  getLastMessageTimeForUser
}) => {

  // Сортируем пользователей по времени последнего сообщения
  const sortedUsers = users
    .filter((user) => user.id !== activeUserId)
    .sort((a, b) => {
      const lastMessageTimeA = getLastMessageTimeForUser(a.id);
      const lastMessageTimeB = getLastMessageTimeForUser(b.id);

      if (lastMessageTimeA && lastMessageTimeB) {
        return lastMessageTimeB - lastMessageTimeA; // Сортируем от новых к старым
      }

      return lastMessageTimeA ? -1 : 1; 
    });

  return (
    <div>
      <h2>Переписка</h2>
      <ul className="user-list">
        {sortedUsers.map((user) => (
          <li key={user.id} className="user-list-item" onClick={() => onChatSelect(user)}>
            <span></span>
            <p>{user.name}</p>
            {newMessages[user.id] > 0 && (
              <div className="unread-count">{newMessages[user.id]}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
