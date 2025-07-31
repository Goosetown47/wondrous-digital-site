-- Add checkbox component to core_components
INSERT INTO core_components (
  name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata
) VALUES (
  'checkbox',
  'component',
  'shadcn',
  E'"use client"\n\nimport * as React from "react"\nimport * as CheckboxPrimitive from "@radix-ui/react-checkbox"\nimport { Check } from "lucide-react"\n\nimport { cn } from "@/lib/utils"\n\nconst Checkbox = React.forwardRef<\n  React.ElementRef<typeof CheckboxPrimitive.Root>,\n  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>\n>(({ className, ...props }, ref) => (\n  <CheckboxPrimitive.Root\n    ref={ref}\n    className={cn(\n      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",\n      className\n    )}\n    {...props}\n  >\n    <CheckboxPrimitive.Indicator\n      className={cn("flex items-center justify-center text-current")}\n    >\n      <Check className="h-4 w-4" />\n    </CheckboxPrimitive.Indicator>\n  </CheckboxPrimitive.Root>\n))\nCheckbox.displayName = CheckboxPrimitive.Root.displayName\n\nexport { Checkbox }',
  jsonb_build_array('@radix-ui/react-checkbox', 'lucide-react'),
  jsonb_build_object(
    'react', 'import * as React from "react"',
    '@radix-ui/react-checkbox', 'import * as CheckboxPrimitive from "@radix-ui/react-checkbox"',
    'lucide-react', 'import { Check } from "lucide-react"',
    '@/lib/utils', 'import { cn } from "@/lib/utils"'
  ),
  jsonb_build_object(
    'description', 'A checkbox component for forms and selections',
    'radix_primitive', '@radix-ui/react-checkbox',
    'examples', ARRAY[
      '<Checkbox />',
      '<Checkbox checked />',
      '<Checkbox disabled />',
      '<Checkbox id="terms" />',
      '<Checkbox onCheckedChange={(checked) => console.log(checked)} />'
    ]
  )
) ON CONFLICT (name, source) DO UPDATE SET
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();