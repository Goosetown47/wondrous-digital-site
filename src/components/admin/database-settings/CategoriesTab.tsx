import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, X, Loader } from 'lucide-react';
import { useSectionCategories } from '../../../hooks/useSectionCategories';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditingCategory {
  id?: string;
  category_key: string;
  display_name: string;
  description: string;
  order_index: number;
}

// Sortable row component
interface SortableRowProps {
  category: any;
  isEditing: boolean;
  editForm: EditingCategory | null;
  onEdit: (category: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  setEditForm: (form: EditingCategory) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
  category,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  deleteConfirmId,
  setDeleteConfirmId,
  setEditForm,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isEditing ? 'bg-blue-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing && editForm ? (
          <input
            type="text"
            value={editForm.category_key}
            onChange={(e) => setEditForm({ ...editForm, category_key: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-pink focus:border-transparent"
          />
        ) : (
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{category.category_key}</code>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing && editForm ? (
          <input
            type="text"
            value={editForm.display_name}
            onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-pink focus:border-transparent"
          />
        ) : (
          <span className="text-sm font-medium text-gray-900">{category.display_name}</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing && editForm ? (
          <input
            type="text"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-pink focus:border-transparent"
          />
        ) : (
          <span className="text-sm text-gray-500">{category.description}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              className="text-green-600 hover:text-green-900 mr-3"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(category)}
              className="text-indigo-600 hover:text-indigo-900 mr-3"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            {deleteConfirmId === category.id ? (
              <div className="inline-flex items-center">
                <span className="text-xs text-red-600 mr-2">Delete?</span>
                <button
                  onClick={() => onDelete(category.id)}
                  className="text-red-600 hover:text-red-900 mr-1"
                >
                  Yes
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirmId(category.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
};

const CategoriesTab: React.FC = () => {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, reorderCategories } = useSectionCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<EditingCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Start creating a new category
  const handleCreate = () => {
    const maxOrder = Math.max(...categories.map(c => c.order_index), 0);
    setEditForm({
      category_key: '',
      display_name: '',
      description: '',
      order_index: maxOrder + 1
    });
    setIsCreating(true);
    setEditingId(null);
  };

  // Start editing an existing category
  const handleEdit = (category: typeof categories[0]) => {
    setEditForm({
      id: category.id,
      category_key: category.category_key,
      display_name: category.display_name,
      description: category.description || '',
      order_index: category.order_index
    });
    setEditingId(category.id);
    setIsCreating(false);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!editForm) return;

    try {
      if (isCreating) {
        const { id, ...newCategory } = editForm;
        await createCategory({
          ...newCategory,
          is_active: true
        });
      } else if (editingId) {
        await updateCategory(editingId, editForm);
      }
      
      setEditForm(null);
      setEditingId(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditForm(null);
    setEditingId(null);
    setIsCreating(false);
  };

  // Delete category
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((category) => category.id === active.id);
      const newIndex = categories.findIndex((category) => category.id === over.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      await reorderCategories(reorderedCategories);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading categories: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <SortableContext
                items={categories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
            {/* Create new row */}
            {isCreating && editForm && (
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={editForm.category_key}
                    onChange={(e) => setEditForm({ ...editForm, category_key: e.target.value })}
                    placeholder="category-key"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    placeholder="Display Name"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={handleSave}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )}

                {/* Existing rows */}
                {categories.map((category) => (
                  <SortableRow
                    key={category.id}
                    category={category}
                    isEditing={editingId === category.id}
                    editForm={editForm}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    deleteConfirmId={deleteConfirmId}
                    setDeleteConfirmId={setDeleteConfirmId}
                    setEditForm={setEditForm}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      {/* Help text */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Categories help organize section templates in the template selection interface.</p>
        <p className="mt-1">Use lowercase keys with hyphens (e.g., "e-commerce", "real-estate").</p>
      </div>
    </div>
  );
};

export default CategoriesTab;