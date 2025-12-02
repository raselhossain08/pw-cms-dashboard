"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Download,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Star,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Layers,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Plus,
  Palette,
  MousePointer2,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface CertificateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ElementType = "text" | "image" | "shape" | "background";
type ShapeType = "rectangle" | "circle" | "star" | "line";
type CertificateTemplate = "classic" | "modern" | "elegant" | "minimal";

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  opacity?: number;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
  shapeType?: ShapeType;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  imageUrl?: string;
}

export default function CertificateEditor({
  open,
  onOpenChange,
}: CertificateEditorProps) {
  const [elements, setElements] = React.useState<CanvasElement[]>([
    {
      id: "title-1",
      type: "text",
      x: 150,
      y: 80,
      width: 500,
      height: 60,
      rotation: 0,
      content: "CERTIFICATE OF COMPLETION",
      fontSize: 36,
      fontFamily: "serif",
      fontWeight: "bold",
      color: "#1e40af",
      textAlign: "center",
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
    },
    {
      id: "name-1",
      type: "text",
      x: 200,
      y: 200,
      width: 400,
      height: 50,
      rotation: 0,
      content: "John Doe",
      fontSize: 42,
      fontFamily: "serif",
      fontWeight: "bold",
      color: "#1f2937",
      textAlign: "center",
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
    },
  ]);

  const [selectedElement, setSelectedElement] = React.useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [canvasSize] = React.useState({ width: 800, height: 600 });
  const [zoom, setZoom] = React.useState(100);
  const [history, setHistory] = React.useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [leftPanelTab, setLeftPanelTab] = React.useState("elements");
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [certificateData, setCertificateData] = React.useState({
    title: "CERTIFICATE OF COMPLETION",
    subtitle: "This certifies that",
    recipientName: "John Doe",
    bodyText: "has successfully completed",
    courseName: "Aviation Safety Fundamentals",
    completionText: "with distinction and outstanding performance",
    date: new Date().toLocaleDateString(),
    signatureName: "Instructor Name",
    signatureTitle: "Head of Training",
  });

  const colorSchemes = {
    gold: {
      border: "border-yellow-400",
      bg: "bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100",
      accent: "text-yellow-700",
      seal: "bg-yellow-500",
    },
    blue: {
      border: "border-blue-400",
      bg: "bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100",
      accent: "text-blue-700",
      seal: "bg-blue-500",
    },
    purple: {
      border: "border-purple-400",
      bg: "bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100",
      accent: "text-purple-700",
      seal: "bg-purple-500",
    },
    green: {
      border: "border-emerald-400",
      bg: "bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100",
      accent: "text-emerald-700",
      seal: "bg-emerald-500",
    },
  } as const;

  type ColorSchemeKey = keyof typeof colorSchemes;
  const [template, setTemplate] = React.useState<CertificateTemplate>("classic");
  const [colorScheme, setColorScheme] = React.useState<ColorSchemeKey>("gold");

  const handleInputChange = (field: string, value: string) => {
    setCertificateData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderCertificatePreview = () => {
    const scheme = colorSchemes[colorScheme];

    return (
      <div className="relative w-full aspect-[1.414/1] overflow-hidden">
        <div
          className={`w-full h-full ${scheme.bg} border-8 ${scheme.border} rounded-lg shadow-2xl p-8 sm:p-12 flex flex-col justify-between`}
        >
          {/* Decorative Corner Elements */}
          <div className={`absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 ${scheme.border} rounded-tl-lg`}></div>
          <div className={`absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 ${scheme.border} rounded-tr-lg`}></div>
          <div className={`absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 ${scheme.border} rounded-bl-lg`}></div>
          <div className={`absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 ${scheme.border} rounded-br-lg`}></div>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <Award className={`w-12 h-12 sm:w-16 sm:h-16 ${scheme.accent}`} />
            </div>
            <h1
              className={`text-2xl sm:text-4xl font-bold ${scheme.accent} tracking-wider`}
            >
              {certificateData.title}
            </h1>
            <div
              className={`w-24 h-1 ${scheme.seal} mx-auto rounded-full`}
            ></div>
          </div>

          {/* Body */}
          <div className="text-center space-y-4 my-8">
            <p className="text-sm sm:text-base text-gray-600 italic">
              {certificateData.subtitle}
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900">
              {certificateData.recipientName}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {certificateData.bodyText}
            </p>
            <h3 className="text-xl sm:text-3xl font-semibold text-gray-800">
              {certificateData.courseName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 italic max-w-md mx-auto">
              {certificateData.completionText}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="w-32 sm:w-40 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {certificateData.signatureName}
              </p>
              <p className="text-xs text-gray-500">
                {certificateData.signatureTitle}
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 ${scheme.seal} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}
              >
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 sm:w-40 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                Date
              </p>
              <p className="text-xs text-gray-500">{certificateData.date}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Certificate Designer
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Design and customize your certificate template with graphics and
            styling
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 py-4">
          {/* Left Panel - Controls */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Palette className="w-4 h-4" />
                Certificate Template
              </Label>
              <Select
                value={template}
                onValueChange={(v) => setTemplate(v as CertificateTemplate)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic Elegance</SelectItem>
                  <SelectItem value="modern">Modern Minimalist</SelectItem>
                  <SelectItem value="elegant">Elegant Formal</SelectItem>
                  <SelectItem value="minimal">Simple Clean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Scheme */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Palette className="w-4 h-4" />
                Color Scheme
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setColorScheme("gold")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    colorScheme === "gold"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <div className="w-full h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded"></div>
                  <p className="text-xs mt-1 text-center">Gold</p>
                </button>
                <button
                  onClick={() => setColorScheme("blue")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    colorScheme === "blue"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="w-full h-8 bg-gradient-to-r from-blue-400 to-sky-500 rounded"></div>
                  <p className="text-xs mt-1 text-center">Blue</p>
                </button>
                <button
                  onClick={() => setColorScheme("purple")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    colorScheme === "purple"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="w-full h-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded"></div>
                  <p className="text-xs mt-1 text-center">Purple</p>
                </button>
                <button
                  onClick={() => setColorScheme("green")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    colorScheme === "green"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="w-full h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded"></div>
                  <p className="text-xs mt-1 text-center">Green</p>
                </button>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 border-t pt-4">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Type className="w-4 h-4" />
                Certificate Content
              </Label>

              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={certificateData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Recipient Name</Label>
                <Input
                  value={certificateData.recipientName}
                  onChange={(e) =>
                    handleInputChange("recipientName", e.target.value)
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Course Name</Label>
                <Input
                  value={certificateData.courseName}
                  onChange={(e) =>
                    handleInputChange("courseName", e.target.value)
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Completion Text</Label>
                <Textarea
                  value={certificateData.completionText}
                  onChange={(e) =>
                    handleInputChange("completionText", e.target.value)
                  }
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">Signature Name</Label>
                  <Input
                    value={certificateData.signatureName}
                    onChange={(e) =>
                      handleInputChange("signatureName", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Signature Title</Label>
                  <Input
                    value={certificateData.signatureTitle}
                    onChange={(e) =>
                      handleInputChange("signatureTitle", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <Undo className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Redo className="w-4 h-4 mr-1" />
                Redo
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <ImageIcon className="w-4 h-4 mr-1" />
                Add Logo
              </Button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-4 order-1 lg:order-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Eye className="w-4 h-4" />
                Live Preview
              </Label>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
            <div className="border-2 border-border rounded-lg p-2 sm:p-4 bg-muted/20">
              {renderCertificatePreview()}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
