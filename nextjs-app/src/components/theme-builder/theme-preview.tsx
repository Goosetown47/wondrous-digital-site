'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Check, Copy, Download } from 'lucide-react';
import { TypographyPreview } from './TypographyPreview';
import { SectionStylesPreview } from './SectionStylesPreview';

interface ThemeVariables {
  colors?: Record<string, string>;
  radius?: string;
  // Section styles
  section1Name?: string;
  section1Description?: string;
  section1Bg?: string;
  section1Fg?: string;
  section1Card?: string;
  section1CardFg?: string;
  section2Name?: string;
  section2Description?: string;
  section2Bg?: string;
  section2Fg?: string;
  section2Card?: string;
  section2CardFg?: string;
  section3Name?: string;
  section3Description?: string;
  section3Bg?: string;
  section3Fg?: string;
  section3Card?: string;
  section3CardFg?: string;
  section4Name?: string;
  section4Description?: string;
  section4Bg?: string;
  section4Fg?: string;
  section4Card?: string;
  section4CardFg?: string;
}

type PreviewMode = 'components' | 'section-styles' | 'typography';

interface ThemePreviewProps {
  variables: ThemeVariables;
  showHeader?: boolean;
  mode?: PreviewMode;
  onModeChange?: (mode: PreviewMode) => void;
}

export function ThemePreview({
  variables,
  showHeader = true,
  mode = 'components',
  onModeChange
}: ThemePreviewProps) {

  const getCSSVariables = () => {
    let css = ':root {\n';

    if (variables.colors) {
      Object.entries(variables.colors).forEach(([key, value]) => {
        css += `  --${key}: ${value};\n`;
      });
    }

    if (variables.radius) {
      css += `  --radius: ${variables.radius};\n`;
    }

    css += '}';
    return css;
  };

  // Prepare section styles data for SectionStylesPreview
  const sectionStyles = [
    {
      number: 1 as const,
      name: variables.section1Name,
      description: variables.section1Description,
      bg: variables.section1Bg,
      fg: variables.section1Fg,
      card: variables.section1Card,
      cardFg: variables.section1CardFg,
      cardBorder: variables.section1CardBorder,
      cardBorderWidth: variables.section1CardBorderWidth,
    },
    {
      number: 2 as const,
      name: variables.section2Name,
      description: variables.section2Description,
      bg: variables.section2Bg,
      fg: variables.section2Fg,
      card: variables.section2Card,
      cardFg: variables.section2CardFg,
      cardBorder: variables.section2CardBorder,
      cardBorderWidth: variables.section2CardBorderWidth,
    },
    {
      number: 3 as const,
      name: variables.section3Name,
      description: variables.section3Description,
      bg: variables.section3Bg,
      fg: variables.section3Fg,
      card: variables.section3Card,
      cardFg: variables.section3CardFg,
      cardBorder: variables.section3CardBorder,
      cardBorderWidth: variables.section3CardBorderWidth,
    },
    {
      number: 4 as const,
      name: variables.section4Name,
      description: variables.section4Description,
      bg: variables.section4Bg,
      fg: variables.section4Fg,
      card: variables.section4Card,
      cardFg: variables.section4CardFg,
      cardBorder: variables.section4CardBorder,
      cardBorderWidth: variables.section4CardBorderWidth,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      {showHeader && (
        <div className="border-b p-4 bg-background">
          <div className="flex items-center justify-between">
            <h3>Preview</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(getCSSVariables())}>
                <Copy className="mr-2 h-4 w-4" />
                Copy CSS
              </Button>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="border-b bg-background flex-shrink-0">
        <Tabs value={mode} onValueChange={(value) => onModeChange?.(value as PreviewMode)}>
          <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="components"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Components
            </TabsTrigger>
            <TabsTrigger
              value="section-styles"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Section Styles
            </TabsTrigger>
            <TabsTrigger
              value="typography"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Typography
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-8 pb-24 bg-background text-foreground">
        {mode === 'typography' && <TypographyPreview />}

        {mode === 'section-styles' && <SectionStylesPreview styles={sectionStyles} />}

        {mode === 'components' && (
          <div
            className="max-w-4xl mx-auto flex flex-col"
            style={{ gap: 'var(--element-spacing, 2rem)' }}
          >
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1>
                Welcome to Your Theme Preview
              </h1>
              <p className="text-muted-foreground">
                See how your theme looks with real components
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  data-button-shadow
                  style={{
                    borderRadius: 'var(--button-radius, var(--radius, 0.5rem))',
                  }}
                >
                  Primary Button
                </Button>
                <Button variant="secondary" data-button-shadow>Secondary Button</Button>
                <Button variant="outline" data-button-shadow>Outline Button</Button>
                <Button variant="destructive" data-button-shadow>Destructive</Button>
              </div>
            </div>

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card
              data-card-shadow
              style={{
                padding: 'var(--card-padding, 1rem)',
                borderRadius: 'var(--card-radius, var(--radius, 0.5rem))',
              }}
            >
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>
                  This is a card description that explains what this card is about.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    data-input-shadow
                    style={{
                      borderRadius: 'var(--input-radius, var(--radius, 0.5rem))',
                      borderWidth: 'var(--input-border-width, var(--global-border-width, 1px))',
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    data-input-shadow
                    style={{
                      borderRadius: 'var(--input-radius, var(--radius, 0.5rem))',
                      borderWidth: 'var(--input-border-width, var(--global-border-width, 1px))',
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" data-button-shadow>Submit</Button>
              </CardFooter>
            </Card>

            <Card
              data-card-shadow
              style={{
                padding: 'var(--card-padding, 1rem)',
                borderRadius: 'var(--card-radius, var(--radius, 0.5rem))',
              }}
            >
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Key features of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p>Feature One</p>
                    <small className="text-muted-foreground">
                      Description of the first feature
                    </small>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p>Feature Two</p>
                    <small className="text-muted-foreground">
                      Description of the second feature
                    </small>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card data-card-shadow>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    Your account overview and recent activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src="/avatars/01.png" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>John Doe</p>
                          <small className="text-muted-foreground">john@example.com</small>
                        </div>
                      </div>
                      <Badge>Pro</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card data-card-shadow>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>View your analytics data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics content goes here...</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports">
              <Card data-card-shadow>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and view reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Reports content goes here...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Alert Section */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              This is an alert message to show how alerts look with your theme.
            </AlertDescription>
          </Alert>

          {/* Badge Examples */}
          <div className="space-y-4">
            <h3>Badges</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <Separator />

          {/* Form Controls */}
          <Card data-card-shadow>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>
                Interactive form elements with various states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Select Dropdown */}
              <div className="space-y-2">
                <Label>Select (Dropdown)</Label>
                <Select defaultValue="option1">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <Label>Checkboxes</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check1" defaultChecked />
                    <Label htmlFor="check1" className="font-normal">
                      Accept terms and conditions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check2" />
                    <Label htmlFor="check2" className="font-normal">
                      Subscribe to newsletter
                    </Label>
                  </div>
                </div>
              </div>

              {/* Switch */}
              <div className="space-y-3">
                <Label>Switches</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="switch1" defaultChecked />
                  <Label htmlFor="switch1" className="font-normal">
                    Enable notifications
                  </Label>
                </div>
              </div>

              {/* Radio Group */}
              <div className="space-y-3">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="r1" />
                    <Label htmlFor="r1" className="font-normal">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comfortable" id="r2" />
                    <Label htmlFor="r2" className="font-normal">Comfortable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="r3" />
                    <Label htmlFor="r3" className="font-normal">Compact</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Slider</Label>
                  <span className="text-sm text-muted-foreground">50%</span>
                </div>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Accordion */}
          <Card data-card-shadow>
            <CardHeader>
              <CardTitle>Accordion</CardTitle>
              <CardDescription>
                Collapsible content sections with subtle backgrounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern and uses semantic HTML.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that you can customize with your theme.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it animated?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It uses smooth transitions for opening and closing content.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card data-card-shadow>
            <CardHeader>
              <CardTitle>Progress Indicators</CardTitle>
              <CardDescription>
                Visual feedback for loading and completion states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span className="text-muted-foreground">60%</span>
                </div>
                <Progress value={60} className="bg-accent [&>div]:bg-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing</span>
                  <span className="text-muted-foreground">33%</span>
                </div>
                <Progress value={33} className="bg-accent [&>div]:bg-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card data-card-shadow>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>
                Tabular data with borders and alternating row colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">John Doe</TableCell>
                    <TableCell>
                      <Badge>Active</Badge>
                    </TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" data-button-shadow>Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Jane Smith</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell>Editor</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" data-button-shadow>Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bob Johnson</TableCell>
                    <TableCell>
                      <Badge>Active</Badge>
                    </TableCell>
                    <TableCell>Viewer</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" data-button-shadow>Edit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
}