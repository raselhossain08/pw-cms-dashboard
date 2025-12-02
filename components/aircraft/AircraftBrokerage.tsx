"use client";

import * as React from "react";
import Image from "next/image";
import {
  Download,
  Plus,
  Plane,
  HandCoins,
  MessagesSquare,
  DollarSign,
  Search as SearchIcon,
  Calendar,
  MapPin,
  Gauge,
  Wrench,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ListingStatus = "Available" | "Reserved" | "Under Contract" | "Sold";
type AircraftType =
  | "Piston Single"
  | "Piston Multi"
  | "Turboprop"
  | "Business Jet"
  | "Helicopter";

type AircraftListing = {
  id: string;
  title: string;
  model: string;
  type: AircraftType;
  status: ListingStatus;
  price: string;
  hours: string;
  location: string;
  engine?: string;
  avionics?: string;
  imageUrl?: string;
};

const initialListings: AircraftListing[] = [
  {
    id: "a1",
    title: "Cessna 172S",
    model: "2018",
    type: "Piston Single",
    status: "Available",
    price: "$389,000",
    hours: "1,240 TTAF",
    location: "KAPA – Denver, CO",
    engine: "Lycoming IO-360",
    avionics: "Garmin G1000 NXi",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25856cd63?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "a2",
    title: "King Air 350",
    model: "2014",
    type: "Turboprop",
    status: "Reserved",
    price: "$3,200,000",
    hours: "3,480 TTAF",
    location: "KDAL – Dallas, TX",
    engine: "PT6A-60A",
    avionics: "Collins Pro Line 21",
    imageUrl:
      "https://images.unsplash.com/photo-1558618667-d2d6e735c694?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "a3",
    title: "Cirrus SR22",
    model: "2019",
    type: "Piston Single",
    status: "Available",
    price: "$749,000",
    hours: "820 TTAF",
    location: "KAPA – Denver, CO",
    engine: "Continental TSIO-550",
    avionics: "Cirrus Perspective+",
    imageUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  },
];

export default function AircraftBrokerage() {
  const [addOpen, setAddOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Aircraft For Sale");
  const [typeFilter, setTypeFilter] = React.useState<
    "All Types" | AircraftType
  >("All Types");
  const [statusFilter, setStatusFilter] = React.useState<
    "All Status" | ListingStatus
  >("All Status");
  const [search, setSearch] = React.useState("");

  const filtered = initialListings.filter((l) => {
    const matchesType = typeFilter === "All Types" || l.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Status" || l.status === statusFilter;
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const statusChip = (s: ListingStatus) =>
    s === "Available"
      ? "bg-green-100 text-green-700"
      : s === "Reserved"
      ? "bg-yellow-100 text-yellow-700"
      : s === "Under Contract"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Aircraft Brokerage
          </h2>
          <p className="text-gray-600">
            Manage aircraft listings, buying requests, and client inquiries.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" /> Export Data
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Aircraft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Aircraft For Sale
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {initialListings.length}
              </p>
              <p className="text-accent text-sm mt-1">+3 this month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plane className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Buying Requests
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">18</p>
              <p className="text-accent text-sm mt-1">5 new this week</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <HandCoins className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Inquiries
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">47</p>
              <p className="text-accent text-sm mt-1">12 unread</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessagesSquare className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold text-secondary mt-1">$42M</p>
              <p className="text-accent text-sm mt-1">+8% from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            "Aircraft For Sale",
            "Aircraft Wanted",
            "Inquiry Messages",
            "Aircraft Types",
            "Client Management",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-4 px-1 font-medium text-sm ${
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

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-secondary">
            Aircraft For Sale
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <Select
                value={typeFilter}
                onValueChange={(v) =>
                  setTypeFilter(v as AircraftType | "All Types")
                }
              >
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="Piston Single">Piston Single</SelectItem>
                  <SelectItem value="Piston Multi">Piston Multi</SelectItem>
                  <SelectItem value="Turboprop">Turboprop</SelectItem>
                  <SelectItem value="Business Jet">Business Jet</SelectItem>
                  <SelectItem value="Helicopter">Helicopter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as ListingStatus | "All Status")
                }
              >
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Under Contract">Under Contract</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search by model, location..."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="aircraft-card bg-card rounded-xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="relative">
                {a.imageUrl ? (
                  <Image
                    src={a.imageUrl}
                    alt={a.title}
                    width={800}
                    height={300}
                    className="w-full h-48 object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100" />
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-white text-xs px-2 py-1 rounded-full ${statusChip(
                      a.status
                    )}`}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {a.type}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-secondary">{a.title}</h4>
                    <p className="text-sm text-gray-600">{a.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-secondary">
                      {a.price}
                    </p>
                    <p className="text-xs text-gray-500">Negotiable</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    <span>{a.hours}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{a.location}</span>
                  </div>
                  {a.engine && (
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <span>{a.engine}</span>
                    </div>
                  )}
                  {a.avionics && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{a.avionics}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1">View Details</Button>
                  <Button variant="outline" className="flex-1 border-gray-300">
                    Contact Seller
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-secondary">
            Aircraft Wanted (Buying Requests)
          </h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Request
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plane className="text-primary w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary">
                  Piston Aircraft
                </h4>
                <p className="text-sm text-gray-600">
                  Single & Multi-engine piston aircraft
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Cessna 172", info: "12 listings available" },
                { label: "Piper PA-28", info: "8 listings available" },
                { label: "Cirrus SR22", info: "6 listings available" },
                { label: "Beechcraft Bonanza", info: "4 listings available" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.info}</p>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plane className="text-purple-600 w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary">
                  Turbine Aircraft
                </h4>
                <p className="text-sm text-gray-600">
                  Turboprop & Business jets
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "King Air 350", info: "5 listings available" },
                { label: "Pilatus PC-12", info: "3 listings available" },
                { label: "Citation CJ3", info: "2 listings available" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Aircraft</DialogTitle>
            <DialogDescription>Enter aircraft details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircraft Model
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Cessna 172S"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Cessna"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., 2018"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., $389,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Hours
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., 1,240 TTAF"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., KAPA – Denver, CO"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avionics
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Garmin G1000 NXi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Lycoming IO-360"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <Select defaultValue="Piston Single">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piston Single">Piston Single</SelectItem>
                    <SelectItem value="Piston Multi">Piston Multi</SelectItem>
                    <SelectItem value="Turboprop">Turboprop</SelectItem>
                    <SelectItem value="Business Jet">Business Jet</SelectItem>
                    <SelectItem value="Helicopter">Helicopter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select defaultValue="Available">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Under Contract">
                      Under Contract
                    </SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-sm">
                Drag and drop aircraft photos here or click to upload
              </p>
              <Button variant="outline" className="mt-2 border-gray-300">
                Select Files
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setAddOpen(false)}>Add Aircraft</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
