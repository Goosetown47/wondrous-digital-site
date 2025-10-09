'use client';

import { EditableText } from '@/components/shared/content-editor/EditableText';
import { Accordion } from '@/components/ui/accordion';
import { ServiceItem } from '@/components/services/service-types';
import { ServiceItemEditor, ServiceItemDisplay } from '@/components/services/editors';
import { useArrayEditor, useItemConfig } from '@/lib/structural-editor/hooks';
import { ItemConfigModal } from '@/components/shared/structural-editor/ItemConfigModal';
import { AddButton } from '@/components/shared/structural-editor/AddButton';
import type { EditableFieldConfig } from '@/lib/component-registry';

interface ServicesAccordionProps {
  heading?: string;
  subtitle?: string;
  services?: ServiceItem[];
  editable?: boolean;
  onUpdate?: (fieldPath: string, value: unknown) => void;
  projectId?: string;
}

export default function ServicesAccordion({
  heading = 'Services',
  subtitle = 'Click to learn more about each service we offer.',
  services = [],
  editable = false,
  onUpdate,
  projectId,
}: ServicesAccordionProps) {
  // Wrap onUpdate to handle array updates
  const handleArrayUpdate = (items: ServiceItem[]) => {
    onUpdate?.('services', items);
  };

  const { handleAdd, handleEdit, handleDelete } = useArrayEditor(services, handleArrayUpdate);
  const { isOpen, item, operation, openForCreate, openForEdit, close } = useItemConfig<ServiceItem>();

  const handleSave = (configuredItem: ServiceItem) => {
    if (operation === 'add') {
      handleAdd(configuredItem);
    } else if (operation === 'edit') {
      handleEdit(configuredItem);
    }
    close();
  };

  return (
    <section
      className="py-12 px-4 md:py-16 lg:py-20 bg-background"
      aria-labelledby="services-heading"
    >
      <div className="container max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <EditableText
            value={heading}
            onUpdate={(val) => onUpdate?.('heading', val)}
            editable={editable}
            type="heading"
          >
            <h2
              id="services-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4"
            >
              {heading}
            </h2>
          </EditableText>

          <EditableText
            value={subtitle}
            onUpdate={(val) => onUpdate?.('subtitle', val)}
            editable={editable}
            type="paragraph"
          >
            <p className="text-base md:text-lg text-muted-foreground">
              {subtitle}
            </p>
          </EditableText>
        </div>

        {/* Services Accordion */}
        <div className="space-y-4">
          {/* Empty State */}
          {services.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              {editable ? 'No items yet. Click "Add Item" to create your first one.' : 'No items available.'}
            </div>
          )}

          {/* Accordion with Items */}
          {services.length > 0 && (
            <Accordion type="single" collapsible className="space-y-4">
              {services.map((service) => (
                <ServiceItemDisplay
                  key={service.id}
                  item={service}
                  inAccordion={true}
                  showControls={editable}
                  onEdit={() => openForEdit(service)}
                  onDelete={() => handleDelete(service.id)}
                />
              ))}
            </Accordion>
          )}

          {/* Add Button (Edit Mode Only) */}
          {editable && (
            <div className="flex justify-start">
              <AddButton onClick={openForCreate} text="Add Item" />
            </div>
          )}
        </div>
      </div>

      {/* Config Modal (Edit Mode Only) */}
      {editable && (
        <ItemConfigModal
          isOpen={isOpen}
          onClose={close}
          onSave={handleSave}
          item={item}
          title={operation === 'add' ? 'Add Item' : 'Edit Item'}
        >
          <ServiceItemEditor
            item={item}
            onSave={handleSave}
            onCancel={close}
            projectId={projectId}
          />
        </ItemConfigModal>
      )}
    </section>
  );
}

export const servicesaccordionConfig = {
  editableFields: [
    { path: 'heading', type: 'text', label: 'Heading', required: false },
    { path: 'subtitle', type: 'text', label: 'Subtitle', required: false },
    { path: 'services', type: 'array', label: 'Services', required: false },
  ] as EditableFieldConfig[],
  defaultContent: {
    heading: 'Services',
    subtitle: 'Click to learn more about each service we offer.',
    services: [],
  },
};
