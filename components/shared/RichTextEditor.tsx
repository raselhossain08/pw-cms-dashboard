"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Underline as UnderlineIcon,
  Eye,
  Code2,
  Palette,
  Upload,
  X,
  Check,
} from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import { uploadService } from "@/services/upload.service";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const COLOR_PRESETS = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#808080",
  "#800000",
  "#008000",
  "#000080",
  "#808000",
  "#800080",
  "#008080",
  "#c0c0c0",
  "#ff8080",
  "#80ff80",
  "#8080ff",
  "#ffff80",
];

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
}: RichTextEditorProps) {
  const [isVisualMode, setIsVisualMode] = useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-6",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      onChange(html);
      // Calculate word count
      const text = editor.getText();
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      setWordCount(words.length);
      // Reset flag after a short delay
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
  });

  // Update editor content when content prop changes (but not from internal updates)
  useEffect(() => {
    if (editor && !isInternalUpdate.current && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      setUploading(true);
      try {
        const result = await uploadService.uploadFile(file, {
          type: "image",
        });
        editor.chain().focus().setImage({ src: result.url }).run();
        setImageDialogOpen(false);
        setImageUrl("");
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const handleImageFromUrl = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageDialogOpen(false);
    setImageUrl("");
  }, [editor, imageUrl]);

  const handleLinkInsert = useCallback(() => {
    if (!editor) return;

    if (linkText && linkUrl) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
        .run();
    } else if (linkUrl) {
      const selectedText =
        editor.state.selection.content().size > 0
          ? editor.state.doc.textBetween(
              editor.state.selection.from,
              editor.state.selection.to
            )
          : linkUrl;

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }

    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
  }, [editor, linkUrl, linkText]);

  const setTextColor = useCallback(
    (color: string) => {
      if (!editor) return;
      editor.chain().focus().setColor(color).run();
      setColorPickerOpen(false);
    },
    [editor]
  );

  const toggleMode = useCallback(() => {
    if (!editor) return;
    setIsVisualMode(!isVisualMode);
    if (!isVisualMode) {
      // Switching to visual mode - set HTML content
      editor.commands.setContent(content);
    }
  }, [editor, isVisualMode, content]);

  if (!editor) {
    return null;
  }

  const currentTextColor = editor.getAttributes("textStyle").color || "#000000";

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {/* WordPress-style Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-gray-900">
        {/* Top Toolbar Row */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            {/* Visual/Text Mode Toggle */}
            <div className="flex border rounded-md overflow-hidden">
              <Button
                type="button"
                variant={isVisualMode ? "default" : "ghost"}
                size="sm"
                onClick={toggleMode}
                className="rounded-none border-0"
                title="Visual"
              >
                <Eye className="h-4 w-4 mr-1" />
                Visual
              </Button>
              <Button
                type="button"
                variant={!isVisualMode ? "default" : "ghost"}
                size="sm"
                onClick={toggleMode}
                className="rounded-none border-0"
                title="Text"
              >
                <Code2 className="h-4 w-4 mr-1" />
                Text
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Text Formatting */}
            <div className="flex gap-1">
              <Button
                type="button"
                variant={editor.isActive("bold") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold (Ctrl+B)"
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("italic") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic (Ctrl+I)"
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("underline") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Underline"
                className="h-8 w-8 p-0"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("strike") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
                className="h-8 w-8 p-0"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Headings Dropdown */}
            <Select
              value={
                editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                  ? "h4"
                  : editor.isActive("heading", { level: 5 })
                  ? "h5"
                  : editor.isActive("heading", { level: 6 })
                  ? "h6"
                  : "paragraph"
              }
              onValueChange={(value) => {
                if (value === "paragraph") {
                  editor.chain().focus().setParagraph().run();
                } else {
                  const level = parseInt(value.replace("h", "")) as
                    | 1
                    | 2
                    | 3
                    | 4
                    | 5
                    | 6;
                  editor.chain().focus().toggleHeading({ level }).run();
                }
              }}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Paragraph" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Paragraph</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
                <SelectItem value="h4">Heading 4</SelectItem>
                <SelectItem value="h5">Heading 5</SelectItem>
                <SelectItem value="h6">Heading 6</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Lists */}
            <div className="flex gap-1">
              <Button
                type="button"
                variant={editor.isActive("bulletList") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("orderedList") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered List"
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("blockquote") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Quote"
                className="h-8 w-8 p-0"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Alignment */}
            <div className="flex gap-1">
              <Button
                type="button"
                variant={
                  editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
                }
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                title="Align Left"
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={
                  editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
                }
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                title="Align Center"
                className="h-8 w-8 p-0"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={
                  editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
                }
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                title="Align Right"
                className="h-8 w-8 p-0"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={
                  editor.isActive({ textAlign: "justify" })
                    ? "default"
                    : "ghost"
                }
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                title="Justify"
                className="h-8 w-8 p-0"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Insert */}
            <div className="flex gap-1">
              <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant={editor.isActive("link") ? "default" : "ghost"}
                    size="sm"
                    title="Insert/Edit Link"
                    className="h-8 w-8 p-0"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Insert Link</DialogTitle>
                    <DialogDescription>
                      Enter the URL and optional link text
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkUrl">URL</Label>
                      <Input
                        id="linkUrl"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkText">Link Text (optional)</Label>
                      <Input
                        id="linkText"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        placeholder="Link text"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setLinkDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleLinkInsert}>Insert Link</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Insert Image"
                    className="h-8 w-8 p-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                    <DialogDescription>
                      Upload an image or insert from URL
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageUpload">Upload Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          ref={fileInputRef}
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? "Uploading..." : "Choose File"}
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                          Or
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="imageUrl"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button
                          type="button"
                          onClick={handleImageFromUrl}
                          disabled={!imageUrl}
                        >
                          Insert
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Color Picker */}
              <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Text Color"
                    className="h-8 w-8 p-0"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                          style={{ backgroundColor: currentTextColor }}
                        />
                        <Input
                          type="color"
                          value={currentTextColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 h-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Preset Colors</Label>
                      <div className="grid grid-cols-10 gap-1">
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => setTextColor(color)}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Right side - Undo/Redo and Word Count */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
                className="h-8 w-8 p-0"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Y)"
                className="h-8 w-8 p-0"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
              {wordCount} words
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      {isVisualMode ? (
        <div className="relative">
          <EditorContent editor={editor} />
          <style jsx global>{`
            .tiptap p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: #adb5bd;
              pointer-events: none;
              height: 0;
            }
            .tiptap img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 1rem 0;
            }
            .tiptap a {
              color: #3b82f6;
              text-decoration: underline;
              cursor: pointer;
            }
            .tiptap h1,
            .tiptap h2,
            .tiptap h3,
            .tiptap h4,
            .tiptap h5,
            .tiptap h6 {
              font-weight: 600;
              line-height: 1.2;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            .tiptap h1 {
              font-size: 2em;
            }
            .tiptap h2 {
              font-size: 1.5em;
            }
            .tiptap h3 {
              font-size: 1.25em;
            }
            .tiptap ul,
            .tiptap ol {
              padding-left: 1.5em;
              margin: 1em 0;
            }
            .tiptap blockquote {
              border-left: 4px solid #e5e7eb;
              padding-left: 1em;
              margin: 1em 0;
              font-style: italic;
              color: #6b7280;
            }
            .tiptap code {
              background-color: #f3f4f6;
              padding: 0.2em 0.4em;
              border-radius: 0.25rem;
              font-size: 0.9em;
            }
          `}</style>
        </div>
      ) : (
        <textarea
          value={editor.getHTML()}
          onChange={(e) => {
            editor.commands.setContent(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[400px] p-4 font-mono text-sm border-0 focus:outline-none resize-none dark:bg-gray-900 dark:text-gray-100"
          placeholder="Enter HTML content..."
        />
      )}
    </div>
  );
}
