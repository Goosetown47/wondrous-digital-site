import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, X, Loader } from 'lucide-react';
import { useSectionTypes } from '../../../hooks/useSectionTypes';
import * as LucideIcons from 'lucide-react';
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

interface EditingType {
  id?: string;
  type_key: string;
  display_name: string;
  icon_name: string;
  description: string;
  order_index: number;
}

// Sortable row component
interface SortableRowProps {
  type: any;
  isEditing: boolean;
  editForm: EditingType | null;
  onEdit: (type: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  setEditForm: (form: EditingType) => void;
  getIconComponent: (iconName: string) => React.ReactNode;
}

const SortableRow: React.FC<SortableRowProps> = ({
  type,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  deleteConfirmId,
  setDeleteConfirmId,
  setEditForm,
  getIconComponent,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.id });

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
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded">
          {isEditing && editForm ? (
            <input
              type="text"
              value={editForm.icon_name}
              onChange={(e) => setEditForm({ ...editForm, icon_name: e.target.value })}
              placeholder="Icon name"
              className="w-20 px-1 py-0.5 text-xs border border-gray-300 rounded"
            />
          ) : (
            getIconComponent(type.icon_name)
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing && editForm ? (
          <input
            type="text"
            value={editForm.type_key}
            onChange={(e) => setEditForm({ ...editForm, type_key: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-pink focus:border-transparent"
          />
        ) : (
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{type.type_key}</code>
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
          <span className="text-sm font-medium text-gray-900">{type.display_name}</span>
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
          <span className="text-sm text-gray-500">{type.description}</span>
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
              onClick={() => onEdit(type)}
              className="text-indigo-600 hover:text-indigo-900 mr-3"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            {deleteConfirmId === type.id ? (
              <div className="inline-flex items-center">
                <span className="text-xs text-red-600 mr-2">Delete?</span>
                <button
                  onClick={() => onDelete(type.id)}
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
                onClick={() => setDeleteConfirmId(type.id)}
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

const SectionTypesTab: React.FC = () => {
  const { sectionTypes, loading, error, createSectionType, updateSectionType, deleteSectionType, reorderSectionTypes } = useSectionTypes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<EditingType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Start creating a new section type
  const handleCreate = () => {
    const maxOrder = Math.max(...sectionTypes.map(t => t.order_index), 0);
    setEditForm({
      type_key: '',
      display_name: '',
      icon_name: 'FileText',
      description: '',
      order_index: maxOrder + 1
    });
    setIsCreating(true);
    setEditingId(null);
  };

  // Start editing an existing section type
  const handleEdit = (type: typeof sectionTypes[0]) => {
    setEditForm({
      id: type.id,
      type_key: type.type_key,
      display_name: type.display_name,
      icon_name: type.icon_name,
      description: type.description || '',
      order_index: type.order_index
    });
    setEditingId(type.id);
    setIsCreating(false);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!editForm) return;

    try {
      if (isCreating) {
        const { id, ...newType } = editForm;
        await createSectionType({
          ...newType,
          is_active: true
        });
      } else if (editingId) {
        await updateSectionType(editingId, editForm);
      }
      
      setEditForm(null);
      setEditingId(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving section type:', err);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditForm(null);
    setEditingId(null);
    setIsCreating(false);
  };

  // Delete section type
  const handleDelete = async (id: string) => {
    try {
      await deleteSectionType(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting section type:', err);
    }
  };

  // Get icon component
  const getIconComponent = (iconName: string) => {
    if (iconName && iconName in LucideIcons) {
      const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
      return <IconComponent className="h-5 w-5" />;
    }
    return <LucideIcons.FileText className="h-5 w-5" />;
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionTypes.findIndex((type) => type.id === active.id);
      const newIndex = sectionTypes.findIndex((type) => type.id === over.id);

      const reorderedTypes = arrayMove(sectionTypes, oldIndex, newIndex);
      await reorderSectionTypes(reorderedTypes);
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
        Error loading section types: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Section Types</h2>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section Type
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
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type Key
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
                items={sectionTypes.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
            {/* Create new row */}
            {isCreating && editForm && (
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded">
                    {getIconComponent(editForm.icon_name)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={editForm.type_key}
                    onChange={(e) => setEditForm({ ...editForm, type_key: e.target.value })}
                    placeholder="section-key"
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
                {sectionTypes.map((type) => (
                  <SortableRow
                    key={type.id}
                    type={type}
                    isEditing={editingId === type.id}
                    editForm={editForm}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    deleteConfirmId={deleteConfirmId}
                    setDeleteConfirmId={setDeleteConfirmId}
                    setEditForm={setEditForm}
                    getIconComponent={getIconComponent}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      {/* Help text */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Icon names must match Lucide React icon names exactly (e.g., FileText, Users, Settings).</p>
        <p className="mt-1">View available icons at: <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-primary-pink hover:underline">lucide.dev/icons</a></p>
      </div>
    </div>
  );
};

export default SectionTypesTab;