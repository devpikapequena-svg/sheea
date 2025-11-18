"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useRouter } from "next/navigation"; // 👈 IMPORTANTE

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

/* ---------- MÁSCARAS ---------- */
function maskCEP(v: string) {
  return v
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
}

function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

/* ---------- VALIDAÇÃO CPF ---------- */
function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let d1 = 11 - (soma % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let d2 = 11 - (soma % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

export default function CheckoutPage() {
  const { items, totalItems } = useCart();
  const router = useRouter(); // 👈

  const subtotal = items.reduce(
    (sum, item) => sum + parseBRL(item.preco) * item.quantity,
    0
  );

  // MÉTODO DE PAGAMENTO
  const [paymentMethod, setPaymentMethod] = useState<
    "pix" | "credit" | "debit"
  >("pix");

  const shipping = 0; // frete grátis
  const total = subtotal + shipping;

  const subtotalBRL = subtotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

  const shippingBRL = shipping.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

  const totalBRL = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

  /* ---------- ESTADO DO FORM ---------- */
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");        // 👈 novo
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [cpf, setCpf] = useState("");

  const [erroCPF, setErroCPF] = useState("");
  const [erroCEP, setErroCEP] = useState("");
  const [erroGeral, setErroGeral] = useState("");
  const [salvo, setSalvo] = useState(false);

  const [erroPagamento, setErroPagamento] = useState(""); // 👈
  const [loadingPagamento, setLoadingPagamento] = useState(false); // 👈

  async function buscarCEPAuto(valor: string) {
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErroCEP("CEP inválido ou não encontrado.");
        return;
      }
      setErroCEP("");
      setRua(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setEstado(data.uf || "");
    } catch {
      setErroCEP("Erro ao buscar CEP.");
    }
  }

  function salvarEndereco() {
    setErroGeral("");

    const camposObrigatoriosPreenchidos =
      nome &&
      telefone &&
      cep &&
      rua &&
      numero &&
      estado &&
      cidade &&
      bairro &&
      cpf;

    if (!camposObrigatoriosPreenchidos) {
      setErroGeral("Preencha todos os campos obrigatórios (*) antes de salvar.");
      return;
    }

    if (!validarCPF(cpf)) {
      setErroCPF("CPF inválido");
      return;
    }

    setErroCPF("");
    setErroGeral("");
    setSalvo(true);
  }

  function editarEndereco() {
    setSalvo(false);
  }

  
   async function handleContinue() {
    setErroPagamento("");

    if (!salvo) {
      setErroGeral("Salve o endereço antes de continuar.");
      return;
    }

    if (!email) {
      setErroPagamento("Informe um e-mail válido para continuar.");
      return;
    }

    if (paymentMethod !== "pix") {
      setErroPagamento("No momento apenas Pix está disponível.");
      return;
    }

    try {
      setLoadingPagamento(true);

      const externalId = `order_${Date.now()}`;

      const itemsPayload = items.map((item) => ({
        id: String(item.id),
        title: item.nome,
        unitPrice: parseBRL(item.preco),
        quantity: item.quantity,
      }));

      let utmQuery: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => {
          utmQuery[key] = value;
        });
      }

      const payload = {
        name: nome,
        email,
        phone: telefone,
        cpf,
        amount: total, // em reais, backend converte pra centavos
        items: itemsPayload,
        externalId,
        utmQuery,
      };

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      console.log("Resposta BuckPay (json bruto da API interna):", json);

      if (!res.ok) {
        console.error("Erro HTTP da /api/create-payment:", json);
        setErroPagamento(json.error || "Erro ao gerar pagamento Pix.");
        return;
      }

      // 👉 Pega o objeto de Pix da forma mais simples possível
      const data: any = json || {};
      const pix = data.pix || data.data?.pix;

      console.log("pix extraído:", pix);

      if (!pix) {
        setErroPagamento(
          "Pix gerado, mas resposta veio sem objeto 'pix'. Veja o console."
        );
        return;
      }

      const copyPaste = String(pix.code || "");
      const qrRaw = String(pix.qrcode_base64 || pix.qrCode_base64 || "");

      if (!copyPaste || !qrRaw) {
        console.log("pix que chegou sem code/base64:", pix);
        setErroPagamento(
          "Pix gerado, mas não foi possível montar o QR Code no front. Veja o console."
        );
        return;
      }

    // mantém o externalId como identificador principal
const orderId = externalId;

router.push(
  `/checkout/pix?amount=${encodeURIComponent(
    totalBRL
  )}&code=${encodeURIComponent(copyPaste)}&qr=${encodeURIComponent(
    qrRaw
  )}&id=${encodeURIComponent(orderId)}`
);

    } catch (err: any) {
      console.error("Erro em handleContinue:", err);
      setErroPagamento(err.message || "Erro inesperado ao criar pagamento.");
    } finally {
      setLoadingPagamento(false);
    }
  }


  if (totalItems === 0) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center px-4">
        <div className="bg-white border border-[#ebebeb] rounded px-8 py-10 text-center max-w-md w-full">
          <h1 className="text-lg font-semibold mb-2">Seu carrinho está vazio</h1>
          <p className="text-sm text-[#666] mb-6">
            Adicione produtos ao carrinho para continuar para o checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-black text-white text-sm font-semibold rounded hover:bg-[#111]"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* HEADER TOPO, IGUAL SHEIN */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-[#e5e5e5] z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* LOGO */}
          <div className="flex items-center gap-6">
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
          </div>

          {/* Checkout seguro */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0f8a4b] flex items-center justify-center">
              <LockClosedIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[12px] text-[#0f8a4b]">Checkout Seguro</span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="pt-[76px] bg-[#f5f5f5] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
          {/* ESQUERDA – ENDEREÇO + ITENS + PAGAMENTO */}
          <section className="flex-1 bg-white border border-[#ebebeb] rounded px-6 py-6">
            {/* Título + Mudar */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold">Endereço de Envio</h1>
              {salvo && (
                <button
                  type="button"
                  onClick={editarEndereco}
                  className="text-[13px] text-[#007185] hover:underline"
                >
                  Mudar &gt;
                </button>
              )}
            </div>

            {/* Se NÃO tiver salvo, mostra formulário normal */}
            {!salvo && (
              <>
                {/* Aviso rosa topo */}
                <div className="bg-[#ffe2dc] text-[#8b3a2d] text-[12px] px-4 py-3 mb-6 border border-[#f7b4a7]">
                  Para garantir que seu pedido seja entregue sem problemas,
                  preencha seu nome completo e certifique-se de que o nome do
                  destinatário informado esteja consistente com o CPF.
                </div>

                {erroGeral && (
                  <div className="mb-4 text-[12px] text-red-600">
                    {erroGeral}
                  </div>
                )}

                <form
                  className="space-y-4 text-[13px] text-[#333]"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {/* Localização */}
                  <div>
                    <label className="block mb-1">
                      Localização<span className="text-red-500">*</span>
                    </label>
                    <select className="w-full border border-[#ddd] rounded px-3 py-2 text-[13px]">
                      <option>Brazil</option>
                    </select>
                  </div>
     {/* Nome */}
                  <div>
                    <label className="block mb-1">
                      O nome completo<span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-[#ddd] rounded px-3 py-2"
                      placeholder="Nome e sobrenome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>

                  {/* E-mail 👈 novo campo */}
                  <div>
                    <label className="block mb-1">
                      E-mail<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="w-full border border-[#ddd] rounded px-3 py-2"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {/* Telefone */}
                  <div className="flex gap-3">
                    <div className="w-24">
                      <label className="block mb-1">Código</label>
                      <input
                        className="w-full border border-[#ddd] rounded px-3 py-2"
                        value="BR +55"
                        readOnly
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1">
                        Número de telefone<span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full border border-[#ddd] rounded px-3 py-2"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="block mb-1">
                      CEP/Código Postal<span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-[#ddd] rounded px-3 py-2"
                      placeholder="Ex: 12345-123"
                      value={cep}
                      onChange={(e) => {
                        const masked = maskCEP(e.target.value);
                        setCep(masked);
                      }}
                      onBlur={(e) => buscarCEPAuto(e.target.value)}
                    />
                    {erroCEP && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {erroCEP}
                      </p>
                    )}
                  </div>

                  {/* Rua */}
                  <div>
                    <label className="block mb-1">
                      Rua/Avenida<span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-[#ddd] rounded px-3 py-2"
                      placeholder="Digite o nome da rua ou avenida"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                    />
                  </div>

                  {/* Número + complemento */}
                  <div className="flex gap-3">
                    <div className="w-40">
                      <label className="block mb-1">
                        Número<span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full border border-[#ddd] rounded px-3 py-2"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1">
                        Informações adicionais
                      </label>
                      <input
                        className="w-full border border-[#ddd] rounded px-3 py-2"
                        placeholder="Apartamento / bloco / ponto de referência"
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Estado / Cidade */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block mb-1">
                        Estado/Província<span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full border border-[#ddd] rounded px-3 py-2"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1">
                        Cidade<span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full border border-[#ddd] rounded px-3 py-2"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Bairro */}
                  <div>
                    <label className="block mb-1">
                      Bairro<span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-[#ddd] rounded px-3 py-2"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block mb-1">
                      Número de CPF<span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-[#ddd] rounded px-3 py-2"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(maskCPF(e.target.value))}
                    />
                    {erroCPF && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {erroCPF}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-[12px] text-[#555]">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Torne padrão</span>
                    </div>

                    <button
                      type="button"
                      onClick={salvarEndereco}
                      className="px-8 py-2 bg-black text-white text-[13px] font-semibold rounded hover:bg-[#111]"
                    >
                      SALVAR
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Se JÁ tiver salvo, mostra bloco estilo Shein */}
            {salvo && (
              <div className="border border-[#e5e5e5] rounded-sm px-4 py-3 mt-2 flex items-start justify-between text-[13px]">
                <div className="flex gap-3">
                  {/* barrinha colorida à esquerda */}
                  <div className="w-[3px] rounded bg-gradient-to-b from-[#1f6feb] via-[#e03131] to-[#1f6feb]" />
                  <div>
                    <div className="font-semibold uppercase tracking-[0.03em]">
                      {nome || "NOME COMPLETO"}{" "}
                      <span className="font-normal normal-case">
                        {telefone || ""}
                      </span>
                    </div>
                    <div className="mt-1 text-[#555] leading-snug">
                      {rua} {numero} {complemento && ` ${complemento}`}
                      <br />
                      {bairro} {cidade} {estado} Brazil {cep}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={editarEndereco}
                  className="ml-4 border border-[#ccc] bg-[#f5f5f5] text-[11px] px-3 py-1 hover:bg-white"
                >
                  Editar Endereço
                </button>
              </div>
            )}

            {/* ITENS + MÉTODO DE PAGAMENTO (sempre aparecem) */}
            <div className="mt-8 border-t border-[#eee] pt-6">
              <h2 className="text-[15px] font-semibold mb-3">Envio Nacional</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size ?? "unico"}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-[55px] h-[70px] bg-[#f2f2f2] border border-[#e0e0e0]">
                      <Image
                        src={item.imagem}
                        alt={item.nome}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] line-clamp-2">{item.nome}</p>
                      {item.size && (
                        <p className="text-[12px] text-[#777]">
                          Tamanho: {item.size}
                        </p>
                      )}
                      <p className="text-[12px] text-[#333] mt-1">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold text-[#f6531f]">
                      {item.preco}
                    </span>
                  </div>
                ))}
              </div>

              {/* Método de pagamento – estilo Shein */}
              <div className="mt-8">
                <h3 className="text-[15px] font-semibold mb-3">
                  Método De Pagamento
                </h3>

                <div className="space-y-3 text-[13px]">
                  {/* PIX DESTACADO */}
                  <label
                    className={`flex items-start gap-3 p-3 border rounded cursor-pointer ${
                      paymentMethod === "pix"
                        ? "bg-[#f8fff4] border-[#00875a]"
                        : "bg-white border-[#ddd]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-[4px]"
                      checked={paymentMethod === "pix"}
                      onChange={() => setPaymentMethod("pix")}
                    />

                    <div className="flex-1 flex gap-3">
                      {/* Ícone Pix */}
                      <div className="w-20 h-10 rounded bg-[#00b894] flex items-center justify-center">
                        <img
                          src="//img.ltwebstatic.com/images3_pi/2021/06/21/16242622541cfa944ff8a99be29f8e54978947fa31.png"
                          alt="Pix"
                          className="max-w-[55px] max-h-[50px]"
                        />
                      </div>

                      <div>
                        <div className="font-semibold mb-1">Pix</div>
                        <p className="text-[12px] text-[#555] leading-snug">
                          Pagamento aprovado na hora. Você poderá finalizar o
                          seu Pix por meio do QR Code ou código no banco que
                          preferir. Este código é válido por 24h.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* CARTÃO CRÉDITO */}
                  <label
                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
                      paymentMethod === "credit"
                        ? "border-[#333]"
                        : "border-[#ddd]"
                    } bg-white`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-[2px]"
                      checked={paymentMethod === "credit"}
                      onChange={() => setPaymentMethod("credit")}
                    />

                    <div className="flex items-center gap-3">
                      <img
                        src="//img.ltwebstatic.com/images2_pi/2019/04/30/155662133112928850.png"
                        alt="Cartão de crédito"
                        className="w-[60px] h-auto"
                      />
                      <span className="text-[13px] text-[#333]">
                        Cartão de crédito local com parcelamento
                      </span>
                    </div>
                  </label>

                  {/* CARTÃO DÉBITO */}
                  <label
                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
                      paymentMethod === "debit"
                        ? "border-[#333]"
                        : "border-[#ddd]"
                    } bg-white`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-[2px]"
                      checked={paymentMethod === "debit"}
                      onChange={() => setPaymentMethod("debit")}
                    />

                    <div className="flex items-center gap-3">
                      <img
                        src="//img.ltwebstatic.com/images3_pi/2023/04/03/16805140749a95b28abca896189fd4bd80a0d9c979.png"
                        alt="Cartão de débito"
                        className="w-[60px] h-auto"
                      />
                      <span className="text-[13px] text-[#333]">
                        Cartão de débito local/Internacional
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* DIREITA – RESUMO DO PEDIDO */}
          <aside className="w-full lg:w-[340px] space-y-5">
            <div className="bg-white border border-[#ebebeb] p-5 text-[14px] text-[#333] rounded">
              <h2 className="text-[16px] font-semibold mb-4">
                Resumo Do Pedido
              </h2>

              <div className="space-y-2 text-[13px] mb-4">
                <div className="flex justify-between">
                  <span>Valor total:</span>
                  <span>
                    {(subtotal + shipping).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotalBRL}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de envio:</span>
                  <span>{shippingBRL}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entrega garantida:</span>
                  <span className="text-green-600">GRÁTIS</span>
                </div>
              </div>

              <div className="border-t border-[#eee] pt-4 mb-4 flex justify-between items-center">
                <span className="font-semibold text-[15px]">Total Geral:</span>
                <span className="text-[#f6531f] text-[20px] font-bold">
                  {totalBRL}
                </span>
              </div>

              {/* Cupom */}
              <div className="mb-4">
                <label className="block text-[13px] mb-1">
                  Código de Cupom
                </label>
                <div className="flex">
                  <input
                    className="flex-1 border border-[#ddd] rounded-l px-3 py-2 text-[13px]"
                    placeholder="Digite o código"
                  />
                  <button className="px-4 py-2 bg-[#f5f5f5] border border-l-0 border-[#ddd] text-[12px] font-semibold">
                    APLICAR
                  </button>
                </div>
              </div>

     {erroPagamento && (
                <p className="text-[12px] text-red-600 mb-2">
                  {erroPagamento}
                </p>
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={loadingPagamento}
                className="w-full mt-3 bg-black disabled:bg-[#444] text-white text-[15px] font-semibold py-3 hover:bg-[#111] transition flex items-center justify-center gap-2 rounded"
              >
                {loadingPagamento ? "Gerando Pix..." : "CONTINUAR"}
                {!loadingPagamento && (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                )}
              </button>

              <p className="mt-3 text-[12px] text-[#777] leading-relaxed">
                Ao clicar em <strong>CONTINUAR</strong>, você será redirecionado
                para a etapa de pagamento para concluir seu pedido.
              </p>
            </div>

            {/* Bloco de informações de segurança, estilo Shein */}
            <div className="bg-white border border-[#ebebeb] p-5 rounded space-y-4 text-[12px]">
              {/* Segurança de Pagamento */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0f8a4b] mb-1">
                  Segurança de Pagamento
                </h3>
                <p className="text-[#555] leading-snug">
                  Nossa loja se empenha em proteger suas informações de pagamento
                  e apenas compartilha seus dados de cartão com provedores de
                  serviços que concordam em proteger essas informações.
                </p>
              </div>

              {/* Segurança e Privacidade */}
              <div className="border-t border-[#e5e5e5] pt-3">
                <h3 className="text-[14px] font-semibold text-[#0f8a4b] mb-1">
                  Segurança e Privacidade
                </h3>
                <p className="text-[#555] leading-snug">
                  O processamento de pagamentos utiliza tecnologia de
                  criptografia padrão da indústria. Não armazenamos as
                  informações completas do seu cartão de crédito.
                </p>
              </div>

              {/* Garantia de entrega segura */}
              <div className="border-t border-[#e5e5e5] pt-3">
                <h3 className="text-[14px] font-semibold text-[#0f8a4b] mb-1">
                  Garantia de entrega segura
                </h3>
                <p className="text-[#555] leading-snug">
                  Oferecemos trocas ou reembolsos em casos de pacotes perdidos,
                  devolvidos ou extraviados.
                </p>
              </div>

              {/* Suporte ao cliente */}
              <div className="border-t border-[#e5e5e5] pt-3">
                <h3 className="text-[14px] font-semibold text-[#0f8a4b] mb-1">
                  Suporte ao cliente
                </h3>
                <p className="text-[#555] leading-snug">
                  Se você tiver alguma dúvida sobre seu pedido, entre em contato
                  com nosso time de atendimento pelos canais oficiais da loja.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
