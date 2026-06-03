'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
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
import { useToast } from '@/hooks/use-toast';
import { type Plan } from '@/lib/planFeatures';
import { formatKES } from '@/lib/utils';

interface PlanFormData {
  name: string;
  description: string;
  price_kes: number;
  duration_months: number;
  max_uploads_per_month: string;
  max_students_per_upload: string;
  max_file_size_mb: number;
  includes_pdf_report: boolean;
  includes_excel_report: boolean;
  includes_advanced_analytics: boolean;
  includes_school_branding: boolean;
  includes_priority_support: boolean;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

const emptyForm: PlanFormData = {
  name: '',
  description: '',
  price_kes: 0,
  duration_months: 1,
  max_uploads_per_month: '',
  max_students_per_upload: '',
  max_file_size_mb: 10,
  includes_pdf_report: false,
  includes_excel_report: true,
  includes_advanced_analytics: false,
  includes_school_branding: false,
  includes_priority_support: false,
  is_active: true,
  is_default: false,
  sort_order: 0,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch plans', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description,
      price_kes: plan.price_kes,
      duration_months: plan.duration_months,
      max_uploads_per_month: plan.max_uploads_per_month?.toString() || '',
      max_students_per_upload: plan.max_students_per_upload?.toString() || '',
      max_file_size_mb: plan.max_file_size_mb,
      includes_pdf_report: plan.includes_pdf_report,
      includes_excel_report: plan.includes_excel_report,
      includes_advanced_analytics: plan.includes_advanced_analytics,
      includes_school_branding: plan.includes_school_branding,
      includes_priority_support: plan.includes_priority_support,
      is_active: plan.is_active,
      is_default: plan.is_default,
      sort_order: plan.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...(editingPlan ? { id: editingPlan.id } : {}),
        name: form.name,
        description: form.description,
        price_kes: form.price_kes,
        duration_months: form.duration_months,
        max_uploads_per_month: form.max_uploads_per_month
          ? parseInt(form.max_uploads_per_month)
          : null,
        max_students_per_upload: form.max_students_per_upload
          ? parseInt(form.max_students_per_upload)
          : null,
        max_file_size_mb: form.max_file_size_mb,
        includes_pdf_report: form.includes_pdf_report,
        includes_excel_report: form.includes_excel_report,
        includes_advanced_analytics: form.includes_advanced_analytics,
        includes_school_branding: form.includes_school_branding,
        includes_priority_support: form.includes_priority_support,
        is_active: form.is_active,
        is_default: form.is_default,
        sort_order: form.sort_order,
      };

      const response = await fetch('/api/admin/plans', {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: editingPlan ? 'Plan Updated' : 'Plan Created',
          description: `${form.name} has been ${editingPlan ? 'updated' : 'created'} successfully`,
        });
        setDialogOpen(false);
        fetchPlans();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save plan', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const response = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, is_active: !plan.is_active }),
      });

      if (response.ok) {
        toast({
          title: 'Plan Updated',
          description: `${plan.name} is now ${!plan.is_active ? 'active' : 'inactive'}`,
        });
        fetchPlans();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update plan', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        toast({ title: 'Plan Deleted', description: 'Plan has been deactivated' });
        fetchPlans();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete plan', variant: 'destructive' });
    } finally {
      setDeleteConfirm(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Plans Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pricing plans and features</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-turquoise-500 hover:bg-turquoise-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Plan
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Uploads</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name}
                      {plan.is_default && (
                        <Badge variant="turquoise" className="ml-2 text-[10px]">
                          Default
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatKES(plan.price_kes)}</TableCell>
                    <TableCell>
                      {plan.duration_months === 1
                        ? '1 month'
                        : `${plan.duration_months} months`}
                    </TableCell>
                    <TableCell>
                      {plan.max_uploads_per_month === null
                        ? '∞'
                        : plan.max_uploads_per_month}
                    </TableCell>
                    <TableCell>
                      {plan.max_students_per_upload === null
                        ? '∞'
                        : plan.max_students_per_upload}
                    </TableCell>
                    <TableCell>{plan.max_file_size_mb}MB</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.includes_pdf_report && (
                          <Badge variant="outline" className="text-[10px]">
                            PDF
                          </Badge>
                        )}
                        {plan.includes_excel_report && (
                          <Badge variant="outline" className="text-[10px]">
                            Excel
                          </Badge>
                        )}
                        {plan.includes_advanced_analytics && (
                          <Badge variant="outline" className="text-[10px]">
                            Analytics
                          </Badge>
                        )}
                        {plan.includes_school_branding && (
                          <Badge variant="outline" className="text-[10px]">
                            Branding
                          </Badge>
                        )}
                        {plan.includes_priority_support && (
                          <Badge variant="outline" className="text-[10px]">
                            Support
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => handleToggleActive(plan)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => setDeleteConfirm(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {plans.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No plans yet. Click &quot;Add Plan&quot; to create your first plan.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan
                ? 'Update the plan details below'
                : 'Fill in the details for the new plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Premium"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price_kes}
                  onChange={(e) =>
                    setForm({ ...form, price_kes: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the plan"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.duration_months}
                  onChange={(e) =>
                    setForm({ ...form, duration_months: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxUploads">Max Uploads/Month</Label>
                <Input
                  id="maxUploads"
                  value={form.max_uploads_per_month}
                  onChange={(e) =>
                    setForm({ ...form, max_uploads_per_month: e.target.value })
                  }
                  placeholder="∞ = empty"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxStudents">Max Students/Upload</Label>
                <Input
                  id="maxStudents"
                  value={form.max_students_per_upload}
                  onChange={(e) =>
                    setForm({ ...form, max_students_per_upload: e.target.value })
                  }
                  placeholder="∞ = empty"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={form.max_file_size_mb}
                  onChange={(e) =>
                    setForm({ ...form, max_file_size_mb: parseInt(e.target.value) || 10 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Features</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'includes_excel_report' as const, label: 'Excel Reports' },
                  { key: 'includes_pdf_report' as const, label: 'PDF Reports' },
                  { key: 'includes_advanced_analytics' as const, label: 'Advanced Analytics' },
                  { key: 'includes_school_branding' as const, label: 'School Branding' },
                  { key: 'includes_priority_support' as const, label: 'Priority Support' },
                  { key: 'is_default' as const, label: 'Default Plan' },
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2">
                    <Switch
                      checked={form[feature.key]}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, [feature.key]: checked })
                      }
                    />
                    <Label className="text-sm">{feature.label}</Label>
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
              disabled={saving || !form.name}
              className="bg-turquoise-500 hover:bg-turquoise-600 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this plan? This action can be undone by
              toggling the plan back to active.
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
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
