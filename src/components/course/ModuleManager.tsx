import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  BookOpen, 
  Clock, 
  Target,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { db } from '@/lib/github-sdk';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
  dripSchedule: {
    enabled: boolean;
    delayDays: number;
    unlockDate?: string;
  };
  isPublished: boolean;
  estimatedDuration: number;
  objectives: string[];
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ModuleManagerProps {
  courseId: string;
  onModuleSelect?: (moduleId: string) => void;
  onLessonSelect?: (lessonId: string) => void;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({ 
  courseId, 
  onModuleSelect, 
  onLessonSelect 
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadModulesAndLessons();
  }, [courseId]);

  const loadModulesAndLessons = async () => {
    try {
      setLoading(true);
      const [modulesData, lessonsData] = await Promise.all([
        db.queryBuilder('modules')
          .where((m: Module) => m.courseId === courseId)
          .orderBy('order', 'asc')
          .exec(),
        db.queryBuilder('lessons')
          .where((l: Lesson) => l.courseId === courseId)
          .orderBy('order', 'asc')
          .exec()
      ]);
      
      setModules(modulesData);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading modules and lessons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course structure',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (moduleData: Partial<Module>) => {
    try {
      const newModule = await db.insert('modules', {
        ...moduleData,
        courseId,
        order: modules.length,
        prerequisites: [],
        dripSchedule: { enabled: false, delayDays: 0 },
        isPublished: true,
        estimatedDuration: 0,
        objectives: []
      });
      
      setModules([...modules, newModule]);
      setIsCreatingModule(false);
      toast({
        title: 'Success',
        description: 'Module created successfully'
      });
    } catch (error) {
      console.error('Error creating module:', error);
      toast({
        title: 'Error',
        description: 'Failed to create module',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateModule = async (moduleId: string, updates: Partial<Module>) => {
    try {
      await db.update('modules', moduleId, updates);
      setModules(modules.map(m => m.id === moduleId ? { ...m, ...updates } : m));
      setEditingModule(null);
      toast({
        title: 'Success',
        description: 'Module updated successfully'
      });
    } catch (error) {
      console.error('Error updating module:', error);
      toast({
        title: 'Error',
        description: 'Failed to update module',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? All lessons in this module will also be deleted.')) {
      return;
    }

    try {
      // Delete all lessons in the module
      const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
      for (const lesson of moduleLessons) {
        await db.delete('lessons', lesson.id);
      }
      
      // Delete the module
      await db.delete('modules', moduleId);
      
      setModules(modules.filter(m => m.id !== moduleId));
      setLessons(lessons.filter(l => l.moduleId !== moduleId));
      
      toast({
        title: 'Success',
        description: 'Module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete module',
        variant: 'destructive'
      });
    }
  };

  const handleModuleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedModules = Array.from(modules);
    const [movedModule] = reorderedModules.splice(result.source.index, 1);
    reorderedModules.splice(result.destination.index, 0, movedModule);

    // Update order for all modules
    const updatedModules = reorderedModules.map((module, index) => ({
      ...module,
      order: index
    }));

    setModules(updatedModules);

    // Save order changes to database
    updatedModules.forEach(async (module) => {
      await db.update('modules', module.id, { order: module.order });
    });
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getModuleLessons = (moduleId: string) => {
    return lessons.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Modules
          </CardTitle>
          <Button
            onClick={() => setIsCreatingModule(true)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleModuleDragEnd}>
          <Droppable droppableId="modules">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {modules.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    index={index}
                    lessons={getModuleLessons(module.id)}
                    isExpanded={expandedModules.has(module.id)}
                    isEditing={editingModule === module.id}
                    onToggleExpansion={() => toggleModuleExpansion(module.id)}
                    onEdit={() => setEditingModule(module.id)}
                    onSave={(updates) => handleUpdateModule(module.id, updates)}
                    onCancel={() => setEditingModule(null)}
                    onDelete={() => handleDeleteModule(module.id)}
                    onModuleSelect={onModuleSelect}
                    onLessonSelect={onLessonSelect}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isCreatingModule && (
          <CreateModuleForm
            onSave={handleCreateModule}
            onCancel={() => setIsCreatingModule(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

interface ModuleCardProps {
  module: Module;
  index: number;
  lessons: Lesson[];
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpansion: () => void;
  onEdit: () => void;
  onSave: (updates: Partial<Module>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onModuleSelect?: (moduleId: string) => void;
  onLessonSelect?: (lessonId: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  index,
  lessons,
  isExpanded,
  isEditing,
  onToggleExpansion,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onModuleSelect,
  onLessonSelect
}) => {
  const [editForm, setEditForm] = useState({
    title: module.title,
    description: module.description,
    estimatedDuration: module.estimatedDuration,
    isPublished: module.isPublished
  });

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <Draggable draggableId={module.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border rounded-lg bg-white ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div {...provided.dragHandleProps}>
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                </div>

                <button
                  onClick={onToggleExpansion}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}

                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Module {index + 1}: {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={module.isPublished ? 'default' : 'secondary'}>
                  {module.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {lessons.length} lessons
                </Badge>

                {isEditing ? (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleSave}>Save</Button>
                    <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={onEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={onDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 space-y-4">
                <Textarea
                  placeholder="Module description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="duration">Duration (minutes):</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={editForm.estimatedDuration}
                      onChange={(e) => setEditForm({ ...editForm, estimatedDuration: parseInt(e.target.value) || 0 })}
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editForm.isPublished}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, isPublished: checked })}
                    />
                    <Label>Published</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t bg-gray-50"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Lessons</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onModuleSelect?.(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </Button>
                  </div>

                  {lessons.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No lessons in this module yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:bg-gray-50"
                          onClick={() => onLessonSelect?.(lesson.id)}
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">
                                Lesson {lessonIndex + 1}: {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500">{lesson.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {lesson.duration}m
                            </Badge>
                            <Badge variant={lesson.isPublished ? 'default' : 'secondary'} className="text-xs">
                              {lesson.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  );
};

interface CreateModuleFormProps {
  onSave: (moduleData: Partial<Module>) => void;
  onCancel: () => void;
}

const CreateModuleForm: React.FC<CreateModuleFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedDuration: 0,
    isPublished: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-4 p-4 border rounded-lg bg-green-50"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Module Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter module title"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter module description"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="duration">Estimated Duration (minutes):</Label>
            <Input
              id="duration"
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
            />
            <Label>Published</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Create Module
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ModuleManager;
