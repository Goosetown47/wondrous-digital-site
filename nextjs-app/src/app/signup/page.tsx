import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogoFull } from '@/components/ui/logo';
import { ArrowLeft } from 'lucide-react';

export default function SignupDisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <LogoFull size="xl" />
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Account Registration
            </CardTitle>
            <CardDescription className="text-center">
              Public signup is currently disabled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              We're currently in a limited beta and accounts are created by invitation only.
              If you're an existing customer, please use the login page with your provided credentials.
            </p>
            
            <p className="text-sm text-muted-foreground text-center">
              If you're interested in our services, please contact our sales team for more information.
            </p>
            
            <div className="flex justify-center pt-4">
              <Link href="/login">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}