"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

type Menu = {
  id: number;
  nombre: string;
};

type Platillo = {
  id: number;
  platillo: string;
  precio: number;
  menuId: number;
  menu?: {
    id: number;
    nombre: string;
  };
};

export default function Home() {
  const [platillos, setPlatillos] = useState<Platillo[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<Partial<Platillo>>({});

  useEffect(() => {
    fetchPlatillos();
    fetchMenus();
  }, []);

  async function fetchPlatillos() {
    try {
      const res = await fetch("https://arquitecturaorientadaaservicios.onrender.com/api/chatbot/platillos");
      const data: Platillo[] = await res.json();
      setPlatillos(data);
    } catch (err) {
      console.error("Error al cargar platillos", err);
    }
  }

  async function fetchMenus() {
    try {
      const res = await fetch("https://arquitecturaorientadaaservicios.onrender.com/api/chatbot/menu");
      const data: Menu[] = await res.json();
      setMenus(data);
    } catch (err) {
      console.error("Error al cargar menús", err);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  async function uploadCSV() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await fetch("https://arquitecturaorientadaaservicios.onrender.com/api/chatbot/upload-csv", {
      method: "POST",
      body: fd,
    });
    setFile(null);
    fetchPlatillos();
  }

  function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "precio" || name === "menuId" ? Number(value) : value,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const isEdit = !!form.id;
    const endpoint = isEdit
      ? `https://arquitecturaorientadaaservicios.onrender.com/api/chatbot/platillo/${form.id}`
      : "https://arquitecturaorientadaaservicios.onrender.com/api/chatbot/platillo";
    const method = isEdit ? "PUT" : "POST";

    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({});
    fetchPlatillos();
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Estás seguro de eliminar este platillo?")) return;

    await fetch(`https://arquitecturaorientadaaservicios.onrender.com/api/chatbot/platillo/${id}`, {
      method: "DELETE",
    });

    fetchPlatillos();
  }

  function handleEdit(platillo: Platillo) {
    setForm({
      id: platillo.id,
      platillo: platillo.platillo,
      precio: platillo.precio,
      menuId: platillo.menuId,
    });
  }

  return (
    <main className="min-h-screen bg-cyan-500 text-gray-800 px-4 sm:px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center text-white">🍽️ CRUD de Platillos</h1>

        {/* CSV Upload */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">📤 Subir CSV</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <button
              onClick={uploadCSV}
              disabled={!file}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                file
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Subir
            </button>
          </div>
        </section>

        {/* Formulario */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            {form.id ? "✏️ Editar Platillo" : "➕ Crear Platillo"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="platillo"
              value={form.platillo ?? ""}
              onChange={handleFormChange}
              placeholder="Nombre del platillo"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
            <input
              name="precio"
              type="number"
              value={form.precio ?? ""}
              onChange={handleFormChange}
              placeholder="Precio"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
            <select
              name="menuId"
              value={form.menuId ?? ""}
              onChange={handleFormChange}
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            >
              <option value="" disabled>Selecciona un menú</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.nombre}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded">
                {form.id ? "Actualizar" : "Crear"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm({})}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Tabla */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">📋 Platillos Registrados</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-blue-100 text-blue-800">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Platillo</th>
                  <th className="px-4 py-2 border">Precio</th>
                  <th className="px-4 py-2 border">Menú</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {platillos.length > 0 ? (
                  platillos.map((p) => (
                    <tr key={p.id} className="text-center">
                      <td className="border px-4 py-2">{p.id}</td>
                      <td className="border px-4 py-2">{p.platillo}</td>
                      <td className="border px-4 py-2">${p.precio}</td>
                      <td className="border px-4 py-2">{p.menu?.nombre ?? "Desconocido"}</td>
                      <td className="border px-4 py-2">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(p)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No hay platillos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
