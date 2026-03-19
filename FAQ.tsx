import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  ExternalLink,
  Eye
} from 'lucide-react';
import type { Task, TaskProof } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  'Sosyal Medya',
  'Video İzleme',
  'Anket',
  'Uygulama',
  'Kayıt',
  'Yorum',
  'Link Tıklama',
];

const difficulties = [
  { value: 'easy', label: 'Kolay' },
  { value: 'medium', label: 'Orta' },
  { value: 'hard', label: 'Zor' },
];

const taskTypes = [
  { value: 'standard', label: 'Standart' },
  { value: 'link', label: 'Link Tıklama' },
  { value: 'video', label: 'Video İzleme' },
];

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proofs, setProofs] = useState<TaskProof[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProof, setSelectedProof] = useState<TaskProof | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    reward: '',
    difficulty: 'easy',
    taskType: 'standard',
    taskLink: '',
    videoUrl: '',
    videoDuration: '300',
    requiresProof: false,
  });

  useEffect(() => {
    loadTasks();
    loadProofs();
  }, []);

  const loadTasks = () => {
    const allTasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');
    setTasks(allTasks);
  };

  const loadProofs = () => {
    const allProofs = JSON.parse(localStorage.getItem('gorevyap_proofs') || '[]');
    setProofs(allProofs.filter((p: TaskProof) => p.status === 'pending'));
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (task?: Task) => {
    setError('');
    setSuccess('');
    
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        category: task.category,
        reward: task.reward.toString(),
        difficulty: task.difficulty,
        taskType: task.taskType || 'standard',
        taskLink: task.taskLink || '',
        videoUrl: task.videoUrl || '',
        videoDuration: task.videoDuration?.toString() || '300',
        requiresProof: task.requiresProof || false,
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        category: categories[0],
        reward: '',
        difficulty: 'easy',
        taskType: 'standard',
        taskLink: '',
        videoUrl: '',
        videoDuration: '300',
        requiresProof: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.reward) {
      setError('Tüm alanları doldurun');
      return;
    }

    const reward = parseFloat(formData.reward);
    if (reward <= 0) {
      setError('Geçerli bir ödül tutarı girin');
      return;
    }

    if (formData.taskType === 'link' && !formData.taskLink.trim()) {
      setError('Link görevi için URL girin');
      return;
    }

    if (formData.taskType === 'video' && !formData.videoUrl.trim()) {
      setError('Video görevi için video URL girin');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const allTasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');

      if (selectedTask) {
        const updated = allTasks.map((t: Task) => 
          t.id === selectedTask.id 
            ? { 
                ...t, 
                title: formData.title,
                description: formData.description,
                category: formData.category,
                reward,
                difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
                taskType: formData.taskType as 'standard' | 'link' | 'video',
                taskLink: formData.taskLink || undefined,
                videoUrl: formData.videoUrl || undefined,
                videoDuration: parseInt(formData.videoDuration) || 300,
                requiresProof: formData.requiresProof,
              }
            : t
        );
        localStorage.setItem('gorevyap_tasks', JSON.stringify(updated));
        setSuccess('Görev başarıyla güncellendi');
      } else {
        const newTask: Task = {
          id: Date.now(),
          title: formData.title,
          description: formData.description,
          category: formData.category,
          reward,
          difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
          status: 'active',
          taskType: formData.taskType as 'standard' | 'link' | 'video',
          taskLink: formData.taskLink || undefined,
          videoUrl: formData.videoUrl || undefined,
          videoDuration: parseInt(formData.videoDuration) || 300,
          requiresProof: formData.requiresProof,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('gorevyap_tasks', JSON.stringify([newTask, ...allTasks]));
        setSuccess('Görev başarıyla oluşturuldu');
      }

      setIsSaving(false);
      setIsDialogOpen(false);
      loadTasks();
    }, 1000);
  };

  const handleDelete = () => {
    if (!selectedTask) return;

    setIsSaving(true);

    setTimeout(() => {
      const allTasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');
      const updated = allTasks.filter((t: Task) => t.id !== selectedTask.id);
      localStorage.setItem('gorevyap_tasks', JSON.stringify(updated));

      setIsSaving(false);
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      loadTasks();
    }, 1000);
  };

  const handleApproveProof = (approved: boolean) => {
    if (!selectedProof) return;

    const allProofs = JSON.parse(localStorage.getItem('gorevyap_proofs') || '[]');
    const updatedProofs = allProofs.map((p: TaskProof) => 
      p.id === selectedProof.id 
        ? { 
            ...p, 
            status: approved ? 'approved' : 'rejected',
            processedAt: new Date().toISOString(),
          }
        : p
    );
    localStorage.setItem('gorevyap_proofs', JSON.stringify(updatedProofs));

    // If approved, add balance to user
    if (approved) {
      const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === selectedProof.userId 
          ? { ...u, balance: u.balance + selectedProof.reward }
          : u
      );
      localStorage.setItem('gorevyap_users', JSON.stringify(updatedUsers));

      // Update mytasks status
      const myTasks = JSON.parse(localStorage.getItem('gorevyap_mytasks') || '[]');
      const updatedMyTasks = myTasks.map((t: Task) => 
        t.id === selectedProof.taskId && t.completedBy === selectedProof.userId
          ? { ...t, status: 'completed' }
          : t
      );
      localStorage.setItem('gorevyap_mytasks', JSON.stringify(updatedMyTasks));

      // Add transaction
      const transactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
      const newTransaction = {
        id: Date.now(),
        userId: selectedProof.userId,
        userName: selectedProof.userName,
        type: 'deposit',
        amount: selectedProof.reward,
        status: 'approved',
        method: 'Görev Ödülü',
        accountInfo: `Görev #${selectedProof.taskId}`,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('gorevyap_transactions', JSON.stringify([newTransaction, ...transactions]));
    }

    setIsProofDialogOpen(false);
    loadProofs();
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Görev Yönetimi</h1>
            <p className="text-gray-600">Görevleri ekle, düzenle ve sil</p>
          </div>
          <Button 
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Görev Ekle
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
            <TabsTrigger value="proofs">
              Onay Bekleyenler
              {proofs.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{proofs.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Görev ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Görev</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Tip</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Zorluk</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Ödül</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{task.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{task.category}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {getTaskTypeIcon(task.taskType)}
                              <span className="text-sm">
                                {task.taskType === 'link' ? 'Link' : task.taskType === 'video' ? 'Video' : 'Standart'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getDifficultyColor(task.difficulty)}>
                              {getDifficultyText(task.difficulty)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-green-600">₺{task.reward}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(task)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Görev bulunamadı.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proofs">
            <Card>
              <CardHeader>
                <CardTitle>Onay Bekleyen Kanıtlar</CardTitle>
              </CardHeader>
              <CardContent>
                {proofs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Onay bekleyen kanıt bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proofs.map((proof) => (
                      <Card key={proof.id} className="border-l-4 border-l-yellow-400">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{proof.userName}</p>
                              <p className="text-sm text-gray-600">Görev #{proof.taskId}</p>
                              <p className="text-sm text-gray-500 mt-1">{proof.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(proof.submittedAt).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-green-600">₺{proof.reward}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-2"
                                onClick={() => {
                                  setSelectedProof(proof);
                                  setIsProofDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                İncele
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Görev Düzenle' : 'Yeni Görev Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Görev Başlığı</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Instagram Gönderisi Beğen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Görevin detaylı açıklaması"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Zorluk</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">Görev Tipi</Label>
              <select
                id="taskType"
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {taskTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {formData.taskType === 'link' && (
              <div className="space-y-2">
                <Label htmlFor="taskLink">Görev Linki</Label>
                <Input
                  id="taskLink"
                  value={formData.taskLink}
                  onChange={(e) => setFormData({ ...formData, taskLink: e.target.value })}
                  placeholder="https://example.com/task"
                />
              </div>
            )}

            {formData.taskType === 'video' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (YouTube Embed)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoDuration">Video Süresi (saniye)</Label>
                  <Input
                    id="videoDuration"
                    type="number"
                    value={formData.videoDuration}
                    onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                    placeholder="300"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="reward">Ödül (₺)</Label>
              <Input
                id="reward"
                type="number"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresProof"
                checked={formData.requiresProof}
                onChange={(e) => setFormData({ ...formData, requiresProof: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="requiresProof" className="mb-0">Kanıt Gerektir</Label>
            </div>

            <div className="flex gap-2 pt-4">
              {selectedTask && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-violet-600"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kaydet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Görevi Sil</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-600 mb-4">
              <strong>{selectedTask?.title}</strong> görevini silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sil'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proof Review Dialog */}
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kanıt İnceleme</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Kullanıcı:</p>
                <p className="font-medium">{selectedProof.userName}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700">
                  {selectedProof.description}
                </p>
              </div>
              
              {selectedProof.photoUrl && (
                <div className="space-y-2">
                  <Label>Fotoğraf</Label>
                  <img 
                    src={selectedProof.photoUrl} 
                    alt="Proof" 
                    className="max-h-48 rounded-lg border"
                  />
                </div>
              )}
              
              <div className="p-4 bg-violet-50 rounded-lg">
                <p className="text-sm text-gray-600">Ödül:</p>
                <p className="text-xl font-bold text-violet-600">₺{selectedProof.reward}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleApproveProof(false)}
                >
                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                  Reddet
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveProof(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Onayla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
