import { useEffect, useState } from 'react';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  // Load todos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('todos');
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load todos from localStorage:', e);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([newTodo, ...todos]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // Filter todos based on current filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.filter((todo) => !todo.completed).length;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl tracking-tight mb-2">Ma liste de tâches</h1>
          <p className="text-muted-foreground">Gérez vos tâches en local, elles sont sauvegardées automatiquement</p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg">
          {/* Input section */}
          <div className="border-b border-border p-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ajouter une nouvelle tâche..."
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={addTodo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 border-b border-border px-6 pt-4">
            {[
              { id: 'all', label: 'Tous', count: todos.length },
              { id: 'active', label: 'En cours', count: activeCount },
              { id: 'completed', label: 'Complétés', count: completedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filter === tab.id
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Todos list */}
          <div className="divide-y divide-border">
            {filteredTodos.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-2">
                  {todos.length === 0
                    ? 'Aucune tâche pour le moment'
                    : filter === 'completed'
                    ? 'Aucune tâche complétée'
                    : 'Aucune tâche en cours'}
                </p>
                {todos.length === 0 && (
                  <p className="text-sm text-muted-foreground/70">Ajoutez votre première tâche pour commencer</p>
                )}
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm transition ${
                      todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {todo.text}
                  </span>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {todos.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-sm text-muted-foreground">
                {activeCount} {activeCount === 1 ? 'tâche' : 'tâches'} restante{activeCount !== 1 ? 's' : ''}
              </p>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-sm text-muted-foreground hover:text-destructive transition"
                >
                  Effacer les complétées
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{todos.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total de tâches</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-accent">{activeCount}</p>
              <p className="text-xs text-muted-foreground mt-1">En cours</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-success">{completedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Complétées</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
