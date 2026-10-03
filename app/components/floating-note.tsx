"use client";

import React from "react";

type NoteItem = {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  anchor: HTMLElement | null;
};

type NotePosition = {
  id: string;
  top: number;
  marker: boolean;
  targetTop: number;
};

type FloatingNoteContextValue = {
  activeId: string | null;
  register: (note: NoteItem) => void;
  unregister: (id: string) => void;
  setAnchor: (id: string, anchor: HTMLElement | null) => void;
  setActiveId: (id: string | null) => void;
};

const FloatingNoteContext =
  React.createContext<FloatingNoteContextValue | null>(null);

const NOTE_RAIL_TOP = 72;
const NOTE_RAIL_BOTTOM = 28;
const NOTE_MIN_GAP = 12;

function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

function estimateHeight(note: NoteItem, active: boolean) {
  const contentText =
    typeof note.content === "string"
      ? note.content
      : typeof note.label === "string"
        ? note.label
        : "";
  const estimated = Math.ceil(contentText.length / 36) * 20 + 36;
  return Math.max(44, Math.min(active ? 260 : 128, estimated || 92));
}

function hasHoverPointer() {
  return (
    typeof window === "undefined" ||
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function placeNotes({
  notes,
  activeId,
  heights,
}: {
  notes: NoteItem[];
  activeId: string | null;
  heights: Map<string, number>;
}) {
  if (typeof window === "undefined" || window.innerWidth < 768) {
    return [];
  }

  const centerY = window.innerHeight * 0.46;
  const candidates = notes
    .map((note) => {
      if (!note.anchor) return null;
      const rect = note.anchor.getBoundingClientRect();
      if (rect.bottom < -160 || rect.top > window.innerHeight + 160) {
        return null;
      }
      const measured = heights.get(note.id);
      const height = measured || estimateHeight(note, note.id === activeId);
      const targetTop = rect.top + rect.height / 2 - height / 2;
      return {
        id: note.id,
        height,
        targetTop,
        viewportDistance: Math.abs(rect.top + rect.height / 2 - centerY),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.targetTop - b!.targetTop) as {
    id: string;
    height: number;
    targetTop: number;
    viewportDistance: number;
  }[];

  if (!candidates.length) return [];

  const bottomLimit = Math.max(
    NOTE_RAIL_TOP + 120,
    window.innerHeight - NOTE_RAIL_BOTTOM,
  );

  const laidOut: ((typeof candidates)[number] & { top: number })[] = [];
  for (const item of candidates) {
    const previous = laidOut[laidOut.length - 1];
    laidOut.push({
      ...item,
      top: Math.max(
        NOTE_RAIL_TOP,
        item.targetTop,
        previous
          ? previous.top + previous.height + NOTE_MIN_GAP
          : NOTE_RAIL_TOP,
      ),
    });
  }

  for (let index = laidOut.length - 1; index >= 0; index -= 1) {
    const item = laidOut[index];
    const maxTop =
      index === laidOut.length - 1
        ? bottomLimit - item.height
        : laidOut[index + 1].top - NOTE_MIN_GAP - item.height;
    item.top = Math.min(item.top, maxTop);
  }

  return laidOut.map((item) => ({
    id: item.id,
    top: Math.max(NOTE_RAIL_TOP, item.top),
    targetTop: item.targetTop,
    marker:
      item.id !== activeId &&
      (item.top < NOTE_RAIL_TOP ||
        item.top + item.height > bottomLimit ||
        item.viewportDistance > window.innerHeight * 0.62),
  }));
}

function samePositions(a: NotePosition[], b: NotePosition[]) {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.id === b[index]?.id &&
      item.top === b[index]?.top &&
      item.targetTop === b[index]?.targetTop &&
      item.marker === b[index]?.marker,
  );
}

function FloatingNoteRail({
  notes,
  activeId,
  setActiveId,
}: {
  notes: NoteItem[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  const noteRefs = React.useRef(new Map<string, HTMLElement>());
  const [positions, setPositions] = React.useState<NotePosition[]>([]);
  const [viewportHeight, setViewportHeight] = React.useState(0);

  const updatePositions = React.useCallback(() => {
    const computePositions = () => {
      const heights = new Map<string, number>();
      noteRefs.current.forEach((el, id) => {
        heights.set(id, el.offsetHeight);
      });
      return placeNotes({ notes, activeId, heights });
    };

    setViewportHeight(window.innerHeight);
    setPositions((current) => {
      const next = computePositions();
      return samePositions(current, next) ? current : next;
    });
    requestAnimationFrame(() => {
      setPositions((current) => {
        const next = computePositions();
        return samePositions(current, next) ? current : next;
      });
    });
  }, [activeId, notes]);

  React.useEffect(() => {
    updatePositions();
    const onChange = () => requestAnimationFrame(updatePositions);
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    const observer = new ResizeObserver(onChange);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      observer.disconnect();
    };
  }, [updatePositions]);

  React.useEffect(() => {
    updatePositions();
  }, [activeId, updatePositions]);

  if (!notes.length) return null;

  const positionById = new Map(positions.map((pos) => [pos.id, pos]));
  const activePosition = positions.find((pos) => pos.id === activeId);
  const nearestId =
    activeId ||
    positions
      .slice()
      .sort(
        (a, b) =>
          Math.abs(a.targetTop - viewportHeight * 0.46) -
          Math.abs(b.targetTop - viewportHeight * 0.46),
      )[0]?.id ||
    null;

  return (
    <div
      aria-hidden={positions.length === 0}
      className="pointer-events-none fixed inset-y-0 right-6 z-20 hidden w-44 md:block lg:right-10 lg:w-56 xl:right-[max(3rem,calc((100vw-72rem)/2+2rem))] xl:w-64"
    >
      <div className="relative h-full">
        {activePosition && (
          <div
            className="absolute right-full mr-2 h-px w-8 bg-gray-300 transition-transform"
            style={{ transform: `translateY(${activePosition.top + 18}px)` }}
          />
        )}
        {notes.map((note) => {
          const position = positionById.get(note.id);
          if (!position) return null;
          const focused = note.id === activeId || note.id === nearestId;
          if (position.marker) {
            return (
              <button
                key={note.id}
                type="button"
                aria-label="Show note"
                className="pointer-events-auto absolute right-0 h-2 w-10 rounded-full bg-gray-300 transition hover:bg-gray-700"
                style={{ transform: `translateY(${position.top + 12}px)` }}
                onMouseEnter={() => setActiveId(note.id)}
                onFocus={() => setActiveId(note.id)}
                onClick={() => setActiveId(note.id)}
              />
            );
          }
          return (
            <aside
              key={note.id}
              ref={(el) => {
                if (el) noteRefs.current.set(note.id, el);
                else noteRefs.current.delete(note.id);
              }}
              className={cx(
                "pointer-events-auto absolute right-0 rounded-sm border bg-white/92 px-3 py-2 text-xs leading-relaxed text-gray-800 shadow-sm backdrop-blur transition-all duration-200",
                focused
                  ? "max-h-64 overflow-auto border-gray-800 opacity-100"
                  : "max-h-28 overflow-hidden border-gray-200 opacity-45 hover:opacity-90",
              )}
              style={{ transform: `translateY(${position.top}px)` }}
              onMouseEnter={() => setActiveId(note.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(note.id)}
            >
              {note.content}
            </aside>
          );
        })}
      </div>
    </div>
  );
}

function FloatingNoteBottomSheet({
  notes,
  activeId,
  setActiveId,
}: {
  notes: NoteItem[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  const activeNote = notes.find((note) => note.id === activeId);
  const isOpen = !!activeNote;

  // Lock body scroll while the sheet is open so the page underneath doesn't
  // tug on momentum scroll on iOS.
  React.useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Allow ESC to close (keyboards on tablets / accessibility).
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, setActiveId]);

  return (
    <div className="md:hidden" aria-hidden={!isOpen}>
      <div
        className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={() => setActiveId(null)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white px-5 pb-6 pt-3 shadow-2xl transition-transform duration-200"
        style={{ transform: isOpen ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
        <button
          type="button"
          aria-label="Close note"
          className="absolute right-4 top-3 rounded-full p-1 text-gray-400 transition hover:text-gray-700"
          onClick={() => setActiveId(null)}
        >
          ×
        </button>
        <div className="text-sm leading-relaxed text-gray-800">
          {activeNote?.content}
        </div>
      </div>
    </div>
  );
}

export function FloatingNotesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notesById, setNotesById] = React.useState<Record<string, NoteItem>>(
    {},
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const register = React.useCallback((note: NoteItem) => {
    setNotesById((current) => ({ ...current, [note.id]: note }));
  }, []);

  const unregister = React.useCallback((id: string) => {
    setNotesById((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const setAnchor = React.useCallback(
    (id: string, anchor: HTMLElement | null) => {
      setNotesById((current) => {
        const existing = current[id];
        if (!existing || existing.anchor === anchor) return current;
        return { ...current, [id]: { ...existing, anchor } };
      });
    },
    [],
  );

  const value = React.useMemo(
    () => ({ activeId, register, unregister, setAnchor, setActiveId }),
    [activeId, register, setAnchor, unregister],
  );
  const notes = React.useMemo(() => Object.values(notesById), [notesById]);
  const hasNotes = notes.length > 0;

  return (
    <FloatingNoteContext.Provider value={value}>
      <div className={hasNotes ? "md:pr-48 lg:pr-64 xl:pr-72" : undefined}>
        {children}
      </div>
      <FloatingNoteRail
        notes={notes}
        activeId={activeId}
        setActiveId={setActiveId}
      />
      <FloatingNoteBottomSheet
        notes={notes}
        activeId={activeId}
        setActiveId={setActiveId}
      />
    </FloatingNoteContext.Provider>
  );
}

export function FloatingNote({
  label,
  children,
  ...props
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = React.useId();
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const context = React.useContext(FloatingNoteContext);

  React.useEffect(() => {
    if (!context) return;
    context.register({
      id,
      label,
      content: children,
      anchor: triggerRef.current,
    });
    context.setAnchor(id, triggerRef.current);
    return () => context.unregister(id);
  }, [children, context, id, label]);

  React.useEffect(() => {
    if (!context) return;
    context.setAnchor(id, triggerRef.current);
  }, [context, id]);

  const focused = context?.activeId === id;

  return (
    <span
      ref={triggerRef}
      data-note-anchor={id}
      role="button"
      tabIndex={0}
      style={{
        textDecorationStyle: "dotted",
        textDecorationColor: "rgba(31, 41, 55)",
        textDecorationLine: "underline",
        textUnderlineOffset: "2px",
        backgroundColor: focused ? "rgb(229, 231, 235)" : undefined,
      }}
      className="cursor-pointer break-all underline transition hover:bg-gray-300"
      onMouseEnter={() => {
        if (hasHoverPointer()) context?.setActiveId(id);
      }}
      onMouseLeave={() => {
        if (hasHoverPointer()) context?.setActiveId(null);
      }}
      onFocus={() => context?.setActiveId(id)}
      onBlur={() => {
        // Touch browsers often blur the inline trigger immediately after tap,
        // which would close the mobile bottom sheet before it becomes visible.
        if (hasHoverPointer()) {
          context?.setActiveId(null);
        }
      }}
      onClick={(event) => {
        // On touch devices hover never fires, so click is the only way to
        // surface the note. Always open here: focus can fire before click on
        // mobile, and a toggle would immediately close the sheet again.
        event.preventDefault();
        context?.setActiveId(id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          context?.setActiveId(focused ? null : id);
        }
      }}
      {...props}
    >
      {label ?? "💭"}
    </span>
  );
}
