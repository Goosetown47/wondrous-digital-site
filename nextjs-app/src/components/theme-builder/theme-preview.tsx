'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Check, Copy, Download } from 'lucide-react';

interface ThemeVariables {
  colors?: Record<string, string>;
  radius?: string;
}

interface ThemePreviewProps {
  variables: ThemeVariables;
  showHeader?: boolean;
}

export function ThemePreview({ variables, showHeader = true }: ThemePreviewProps) {

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

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-background text-foreground">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1>
              Welcome to Your Theme Preview
            </h1>
            <p className="text-muted-foreground">
              See how your theme looks with real components
            </p>
            <div className="flex gap-4 justify-center">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>
                  This is a card description that explains what this card is about.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit</Button>
              </CardFooter>
            </Card>

            <Card>
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
              <Card>
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
              <Card>
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
              <Card>
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

          {/* Typography Hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle>Typography Hierarchy</CardTitle>
              <CardDescription>
                Preview all heading levels and text sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1>Heading 1 - Main Page Title</h1>
                <p className="text-muted-foreground">48px, bold, tight tracking</p>
              </div>
              <div>
                <h2>Heading 2 - Section Title</h2>
                <p className="text-muted-foreground">36px, semi-bold</p>
              </div>
              <div>
                <h3>Heading 3 - Subsection Title</h3>
                <p className="text-muted-foreground">30px, semi-bold</p>
              </div>
              <div>
                <h4>Heading 4 - Card Title</h4>
                <p className="text-muted-foreground">24px, semi-bold</p>
              </div>
              <div>
                <h5>Heading 5 - Small Heading</h5>
                <p className="text-muted-foreground">20px, medium</p>
              </div>
              <div>
                <h6>Heading 6 - Tiny Heading</h6>
                <p className="text-muted-foreground">16px, medium</p>
              </div>
              <div>
                <p>Body Text - This is regular paragraph text used throughout the interface for content and descriptions. It should be comfortable to read at length.</p>
                <p className="text-muted-foreground">16px, regular weight</p>
              </div>
              <div>
                <small className="block">Small Text - Used for captions, labels, and supplementary information. This text is slightly smaller but still readable.</small>
                <p className="text-muted-foreground">14px, regular weight</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}