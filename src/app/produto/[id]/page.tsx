"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Star, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProdutoById } from "@/data/produtosParaVoce";
import { useCart } from "@/context/CartContext";

const sizes = [
  "P",
  "M (M)",
  "G",
  "GG",
  "G1",
  "G2",
  "G3",
  "GG(44)",
  "M(38)",
  "P(36)",
  "G3)",
  "G2)",
];

export default function ProductPage() {
  const params = useParams() as { id?: string | string[] };
  const { addToCart } = useCart();

  const idParamRaw = params?.id;
  const idParam = Array.isArray(idParamRaw) ? idParamRaw[0] : idParamRaw ?? "";
  const idNumber = Number(idParam);
  const produto = Number.isNaN(idNumber) ? null : getProdutoById(idNumber);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!produto) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-6 pt-[140px] pb-20">
          <p className="text-sm text-gray-700">Produto não encontrado.</p>
        </main>
      </>
    );
  }

  // cálculo do preço original
  let precoOriginalFormatado: string | null = null;
  try {
    const precoLimpo = produto.preco
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();
    const preco = Number(precoLimpo);
    const descontoNumero = Number(produto.desconto.replace("%", "").trim());

    if (preco > 0 && descontoNumero > 0 && descontoNumero < 100) {
      const original = preco / (1 - descontoNumero / 100);
      precoOriginalFormatado = original.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
      });
    }
  } catch {
    precoOriginalFormatado = null;
  }

const handleAddToCart = () => {
  if (!selectedSize) {
    setFeedback("Selecione um tamanho antes de adicionar ao carrinho.");
    return;
  }

  addToCart(
    {
      id: produto.id,
      nome: produto.nome,       // título
      preco: produto.preco,     // preço
      imagem: produto.imagem,   // imagem
      size: selectedSize,       // tamanho
    },
    1
  );

  setFeedback("Produto adicionado ao carrinho!");
};


  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-[140px] pb-20">
        {/* BREADCRUMB DINÂMICO */}
        <div className="text-xs text-gray-500 mb-4">
          Início / Vestuário Feminino / Roupas Femininas /{" "}
          <span className="text-gray-700 truncate inline-block max-w-[260px] align-bottom">
            {produto.nome}
          </span>
        </div>

        {/* TOPO: GALERIA + INFO PRODUTO */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-10">
          {/* GALERIA ESQUERDA */}
          <div className="flex w-full justify-center">
            <div className="relative w-full max-w-[700px] pb-[120%] bg-gray-100 overflow-hidden">
              <Image
                src={produto.imagem}
                alt={produto.nome}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* INFO DIREITA */}
          <div className="space-y-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {produto.nome}
            </h1>

            <p className="text-xs text-gray-500">
              SKU: s22409192610809091{" "}
              <span className="ml-1 text-yellow-500 inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 stroke-yellow-500" /> 4.9{" "}
                <span className="text-gray-500">(1000+ comentários)</span>
              </span>
            </p>

            {/* PREÇO DINÂMICO */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">A partir de</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-orange-500">
                  {produto.preco}
                </span>

                {precoOriginalFormatado && (
                  <span className="text-sm text-gray-400 line-through">
                    {precoOriginalFormatado}
                  </span>
                )}

                <span className="text-sm text-orange-500 font-semibold">
                  {produto.desconto} OFF
                </span>
              </div>

              <span className="inline-flex items-center text-[11px] bg-[#ffedd5] text-orange-700 px-2 py-0.5 rounded-sm">
                Oferta especial para você
              </span>
            </div>

            {/* TAMANHO */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-800">Tamanho</span>
                <button className="text-xs text-gray-500 hover:underline">
                  BR Tamanho ▾
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 border rounded-full text-xs transition ${
                        isSelected
                          ? "border-black text-black"
                          : "border-gray-300 text-gray-700"
                      } hover:border-black`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {selectedSize && (
                <p className="mt-2 text-xs text-gray-600">
                  Tamanho selecionado:{" "}
                  <span className="font-semibold text-gray-800">
                    {selectedSize}
                  </span>
                </p>
              )}
            </div>

            {/* ENVIADO POR */}
            <div className="mt-4">
              <p className="text-sm text-gray-800 mb-2">Enviado por</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-black rounded-full text-xs">
                  Envio Nacional
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-full text-xs text-gray-700">
                  Internacional
                </button>
              </div>
            </div>

            {/* BOTÃO CARRINHO */}
            <div className="mt-6 space-y-3">
              <button
                className="w-full bg-black text-white py-3 text-sm font-semibold tracking-wide"
                onClick={handleAddToCart}
              >
                ADICIONAR AO CARRINHO
              </button>

              {feedback && (
                <p className="text-xs text-center text-gray-700">{feedback}</p>
              )}

              <button className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </span>
                <span>Favoritar</span>
              </button>
            </div>

            {/* SIDEBAR DIREITA ABAIXO DO CARRINHO */}
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 p-4 text-xs text-gray-800">
                <h3 className="font-semibold mb-2">
                  Envio Envio Nacional para o Brazil
                </h3>
                <p className="mb-2">
                  <span className="font-semibold text-green-600">
                    Frete grátis (Pedidos ≥ R$69,00)
                  </span>
                  <br />
                  Entrega Econômica: 60% chance de entrega em até 9 dias.
                </p>
                <p className="mb-1">
                  Política de devolução ✔ Devoluções gratuitas
                </p>
                <p>Segurança de compras ✔ Pagamentos Seguros ✔ Privacidade</p>
              </div>

        <div className="border border-gray-200 p-4 text-xs text-gray-800">
  <h3 className="font-semibold mb-2">Descrição</h3>

  <p className="leading-relaxed">
    Produto desenvolvido com materiais de alta qualidade, oferecendo conforto,
    estilo e durabilidade para o seu dia a dia. Ideal para compor looks modernos
    e versáteis, combinando perfeitamente com diversas ocasiões. Design pensado
    para valorizar o visual com praticidade e elegância.
  </p>
</div>


              <div className="border border-gray-200 p-4 text-xs text-gray-800">
                <h3 className="font-semibold mb-2">Sobre a Loja</h3>

                {/* Header da loja igual SHEIN */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src="https://cdn-1.webcatalog.io/catalog/shein/shein-icon-filled-256.png?v=1760921032847"
                    alt="SHEIN"
                    className="w-8 h-8 rounded-full object-cover bg-gray-200"
                  />

                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      SHEIN Oficial
                      <span className="text-blue-500 text-[14px]">✔</span>
                    </p>
                  </div>
                </div>

                {/* Botões iguais SHEIN */}
                <button className="w-full border border-gray-300 py-2 text-xs mb-2 hover:border-black transition">
                  Ver todos os produtos
                </button>

                <button className="w-full bg-black text-white py-2 text-xs hover:bg-neutral-900 transition">
                  + Seguir Loja
                </button>
              </div>
            </div>
          </div>
          
        </section>
        
      </main>
            <Footer />
    </>
  );
}
