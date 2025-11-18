"use client";

import Image from "next/image";
import {
  SpeakerWaveIcon,
  LockClosedIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  TrashIcon,
  HeartIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

function parseBRL(preco: string): number {
  const limpo = preco
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const num = Number(limpo);
  return isNaN(num) ? 0 : num;
}

export default function CartPage() {
  const { items, totalItems, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const subtotal = items.reduce(
    (sum, item) => sum + parseBRL(item.preco) * item.quantity,
    0
  );

  const subtotalBRL = subtotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

  const firstItem = items[0];

  // diminuir quantidade
  const handleDecrease = (item: any) => {
    if (item.quantity <= 1) return;
    updateQuantity(item.id, item.size ?? null, item.quantity - 1);
  };

  // aumentar quantidade
  const handleIncrease = (item: any) => {
    updateQuantity(item.id, item.size ?? null, item.quantity + 1);
  };

  // remover item do carrinho
  const handleRemove = (item: any) => {
    removeFromCart(item.id, item.size ?? null);
  };

  // ir pro checkout com o valor total
  const handleCheckout = () => {
    if (totalItems === 0) return;

    const totalNumber = subtotal.toFixed(2); // ex: "123.45"
    router.push(`/checkout?total=${encodeURIComponent(totalNumber)}`);
  };

  return (
    <>
      {/* HEADER FIXO TIPO SHEIN */}
      <header className="fixed top-2 left-0 w-full bg-white border-b border-[#e5e5e5] z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* LOGO + ENVIAR PARA BRAZIL */}
          <div className="flex items-center gap-3">
            {/* LOGO CLICÁVEL → HOME */}
            <Link href="/">
              <svg
                style={{
                  width: "auto",
                  height: "26px",
                  display: "inline-block",
                  cursor: "pointer",
                }}
                width="90"
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

            <div className="flex items-center gap-1 px-3 py-1 bg-[#f5f5f5] rounded-full text-[11px] text-[#555] cursor-pointer">
              <MapPinIcon className="w-3.5 h-3.5 text-[#666]" />
              <span>Enviar para Brazil</span>
            </div>
          </div>

          {/* CHECKOUT SEGURO */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0f8a4b] flex items-center justify-center">
              <LockClosedIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[12px] text-[#0f8a4b]">Checkout Seguro</span>
          </div>
        </div>
      </header>

      <main className="pt-[52px] bg-[#f5f5f5] min-h-screen">
        {/* BARRA AZUL TOPO */}
        <div className="w-full bg-[#e5f2ff] border-b border-[#c8ddff]">
          <div className="max-w-6xl mx-auto flex items-center gap-2 px-4 py-2 text-[12px] text-[#333]">
            <SpeakerWaveIcon className="w-4 h-4 text-[#4b74ff]" />
            <span>
              Para pedidos internacionais acima de $50, receba $20 de desconto.
            </span>
          </div>
        </div>

        {/* BREADCRUMB */}
        <div className="bg-white border-b border-[#eee]">
          <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 flex justify-center">
            <div className="flex items-center gap-1 text-[15px] text-[#666]">
              <span className="text-[15px] text-[#333]">Carrinho</span>
              <ChevronRightIcon className="w-3 h-3" />
              <span className="uppercase text-[15px] text-[#f4903d] font-semibold">
                Continuar compra
              </span>
              <ChevronRightIcon className="w-3 h-3" />
              <span>Pagar</span>
              <ChevronRightIcon className="w-3 h-3" />
              <span>Pedido Completo</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
          {/* COLUNA ESQUERDA */}
          <div className="flex-1 space-y-5">
            {/* Banner frete */}
            <div className="bg-[#fff5f0] border border-[#ffd0b8] text-[14px] text-[#c55325] px-5 py-4 flex justify-between items-center rounded">
              <span>
                Você desbloqueou{" "}
                <span className="font-semibold">FRETE ECONÔMICO GRÁTIS</span>{" "}
                neste pedido. Aproveite antes que acabe.
              </span>
              <button className="text-[13px] text-[#333] hover:underline">
                Ver detalhes &gt;
              </button>
            </div>

            {/* VAZIO */}
            {totalItems === 0 ? (
              <div className="bg-white border border-[#ebebeb] rounded px-5 py-10 text-center text-sm text-[#666]">
                Seu carrinho está vazio. Adicione produtos para continuar.
              </div>
            ) : (
              <div className="bg-white border border-[#ebebeb] rounded">
                {/* Cabeçalho todos os itens */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] bg-[#fafafa]">
                  <div className="flex items-center gap-3 text-[15px] text-[#333]">
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                    <span className="font-semibold uppercase">
                      Todos os itens ({totalItems})
                    </span>
                  </div>
                  <span className="text-[13px] text-[#999]">
                    e***f comprou há 5h
                  </span>
                </div>

                {/* ENVIO NACIONAL */}
                <div>
                  <div className="flex items-start gap-3 px-5 py-4 bg-[#f3f8ff] border-b border-[#e3ecff]">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 mt-1"
                    />

                    <div className="flex flex-col gap-1 text-[14px] leading-snug">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#333] text-[15px]">
                          Envio Nacional
                        </span>
                        <span className="text-[12px] px-2 py-[2px] rounded bg-[#e8f5e9] text-[#3f7f41] border border-[#cde6cf]">
                          Frete grátis
                        </span>
                      </div>

                      <p className="text-[#666] text-[13px] leading-normal">
                        Este pedido conta com{" "}
                        <span className="font-semibold text-[#f4903d]">
                          FRETE ECONÔMICO GRÁTIS
                        </span>
                        . O benefício será aplicado automaticamente na página de
                        pagamento.
                      </p>
                    </div>

                    <button className="ml-auto text-[13px] text-[#333] hover:underline">
                      Ver regras &gt;
                    </button>
                  </div>

                  {/* Loja SHEIN */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f5f5f5]">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 mt-0.5"
                    />

                    <span className="text-[15px] text-[#333] flex items-center gap-2">
                      <span
                        style={{
                          verticalAlign: "middle",
                          display: "inline-block",
                          lineHeight: 0,
                        }}
                      >
                        <svg
                          style={{ width: "20px", height: "20px" }}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.02392 2.16675C3.66381 2.16675 3.33301 2.36523 3.16354 2.68298L2.0101 4.84568C1.25754 6.25672 1.5275 7.99524 2.67251 9.11163C2.8211 9.2565 2.97729 9.38258 3.1391 9.49069V16.6667C3.1391 17.311 3.66144 17.8333 4.30577 17.8333H15.6947C16.339 17.8333 16.8613 17.311 16.8613 16.6667V9.49041C17.023 9.38236 17.179 9.25637 17.3275 9.11163C18.4725 7.99524 18.7425 6.25672 17.9899 4.84568L16.8365 2.68298C16.6709 2.37258 16.3466 2.16675 15.9783 2.16675H10V3.66675H15.6611L16.6664 5.55156C17.1049 6.37388 16.9476 7.38703 16.2803 8.03763C15.2531 9.03914 13.5278 8.31146 13.5278 6.87761V6.30961L12.0276 6.30957V6.38895C12.0276 7.50886 11.1197 8.41673 9.99982 8.41673C8.88821 8.41673 7.98551 7.52226 7.9722 6.41381V6.30961L6.47205 6.30957V6.38895C6.47205 6.39989 6.4721 6.41082 6.4722 6.42174V6.87761C6.4722 8.31146 4.74686 9.03914 3.71966 8.03763C3.05238 7.38703 2.89506 6.37388 3.33363 5.55156L4.33886 3.66675H10V2.16675H4.02392ZM7.36784 8.73802C6.73516 9.58606 5.68929 10.0636 4.6391 9.99841V16.3333H15.3613V9.99838C14.3109 10.0637 13.2647 9.5861 12.632 8.7378C11.986 9.46127 11.0461 9.91673 9.99982 9.91673C8.95367 9.91673 8.01388 9.46136 7.36784 8.73802Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>

                      <span className="font-semibold">SHEIN Oficial</span>
                    </span>

                    <span className="ml-1 text-[13px] text-[#555] cursor-pointer hover:underline">
                      &gt;
                    </span>
                  </div>

                  {/* LISTA DE PRODUTOS DO CARRINHO */}
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.size ?? "unico"}`}
                      className="flex items-start gap-4 px-5 py-5 border-b border-[#f5f5f5] last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 mt-10"
                      />

                      <div className="relative w-[95px] h-[125px] bg-[#f2f2f2] overflow-hidden border border-[#e0e0e0] rounded">
                        <Image
                          src={item.imagem}
                          alt={item.nome}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-[15px] text-[#333] font-medium line-clamp-2 mb-1">
                          {item.nome}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#555] mb-2">
                          {item.size && (
                            <span className="px-3 py-[3px] border border-[#ddd] rounded-full text-[12px]">
                              Tamanho: {item.size}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[18px] text-[#f6531f] font-semibold">
                              {item.preco}
                            </span>
                          </div>

                          <div className="flex items-center gap-5">
                            {/* CONTROLE + / - */}
                            <div className="flex items-center border border-[#ddd] rounded text-[13px]">
                              <button
                                className="px-3 py-1 text-[#666]"
                                onClick={() => handleDecrease(item)}
                              >
                                -
                              </button>
                              <span className="px-4 py-1 border-x border-[#ddd]">
                                {item.quantity}
                              </span>
                              <button
                                className="px-3 py-1 text-[#666]"
                                onClick={() => handleIncrease(item)}
                              >
                                +
                              </button>
                            </div>

                            <button className="text-[#999] hover:text-[#f6531f]">
                              <HeartIcon className="w-5 h-5" />
                            </button>

                            {/* REMOVER ITEM */}
                            <button
                              className="text-[#999] hover:text-[#f6531f]"
                              onClick={() => handleRemove(item)}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA – RESUMO */}
          <div className="w-full lg:w-[340px] space-y-5">
            <div className="bg-white border border-[#ebebeb] p-5 text-[14px] text-[#333] rounded">
              <h2 className="text-[16px] font-semibold mb-2">
                Resumo Do Pedido
              </h2>
              <p className="text-[13px] text-[#777] mb-4">
                Prossiga com descontos e confirme o preço final.
              </p>

              {/* Mini produto (primeiro do carrinho) */}
              {firstItem && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-[45px] h-[58px] bg-[#f2f2f2] border border-[#e0e0e0]">
                    <Image
                      src={firstItem.imagem}
                      alt={firstItem.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[13px] line-clamp-2">{firstItem.nome}</p>
                </div>
              )}

              <div className="space-y-2 border-t border-[#f0f0f0] pt-4 text-[14px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotalBRL}</span>
                </div>
                <div className="flex justify-between">
                  <span>Promoções:</span>
                  <span className="text-[#f6531f]">R$ 0,00</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline border-t border-[#f0f0f0] mt-4 pt-4">
                <div>
                  <span className="text-[15px] font-semibold">
                    Preço estimado:
                  </span>
                  <p className="text-[13px] text-[#f6531f]">
                    Salvo R$ 0,00
                  </p>
                </div>
                <span className="text-[24px] text-[#f6531f] font-bold">
                  {subtotalBRL}
                </span>
              </div>

              <button
                className="w-full mt-5 bg-black text-white text-[15px] font-semibold py-3 hover:bg-[#111] transition flex items-center justify-center gap-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={totalItems === 0}
                onClick={handleCheckout}
              >
                Compre agora ({totalItems})
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </button>

              <p className="mt-3 text-[13px] text-[#777]">
                Você poderá aplicar cupons e pontos na próxima etapa.
              </p>
            </div>

            {/* Formas de pagamento */}
            <div className="bg-white border border-[#ebebeb] p-5 rounded">
              <h3 className="text-[15px] font-semibold mb-4">Pagamento</h3>

              <div className="grid grid-cols-4 gap-3">
                {[
                  "Mastercard",
                  "VISA",
                  "Maestro",
                  "Diners",
                  "Amex",
                  "Elo",
                  "Hipercard",
                  "Boleto",
                  "PayPal",
                  "Parcelado",
                  "Caixa",
                  "Apple Pay",
                ].map((nome) => (
                  <div
                    key={nome}
                    className="border border-[#ddd] rounded py-3 px-1 flex items-center justify-center bg-[#fafafa]"
                  >
                    <span className="text-[11px] text-[#333] text-center">
                      {nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
