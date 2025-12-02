"use client";

import * as React from "react";
import {
  Save,
  RotateCcw,
  SlidersHorizontal,
  Globe,
  Languages,
  Gauge,
  ShieldCheck,
  Plug,
  ShoppingCart,
  BarChart3,
  Mail,
  Smartphone,
  MessageSquare,
  Users as UsersIcon,
  Search as SearchIcon,
  Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="relative inline-block w-12 h-6 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      />
      <div
        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}

export default function MySettings() {
  const [activeTab, setActiveTab] = React.useState("General");
  const [platformName, setPlatformName] = React.useState("Personal Wings");
  const [platformUrl, setPlatformUrl] = React.useState(
    "https://personalwings.com"
  );
  const [contactEmail, setContactEmail] = React.useState(
    "admin@personalwings.com"
  );
  const [supportPhone, setSupportPhone] = React.useState("+1 (555) 123-4567");
  const [platformDesc, setPlatformDesc] = React.useState(
    "Personal Wings - Premier aviation education and aircraft trading platform offering comprehensive flight training programs and premium aircraft sales services."
  );

  const [timeZone, setTimeZone] = React.useState("America/New_York (EST)");
  const [dateFormat, setDateFormat] = React.useState("MM/DD/YYYY (US)");
  const [currency, setCurrency] = React.useState("USD - US Dollar");
  const [units, setUnits] = React.useState("Imperial (Miles, Feet, Pounds)");

  const [defaultLanguage, setDefaultLanguage] = React.useState("English (US)");
  const [autoDetectLang, setAutoDetectLang] = React.useState(true);
  const [availableLangs, setAvailableLangs] = React.useState<
    Record<string, boolean>
  >({
    English: true,
    Spanish: true,
    French: false,
    German: false,
    Chinese: false,
    Arabic: false,
    Russian: false,
    Japanese: false,
  });

  const [cachingEnabled, setCachingEnabled] = React.useState(true);
  const [imageOptimization, setImageOptimization] = React.useState(true);
  const [cdnEnabled, setCdnEnabled] = React.useState(false);
  const [cacheDuration, setCacheDuration] = React.useState("6 hours");
  const [imageQuality, setImageQuality] = React.useState("Medium (Balanced)");

  const [twoFactor, setTwoFactor] = React.useState(true);
  const [passwordPolicy, setPasswordPolicy] = React.useState(
    "Standard (8+ characters, mixed case)"
  );

  const [shopifyConnected, setShopifyConnected] = React.useState(true);
  const [gaConnected, setGaConnected] = React.useState(true);
  const [emailServiceEnabled, setEmailServiceEnabled] = React.useState(false);

  const [brandPrimary, setBrandPrimary] = React.useState("#6366F1");
  const [brandSecondary, setBrandSecondary] = React.useState("#0F172A");
  const [brandAccent, setBrandAccent] = React.useState("#10B981");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [faviconUrl, setFaviconUrl] = React.useState("");

  const [stripeEnabled, setStripeEnabled] = React.useState(true);
  const [paypalEnabled, setPaypalEnabled] = React.useState(false);
  const [invoicePrefix, setInvoicePrefix] = React.useState("PW-");
  const [taxRate, setTaxRate] = React.useState("8%");
  const [paymentCurrency, setPaymentCurrency] =
    React.useState("USD - US Dollar");

  const [seoTitle, setSeoTitle] = React.useState(
    "Personal Wings – Premier aviation education and aircraft trading platform"
  );
  const [seoDescription, setSeoDescription] = React.useState(
    "Comprehensive flight training programs and premium aircraft sales services."
  );
  const [seoKeywords, setSeoKeywords] = React.useState(
    "aviation, flight training, aircraft sales, pilot courses"
  );
  const [ogImage, setOgImage] = React.useState("");
  const [sitemapEnabled, setSitemapEnabled] = React.useState(true);
  const [robotsIndex, setRobotsIndex] = React.useState("Index");
  const [canonicalUrl, setCanonicalUrl] = React.useState(
    "https://personalwings.com"
  );

  const [backupFrequency, setBackupFrequency] = React.useState("Daily");
  const [retentionPeriod, setRetentionPeriod] = React.useState("30 days");
  const [backupDestination, setBackupDestination] =
    React.useState("Local Storage");
  const [encryptionEnabled, setEncryptionEnabled] = React.useState(true);
  const [lastBackup, setLastBackup] = React.useState("Nov 10, 2025 02:30 AM");

  type NotificationPref = {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
  const [search, setSearch] = React.useState("");
  const [enableAll, setEnableAll] = React.useState(false);
  const initialSystemPrefs: NotificationPref[] = [
    {
      id: "system-updates",
      label: "System Updates",
      description: "Platform maintenance and feature updates",
      enabled: true,
      icon: Cog,
      color: "blue",
    },
    {
      id: "security-alerts",
      label: "Security Alerts",
      description: "Login attempts and security warnings",
      enabled: true,
      icon: ShieldCheck,
      color: "red",
    },
    {
      id: "student-activity",
      label: "Student Activity",
      description: "Enrollments, completions, and progress",
      enabled: false,
      icon: UsersIcon,
      color: "purple",
    },
  ];
  const [systemPrefs, setSystemPrefs] = React.useState(initialSystemPrefs);
  const filteredSystemPrefs = systemPrefs.filter((p) =>
    `${p.label} ${p.description}`.toLowerCase().includes(search.toLowerCase())
  );
  const [emailMarketing, setEmailMarketing] = React.useState({
    newsletter: true,
    productUpdates: true,
    specialOffers: false,
  });
  const [emailEducation, setEmailEducation] = React.useState({
    courseRecommendations: true,
    learningTips: false,
    industryNews: true,
  });
  const [quietStart, setQuietStart] = React.useState("10:00 PM");
  const [quietEnd, setQuietEnd] = React.useState("6:00 AM");
  const [days, setDays] = React.useState<Record<string, boolean>>({
    Sunday: false,
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
  });
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [smsEnabled, setSmsEnabled] = React.useState(true);
  const [sslEnforce, setSslEnforce] = React.useState(true);
  const [apiRateLimit, setApiRateLimit] = React.useState(true);
  const [sessionTimeout, setSessionTimeout] = React.useState("30 minutes");

  function resetToDefault() {
    setPlatformName("Personal Wings");
    setPlatformUrl("https://personalwings.com");
    setContactEmail("admin@personalwings.com");
    setSupportPhone("+1 (555) 123-4567");
    setPlatformDesc(
      "Personal Wings - Premier aviation education and aircraft trading platform offering comprehensive flight training programs and premium aircraft sales services."
    );
    setTimeZone("America/New_York (EST)");
    setDateFormat("MM/DD/YYYY (US)");
    setCurrency("USD - US Dollar");
    setUnits("Imperial (Miles, Feet, Pounds)");
    setDefaultLanguage("English (US)");
    setAutoDetectLang(true);
    setAvailableLangs({
      English: true,
      Spanish: true,
      French: false,
      German: false,
      Chinese: false,
      Arabic: false,
      Russian: false,
      Japanese: false,
    });
    setCachingEnabled(true);
    setImageOptimization(true);
    setCdnEnabled(false);
    setCacheDuration("6 hours");
    setImageQuality("Medium (Balanced)");
    setTwoFactor(true);
    setPasswordPolicy("Standard (8+ characters, mixed case)");
    setShopifyConnected(true);
    setGaConnected(true);
    setEmailServiceEnabled(false);
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Settings</h2>
          <p className="text-gray-600">
            Configure your Personal Wings platform preferences and system
            settings.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={resetToDefault}
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reset to Default
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex flex-wrap">
        {[
          "General",
          "Branding",
          "Payments",
          "SEO",
          "Notifications",
          "Backups",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } px-6 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h4 className="text-lg font-semibold text-secondary mb-4">
                General Settings
              </h4>
              <nav className="space-y-2">
                <a
                  className="flex items-center space-x-3 px-3 py-2 bg-primary/5 text-primary rounded-lg"
                  href="#"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Platform Settings</span>
                </a>
                <a
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  href="#"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Regional Settings</span>
                </a>
                <a
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  href="#"
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-sm">Language & Locale</span>
                </a>
                <a
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  href="#"
                >
                  <Gauge className="w-4 h-4" />
                  <span className="text-sm">Performance</span>
                </a>
                <a
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  href="#"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm">Security</span>
                </a>
                <a
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  href="#"
                >
                  <Plug className="w-4 h-4" />
                  <span className="text-sm">Integrations</span>
                </a>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-600 mb-3">
                  System Status
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Version</span>
                    <span className="font-medium">v2.4.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium">Oct 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">System Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cache Duration
                  </label>
                  <Select
                    value={cacheDuration}
                    onValueChange={setCacheDuration}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="6 hours">6 hours</SelectItem>
                      <SelectItem value="12 hours">12 hours</SelectItem>
                      <SelectItem value="24 hours">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Quality
                  </label>
                  <Select value={imageQuality} onValueChange={setImageQuality}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High (Best)">High (Best)</SelectItem>
                      <SelectItem value="Medium (Balanced)">
                        Medium (Balanced)
                      </SelectItem>
                      <SelectItem value="Low (Fastest)">
                        Low (Fastest)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Platform Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform URL
                  </label>
                  <input
                    value={platformUrl}
                    onChange={(e) => setPlatformUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Phone
                  </label>
                  <input
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Description
                </label>
                <textarea
                  rows={3}
                  value={platformDesc}
                  onChange={(e) => setPlatformDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Regional Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York (EST)">
                        America/New_York (EST)
                      </SelectItem>
                      <SelectItem value="America/Chicago (CST)">
                        America/Chicago (CST)
                      </SelectItem>
                      <SelectItem value="America/Denver (MST)">
                        America/Denver (MST)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles (PST)">
                        America/Los_Angeles (PST)
                      </SelectItem>
                      <SelectItem value="Europe/London (GMT)">
                        Europe/London (GMT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY (US)">
                        MM/DD/YYYY (US)
                      </SelectItem>
                      <SelectItem value="DD/MM/YYYY (EU)">
                        DD/MM/YYYY (EU)
                      </SelectItem>
                      <SelectItem value="YYYY-MM-DD (ISO)">
                        YYYY-MM-DD (ISO)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD - US Dollar">
                        USD - US Dollar
                      </SelectItem>
                      <SelectItem value="EUR - Euro">EUR - Euro</SelectItem>
                      <SelectItem value="GBP - British Pound">
                        GBP - British Pound
                      </SelectItem>
                      <SelectItem value="CAD - Canadian Dollar">
                        CAD - Canadian Dollar
                      </SelectItem>
                      <SelectItem value="AUD - Australian Dollar">
                        AUD - Australian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Measurement Units
                  </label>
                  <Select value={units} onValueChange={setUnits}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Imperial (Miles, Feet, Pounds)">
                        Imperial (Miles, Feet, Pounds)
                      </SelectItem>
                      <SelectItem value="Metric (Kilometers, Meters, Kilograms)">
                        Metric (Kilometers, Meters, Kilograms)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Language & Locale
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                  <Select
                    value={defaultLanguage}
                    onValueChange={setDefaultLanguage}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (US)">English (US)</SelectItem>
                      <SelectItem value="English (UK)">English (UK)</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-detect Language
                  </label>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      Detect user language automatically
                    </span>
                    <Toggle
                      checked={autoDetectLang}
                      onChange={setAutoDetectLang}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Languages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(availableLangs).map((lang) => (
                    <label key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        checked={availableLangs[lang]}
                        onCheckedChange={(v) =>
                          setAvailableLangs((s) => ({ ...s, [lang]: !!v }))
                        }
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Performance Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Caching System
                    </div>
                    <div className="text-sm text-gray-500">
                      Enable page and data caching for better performance
                    </div>
                  </div>
                  <Toggle
                    checked={cachingEnabled}
                    onChange={setCachingEnabled}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Image Optimization
                    </div>
                    <div className="text-sm text-gray-500">
                      Automatically optimize images for faster loading
                    </div>
                  </div>
                  <Toggle
                    checked={imageOptimization}
                    onChange={setImageOptimization}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      CDN Integration
                    </div>
                    <div className="text-sm text-gray-500">
                      Minify CSS and JavaScript files
                    </div>
                  </div>
                  <Toggle checked={cdnEnabled} onChange={setCdnEnabled} />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Security Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Two-Factor Authentication
                    </div>
                    <div className="text-sm text-gray-500">
                      Add an extra layer of account protection
                    </div>
                  </div>
                  <Toggle checked={twoFactor} onChange={setTwoFactor} />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      SSL Enforcement
                    </div>
                    <div className="text-sm text-gray-500">
                      Force HTTPS for all endpoints
                    </div>
                  </div>
                  <Toggle checked={sslEnforce} onChange={setSslEnforce} />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      API Rate Limiting
                    </div>
                    <div className="text-sm text-gray-500">
                      Prevent excessive API requests
                    </div>
                  </div>
                  <Toggle checked={apiRateLimit} onChange={setApiRateLimit} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout
                  </label>
                  <Select
                    value={sessionTimeout}
                    onValueChange={setSessionTimeout}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="60 minutes">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Strength Policy
                  </label>
                  <Select
                    value={passwordPolicy}
                    onValueChange={setPasswordPolicy}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic (6+ characters)">
                        Basic (6+ characters)
                      </SelectItem>
                      <SelectItem value="Standard (8+ characters, mixed case)">
                        Standard (8+ characters, mixed case)
                      </SelectItem>
                      <SelectItem value="Strong (12+ characters, special chars)">
                        Strong (12+ characters, special chars)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Integration Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Shopify Integration
                      </div>
                      <div className="text-sm text-gray-500">
                        Sync products and orders with Shopify
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {shopifyConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle
                      checked={shopifyConnected}
                      onChange={setShopifyConnected}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Google Analytics
                      </div>
                      <div className="text-sm text-gray-500">
                        Track website traffic and user behavior
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {gaConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle checked={gaConnected} onChange={setGaConnected} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Email Service
                      </div>
                      <div className="text-sm text-gray-500">
                        Send transactional and marketing emails
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {emailServiceEnabled ? "Enabled" : "Configure"}
                    </span>
                    <Toggle
                      checked={emailServiceEnabled}
                      onChange={setEmailServiceEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-1">
            <h4 className="text-lg font-semibold text-secondary mb-4">
              Notification Settings
            </h4>
            <nav className="space-y-1">
              {[
                { label: "General Notifications", icon: SlidersHorizontal },
                { label: "Email Preferences", icon: Mail },
                { label: "Push Notifications", icon: Smartphone },
                { label: "SMS Alerts", icon: MessageSquare },
                { label: "Team Notifications", icon: UsersIcon },
                { label: "Analytics Reports", icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-600 mb-3">
                Quick Actions
              </h5>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300"
                  onClick={() => setEnableAll(false)}
                >
                  Pause All Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300"
                >
                  Export Settings
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-secondary">
                  General Notification Settings
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Enable All</span>
                  <Toggle checked={enableAll} onChange={setEnableAll} />
                </div>
              </div>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Search notifications"
                />
              </div>
              <div className="space-y-4">
                {filteredSystemPrefs.map((p) => {
                  const Icon = p.icon;
                  const bgColor =
                    p.color === "blue"
                      ? "bg-blue-100"
                      : p.color === "red"
                      ? "bg-red-100"
                      : "bg-purple-100";
                  const textColor =
                    p.color === "blue"
                      ? "text-blue-600"
                      : p.color === "red"
                      ? "text-red-600"
                      : "text-purple-600";
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className={`${textColor} w-5 h-5`} />
                        </div>
                        <div>
                          <div className="font-medium text-secondary">
                            {p.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {p.description}
                          </div>
                        </div>
                      </div>
                      <Toggle
                        checked={p.enabled}
                        onChange={(v) =>
                          setSystemPrefs((prev) =>
                            prev.map((i) =>
                              i.id === p.id ? { ...i, enabled: v } : i
                            )
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Email Notification Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-secondary mb-4">
                    Marketing & Promotional
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Newsletter</div>
                        <div className="text-xs text-gray-500">
                          Weekly platform updates
                        </div>
                      </div>
                      <Toggle
                        checked={emailMarketing.newsletter}
                        onChange={(v) =>
                          setEmailMarketing((s) => ({ ...s, newsletter: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          Product Updates
                        </div>
                        <div className="text-xs text-gray-500">
                          New features and improvements
                        </div>
                      </div>
                      <Toggle
                        checked={emailMarketing.productUpdates}
                        onChange={(v) =>
                          setEmailMarketing((s) => ({
                            ...s,
                            productUpdates: v,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          Special Offers
                        </div>
                        <div className="text-xs text-gray-500">
                          Discounts and promotions
                        </div>
                      </div>
                      <Toggle
                        checked={emailMarketing.specialOffers}
                        onChange={(v) =>
                          setEmailMarketing((s) => ({ ...s, specialOffers: v }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-secondary mb-4">
                    Educational Content
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          Course Recommendations
                        </div>
                        <div className="text-xs text-gray-500">
                          Personalized learning suggestions
                        </div>
                      </div>
                      <Toggle
                        checked={emailEducation.courseRecommendations}
                        onChange={(v) =>
                          setEmailEducation((s) => ({
                            ...s,
                            courseRecommendations: v,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Learning Tips</div>
                        <div className="text-xs text-gray-500">
                          Educational resources and tips
                        </div>
                      </div>
                      <Toggle
                        checked={emailEducation.learningTips}
                        onChange={(v) =>
                          setEmailEducation((s) => ({ ...s, learningTips: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Industry News</div>
                        <div className="text-xs text-gray-500">
                          Education technology updates
                        </div>
                      </div>
                      <Toggle
                        checked={emailEducation.industryNews}
                        onChange={(v) =>
                          setEmailEducation((s) => ({ ...s, industryNews: v }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Notification Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiet Hours
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1">
                        Start Time
                      </label>
                      <Select value={quietStart} onValueChange={setQuietStart}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                          <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                          <SelectItem value="12:00 AM">12:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1">
                        End Time
                      </label>
                      <Select value={quietEnd} onValueChange={setQuietEnd}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6:00 AM">6:00 AM</SelectItem>
                          <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                          <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Days
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(days).map((d) => (
                      <label key={d} className="inline-flex items-center">
                        <Checkbox
                          checked={days[d]}
                          onCheckedChange={(v) =>
                            setDays((s) => ({ ...s, [d]: !!v }))
                          }
                        />
                        <span className="ml-2 text-sm">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Push Notifications
                      </div>
                      <div className="text-sm text-gray-500">
                        Receive alerts on your devices
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Enabled for all devices
                    </span>
                    <Toggle checked={pushEnabled} onChange={setPushEnabled} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        SMS Alerts
                      </div>
                      <div className="text-sm text-gray-500">
                        Get important updates via text message
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Standard rates may apply
                    </span>
                    <Toggle checked={smsEnabled} onChange={setSmsEnabled} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Brand Assets
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Brand Colors
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={brandPrimary}
                      onChange={(e) => setBrandPrimary(e.target.value)}
                      className="w-12 h-10 rounded-lg"
                    />
                    <input
                      type="text"
                      value={brandPrimary}
                      onChange={(e) => setBrandPrimary(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={brandSecondary}
                      onChange={(e) => setBrandSecondary(e.target.value)}
                      className="w-12 h-10 rounded-lg"
                    />
                    <input
                      type="text"
                      value={brandSecondary}
                      onChange={(e) => setBrandSecondary(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={brandAccent}
                      onChange={(e) => setBrandAccent(e.target.value)}
                      className="w-12 h-10 rounded-lg"
                    />
                    <input
                      type="text"
                      value={brandAccent}
                      onChange={(e) => setBrandAccent(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Typography
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Font
                  </label>
                  <Select value={"Inter"} onValueChange={() => {}}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Font
                  </label>
                  <Select value={"Inter"} onValueChange={() => {}}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Preview
              </h4>
              <div
                className="p-6 rounded-lg border border-gray-200"
                style={{
                  background: `linear-gradient(135deg, ${brandPrimary}22, ${brandAccent}22)`,
                }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ background: brandPrimary }}
                  />
                  <div>
                    <div className="font-bold text-secondary">
                      Personal Wings
                    </div>
                    <div className="text-sm text-gray-500">
                      Branding Preview
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-3 rounded w-3/4"
                    style={{ background: brandSecondary }}
                  />
                  <div
                    className="h-3 rounded w-1/2"
                    style={{ background: brandAccent }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Payment Gateways
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">Stripe</div>
                      <div className="text-sm text-gray-500">
                        Accept credit card payments
                      </div>
                    </div>
                  </div>
                  <Toggle checked={stripeEnabled} onChange={setStripeEnabled} />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">PayPal</div>
                      <div className="text-sm text-gray-500">
                        Process payments via PayPal
                      </div>
                    </div>
                  </div>
                  <Toggle checked={paypalEnabled} onChange={setPaypalEnabled} />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Billing Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate
                  </label>
                  <Select value={taxRate} onValueChange={setTaxRate}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tax" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0%">0%</SelectItem>
                      <SelectItem value="5%">5%</SelectItem>
                      <SelectItem value="8%">8%</SelectItem>
                      <SelectItem value="12%">12%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <Select
                    value={paymentCurrency}
                    onValueChange={setPaymentCurrency}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD - US Dollar">
                        USD - US Dollar
                      </SelectItem>
                      <SelectItem value="EUR - Euro">EUR - Euro</SelectItem>
                      <SelectItem value="GBP - British Pound">
                        GBP - British Pound
                      </SelectItem>
                      <SelectItem value="CAD - Canadian Dollar">
                        CAD - Canadian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Status
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Stripe</span>
                  <span>{stripeEnabled ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex justify-between">
                  <span>PayPal</span>
                  <span>{paypalEnabled ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currency</span>
                  <span>{paymentCurrency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "SEO" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Meta Information
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Indexing & Sitemap
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Robots
                  </label>
                  <Select value={robotsIndex} onValueChange={setRobotsIndex}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="robots" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Index">Index</SelectItem>
                      <SelectItem value="NoIndex">NoIndex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitemap
                  </label>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Enable Sitemap</div>
                      <div className="text-xs text-gray-500">
                        Auto-generate sitemap.xml
                      </div>
                    </div>
                    <Toggle
                      checked={sitemapEnabled}
                      onChange={setSitemapEnabled}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Social Sharing
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Image URL
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-600">Preview</div>
                  <div className="mt-3 h-24 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                    {ogImage ? "Image loaded" : "No image"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Backups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Backup Controls
              </h4>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-secondary">Encryption</div>
                  <div className="text-sm text-gray-500">
                    Encrypt backup archives
                  </div>
                </div>
                <Toggle
                  checked={encryptionEnabled}
                  onChange={setEncryptionEnabled}
                />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <Select
                    value={backupFrequency}
                    onValueChange={setBackupFrequency}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hourly">Hourly</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period
                  </label>
                  <Select
                    value={retentionPeriod}
                    onValueChange={setRetentionPeriod}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select retention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7 days">7 days</SelectItem>
                      <SelectItem value="30 days">30 days</SelectItem>
                      <SelectItem value="90 days">90 days</SelectItem>
                      <SelectItem value="180 days">180 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <Select
                    value={backupDestination}
                    onValueChange={setBackupDestination}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local Storage">
                        Local Storage
                      </SelectItem>
                      <SelectItem value="Amazon S3">Amazon S3</SelectItem>
                      <SelectItem value="Google Cloud Storage">
                        Google Cloud Storage
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Run Manual Backup
                </Button>
                <div className="text-sm text-gray-600">
                  Last Backup: {lastBackup}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Backup Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Frequency</span>
                  <span>{backupFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retention</span>
                  <span>{retentionPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Destination</span>
                  <span>{backupDestination}</span>
                </div>
                <div className="flex justify-between">
                  <span>Encryption</span>
                  <span>{encryptionEnabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Security Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      Two-Factor Authentication
                    </div>
                    <div className="text-sm text-gray-500">
                      Require 2FA for all admin accounts
                    </div>
                  </div>
                  <Toggle checked={twoFactor} onChange={setTwoFactor} />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      SSL Enforcement
                    </div>
                    <div className="text-sm text-gray-500">
                      Redirect all traffic to HTTPS
                    </div>
                  </div>
                  <Toggle checked={sslEnforce} onChange={setSslEnforce} />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-secondary">
                      API Rate Limiting
                    </div>
                    <div className="text-sm text-gray-500">
                      Limit API requests to prevent abuse
                    </div>
                  </div>
                  <Toggle checked={apiRateLimit} onChange={setApiRateLimit} />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout
                  </label>
                  <Select
                    value={sessionTimeout}
                    onValueChange={setSessionTimeout}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <Select
                    value={passwordPolicy}
                    onValueChange={setPasswordPolicy}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic (6+ characters)">
                        Basic (6+ characters)
                      </SelectItem>
                      <SelectItem value="Standard (8+ characters, mixed case)">
                        Standard (8+ characters, mixed case)
                      </SelectItem>
                      <SelectItem value="Strong (12+ characters, special chars)">
                        Strong (12+ characters, special chars)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Integrations" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-secondary mb-6">
                Integration Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plug className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Shopify Integration
                      </div>
                      <div className="text-sm text-gray-500">
                        Sync products and orders with Shopify
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {shopifyConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle
                      checked={shopifyConnected}
                      onChange={setShopifyConnected}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Google Analytics
                      </div>
                      <div className="text-sm text-gray-500">
                        Track website traffic and user behavior
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {gaConnected ? "Connected" : "Disconnected"}
                    </span>
                    <Toggle checked={gaConnected} onChange={setGaConnected} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Email Service
                      </div>
                      <div className="text-sm text-gray-500">
                        Send transactional and marketing emails
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {emailServiceEnabled ? "Enabled" : "Configure"}
                    </span>
                    <Toggle
                      checked={emailServiceEnabled}
                      onChange={setEmailServiceEnabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Advanced" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-secondary mb-2">
            Advanced Settings
          </h4>
          <p className="text-sm text-gray-600">
            Configure experimental and low-level options.
          </p>
        </div>
      )}
    </main>
  );
}
