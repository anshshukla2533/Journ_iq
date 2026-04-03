import React, { useState, useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import notesService from '../../services/notesService';

const DraggableSaveNote = () => {
  const { token } = useAuth();
  const [show, setShow] = useState(true);
  const [note, setNote] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pos, setPos] = useState(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      x: width < 768 ? 10 : width / 2 - 200,
      y: height - (width < 768 ? 150 : 200)
    };
  });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setPos({
          x: 10,
          y: window.innerHeight - 150
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = e => {
      if (dragging) {
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.current.x)),
          y: Math.max(0, Math.min(window.innerHeight - 180, e.clientY - dragOffset.current.y)),
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handleSaveNote = async () => {
    if (!note.trim() || !token) return;
    setSaveMsg('');
    setSaving(true);
    try {
      const res = await notesService.createNote(token, { content: note });
      if (res.success) {
        setSaveMsg('Note saved!');
        setNote('');
        setTimeout(() => setSaveMsg(''), 2000);
      } else {
        setSaveMsg(res.message || 'Failed to save note.');
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveMsg('Failed to save note.');
    }
    setSaving(false);
  };

  if (!show) return null;
  return (
    <div
      className={`fixed z-[100] ${isMobile ? 'w-[calc(100%-20px)]' : 'w-full max-w-lg'}`}
      style={{ 
        left: pos.x, 
        top: pos.y,
        transform: isMobile ? 'none' : 'translate(-50%, -50%)'
      }}
    >
      <div className="glass-card p-0 flex flex-col items-center w-full shadow-2xl overflow-hidden border border-white/10">
        <div
          className="w-full h-8 bg-indigo-900/50 backdrop-blur-md cursor-move flex items-center justify-center text-xs text-indigo-300 select-none hover:bg-indigo-800/50 transition-colors"
          onMouseDown={e => {
            setDragging(true);
            dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
          }}
        >
          Drag to move
          <button className="ml-auto px-3 text-red-400 hover:text-red-300 transition-colors" onClick={() => setShow(false)}>×</button>
        </div>
        <div className="p-6 w-full flex flex-col items-center bg-[#12182b]/80 backdrop-blur-xl">
          <h3 className="text-xl font-bold mb-4 text-white">Quick Capture</h3>
          <textarea
            className="input-glass mb-4 min-h-[100px] resize-y"
            placeholder="Write a quick thought..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <button
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveNote}
            disabled={!note.trim() || saving}
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>
          {saveMsg && <div className="mt-3 text-emerald-400 text-sm font-medium">{saveMsg}</div>}
        </div>
      </div>
    </div>
  );
};

export default DraggableSaveNote;
