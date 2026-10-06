import { useState } from "react";
import type { Collection } from "../../types/gallery.type";

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
      <span className="mb-1 block text-sm font-medium text-stone-700">
        相簿
      </span>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {selected.map((collection) => (
          <span
            key={collection.id}
            className="inline-flex items-center gap-0.5 text-sm text-purple-500"
          >
            #{collection.name}
            <button
              type="button"
              onClick={() => onToggle(collection.id)}
              className="hover:text-purple-700"
            >
              <i className="bi bi-x" />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => setIsPickerOpen((open) => !open)}
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          {isPickerOpen ? "－ 收合" : "＋ 加入相簿"}
        </button>
      </div>

      {isPickerOpen && (
        <div className="mt-2 grid gap-3 rounded border border-stone-300 p-3">
          {available.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {available.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => onToggle(collection.id)}
                  className="text-sm text-stone-500 hover:text-purple-500"
                >
                  #{collection.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">
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
              className="w-40 rounded border border-stone-300 bg-white px-2 py-1 text-sm text-stone-700 outline-none"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating || !newName.trim()}
              className="text-sm text-purple-500 hover:text-purple-700 disabled:text-stone-300"
            >
              建立
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
