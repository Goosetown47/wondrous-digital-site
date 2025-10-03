// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Generated at: 2025-10-03T01:52:53.511Z
// Components: 2

import { ComponentRegistry } from '@/lib/component-registry';

import CtaSimple1, { ctasimple1Config } from '@/components/core/sections/cta1';
import Nav1, { nav1Config } from '@/components/core/sections/navigation1';

export function registerGeneratedComponents() {
  ComponentRegistry.register('Cta1', {
    component: CtaSimple1,
    type: 'section',
    defaultContent: ctasimple1Config.defaultContent,
    editableFields: ctasimple1Config.editableFields,
    source: 'custom'
  });

  ComponentRegistry.register('Navigation1', {
    component: Nav1,
    type: 'section',
    defaultContent: nav1Config.defaultContent,
    editableFields: nav1Config.editableFields,
    source: 'custom'
  });
}
