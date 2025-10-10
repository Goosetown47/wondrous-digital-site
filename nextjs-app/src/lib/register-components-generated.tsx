// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Generated at: 2025-10-09T23:32:26.427Z
// Components: 4

import { ComponentRegistry } from '@/lib/component-registry';

import Features1, { features1Config } from '@/components/core/sections/features1';
import HeroSixBadge, { herosixbadgeConfig } from '@/components/core/sections/hero1';
import Nav1, { nav1Config } from '@/components/core/sections/navigation1';
import ServicesAccordion, { servicesaccordionConfig } from '@/components/core/sections/services1';

export function registerGeneratedComponents() {
  ComponentRegistry.register('Features1', {
    component: Features1,
    type: 'section',
    defaultContent: features1Config.defaultContent,
    editableFields: features1Config.editableFields,
    source: 'custom'
  });

  ComponentRegistry.register('Hero1', {
    component: HeroSixBadge,
    type: 'section',
    defaultContent: herosixbadgeConfig.defaultContent,
    editableFields: herosixbadgeConfig.editableFields,
    source: 'custom'
  });

  ComponentRegistry.register('Navigation1', {
    component: Nav1,
    type: 'section',
    defaultContent: nav1Config.defaultContent,
    editableFields: nav1Config.editableFields,
    source: 'custom'
  });

  ComponentRegistry.register('Services1', {
    component: ServicesAccordion,
    type: 'section',
    defaultContent: servicesaccordionConfig.defaultContent,
    editableFields: servicesaccordionConfig.editableFields,
    source: 'custom'
  });
}
