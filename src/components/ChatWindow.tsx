import React, { useState, useEffect, useRef } from 'react';
import { User } from '../models/User';
import { Message } from '../models/Message';

interface ChatWindowProps {
  activeUser: User;
  chattingWith: User;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClearNewMessages: (userId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  activeUser,
  chattingWith,
  messages,
  onSendMessage,
  onClearNewMessages,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);

  // Прокручиваем вниз, если пользователь не прокрутил чат вверх
  useEffect(() => {
    if (!isScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledUp]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
      setIsScrolledUp(false); // Прокручиваем чат вниз после отправки сообщения
    }
  };

  // Очищаем новые сообщения при открытии чата, если есть новые сообщения
  useEffect(() => {
    if (chattingWith) {
      console.log(`Clearing new messages for user: ${chattingWith.id}`);
      onClearNewMessages(chattingWith.id); // Сбрасываем новые сообщения при открытии чата
    }
  }, [chattingWith, onClearNewMessages]);

  // Функция для форматирования времени отправки
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Часы:Минуты
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ padding: '20px 20px', borderBottom: '1px solid #ddd' }}>{chattingWith.name}</h2>
      <div
        className="messages"
        style={{ padding: '20px', flexGrow: 1, overflowY: 'auto' }}
        onScroll={() => {
          if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            setIsScrolledUp(scrollTop + clientHeight < scrollHeight);
          }
        }}
        ref={messagesContainerRef}
      >
        {messages.map((msg) => (
       <div
       key={msg.id}
       className={msg.senderId === activeUser.id ? 'my-message' : 'their-message'}
     >
       <div className="message-content">
         {msg.content}
       </div>
       <small className="message-timestamp">
         {formatTimestamp(msg.timestamp)}
       </small>
     </div>
     
      
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          placeholder="Написать сообщение..."
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </div>
  );
};

export default ChatWindow;
