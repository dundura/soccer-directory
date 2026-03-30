"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useRef } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      tabIndex={-1}
      className={`px-2 py-1 rounded text-xs font-bold transition-colors ${active ? "bg-primary text-white" : "text-primary hover:bg-white"}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ content, onChange, placeholder, minHeight = "300px" }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-5 py-4",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url) return;
    if (editor.state.selection.empty) {
      const text = prompt("Enter link text:", "") || url;
      editor.chain().focus().insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 bg-surface border-b border-border flex-wrap">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          B
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <span className="underline">U</span>
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
          H2
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subheading">
          H3
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
          &#8226; List
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
          1. List
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          &ldquo;&rdquo;
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("link")} onClick={addLink} title="Insert Link">
          &#128279;
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert Image URL">
          &#128247;
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left">
          &#9776;
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center">
          &#9868;
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Placeholder style */}
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: "${placeholder || "Start writing..."}";
          color: #9ca3af;
          float: left;
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          min-height: ${minHeight};
        }
        .tiptap h2 { font-size: 1.5em; font-weight: 700; margin: 1em 0 0.5em; color: #1a365d; }
        .tiptap h3 { font-size: 1.25em; font-weight: 600; margin: 0.8em 0 0.4em; color: #1a365d; }
        .tiptap p { margin: 0.5em 0; line-height: 1.8; }
        .tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap li { margin: 0.25em 0; }
        .tiptap blockquote { border-left: 3px solid #DC373E; padding-left: 1em; margin: 1em 0; color: #666; font-style: italic; }
        .tiptap a { color: #DC373E; text-decoration: underline; }
        .tiptap img { max-width: 100%; border-radius: 12px; margin: 1em 0; }
        .tiptap strong { font-weight: 700; }
        .tiptap em { font-style: italic; }
        .tiptap u { text-decoration: underline; }
      `}</style>
    </div>
  );
}
