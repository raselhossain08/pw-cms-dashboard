"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  Plug,
  Megaphone,
  MessageSquare,
  BarChart3,
  Code2,
  EllipsisVertical,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type IntegrationStatus = "connected" | "disconnected" | "pending";

type IntegrationItem = {
  id: string;
  name: string;
  category:
    | "Payment Gateways"
    | "Communication"
    | "Marketing"
    | "Analytics"
    | "Developer Tools";
  description: string;
  status: IntegrationStatus;
  logo?: string;
  stats?: { label: string; value: string }[];
};

const initialIntegrations: IntegrationItem[] = [
  {
    id: "stripe",
    name: "Stripe",
    category: "Payment Gateways",
    description: "Secure payment processing for your courses and subscriptions",
    status: "connected",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png",
    stats: [
      { label: "Transactions", value: "1,240" },
      { label: "Revenue", value: "$84,329" },
      { label: "Region", value: "India" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    category: "Payment Gateways",
    description: "Global payments and payouts",
    status: "disconnected",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/512px-PayPal.svg.png",
    stats: [
      { label: "Transactions", value: "—" },
      { label: "Status", value: "Not configured" },
    ],
  },
  {
    id: "smtp",
    name: "Email SMTP",
    category: "Communication",
    description: "Transactional emails and notifications",
    status: "connected",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png",
    stats: [
      { label: "Daily Limit", value: "10,000" },
      { label: "Status", value: "Active" },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "Communication",
    description: "SMS and voice notifications",
    status: "pending",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Twilio_logo_red.svg/512px-Twilio_logo_red.svg.png",
    stats: [
      { label: "Status", value: "API keys needed" },
      { label: "Features", value: "SMS, Voice" },
    ],
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    category: "Marketing",
    description: "Campaign tracking and conversion",
    status: "disconnected",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Facebook_Logo_2023.png/512px-Facebook_Logo_2023.png",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    category: "Analytics",
    description: "Website analytics and performance",
    status: "connected",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Google_Analytics_logo.png/512px-Google_Analytics_logo.png",
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] =
    React.useState<IntegrationItem[]>(initialIntegrations);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("All Integrations");
  const [addOpen, setAddOpen] = React.useState(false);

  const statusChip = (s: IntegrationStatus) =>
    s === "connected"
      ? "bg-green-600 text-white"
      : s === "pending"
      ? "bg-yellow-500 text-white"
      : "bg-red-500 text-white";

  const iconForCategory = (c: IntegrationItem["category"]) => {
    if (c === "Payment Gateways") return Plug;
    if (c === "Communication") return MessageSquare;
    if (c === "Marketing") return Megaphone;
    if (c === "Analytics") return BarChart3;
    return Code2;
  };

  const filtered = integrations.filter((it) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      it.name.toLowerCase().includes(q) ||
      it.description.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q);
    const matchesTab =
      activeTab === "All Integrations" || it.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Integrations
          </h2>
          <p className="text-gray-600">
            Connect your platform with third-party services and tools
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integrations..."
              className="w-64 pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Integration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Integrations
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {integrations.filter((i) => i.status === "connected").length}
              </p>
              <p className="text-accent text-sm mt-1">+2 this month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plug className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Connected Services
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {integrations.length}
              </p>
              <p className="text-accent text-sm mt-1">Growing</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Disconnected</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {integrations.filter((i) => i.status === "disconnected").length}
              </p>
              <p className="text-red-500 text-sm mt-1">Action needed</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Setup</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {integrations.filter((i) => i.status === "pending").length}
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Needs configuration
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            "All Integrations",
            "Payment Gateways",
            "Communication",
            "Marketing",
            "Analytics",
            "Developer Tools",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-4 px-1 font-medium text-sm integration-tab ${
                activeTab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {(
        [
          "Payment Gateways",
          "Communication",
          "Marketing",
          "Analytics",
          "Developer Tools",
        ] as const
      ).map((section) => {
        const Icon = iconForCategory(section);
        const items = filtered.filter((i) => i.category === section);
        if (!items.length && activeTab !== "All Integrations") return null;
        return (
          <div key={section} className="mb-12">
            <h3 className="text-xl font-semibold text-secondary mb-6">
              {section}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations
                .filter((i) => i.category === section)
                .filter((i) => filtered.includes(i))
                .map((i) => (
                  <div
                    key={i.id}
                    className="integration-card bg-card rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {i.logo ? (
                            <Image
                              src={i.logo}
                              alt={i.name}
                              width={32}
                              height={32}
                              unoptimized
                            />
                          ) : (
                            <Icon className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-secondary">
                            {i.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {i.description}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-white text-xs px-2 py-1 rounded-full ${statusChip(
                          i.status
                        )}`}
                      >
                        {i.status === "connected"
                          ? "Connected"
                          : i.status === "pending"
                          ? "Pending"
                          : "Disconnected"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage configuration and view usage details
                    </p>
                    {i.stats && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {i.stats.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">{s.label}</span>
                            <span className="font-medium">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <Button className="flex-1">
                        {i.status === "connected"
                          ? "Configure"
                          : i.status === "pending"
                          ? "Setup Now"
                          : "Connect"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      })}

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">
            API Documentation
          </h3>
          <Button>
            <Plug className="w-4 h-4 mr-2" /> Generate API Key
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Code2 className="text-primary w-5 h-5" />
              </div>
              <h4 className="font-medium text-secondary">REST API</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Complete REST API docs for building custom integrations
            </p>
            <Button variant="link" className="text-primary px-0">
              View Documentation →
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Plug className="text-accent w-5 h-5" />
              </div>
              <h4 className="font-medium text-secondary">Webhooks</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set up webhooks to receive real-time notifications
            </p>
            <Button variant="link" className="text-primary px-0">
              Configure Webhooks →
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-purple-600 w-5 h-5" />
              </div>
              <h4 className="font-medium text-secondary">Security</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Learn about API security and best practices
            </p>
            <Button variant="link" className="text-primary px-0">
              Security Guide →
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>Search available integrations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Integrations
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Search available integrations..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "stripe",
                  name: "Stripe",
                  logo: initialIntegrations[0].logo,
                  desc: "Payment processing",
                },
                {
                  id: "paypal",
                  name: "PayPal",
                  logo: initialIntegrations[1].logo,
                  desc: "Payments & payouts",
                },
                {
                  id: "twilio",
                  name: "Twilio",
                  logo: initialIntegrations[3].logo,
                  desc: "SMS & Voice",
                },
                {
                  id: "ga",
                  name: "Google Analytics",
                  logo: initialIntegrations[5].logo,
                  desc: "Analytics",
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {opt.logo ? (
                        <Image
                          src={opt.logo}
                          alt={opt.name}
                          width={24}
                          height={24}
                          unoptimized
                        />
                      ) : (
                        <Plug className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary">{opt.name}</h4>
                      <p className="text-sm text-gray-600">{opt.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setAddOpen(false)}>Continue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
