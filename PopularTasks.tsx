import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Instagram, 
  Youtube, 
  ClipboardList, 
  Smartphone, 
  Globe,
  ArrowRight,
  Loader2,
  ExternalLink,
  Play,
  Clock,
  Upload,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Task, TaskProof } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TasksProps {
  navigate: (_page: string) => void;
}

const categories = [
  { id: 'all', name: 'Tümü', icon: Filter },
  { id: 'Sosyal Medya', name: 'Sosyal Medya', icon: Instagram },
  { id: 'Video İzleme', name: 'Video', icon: Youtube },
  { id: 'Anket', name: 'Anket', icon: ClipboardList },
  { id: 'Uygulama', name: 'Uygulama', icon: Smartphone },
  { id: 'Kayıt', name: 'Kayıt', icon: Globe },
  { id: 'Link Tıklama', name: 'Link', icon: LinkIcon },
];

export default function Tasks({ navigate: _navigate }: TasksProps) {
  const { updateBalance, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'mytasks'>('available');
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myProofs, setMyProofs] = useState<TaskProof[]>([]);
  
  // Proof submission states
  const [proofDescription, setProofDescription] = useState('');
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Video watching states
  const [videoProgress, setVideoProgress] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadTasks();
    loadMyTasks();
    loadMyProofs();
  }, []);

  const loadTasks = () => {
    const allTasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');
    setTasks(allTasks.filter((t: Task) => t.status === 'active'));
    setFilteredTasks(allTasks.filter((t: Task) => t.status === 'active'));
  };

  const loadMyTasks = () => {
    const stored = JSON.parse(localStorage.getItem('gorevyap_mytasks') || '[]');
    setMyTasks(stored.filter((t: Task) => t.completedBy === user?.id));
  };

  const loadMyProofs = () => {
    const stored = JSON.parse(localStorage.getItem('gorevyap_proofs') || '[]');
    setMyProofs(stored.filter((p: TaskProof) => p.userId === user?.id));
  };

  useEffect(() => {
    let filtered = tasks;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTasks(filtered);
  }, [selectedCategory, searchQuery, tasks]);

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
    setVideoProgress(0);
    setVideoCompleted(false);
    setIsWatching(false);
    setProofDescription('');
    setProofPhoto(null);
    
    // For link tasks, auto-add balance after redirect
    if (task.taskType === 'link' && !task.requiresProof) {
      handleLinkTask(task);
    }
  };

  const handleLinkTask = (task: Task) => {
    // Open link in new tab
    if (task.taskLink) {
      window.open(task.taskLink, '_blank');
    }
    
    // Auto complete after 3 seconds
    setTimeout(() => {
      completeTask(task);
    }, 3000);
  };

  const startVideoWatch = () => {
    if (!selectedTask?.videoDuration) return;
    
    setIsWatching(true);
    const duration = selectedTask.videoDuration * 1000; // Convert to ms
    const interval = 100; // Update every 100ms
    let progress = 0;
    
    videoTimerRef.current = setInterval(() => {
      progress += interval;
      const percent = Math.min((progress / duration) * 100, 100);
      setVideoProgress(percent);
      
      if (progress >= duration) {
        if (videoTimerRef.current) clearInterval(videoTimerRef.current);
        setVideoCompleted(true);
        setIsWatching(false);
      }
    }, interval);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProof = async () => {
    if (!selectedTask || !proofDescription.trim()) return;
    
    setIsSubmittingProof(true);
    
    setTimeout(() => {
      const newProof: TaskProof = {
        id: Date.now(),
        taskId: selectedTask.id,
        userId: user?.id || 0,
        userName: user?.name || '',
        description: proofDescription,
        photoUrl: proofPhoto || undefined,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reward: selectedTask.reward,
      };

      const allProofs = JSON.parse(localStorage.getItem('gorevyap_proofs') || '[]');
      localStorage.setItem('gorevyap_proofs', JSON.stringify([newProof, ...allProofs]));

      // Add to my tasks as pending
      const pendingTask: Task = {
        ...selectedTask,
        status: 'pending',
        completedAt: new Date().toISOString(),
        completedBy: user?.id,
      };
      
      const myTasks = JSON.parse(localStorage.getItem('gorevyap_mytasks') || '[]');
      localStorage.setItem('gorevyap_mytasks', JSON.stringify([pendingTask, ...myTasks]));

      setIsSubmittingProof(false);
      setShowProofDialog(false);
      setIsTaskDialogOpen(false);
      loadMyTasks();
      loadMyProofs();
    }, 1500);
  };

  const completeTask = (task: Task) => {
    setIsCompleting(true);
    
    setTimeout(() => {
      updateBalance(task.reward);
      
      const newTask: Task = {
        ...task,
        status: 'completed',
        completedAt: new Date().toISOString(),
        completedBy: user?.id,
      };
      
      const myTasks = JSON.parse(localStorage.getItem('gorevyap_mytasks') || '[]');
      localStorage.setItem('gorevyap_mytasks', JSON.stringify([newTask, ...myTasks]));
      
      const allTasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');
      const updatedTasks = allTasks.filter((t: Task) => t.id !== task.id);
      localStorage.setItem('gorevyap_tasks', JSON.stringify(updatedTasks));
      
      setTasks(updatedTasks.filter((t: Task) => t.status === 'active'));
      setFilteredTasks(updatedTasks.filter((t: Task) => t.status === 'active'));
      
      setIsCompleting(false);
      setIsTaskDialogOpen(false);
      setSelectedTask(null);
      loadMyTasks();
    }, 1500);
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    
    if (selectedTask.taskType === 'video') {
      if (videoCompleted) {
        completeTask(selectedTask);
      }
    } else if (selectedTask.requiresProof) {
      setShowProofDialog(true);
    } else {
      completeTask(selectedTask);
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

  const getTaskTypeIcon = (taskType?: string) => {
    switch (taskType) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'link': return <ExternalLink className="w-4 h-4" />;
      default: return null;
    }
  };

  const getProofStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-yellow-600">Beklemede</Badge>;
      case 'approved': return <Badge variant="outline" className="text-green-600">Onaylandı</Badge>;
      case 'rejected': return <Badge variant="outline" className="text-red-600">Reddedildi</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Görevler</h1>
          <p className="text-gray-600">Sana uygun görevleri seç ve kazanmaya başla</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="available">Mevcut Görevler</TabsTrigger>
            <TabsTrigger value="mytasks">Görevlerim ({myTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Görev ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="whitespace-nowrap"
                >
                  <cat.icon className="w-4 h-4 mr-2" />
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <Card 
                  key={task.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleOpenTask(task)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(task.difficulty)}>
                          {getDifficultyText(task.difficulty)}
                        </Badge>
                        {task.taskType && (
                          <Badge variant="outline" className="text-violet-600">
                            {getTaskTypeIcon(task.taskType)}
                          </Badge>
                        )}
                      </div>
                      <span className="text-lg font-bold text-green-600">₺{task.reward}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{task.category}</Badge>
                      {task.taskType === 'link' && task.taskLink && (
                        <ExternalLink className="w-4 h-4 text-violet-600" />
                      )}
                      {task.taskType === 'video' && (
                        <Play className="w-4 h-4 text-violet-600" />
                      )}
                      {!task.taskType && <ArrowRight className="w-4 h-4 text-gray-400" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Görev Bulunamadı</h3>
                <p className="text-gray-600">Arama kriterlerine uygun görev bulunmuyor.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mytasks">
            {myTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Görev Yok</h3>
                <p className="text-gray-600">Tamamladığınız görevler burada görünecek.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => {
                  const proof = myProofs.find(p => p.taskId === task.id);
                  return (
                    <Card key={task.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">{task.title}</h3>
                              {task.status === 'completed' ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Tamamlandı
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-yellow-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Beklemede
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{task.category}</p>
                            <p className="text-xs text-gray-400">
                              {task.completedAt && new Date(task.completedAt).toLocaleDateString('tr-TR')}
                            </p>
                            {proof && (
                              <div className="mt-2">
                                {getProofStatusBadge(proof.status)}
                              </div>
                            )}
                          </div>
                          <span className="text-lg font-bold text-green-600">₺{task.reward}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              {selectedTask?.category} • {selectedTask && getDifficultyText(selectedTask.difficulty)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">{selectedTask?.description}</p>
            
            {/* Video Player */}
            {selectedTask?.taskType === 'video' && selectedTask.videoUrl && (
              <div className="space-y-3">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={selectedTask.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {!videoCompleted && !isWatching && (
                  <Button 
                    className="w-full bg-violet-600"
                    onClick={startVideoWatch}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    İzlemeye Başla
                  </Button>
                )}
                {isWatching && (
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-600 transition-all"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      İzleniyor... %{Math.round(videoProgress)}
                    </p>
                  </div>
                )}
                {videoCompleted && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Video tamamlandı! Görevi tamamlayabilirsiniz.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            {/* Link Task */}
            {selectedTask?.taskType === 'link' && selectedTask.taskLink && (
              <div className="p-4 bg-violet-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Görev Linki:</p>
                <a 
                  href={selectedTask.taskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline break-all"
                >
                  {selectedTask.taskLink}
                </a>
                {!selectedTask.requiresProof && (
                  <p className="text-sm text-gray-500 mt-2">
                    Linke tıkladıktan 3 saniye sonra bakiyeniz otomatik eklenecektir.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg">
              <span className="text-gray-600">Ödül</span>
              <span className="text-2xl font-bold text-violet-600">₺{selectedTask?.reward}</span>
            </div>
            
            {selectedTask?.requiresProof ? (
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={() => setShowProofDialog(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Kanıt Gönder
              </Button>
            ) : (
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleCompleteTask}
                disabled={isCompleting || (selectedTask?.taskType === 'video' && !videoCompleted)}
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Proof Submission Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Görev Kanıtı Gönder</DialogTitle>
            <DialogDescription>
              {selectedTask?.title} - Görev tamamlama kanıtınızı yükleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                placeholder="Görevi nasıl tamamladığınızı açıklayın..."
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Fotoğraf (Opsiyonel)</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {proofPhoto ? 'Fotoğraf Değiştir' : 'Fotoğraf Yükle'}
              </Button>
              {proofPhoto && (
                <div className="mt-2">
                  <img 
                    src={proofPhoto} 
                    alt="Proof" 
                    className="max-h-32 rounded-lg border"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowProofDialog(false)}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-violet-600"
                onClick={submitProof}
                disabled={!proofDescription.trim() || isSubmittingProof}
              >
                {isSubmittingProof ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Gönder'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
