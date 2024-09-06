import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import UserSelection from './components/UserSelection';
import { User } from './models/User';
import { Message } from './models/Message';

const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [chattingWith, setChattingWith] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessages, setNewMessages] = useState<{ [userId: string]: { [chatWithUserId: string]: number } }>({});
  const [lastActiveChatId, setLastActiveChatId] = useState<string | null>(null);

  const users: User[] = [
    { id: '1', name: 'Алиса' },
    { id: '2', name: 'Влад' },
    { id: '3', name: 'Ксюша' },
    { id: '4', name: 'Данил' },
    { id: '5', name: 'Руслан' },
    { id: '6', name: 'Андрей' },
    { id: '7', name: 'Никита' },
    { id: '8', name: 'Юля' },
    { id: '9', name: 'Вика' },
    { id: '10', name: 'Sterben' },
    { id: '11', name: 'Hykapa' },
    { id: '12', name: 'Cerber' },
  ];

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const storedNewMessages = JSON.parse(localStorage.getItem('newMessages') || '{}');

    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }

    if (Object.keys(storedNewMessages).length > 0) {
      setNewMessages(storedNewMessages);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'messages') {
        const updatedMessages = JSON.parse(event.newValue || '[]');
        setMessages(updatedMessages);
      }

      if (event.key === 'newMessages') {
        const updatedNewMessages = JSON.parse(event.newValue || '{}');
        setNewMessages(updatedNewMessages);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (chattingWith && newMessages[activeUser!.id]?.[chattingWith.id] > 0) {
      handleClearNewMessages(chattingWith.id);
    }
  }, [chattingWith]);

  // Сбрасываем счётчик новых сообщений для конкретного чата
  const handleClearNewMessages = useCallback((userId: string) => {
    setNewMessages((prevNewMessages) => {
      if (prevNewMessages[activeUser!.id]?.[userId] > 0) {
        const updatedMessages = {
          ...prevNewMessages,
          [activeUser!.id]: {
            ...prevNewMessages[activeUser!.id],
            [userId]: 0, // Сбрасываем счётчик только для активного пользователя и конкретного чата
          },
        };
        localStorage.setItem('newMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      }
      return prevNewMessages;
    });
  }, [activeUser]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Отправляем новое сообщение и обновляем счётчик только для получателя
  const handleSendMessage = (content: string) => {
    if (activeUser && chattingWith) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: activeUser.id,
        receiverId: chattingWith.id,
        content,
        timestamp: Date.now(),
      };

      // Добавляем новое сообщение в массив сообщений
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Обновляем счётчик новых сообщений только для получателя
      setNewMessages((prevNewMessages) => {
        const updatedNewMessages = {
          ...prevNewMessages,
          [chattingWith.id]: {
            ...prevNewMessages[chattingWith.id],
            [activeUser.id]: (prevNewMessages[chattingWith.id]?.[activeUser.id] || 0) + 1,
          },
        };

        localStorage.setItem('newMessages', JSON.stringify(updatedNewMessages));
        return updatedNewMessages;
      });

      // Обновляем последний активный чат только для этого чата
      setLastActiveChatId(chattingWith.id);
    }
  };

  // Получаем время последнего сообщения для сортировки чатов
  const getLastMessageTimeForUser = (userId: string) => {
    const userMessages = messages.filter(
      (msg) =>
        (msg.senderId === activeUser?.id && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === activeUser?.id)
    );

    if (userMessages.length > 0) {
      return Math.max(...userMessages.map((msg) => msg.timestamp));
    }
    return null;
  };

  return (
    <div className="App">
      {!activeUser ? (
        <UserSelection users={users} onUserSelect={setActiveUser} />
      ) : (
        <div className="chat-container">
          <ChatList
            users={users}
            activeUserId={activeUser.id}
            newMessages={newMessages[activeUser.id] || {}} // Передаем только сообщения для активного пользователя
            lastActiveChatId={lastActiveChatId}
            onChatSelect={setChattingWith}
            getLastMessageTimeForUser={getLastMessageTimeForUser}
          />
          {chattingWith && (
            <ChatWindow
              activeUser={activeUser}
              chattingWith={chattingWith}
              messages={messages.filter(
                (msg) =>
                  (msg.senderId === activeUser.id && msg.receiverId === chattingWith.id) ||
                  (msg.senderId === chattingWith.id && msg.receiverId === activeUser.id)
              )}
              onSendMessage={handleSendMessage}
              onClearNewMessages={handleClearNewMessages}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
