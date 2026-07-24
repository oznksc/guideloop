"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search } from "./DemoIcons";

export interface PaletteCommand {
  id: string;
  label: string;
  description: string;
  keywords?: string;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  commands: PaletteCommand[];
  onClose: () => void;
}

export function CommandPalette({
  open,
  commands,
  onClose,
}: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return commands;

    return commands.filter((command) =>
      `${command.label} ${command.description} ${command.keywords ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;

    setQuery("");
    setActiveIndex(0);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 0);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, open]);

  useEffect(() => {
    if (activeIndex >= filteredCommands.length) setActiveIndex(0);
  }, [activeIndex, filteredCommands.length]);

  if (!open) return null;

  const runCommand = (command: PaletteCommand | undefined) => {
    if (!command) return;
    onClose();
    command.onSelect();
  };

  return (
    <div
      className="command-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="command-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) =>
              filteredCommands.length ? (index + 1) % filteredCommands.length : 0,
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) =>
              filteredCommands.length
                ? (index - 1 + filteredCommands.length) %
                  filteredCommands.length
                : 0,
            );
          } else if (event.key === "Enter") {
            event.preventDefault();
            runCommand(filteredCommands[activeIndex]);
          } else if (event.key === "Tab") {
            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
              'input, button, a[href], [tabindex]:not([tabindex="-1"])',
            );
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="command-search">
          <Search className="command-search__icon" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search the experience"
            aria-label="Search commands"
            aria-controls="command-results"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-activedescendant={
              filteredCommands[activeIndex]
                ? `command-option-${filteredCommands[activeIndex].id}`
                : undefined
            }
            autoComplete="off"
          />
          <kbd>Esc</kbd>
        </div>

        <div
          id="command-results"
          className="command-results"
          role="listbox"
          aria-label="Available commands"
        >
          {filteredCommands.length ? (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                id={`command-option-${command.id}`}
                type="button"
                className="command-result"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => runCommand(command)}
              >
                <span className="command-result__copy">
                  <strong>{command.label}</strong>
                  <span>{command.description}</span>
                </span>
                {command.shortcut ? (
                  <kbd>{command.shortcut}</kbd>
                ) : (
                  <ArrowUpRight className="command-result__icon" />
                )}
              </button>
            ))
          ) : (
            <p className="command-empty">No matching command.</p>
          )}
        </div>

        <div className="command-footer">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
        </div>
      </div>
    </div>
  );
}
