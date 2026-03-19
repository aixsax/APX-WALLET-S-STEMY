import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  Gift,
  AtSign,
  CreditCard,
  Copy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Task } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DashboardProps {
  navigate: (page: string) => void;
}

export default function Dashboard({ navigate }: DashboardProps) {
  const { user, updateBalance } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const allTasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');
    setTasks(allTasks.filter((t: Task) => t.status === 'active').slice(0, 6));
    
    const completed = JSON.parse(localStorage.getItem('gorevyap_mytasks') || '[]');
    setMyTasks(completed);
  }, []);

  const handleCompleteTask = () => {
    if (selectedTask) {
      setIsCompleting(true);
      
      setTimeout(() => {
        updateBalance(selectedTask.reward);
        
        const newTask: Task = {
          ...selectedTask,
          status: 'completed',
          completedAt: new Date().toISOString(),
          completedBy: user?.id,
        };
        
        const updatedMyTasks = [newTask, ...myTasks];
        setMyTasks(updatedMyTasks);
        localStorage.setItem('gorevyap_mytasks', JSON.stringify(updatedMyTasks));
        
        const allTasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');
        const updatedTasks = allTasks.filter((t: Task) => t.id !== selectedTask.id);
        localStorage.setItem('gorevyap_tasks', JSON.stringify(updatedTasks));
        setTasks(updatedTasks.filter((t: Task) => t.status === 'active').slice(0, 6));
        
        setIsCompleting(false);
        setIsTaskDialogOpen(false);
        setSelectedTask(null);
      }, 1500);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return difficulty;
    }
  };

  const stats = [
    { 
      icon: Wallet, 
      label: 'Toplam Bakiye', 
      value: `₺${user?.balance.toFixed(2)}`,
      color: 'bg-violet-100 text-violet-600'
    },
    { 
      icon: CheckCircle, 
      label: 'Tamamlanan Görev', 
      value: myTasks.length.toString(),
      color: 'bg-green-100 text-green-600'
    },
    { 
      icon: Clock, 
      label: 'Bekleyen Görev', 
      value: '0',
      color: 'bg-yellow-100 text-yellow-600'
    },
    { 
      icon: TrendingUp, 
      label: 'Bugün Kazanç', 
      value: `₺${myTasks.filter(t => {
        const today = new Date().toDateString();
        const completedDate = t.completedAt ? new Date(t.completedAt).toDateString() : '';
        return completedDate === today;
      }).reduce((sum, t) => sum + t.reward, 0).toFixed(2)}`,
      color: 'bg-blue-100 text-blue-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Hoş Geldin, {user?.name}!</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <p className="text-gray-600">Bugün kazanmaya hazır mısın?</p>
            {user?.username && (
              <div className="flex items-center gap-2 text-sm">
                <AtSign className="w-4 h-4 text-violet-600" />
                <span className="text-gray-700">@{user.username}</span>
              </div>
            )}
            {user?.axId && (
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-violet-600" />
                <span className="text-gray-500 font-mono">{user.axId.substring(0, 10)}...</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.axId || '');
                  }}
                  className="text-violet-600 hover:text-violet-700"
                  title="Kopyala"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Mevcut Görevler</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('tasks')}
                >
                  Tümünü Gör
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Şu anda aktif görev bulunmuyor.</p>
                    <p className="text-sm">Yeni görevler eklendiğinde bildirim alacaksınız.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsTaskDialogOpen(true);
                        }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <Badge className={getDifficultyColor(task.difficulty)}>
                              {getDifficultyText(task.difficulty)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="text-lg font-bold text-green-600">+₺{task.reward}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  onClick={() => navigate('wallet')}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Para Çek
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('tasks')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Görev Bul
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
              <CardContent className="p-6">
                <Gift className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Arkadaşını Davet Et</h3>
                <p className="text-sm text-white/80 mb-4">
                  Her davet için ₺10 kazan. Ne kadar çok davet, o kadar çok kazanç!
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => navigate('profile')}
                >
                  Davet Kodunu Al
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {myTasks.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Son Tamamlanan Görevler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-xl"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">
                        {task.completedAt && new Date(task.completedAt).toLocaleDateString('tr-TR')} tamamlandı
                      </p>
                    </div>
                    <span className="text-lg font-bold text-green-600">+₺{task.reward}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              {selectedTask?.category} • {selectedTask && getDifficultyText(selectedTask.difficulty)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">{selectedTask?.description}</p>
            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg">
              <span className="text-gray-600">Ödül</span>
              <span className="text-2xl font-bold text-violet-600">₺{selectedTask?.reward}</span>
            </div>
            <Button 
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={handleCompleteTask}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tamamlanıyor...
                </>
              ) : (
                'Görevi Tamamla'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
