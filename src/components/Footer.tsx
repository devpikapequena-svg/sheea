import { Facebook, Instagram, Youtube, Twitter, Music2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white mt-10 border-t">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-700">
          {/* INFORMAÇÕES DA EMPRESA */}
          <div>
            <h3 className="font-semibold mb-3">INFORMAÇÕES DA EMPRESA</h3>
            <ul className="space-y-2">
              <li className="hover:underline cursor-pointer">Sobre SHEIN</li>
              <li className="hover:underline cursor-pointer">Venda na SHEIN</li>
              <li className="hover:underline cursor-pointer">Blogueiros de moda</li>
              <li className="hover:underline cursor-pointer">Carreiras</li>
            </ul>
          </div>

          {/* AJUDA E SUPORTE */}
          <div>
            <h3 className="font-semibold mb-3">AJUDA E SUPORTE</h3>
            <ul className="space-y-2">
              <li className="hover:underline cursor-pointer">Política de Frete</li>
              <li className="hover:underline cursor-pointer">Devolução</li>
              <li className="hover:underline cursor-pointer">Reembolso</li>
              <li className="hover:underline cursor-pointer">Como Pedir</li>
              <li className="hover:underline cursor-pointer">Como Rastrear</li>
              <li className="hover:underline cursor-pointer">Guia De Tamanhos</li>
              <li className="hover:underline cursor-pointer">SHEIN VIP</li>
              <li className="hover:underline cursor-pointer">SHEIN na Remessa Conforme</li>
            </ul>
          </div>

          {/* ATENDIMENTO AO CLIENTE */}
          <div>
            <h3 className="font-semibold mb-3">ATENDIMENTO AO CLIENTE</h3>
            <ul className="space-y-2">
              <li className="hover:underline cursor-pointer">Contate-Nos</li>
              <li className="hover:underline cursor-pointer">Método De Pagamento</li>
              <li className="hover:underline cursor-pointer">Pontos Bônus</li>
              <li className="hover:underline cursor-pointer">Política de cupons</li>
              <li className="hover:underline cursor-pointer">Perguntas frequentes</li>
            </ul>
          </div>

          {/* REDES SOCIAIS */}
          <div>
            <h3 className="font-semibold mb-3">ENCONTRE-NOS EM</h3>
            <div className="flex space-x-4 text-2xl">
              <Facebook className="w-6 h-6 cursor-pointer" />
              <Instagram className="w-6 h-6 cursor-pointer" />
              <Twitter className="w-6 h-6 cursor-pointer" />
              <Youtube className="w-6 h-6 cursor-pointer" />
              {/* TikTok “fake” usando Music2 só pra ter um ícone */}
              <Music2 className="w-6 h-6 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* PAGAMENTOS */}
        <div className="mt-10">
          {/* título EM CIMA e alinhado à DIREITA */}
          <h3 className="font-semibold mb-3 text-sm text-right">
            PAGAMENTO
          </h3>

          {/* ícones EMBAIXO alinhados à DIREITA */}
          <div className="flex flex-wrap gap-3 justify-end">
            <a href="#">
              <img
                src="https://img.ltwebstatic.com/images3_pi/2025/02/26/5f/1740552723c023d4dd4f85c2e9eaae9e4b06b64b83.webp"
                alt="Mastercard"
                className="h-6"
              />
            </a>

            <a href="#">
              <img
                src="//img.ltwebstatic.com/images3_pi/2021/03/09/161528368123dd7a35ad8708b0dfc74b3630526891.webp"
                alt="Visa"
                className="h-6"
              />
            </a>

            <a href="#">
              <img
                src="//img.ltwebstatic.com/images2_pi/2018/06/06/1528273036537082707.webp"
                alt="Amex"
                className="h-6"
              />
            </a>

            <a href="#">
              <img
                src="//img.ltwebstatic.com/images2_pi/2018/11/14/1542165929465511500.webp"
                alt="Elo"
                className="h-6"
              />
            </a>

            <a href="#">
              <img
                src="//img.ltwebstatic.com/images3_pi/2021/08/10/16285753252c1e710a326167c3218f7485c76887a8.webp"
                alt="Pix"
                className="h-6"
              />
            </a>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-10 text-xs text-gray-500 border-t pt-5">
          ©2009-2025 Todos os direitos reservados SHEIN
          <br />
          <a className="hover:underline cursor-pointer">Centro de Privacidade</a> |
          <a className="hover:underline cursor-pointer ml-2">
            Política de Privacidade e Cookies
          </a>{" "}
          |
          <a className="hover:underline cursor-pointer ml-2">
            Termos e condições
          </a>
        </div>
      </div>
    </footer>
  );
}
