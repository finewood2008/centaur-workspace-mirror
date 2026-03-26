/**
 * EmailRichEditor - 邮件富文本编辑器
 * 提供格式化工具栏和附件上传功能
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Highlighter, Undo2, Redo2,
  Paperclip, X, FileText, Image as ImageIcon, File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";

interface Attachment {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
}

export interface EmailRichEditorRef {
  getHTML: () => string;
  getText: () => string;
  setContent: (content: string) => void;
  getAttachments: () => Attachment[];
  focus: () => void;
  clear: () => void;
}

interface EmailRichEditorProps {
  recipientEmail?: string;
  placeholder?: string;
  onSend?: (html: string, text: string, attachments: Attachment[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="w-3.5 h-3.5 text-primary" />;
  if (type.includes("pdf")) return <FileText className="w-3.5 h-3.5 text-destructive" />;
  return <File className="w-3.5 h-3.5 text-muted-foreground" />;
}

const ToolbarButton = ({
  active, onClick, children, title,
}: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "w-7 h-7 flex items-center justify-center rounded transition-colors",
      active
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    )}
  >
    {children}
  </button>
);

const EmailRichEditor = forwardRef<EmailRichEditorRef, EmailRichEditorProps>(
  ({ recipientEmail, placeholder = "撰写邮件回复...", onSend }, ref) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
        }),
        Underline,
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ["paragraph"] }),
        Highlight.configure({ multicolor: false }),
      ],
      content: "",
      editorProps: {
        attributes: {
          class:
            "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2 text-xs leading-relaxed text-foreground",
        },
      },
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
      getAttachments: () => attachments,
      focus: () => editor?.commands.focus(),
      clear: () => {
        editor?.commands.clearContent();
        setAttachments([]);
      },
    }));

    const addFiles = useCallback((files: FileList | File[]) => {
      const newAttachments: Attachment[] = Array.from(files).map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }, []);

    const removeAttachment = useCallback((id: string) => {
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
          addFiles(e.dataTransfer.files);
        }
      },
      [addFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []);

    const addLink = useCallback(() => {
      if (!editor) return;
      const url = window.prompt("输入链接 URL:");
      if (url) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
    }, [editor]);

    if (!editor) return null;

    return (
      <div
        className={cn(
          "border border-border rounded-lg overflow-hidden transition-colors bg-background",
          isDragOver && "border-primary bg-primary/5"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Recipient bar */}
        {recipientEmail && (
          <div className="px-3 py-1.5 border-b border-border/50 text-[10px] text-muted-foreground flex items-center gap-2">
            <span>收件人:</span>
            <span className="text-foreground">{recipientEmail}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="px-2 py-1 border-b border-border/50 flex items-center gap-0.5 flex-wrap bg-secondary/30">
          <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="加粗">
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="斜体">
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="下划线">
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="删除线">
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="无序列表">
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="有序列表">
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="左对齐">
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="居中">
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="右对齐">
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton active={editor.isActive("link")} onClick={addLink} title="插入链接">
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} title="高亮">
            <Highlighter className="w-3.5 h-3.5" />
          </ToolbarButton>

          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="撤销">
            <Undo2 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="重做">
            <Redo2 className="w-3.5 h-3.5" />
          </ToolbarButton>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary transition-colors"
          >
            <Paperclip className="w-3 h-3" /> 附件
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />

        {/* Drag overlay */}
        {isDragOver && (
          <div className="px-4 py-6 text-center border-t border-dashed border-primary/40">
            <Paperclip className="w-5 h-5 text-primary mx-auto mb-1" />
            <span className="text-xs text-primary">拖放文件到此处添加附件</span>
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-3 py-2 border-t border-border/50 bg-secondary/20">
            <div className="text-[10px] text-muted-foreground mb-1.5">
              附件 ({attachments.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 bg-secondary rounded-md px-2.5 py-1.5 text-[11px] group"
                >
                  {getFileIcon(att.type)}
                  <span className="truncate max-w-[120px]">{att.name}</span>
                  <span className="text-muted-foreground">({att.size})</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

EmailRichEditor.displayName = "EmailRichEditor";

export default EmailRichEditor;
