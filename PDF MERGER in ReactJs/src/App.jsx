import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext,
  rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Point pdfjs to its worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/* ─── Styles ── */
const S = {
  app: { minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b' },
  landing: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' },
  landingCard: { background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', padding: '48px 40px', maxWidth: '560px', width: '100%', textAlign: 'center' },
  brandWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' },
  brandIcon: { width: '44px', height: '44px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontSize: '26px', fontWeight: '700', color: '#1e293b', margin: 0 },
  brandSpan: { color: '#4f46e5' },
  landingSubtitle: { color: '#64748b', fontSize: '15px', marginBottom: '32px', margin: '8px 0 32px' },
  dropzone: (active) => ({ border: `2px dashed ${active ? '#4f46e5' : '#c7d2fe'}`, borderRadius: '16px', padding: '48px 24px', cursor: 'pointer', background: active ? '#eef2ff' : '#f8faff', transition: 'all 0.2s', outline: 'none' }),
  uploadIconWrap: { width: '64px', height: '64px', background: '#eef2ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  dropTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' },
  dropSub: { fontSize: '14px', color: '#94a3b8', margin: '0 0 24px' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' },
  editor: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: { width: '280px', minWidth: '280px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflow: 'hidden', boxShadow: '2px 0 8px rgba(0,0,0,0.04)', flexShrink: 0 },
  sidebarHeader: { padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', flexShrink: 0 },
  sidebarTitle: { fontSize: '13px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sidebarBadge: { marginLeft: 'auto', background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' },
  sidebarNav: { flex: 1, overflowY: 'auto', padding: '8px' },
  navItem: (isActive) => ({ padding: '10px 12px', margin: '4px 0', background: isActive ? '#eef2ff' : 'transparent', border: `1.5px solid ${isActive ? '#4f46e5' : '#f1f5f9'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '4px' }),
  navItemName: { fontSize: '13px', fontWeight: '600', color: '#1e293b' },
  navItemRange: { fontSize: '11px', color: '#94a3b8' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 },
  topbar: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', flexShrink: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  topBrandIcon: { width: '32px', height: '32px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  topBrandName: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  divider: { width: '1px', height: '24px', background: '#e2e8f0' },
  pageBadge: { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color: '#64748b', fontWeight: '500' },
  hint: { fontSize: '13px', color: '#94a3b8' },
  topRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1.5px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  btnDanger: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#ef4444', border: '1.5px solid #fecaca', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  btnMerge: (disabled) => ({ display: 'inline-flex', alignItems: 'center', gap: '8px', background: disabled ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: disabled ? 'none' : '0 4px 12px rgba(79,70,229,0.3)' }),
  progressWrap: { height: '3px', background: '#e0e7ff', flexShrink: 0 },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', transition: 'width 0.3s' }),
  errorBar: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 24px', background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#dc2626', fontSize: '14px', flexShrink: 0 },
  gridWrap: { flex: 1, padding: '28px 24px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '16px' },
  card: (selected, dragging, groupHighlighted) => ({ position: 'relative', background: groupHighlighted && !selected ? '#f5f3ff' : '#fff', borderRadius: '12px', border: `2px solid ${selected ? '#4f46e5' : groupHighlighted ? '#818cf8' : '#e2e8f0'}`, boxShadow: selected ? '0 0 0 3px rgba(79,70,229,0.15)' : groupHighlighted ? '0 0 0 3px rgba(129,140,248,0.20)' : '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', opacity: dragging ? 0 : 1, overflow: 'hidden', transition: 'all 0.15s', userSelect: 'none' }),
  thumbWrap: { aspectRatio: '3/4', background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'contain' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderTop: '1px solid #f1f5f9', background: '#fff' },
  cardNum: { fontSize: '12px', fontWeight: '600', color: '#64748b', fontFamily: 'monospace' },
  editedBadge: { fontSize: '10px', background: '#eef2ff', color: '#4f46e5', padding: '2px 7px', borderRadius: '20px', fontWeight: '600' },
  delBtn: { position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', opacity: 0, transition: 'opacity 0.15s', zIndex: 10 },
  editBtn: { position: 'absolute', top: '8px', left: '8px', width: '24px', height: '24px', borderRadius: '50%', background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', opacity: 0, transition: 'opacity 0.15s', zIndex: 10 },
  footer: { background: '#fff', borderTop: '1px solid #e2e8f0', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: '#94a3b8', flexShrink: 0 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.72)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(4px)' },
  modalBox: { background: '#fff', borderRadius: '20px', boxShadow: '0 25px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: '860px', maxHeight: '93vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  modalHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' },
  modalTitle: { fontSize: '17px', fontWeight: '600', color: '#1e293b', margin: 0 },
  modalSub: { fontSize: '13px', color: '#94a3b8', margin: '2px 0 0' },
  modalClose: { width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#64748b' },
  modalBody: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '24px', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  modalFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fff' },
  btnGhost: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94a3b8', padding: '8px 0' },
  modalActions: { display: 'flex', gap: '10px' },
  btnCancel: { background: '#f1f5f9', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  btnApply: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' },
  toast: { position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '500', zIndex: 2000, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  spinner: { width: '44px', height: '44px', border: '4px solid #e0e7ff', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' },
  progressBar: { width: '240px', height: '6px', background: '#e0e7ff', borderRadius: '99px', overflow: 'hidden' },
  progressBarFill: (pct) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', borderRadius: '99px', transition: 'width 0.3s' }),
  renameInput: { width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit' },
};

/* ─── Render a PDF page to a thumbnail dataURL using pdf.js ── */
async function renderPageToDataUrl(arrayBuffer, pageNum, scale = 1.5) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const page = await pdf.getPage(pageNum + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

/* ─── PDF Group Navigation Item ── */
function PDFGroupNavItem({ group, isActive, onSelect, onRename }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(group.name);

  const handleRename = () => {
    if (newName.trim()) onRename(group.id, newName.trim());
    setIsRenaming(false);
  };

  return (
    <div
      style={{ ...S.navItem(isActive), position: 'relative', boxShadow: isActive ? '0 2px 8px rgba(79,70,229,0.15)' : 'none' }}
      onClick={() => !isRenaming && onSelect(group.id)}
    >
      {isRenaming ? (
        <input autoFocus type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleRename} onKeyDown={(e) => e.key === 'Enter' && handleRename()} onClick={(e) => e.stopPropagation()} style={{ ...S.renameInput, fontSize: '12px' }} />
      ) : (
        <>
          <div style={S.navItemName}>{group.name}</div>
          <div style={S.navItemRange}>Pages {group.startPage + 1} – {group.endPage + 1}</div>
        </>
      )}
      {!isRenaming && (
        <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} style={{ position: 'absolute', top: '6px', right: '6px', width: '18px', height: '18px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Rename PDF">✎</button>
      )}
    </div>
  );
}

/* ─── Page Card ── */
function PageCard({ page, index, isSelected, isGroupHighlighted, onSelect, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

  return (
    <div
      ref={setNodeRef}
      style={{ ...S.card(isSelected, isDragging, isGroupHighlighted), ...CSS.Translate.toString(transform) ? { transform: CSS.Translate.toString(transform) } : {}, transition }}
      {...attributes} {...listeners} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <button style={{ ...S.delBtn, opacity: hovered ? 1 : 0 }} onClick={() => onDelete(page.id)} title="Delete page">×</button>
      <button style={{ ...S.editBtn, opacity: hovered ? 1 : 0 }} onClick={() => onEdit(page)} title="Edit page">✎</button>
      <div style={S.thumbWrap} onClick={() => onSelect(page)}>
        <img src={page.editedDataUrl || page.thumbnail} alt="" style={S.thumbImg} draggable={false} />
      </div>
      <div style={S.cardFooter}>
        <span style={S.cardNum}>#{index + 1}</span>
        {page.edited && <span style={S.editedBadge}>Edited</span>}
      </div>
    </div>
  );
}

/* ─── Edit Modal (FIXED ROTATION & CROP) ── */
function EditModal({ page, onSave, onClose }) {
  const [crop, setCrop] = useState(); 
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null); // Fix: reference to the DOM element
  
  const [currentSrc, setCurrentSrc] = useState(page.editedDataUrl || page.thumbnail);

  const rotateImage = (angle) => {
    const image = new Image();
    image.src = currentSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (angle === 90 || angle === -90 || angle === 270) {
        canvas.width = image.naturalHeight;
        canvas.height = image.naturalWidth;
      } else {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      
      setCurrentSrc(canvas.toDataURL('image/png'));
      setCrop(undefined);
      setCompletedCrop(null);
    };
  };

  const handleSave = () => {
    const image = imgRef.current; // Fix: We use the actual rendered DOM img
    if (!image) return;
    
    if (!completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
      if (currentSrc !== (page.editedDataUrl || page.thumbnail)) {
        onSave(page.id, currentSrc);
      } else {
        onClose(); 
      }
      return;
    }
    
    const canvas = document.createElement('canvas');
    // Fix: properly calculate the scale between actual pixels and on-screen CSS pixels
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height
    );
    
    onSave(page.id, canvas.toDataURL('image/png'));
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div>
            <h2 style={S.modalTitle}>Edit Page</h2>
            <p style={S.modalSub}>Rotate or draw a box to crop</p>
          </div>
          <button style={S.modalClose} onClick={onClose}>✕</button>
        </div>
        
        <div style={S.modalBody}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button style={S.btnOutline} onClick={() => rotateImage(-90)}>↺ Rotate Left</button>
            <button style={S.btnOutline} onClick={() => rotateImage(90)}>↻ Rotate Right</button>
          </div>

          <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
            <img ref={imgRef} src={currentSrc} style={{ maxWidth: '100%', maxHeight: '55vh', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} alt="" draggable={false} />
          </ReactCrop>
        </div>
        
        <div style={S.modalFoot}>
          <button style={S.btnGhost} onClick={() => { setCrop(undefined); setCompletedCrop(null); setCurrentSrc(page.editedDataUrl || page.thumbnail); }}>↺ Reset Edits</button>
          <div style={S.modalActions}>
            <button style={S.btnCancel} onClick={onClose}>Cancel</button>
            <button style={S.btnApply} onClick={handleSave}>✓ Apply Edits</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Upload View ── */
function UploadView({ onDrop, isLoading, progress }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });

  return (
    <div style={S.landing}>
      <div style={S.landingCard}>
        <div style={S.brandWrap}>
          <div style={S.brandIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
          <h1 style={S.brandTitle}>PDF <span style={S.brandSpan}>Merger</span></h1>
        </div>
        <p style={S.landingSubtitle}>Merge multiple PDF files easily and beautifully</p>
        <div {...getRootProps()} style={S.dropzone(isDragActive)}>
          <input {...getInputProps()} />
          <div style={S.uploadIconWrap}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg></div>
          <h3 style={S.dropTitle}>Drop PDFs here</h3>
          <p style={S.dropSub}>or click to select files from your computer</p>
          {isLoading && progress > 0 && (
            <div>
              <div style={S.progressLabel}><span>Loading...</span><span>{Math.round(progress)}%</span></div>
              <div style={S.progressBar}><div style={S.progressBarFill(progress)} /></div>
            </div>
          )}
          {!isLoading && <button style={S.btnPrimary}>📁 Select PDFs</button>}
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ── */
export default function App() {
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [merging, setMerging] = useState(false);
  const [mergeStatus, setMergeStatus] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [pdfGroups, setPdfGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const gridWrapRef = useRef(null);
  const pdfBuffers = useRef({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const highlightedPageIndices = React.useMemo(() => {
    if (!selectedGroupId) return new Set();
    const group = pdfGroups.find(g => g.id === selectedGroupId);
    if (!group) return new Set();
    const set = new Set();
    for (let i = group.startPage; i <= group.endPage; i++) set.add(i);
    return set;
  }, [selectedGroupId, pdfGroups]);

  /* ─── onDrop ─── */
  const onDrop = useCallback(async (acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(f => f.type === 'application/pdf');
    if (!pdfFiles.length) { setError('Please drop PDF files only'); return; }
    setLoading(true); setProgress(0);
    const newPages = [];
    const newGroups = [];
    let currentPageIndex = pages.length;

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      pdfBuffers.current[file.name] = arrayBuffer;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      const pageCount = pdf.numPages;
      const groupStartPage = currentPageIndex;

      for (let pageNum = 0; pageNum < pageCount; pageNum++) {
        const thumbnail = await renderPageToDataUrl(arrayBuffer, pageNum);
        newPages.push({ 
          id: `${Date.now()}-${Math.random()}`, 
          originalIndex: pageNum,
          thumbnail, 
          editedDataUrl: null, 
          edited: false, 
          pdfName: file.name 
        });
      }

      newGroups.push({
        id: `group-${file.name}-${Date.now()}`,
        name: file.name.replace('.pdf', ''),
        fileName: file.name,
        startPage: groupStartPage,
        endPage: currentPageIndex + pageCount - 1,
      });

      currentPageIndex += pageCount;
      setProgress(Math.round(((i + 1) / pdfFiles.length) * 100));
    }

    setPages(prev => [...prev, ...newPages]);
    setPdfGroups(prev => [...prev, ...newGroups]);
    setLoading(false); setProgress(0);
    showToast(`✓ Added ${pdfFiles.length} PDF${pdfFiles.length !== 1 ? 's' : ''}`);
  }, [pages, pdfGroups]);

  const handleEditSave = (pageId, editedDataUrl) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, editedDataUrl, edited: true } : p));
    setEditTarget(null);
    showToast('✓ Page updated');
  };

  const jumpToGroup = (groupId) => {
    if (selectedGroupId === groupId) { setSelectedGroupId(null); return; }
    setSelectedGroupId(groupId);
    const group = pdfGroups.find(g => g.id === groupId);
    if (group && gridWrapRef.current) {
      const firstPageCard = gridWrapRef.current.querySelector(`[data-page-index="${group.startPage}"]`);
      if (firstPageCard) firstPageCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRenamePDFGroup = (groupId, newName) => {
    setPdfGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
    showToast(`✓ Renamed to "${newName}"`);
  };

  /* ─── handleMerge ─── */
  const handleMerge = async () => {
    if (!pages.length) return;

    let finalFileName = window.prompt("Enter the name for your merged PDF:", "Merged_Document");
    if (finalFileName === null) return; 
    
    if (finalFileName.trim() === "") finalFileName = "Merged_Document";
    
    if (!finalFileName.toLowerCase().endsWith('.pdf')) finalFileName += ".pdf";

    setMerging(true); setError('');
    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        if (page.editedDataUrl) {
           const imgBytes = await fetch(page.editedDataUrl).then(r => r.arrayBuffer());
           const pngImage = await mergedPdf.embedPng(imgBytes);
           const imgDims = pngImage.scale(1);
           const newPage = mergedPdf.addPage([imgDims.width, imgDims.height]);
           newPage.drawImage(pngImage, { x: 0, y: 0, width: imgDims.width, height: imgDims.height });
        } else {
           const arrayBuffer = pdfBuffers.current[page.pdfName];
           const sourcePdf = await PDFDocument.load(arrayBuffer);
           const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [page.originalIndex]);
           mergedPdf.addPage(copiedPage);
        }
        setMergeStatus(`${i + 1}/${pages.length}`);
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = finalFileName; link.click(); 
      URL.revokeObjectURL(url);
      
      showToast(`✓ Downloaded as ${finalFileName}`);
    } catch (e) { setError('Merge failed: ' + e.message); console.error(e); }
    setMerging(false); setMergeStatus('');
  };

  if (!pages.length) return <UploadView onDrop={onDrop} isLoading={loading} progress={progress} />;

  return (
    <div style={S.editor}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span style={S.sidebarTitle}>PDFs Uploaded</span>
          <div style={S.sidebarBadge}>{pdfGroups.length}</div>
        </div>
        <nav style={S.sidebarNav}>
          {pdfGroups.map(group => (
            <PDFGroupNavItem key={group.id} group={group} isActive={selectedGroupId === group.id} onSelect={jumpToGroup} onRename={handleRenamePDFGroup} />
          ))}
        </nav>
      </aside>

      <div style={S.mainContent}>
        <header style={S.topbar}>
          <div style={S.topLeft}>
            <div style={S.topBrandIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <span style={S.topBrandName}>PDF <span style={{ color: '#4f46e5' }}>Merger</span></span>
            <div style={S.divider} />
            <span style={S.pageBadge}>{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
            <span style={S.hint}>Drag to reorder · Click sidebar PDF to highlight its pages</span>
          </div>
          <div style={S.topRight}>
            <label htmlFor="pdf-upload" style={{ display: 'inline-block', margin: 0 }}>
              <input id="pdf-upload" type="file" multiple accept=".pdf" onChange={(e) => onDrop(Array.from(e.target.files || []))} style={{ display: 'none' }} />
              <div style={S.btnOutline}>
                {loading ? <span style={{ ...S.spinner, width: '14px', height: '14px', borderWidth: '2px' }} /> : '+'} Add PDFs
              </div>
            </label>
            <button style={S.btnDanger} onClick={() => { setPages([]); setPdfGroups([]); setSelected(null); setSelectedGroupId(null); pdfBuffers.current = {}; }}>✕ Clear all</button>
            <button style={S.btnMerge(merging || !pages.length)} onClick={handleMerge} disabled={merging || !pages.length}>
              {merging ? <><span style={{ ...S.spinner, width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', display: 'inline-block' }} /> Merging… {mergeStatus}</> : <><svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg> Merge &amp; Download</>}
            </button>
          </div>
        </header>

        {loading && progress > 0 && <div style={S.progressWrap}><div style={S.progressFill(progress)} /></div>}
        {error && <div style={S.errorBar}>⚠ {error}<button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '16px' }}>×</button></div>}

        <div style={S.gridWrap} ref={gridWrapRef}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(active.id)} onDragEnd={({ active, over }) => { setActiveId(null); if (over && active.id !== over.id) { setPages(items => { const oi = items.findIndex(i => i.id === active.id); const ni = items.findIndex(i => i.id === over.id); return arrayMove(items, oi, ni); }); } }}>
            <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
              <div style={S.grid}>
                {pages.map((page, i) => (
                  <div key={page.id} data-page-index={i}>
                    <PageCard page={page} index={i} isSelected={selected === page.id} isGroupHighlighted={highlightedPageIndices.has(i)} onSelect={p => setSelected(p.id)} onDelete={id => { setPages(prev => { const n = prev.filter(p => p.id !== id); if (!n.length) setSelected(null); return n; }); }} onEdit={setEditTarget} />
                  </div>
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {pages.find(p => p.id === activeId) && (
                <div style={{ width: '155px', background: '#fff', borderRadius: '12px', border: '2px solid #4f46e5', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', transform: 'rotate(3deg) scale(1.05)' }}>
                  <div style={S.thumbWrap}><img src={pages.find(p => p.id === activeId)?.editedDataUrl || pages.find(p => p.id === activeId)?.thumbnail} alt="" style={S.thumbImg} /></div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        <footer style={S.footer}>
          <span>📄 {pages.length} pages total</span>
          <span>✏ {pages.filter(p => p.edited).length} edited</span>
          {selectedGroupId && (() => { const g = pdfGroups.find(x => x.id === selectedGroupId); return g ? <span style={{ color: '#4f46e5', fontWeight: 500 }}>🔵 Showing: {g.name} ({g.endPage - g.startPage + 1} pages)</span> : null; })()}
          <span style={{ marginLeft: 'auto' }}>Drag thumbnails to reorder · Click sidebar PDF to highlight its pages</span>
        </footer>
      </div>

      {editTarget && <EditModal page={editTarget} onSave={handleEditSave} onClose={() => setEditTarget(null)} />}
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}