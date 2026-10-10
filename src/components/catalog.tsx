"use client";

import Image from "next/image";
import {
  ArrowUpDown,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleHelp,
  HardDrive,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Watch,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Product, ProductCategory, ProductMedia } from "@/lib/types";
import { categories } from "@/lib/types";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function whatsappLink(product: Product) {
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);
  const message = `Olá, Bello TECH! Tenho interesse no aparelho ${product.name} no valor de ${price}. Ainda está disponível?`;
  return `https://wa.me/5513997052277?text=${encodeURIComponent(message)}`;
}

function productImage(product: Product) {
  return product.media.find((item) => item.type === "image")?.src;
}

export function Catalog({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "Todos">("Todos");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const [selected, setSelected] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const filtered = products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const searchable = [product.name, product.category, product.condition]
        .join(" ")
        .toLocaleLowerCase("pt-BR");
      return matchesCategory && (!query || searchable.includes(query));
    });
    if (sort === "low") filtered.sort((first, second) => first.price - second.price);
    if (sort === "high") filtered.sort((first, second) => second.price - first.price);
    if (sort === "featured") {
      filtered.sort(
        (first, second) => Number(second.featured) - Number(first.featured),
      );
    }
    return filtered;
  }, [category, products, search, sort]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="Bello TECH, início">
            <span className="brand-mark">
              <Sparkles aria-hidden="true" />
            </span>
            <span>
              Bello <span className="brand-tech">TECH</span>
            </span>
          </a>
          <label className="search-box">
            <Search aria-hidden="true" />
            <input
              aria-label="Buscar aparelhos"
              placeholder="Busque por iPhone, MacBook..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <a className="header-link" href="/admin">
            Painel ADM <ChevronRight size={15} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Tecnologia com procedência
            </span>
            <h1>
              Seu próximo
              <br />
              tech. <span>Sem dúvida.</span>
            </h1>
            <p className="hero-copy">
              Aparelhos selecionados e revisados, com garantia de verdade.
              Tecnologia premium com a tranquilidade que você merece.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#catalogo">
                Encontrar meu próximo aparelho
                <ChevronRight size={16} aria-hidden="true" />
              </a>
              <a
                className="button button-secondary"
                href="https://wa.me/5513997052277"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={15} aria-hidden="true" />
                Fale com um especialista
              </a>
            </div>
            <div className="hero-trust">
              <span>
                <ShieldCheck aria-hidden="true" />
                Aparelhos testados
              </span>
              <span>
                <BadgeCheck aria-hidden="true" />
                Garantia Bello TECH
              </span>
              <span>
                <Truck aria-hidden="true" />
                Envio para todo o Brasil
              </span>
            </div>
          </div>
        </section>

        <section className="catalog-section" id="catalogo">
          <div className="page-width">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Escolha com confiança</span>
                <h2>Achados que valem cada clique.</h2>
                <p>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "aparelho disponível" : "aparelhos disponíveis"}{" "}
                  selecionados para você.
                </p>
              </div>
              <a
                className="button button-secondary"
                href="https://wa.me/5513997052277"
                target="_blank"
                rel="noreferrer"
              >
                Consultar um modelo
                <ChevronRight size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="catalog-controls" aria-label="Filtros do catálogo">
              <button
                className={`filter-chip${category === "Todos" ? " active" : ""}`}
                onClick={() => setCategory("Todos")}
                type="button"
              >
                Todos
              </button>
              {categories.map((item) => (
                <button
                  className={`filter-chip${category === item ? " active" : ""}`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item === "Celular" ? "iPhones & celulares" : item}
                </button>
              ))}
              <select
                aria-label="Ordenar aparelhos"
                className="sort-select"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as "featured" | "low" | "high")
                }
              >
                <option value="featured">Em destaque</option>
                <option value="low">Menor preço</option>
                <option value="high">Maior preço</option>
              </select>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    <div className="product-image-placeholder" aria-hidden="true" />
                    {productImage(product) && (
                      <Image
                        alt={product.name}
                        fill
                        sizes="(max-width: 620px) 35vw, (max-width: 880px) 50vw, 33vw"
                        src={productImage(product)!}
                        unoptimized
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span className="product-tag">{product.condition}</span>
                    {product.featured && (
                      <span className="featured-tag" title="Em destaque">
                        <Sparkles aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 title={product.name}>{product.name}</h3>
                    <p className="product-description">
                      {product.battery !== undefined
                        ? `Saúde da bateria ${product.battery}% · `
                        : ""}
                      {product.specs[0] ?? "Revisado e com garantia"}
                    </p>
                    <div className="product-price-row">
                      <span className="product-price">
                        <span className="price-label">à vista</span>
                        {priceFormatter.format(product.price)}
                      </span>
                    </div>
                    <div className="card-actions">
                      <a
                        className="button button-primary button-card"
                        href={whatsappLink(product)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={14} aria-hidden="true" />
                        Tenho interesse
                      </a>
                      <button
                        aria-label={`Ver detalhes de ${product.name}`}
                        className="button button-details"
                        onClick={() => setSelected(product)}
                        type="button"
                      >
                        <CircleHelp aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {filteredProducts.length === 0 && (
                <div className="empty-results">
                  <p>Nenhum aparelho encontrado com esses filtros.</p>
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setSearch("");
                      setCategory("Todos");
                    }}
                    type="button"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-inner">
          <a className="brand" href="#" aria-label="Bello TECH, início">
            <span className="brand-mark">
              <Sparkles aria-hidden="true" />
            </span>
            <span>
              Bello <span className="brand-tech">TECH</span>
            </span>
          </a>
          <span>© {new Date().getFullYear()} Bello TECH. Tecnologia com procedência.</span>
          <a
            className="footer-contact"
            href="https://wa.me/5513997052277"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle aria-hidden="true" />
            (13) 99705-2277
          </a>
        </div>
      </footer>

      {selected && (
        <ProductDetail
          key={selected.id}
          onClose={() => setSelected(null)}
          product={selected}
        />
      )}
    </>
  );
}

function ProductDetail({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [activeMedia, setActiveMedia] = useState(0);
  const gallery: ProductMedia[] = product.media;
  const current = gallery[activeMedia];

  return (
    <div
      className="detail-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="product-detail-title"
        aria-modal="true"
        className="detail-modal"
        role="dialog"
      >
        <button
          aria-label="Fechar detalhes"
          className="detail-close"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
        <div className="detail-layout">
          <div className="detail-gallery">
            <div className="detail-media">
              {current?.type === "video" ? (
                <video controls playsInline src={current.src} />
              ) : current ? (
                <Image alt={product.name} fill src={current.src} unoptimized />
              ) : (
                <div className="product-image-placeholder" aria-hidden="true" />
              )}
            </div>
            {gallery.length > 0 && (
              <div className="detail-thumbnails" aria-label="Fotos e vídeos">
                {gallery.map((media, index) => (
                  <button
                    aria-label={`${media.type === "video" ? "Vídeo" : "Foto"} ${index + 1}`}
                    className={`detail-thumbnail${index === activeMedia ? " active" : ""}`}
                    key={`${media.src}-${index}`}
                    onClick={() => setActiveMedia(index)}
                    type="button"
                  >
                    {media.type === "image" ? (
                      <Image alt="" fill src={media.src} unoptimized />
                    ) : (
                      <Watch aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="detail-copy">
            <span className="eyebrow">{product.condition}</span>
            <h2 id="product-detail-title">{product.name}</h2>
            <span className="detail-price">{priceFormatter.format(product.price)}</span>
            <p>{product.description || "Aparelho selecionado e revisado pela Bello TECH."}</p>
            <ul className="spec-list">
              <li>
                <Check aria-hidden="true" />
                Categoria: {product.category}
              </li>
              {product.battery !== undefined && (
                <li>
                  <Check aria-hidden="true" />
                  Saúde da bateria: {product.battery}%
                </li>
              )}
              {product.specs.map((spec) => (
                <li key={spec}>
                  <HardDrive aria-hidden="true" />
                  {spec}
                </li>
              ))}
              <li>
                <ShieldCheck aria-hidden="true" />
                90 dias de garantia Bello TECH
              </li>
            </ul>
            <a
              className="button button-primary"
              href={whatsappLink(product)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" size={16} />
              Comprar pelo WhatsApp
              <ArrowUpDown aria-hidden="true" size={15} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
