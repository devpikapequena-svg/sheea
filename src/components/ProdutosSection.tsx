import Link from "next/link";
import { produtos } from "@/data/produtos";
import Image from "next/image";

export default function ProdutosSection() {
  return (
    <section className="py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-semibold tracking-tight">
            OFERTAS DA BLACK FRIDAY
          </h2>
          <a
            href="#"
            className="text-[#2b69ff] text-[14px] font-medium hover:underline"
          >
            Ver mais
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[10px]">
          {produtos.map((p, i) => (
            <Link key={i} href={p.url} className="hover:no-underline">
              <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[430px] overflow-hidden cursor-pointer">
                {/* Imagem */}
                <div className="w-full flex justify-center bg-[#fafafa]">
                  <Image
                    src={p.imagem}
                    alt={p.nome}
                    width={260}
                    height={260}
                    className="h-[220px] object-contain py-3"
                  />
                </div>

                {/* Conteúdo */}
                <div className="p-4 flex flex-col flex-1">
                  <span
                    className="text-[11px] font-semibold uppercase px-[5px] py-[2px] rounded-[4px] w-fit mb-2 tracking-wide"
                    style={{
                      backgroundColor: p.tagColor,
                      color: p.tagTextColor,
                    }}
                  >
                    {p.tag}
                  </span>

                  <h3 className="text-[13px] text-gray-800 font-medium leading-tight line-clamp-2 mb-2">
                    {p.nome}
                  </h3>

                  <p className="text-[13px] text-gray-500 line-through">{p.precoOriginal}</p>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[22px] text-gray-900">{p.precoPromocional}</span>
                    <span className="text-[13px] font-semibold text-green-600">{p.desconto}</span>
                  </div>

                  <p className="text-[12px] text-gray-600 mt-1">{p.parcelas}</p>

                {/* Tag azul */}
<span
  className="text-[11px] font-semibold uppercase px-[5px] py-[2px] rounded-[4px] w-fit mt-2 tracking-wide"
  style={{
    backgroundColor: "#2b6bff34",
    color: "#2b69ff",
  }}
>
  R$ 20 OFF BB VISA
</span>

                  <div className="poly-component__shipping flex items-center gap-[4px] mt-1 text-[13px] text-green-600 font-medium">
                    <span>Frete grátis</span>
                    <svg
                      aria-label="Enviado pelo FULL"
                      className="poly-shipping__promise-icon--full"
                      width="41"
                      height="13"
                      viewBox="0 0 41 13"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <use href="#poly_full"></use>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
