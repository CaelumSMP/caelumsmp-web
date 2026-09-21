"use client";

import { useState, useTransition } from "react";
import type { Result } from "./actions";
import o from "./owner.module.css";

// Runs a save action and remembers the outcome for the save bar.
export function useSaver() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const [dirty, setDirty] = useState(false);
  const save = (fn: () => Promise<Result>, then?: (r: Result) => void) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.ok) setDirty(false);
      then?.(r);
    });
  return { pending, result, dirty, touch: () => (setDirty(true), setResult(null)), save };
}

export function SaveBar({ pending, result, dirty, label = "Save changes", view }: { pending: boolean; result: Result | null; dirty: boolean; label?: string; view?: string }) {
  return (
    <div className={o.saveBar}>
      <p role="status" className={o.saveMsg} data-state={result ? (result.ok ? "ok" : "error") : dirty ? "dirty" : undefined}>
        {pending ? "Saving…" : result ? (result.ok ? "Saved. The public site is updated." : result.error) : dirty ? "Unsaved changes" : "All changes saved"}
      </p>
      {view && (
        <a href={view} target="_blank" rel="noopener noreferrer" className={o.linkBtn}>
          View on site ↗
        </a>
      )}
      <button type="submit" className={o.primary} disabled={pending}>
        {label}
      </button>
    </div>
  );
}

export type Field<T> = { key: keyof T & string; label: string; type?: "text" | "textarea" | "url" | "date" | "select"; options?: readonly string[]; wide?: boolean; placeholder?: string };

// A list of editable rows (features, rules, team members...) with add, remove and reorder.
export function Rows<T extends Record<string, string>>({ items, fields, blank, onChange, itemLabel }: { items: T[]; fields: Field<T>[]; blank: T; onChange: (next: T[]) => void; itemLabel: (item: T, i: number) => string }) {
  const set = (i: number, key: keyof T, value: string) => onChange(items.map((it, n) => (n === i ? { ...it, [key]: value } : it)));
  const move = (i: number, by: number) => {
    const next = [...items];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };
  return (
    <div className={o.rows}>
      {items.map((it, i) => (
        <fieldset key={i} className={o.row}>
          <legend>{itemLabel(it, i)}</legend>
          <div className={o.rowTools}>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${itemLabel(it, i)} up`}>
              ↑
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${itemLabel(it, i)} down`}>
              ↓
            </button>
            <button type="button" onClick={() => onChange(items.filter((_, n) => n !== i))} className={o.danger} aria-label={`Remove ${itemLabel(it, i)}`}>
              Remove
            </button>
          </div>
          <div className={o.rowFields}>
            {fields.map((f) => (
              <label key={f.key} className={f.wide || f.type === "textarea" ? o.wide : undefined}>
                {f.label}
                {f.type === "textarea" ? (
                  <textarea rows={3} value={it[f.key]} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} />
                ) : f.type === "select" ? (
                  <select value={it[f.key]} onChange={(e) => set(i, f.key, e.target.value)}>
                    {f.options?.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input type={f.type ?? "text"} value={it[f.key]} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} />
                )}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" className={o.add} onClick={() => onChange([...items, { ...blank }])}>
        + Add
      </button>
    </div>
  );
}
