"use client";

import {
  useEffect,
  useState,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const isNotFoundPage = pathname === "/_not-found";

  useEffect(() => {
    if (isNotFoundPage) return;

    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);

    const handleLoad = () => {
      setIsNavigating(false);
      clearTimeout(timer);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      const observer = new MutationObserver(() => {
        if (document.readyState === "complete") {
          handleLoad();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(timer);
    };
  }, [pathname, searchParams, isNotFoundPage]);

  return (
    <>
      {isNavigating && !isNotFoundPage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
          <div className="loading-spinner" />
        </div>
      )}
      <div
        className={cn(
          "min-h-screen bg-background font-sans antialiased transition-opacity duration-300",
          isNavigating && !isNotFoundPage ? "opacity-0" : "opacity-100"
        )}
      >
        {children}
      </div>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Roupas Femininas, Loja de moda</title>
        <meta
          name="description"
          content="Moda feminina | Roupas, Sapatos e Acessórios | SHEIN Brasil"
        />
        <meta name="robots" content="index, follow" />
      </head>

      <body className={cn("overflow-y-scroll font-sans", inter.variable)}>
        {/* noscript do Meta Pixel */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=828793876672953&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <Suspense fallback={null}>
          <CartProvider>
            <LayoutContent>{children}</LayoutContent>
          </CartProvider>
        </Suspense>

        {/* Meta Pixel Code – pode ficar afterInteractive */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '828793876672953');
              fbq('track', 'PageView');
            `,
          }}
        />

     {/* TikTok Pixel Code */}
<Script
  id="tiktok-pixel"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;
        var ttq=w[t]=w[t]||[];
        ttq.methods=[
          "page","track","identify","instances","debug","on","off","once",
          "ready","alias","group","enableCookie","disableCookie","holdConsent",
          "revokeConsent","grantConsent"
        ];
        ttq.setAndDefer=function(t,e){
          t[e]=function(){
            t.push([e].concat(Array.prototype.slice.call(arguments,0)))
          }
        };
        for(var i=0;i<ttq.methods.length;i++){
          ttq.setAndDefer(ttq,ttq.methods[i]);
        }
        ttq.instance=function(t){
          for(
            var e=ttq._i[t]||[],
            n=0;n<ttq.methods.length;n++
          ){
            ttq.setAndDefer(e,ttq.methods[n]);
          }
          return e;
        };
        ttq.load=function(e,n){
          var r="https://analytics.tiktok.com/i18n/pixel/events.js";
          var o=n&&n.partner;
          ttq._i=ttq._i||{};
          ttq._i[e]=[];
          ttq._i[e]._u=r;
          ttq._t=ttq._t||{};
          ttq._t[e]=+new Date;
          ttq._o=ttq._o||{};
          ttq._o[e]=n||{};
          n=document.createElement("script");
          n.type="text/javascript";
          n.async=!0;
          n.src=r+"?sdkid="+e+"&lib="+t;
          e=document.getElementsByTagName("script")[0];
          e.parentNode.insertBefore(n,e);
        };

        ttq.load('D4EUPJBC77U50IDUD1RG');
        ttq.page();
      }(window, document, 'ttq');
    `,
  }}
/>


        {/* UTMify Pixel – ok afterInteractive */}
        <Script
          id="utmify-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.pixelId = "69074eadb9c9e7d1d740a9fe";
              var a = document.createElement("script");
              a.setAttribute("async", "");
              a.setAttribute("defer", "");
              a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
              document.head.appendChild(a);
            `,
          }}
        />

        {/* UTMify UTMs – joga para depois do load pra não mexer nos links antes da hidratação */}
        <Script
          id="utmify-utms"
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          strategy="lazyOnload"
          data-utmify-prevent-xcod-sck
          data-utmify-prevent-subids
        />
      </body>
    </html>
  );
}
