import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Link as LinkIcon,
    Table as TableIcon, Heading1, Heading2,
    Undo, Redo, Sigma, PieChart, BarChart
} from 'lucide-react';

interface AdvancedEditorProps {
    content: string;
    onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addLink = useCallback(() => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    const insertTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('bold') ? 'text-maroon' : 'text-zinc-500'}`}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('italic') ? 'text-maroon' : 'text-zinc-500'}`}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('underline') ? 'text-maroon' : 'text-zinc-500'}`}
                title="Underline (Ctrl+U)"
            >
                <UnderlineIcon className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-800 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <Heading2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-800 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <AlignLeft className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <AlignCenter className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <AlignRight className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-800 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('bulletList') ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <List className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('orderedList') ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-800 mx-1 self-center" />

            <button
                onClick={addLink}
                className={`p-2 rounded hover:bg-zinc-900 transition-colors ${editor.isActive('link') ? 'text-maroon' : 'text-zinc-500'}`}
            >
                <LinkIcon className="w-4 h-4" />
            </button>
            <button
                onClick={insertTable}
                className="p-2 rounded hover:bg-zinc-900 text-zinc-500 transition-colors"
            >
                <TableIcon className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-zinc-800 mx-1 self-center" />

            {/* Advanced Features Placeholder - Will be handled via standard text patterns or custom nodes */}
            <button
                onClick={() => editor.chain().focus().insertContent('$$E=mc^2$$').run()}
                className="p-2 rounded hover:bg-zinc-900 text-zinc-500 transition-colors"
                title="Insert Latex Formula"
            >
                <Sigma className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().insertContent('[PIE_CHART data="Label:10,Other:20"] ').run()}
                className="p-2 rounded hover:bg-zinc-900 text-zinc-500 transition-colors"
                title="Insert Pie Chart"
            >
                <PieChart className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().insertContent('[BAR_CHART data="Jan:50,Feb:80"] ').run()}
                className="p-2 rounded hover:bg-zinc-900 text-zinc-500 transition-colors"
                title="Insert Bar Chart"
            >
                <BarChart className="w-4 h-4" />
            </button>

            <div className="flex-1" />

            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-colors"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-colors"
            >
                <Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[400px] p-8 text-zinc-300 font-sans',
            },
        },
    });

    return (
        <div className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden focus-within:border-maroon/30 transition-colors">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style>{`
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 1px solid #27272a;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #18181b;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(128, 0, 0, 0.05);
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};
