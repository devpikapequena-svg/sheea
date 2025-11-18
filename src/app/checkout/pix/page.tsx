"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PixPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams.get("amount") || "R$ 0,00";
  const code = searchParams.get("code") || "";
  const qr = searchParams.get("qr") || "";
  const id = searchParams.get("id") || ""; // <- externalId

  const [copied, setCopied] = useState(false);

  // ====== LÓGICA DO CONTADOR (30 MINUTOS) ======
  const [expiresAt] = useState(() => Date.now() + 30 * 60 * 1000); // agora + 30min
  const [remaining, setRemaining] = useState(30 * 60); // em segundos

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // formata em HH:MM:SS
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const timeParts = [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ];

  // data de expiração (igual Shein mostra a data)
  const expiryDate = new Date(expiresAt);
  const datePart = expiryDate.toLocaleDateString("pt-BR");

  async function handleCopy() {
    try {
      if (!code) return;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  }

  // trata qr: se já vier "data:image/png..." usa direto, se for só base64, prefixa
  const qrSrc = qr
    ? qr.startsWith("data:")
      ? qr
      : `data:image/png;base64,${qr}`
    : "";

  // ====== STATUS DO PAGAMENTO (API /api/create-payment GET) ======
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [statusError, setStatusError] = useState<string>("");
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return; // sem externalId, não tem o que checar

    let interval: NodeJS.Timeout;

    const checkPayment = async () => {
      try {
        setCheckingStatus(true);
        setStatusError("");

        const res = await fetch(
          `/api/create-payment?externalId=${encodeURIComponent(id)}`
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Erro ao consultar status do pagamento:", data);
          setStatusError(data.error || "Erro ao consultar status do pagamento.");
          return;
        }

        const status = String(data.status || "").toUpperCase();
        setPaymentStatus(status);

        // quando a API da BuckPay te devolver PAID / APPROVED / algo do tipo
        if (status === "PAID" || status === "APPROVED") {
          // para de checar
          clearInterval(interval);

          // redireciona para página de sucesso (ajusta a rota se quiser outra)
          router.push(
            `/checkout/sucesso?amount=${encodeURIComponent(
              amount
            )}&id=${encodeURIComponent(id)}`
          );
        }
      } catch (err: any) {
        console.error("Erro ao consultar status do pagamento:", err);
        setStatusError(err.message || "Erro ao consultar status do pagamento.");
      } finally {
        setCheckingStatus(false);
      }
    };

    // checa uma vez logo que abrir
    checkPayment();
    // e depois a cada 7 segundos
    interval = setInterval(checkPayment, 7000);

    return () => clearInterval(interval);
  }, [id, router, amount]);

  // texto bonitinho pro status
  function getStatusLabel() {
    if (paymentStatus === "PAID" || paymentStatus === "APPROVED")
      return "Pagamento aprovado";
    if (paymentStatus === "PENDING" || paymentStatus === "WAITING_PAYMENT")
      return "Aguardando pagamento";
    if (paymentStatus === "EXPIRED") return "Pagamento expirado";
    if (paymentStatus === "CANCELLED") return "Pagamento cancelado";
    return "Status desconhecido";
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* TOPO */}
      <header className="w-full border-b border-[#e5e5e5] bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10 flex items-center justify-between">
          {/* Voltar */}
          <button
            onClick={() => router.push("/")}
            className="text-[12px] text-[#007185] hover:underline"
          >
            &lt; Voltar para a página de pedidos
          </button>

          {/* Logos SHEIN + Pix */}
          <div className="flex items-center gap-4">
            <img
              src="https://img.ltwebstatic.com/images3_acp/2023/08/01/1690874913955590ec50698555d2943fd015d1934a.png"
              alt="SHEIN"
              className="h-3 object-contain"
            />
            <img
              src="https://img.ltwebstatic.com/images3_acp/2023/08/01/1690874889e16e8fc159e440182d2abb3a938ea6ea.png"
              alt="Pix"
              className="h-4 object-contain"
            />
          </div>
        </div>
      </header>

      {/* CONTEÚDO CENTRAL IGUAL AO LAYOUT */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-[#e5e5e5] rounded-sm grid grid-cols-1 md:grid-cols-[2.1fr,1fr]">
          {/* ESQUERDA (TOTAL + QR + CÓDIGO) */}
          <div className="px-8 py-7 border-r border-[#e5e5e5]">
            {/* Linha Total / Pagar antes */}
            <div className="flex items-start justify-between mb-6 text-[13px]">
              <div>
                <p className="text-[#777]">Total</p>
                <p className="mt-1 text-[22px] font-semibold">{amount}</p>

                {/* Status do pagamento */}
                <p className="mt-3 text-[11px] text-[#555]">
                  Status do pagamento:{" "}
                  <span className="font-semibold">{getStatusLabel()}</span>
                  {checkingStatus && (
                    <span className="ml-1 text-[10px] text-[#999]">
                      (checando...)
                    </span>
                  )}
                </p>
                {statusError && (
                  <p className="mt-1 text-[11px] text-[#b91c1c]">
                    {statusError}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-[#777] mb-1">Pagar antes</p>

                {remaining > 0 ? (
                  <div className="flex items-center justify-end gap-2 text-[11px]">
                    <span className="text-[#555]">{datePart}</span>
                    <div className="flex items-center gap-1">
                      {timeParts.map((part, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="px-1.5 py-[3px] bg-black text-white rounded-[2px] tracking-[0.08em]">
                            {part}
                          </span>
                          {i < timeParts.length - 1 && (
                            <span className="text-black text-[11px]">:</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end text-[11px] text-[#b91c1c]">
                    <span>Expirado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box do QR + Código */}
            <div className="border border-[#e5e5e5] rounded-sm px-10 py-10 flex flex-col items-center">
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt="QR Code Pix"
                  className="w-48 h-48 object-contain mb-6"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center border border-dashed border-[#ccc] mb-6 text-[12px] text-[#777] text-center px-4">
                  QR Code ainda não disponível.
                </div>
              )}

              {/* Linha divisória */}
              <div className="w-full h-px bg-[#e5e5e5] my-4" />

              {/* Copiar código */}
              <div className="w-full mt-2">
                <p className="text-[12px] text-[#777] mb-2">
                  Copie o seguinte código:
                </p>

                <div className="flex text-[11px]">
                  {/* INPUT IGUAL SHEIN */}
                  <input
                    type="text"
                    readOnly
                    value={code || "Código Pix não encontrado."}
                    className="flex-1 border border-[#ddd] rounded-l-sm px-3 py-2 bg-[#fafafa] text-[#333] outline-none"
                  />

                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-black text-white text-[11px] font-semibold rounded-r-sm hover:bg-[#111]"
                  >
                    {copied ? "Copiado!" : "Copiar código"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DIREITA (PASSO A PASSO) */}
          <aside className="px-8 py-7 text-[13px] text-[#333]">
            <h2 className="font-semibold mb-5">
              Com o PIX, o fluxo de pagamento é o seguinte:
            </h2>

            <ol className="space-y-4 list-decimal list-inside">
              <li>Abra o aplicativo de seu banco.</li>
              <li>
                Leia o código QR ou copie o código com o botão{" "}
                <span className="font-semibold">&quot;Copiar código&quot;</span>.
              </li>
              <li>Confirme seu pagamento.</li>
            </ol>

            {id && (
              <p className="mt-8 text-[11px] text-[#777]">
                Número do pedido: <span className="font-mono">{id}</span>
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
