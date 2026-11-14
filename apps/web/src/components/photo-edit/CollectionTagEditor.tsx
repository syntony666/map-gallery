import { useState } from "react";
import type { Collection } from "../../types/gallery.type";
import { FieldLabel } from "../common/FieldLabel";

type CollectionTagEditorProps = {
  collections: Collection[];
  selectedIds: Set<string>;
  onToggle: (collectionId: string) => void;
  onCreate: (name: string) => Promise<Collection | null>;
};

export function CollectionTagEditor({
  collections,
  selectedIds,
  onToggle,
  onCreate,
}: CollectionTagEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selected = collections.filter((collection) =>
    selectedIds.has(collection.id),
  );
  const available = collections.filter(
    (collection) => !selectedIds.has(collection.id),
  );

  async function handleCreate() {
    const name = newName.trim();

    if (!name || isCreating) {
      return;
    }

    setIsCreating(true);

    const created = await onCreate(name);

    setIsCreating(false);

    if (created) {
      setNewName("");
    }
  }

  return (
    <div>
      <FieldLabel as="span">相簿</FieldLabel>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {selected.map((collection) => (
          <span
            key={collection.id}
            className="inline-flex items-center gap-0.5 text-sm text-accent"
          >
            #{collection.name}
            <button
              type="button"
              onClick={() => onToggle(collection.id)}
              className="hover:text-primary"
            >
              <i className="bi bi-x" />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => setIsPickerOpen((open) => !open)}
          className="text-sm text-ink-muted hover:text-ink"
        >
          {isPickerOpen ? "－ 收合" : "＋ 加入相簿"}
        </button>
      </div>

      {isPickerOpen && (
        <div className="mt-2 grid gap-3 rounded border border-line p-3">
          {available.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {available.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => onToggle(collection.id)}
                  className="text-sm text-ink-muted hover:text-accent"
                >
                  #{collection.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-faint">
              {selected.length > 0
                ? "此縣市沒有其他相簿"
                : "尚無相簿，輸入名稱建立第一個"}
            </p>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="新增相簿名稱"
              className="w-40 rounded border border-line bg-surface px-2 py-1 text-base text-ink outline-none"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating || !newName.trim()}
              className="text-sm text-accent hover:text-primary disabled:text-ink/25"
            >
              建立
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
