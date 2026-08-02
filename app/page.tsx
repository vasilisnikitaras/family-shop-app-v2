"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { useRouter } from "next/navigation";   // ⭐ ΒΑΛΤΟ ΕΔΩ

export default function Page() {
  const router = useRouter();                  // ⭐ ΚΑΙ ΑΥΤΟ ΕΔΩ ΜΕΣΑ
  const { t, lang, setLang } = useTranslation();

  // --------------------------------------
  // STATES
  // --------------------------------------
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [familyPassword, setFamilyPassword] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [familyId, setFamilyId] = useState<string | null>(null);


  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginUserName, setLoginUserName] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  const [theme, setTheme] = useState("dark");
  const [storeModal, setStoreModal] = useState(false);

  const [newStoreName, setNewStoreName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemStore, setNewItemStore] = useState("");

  const [viewMode, setViewMode] = useState<"list" | "store">("list");

// ⭐ FIX: ΤΩΡΑ ΕΠΙΤΡΕΠΕΤΑΙ
useEffect(() => {
  const fc = localStorage.getItem("family_code");
  const fp = localStorage.getItem("family_password");
  const un = localStorage.getItem("user_name");
  const fid = localStorage.getItem("family_id");

  if (fc) setFamilyCode(fc);
  if (fp) setFamilyPassword(fp);
  if (un) setUserName(un);
  if (fid) setFamilyId(fid);
}, []);


// ⭐⭐⭐⭐⭐ STEP 3 — vh FIX (ΜΠΑΙΝΕΙ ΕΔΩ)
  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


// --------------------------------------
// 🔥 ΕΔΩ ΜΠΑΙΝΕΙ ΤΟ registerDevice()
// --------------------------------------
async function registerDevice() {
  const family_code = localStorage.getItem("family_code");
  const device_name = localStorage.getItem("device_name") || "FamilyShop App";
  const member_name = localStorage.getItem("user_name");

  if (!family_code || !member_name) return;

  await fetch("/api/registerDevice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      family_code,
      device_name,
      member_name,
    }),
  });
}


  const themeClass =
    theme === "dark"
      ? "bg-[#0b0b0b] text-[#f5f5f5]"
      : "bg-[#f3f4f6] text-[#1a1a1a]";

  // --------------------------------------
  // HEARTBEAT
  // --------------------------------------
  useEffect(() => {
    if (!familyCode) return;

    fetch("/api/setOnline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ family_code: familyCode }),
    });

    const interval = setInterval(() => {
      fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_code: familyCode }),
      });
    }, 30000);

    return () => {
      fetch("/api/setOffline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_code: familyCode }),
      });
      clearInterval(interval);
    };
  }, [familyCode]);

  // --------------------------------------
  // API POST
  // --------------------------------------
 const postJSON = async (url: string, body: any) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-family-code": localStorage.getItem("family_code") || ""
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API ERROR:", errorText);
    return { success: false, message: errorText };
  }

  return res.json();
};


// --------------------------------------
// LOGIN
// --------------------------------------
 const handleLogin = async () => {
 const res = await postJSON("/api/loginFamily", {
    family_code: loginCode,
  family_password: loginPassword,
 });

 if (!res.success) {
   alert(res.message);
    return;
  }

  // 🔥 If login is pending → start auto-retry
  if (!res.family) {
    alert("Login request sent. Waiting for approval...");

    const retryInterval = setInterval(async () => {
      const retryRes = await postJSON("/api/loginFamily", {
        family_code: loginCode,
        family_password: loginPassword,
      });

      // 🔥 Approved → login successful
      if (retryRes.family) {
        clearInterval(retryInterval);

        // ⭐ SAVE EVERYTHING
        localStorage.setItem("family_code", loginCode);
        localStorage.setItem("family_password", loginPassword);
        localStorage.setItem("user_name", loginUserName);
        localStorage.setItem("family_id", retryRes.family.id);

        // ⭐ SAVE DEVICE NAME
        localStorage.setItem("device_name", navigator.userAgent);

        // ⭐ REGISTER DEVICE
        registerDevice();

        setFamilyCode(loginCode);
        setFamilyPassword(loginPassword);
        setUserName(loginUserName);
        setFamilyId(retryRes.family.id);

        loadItems();
        loadStores();

        router.push("/");
      }
    }, 3000);

    return;
  }

  // 🔥 Normal login (already approved)
  localStorage.setItem("family_code", loginCode);
  localStorage.setItem("family_password", loginPassword);
  localStorage.setItem("user_name", loginUserName);
  localStorage.setItem("family_id", res.family.id);

  // ⭐ SAVE DEVICE NAME
  localStorage.setItem("device_name", navigator.userAgent);

  // ⭐ REGISTER DEVICE
  registerDevice();

  setFamilyCode(loginCode);
  setFamilyPassword(loginPassword);
  setUserName(loginUserName);
  setFamilyId(res.family.id);

  loadItems();
  loadStores();

  router.push("/");

};

 // --------------------------------------
// AUTO LOGIN (FIXED FOR SETTINGS)
// --------------------------------------
useEffect(() => {
  const fc = localStorage.getItem("family_code");
  const fp = localStorage.getItem("family_password");
  const un = localStorage.getItem("user_name");
  const fid = localStorage.getItem("family_id");

  if (fc) setFamilyCode(fc);
  if (fp) setFamilyPassword(fp);
  if (un) setUserName(un);
  if (fid) setFamilyId(fid);

  // ⭐ Reload lists immediately after Settings change
  if (fc) {
    loadItems();
    loadStores();
  }
}, [familyCode]);

  // --------------------------------------
  // LOAD ITEMS
  // --------------------------------------
  const loadItems = async () => {
    if (!familyCode) return;

    const res = await postJSON("/api/getList", {
      family_code: familyCode,
    });

    const cloned = (res.items || []).map((x: any) => ({
      ...x,
      id: x.id,
      is_checked: x.is_checked === true || x.is_checked === "true",
      store_id: x.store_id ? String(x.store_id) : "",
      added_by: x.added_by || "Unknown",
    }));

    setItems(cloned);
  };

  // --------------------------------------
  // LOAD STORES
  // --------------------------------------
  const loadStores = async () => {
    if (!familyCode) return;

    const res = await postJSON("/api/getStores", {
      family_code: familyCode,
    });

    const cloned = (res.stores || []).map((x: any) => ({
      ...x,
      id: String(x.id),
    }));

    setStores(cloned);
  };

  // --------------------------------------
  // LOGOUT
  // --------------------------------------
  const logoutFamily = () => {
    localStorage.removeItem("family_code");
    localStorage.removeItem("family_password");
    localStorage.removeItem("user_name");

    setFamilyCode(null);
    setFamilyPassword(null);
    setUserName("");
    setItems([]);
    setStores([]);
  };

  
 // --------------------------------------
// ADD STORE
// --------------------------------------
const addStore = async () => {
  if (!newStoreName.trim()) return;

  const res = await postJSON("/api/addStore", {
    name: newStoreName.trim(),
    family_id: familyId,
    family_code: familyCode,
    user_name: userName
  });

  if (res.success) {
    setNewStoreName("");
    loadStores();
  } else {
    alert(res.message);
  }
};


  // --------------------------------------
  // DELETE STORE
  // --------------------------------------
  const deleteStore = async (storeId: string) => {
    const res = await postJSON("/api/deleteStore", {
      id: storeId,
      family_code: familyCode,
    });

    if (res.success) {
      setStores((prev) => prev.filter((s) => s.id !== storeId));
      setItems((prev) => prev.filter((i) => i.store_id !== storeId));
      loadStores();
      loadItems();
    }
  };

  // --------------------------------------
  // ADD ITEM
  // --------------------------------------
  const addItem = async () => {
    if (!newItemName.trim()) return;

    const res = await postJSON("/api/addItem", {
      name: newItemName.trim(),
      quantity: Number(newItemQty || "1"),
      store_id: newItemStore || null,
      family_code: familyCode,
      added_by: userName,
    });

    if (res.success) {
      setNewItemName("");
      setNewItemQty("1");
      setNewItemStore("");
      loadItems();
    }
  };

  // --------------------------------------
  // GOT IT
  // --------------------------------------
  const toggleGotIt = async (item: any) => {
    const newChecked = !item.is_checked;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, is_checked: newChecked } : i
      )
    );

    await postJSON("/api/toggleGotIt", {
      id: item.id,
      family_code: familyCode,
    });
  };

  // --------------------------------------
  // EDIT ITEM
  // --------------------------------------
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

  // --------------------------------------
  // DELETE ITEM
  // --------------------------------------
  const deleteItem = async (item: any) => {
    if (!confirm(`Delete "${item.name}"?`)) return;

    const res = await postJSON("/api/deleteItem", {
      id: item.id,
      family_code: familyCode,
    });

    if (res.success) loadItems();
  };

  // --------------------------------------
  // DARK MODE
  // --------------------------------------
  useEffect(() => {
    document.body.classList.remove("dark", "light-dark");
    document.body.classList.add(theme);
  }, [theme]);

  // --------------------------------------
  // AUTO LOAD ITEMS & STORES
  // --------------------------------------
  useEffect(() => {
    if (!familyCode) return;
    loadItems();
    loadStores();
  }, [familyCode]);

  // --------------------------------------
// AUTO REFRESH ITEMS (REAL-TIME SYNC)
// --------------------------------------
useEffect(() => {
  const interval = setInterval(() => {
    loadItems();
  }, 3000);

  return () => clearInterval(interval);
}, []);

// --------------------------------------
// AUTO REFRESH ITEMS & STORES (REAL-TIME)
// --------------------------------------
useEffect(() => {
  if (!familyCode) return;

  const interval = setInterval(() => {
    loadItems();
    loadStores();
  }, 3000);

  return () => clearInterval(interval);
}, [familyCode]);



  // --------------------------------------
  // LOGIN SCREEN
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

          <h1 className="text-xl font-bold text-center mt-4">Enter User</h1>
          <input
            className="input"
            placeholder="Your name..."
            value={loginUserName}
            onChange={(e) => setLoginUserName(e.target.value)}
          />

          <button onClick={handleLogin} className="btn btn-purple w-full">
            Join Family
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------
  // MAIN PAGE
  // --------------------------------------
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
          <p className="header-subtitle text-xs text-gray-500 dark:text-gray-300">
            User: {userName}
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* LANGUAGE SELECT */}
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

          {/* ⭐ THEME TOGGLE FIXED */}
          <button
            onClick={() => {
              const newTheme = theme === "dark" ? "light" : "dark";

              setTheme(newTheme);
              localStorage.setItem("theme", newTheme);

              // ⭐ Notify Settings instantly
              window.dispatchEvent(new Event("theme-change"));
            }}
            className="btn btn-purple"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {/* ⭐ LOGOUT */}
          <button onClick={logoutFamily} className="btn btn-purple">
            Logout
          </button>

          {/* SETTINGS BUTTON */}
          <button
            onClick={() => router.push("/settings")}
            className="w-8 h-8 flex items-center justify-center 
            rounded-full bg-purple-600 text-white shadow-md
            hover:bg-purple-700 active:scale-95 transition-all"
          >
            ⚙️
          </button>

        </div>
      </div>

      {/* TOGGLE VIEW */}

        <div className="flex justify-center">
          <button
            onClick={() =>
              setViewMode(viewMode === "list" ? "store" : "list")
            }
            className="btn btn-light-purple w-full"
          >
            {viewMode === "list" ? "Store View" : "List View"}
          </button>
        </div>

        console.log("ADD STORE RENDERS");


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

           // onClick={() => setStoreModal(true)}

           onClick={() => setStoreModal(!storeModal)}

            className="btn btn-light-purple w-full"
          >
            {t.manage_stores} ▼
          </button>
        </div>

        {/*
  ------------------------------------------
  ❌ OLD STORE MODAL (REMOVE / COMMENT OUT)
  ------------------------------------------

  {storeModal && (
    <div className="modal-bg fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="modal-content bg-white dark:bg-[#1a1a1a] p-4 rounded-lg z-[9999] w-full max-w-sm">
        <h2 className="section-title text-purple-700 dark:text-purple-300 text-center mb-3">
          {t.manage_stores}
        </h2>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {stores.map((s: any) => (
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

------------------------------------------
  END OLD STORE MODAL
------------------------------------------
*/}


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
        onChange={(e) => setNewItemStore(e.target.value)}
      >
        <option value="">{t.select_store}</option>
        {stores.map((s: any) => (
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


{/* MANAGE STORES MODAL */}
{storeModal && (
  <div className="modal-overlay">
    <div className="modal-card space-y-4 max-h-[80vh] overflow-y-auto">

      <h2 className="section-title text-purple-700 dark:text-purple-300">
        {t.manage_stores}
      </h2>

      <div className="space-y-2">
        {stores.length === 0 && (
          <p className="text-gray-500 text-sm">No stores added yet.</p>
        )}

        {stores.map((s: any) => (
          <div
            key={s.id}
            className="card flex justify-between items-center"
          >
            <span className="font-medium">{s.name}</span>

            <button
              onClick={() => deleteStore(s.id)}
              className="btn btn-danger"
            >
              {t.delete}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setStoreModal(false)}
        className="btn btn-light-purple w-full"
      >
        {t.close}
      </button>

    </div>
  </div>
)}

{/* STORE VIEW */}
{viewMode === "store" && (
  <div className="space-y-6">
    {stores.map((store: any) => {
      const storeItems = items.filter(
        (i) => String(i.store_id) === String(store.id)
      );

      if (storeItems.length === 0) return null;

      return (
        <div key={store.id} className="card space-y-3">

          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 pt-1 pb-1">
            {store.name}
          </h2>

          <ul className="space-y-3">
            {storeItems.map((i: any) => (
              <li
                key={i.id}
                className={`card list-item flex justify-between items-center transition-all pointer-events-auto ${
                  i.is_checked && "bg-green-100 dark:bg-green-900"
                }`}
              >

                {/* LEFT SIDE */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2">
                    {i.is_checked && (
                      <span className="text-green-600 dark:text-green-300 font-bold">
                        ✔
                      </span>
                    )}

                    <span
                      className={`text-sm font-medium ${
                        i.is_checked
                          ? "line-through text-gray-700 dark:text-gray-300"
                          : ""
                      }`}
                    >
                      {i.name} (x{i.quantity})
                    </span>
                  </div>

                  <span className="text-xs text-gray-500 dark:text-gray-300 mt-[3px] block">
                    {store.name} — Added by: {i.added_by}
                  </span>
                </div>

                {/* RIGHT SIDE — BUTTONS */}
                <div className="flex flex-col gap-2 flex-shrink-0 ml-auto">

                  <button
                    onClick={() => toggleGotIt(i)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-[#b8f5cf]
                               text-[#0b5b2f] text-xl font-bold shadow-sm
                               hover:bg-[#9cf0be] hover:shadow-md transition-all"
                  >
                    ✔
                  </button>

                  <button
                    onClick={() => editItem(i)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-[#b9e6ff]
                               text-[#0b3f5b] text-xl font-bold shadow-sm
                               hover:bg-[#9fdcff] hover:shadow-md transition-all"
                  >
                    ✎
                  </button>

                  <button
                    onClick={() => deleteItem(i)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-[#ffc9c9]
                               text-[#7a1f1f] text-xl font-bold shadow-sm
                               hover:bg-[#ffb1b1] hover:shadow-md transition-all"
                  >
                    🗑
                  </button>

                </div>

              </li>
            ))}
          </ul>

        </div>
      );
    })}
  </div>
)}

{/* MANAGE VIEW */}
{viewMode === "manage" && (
  <div className="space-y-6">

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
        onClick={() => {
          loadStores();
          setStoreModal(true);
        }}
        className="btn btn-light-purple w-full"
      >
        {t.manage_stores} ▼
      </button>
    </div>

  </div>
)}



{/* LIST VIEW */}
{viewMode === "list" && (
  <div className="space-y-3">
    <h2 className="section-title text-purple-700 dark:text-purple-300">
      {t.list}
    </h2>

    <ul className="space-y-3">
      {items.map((i: any) => {

        return (
          <li
            key={i.id}
            className={`card list-item flex justify-between items-center transition-all pointer-events-auto ${
              i.is_checked && "bg-green-100 dark:bg-green-900"
            }`}
          >

            {/* LEFT SIDE */}
            <div className="flex flex-col gap-1 w-full">
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

              <span className="text-xs text-gray-500 dark:text-gray-300 mt-[3px] block">
                {i.store} — Added by: {i.added_by}
              </span>
            </div>

            {/* RIGHT SIDE — BUTTONS */}
            <div className="flex flex-col gap-2 flex-shrink-0 ml-auto">

              <button
                onClick={() => toggleGotIt(i)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#b8f5cf]
                           text-[#0b5b2f] text-xl font-bold shadow-sm
                           hover:bg-[#9cf0be] hover:shadow-md transition-all"
              >
                ✔
              </button>

              <button
                onClick={() => editItem(i)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#b9e6ff]
                           text-[#0b3f5b] text-xl font-bold shadow-sm
                           hover:bg-[#9fdcff] hover:shadow-md transition-all"
              >
                ✎
              </button>

              <button
                onClick={() => deleteItem(i)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#ffc9c9]
                           text-[#7a1f1f] text-xl font-bold shadow-sm
                           hover:bg-[#ffb1b1] hover:shadow-md transition-all"
              >
                🗑
              </button>

            </div>

          </li>
        );
      })}
    </ul>
  </div>
)}

<footer className="text-center text-sm opacity-70 mt-10">
  © 2026 VNF Software — Created by Vasilis Fanes Nikitaras.<br />
  Unauthorized copying or resale is strictly prohibited.<br />
  Contact: 
  <a
    href="mailto:vasilis.nikitaras@gmail.com?subject=FamilyShop%20Support&body=Hello%20Vasilis,%0D%0A%0D%0AI%20need%20help%20with%20my%20FamilyShop%20account."
    className="text-blue-500 underline"
  >
    vasilis.nikitaras@gmail.com
  </a>
</footer>
      </div>
    </div>
  );
}
