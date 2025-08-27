import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';

const STORAGE_KEY = 'todos';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from sessionStorage on initialization (skip in test environment)
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Skip session storage in test environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return [];
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((todo: Todo & { createdAt: string }) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          // Ensure backward compatibility - existing todos without dueDate remain valid
          dueDate: todo.dueDate || undefined,
        }));
      }
    } catch (error) {
      console.warn('Failed to load todos from session storage:', error);
    }
    return [];
  });

  const addTodo = (title: string, description: string, dueDate?: string) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
      dueDate, // Include dueDate if provided
    };
    setTodos([...todos, newTodo]);
  };

  const editTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, ...updates } : todo)));
  };

  const toggleTodoCompletion = (id: string) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Save to sessionStorage whenever todos change (skip in test environment)
  useEffect(() => {
    // Skip session storage in test environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.warn('Failed to save todos to session storage:', error);
      // Could add toast notification here for storage quota exceeded
    }
  }, [todos]);

  return (
    <TodoContext.Provider value={{ todos, addTodo, editTodo, toggleTodoCompletion, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
