"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common } from "lowlight";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link2,
  Heading1,
  Heading2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdown";

interface RichMarkdownEditorProps {
  initialMarkdown?: string;
  onMarkdownChange: (markdown: string) => void;
}

export function RichMarkdownEditor({
  initialMarkdown = "",
  onMarkdownChange,
}: RichMarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  const initialContent = useMemo(
    () => markdownToHtml(initialMarkdown),
    [initialMarkdown],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: "Write your story in rich text, then save it as markdown.",
      }),
      CodeBlockLowlight.configure({
        lowlight: common,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate min-h-[18rem] max-w-none rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none",
      },
    },
    onUpdate({ editor: currentEditor }) {
      const nextMarkdown = htmlToMarkdown(currentEditor.getHTML());
      setMarkdown(nextMarkdown);
      onMarkdownChange(nextMarkdown);
    },
  });

  function setLink() {
    const url = window.prompt("Enter the link URL");
    if (!url) {
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/40 p-2">
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor?.isActive("heading", { level: 1 })}
          label="Heading 1"
          icon={<Heading1 className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor?.isActive("heading", { level: 2 })}
          label="Heading 2"
          icon={<Heading2 className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          label="Bold"
          icon={<Bold className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          label="Italic"
          icon={<Italic className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          label="Bullet list"
          icon={<List className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          label="Ordered list"
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
          label="Blockquote"
          icon={<Quote className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive("codeBlock")}
          label="Code block"
          icon={<Code className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={setLink}
          active={editor?.isActive("link")}
          label="Link"
          icon={<Link2 className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().clearNodes().unsetAllMarks().run()
          }
          label="Clear formatting"
          icon={<RotateCcw className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorContent editor={editor} />
          <p className="mt-2 text-xs text-muted-foreground">
            TipTap is stored as markdown in the backend. The preview updates
            live.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Live Preview</h3>
            <span className="text-xs text-muted-foreground">
              Markdown length: {markdown.length}
            </span>
          </div>
          <div
            className="prose prose-slate max-w-none prose-pre:rounded-lg prose-pre:bg-slate-950 prose-pre:text-slate-100"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
          />
        </div>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  label: string;
  icon: ReactNode;
}

function ToolbarButton({
  onClick,
  active = false,
  label,
  icon,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn("gap-2", active ? "shadow-sm" : "")}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
