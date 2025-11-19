"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { produtosParaVoce } from "@/data/produtosParaVoce";

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { totalItems } = useCart();
  const isMobile = useIsMobile();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return produtosParaVoce
      .filter((p) => p.nome.toLowerCase().includes(q))
      .slice(0, 8); // limita sugestões
  }, [searchTerm]);

  function handleSelectProduct(id: number) {
    setShowSuggestions(false);
    setSearchTerm("");
    router.push(`/produto/${id}`);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    context: "desktop" | "mobile"
  ) {
    if (e.key === "Enter" && filteredProducts.length > 0) {
      e.preventDefault();
      handleSelectProduct(filteredProducts[0].id);
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-black text-white border-b border-neutral-800 z-50 transform transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* ================= DESKTOP HEADER ================= */}
      {!isMobile && (
        <>
          <div className="w-full flex items-center justify-between px-12 py-4">
            {/* LOGO */}
            <div className="flex items-center">
              <Link href="/" className="cursor-pointer">
                <svg
                  style={{
                    width: "auto",
                    height: "30px",
                    display: "inline-block",
                  }}
                  width="106"
                  height="22"
                  viewBox="0 0 106 22"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_900_7310)">
        <path d="M16.5 15.95C16.5 16.775 16.3167 17.5083 15.95 18.15C15.5833 18.8833 15.0333 19.4333 14.3917 19.9833C13.75 20.5333 12.925 20.9917 12.0083 21.2667C11.0917 21.5417 10.0833 21.725 8.98333 21.725C7.975 21.725 7.05833 21.6333 6.325 21.5417C5.5 21.45 4.76667 21.2667 4.03333 21.0833C3.3 20.9 2.65833 20.5333 2.01667 20.2583C1.375 19.8917 0.733333 19.4333 0 18.975L3.20833 16.1333C4.125 16.8667 5.04167 17.325 5.95833 17.6C6.875 17.875 7.79167 18.0583 8.8 18.0583C9.25833 18.0583 9.625 17.9667 9.99167 17.875C10.3583 17.7833 10.725 17.6 11 17.4167C11.275 17.2333 11.4583 16.9583 11.6417 16.775C11.825 16.5 11.9167 16.225 11.9167 15.95C11.9167 15.5833 11.825 15.3083 11.7333 15.0333C11.6417 14.7583 11.3667 14.4833 11 14.3C10.6333 14.025 10.175 13.8417 9.53333 13.5667C8.89167 13.2917 8.15833 13.0167 7.15 12.7417C6.325 12.4667 5.5 12.1917 4.675 11.825C3.85 11.4583 3.20833 11 2.65833 10.5417C2.10833 10.0833 1.55833 9.44167 1.28333 8.8C0.825 7.975 0.641667 7.15 0.641667 6.23333C0.641667 5.31667 0.825 4.49167 1.19167 3.75833C1.55833 3.025 2.10833 2.38333 2.84167 1.83333C3.48333 1.375 4.30833 0.916667 5.225 0.641667C6.14167 0.366667 7.15 0.183333 8.15833 0.183333C9.9 0.183333 11.4583 0.366667 12.65 0.825C13.8417 1.28333 14.9417 1.83333 15.8583 2.65833L12.7417 5.5C12.1917 5.04167 11.55 4.58333 10.8167 4.30833C10.0833 4.03333 9.25833 3.94167 8.34167 3.94167C7.88333 3.94167 7.51667 4.03333 7.15 4.125C6.69167 4.21667 6.41667 4.4 6.14167 4.58333C5.86667 4.76667 5.68333 5.04167 5.5 5.31667C5.31667 5.59167 5.225 5.86667 5.225 6.14167C5.225 6.50833 5.31667 6.78333 5.5 7.05833C5.59167 7.33333 5.86667 7.51667 6.23333 7.79167C6.6 8.06667 7.05833 8.25 7.7 8.525C8.34167 8.8 9.075 9.075 9.99167 9.35C11.1833 9.71667 12.1 10.0833 12.925 10.5417C13.75 11 14.3917 11.4583 14.9417 12.0083C15.4917 12.5583 15.8583 13.1083 16.1333 13.75C16.4083 14.3917 16.5 15.125 16.5 15.95ZM42.2583 21.45H37.7667V12.2833H29.425V21.45H24.9333V0.641667H29.425V8.89167H37.7667V0.641667H42.2583V21.45ZM67.1 21.45H50.6917V0.641667H67.1V3.94167H55.0917V8.89167H66.1833V12.1H55.0917V17.7833H67.1V21.45ZM80.3917 21.45H75.9V0.641667H80.3917V21.45ZM105.783 0.641667V22L93.225 11.0917V21.2667H88.825V0L101.383 10.9083V0.641667H105.783Z" />
                  </g>
                  <defs>
                    <clipPath id="clip0_900_7310">
                      <rect width="106" height="22" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
            </div>

            {/* SEARCH DESKTOP COM SUGESTÕES */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="bg-white rounded-md border border-neutral-800 flex items-center px-3 py-1">
                  <input
                    type="text"
                    placeholder="Vestido branco, calça jeans, body..."
                    className="w-full bg-transparent py-1 text-sm text-black outline-none"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => handleKeyDown(e, "desktop")}
                  />
                  <MagnifyingGlassIcon
                    className="w-5 h-5 text-black cursor-pointer"
                    onClick={() => {
                      if (filteredProducts.length > 0) {
                        handleSelectProduct(filteredProducts[0].id);
                      }
                    }}
                  />
                </div>

                {/* DROPDOWN DE SUGESTÕES */}
                {showSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white text-black rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
                        // onMouseDown pra não perder o foco antes do clique
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectProduct(p.id);
                        }}
                      >
                        <div className="relative w-10 h-14 flex-shrink-0">
                          <Image
                            src={
                              p.imagem.startsWith("http")
                                ? p.imagem
                                : `https:${p.imagem}`
                            }
                            alt={p.nome}
                            fill
                            className="object-cover rounded-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-800 line-clamp-2">
                            {p.nome}
                          </p>
                          <p className="text-sm text-[#ff4e4e] font-semibold">
                            {p.preco}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ICONS RIGHT */}
            <div className="flex items-center gap-6 pl-6">
              <UserIcon className="w-5 h-5 text-white cursor-pointer" />
              <Link href="/cart" className="relative cursor-pointer">
                <ShoppingCartIcon className="w-5 h-5 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </Link>

              <HeartIcon className="w-5 h-5 text-white cursor-pointer" />
              <GlobeAltIcon className="w-5 h-5 text-white cursor-pointer" />
            </div>
          </div>
        </>
      )}

      {/* ================= MOBILE HEADER ================= */}
      {isMobile && (
        <>
          {/* Topo: logo + ícones */}
          <div className="w-full flex items-center justify-between px-4 py-3">
            <Link href="/" className="cursor-pointer">
              <svg
                style={{
                  width: "auto",
                  height: "24px",
                  display: "inline-block",
                }}
                width="90"
                height="20"
                viewBox="0 0 106 22"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_900_7310)">
        <path d="M16.5 15.95C16.5 16.775 16.3167 17.5083 15.95 18.15C15.5833 18.8833 15.0333 19.4333 14.3917 19.9833C13.75 20.5333 12.925 20.9917 12.0083 21.2667C11.0917 21.5417 10.0833 21.725 8.98333 21.725C7.975 21.725 7.05833 21.6333 6.325 21.5417C5.5 21.45 4.76667 21.2667 4.03333 21.0833C3.3 20.9 2.65833 20.5333 2.01667 20.2583C1.375 19.8917 0.733333 19.4333 0 18.975L3.20833 16.1333C4.125 16.8667 5.04167 17.325 5.95833 17.6C6.875 17.875 7.79167 18.0583 8.8 18.0583C9.25833 18.0583 9.625 17.9667 9.99167 17.875C10.3583 17.7833 10.725 17.6 11 17.4167C11.275 17.2333 11.4583 16.9583 11.6417 16.775C11.825 16.5 11.9167 16.225 11.9167 15.95C11.9167 15.5833 11.825 15.3083 11.7333 15.0333C11.6417 14.7583 11.3667 14.4833 11 14.3C10.6333 14.025 10.175 13.8417 9.53333 13.5667C8.89167 13.2917 8.15833 13.0167 7.15 12.7417C6.325 12.4667 5.5 12.1917 4.675 11.825C3.85 11.4583 3.20833 11 2.65833 10.5417C2.10833 10.0833 1.55833 9.44167 1.28333 8.8C0.825 7.975 0.641667 7.15 0.641667 6.23333C0.641667 5.31667 0.825 4.49167 1.19167 3.75833C1.55833 3.025 2.10833 2.38333 2.84167 1.83333C3.48333 1.375 4.30833 0.916667 5.225 0.641667C6.14167 0.366667 7.15 0.183333 8.15833 0.183333C9.9 0.183333 11.4583 0.366667 12.65 0.825C13.8417 1.28333 14.9417 1.83333 15.8583 2.65833L12.7417 5.5C12.1917 5.04167 11.55 4.58333 10.8167 4.30833C10.0833 4.03333 9.25833 3.94167 8.34167 3.94167C7.88333 3.94167 7.51667 4.03333 7.15 4.125C6.69167 4.21667 6.41667 4.4 6.14167 4.58333C5.86667 4.76667 5.68333 5.04167 5.5 5.31667C5.31667 5.59167 5.225 5.86667 5.225 6.14167C5.225 6.50833 5.31667 6.78333 5.5 7.05833C5.59167 7.33333 5.86667 7.51667 6.23333 7.79167C6.6 8.06667 7.05833 8.25 7.7 8.525C8.34167 8.8 9.075 9.075 9.99167 9.35C11.1833 9.71667 12.1 10.0833 12.925 10.5417C13.75 11 14.3917 11.4583 14.9417 12.0083C15.4917 12.5583 15.8583 13.1083 16.1333 13.75C16.4083 14.3917 16.5 15.125 16.5 15.95ZM42.2583 21.45H37.7667V12.2833H29.425V21.45H24.9333V0.641667H29.425V8.89167H37.7667V0.641667H42.2583V21.45ZM67.1 21.45H50.6917V0.641667H67.1V3.94167H55.0917V8.89167H66.1833V12.1H55.0917V17.7833H67.1V21.45ZM80.3917 21.45H75.9V0.641667H80.3917V21.45ZM105.783 0.641667V22L93.225 11.0917V21.2667H88.825V0L101.383 10.9083V0.641667H105.783Z" />
                </g>
                <defs>
                  <clipPath id="clip0_900_7310">
                    <rect width="106" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </Link>

            <div className="flex items-center gap-4">
              <HeartIcon className="w-5 h-5 text-white cursor-pointer" />
              <UserIcon className="w-5 h-5 text-white cursor-pointer" />
              <Link href="/cart" className="relative cursor-pointer">
                <ShoppingCartIcon className="w-5 h-5 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* SEARCH MOBILE COM SUGESTÕES */}
          <div className="w-full px-4 pb-3">
            <div className="relative">
              <div className="w-full bg-white rounded-md border border-neutral-800 flex items-center px-3 py-1.5">
                <MagnifyingGlassIcon
                  className="w-5 h-5 text-black mr-1 cursor-pointer"
                  onClick={() => {
                    if (filteredProducts.length > 0) {
                      handleSelectProduct(filteredProducts[0].id);
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar na loja"
                  className="w-full bg-transparent text-sm text-black outline-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => handleKeyDown(e, "mobile")}
                />
              </div>

              {showSuggestions && filteredProducts.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white text-black rounded-md shadow-lg border border-gray-200 max-h-72 overflow-y-auto z-50">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectProduct(p.id);
                      }}
                    >
                      <div className="relative w-9 h-12 flex-shrink-0">
                        <Image
                          src={
                            p.imagem.startsWith("http")
                              ? p.imagem
                              : `https:${p.imagem}`
                          }
                          alt={p.nome}
                          fill
                          className="object-cover rounded-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] text-neutral-800 line-clamp-2">
                          {p.nome}
                        </p>
                        <p className="text-xs text-[#ff4e4e] font-semibold">
                          {p.preco}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
