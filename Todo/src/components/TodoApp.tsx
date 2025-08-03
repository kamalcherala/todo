import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit3, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
}

type FilterType = 'all' | 'active' | 'completed';

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todoapp-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      // Convert date strings back to Date objects
      const todosWithDates = parsedTodos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      }));
      setTodos(todosWithDates);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todoapp-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
      };
      setTodos([newTodo, ...todos]);
      setInputValue('');
      toast({
        title: "Todo Added! ✨",
        description: "Your new task has been added successfully.",
      });
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const updatedTodo = {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date() : undefined
        };
        
        if (!todo.completed) {
          toast({
            title: "Task Completed! 🎉",
            description: "Great job on finishing your task!",
          });
        }
        
        return updatedTodo;
      }
      return todo;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast({
      title: "Todo Deleted",
      description: "Task has been removed from your list.",
      variant: "destructive",
    });
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = () => {
    if (editValue.trim() && editingId) {
      setTodos(todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editValue.trim() } : todo
      ));
      setEditingId(null);
      setEditValue('');
      toast({
        title: "Todo Updated! ✏️",
        description: "Your task has been updated successfully.",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const togglePriority = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(todo.priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        return { ...todo, priority: priorities[nextIndex] };
      }
      return todo;
    }));
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.filter(todo => !todo.completed).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-black';
      case 'low':
        return 'bg-success text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            TodoWeb
          </h1>
          <p className="text-xl text-muted-foreground">
            Organize your life with style ✨
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <Card className="p-6 glass-effect hover-lift">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{todos.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
          </Card>
          <Card className="p-6 glass-effect hover-lift">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">{activeCount}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </Card>
          <Card className="p-6 glass-effect hover-lift">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </Card>
        </div>

        {/* Add Todo */}
        <Card className="p-6 mb-8 glass-effect animate-scale-in">
          <div className="flex gap-4">
            <Input
              placeholder="What needs to be done? ✨"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1 text-lg border-0 bg-muted/50 focus:bg-muted/80 transition-all"
            />
            <Button
              onClick={addTodo}
              className="gradient-primary hover-glow px-8"
              disabled={!inputValue.trim()}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              onClick={() => setFilter(filterType)}
              className="capitalize hover-lift"
            >
              <Filter className="w-4 h-4 mr-2" />
              {filterType}
            </Button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <Card className="p-12 text-center glass-effect">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No todos yet!</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "Add your first task to get started"
                  : filter === 'active'
                  ? "No active tasks - you're all caught up!"
                  : "No completed tasks yet - keep going!"
                }
              </p>
            </Card>
          ) : (
            filteredTodos.map((todo, index) => (
              <Card
                key={todo.id}
                className={`p-4 glass-effect hover-lift transition-all duration-300 animate-slide-up ${
                  todo.completed ? 'opacity-75' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTodo(todo.id)}
                    className={`p-2 rounded-full transition-all ${
                      todo.completed
                        ? 'bg-success text-white hover:bg-success/80'
                        : 'border-2 border-muted hover:border-primary'
                    }`}
                  >
                    {todo.completed && <Check className="w-4 h-4" />}
                  </Button>

                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveEdit} className="gradient-primary">
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`text-lg font-medium transition-all ${
                            todo.completed
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {todo.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs cursor-pointer hover-lift ${getPriorityColor(todo.priority)}`}
                            onClick={() => togglePriority(todo.id)}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {todo.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {todo.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editingId !== todo.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(todo.id, todo.text)}
                        className="hover:bg-info/20 hover:text-info"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="text-center mt-12 text-muted-foreground animate-fade-in">
            <p>
              {completedCount > 0 && (
                <>
                  🎉 You've completed {completedCount} task{completedCount !== 1 ? 's' : ''}! 
                  {activeCount > 0 && ` ${activeCount} more to go.`}
                </>
              )}
              {completedCount === 0 && activeCount > 0 && (
                <>💪 You have {activeCount} task{activeCount !== 1 ? 's' : ''} to complete!</>
              )}
              {activeCount === 0 && completedCount > 0 && (
                <>🎊 All done! Great job completing everything!</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;