"use client";

import Image from "next/image";

type Produto = {
  id: number;
  nome: string;
  preco: string;
  label?: string;
  imagem: string;
  tag?: string;
};

const superOfertas: Produto[] = [
  {
    id: 1,
    nome: "Esponja Ruby Rose Stay Fix",
    preco: "R$ 9,00",
    label: "Exclusivo",
    imagem:
      "https://img.ltwebstatic.com/images3_spmp/2024/07/16/d7/1721069429b077173257742573e9744bc5460d22ad_thumbnail_405x552.jpg",
  },
  {
    id: 2,
    nome: "Conjunto Fitness Preto",
    preco: "R$ 34,84",
    label: "83% OFF",
    imagem:
      "https://img.ltwebstatic.com/images3_spmp/2023/12/06/97/1701863048fce2d54954e350b0925cfee62cc97c65_thumbnail_405x552.jpg",
  },
  {
    id: 3,
    nome: "Calça Reta Preta",
    preco: "R$ 37,59",
    label: "62% OFF",
    imagem:
      "https://img.ltwebstatic.com/v4/j/spmp/2025/04/30/85/17460255260aa7de3b21eded2e0e5e4e38a38573bc_thumbnail_405x552.jpg",
  },
];

const topTendencias: Produto[] = [
  {
    id: 1,
    nome: "Conjunto de linho bege",
    preco: "R$ 39,16",
    tag: "#Print Gráfico",
    imagem:
      "https://img.ltwebstatic.com/v4/j/pi/2025/09/04/62/1756949615cfac30641a61e2c69b1976b976a8d451_thumbnail_405x552.jpg",
  },
  {
    id: 2,
    nome: "Vestido floral longo",
    preco: "R$ 34,60",
    tag: "#ElegantEyelet",
    imagem:
      "https://img.ltwebstatic.com/v4/j/pi/2025/05/12/03/17470377042fabd24061e6aadd83f6f21b3531ded3_thumbnail_405x552.jpg",
  },
  {
    id: 3,
    nome: "Conjunto tricô verão",
    preco: "R$ 34,60",
    tag: "#Vibração de férias",
    imagem:
      "https://img.ltwebstatic.com/v4/j/spmp/2025/06/25/d5/17508210960126f3cfe43196514d46c3b6c470980c_thumbnail_405x552.jpg",
  },
];

function CardProdutoBanner({ produto }: { produto: Produto }) {
  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-all rounded-sm overflow-hidden cursor-pointer">
      <div className="relative w-full pb-[150%]">
        <Image
          src={produto.imagem}
          alt={produto.nome}
          fill
          className="object-cover"
        />
      </div>

      <div className="px-3 pb-3 pt-2 text-[18px]">
        <p className="text-[#ff4e4e] font-semibold leading-tight">
          {produto.preco}
        </p>

        {produto.label && (
          <p className="text-[15px] text-[#ff4e4e]">{produto.label}</p>
        )}

        {produto.tag && (
          <p className="text-[15px] text-[#6366f1] mt-1">{produto.tag}</p>
        )}
      </div>
    </div>
  );
}
export default function Banner() {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-[140px] pb-10">

      {/* 🔥 Banner de Natal acima dos produtos */}
      <div className="w-full flex justify-center mb-10">
        <Image
          src="https://img.ltwebstatic.com/v4/g/ccc/2025/11/17/82/1763364359300659bd70b82abbe67efb3e07df24aa.webp"
          alt="Banner de Natal"
          width={1200}
          height={350}
          className="rounded-md w-full max-w-6xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Súper Ofertas */}
        <div>
          <Image
            src="https://img.ltwebstatic.com/v4/p/ccc/2025/07/24/c7/17533579653747aef8fa80779f19404d1cbc4be1f5_thumbnail_288x.webp"
            alt="Súper Ofertas"
            width={200}
            height={200}
            className="mb-4 w-[150px] h-auto"
          />

          <div className="grid grid-cols-3 gap-5">
            {superOfertas.map((p) => (
              <CardProdutoBanner key={p.id} produto={p} />
            ))}
          </div>
        </div>

        {/* Top tendências */}
        <div>
          <Image
            src="https://img.ltwebstatic.com/v4/p/ccc/2025/07/24/e8/17533577213cc2acfa499f15be6e4236a3dc0d280d_thumbnail_288x.webp"
            alt="Top tendências"
            width={200}
            height={200}
            className="mb-4 w-[150px] h-auto"
          />

          <div className="grid grid-cols-3 gap-5">
            {topTendencias.map((p) => (
              <CardProdutoBanner key={p.id} produto={p} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
