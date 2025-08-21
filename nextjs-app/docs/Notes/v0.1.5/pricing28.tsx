"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Clock,
  Clock11Icon,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Eye,
  FileInput,
  FilePlus,
  FileSearch,
  FileText,
  HardDrive,
  Key,
  LifeBuoy,
  Lock,
  Mail,
  Palette,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldPlus,
  ShieldQuestion,
  Star,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  VoicemailIcon,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interface for Pricing Package Data
interface PricingPackage {
  title: string;
  monthlyPrice: string;
  annualPrice: string;
  description: string;
  features: {
    title: string;
    items: { icon: LucideIcon; text: string }[];
  }[];
  isPopular?: boolean; // Optional flag for popular plan
}

const Pricing28 = () => {
  const [isAnnually, setIsAnnually] = useState(false);

  // Pricing packages data
  const packages: PricingPackage[] = [
    {
      title: "Basic Plan",
      monthlyPrice: "$79",
      annualPrice: "$63",
      description: "10 credit total",
      features: [
        {
          title: "Security",
          items: [
            { icon: ShieldCheck, text: "Standard security" },
            { icon: Lock, text: "Basic encryption" },
            { icon: Key, text: "Two-factor authentication" },
          ],
        },
        {
          title: "Style",
          items: [
            { icon: Palette, text: "Basic branding" },
            { icon: Eye, text: "Limited style customization" },
          ],
        },
        {
          title: "Storage",
          items: [
            { icon: HardDrive, text: "5GB storage" },
            { icon: FileText, text: "File versioning" },
          ],
        },
        {
          title: "Support",
          items: [
            { icon: Mail, text: "Support by email only" },
            { icon: Clock, text: "Basic time tracking" },
          ],
        },
        {
          title: "Collaboration",
          items: [
            { icon: Users, text: "Up to 3 users" },
            { icon: UserPlus, text: "Basic team collaboration" },
          ],
        },
      ],
    },
    {
      title: "Pro Plan",
      monthlyPrice: "$299",
      annualPrice: "$239",
      description: "50 credit total",
      features: [
        {
          title: "Security",
          items: [
            { icon: ShieldPlus, text: "Enhanced security" },
            { icon: Shield, text: "Advanced encryption" },
            { icon: Key, text: "Two-factor authentication" },
            { icon: ShieldAlert, text: "Data loss prevention" },
          ],
        },
        {
          title: "Style",
          items: [
            { icon: Palette, text: "Custom branding" },
            { icon: Eye, text: "Advanced style customization" },
            { icon: Star, text: "Custom themes" },
          ],
        },
        {
          title: "Storage",
          items: [
            { icon: HardDrive, text: "50GB storage" },
            { icon: FilePlus, text: "File versioning" },
            { icon: Cloud, text: "Backup and restore" },
          ],
        },
        {
          title: "Support",
          items: [
            { icon: Bell, text: "Priority support" },
            { icon: Clock, text: "24/7 priority support" },
            { icon: Mail, text: "Email and chat support" },
          ],
        },
        {
          title: "Collaboration",
          items: [
            { icon: Users, text: "Unlimited users" },
            { icon: UserCheck, text: "Advanced team collaboration" },
            { icon: UserCog, text: "Role-based access control" },
          ],
        },
      ],
    },
    {
      title: "Business Plan",
      monthlyPrice: "$599",
      annualPrice: "$479",
      description: "100 credit total",
      features: [
        {
          title: "Security",
          items: [
            { icon: ShieldPlus, text: "Advanced security" },
            { icon: ShieldCheck, text: "Enterprise-grade encryption" },
            { icon: Key, text: "Two-factor authentication" },
            { icon: ShieldAlert, text: "Data loss prevention" },
            { icon: LifeBuoy, text: "Dedicated security team" },
          ],
        },
        {
          title: "Style",
          items: [
            { icon: Palette, text: "Custom branding" },
            { icon: Eye, text: "Advanced style customization" },
            { icon: Star, text: "Custom themes" },
            { icon: Star, text: "White-labeling" },
          ],
        },
        {
          title: "Storage",
          items: [
            { icon: HardDrive, text: "500GB storage" },
            { icon: FileSearch, text: "File versioning" },
            { icon: CloudRain, text: "Backup and restore" },
            { icon: CloudSnow, text: "Unlimited file uploads" },
          ],
        },
        {
          title: "Support",
          items: [
            { icon: Bell, text: "Priority support" },
            { icon: Clock, text: "24/7 priority support" },
            { icon: Mail, text: "Email, chat, and phone support" },
            { icon: Star, text: "Dedicated account manager" },
          ],
        },
        {
          title: "Collaboration",
          items: [
            { icon: Users, text: "Unlimited team members" },
            { icon: UserCheck, text: "Advanced team collaboration" },
            { icon: UserCog, text: "Role-based access control" },
            { icon: Clock11Icon, text: "Custom workflows" },
          ],
        },
      ],
      isPopular: true, // Mark as popular
    },
    {
      title: "Enterprise Plan",
      monthlyPrice: "$1199",
      annualPrice: "$959",
      description: "Unlimited credits",
      features: [
        {
          title: "Security",
          items: [
            { icon: ShieldPlus, text: "Enterprise-grade security" },
            { icon: ShieldCheck, text: "Advanced encryption" },
            { icon: Key, text: "Two-factor authentication" },
            { icon: ShieldAlert, text: "Data loss prevention" },
            { icon: LifeBuoy, text: "Dedicated security team" },
            { icon: ShieldQuestion, text: "Compliance certifications" },
          ],
        },
        {
          title: "Style",
          items: [
            { icon: Palette, text: "Custom branding" },
            { icon: Eye, text: "Advanced style customization" },
            { icon: Star, text: "Custom themes" },
            { icon: Star, text: "White-labeling" },
            { icon: Star, text: "Custom animations" },
          ],
        },
        {
          title: "Storage",
          items: [
            { icon: HardDrive, text: "1TB storage" },
            { icon: FileInput, text: "File versioning" },
            { icon: CloudLightning, text: "Backup and restore" },
            { icon: CloudDrizzle, text: "Unlimited file uploads" },
            { icon: CloudSun, text: "Custom storage solutions" },
          ],
        },
        {
          title: "Support",
          items: [
            { icon: Bell, text: "24/7 premium support" },
            { icon: Clock, text: "Dedicated account manager" },
            { icon: Mail, text: "Email, chat, and phone support" },
            { icon: Star, text: "Custom SLA agreements" },
          ],
        },
        {
          title: "Collaboration",
          items: [
            { icon: Users, text: "Unlimited users" },
            { icon: UserCheck, text: "Advanced team collaboration" },
            { icon: UserCog, text: "Role-based access control" },
            { icon: Clock11Icon, text: "Custom workflows" },
            { icon: VoicemailIcon, text: "Unlimited integrations" },
          ],
        },
      ],
    },
  ];

  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-semibold lg:text-5xl">
            Choose the right plan for you
          </h2>
        </div>

        {/* Avatars and Additional Info */}
        <div className="mx-auto mb-12 flex max-w-3xl items-center justify-center gap-4">
          <div className="relative mr-2 flex items-center">
            <Avatar className="border-primary size-8 border">
              <AvatarImage src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar className="border-primary absolute left-6 size-8 border">
              <AvatarImage src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar className="border-primary absolute left-12 size-8 border">
              <AvatarImage src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp" />
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
          </div>

          {/* Sub title */}
          <div className="ml-8 flex items-center gap-4">
            <span className="text-sm font-medium">
              50K+ developers trust us
            </span>
            <div className="bg-border h-8 w-px" />
            <span className="text-sm font-medium">
              Cancel any time, without any hassle
            </span>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted flex h-12 items-center rounded-full p-1">
            <RadioGroup
              defaultValue="monthly"
              className="h-full grid-cols-2"
              onValueChange={(value) => {
                setIsAnnually(value === "annually");
              }}
            >
              <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-full transition-all'>
                <RadioGroupItem
                  value="monthly"
                  id="monthly"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="monthly"
                  className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center px-7 text-xl font-semibold"
                >
                  Monthly
                </Label>
              </div>
              <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-full transition-all'>
                <RadioGroupItem
                  value="annually"
                  id="annually"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="annually"
                  className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center gap-1 px-7 text-xl font-semibold"
                >
                  Yearly
                  <Badge
                    variant="outline"
                    className="bg-primary text-secondary ml-2 px-1.5"
                  >
                    Save 20%
                  </Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Pricing Packages */}
        <div className="mt-10 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg, idx) => (
            <div key={idx} className="rounded-2xl border p-6">
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl">{pkg.title}</h3>
                    {pkg.isPopular && <Badge>Popular</Badge>}
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-5xl font-semibold">
                      {isAnnually ? pkg.annualPrice : pkg.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      {isAnnually ? "/mo, billed annually" : "/mo"}
                    </span>
                  </div>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="border-muted-foreground cursor-pointer border-b border-dashed">
                          {pkg.description}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="">
                        Credits can be used for premium features and services.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button className="mt-6 w-full rounded-full">
                    {pkg.title === "Enterprise Plan"
                      ? "Contact Sale"
                      : "Get " + pkg.title}
                  </Button>
                  <div className="mt-6">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="mb-6">
                        <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                          {feature.title}
                        </h4>
                        <ul className="flex flex-col gap-3">
                          {feature.items.map((item, j) => (
                            <li key={j} className="flex gap-2">
                              <item.icon className="text-primary mt-1 size-4 shrink-0" />
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-8 flex items-center justify-center">
          <Lock className="size-4" />
          <span className="ml-2 text-sm">
            Secure payment. Powered by{" "}
            <a href="https://shadcnblocks.com" className="underline">
              shadcnblocks.com
            </a>
          </span>
        </div>
      </div>
    </section>
  );
};

export { Pricing28 };
