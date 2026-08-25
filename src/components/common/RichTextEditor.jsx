import { useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Heading2,
  Heading3,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react'
import { isRichTextEmpty, sanitizeRichText } from '../../utils/richText'

const inlineTools = [
  { command: 'bold', label: 'Bold', icon: Bold },
  { command: 'italic', label: 'Italic', icon: Italic },
  { command: 'underline', label: 'Underline', icon: Underline },
]

const listTools = [
  { command: 'insertUnorderedList', label: 'Bullet list', icon: List },
  { command: 'insertOrderedList', label: 'Numbered list', icon: ListOrdered },
  { command: 'outdent', label: 'Outdent', icon: IndentDecrease },
  { command: 'indent', label: 'Indent', icon: IndentIncrease },
]

const alignTools = [
  { command: 'justifyLeft', label: 'Align left', icon: AlignLeft },
  { command: 'justifyCenter', label: 'Align center', icon: AlignCenter },
  { command: 'justifyRight', label: 'Align right', icon: AlignRight },
  { command: 'justifyFull', label: 'Justify', icon: AlignJustify },
]

const colorOptions = ['#0f172a', '#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed']
const highlightOptions = ['#fef3c7', '#dbeafe', '#dcfce7', '#fee2e2', '#f3e8ff', '#ffffff']

function IconButton({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-indigo-700"
    >
      <Icon size={16} />
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write description...', error = false }) {
  const editorRef = useRef(null)
  const savedRangeRef = useRef(null)
  const focusedRef = useRef(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || focusedRef.current) return
    const next = sanitizeRichText(value || '')
    if (editor.innerHTML !== next) editor.innerHTML = next
  }, [value])

  const saveSelection = () => {
    const editor = editorRef.current
    const selection = window.getSelection?.()
    if (!editor || !selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (editor.contains(range.commonAncestorContainer)) savedRangeRef.current = range.cloneRange()
  }

  const restoreSelection = () => {
    const editor = editorRef.current
    const selection = window.getSelection?.()
    if (!editor || !selection) return
    editor.focus()
    if (savedRangeRef.current) {
      selection.removeAllRanges()
      selection.addRange(savedRangeRef.current)
    }
  }

  const emit = () => {
    const editor = editorRef.current
    if (!editor) return
    onChange(sanitizeRichText(editor.innerHTML))
    saveSelection()
  }

  const run = (command, commandValue = null) => {
    const editor = editorRef.current
    if (!editor) return
    restoreSelection()
    document.execCommand(command, false, commandValue)
    emit()
  }

  const setFormat = (event) => {
    const tag = event.target.value
    if (!tag) return
    run('formatBlock', tag)
    event.target.value = ''
  }

  const setFontSize = (event) => {
    const size = event.target.value
    if (!size) return
    run('fontSize', size)
    event.target.value = ''
  }

  const addLink = () => {
    restoreSelection()
    const url = window.prompt('Enter link URL')
    if (!url) return
    run('createLink', url)
  }

  const clearFormat = () => run('removeFormat')

  const paste = (event) => {
    event.preventDefault()
    const html = event.clipboardData.getData('text/html')
    const text = event.clipboardData.getData('text/plain')
    if (html) run('insertHTML', sanitizeRichText(html))
    else run('insertText', text)
  }

  const applyColor = (command, color) => run(command, color)
  const empty = isRichTextEmpty(value || '')

  return (
    <div className={`overflow-hidden rounded-lg border bg-white ${error ? 'border-red-400' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-indigo-300`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-slate-50 px-2 py-2">
        <select onChange={setFormat} defaultValue="" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none">
          <option value="" disabled>Style</option>
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code block</option>
        </select>
        <select onChange={setFontSize} defaultValue="" className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none">
          <option value="" disabled>Size</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Medium</option>
          <option value="5">Large</option>
          <option value="6">XL</option>
        </select>

        {inlineTools.map((tool) => <IconButton key={tool.command} {...tool} onClick={() => run(tool.command)} />)}
        {listTools.map((tool) => <IconButton key={tool.command} {...tool} onClick={() => run(tool.command)} />)}
        {alignTools.map((tool) => <IconButton key={tool.command} {...tool} onClick={() => run(tool.command)} />)}

        <IconButton label="Quote" icon={Quote} onClick={() => run('formatBlock', 'blockquote')} />
        <IconButton label="Code block" icon={Code2} onClick={() => run('formatBlock', 'pre')} />
        <IconButton label="Horizontal line" icon={Minus} onClick={() => run('insertHorizontalRule')} />
        <IconButton label="Add link" icon={LinkIcon} onClick={addLink} />
        <IconButton label="Remove link" icon={Unlink} onClick={() => run('unlink')} />

        <span className="mx-1 h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-1 rounded-md bg-white px-2 py-1" title="Text color">
          <Palette size={14} className="text-slate-500" />
          {colorOptions.map((color) => <button key={color} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyColor('foreColor', color)} className="h-4 w-4 rounded-full border border-slate-200" style={{ backgroundColor: color }} aria-label={`Text color ${color}`} />)}
        </div>
        <div className="flex items-center gap-1 rounded-md bg-white px-2 py-1" title="Highlight">
          <Highlighter size={14} className="text-slate-500" />
          {highlightOptions.map((color) => <button key={color} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyColor('hiliteColor', color)} className="h-4 w-4 rounded-full border border-slate-300" style={{ backgroundColor: color }} aria-label={`Highlight ${color}`} />)}
        </div>

        <span className="mx-1 h-6 w-px bg-slate-200" />
        <IconButton label="Undo" icon={Undo2} onClick={() => run('undo')} />
        <IconButton label="Redo" icon={Redo2} onClick={() => run('redo')} />
        <IconButton label="Clear formatting" icon={Eraser} onClick={clearFormat} />
        <div className="ml-auto hidden items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-slate-400 lg:flex">
          <Heading2 size={13} /> <Heading3 size={13} /> Full editor
        </div>
      </div>
      <div className="relative">
        {empty && !focused && <div className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">{placeholder}</div>}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onPaste={paste}
          onFocus={() => { focusedRef.current = true; setFocused(true); saveSelection() }}
          onBlur={() => { focusedRef.current = false; setFocused(false); emit() }}
          className="min-h-48 w-full px-4 py-3 text-sm leading-6 text-slate-700 outline-none [&_a]:font-bold [&_a]:text-indigo-600 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-200 [&_blockquote]:bg-indigo-50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_h2]:text-xl [&_h2]:font-black [&_h3]:text-lg [&_h3]:font-black [&_h4]:font-bold [&_hr]:my-4 [&_hr]:border-slate-200 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
    </div>
  )
}