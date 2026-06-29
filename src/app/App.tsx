import { useState, useRef, useEffect } from 'react';
import { AlignLeft, AlignCenter } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import svgPaths from '../imports/RpgBioSyntaxTool-1/svg-iwnjnkfi4o';

interface TextSegment {
  text: string;
  color: string;
  font: 'pressstart' | 'silkscreen';
}

const COLORS = [
  { hex: '#FF0000', code: '0' }, // Red
  { hex: '#F78700', code: '1' }, // Orange
  { hex: '#FFFF00', code: '2' }, // Yellow
  { hex: '#00FF00', code: '3' }, // Lime
  { hex: '#00FFFF', code: '4' }, // Cyan
  { hex: '#0000FF', code: '5' }, // Blue
  { hex: '#9500FF', code: '6' }, // Purple
  { hex: '#FF00FF', code: '7' }, // Magenta
  { hex: '#FFBBD4', code: '8' }, // Pink
  { hex: '#840000', code: '9' }, // Dark Red
  { hex: '#D9B485', code: 'a' }, // Tan
  { hex: '#9C99FF', code: 'b' }, // Light Blue
  { hex: '#FFFFFF', code: 'c' }, // White
  { hex: '#939393', code: 'd' }, // Light Gray
  { hex: '#3D3D3D', code: 'e' }, // Dark Gray
  { hex: '#000000', code: 'f' }, // Black
];

const PRESSSTART_RULER = '----_----_----_----_----_----_----_-<';
const SILKSCREEN_RULER = '----_----_----_----_----_----_----_----_-->';

function useFontSize(
  editorRef: React.RefObject<HTMLDivElement | null>,
  fontFamily: string,
  ruler: string,
  minSize: number,
  referenceSize = 20
): number {
  const [fontSize, setFontSize] = useState(referenceSize);

  useEffect(() => {
    const measure = () => {
      if (!editorRef.current) return;
      const availableWidth = editorRef.current.clientWidth - 32;
      if (availableWidth <= 0) return;

      const span = document.createElement('span');
      span.style.cssText = [
        'position:fixed', 'visibility:hidden', 'pointer-events:none',
        `white-space:nowrap`, `font-family:${fontFamily}`,
        `font-size:${referenceSize}px`
      ].join(';');
      span.textContent = ruler;
      document.body.appendChild(span);
      const widthAtRef = span.offsetWidth;
      document.body.removeChild(span);

      if (widthAtRef <= 0) return;
      const computed = Math.floor((availableWidth / widthAtRef) * referenceSize);
      setFontSize(Math.max(minSize, computed));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (editorRef.current) ro.observe(editorRef.current);
    return () => ro.disconnect();
  }, [editorRef, fontFamily, ruler, minSize, referenceSize]);

  return fontSize;
}

export default function App() {
  const [currentColor, setCurrentColor] = useState('#FFFFFF');
  const [currentFont, setCurrentFont] = useState<'pressstart' | 'silkscreen'>('pressstart');
  const [numberValue, setNumberValue] = useState('0');
  const [useFullWidth, setUseFullWidth] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center'>('left');
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [syntaxText, setSyntaxText] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const formattedRef = useRef<HTMLDivElement>(null);
  const pressStartFontSize = useFontSize(formattedRef, '"Press Start 2P",monospace', PRESSSTART_RULER, 8);
  const silkscreenFontSize = useFontSize(formattedRef, 'Silkscreen,monospace', SILKSCREEN_RULER, 8);
  const syntaxRef = useRef<HTMLTextAreaElement>(null);
  const undoStack = useRef<string[]>(['']);
  const redoStack = useRef<string[]>([]);

  const getColorCode = (hex: string): string => {
    const color = COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    return color ? color.code : 'c';
  };

  const getHexFromCode = (code: string): string => {
    const color = COLORS.find(c => c.code.toLowerCase() === code.toLowerCase());
    return color ? color.hex : '#FFFFFF';
  };

  const segmentsToText = (segs: TextSegment[]): string => {
    return segs.map(seg => seg.text).join('');
  };

  // CDRP format (from Clickteam logic):
  //   %X%   = switch to Press Start 2P, color code X
  //   %X!%  = switch to Silkscreen,     color code X
  //   %%    = end of formatted section (appended at end if any tags were emitted)
  // A tag is only emitted when color or font changes from the previous character.
  // Default state: white (#FFFFFF) + Press Start 2P (no tag needed).
  const formatToSyntax = () => {
    if (!formattedRef.current) return;
    const segs = parseHTMLToSegments(formattedRef.current.innerHTML);

    // Flatten segments to individual characters
    const chars: Array<{ char: string; color: string; font: 'pressstart' | 'silkscreen' }> = [];
    for (const seg of segs) {
      for (const char of [...seg.text]) {
        chars.push({ char, color: seg.color.toUpperCase(), font: seg.font });
      }
    }

    if (chars.length === 0) { setSyntaxText(''); return; }

    let sColor = '#FFFFFF';
    let sFont: 'pressstart' | 'silkscreen' = 'pressstart';
    let code = '';
    let hasFormatting = false;

    for (const { char, color, font } of chars) {
      const colorChanged = color !== sColor;
      const fontChanged = font !== sFont;

      if (colorChanged || fontChanged) {
        const colorCode = getColorCode(color);
        const tag = colorCode + (font === 'silkscreen' ? '!' : '');
        code += '%' + tag + '%';
        hasFormatting = true;
        sColor = color;
        sFont = font;
      }

      code += char;
    }

    if (hasFormatting) code += '%%';

    setSyntaxText(code);
  };

  const syntaxToFormat = () => {
    if (!syntaxText) {
      setSegments([]);
      if (formattedRef.current) formattedRef.current.innerHTML = '';
      return;
    }

    const newSegments: TextSegment[] = [];
    let curColor = '#FFFFFF';
    let curFont: 'pressstart' | 'silkscreen' = 'pressstart';
    let i = 0;
    let buf = '';

    const flush = () => {
      if (buf) {
        newSegments.push({ text: buf, color: curColor, font: curFont });
        buf = '';
      }
    };

    const isValidToken = (token: string) =>
      token === '' || /^[0-9a-fA-F]!?$/.test(token);

    while (i < syntaxText.length) {
      if (syntaxText[i] === '%') {
        const end = syntaxText.indexOf('%', i + 1);
        if (end !== -1) {
          const token = syntaxText.substring(i + 1, end);
          if (isValidToken(token)) {
            flush();
            if (token === '') {
              curColor = '#FFFFFF';
              curFont = 'pressstart';
            } else {
              const isSilkscreen = token.endsWith('!');
              const colorCode = isSilkscreen ? token.slice(0, -1) : token;
              curColor = getHexFromCode(colorCode);
              curFont = isSilkscreen ? 'silkscreen' : 'pressstart';
            }
            i = end + 1;
            continue;
          }
        }
        // Not a valid tag — treat % as literal
        buf += syntaxText[i++];
      } else {
        buf += syntaxText[i++];
      }
    }

    flush();
    setSegments(newSegments);

    if (formattedRef.current) {
      const html = newSegments.map(seg => {
        const fontFamily = seg.font === 'pressstart' ? '"Press Start 2P", monospace' : 'Silkscreen, monospace';
        const fontSize = seg.font === 'pressstart' ? `${pressStartFontSize}px` : `${silkscreenFontSize}px`;
        return `<span style="color: ${seg.color}; font-family: ${fontFamily}; font-size: ${fontSize};">${seg.text}</span>`;
      }).join('');
      formattedRef.current.innerHTML = html;
    }
  };

  const handleCopy = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(syntaxText).then(() => {
          toast.success('Copied to clipboard!');
        }).catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const ta = document.createElement('textarea');
    ta.value = syntaxText;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed — please copy manually.');
    }
    document.body.removeChild(ta);
  };

  const regularToFullWidth: { [key: string]: string } = {
    '0': '０', '1': '１', '2': '２', '3': '３', '4': '４',
    '5': '５', '6': '６', '7': '７', '8': '８', '9': '９'
  };
  
  const fullWidthToRegular: { [key: string]: string } = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
  };

  const toggleNumberFormat = () => {
    if (useFullWidth) {
      const converted = numberValue.replace(/[０-９]/g, (match) => fullWidthToRegular[match] || match);
      setNumberValue(converted);
      setUseFullWidth(false);
    } else {
      const converted = numberValue.replace(/[0-9]/g, (match) => regularToFullWidth[match] || match);
      setNumberValue(converted);
      setUseFullWidth(true);
    }
  };

  const handleNumberChange = (value: string) => {
    if (useFullWidth) {
      const filtered = value.replace(/[^０-９]/g, '');
      setNumberValue(filtered);
    } else {
      const filtered = value.replace(/[^0-9]/g, '');
      setNumberValue(filtered);
    }
  };

  const incrementNumber = (delta: number) => {
    const regular = numberValue.replace(/[０-９]/g, (match) => fullWidthToRegular[match] || match);
    const num = parseInt(regular) || 0;
    const newNum = Math.max(0, num + delta);
    const newStr = newNum.toString();
    
    if (useFullWidth) {
      const converted = newStr.replace(/[0-9]/g, (match) => regularToFullWidth[match] || match);
      setNumberValue(converted);
    } else {
      setNumberValue(newStr);
    }
  };

  const parseHTMLToSegments = (html: string): TextSegment[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const segments: TextSegment[] = [];
    
    const extractSegments = (node: Node, parentColor: string = '#FFFFFF', parentFont: 'pressstart' | 'silkscreen' = 'pressstart', isFirstBlock = { val: true }) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) segments.push({ text, color: parentColor, font: parentFont });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tag = element.tagName.toUpperCase();

        if (tag === 'BR') {
          segments.push({ text: '\n', color: parentColor, font: parentFont });
          return;
        }

        const style = element.style;
        let currentColor = parentColor;
        let currentFont = parentFont;

        if (style.color) currentColor = rgbToHex(style.color) || currentColor;
        if (style.fontFamily) {
          if (style.fontFamily.includes('Press Start 2P')) currentFont = 'pressstart';
          else if (style.fontFamily.includes('Silkscreen')) currentFont = 'silkscreen';
        }

        // Block elements represent a new line; prepend \n except before the very first block
        const isBlock = tag === 'DIV' || tag === 'P';
        if (isBlock) {
          if (!isFirstBlock.val) segments.push({ text: '\n', color: parentColor, font: parentFont });
          isFirstBlock.val = false;
        }

        Array.from(node.childNodes).forEach(child => {
          extractSegments(child, currentColor, currentFont, isFirstBlock);
        });
      }
    };

    const firstBlock = { val: true };
    Array.from(doc.body.childNodes).forEach(node => extractSegments(node, '#FFFFFF', 'pressstart', firstBlock));
    return segments;
  };

  const rgbToHex = (rgb: string): string | null => {
    if (rgb.startsWith('#')) return rgb;
    
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return null;
    
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const handleInput = () => {
    if (!formattedRef.current) return;
    const html = formattedRef.current.innerHTML;
    const newSegments = parseHTMLToSegments(html);
    setSegments(newSegments);
    updateDebugInfo(html, newSegments);
  };

  const updateDebugInfo = (html: string, segs: TextSegment[]) => {
    const info = `=== HTML Content ===
${html}

=== Parsed Segments (${segs.length}) ===
${segs.map((seg, i) => `[${i}] "${seg.text}" | color: ${seg.color} | font: ${seg.font}`).join('\n')}

=== Selection Info ===
${getSelectionInfo()}`;
    setDebugInfo(info);
  };

  const getSelectionInfo = (): string => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 'No selection';
    
    const range = selection.getRangeAt(0);
    return `Collapsed: ${range.collapsed}
Start: ${range.startContainer.nodeName} @ ${range.startOffset}
End: ${range.endContainer.nodeName} @ ${range.endOffset}
Selected text: "${selection.toString()}"`;
  };

  const consolidateAdjacentSpans = () => {
    if (!formattedRef.current) return;
    
    // First, remove all empty spans (spans with no text content)
    const allSpans = Array.from(formattedRef.current.children).filter(
      child => child.tagName === 'SPAN'
    ) as HTMLSpanElement[];
    
    allSpans.forEach(span => {
      const text = span.textContent || '';
      if (text.length === 0) {
        span.remove();
      }
    });
    
    // Then consolidate adjacent spans with matching styles
    const spans = Array.from(formattedRef.current.children).filter(
      child => child.tagName === 'SPAN'
    ) as HTMLSpanElement[];
    
    for (let i = 0; i < spans.length - 1; i++) {
      const currentSpan = spans[i];
      const nextSpan = spans[i + 1];
      
      // Check if the next element is still a sibling (hasn't been removed)
      if (!nextSpan || nextSpan.parentNode !== formattedRef.current) continue;
      
      // Check if styles match
      const sameColor = currentSpan.style.color === nextSpan.style.color;
      const sameFontFamily = currentSpan.style.fontFamily === nextSpan.style.fontFamily;
      const sameFontSize = currentSpan.style.fontSize === nextSpan.style.fontSize;
      
      if (sameColor && sameFontFamily && sameFontSize) {
        // Merge the text content
        currentSpan.textContent = (currentSpan.textContent || '') + (nextSpan.textContent || '');
        
        // Remove the next span
        nextSpan.remove();
        
        // Don't increment i since we removed the next element
        // The next iteration will check the current span against what was originally i+2
        i--;
        
        // Update the spans array to reflect the removal
        spans.splice(i + 2, 1);
      }
    }
  };

  // When the browser reports a selection with an element node as the container
  // (e.g. SPAN @ 1 meaning "after the first child of that span"), extractContents
  // may extract nothing. This normalises such offsets to the equivalent text-node position.
  const normalizeRangeToTextNodes = (range: Range): Range => {
    const toTextNode = (container: Node, offset: number): [Node, number] => {
      if (!container) return [container, offset];
      if (container.nodeType === Node.TEXT_NODE) return [container, offset];
      const children = Array.from(container.childNodes);
      if (children.length === 0) return [container, offset];

      if (offset < children.length) {
        const child = children[offset];
        if (!child) return [container, offset];
        if (child.nodeType === Node.TEXT_NODE) return [child, 0];
        const text = child.firstChild;
        if (text && text.nodeType === Node.TEXT_NODE) return [text, 0];
        return [child, 0];
      }

      // offset is past the last child — land at end of the last child
      const prev = children[children.length - 1];
      if (!prev) return [container, offset];
      if (prev.nodeType === Node.TEXT_NODE) return [prev, prev.textContent?.length ?? 0];
      const text = prev.lastChild;
      if (text && text.nodeType === Node.TEXT_NODE) return [text, text.textContent?.length ?? 0];
      return [prev, 0];
    };

    const [startNode, startOff] = toTextNode(range.startContainer, range.startOffset);
    const [endNode, endOff] = toTextNode(range.endContainer, range.endOffset);
    const r = document.createRange();
    r.setStart(startNode, startOff);
    r.setEnd(endNode, endOff);
    return r;
  };

  const saveUndo = () => {
    if (!formattedRef.current) return;
    const html = formattedRef.current.innerHTML;
    const stack = undoStack.current;
    if (html !== stack[stack.length - 1]) {
      stack.push(html);
      redoStack.current = [];
      if (stack.length > 200) stack.shift();
    }
  };

  const restoreHTML = (html: string) => {
    if (!formattedRef.current) return;
    formattedRef.current.innerHTML = html;
    // Move caret to end
    const range = document.createRange();
    range.selectNodeContents(formattedRef.current);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    const segs = parseHTMLToSegments(html);
    setSegments(segs);
    updateDebugInfo(html, segs);
  };

  // Ctrl+Z / Ctrl+Y undo-redo for the formatted editor
  useEffect(() => {
    const editor = formattedRef.current;
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const stack = undoStack.current;
        if (stack.length <= 1) return;
        redoStack.current.push(stack.pop()!);
        restoreHTML(stack[stack.length - 1] ?? '');
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        const next = redoStack.current.pop();
        if (next === undefined) return;
        undoStack.current.push(next);
        restoreHTML(next);
      }
    };

    editor.addEventListener('keydown', handleKeyDown);
    return () => editor.removeEventListener('keydown', handleKeyDown);
  }, []);

  const applyToSelection = (applyFn: (span: HTMLSpanElement) => void) => {
    saveUndo();
    const selection = window.getSelection();
    if (!selection || !formattedRef.current || selection.rangeCount === 0) return false;

    const raw = selection.getRangeAt(0);
    if (raw.collapsed) return false;

    // Ignore selections outside the editor (e.g. button labels)
    if (!formattedRef.current.contains(raw.commonAncestorContainer)) return false;

    const range = normalizeRangeToTextNodes(raw);

    const fragment = range.extractContents();

    fragment.querySelectorAll('span').forEach(applyFn);

    // Wrap any bare text nodes left by the extraction
    Array.from(fragment.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const span = document.createElement('span');
        applyFn(span);
        span.textContent = node.textContent;
        fragment.replaceChild(span, node);
      }
    });

    range.insertNode(fragment);

    consolidateAdjacentSpans();
    const html = formattedRef.current.innerHTML;
    const newSegments = parseHTMLToSegments(html);
    setSegments(newSegments);
    updateDebugInfo(html, newSegments);
    return true;
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    applyToSelection(span => { span.style.color = color; });
    formattedRef.current?.focus();
  };

  const handleFontChange = (font: 'pressstart' | 'silkscreen') => {
    setCurrentFont(font);

    const fontFamily = font === 'pressstart' ? '"Press Start 2P", monospace' : 'Silkscreen, monospace';
    const fontSize = font === 'pressstart' ? `${pressStartFontSize}px` : `${silkscreenFontSize}px`;

    applyToSelection(span => {
      span.style.fontFamily = fontFamily;
      span.style.fontSize = fontSize;
      span.style.fontWeight = '';
    });

    formattedRef.current?.focus();
  };

  // Sync current color/font to the span under the cursor on explicit caret moves only
  useEffect(() => {
    const editor = formattedRef.current;
    if (!editor) return;

    const NAV_KEYS = new Set([
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown',
    ]);

    const syncFromCursor = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!editor.contains(range.startContainer)) return;

      let node: Node | null = range.startContainer;
      if (node === editor && range.startOffset > 0) {
        node = editor.childNodes[range.startOffset - 1] ?? null;
      }
      let span: HTMLElement | null = null;
      while (node && node !== editor) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).style?.color) {
          span = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }

      if (!span) return;
      if (span.style.color) {
        const hex = rgbToHex(span.style.color);
        if (hex) setCurrentColor(hex.toUpperCase());
      }
      if (span.style.fontFamily) {
        if (span.style.fontFamily.includes('Press Start 2P')) setCurrentFont('pressstart');
        else if (span.style.fontFamily.includes('Silkscreen')) setCurrentFont('silkscreen');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (NAV_KEYS.has(e.key)) syncFromCursor();
    };

    editor.addEventListener('mouseup', syncFromCursor);
    editor.addEventListener('keyup', onKeyUp);
    return () => {
      editor.removeEventListener('mouseup', syncFromCursor);
      editor.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Handle beforeinput to apply formatting to new characters
  useEffect(() => {
    const editor = formattedRef.current;
    if (!editor) return;

    const handleBeforeInput = (e: InputEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      
      if (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
        e.preventDefault();
        saveUndo();

        const fontFamily = currentFont === 'pressstart' ? '"Press Start 2P", monospace' : 'Silkscreen, monospace';
        const fontSize = currentFont === 'pressstart' ? `${pressStartFontSize}px` : `${silkscreenFontSize}px`;

        const span = document.createElement('span');
        span.style.color = currentColor;
        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;
        span.textContent = '\n';

        range.deleteContents();
        range.insertNode(span);
        range.setStartAfter(span);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        setTimeout(() => {
          if (formattedRef.current) {
            consolidateAdjacentSpans();
            const html = formattedRef.current.innerHTML;
            const newSegments = parseHTMLToSegments(html);
            setSegments(newSegments);
            updateDebugInfo(html, newSegments);
          }
        }, 0);
        return;
      }

      // Only handle character insertion
      if (e.inputType === 'insertText' && e.data) {
        e.preventDefault();
        saveUndo();
        
        const fontFamily = currentFont === 'pressstart' ? '\"Press Start 2P\", monospace' : 'Silkscreen, monospace';
        const fontSize = currentFont === 'pressstart' ? `${pressStartFontSize}px` : `${silkscreenFontSize}px`;
        
        // Create a new span with current formatting
        const span = document.createElement('span');
        span.style.color = currentColor;
        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;
        span.textContent = e.data;
        
        // Insert the span at the cursor position
        range.deleteContents();
        range.insertNode(span);
        
        // Move cursor after the inserted span
        range.setStartAfter(span);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Consolidate adjacent spans and update segments
        setTimeout(() => {
          if (formattedRef.current) {
            consolidateAdjacentSpans();
            const html = formattedRef.current.innerHTML;
            const newSegments = parseHTMLToSegments(html);
            setSegments(newSegments);
            updateDebugInfo(html, newSegments);
          }
        }, 0);
      }
    };

    editor.addEventListener('beforeinput', handleBeforeInput as EventListener);
    
    return () => {
      editor.removeEventListener('beforeinput', handleBeforeInput as EventListener);
    };
  }, [currentColor, currentFont, pressStartFontSize, silkscreenFontSize]);

  return (
    <div className="min-h-screen bg-[#dbdee2] flex flex-col p-[25px] gap-5">
      <Toaster />

      {/* Title */}
      <div className="flex flex-col items-center gap-[11px]">
        <p
          className="text-[24px] leading-5 text-center whitespace-nowrap"
          style={{ fontFamily: '"Arial Black", Arial, sans-serif', color: '#3aaa12', letterSpacing: '2.4px' }}
        >
          CDRP: BIO PROGRAM
        </p>
        <p className="text-[14px] text-[#0a0a0a] font-normal text-center leading-[21px]" style={{ fontFamily: 'Inter, sans-serif' }}>
          V2.0.0 by TristanPook
        </p>
      </div>

      {/* Interface: Formatted | Arrows | CDRP */}
      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 flex-1 min-h-0">

        {/* ── Left panel: Formatted ── */}
        <div className="flex flex-col min-w-0 h-[634px] sm:h-auto sm:flex-1 sm:min-h-0">
          {/* Toolbar */}
          <div
            className="bg-[#f4f6f8] p-[14.78px] rounded-tl-[7px] rounded-tr-[7px] flex flex-col sm:flex-row items-start sm:items-center gap-[9px] shrink-0"
            style={{ boxShadow: '-5px -5px 20px 0px white, 5px 5px 20px 0px rgba(0,0,0,0.25)' }}
          >
            {/* Color grid 8×2 */}
            <div className="relative shrink-0" style={{ width: `${8 * 26.281 + 7 * 2.579}px`, height: `${2 * 26.281 + 1 * 2.579}px` }}>
              {COLORS.map((color, i) => (
                <button
                  key={color.hex}
                  className="absolute border border-[#d8d8d8] border-solid hover:brightness-105 transition-all"
                  style={{
                    backgroundColor: color.hex,
                    width: 26.281, height: 26.281,
                    left: (i % 8) * 29.58,
                    top: Math.floor(i / 8) * 28.86,
                    borderRadius: color.hex.toUpperCase() === currentColor.toUpperCase() ? '11px' : '2px',
                  }}
                  onClick={() => handleColorChange(color.hex)}
                />
              ))}
            </div>

            {/* Controls row: font buttons + number + align */}
            <div className="flex items-center gap-[9px] flex-wrap">
              {/* Font buttons */}
              <button
                className="flex items-center justify-center h-[55.859px] w-[50px] transition-all shrink-0"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  borderRadius: currentFont === 'pressstart' ? '4px' : '7px',
                  backgroundColor: currentFont === 'pressstart' ? '#f4f6f8' : '#f2f2f2',
                  boxShadow: currentFont === 'pressstart'
                    ? 'inset 2px 2px 5px 0px rgba(0,0,0,0.25)'
                    : '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)',
                }}
                onClick={() => handleFontChange('pressstart')}
              >
                <span className="text-[13.145px] text-[#0a0a0a]">Aa</span>
              </button>
              <button
                className="flex items-center justify-center h-[56px] w-[50px] transition-all shrink-0"
                style={{
                  fontFamily: 'Silkscreen, monospace',
                  borderRadius: currentFont === 'silkscreen' ? '4px' : '7px',
                  backgroundColor: currentFont === 'silkscreen' ? '#f4f6f8' : '#f2f2f2',
                  boxShadow: currentFont === 'silkscreen'
                    ? 'inset 2px 2px 5px 0px rgba(0,0,0,0.25)'
                    : '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)',
                }}
                onClick={() => handleFontChange('silkscreen')}
              >
                <span className="text-[13.145px] text-[#0a0a0a]">AA</span>
              </button>

              {/* Number toggle + input */}
              <div className="flex items-center h-[26px] shrink-0">
                <button
                  className="h-full px-[9.859px] rounded-bl-[7px] rounded-tl-[7px] transition-colors shrink-0"
                  style={{
                    backgroundColor: '#f2f2f2',
                    boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)',
                  }}
                  onClick={toggleNumberFormat}
                >
                  <p className="font-normal text-[9.859px] text-black whitespace-nowrap" style={{ fontFamily: useFullWidth ? '"Noto Sans JP", sans-serif' : 'Inter, sans-serif' }}>
                    {useFullWidth ? '１→ 1' : '1 →１'}
                  </p>
                </button>
                <div
                  className="relative h-full bg-white rounded-br-[11.502px] rounded-tr-[11.502px] w-[119px]"
                  style={{ boxShadow: 'inset 1px 2px 4px 0px rgba(0,0,0,0.25)' }}
                >
                  <input
                    type="text"
                    value={numberValue}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    onWheel={(e) => { e.preventDefault(); incrementNumber(e.deltaY < 0 ? 1 : -1); }}
                    className="w-full h-full px-[9.859px] text-center border-none outline-none bg-transparent text-[9.859px] text-black"
                    style={{ fontFamily: useFullWidth ? '"Noto Sans JP", sans-serif' : 'Inter, sans-serif' }}
                  />
                </div>
              </div>

              {/* Align toggle */}
              <button
                className="flex items-center justify-center h-[55.859px] px-[11.502px] rounded-[7px] shrink-0 transition-all"
                style={{
                  backgroundColor: '#f2f2f2',
                  boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)',
                }}
                onClick={() => setTextAlign(a => a === 'left' ? 'center' : 'left')}
                title={textAlign === 'left' ? 'Switch to center align' : 'Switch to left align'}
              >
                {textAlign === 'left'
                  ? <AlignLeft className="w-[13.141px] h-[13.141px]" />
                  : <AlignCenter className="w-[13.141px] h-[13.141px]" />}
              </button>
            </div>
          </div>

          {/* Formatted label + editor */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="bg-[#2b2b2b] shrink-0 flex items-center justify-center px-[13.145px] pt-[6.573px] pb-[8.216px]">
              <p className="text-[13.145px] text-[#f4f6f8] font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>Formatted</p>
            </div>
            <div className="flex-1 min-h-0 relative">
              <div
                ref={formattedRef}
                contentEditable
                onInput={handleInput}
                className="absolute inset-0 bg-[#444] p-[13.145px] outline-none overflow-y-scroll"
                style={{
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#FFFFFF',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: `${pressStartFontSize}px`,
                  textAlign,
                  boxShadow: 'inset 8px 7px 19px 0px rgba(0,0,0,0.25)',
                }}
                suppressContentEditableWarning
              />
            </div>
          </div>
        </div>

        {/* ── Middle: conversion arrow buttons (desktop: vertical column left/right) ── */}
        <div className="hidden sm:flex flex-col items-center justify-center gap-[16px] shrink-0">
          <button
            className="flex items-center justify-center rounded-[7px] shrink-0 transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#f2f2f2', boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)', width: 48, height: 96 }}
            onClick={syntaxToFormat} title="CDRP → Formatted"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="#0A0A0A" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="flex items-center justify-center rounded-[7px] shrink-0 transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#f2f2f2', boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)', width: 48, height: 96 }}
            onClick={formatToSyntax} title="Formatted → CDRP"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#0A0A0A" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Middle: conversion arrow buttons (mobile: horizontal row up/down) ── */}
        <div className="flex sm:hidden w-full gap-3 shrink-0">
          <button
            className="flex flex-1 items-center justify-center rounded-[7px] h-12 transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#f2f2f2', boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)' }}
            onClick={syntaxToFormat} title="CDRP → Formatted"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 10L8 6L12 10" stroke="#0A0A0A" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="flex flex-1 items-center justify-center rounded-[7px] h-12 transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#f2f2f2', boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)' }}
            onClick={formatToSyntax} title="Formatted → CDRP"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="#0A0A0A" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Right panel: CDRP ── */}
        <div className="flex flex-col min-w-0 h-[720px] sm:h-auto sm:flex-1 sm:min-h-0">
          {/* CDRP header */}
          <div className="bg-[#2b2b2b] shrink-0 relative flex items-center justify-center px-[14.364px] pt-[7.182px] pb-[8.977px]">
            <p className="text-[14.364px] text-white font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>CDRP Syntax</p>
            {/* Copy button */}
            <button
              className="absolute right-[14.364px] flex items-center justify-center rounded-[7px] size-[29.563px] transition-opacity hover:opacity-80"
              style={{
                backgroundColor: '#f2f2f2',
                boxShadow: '-2px -2px 5px 0px rgba(255,255,255,0.21), 2px 2px 5px 0px rgba(0,0,0,0.47)',
              }}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              <svg width="13.1406" height="13.1406" viewBox="0 0 13.1406 13.1406" fill="none">
                <path d={svgPaths.p2c869100} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.09504" />
                <path d={svgPaths.p342364a0} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.09504" />
              </svg>
            </button>
          </div>

          {/* CDRP textarea */}
          <div className="flex-1 min-h-0 relative">
            <textarea
              ref={syntaxRef}
              value={syntaxText}
              onChange={(e) => setSyntaxText(e.target.value)}
              className="absolute inset-0 w-full h-full bg-[#444] p-[14.364px] resize-none outline-none overflow-y-scroll"
              style={{
                fontFamily: 'Consolas, monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                color: syntaxText ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
              placeholder="Syntax will appear here..."
            />
          </div>
        </div>

      </div>

      {/* Debug panel (desktop only) */}
      {showDebug && (
        <div className="hidden sm:block fixed top-4 right-4 w-96 z-50 rounded-[7px] overflow-hidden" style={{ boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)' }}>
          <div className="bg-[#2b2b2b] px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Debug</span>
            <button className="text-white text-xs hover:opacity-70" onClick={() => setShowDebug(false)}>✕</button>
          </div>
          <div className="bg-[#f4f6f8] p-4 max-h-80 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">{debugInfo || 'Type to see debug info...'}</pre>
          </div>
        </div>
      )}
      {!showDebug && (
        <button
          className="hidden sm:block fixed top-4 right-4 z-50 px-3 py-1 rounded-[7px] text-[12px] text-white"
          style={{
            fontFamily: 'Inter, sans-serif',
            backgroundColor: '#2b2b2b',
            boxShadow: '-2px -2px 5px 0px white, 2px 2px 5px 0px rgba(0,0,0,0.1)',
          }}
          onClick={() => setShowDebug(true)}
        >
          Show Debug
        </button>
      )}
    </div>
  );
}