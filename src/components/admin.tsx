"use client";

import { upload as uploadBlob } from "@vercel/blob/client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  ImagePlus,
  LogOut,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  Product,
  ProductCategory,
  ProductMedia,
  ProductStatus,
} from "@/lib/types";
import { categories } from "@/lib/types";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

type Notice = { text: string; success: boolean };

export function AdminDashboard({
  initialAuthenticated,
}: {
  initialAuthenticated: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  const loadProducts = useCallback(async () => {
    const response = await fetch("/api/products?all=1", { cache: "no-store" });
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }
    if (!response.ok) throw new Error("Não foi possível carregar os produtos.");
    setProducts((await response.json()) as Product[]);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    void Promise.resolve().then(loadProducts).catch((error: unknown) => {
      setNotice({ text: errorMessage(error), success: false });
    });
  }, [authenticated, loadProducts]);

  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Não foi possível encerrar a sessão.");
      setAuthenticated(false);
      setProducts([]);
    } catch (error) {
      setNotice({ text: errorMessage(error), success: false });
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Excluir "${product.name}" do catálogo?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await responseError(response));
      setProducts((previous) => previous.filter((item) => item.id !== product.id));
      setNotice({ text: "Aparelho excluído do catálogo.", success: true });
    } catch (error) {
      setNotice({ text: errorMessage(error), success: false });
    } finally {
      setBusy(false);
    }
  }

  async function saveProduct(product: Product) {
    setBusy(true);
    try {
      const method = products.some((item) => item.id === product.id) ? "PUT" : "POST";
      const url =
        method === "PUT"
          ? `/api/products/${encodeURIComponent(product.id)}`
          : "/api/products";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const saved = (await response.json()) as Product;
      setProducts((previous) =>
        method === "PUT"
          ? previous.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...previous],
      );
      setEditing(undefined);
      setNotice({
        text: method === "PUT" ? "Aparelho atualizado com sucesso." : "Aparelho cadastrado com sucesso.",
        success: true,
      });
    } catch (error) {
      setNotice({ text: errorMessage(error), success: false });
    } finally {
      setBusy(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="admin-page">
        <AdminTopbar />
        <LoginForm onSuccess={() => setAuthenticated(true)} />
      </div>
    );
  }

  const availableCount = products.filter((product) => product.status === "available").length;
  const featuredCount = products.filter(
    (product) => product.featured && product.status === "available",
  ).length;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <Link className="brand" href="/" aria-label="Voltar ao catálogo">
          <span className="brand-mark">
            <Sparkles aria-hidden="true" />
          </span>
          <span>
            Bello <span className="brand-tech">TECH</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
          <Link className="header-link" href="/">
            <ArrowLeft size={14} aria-hidden="true" /> Ver catálogo
          </Link>
          <button
            className="header-link"
            disabled={busy}
            onClick={logout}
            style={{ border: 0, background: "transparent", cursor: "pointer" }}
            type="button"
          >
            <LogOut size={14} aria-hidden="true" /> Sair
          </button>
        </div>
      </div>
      <main className="admin-content">
        <div className="admin-title-row">
          <div>
            <h1>Visão geral</h1>
            <p>Gerencie seus aparelhos e mantenha a vitrine sempre atualizada.</p>
          </div>
          <button
            className="button button-primary"
            onClick={() => setEditing(null)}
            type="button"
          >
            <Plus size={16} aria-hidden="true" />
            Adicionar aparelho
          </button>
        </div>

        {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

        <div className="admin-stats">
          <div className="stat-card">
            <span>Total no catálogo</span>
            <strong>{products.length}</strong>
          </div>
          <div className="stat-card">
            <span>Disponíveis</span>
            <strong>{availableCount}</strong>
          </div>
          <div className="stat-card">
            <span>Em destaque</span>
            <strong>{featuredCount}</strong>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Aparelho</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-product">
                      <span className="table-thumb">
                        {product.media.find((item) => item.type === "image") ? (
                          <Image
                            alt=""
                            className="table-thumb-image"
                            fill
                            src={product.media.find((item) => item.type === "image")!.src}
                            unoptimized
                            sizes="42px"
                          />
                        ) : (
                          <Package aria-hidden="true" />
                        )}
                      </span>
                      <span>
                        {product.name}
                        {product.featured && (
                          <Sparkles
                            aria-label="Em destaque"
                            color="#c7fb53"
                            size={12}
                            style={{ display: "inline", marginLeft: 5, verticalAlign: "middle" }}
                          />
                        )}
                      </span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{priceFormatter.format(product.price)}</td>
                  <td>
                    <span className={`status-pill${product.status === "sold" ? " sold" : ""}`}>
                      {product.status === "sold" ? "Vendido" : "Disponível"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        aria-label={`Editar ${product.name}`}
                        className="icon-button"
                        onClick={() => setEditing(product)}
                        type="button"
                      >
                        <Pencil aria-hidden="true" />
                      </button>
                      <button
                        aria-label={`Excluir ${product.name}`}
                        className="icon-button danger"
                        disabled={busy}
                        onClick={() => deleteProduct(product)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="admin-empty" colSpan={5}>
                    Seu catálogo ainda está vazio. Cadastre o primeiro aparelho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {editing !== undefined && (
        <ProductForm
          busy={busy}
          initialProduct={editing}
          onClose={() => setEditing(undefined)}
          onSave={saveProduct}
        />
      )}
    </div>
  );
}

function AdminTopbar() {
  return (
    <div className="admin-topbar">
      <Link className="brand" href="/" aria-label="Bello TECH">
        <span className="brand-mark">
          <Sparkles aria-hidden="true" />
        </span>
        <span>
          Bello <span className="brand-tech">TECH</span>
        </span>
      </Link>
      <Link className="header-link" href="/">
        <ArrowLeft size={14} aria-hidden="true" /> Voltar à loja
      </Link>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(response.status === 401 ? "Senha incorreta. Tente novamente." : await responseError(response));
        return;
      }
      onSuccess();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="eyebrow">
          <ShieldCheck size={15} aria-hidden="true" />
          Acesso protegido
        </span>
        <h1>Bem-vindo de volta.</h1>
        <p>Digite sua senha de administrador para gerenciar a loja.</p>
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="admin-password">Senha de administrador</label>
          <input
            autoComplete="current-password"
            autoFocus
            id="admin-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
        <button className="button button-primary" disabled={busy} style={{ width: "100%" }} type="submit">
          {busy ? "Entrando..." : "Entrar no painel"}
        </button>
      </form>
    </main>
  );
}

type FormValues = {
  name: string;
  category: ProductCategory;
  price: string;
  condition: string;
  battery: string;
  description: string;
  specs: string;
  status: ProductStatus;
  featured: boolean;
  media: ProductMedia[];
};

function ProductForm({
  initialProduct,
  busy,
  onClose,
  onSave,
}: {
  initialProduct: Product | null;
  busy: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [values, setValues] = useState<FormValues>(() => ({
    name: initialProduct?.name ?? "",
    category: initialProduct?.category ?? "Celular",
    price: initialProduct?.price.toString() ?? "",
    condition: initialProduct?.condition ?? "Seminovo A+",
    battery: initialProduct?.battery?.toString() ?? "",
    description: initialProduct?.description ?? "",
    specs: initialProduct?.specs.join("\n") ?? "",
    status: initialProduct?.status ?? "available",
    featured: initialProduct?.featured ?? false,
    media: initialProduct?.media ?? [],
  }));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function change<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    if (files.length + values.media.length > 12) {
      setError("Um aparelho pode ter até 12 fotos e vídeos.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      for (let offset = 0; offset < files.length; offset += 8) {
        const batch = files.slice(offset, offset + 8);
        const storageResponse = await fetch("/api/upload");
        if (!storageResponse.ok) throw new Error(await responseError(storageResponse));
        const storage = (await storageResponse.json()) as { clientUploads: boolean };
        if (storage.clientUploads) {
          const extensions: Record<string, string> = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "video/mp4": ".mp4",
          };
          if (batch.some((file) => !extensions[file.type])) {
            throw new Error("Use fotos JPG, PNG, WEBP ou vídeos MP4.");
          }
          const uploaded = await Promise.all(
            batch.map((file) =>
              uploadBlob(`uploads/${crypto.randomUUID()}${extensions[file.type]}`, file, {
                access: "public",
                handleUploadUrl: "/api/upload",
              }),
            ),
          );
          const media = uploaded.map((blob, index): ProductMedia => ({
            type: batch[index].type === "video/mp4" ? "video" : "image",
            src: blob.url,
          }));
          setValues((previous) => ({ ...previous, media: [...previous.media, ...media] }));
          continue;
        }

        const formData = new FormData();
        batch.forEach((file) => formData.append("files", file));
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        if (!response.ok) throw new Error(await responseError(response));
        const result = (await response.json()) as { media: ProductMedia[] };
        setValues((previous) => ({ ...previous, media: [...previous.media, ...result.media] }));
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setUploading(false);
    }
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void uploadFiles(files);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const price = Number(values.price.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    onSave({
      id: initialProduct?.id ?? "",
      name: values.name.trim(),
      category: values.category,
      price,
      condition: values.condition.trim(),
      battery: values.battery === "" ? undefined : Number(values.battery),
      description: values.description.trim(),
      specs: values.specs.split("\n").map((spec) => spec.trim()).filter(Boolean),
      status: values.status,
      featured: values.featured,
      media: values.media,
    });
  }

  return (
    <div
      className="admin-overlay"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !busy && !uploading) onClose();
      }}
      role="presentation"
    >
      <form className="product-form-modal" onSubmit={handleSubmit}>
        <div className="form-modal-header">
          <h2>{initialProduct ? "Editar aparelho" : "Adicionar aparelho"}</h2>
          <button
            aria-label="Fechar formulário"
            className="icon-button"
            disabled={busy || uploading}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        {error && (
          <div className="message-banner" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="product-name">Nome do aparelho *</label>
          <input
            id="product-name"
            maxLength={100}
            onChange={(event) => change("name", event.target.value)}
            placeholder="Ex.: iPhone 13 Pro 128GB Grafite"
            required
            value={values.name}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="product-category">Categoria *</label>
            <select
              id="product-category"
              onChange={(event) =>
                change("category", event.target.value as ProductCategory)
              }
              value={values.category}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="product-price">Preço (R$) *</label>
            <input
              id="product-price"
              inputMode="decimal"
              onChange={(event) => change("price", event.target.value)}
              placeholder="3290,00"
              required
              value={values.price}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="product-condition">Condição *</label>
            <input
              id="product-condition"
              maxLength={50}
              onChange={(event) => change("condition", event.target.value)}
              placeholder="Seminovo A+"
              required
              value={values.condition}
            />
          </div>
          <div className="field">
            <label htmlFor="product-battery">Saúde da bateria (%)</label>
            <input
              id="product-battery"
              max={100}
              min={0}
              onChange={(event) => change("battery", event.target.value)}
              placeholder="Ex.: 89"
              type="number"
              value={values.battery}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="product-description">Descrição detalhada</label>
          <textarea
            id="product-description"
            maxLength={2400}
            onChange={(event) => change("description", event.target.value)}
            placeholder="Conservação, acessórios inclusos, tempo de uso..."
            value={values.description}
          />
        </div>
        <div className="field">
          <label htmlFor="product-specs">Especificações (uma por linha)</label>
          <textarea
            id="product-specs"
            onChange={(event) => change("specs", event.target.value)}
            placeholder={"128GB de armazenamento\nTela Super Retina"}
            value={values.specs}
          />
        </div>
        <div className="field">
          <label htmlFor="product-media">
            Fotos e vídeos (JPG, PNG, WEBP ou MP4, até 25 MB cada)
          </label>
          <label
            className="upload-drop"
            htmlFor="product-media"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void uploadFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <span>
              <ImagePlus
                aria-hidden="true"
                size={19}
                style={{ display: "block", margin: "0 auto 6px", color: "#c7fb53" }}
              />
              {uploading
                ? "Enviando arquivos..."
                : "Clique para selecionar ou arraste seus arquivos para cá"}
            </span>
            <input
              accept="image/jpeg,image/png,image/webp,video/mp4"
              disabled={uploading}
              id="product-media"
              multiple
              onChange={handleUpload}
              type="file"
            />
          </label>
          <div className="uploaded-media-list">
            {values.media.map((media, index) => (
              <div className="media-preview" key={`${media.src}-${index}`}>
                {media.type === "image" ? (
                  <Image alt="" fill src={media.src} unoptimized />
                ) : (
                  <span
                    style={{
                      display: "grid",
                      height: "100%",
                      placeItems: "center",
                      color: "#c7fb53",
                      fontSize: 10,
                    }}
                  >
                    VÍDEO MP4
                  </span>
                )}
                <button
                  aria-label={`Remover arquivo ${index + 1}`}
                  disabled={uploading}
                  onClick={() =>
                    change(
                      "media",
                      values.media.filter((_, current) => current !== index),
                    )
                  }
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="product-status">Status</label>
            <select
              id="product-status"
              onChange={(event) => change("status", event.target.value as ProductStatus)}
              value={values.status}
            >
              <option value="available">Disponível</option>
              <option value="sold">Vendido</option>
            </select>
          </div>
          <div className="field">
            <span style={{ color: "#d2d5db", fontSize: 11, fontWeight: 650 }}>
              Vitrine
            </span>
            <label className="checkbox-row" htmlFor="product-featured">
              <input
                checked={values.featured}
                id="product-featured"
                onChange={(event) => change("featured", event.target.checked)}
                type="checkbox"
              />
              <Sparkles aria-hidden="true" size={14} />
              Destacar aparelho
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button
            className="button button-secondary"
            disabled={busy || uploading}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="button button-primary"
            disabled={busy || uploading}
            type="submit"
          >
            <Check size={15} aria-hidden="true" />
            {busy ? "Salvando..." : "Salvar aparelho"}
          </button>
        </div>
      </form>
    </div>
  );
}

function NoticeBanner({
  notice,
  onClose,
}: {
  notice: Notice;
  onClose: () => void;
}) {
  return (
    <div
      className={`admin-notice${notice.success ? " success" : ""}`}
      role={notice.success ? "status" : "alert"}
    >
      {notice.success ? (
        <Check size={15} style={{ display: "inline", verticalAlign: "middle" }} />
      ) : (
        <CircleAlert size={15} style={{ display: "inline", verticalAlign: "middle" }} />
      )}{" "}
      {notice.text}
      <button aria-label="Fechar notificação" onClick={onClose} type="button">
        <X size={14} />
      </button>
    </div>
  );
}

async function responseError(response: Response) {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return body.error ?? `Não foi possível concluir a operação (${response.status}).`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
}
