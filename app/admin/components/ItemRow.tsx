// components/ItemRow.tsx
import React from "react";

export default function ItemRow({
  item,
  onToggleGotIt,
  onEdit,
  onDelete,
}: {
  item: any;
  onToggleGotIt: any;
  onEdit: any;
  onDelete: any;
}) {

  return (
    <div
      className={`flex items-center justify-between px-3 py-3 rounded-lg mb-3 transition-all ${
        item.is_checked ? "bg-[#e9fff4]" : "bg-[#f5f5f5]"
      }`}
    >
      {/* Item name */}
      <span className="text-base font-medium text-[#222]">
        {item.name}
      </span>

      {/* Action boxes */}
      <div className="flex gap-3">
        {/* ✔ Got it */}
        <button
          onClick={() => onToggleGotIt(item.id)}
          className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#b8f5cf] text-[#0b5b2f] text-2xl font-bold shadow-md hover:bg-[#9cf0be] hover:shadow-lg transition-all"
        >
          ✔
        </button>

        {/* ✎ Edit */}
        <button
          onClick={() => onEdit(item.id)}
          className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#b9e6ff] text-[#0b3f5b] text-2xl font-bold shadow-md hover:bg-[#9fdcff] hover:shadow-lg transition-all"
        >
          ✎
        </button>

        {/* 🗑 Delete */}
        <button
          onClick={() => onDelete(item.id)}
          className="w-16 h-16 flex items-center justify-center rounded-xl bg-[#ffc9c9] text-[#7a1f1f] text-2xl font-bold shadow-md hover:bg-[#ffb1b1] hover:shadow-lg transition-all"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
