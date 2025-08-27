# Implementation Plan: Add Due Date Field to Todos

**Jira Ticket**: [AIADT-69](https://diligentbrands.atlassian.net/browse/AIADT-69)

## Objective and Non-goals

### Objective

Extend the Todo application to support optional due dates for tasks, enabling better prioritization and time management for users.

### Non-goals

- Reminder notifications, calendar sync, or automatic sorting
- API/backend persistence (future work)
- Complex date/time zone handling beyond client-local formatting

## Architecture/Design Overview

This implementation extends the existing Todo data model and UI to support optional due dates using:

- **Data Model**: Add `dueDate?: string` (ISO 8601 format) to the `Todo` interface
- **UI Components**: Integrate `@mui/x-date-pickers` DatePicker in create/edit modal
- **Display**: Show formatted due dates in TodoItem with visual indicators for overdue items
- **Persistence**: Extend existing sessionStorage pattern (if implemented) to include due dates
- **Validation**: Basic date validation to prevent obviously invalid dates

## Detailed Steps

### Task 1: Install Required Dependencies

**Status**: TODO  
**Depends On**: None  
**Description**:
Install `@mui/x-date-pickers` and `date-fns` packages needed for date picker functionality and date formatting.

**Code Snippets**:

```bash
npm install @mui/x-date-pickers date-fns
npm install --save-dev @types/date-fns
```

**Verification**:

- Dependencies are added to package.json
- No installation errors occur
- TypeScript types are available

### Task 2: Update Todo Data Model

**Status**: TODO  
**Depends On**: None  
**Description**:
Extend the Todo interface to include an optional dueDate field using ISO 8601 string format.

**Code Snippets**:

```typescript
// src/types/Todo.ts
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: string; // ISO 8601 format string
}
```

**Verification**:

- Todo interface includes dueDate field
- Field is optional (using ? syntax)
- TypeScript compilation succeeds

### Task 3: Setup Date Picker Provider

**Status**: TODO  
**Depends On**: [1]  
**Description**:
Wrap the application in LocalizationProvider from @mui/x-date-pickers with AdapterDateFns to enable date picker functionality.

**Code Snippets**:

```typescript
// src/main.tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <App />
    </LocalizationProvider>
  </StrictMode>
);
```

**Verification**:

- LocalizationProvider wraps the App component
- Date picker components can be used without errors
- Application still starts successfully

### Task 4: Update TodoContext for Due Date Support

**Status**: TODO  
**Depends On**: [2]  
**Description**:
Modify addTodo and editTodo functions in TodoContext to handle optional due dates and update function signatures.

**Code Snippets**:

```typescript
// src/contexts/TodoContext.tsx
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
```

**Verification**:

- addTodo accepts optional dueDate parameter
- editTodo supports updating dueDate through Partial<Todo>
- Existing functionality remains unchanged
- TypeScript compilation succeeds

### Task 5: Update TodoModal with Date Picker

**Status**: TODO  
**Depends On**: [3, 4]  
**Description**:
Add DatePicker component to TodoModal for selecting due dates during creation and editing, with proper form state management and validation.

**Code Snippets**:

```typescript
// src/components/TodoModal/TodoModal.tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Add to component state
const [dueDate, setDueDate] = useState<Date | null>(null);

// In useEffect for loading initial values
useEffect(() => {
  if (isOpen) {
    if (mode === 'edit' && initialValues) {
      // ... existing code ...
      setDueDate(initialValues.dueDate ? new Date(initialValues.dueDate) : null);
    } else {
      // ... existing code ...
      setDueDate(null);
    }
    setTitleError('');
  }
}, [isOpen, mode, initialValues]);

// In handleSubmit
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  const dueDateString = dueDate ? dueDate.toISOString() : undefined;

  if (mode === 'create') {
    addTodo(title.trim(), description.trim(), dueDateString);
  } else if (mode === 'edit' && initialValues) {
    editTodo(initialValues.id, {
      title: title.trim(),
      description: description.trim(),
      completed,
      dueDate: dueDateString,
    });
  }
  onClose();
};

// Add DatePicker to form
<DatePicker
  label="Due Date (Optional)"
  value={dueDate}
  onChange={(newValue) => setDueDate(newValue)}
  slotProps={{
    textField: {
      fullWidth: true,
      inputProps: { 'data-testid': 'due-date-picker' }
    }
  }}
/>
```

**Verification**:

- DatePicker appears in both create and edit modes
- Form handles due date state correctly
- Date validation prevents obviously invalid dates
- Optional nature is preserved (can be left empty)

### Task 6: Update TodoItem to Display Due Date

**Status**: TODO  
**Depends On**: [2]  
**Description**:
Modify TodoItem component to display formatted due dates and add visual indicators for overdue items.

**Code Snippets**:

```typescript
// src/components/TodoList/TodoItem.tsx
import { format, isPast, isToday } from 'date-fns';
import { Chip } from '@mui/material';

// Add helper function for due date display
const getDueDateDisplay = (dueDate?: string) => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
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

// Update ListItemText secondary content
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
```

**Verification**:

- Due dates display with proper formatting
- Overdue items show with error color
- Today's due dates show with warning color
- Layout remains clean and responsive
- No due date items display normally

### Task 7: Implement Session Storage for Due Dates

**Status**: TODO  
**Depends On**: [4]  
**Description**:
Extend TodoContext to persist due dates in sessionStorage with proper serialization/deserialization and backward compatibility.

**Code Snippets**:

```typescript
// src/contexts/TodoContext.tsx
const STORAGE_KEY = 'todos';

// Load from sessionStorage on initialization
const [todos, setTodos] = useState<Todo[]>(() => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((todo: any) => ({
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

// Save to sessionStorage whenever todos change
useEffect(() => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.warn('Failed to save todos to session storage:', error);
    // Could add toast notification here for storage quota exceeded
  }
}, [todos]);
```

**Verification**:

- Due dates persist across page refreshes
- Legacy todos without dueDate load correctly
- Storage errors are handled gracefully
- No data corruption occurs

### Task 8: Update TodoModal Props and Interface

**Status**: TODO  
**Depends On**: [2, 5]  
**Description**:
Update TodoModal props interface to include dueDate in initialValues for proper editing support.

**Code Snippets**:

```typescript
// src/components/TodoModal/TodoModal.tsx
interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialValues?: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate?: string; // Add dueDate to interface
  };
}
```

**Verification**:

- Interface includes dueDate field
- Edit mode properly loads existing due dates
- TypeScript compilation succeeds

## Data/Schema Changes and Migrations

- **Todo Interface**: Added optional `dueDate?: string` field
- **Session Storage**: Extended serialization to include dueDate with backward compatibility
- **Migration Strategy**: Existing stored todos without dueDate field remain valid (undefined is acceptable)

## API Contracts and External Integrations

- **@mui/x-date-pickers**: DatePicker component integration
- **date-fns**: Date formatting and manipulation utilities
- **Session Storage**: Extended data structure with backward compatibility

## Feature Flags/Config Changes

No feature flags required - this is a straightforward feature addition.

## Tests (Unit/Integration/E2E) and Test Data

### Task 9: Update Unit Tests

**Status**: TODO  
**Depends On**: [2, 4, 5, 6]  
**Description**:
Update existing unit tests and add new test cases for due date functionality across all affected components.

**Test Coverage Required**:

- TodoModal: Due date picker functionality, form submission with/without due date
- TodoItem: Due date display, overdue indicator, formatting
- TodoContext: addTodo with due date, editTodo with due date updates
- Session storage: Persistence and backward compatibility

**Code Snippets**:

```typescript
// Example test cases
describe('TodoModal due date functionality', () => {
  test('allows creating todo with due date', () => {
    // Test creating todo with selected due date
  });

  test('allows creating todo without due date', () => {
    // Test creating todo with no due date selected
  });

  test('loads existing due date when editing', () => {
    // Test editing existing todo with due date
  });
});

describe('TodoItem due date display', () => {
  test('displays formatted due date when present', () => {
    // Test due date formatting and display
  });

  test('shows overdue indicator for past dates', () => {
    // Test overdue visual indicator
  });
});
```

**Verification**:

- All existing tests pass
- New due date functionality is covered by tests
- Test coverage meets or exceeds existing baseline
- Edge cases are tested (invalid dates, missing dates)

## Telemetry/Monitoring

No special telemetry required for this feature. Standard client-side error handling applies.

## Risks, Edge Cases, Rollback

### Risks

- **Storage Quota**: Session storage might exceed limits with additional data
- **Date Parsing**: Invalid date strings could cause errors
- **Browser Compatibility**: Date picker component compatibility

### Edge Cases

- **Invalid Dates**: Malformed ISO strings handled gracefully
- **Missing Due Dates**: Undefined/null values handled properly
- **Time Zones**: Client-local formatting prevents most issues
- **Storage Failure**: Graceful degradation if session storage fails

### Rollback Strategy

- **Data Migration**: No destructive changes - can safely remove dueDate field
- **UI Rollback**: Simply remove date picker components and revert Todo interface
- **Storage Rollback**: Existing data structure remains valid without dueDate

## Acceptance Criteria Mapping to Tasks

| Acceptance Criteria                                   | Mapped Tasks | Verification                                    |
| ----------------------------------------------------- | ------------ | ----------------------------------------------- |
| User can optionally pick due date when creating       | Task 5       | DatePicker in create mode                       |
| Existing todos without due date remain unaffected     | Task 2, 7    | Backward compatibility in interface and storage |
| Editing todo shows current due date and allows change | Task 5, 8    | Edit mode with proper initial values            |
| Due date shows in todo item list                      | Task 6       | Visual display in TodoItem                      |
| Validation prevents invalid dates                     | Task 5       | DatePicker validation                           |
| Data persists after page refresh                      | Task 7       | Session storage implementation                  |
| Legacy stored data loads correctly                    | Task 7       | Backward compatibility in storage               |
| All unit tests pass and coverage ≥ baseline           | Task 9       | Comprehensive test coverage                     |

## Implementation Notes

1. **Dependency Installation**: Start with Task 1 to install required packages
2. **Data Model First**: Update Todo interface before any UI changes
3. **Provider Setup**: Ensure LocalizationProvider is configured before using DatePicker
4. **Backward Compatibility**: All storage changes must support existing data
5. **Testing**: Update tests incrementally as each component is modified
6. **Optional Field**: Maintain the optional nature of due dates throughout implementation

## Execution Order

Recommended execution order based on dependencies:

1. Task 1 (Install Dependencies)
2. Task 2 (Update Data Model)
3. Task 3 (Setup Provider)
4. Task 4 (Update Context)
5. Task 8 (Update Modal Props)
6. Task 5 (Update Modal UI)
7. Task 6 (Update TodoItem Display)
8. Task 7 (Session Storage)
9. Task 9 (Update Tests)
