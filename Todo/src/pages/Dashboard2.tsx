import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  Star,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  Target,
  Folder,
  User,
  LogOut
} from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: Date;
  completedAt?: Date;
  starred: boolean;
}

interface User {
  name: string;
  email: string;
  avatar: string;
}

const Dashboard = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'starred'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const [dueDate, setDueDate] = useState<string>('');
  const { toast } = useToast();

  const [user] = useState<User>({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD'
  });

  const categories = ['General', 'Work', 'Personal', 'Shopping', 'Health', 'Study'];

  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem('dashboard-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      setTodos(parsedTodos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      })));
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a task",
        variant: "destructive",
      });
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      priority: selectedPriority,
      category: selectedCategory,
      dueDate: dueDate || undefined,
      createdAt: new Date(),
      starred: false,
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
    setDueDate('');
    toast({
      title: "Success",
      description: "Task added successfully!",
    });
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date() : undefined
          }
        : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast({
      title: "Deleted",
      description: "Task deleted successfully",
    });
  };

  const toggleStar = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, starred: !todo.starred } : todo
    ));
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = () => {
    if (editValue.trim() === '') return;
    
    setTodos(todos.map(todo => 
      todo.id === editingId ? { ...todo, text: editValue.trim() } : todo
    ));
    setEditingId(null);
    setEditValue('');
  };

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed) ||
      (filter === 'starred' && todo.starred);
    
    const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesCategory && matchesSearch;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    starred: todos.filter(t => t.starred).length,
    overdue: todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length,
  };

  const exportTodos = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todos-export.json';
    link.click();
    toast({ title: "Success", description: "Todos exported successfully!" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportTodos} className="animate-fade-in hover-scale">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="destructive" size="sm" className="animate-fade-in hover-scale">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Modern Stats */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-foreground">
                <span className="text-lg font-bold text-primary">{stats.total}</span> Total Tasks
              </span>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/10 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-foreground">
                <span className="text-lg font-bold text-green-600">{stats.completed}</span> Completed
              </span>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/5 border border-orange-500/10 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-foreground">
                <span className="text-lg font-bold text-orange-600">{stats.pending}</span> Pending
              </span>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium text-foreground">
                <span className="text-lg font-bold text-yellow-600">{stats.starred}</span> Starred
              </span>
            </div>
            
            {stats.overdue > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-foreground">
                  <span className="text-lg font-bold text-red-600">{stats.overdue}</span> Overdue
                </span>
              </div>
            )}
          </div>
        </div>


        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Add Todo Form */}
          <div className="lg:col-span-1">
            <Card className="animate-fade-in rounded-xl border-border/20 bg-card/60 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="What needs to be done?"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {category}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low Priority</SelectItem>
                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                    <SelectItem value="high">🔴 High Priority</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="Due date (optional)"
                />
                
                <Button onClick={addTodo} className="w-full hover-scale transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Todo List */}
          <div className="lg:col-span-3">
            <Card className="animate-fade-in rounded-xl border-border/20 bg-card/60 backdrop-blur-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Your Tasks</CardTitle>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All ({todos.length})</TabsTrigger>
                    <TabsTrigger value="active">Active ({stats.pending})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
                    <TabsTrigger value="starred">Starred ({stats.starred})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTodos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}
                    </div>
                  ) : (
                    filteredTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in ${
                          todo.completed 
                            ? 'bg-muted/30 border-muted/30' 
                            : 'bg-background/80 border-border/30 hover:border-primary/30 hover:bg-background/90'
                        }`}
                      >
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className="flex-shrink-0 mt-1"
                        >
                          {todo.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          {editingId === todo.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                onBlur={saveEdit}
                                autoFocus
                                className="text-sm"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {todo.text}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getPriorityColor(todo.priority)} variant="secondary">
                                  {todo.priority}
                                </Badge>
                                <Badge variant="outline">
                                  <Folder className="w-3 h-3 mr-1" />
                                  {todo.category}
                                </Badge>
                                {todo.dueDate && (
                                  <Badge variant={new Date(todo.dueDate) < new Date() && !todo.completed ? "destructive" : "secondary"}>
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {todo.dueDate}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStar(todo.id)}
                            className="h-8 w-8 p-0 hover-scale rounded-lg"
                          >
                            <Star className={`w-4 h-4 transition-colors ${todo.starred ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(todo.id, todo.text)}
                            className="h-8 w-8 p-0 hover-scale rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTodo(todo.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover-scale rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;