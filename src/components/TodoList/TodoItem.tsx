import React from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Divider,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { format, isPast, isToday } from 'date-fns';
import type { Todo } from '../../types/Todo';
import { useTodo } from '../../hooks/useTodo';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

// Add helper function for due date display
const getDueDateDisplay = (dueDate?: string) => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    // Invalid date, don't render anything
    return null;
  }
  const isOverdue = isPast(date) && !isToday(date);
  const isTodayDue = isToday(date);

  return (
    <Chip
      label={format(date, 'PP')}
      size="small"
      color={isOverdue ? 'error' : isTodayDue ? 'warning' : 'default'}
      variant={isOverdue || isTodayDue ? 'filled' : 'outlined'}
      sx={{ ml: 1 }}
    />
  );
};

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          py: 1,
          borderLeft: todo.completed ? '4px solid green' : '4px solid transparent',
          '&:hover': {
            bgcolor: 'action.hover',
            cursor: 'pointer',
          },
        }}
        onClick={() => onEditClick(todo)}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={e => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            Delete
          </IconButton>
        }
      >
        <Checkbox
          edge="start"
          checked={todo.completed}
          onClick={e => {
            e.stopPropagation();
            toggleTodoCompletion(todo.id);
          }}
          color="primary"
          sx={{ mr: 1 }}
        />
        <ListItemText
          disableTypography
          primary={
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
                fontWeight: 500,
              }}
            >
              {todo.title}
            </Typography>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              >
                {todo.description}
              </Typography>
              {getDueDateDisplay(todo.dueDate)}
            </Box>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};
