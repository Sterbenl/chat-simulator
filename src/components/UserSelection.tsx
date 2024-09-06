import React, { useState, useEffect } from 'react';
import { User } from '../models/User';

interface UserSelectionProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({ users, onUserSelect }) => {
  const [recentUsers, setRecentUsers] = useState<User[]>([]); // Последние 3 выбранных пользователя
  const [showAllUsers, setShowAllUsers] = useState<boolean>(false); // Показать всех пользователей

  // Загружаем последние выбранные пользователи из localStorage при загрузке страницы
  useEffect(() => {
    const storedRecentUsers = localStorage.getItem('recentUsers');
    if (storedRecentUsers) {
      setRecentUsers(JSON.parse(storedRecentUsers));
    }
  }, []);

  const handleUserSelect = (user: User) => {
    // Обновляем список последних 3 пользователей, добавляя нового пользователя вперед и удаляя дубликаты
    const updatedRecentUsers = [user, ...recentUsers.filter((u) => u.id !== user.id)].slice(0, 3);
    setRecentUsers(updatedRecentUsers); // Обновляем состояние последних пользователей

    // Сохраняем последние выбранные пользователи в localStorage
    localStorage.setItem('recentUsers', JSON.stringify(updatedRecentUsers));

    onUserSelect(user);
  };

  return (
    <div className="user-selection-container">
      <h2>Выбор аккаунта</h2>

      {/* Последние 3 пользователя */}
      {recentUsers.length > 0 && (
        <div>
          <h3>Последние пользователи</h3>
          <ul className="user-list">
            {recentUsers.map((user) => (
              <li key={user.id} className="user-list-item" onClick={() => handleUserSelect(user)}>
                <span></span>
                <p>{user.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Кнопка "Другой аккаунт" */}
      <button onClick={() => setShowAllUsers(!showAllUsers)}>
        {showAllUsers ? 'Скрыть остальных пользователей' : 'Другой аккаунт'}
      </button>

      {/* Остальные пользователи */}
      {showAllUsers && (
        <ul className="user-list">
          {users
            .filter((user) => !recentUsers.some((u) => u.id === user.id))
            .map((user) => (
              <li key={user.id} className="user-list-item" onClick={() => handleUserSelect(user)}>
                <span></span>
                <p>{user.name}</p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default UserSelection;
