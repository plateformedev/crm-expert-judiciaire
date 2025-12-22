// ============================================================================
// CRM EXPERT JUDICIAIRE - ÉDITEUR DE TEXTE RICHE (Tiptap)
// ============================================================================
// Éditeur WYSIWYG complet pour la rédaction de documents d'expertise
// Fonctionnalités: mise en forme, tableaux, images, variables dynamiques

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, Heading3,
  Table as TableIcon, Image as ImageIcon, Link, Undo, Redo,
  Palette, Highlighter, Quote, Minus, ChevronDown,
  FileText, Variable, Eye, Download, Printer
} from 'lucide-react';
import { Button, ModalBase, useToast } from '../ui';

// ============================================================================
// BARRE D'OUTILS
// ============================================================================

const ToolbarButton = ({ active, disabled, onClick, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active
        ? 'bg-[#c9a227] text-white'
        : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-[#525252] hover:bg-[#f0f0f0] active:bg-[#e4e4e4]'
    }`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-[#e5e5e5] mx-1" />
);

const ToolbarGroup = ({ children }) => (
  <div className="flex items-center gap-0.5">
    {children}
  </div>
);

// ============================================================================
// SÉLECTEUR DE COULEUR
// ============================================================================

const ColorPicker = ({ editor, type = 'text' }) => {
  const [showPicker, setShowPicker] = useState(false);

  const colors = [
    '#1f1f1f', '#525252', '#737373', '#a3a3a3',
    '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
    '#0284c7', '#7c3aed', '#db2777', '#c9a227'
  ];

  const applyColor = (color) => {
    if (type === 'text') {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().toggleHighlight({ color }).run();
    }
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => setShowPicker(!showPicker)}
        title={type === 'text' ? 'Couleur du texte' : 'Surlignage'}
      >
        {type === 'text' ? <Palette className="w-4 h-4" /> : <Highlighter className="w-4 h-4" />}
      </ToolbarButton>

      {showPicker && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl shadow-lg border border-[#e5e5e5] z-50">
          <div className="grid grid-cols-4 gap-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => applyColor(color)}
                className="w-6 h-6 rounded border border-[#e5e5e5] hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {type === 'text' && (
            <button
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowPicker(false);
              }}
              className="w-full mt-2 px-2 py-1 text-xs text-[#737373] hover:bg-[#f5f5f5] rounded"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MENU INSERTION TABLEAU
// ============================================================================

const TableMenu = ({ editor }) => {
  const [showMenu, setShowMenu] = useState(false);

  const insertTable = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => setShowMenu(!showMenu)}
        title="Insérer un tableau"
      >
        <TableIcon className="w-4 h-4" />
      </ToolbarButton>

      {showMenu && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white rounded-xl shadow-lg border border-[#e5e5e5] z-50">
          <p className="text-xs text-[#737373] mb-2">Insérer un tableau</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { rows: 2, cols: 2, label: '2×2' },
              { rows: 3, cols: 3, label: '3×3' },
              { rows: 4, cols: 4, label: '4×4' },
              { rows: 3, cols: 2, label: '3×2' },
              { rows: 4, cols: 3, label: '4×3' },
              { rows: 5, cols: 4, label: '5×4' }
            ].map(({ rows, cols, label }) => (
              <button
                key={label}
                onClick={() => insertTable(rows, cols)}
                className="px-3 py-2 text-sm bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-lg"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BARRE D'OUTILS PRINCIPALE
// ============================================================================

const Toolbar = ({ editor, onInsertVariable, onPreview, onExport }) => {
  if (!editor) return null;

  const addImage = useCallback(() => {
    const url = window.prompt('URL de l\'image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="border-b border-[#e5e5e5] p-2 bg-[#fafafa] flex flex-wrap items-center gap-1">
      {/* Annuler / Refaire */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refaire (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Titres */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Mise en forme */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Souligné (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Barré"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Couleurs */}
      <ToolbarGroup>
        <ColorPicker editor={editor} type="text" />
        <ColorPicker editor={editor} type="highlight" />
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Alignement */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Aligner à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centrer"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Aligner à droite"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justifier"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Listes */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Blocs */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Ligne horizontale"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Insertions */}
      <ToolbarGroup>
        <TableMenu editor={editor} />
        <ToolbarButton onClick={addImage} title="Insérer une image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Variables */}
      {onInsertVariable && (
        <ToolbarButton onClick={onInsertVariable} title="Insérer une variable">
          <Variable className="w-4 h-4" />
        </ToolbarButton>
      )}

      {/* Espace flexible */}
      <div className="flex-1" />

      {/* Actions */}
      <ToolbarGroup>
        {onPreview && (
          <ToolbarButton onClick={onPreview} title="Aperçu">
            <Eye className="w-4 h-4" />
          </ToolbarButton>
        )}
        {onExport && (
          <ToolbarButton onClick={onExport} title="Exporter PDF">
            <Download className="w-4 h-4" />
          </ToolbarButton>
        )}
      </ToolbarGroup>
    </div>
  );
};

// ============================================================================
// MODAL VARIABLES
// ============================================================================

const VARIABLES_DISPONIBLES = [
  { categorie: 'Affaire', variables: [
    { code: '{{affaire.reference}}', label: 'Référence affaire' },
    { code: '{{affaire.rg}}', label: 'Numéro RG' },
    { code: '{{affaire.tribunal}}', label: 'Tribunal' },
    { code: '{{affaire.date_ordonnance}}', label: 'Date ordonnance' },
    { code: '{{affaire.mission}}', label: 'Mission' }
  ]},
  { categorie: 'Bien', variables: [
    { code: '{{bien.adresse}}', label: 'Adresse complète' },
    { code: '{{bien.ville}}', label: 'Ville' },
    { code: '{{bien.code_postal}}', label: 'Code postal' },
    { code: '{{bien.type}}', label: 'Type de bien' }
  ]},
  { categorie: 'Parties', variables: [
    { code: '{{demandeur.nom}}', label: 'Nom demandeur' },
    { code: '{{demandeur.adresse}}', label: 'Adresse demandeur' },
    { code: '{{defendeur.nom}}', label: 'Nom défendeur' },
    { code: '{{parties.liste}}', label: 'Liste des parties' }
  ]},
  { categorie: 'Réunion', variables: [
    { code: '{{reunion.numero}}', label: 'Numéro réunion' },
    { code: '{{reunion.date}}', label: 'Date réunion' },
    { code: '{{reunion.lieu}}', label: 'Lieu' },
    { code: '{{reunion.presents}}', label: 'Personnes présentes' },
    { code: '{{reunion.absents}}', label: 'Personnes absentes' }
  ]},
  { categorie: 'Expert', variables: [
    { code: '{{expert.nom}}', label: 'Nom expert' },
    { code: '{{expert.adresse}}', label: 'Adresse expert' },
    { code: '{{expert.telephone}}', label: 'Téléphone' },
    { code: '{{expert.email}}', label: 'Email' },
    { code: '{{date.jour}}', label: 'Date du jour' }
  ]}
];

const ModalVariables = ({ isOpen, onClose, onInsert }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Insérer une variable" size="md">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {VARIABLES_DISPONIBLES.map(cat => (
          <div key={cat.categorie}>
            <h4 className="text-sm font-semibold text-[#737373] uppercase tracking-wider mb-2">
              {cat.categorie}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {cat.variables.map(v => (
                <button
                  key={v.code}
                  onClick={() => {
                    onInsert(v.code);
                    onClose();
                  }}
                  className="text-left p-3 rounded-lg bg-[#f7f7f7] hover:bg-[#f0f0f0] border border-[#e5e5e5] transition-colors"
                >
                  <p className="text-sm font-medium text-[#1a1a1a]">{v.label}</p>
                  <p className="text-xs text-[#a3a3a3] font-mono mt-0.5">{v.code}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const EditeurTexteRiche = ({
  content = '',
  onChange,
  placeholder = 'Commencez à rédiger...',
  minHeight = 400,
  showVariables = true,
  onExport,
  className = ''
}) => {
  const { addToast } = useToast();
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    }
  });

  const insertVariable = useCallback((variable) => {
    if (editor) {
      editor.chain().focus().insertContent(variable).run();
    }
  }, [editor]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(editor?.getHTML());
    } else {
      addToast('Export PDF (fonctionnalité à venir)', 'info');
    }
  }, [editor, onExport, addToast]);

  return (
    <div className={`border border-[#e5e5e5] rounded-xl overflow-hidden bg-white ${className}`}>
      {/* Barre d'outils */}
      <Toolbar
        editor={editor}
        onInsertVariable={showVariables ? () => setShowVariablesModal(true) : null}
        onPreview={() => setShowPreview(true)}
        onExport={handleExport}
      />

      {/* Zone d'édition */}
      <div
        className="prose prose-sm max-w-none p-4"
        style={{ minHeight }}
      >
        <EditorContent
          editor={editor}
          className="outline-none"
        />
      </div>

      {/* Pied de page avec compteur */}
      <div className="border-t border-[#e5e5e5] px-4 py-2 bg-[#fafafa] flex items-center justify-between text-xs text-[#a3a3a3]">
        <span>
          {editor?.storage.characterCount?.characters?.() || 0} caractères
        </span>
        <span>
          {editor?.storage.characterCount?.words?.() || 0} mots
        </span>
      </div>

      {/* Modal Variables */}
      <ModalVariables
        isOpen={showVariablesModal}
        onClose={() => setShowVariablesModal(false)}
        onInsert={insertVariable}
      />

      {/* Modal Aperçu */}
      <ModalBase
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Aperçu du document"
        size="lg"
      >
        <div
          className="prose prose-sm max-w-none p-6 bg-white border border-[#e5e5e5] rounded-lg min-h-[400px]"
          dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Fermer
          </Button>
          <Button variant="primary" icon={Download} onClick={handleExport}>
            Exporter PDF
          </Button>
        </div>
      </ModalBase>
    </div>
  );
};

export default EditeurTexteRiche;
