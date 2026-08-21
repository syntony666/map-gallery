import { useNavigate, useParams } from "react-router";

export function ItemDetailPage() {
  const { districtId, itemId } = useParams();
  const navigate = useNavigate();

  return (
    <main className="p-6">
      <button
        type="button"
        onClick={() => navigate(`/district/${districtId}`)}
        className="rounded bg-gray-100 px-3 py-2 text-sm"
      >
        ← 返回行政區
      </button>

      <h1 className="mt-6 text-2xl font-bold">景點內容：{itemId}</h1>
    </main>
  );
}
