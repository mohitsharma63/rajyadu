import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MoveUp, 
  MoveDown, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/admin-layout';
import AdminProtectedRoute from '@/components/admin-protected-route';
import { oliGetJson, oliUrl } from '@/lib/oliApi';

interface TermsSection {
  id: number;
  sectionTitle: string;
  sectionContent: string;
  sectionOrder: number;
  isActive: boolean;
  lastUpdated: string;
}

const TermsAndConditionsAdmin: React.FC = () => {
  const [editingSection, setEditingSection] = useState<TermsSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSection, setNewSection] = useState({ sectionTitle: '', sectionContent: '' });
  const queryClient = useQueryClient();

  const { data: sections, isLoading } = useQuery({
    queryKey: ['/api/terms-conditions/admin/all'],
    queryFn: () => oliGetJson<TermsSection[]>('/api/terms-conditions/admin/all'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newSection) => {
      const response = await fetch(oliUrl('/api/terms-conditions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terms-conditions/admin/all'] });
      setIsCreating(false);
      setNewSection({ sectionTitle: '', sectionContent: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TermsSection) => {
      const response = await fetch(oliUrl(`/api/terms-conditions/${data.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terms-conditions/admin/all'] });
      setEditingSection(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(oliUrl(`/api/terms-conditions/${id}`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete section');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terms-conditions/admin/all'] });
    },
  });

  const handleCreate = () => {
    if (newSection.sectionTitle && newSection.sectionContent) {
      createMutation.mutate(newSection);
    }
  };

  const handleUpdate = () => {
    if (editingSection) {
      updateMutation.mutate(editingSection);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      deleteMutation.mutate(id);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!sections) return;
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    // Swap orders
    const temp = newSections[index].sectionOrder;
    newSections[index].sectionOrder = newSections[targetIndex].sectionOrder;
    newSections[targetIndex].sectionOrder = temp;
    
    // Update both sections
    updateMutation.mutate(newSections[index]);
    updateMutation.mutate(newSections[targetIndex]);
  };

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
              <p className="text-gray-600 mt-1">Manage your website terms and conditions</p>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>

          {/* Create New Section */}
          {isCreating && (
            <Card className="mb-6 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Section
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <Input
                    value={newSection.sectionTitle}
                    onChange={(e) => setNewSection({ ...newSection, sectionTitle: e.target.value })}
                    placeholder="e.g., Delivery & Shipping"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Content
                  </label>
                  <Textarea
                    value={newSection.sectionContent}
                    onChange={(e) => setNewSection({ ...newSection, sectionContent: e.target.value })}
                    placeholder="Enter the terms and conditions content..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? 'Creating...' : 'Create Section'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setNewSection({ sectionTitle: '', sectionContent: '' });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections List */}
          <div className="space-y-4">
            {sections?.map((section, index) => (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <CardTitle className="text-lg">{section.sectionTitle}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={section.isActive ? "default" : "secondary"}>
                            {section.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {section.lastUpdated ? new Date(section.lastUpdated).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sections.length - 1}
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSection(section)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection?.id === section.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Title
                        </label>
                        <Input
                          value={editingSection.sectionTitle}
                          onChange={(e) => setEditingSection({ ...editingSection, sectionTitle: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Content
                        </label>
                        <Textarea
                          value={editingSection.sectionContent}
                          onChange={(e) => setEditingSection({ ...editingSection, sectionContent: e.target.value })}
                          rows={6}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingSection.isActive}
                            onChange={(e) => setEditingSection({ ...editingSection, isActive: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Active</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUpdate}
                          disabled={updateMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingSection(null)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{section.sectionContent}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/terms-conditions`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview on Website
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {sections?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first terms and conditions section.</p>
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Section
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success/Error Messages */}
          {createMutation.isSuccess && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Section created successfully!
              </AlertDescription>
            </Alert>
          )}

          {updateMutation.isSuccess && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Section updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {(createMutation.error || updateMutation.error || deleteMutation.error) && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                An error occurred. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default TermsAndConditionsAdmin;
