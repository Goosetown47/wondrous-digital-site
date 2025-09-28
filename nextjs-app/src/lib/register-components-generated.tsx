// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Generated at: 2025-09-28T19:34:58.157Z
// Components: 3

import { ComponentRegistry } from '@/lib/component-registry';

import { Hero1, hero1Config } from '@/components/core/sections/hero1';
import { Hero2, hero2Config } from '@/components/core/sections/hero2';
import { Hero3, hero3Config } from '@/components/core/sections/hero3';

export function registerGeneratedComponents() {
  ComponentRegistry.register('Hero1', {
    component: Hero1,
    type: 'section',
    defaultContent: hero1Config.defaultContent,
    editableFields: hero1Config.editableFields,
    source: 'expansions'
  });

  ComponentRegistry.register('Hero2', {
    component: Hero2,
    type: 'section',
    defaultContent: hero2Config.defaultContent,
    editableFields: hero2Config.editableFields,
    source: 'expansions'
  });

  ComponentRegistry.register('Hero3', {
    component: Hero3,
    type: 'section',
    defaultContent: hero3Config.defaultContent,
    editableFields: hero3Config.editableFields,
    source: 'expansions'
  });
}
