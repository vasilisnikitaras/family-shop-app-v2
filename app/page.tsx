"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";

export default function Page() {
  const { t, lang, setLang } = useTranslation();

  // --------------------------------------
  // STATES
  // --------------------------------------
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);

  const [theme, setTheme] = useState("dark");

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreSelected, setNewStoreSelected] = useState("");

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemStore, setNewItemStore] = useState("");

  const [storeModal, setStoreModal] = useState(false);

  const themeClass =
    theme === "dark"
      ? "bg-[#0b0b0b] text-[#f5f5f5]"
      : "bg-[#f3f4f6] text-[#1a1a1a]";

  // --------------------------------------
  // API POST
  // --------------------------------------
  const postJSON = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔥 API ERROR:", errorText);
      return { success: false, error: errorText };
    }

    return res.json();
  };

  // --------------------------------------
  // FUNCTIONS (CORRECT ORDER)
  // --------------------------------------

 // LOAD ITEMS (FIXED)
const loadItems = async () => {
  const res = await postJSON("/api/getList", { family_code: familyCode });

   const cloned = (res.items || []).map((x: any) => ({
    ...x,
    is_checked: x.is_checked === true || x.is_checked === "true",
    store_id: x.store_id ? String(x.store_id) : null,
  }));

  setItems(cloned);
};


  // LOAD STORES
  const loadStores = async () => {
    const res = await postJSON("/api/getStores", { family_code: familyCode });

    const cloned = res.stores.map((x: any) => ({
  ...x,
  id: String(x.id),
}));


    setStores(cloned);
  };

  // LOGIN
  const handleLogin = async () => {
  const res = await postJSON("/api/loginFamily", {
    family_code: loginCode,
    family_password: loginPassword,
  });

  if (!res.success) {
    alert(res.message);
    return;
  }

  localStorage.setItem("family_code", loginCode);
  localStorage.setItem("family_password", loginPassword);
  setFamilyCode(loginCode);

  // ⭐ ΕΔΩ ΠΑΕΙ — FRONTEND FIX
  loadItems();
  loadStores();
};

  // LOGOUT
  const logoutFamily = () => {
    localStorage.removeItem("family_code");
    localStorage.removeItem("family_password");
    setFamilyCode(null);
    setItems([]);
    setStores([]);
  };

  // ADD STORE
  const addStore = async () => {
    if (!newStoreName) return;
    const res = await postJSON("/api/addStore", {
      name: newStoreName,
      family_code: familyCode,
    });
    if (res.success) {
      setNewStoreName("");
      loadStores();
    }
  };

  // DELETE STORE
  const deleteStore = async (storeId: string) => {
    const res = await postJSON("/api/deleteStore", {
      store_id: storeId,
      family_code: familyCode,
    });

    if (res.success) {
      setStores((prev) => prev.filter((s) => s.id !== storeId));
      setItems((prev) => prev.filter((i) => i.store_id !== storeId));
    }
  };

  // ADD ITEM
  const addItem = async () => {
    if (!newItemName) return;

    const res = await postJSON("/api/addItem", {
      name: newItemName,
      quantity: Number(newItemQty || "1"),
      store_id: newItemStore === "" ? null : newItemStore,
      family_code: familyCode,
    });

    if (res.success) {
      setNewItemName("");
      setNewItemQty("1");
      setNewItemStore("");
      loadItems();
    }
  };

  // GOT IT (INSTANT UI UPDATE)
const toggleGotIt = async (item: any) => {
  if (!familyCode) return;

  // 1. Instant UI update
  setItems((prev) =>
    prev.map((x) =>
      x.id === item.id
        ? { ...x, is_checked: !x.is_checked }
        : x
    )
  );

  // 2. Update database
  await postJSON("/api/toggleGotIt", {
    id: item.id,
    family_code: familyCode,
  });
};



  // EDIT ITEM
  const editItem = async (item: any) => {
    const newName = prompt("New name:", item.name);
    if (!newName) return;
    const res = await postJSON("/api/editItem", {
      id: item.id,
      name: newName,
      family_code: familyCode,
    });
    if (res.success) loadItems();
  };

  // DELETE ITEM
  const deleteItem = async (item: any) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const res = await postJSON("/api/deleteItem", {
      id: item.id,
      family_code: familyCode,
    });
    if (res.success) loadItems();
  };

  // --------------------------------------
  // useEffect (AFTER FUNCTIONS)
  // --------------------------------------
  useEffect(() => {
  const code = localStorage.getItem("family_code");
  if (code) {
    setFamilyCode(code);
  }
}, []);


  useEffect(() => {
    document.body.classList.remove("dark", "light-dark");
    document.body.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (!familyCode) return;
    loadItems();
    loadStores();
  }, [familyCode]);

  // --------------------------------------
  // RETURN JSX
  // --------------------------------------
  if (!familyCode) {
    return (
      <div
        className={`min-h-screen px-2 py-4 flex justify-center items-center ${themeClass}`}
      >
        <div className="w-full max-w-xs mx-auto space-y-4 p-6 rounded-xl shadow-xl card">
          <h1 className="text-xl font-bold text-center">Enter Family Code</h1>

          <input
            className="input"
            placeholder="Family code..."
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value)}
          />

          <h1 className="text-xl font-bold text-center mt-4">
            Enter Password
          </h1>

          <input
            type="password"
            className="input"
            placeholder="Password..."
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          <button onClick={handleLogin} className="btn btn-purple w-full">
            Join Family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`page-container min-h-screen flex justify-center items-start ${themeClass}`}
    >
      <div className="w-full max-w-xl space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="header-title text-3xl font-extrabold text-purple-700 dark:text-purple-300">
              {t.title}
            </h1>
            <p className="header-subtitle text-xs text-gray-500 dark:text-gray-300 mt-1">
              Family: {familyCode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="select"
            >
              <option value="en">EN</option>
              <option value="el">EL</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="it">IT</option>
              <option value="de">DE</option>
              <option value="fi">FI</option>
              <option value="ar">AR</option>
              <option value="ja">JA</option>
              <option value="zh">ZH</option>
            </select>

            <button
              onClick={() =>
                setTheme(theme === "dark" ? "light-dark" : "dark")
              }
              className="btn btn-purple"
            >
              {theme === "dark" ? "Light-Dark" : "Dark"}
            </button>

            <button onClick={logoutFamily} className="btn btn-danger">
              Switch
            </button>
          </div>
        </div>

        {/* ADD STORE */}
        <div className="card space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="input"
              placeholder={t.new_store}
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
            />
            <button onClick={addStore} className="btn btn-purple">
              {t.add_store}
            </button>
          </div>

          <button
            onClick={() => setStoreModal(true)}
            className="btn btn-light-purple w-full"
          >
            {t.manage_stores} ▼
          </button>
        </div>

        {/* ADD STORE FULL */}
        <div className="card space-y-3 overflow-visible">
          <h2 className="section-title text-purple-700 dark:text-purple-300">
            {t.add_store}
          </h2>

          <div className="flex flex-col gap-3">
            <input
              className="input"
              placeholder={t.new_store_name}
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center overflow-visible relative">
              <select
                className="select z-50"
                value={String(newStoreSelected)}
                onChange={(e) => setNewStoreSelected(e.target.value)}
              >
                <option value="">{t.select_store}</option>
                {stores.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button onClick={addStore} className="btn btn-purple">
                {t.add_store}
              </button>
            </div>
          </div>
        </div>

        {/* STORE MODAL */}
        {storeModal && (
          <div className="modal-bg fixed inset-0 z-[9998] flex items-center justify-center">
            <div className="modal-content bg-white dark:bg-[#1a1a1a] p-4 rounded-lg z-[9999] w-full max-w-sm">
              <h2 className="section-title text-purple-700 dark:text-purple-300 text-center mb-3">
                {t.manage_stores}
              </h2>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stores.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 border rounded-lg dark:border-slate-700 text-sm"
                  >
                    <span>{s.name}</span>
                    <button
                      onClick={() => deleteStore(s.id)}
                      className="btn btn-danger px-2 py-1"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStoreModal(false)}
                className="btn btn-light-purple w-full mt-3"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ADD PRODUCT */}
        <div className="card space-y-3">
          <h2 className="section-title text-purple-700 dark:text-purple-300">
            {t.add_product}
          </h2>

          <div className="flex flex-col gap-3">
            <input
              className="input"
              placeholder={t.add_product}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center overflow-visible relative">
              <input
                type="number"
                min={1}
                className="input-qty"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
              />

              <select
                className="select z-50"
                value={newItemStore}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewItemStore(val);
                }}
              >
                <option value="">{t.select_store}</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button onClick={addItem} className="btn btn-purple">
                {t.add}
              </button>
            </div>
          </div>
        </div>

        {/* ITEMS */}
<div className="space-y-3">
  <h2 className="section-title text-purple-700 dark:text-purple-300">
    List
  </h2>

  <ul className="space-y-3">
    {items.map((i) => {
      
      console.log("🔥 RENDER ITEM:", i);

      const storeName = stores.find(
        (s) => String(s.id) === String(i.store_id)
      )?.name;

      return (
        <li
          key={i.id}
          className={`card list-item flex items-center justify-between transition-all pointer-events-auto ${
            i.is_checked && "bg-green-100 dark:bg-green-900"
          }`}
        >
          <div className="flex flex-col">

            {/* ⭐⭐ ΕΔΩ ΜΠΑΙΝΕΙ ΤΟ CHECK ✔⭐⭐ */}
            <div className="flex items-center gap-2">
              {i.is_checked && (
                <span className="text-green-600 font-bold">✔</span>
              )}

              <span
                className={`text-sm font-medium ${
                  i.is_checked
                    ? "line-through text-green-900 dark:text-green-200"
                    : ""
                }`}
              >
                {i.name} (x{i.quantity})
              </span>
            </div>
            {/* ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ */}

            {storeName && (
              <span
                className={`store-label text-xs mt-1 ${
                  i.is_checked ? "text-green-700 dark:text-green-300" : ""
                }`}
              >
                {storeName}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleGotIt(i)}
              className="btn btn-green"
            >
              {t.got_it}
            </button>

            <button
              onClick={() => editItem(i)}
              className="btn btn-primary"
            >
              {t.edit}
            </button>

            <button
              onClick={() => deleteItem(i)}
              className="btn btn-danger"
            >
              {t.delete}
            </button>
          </div>
        </li>
      );
    })}
  </ul>
</div>


        {/* FOOTER */}
        <footer className="pt-6 text-center space-y-1 text-[10px] text-gray-500 dark:text-gray-300">
          <p>© 2026 VNF Software — Created by Vasilis Fanes Nikitaras.</p>
          <p>Unauthorized copying or resale is strictly prohibited.</p>
          <p>
            Contact:{" "}
            <a href="mailto:vasilis.nikitaras@gmail.com" className="underline">
              vasilis.nikitaras@gmail.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
