'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { type GradeThreshold } from '@/lib/grading';

interface GradingSystem {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  thresholds: GradeThreshold[];
  created_at: string;
  updated_at: string;
}

interface GradingFormData {
  name: string;
  description: string;
  is_default: boolean;
  thresholds: GradeThreshold[];
}

const emptyForm: GradingFormData = {
  name: '',
  description: '',
  is_default: false,
  thresholds: [{ min: 0, max: 100, grade: 'A', points: 12 }],
};

export default function AdminGradingPage() {
  const [systems, setSystems] = useState<GradingSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<GradingSystem | null>(null);
  const [form, setForm] = useState<GradingFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      const response = await fetch('/api/admin/grading');
      if (response.ok) {
        const data = await response.json();
        setSystems(data.gradingSystems || []);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch grading systems',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSystem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (system: GradingSystem) => {
    setEditingSystem(system);
    setForm({
      name: system.name,
      description: system.description,
      is_default: system.is_default,
      thresholds: [...system.thresholds],
    });
    setDialogOpen(true);
  };

  const addThreshold = () => {
    setForm({
      ...form,
      thresholds: [
        ...form.thresholds,
        { min: 0, max: 100, grade: '', points: 0 },
      ],
    });
  };

  const removeThreshold = (index: number) => {
    setForm({
      ...form,
      thresholds: form.thresholds.filter((_, i) => i !== index),
    });
  };

  const updateThreshold = (index: number, field: keyof GradeThreshold, value: string | number) => {
    const newThresholds = [...form.thresholds];
    newThresholds[index] = { ...newThresholds[index], [field]: value };
    setForm({ ...form, thresholds: newThresholds });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...(editingSystem ? { id: editingSystem.id } : {}),
        name: form.name,
        description: form.description,
        is_default: form.is_default,
        thresholds: form.thresholds,
      };

      const response = await fetch('/api/admin/grading', {
        method: editingSystem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: editingSystem ? 'Grading System Updated' : 'Grading System Created',
          description: `${form.name} has been ${editingSystem ? 'updated' : 'created'} successfully`,
        });
        setDialogOpen(false);
        fetchSystems();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save grading system',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/grading?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        toast({ title: 'Grading System Deleted', description: 'The grading system has been removed' });
        fetchSystems();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete grading system', variant: 'destructive' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSetDefault = async (system: GradingSystem) => {
    try {
      const response = await fetch('/api/admin/grading', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: system.id, is_default: true }),
      });

      if (response.ok) {
        toast({ title: 'Default Updated', description: `${system.name} is now the default grading system` });
        fetchSystems();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update default', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-turquoise-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grading Systems</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage CBC, KCSE, and custom grading systems
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-turquoise-500 hover:bg-turquoise-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Grading System
        </Button>
      </div>

      {/* Grading Systems List */}
      <div className="space-y-6">
        {systems.map((system) => (
          <Card key={system.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{system.name}</CardTitle>
                  {system.is_default && (
                    <Badge className="bg-turquoise-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!system.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(system)}
                      className="text-xs"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(system)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => setDeleteConfirm(system.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{system.description}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Min Score</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {system.thresholds
                    .sort((a, b) => b.max - a.max)
                    .map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>{t.min}</TableCell>
                        <TableCell>{t.max}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {t.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.points}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {systems.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No grading systems yet. Click &quot;Add Grading System&quot; to create one.
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSystem ? 'Edit Grading System' : 'Create Grading System'}
            </DialogTitle>
            <DialogDescription>
              {editingSystem
                ? 'Update the grading system details'
                : 'Define a new grading system with thresholds'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="gsName">Name</Label>
              <Input
                id="gsName"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. CBC (Competency Based Curriculum)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gsDesc">Description</Label>
              <Textarea
                id="gsDesc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this grading system"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_default}
                onCheckedChange={(checked) => setForm({ ...form, is_default: checked })}
              />
              <Label>Set as default grading system</Label>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Thresholds</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addThreshold}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Threshold
                </Button>
              </div>

              <div className="space-y-2">
                {form.thresholds.map((threshold, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="grid grid-cols-4 gap-2 flex-1">
                      <div>
                        <Label className="text-[10px] text-gray-400">Min</Label>
                        <Input
                          type="number"
                          value={threshold.min}
                          onChange={(e) =>
                            updateThreshold(i, 'min', parseInt(e.target.value) || 0)
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Max</Label>
                        <Input
                          type="number"
                          value={threshold.max}
                          onChange={(e) =>
                            updateThreshold(i, 'max', parseInt(e.target.value) || 0)
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Grade</Label>
                        <Input
                          value={threshold.grade}
                          onChange={(e) =>
                            updateThreshold(i, 'grade', e.target.value)
                          }
                          className="h-8 text-sm"
                          placeholder="A"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Points</Label>
                        <Input
                          type="number"
                          value={threshold.points || 0}
                          onChange={(e) =>
                            updateThreshold(i, 'points', parseInt(e.target.value) || 0)
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600"
                      onClick={() => removeThreshold(i)}
                      disabled={form.thresholds.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || form.thresholds.length === 0}
              className="bg-turquoise-500 hover:bg-turquoise-600 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSystem ? 'Update System' : 'Create System'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Grading System</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this grading system? This action cannot be
              undone if the system is not being used by any schools.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
