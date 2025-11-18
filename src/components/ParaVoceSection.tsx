"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { produtosParaVoce } from "@/data/produtosParaVoce";

export default function ParaVoceSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Título centralizado igual SHEIN */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="flex-1 h-[1px] bg-gray-300 max-w-[120px]" />
        <h2 className="text-[16px] font-bold text-neutral-900">Para você</h2>
        <span className="flex-1 h-[1px] bg-gray-300 max-w-[120px]" />
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {produtosParaVoce.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-sm shadow-sm hover:shadow-md transition"
          >
            <Link href={`/produto/${p.id}`} className="block cursor-pointer">
              <div className="relative w-full pb-[140%]">
                <Image
                  src={p.imagem}
                  alt={p.nome}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Conteúdo igual SHEIN */}
              <div className="px-2 py-3">
                {/* Nome */}
                <p className="text-[13px] text-neutral-800 font-normal truncate mb-1">
                  {p.nome}
                </p>

                {/* Preço + Desconto + ícone */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[#ff4e4e] font-semibold text-[18px]">
                      {p.preco}
                    </span>

                    <span className="text-[#ff4e4e] text-[11px] border border-[#ff4e4e] px-[4px] py-[1px] rounded-sm">
                      -{p.desconto}
                    </span>
                  </div>

                  {/* Ícone */}
                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center border border-gray-400 rounded-full hover:bg-gray-100"
                    onClick={(e) => e.preventDefault()} // evita navegar ao clicar no ícone
                  >
                    <ShoppingBag className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
