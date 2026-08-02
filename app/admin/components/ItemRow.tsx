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
      className={`flex items-center justify-between px-3 py-2 rounded-lg mb-2 transition-all ${
        item.is_checked ? "bg-[#e9fff4]" : "bg-[#f5f5f5]"
      }`}
    >
      {/* Item name */}
      <span className="text-sm font-medium text-[#222]">
        {item.name}
      </span>

      {/* Action boxes */}
      <div className="flex gap-2">
        {/* ✔ Got it */}
        <button
          onClick={() => onToggleGotIt(item.id)}
          className="w-11 h-11 flex items-center justify-center rounded-md bg-[#b8f5cf] text-[#0b5b2f] text-lg font-bold shadow-sm hover:bg-[#9cf0be] hover:shadow-md transition-all"
        >
          ✔
        </button>

        {/* ✎ Edit */}
        <button
          onClick={() => onEdit(item.id)}
          className="w-11 h-11 flex items-center justify-center rounded-md bg-[#b9e6ff] text-[#0b3f5b] text-lg font-bold shadow-sm hover:bg-[#9fdcff] hover:shadow-md transition-all"
        >
          ✎
        </button>

        {/* 🗑 Delete */}
        <button
          onClick={() => onDelete(item.id)}
          className="w-11 h-11 flex items-center justify-center rounded-md bg-[#ffc9c9] text-[#7a1f1f] text-lg font-bold shadow-sm hover:bg-[#ffb1b1] hover:shadow-md transition-all"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
