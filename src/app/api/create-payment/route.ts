'use server';

import { NextRequest, NextResponse } from 'next/server';
import getConfig from 'next/config';
import { gerarCPFValido } from '@/lib/utils';
import { sendOrderToUtmify, formatToUtmifyDate } from '@/lib/utmifyService';
import { UtmifyOrderPayload } from '@/interfaces/utmify';
import { PaymentPayload } from '@/interfaces/types';

const { serverRuntimeConfig } = getConfig();

/**
 * Webhook clean com embed no Discord
 */
async function notifyDiscordPaymentCreated(data: {
  id: string;
  name: string;
  email: string;
  amount: number; // centavos
}) {
  const discordWebhookUrl = serverRuntimeConfig.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) return;

  const valorReais = (data.amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const embed = {
    embeds: [
      {
        title: 'Novo pedido gerado',
        color: 0xcc712e,
        fields: [
          { name: 'Pedido', value: data.id, inline: false },
          { name: 'Cliente', value: data.name, inline: true },
          { name: 'Email', value: data.email, inline: true },
          { name: 'Valor', value: valorReais, inline: true },
          {
            name: 'Data',
            value: new Date().toLocaleString('pt-BR'),
            inline: true,
          },
        ],
        footer: { text: 'Oferta J • BuckPay' },
      },
    ],
  };

  try {
    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed),
    });
  } catch (err) {
    console.error('Erro ao enviar webhook do pagamento:', err);
  }
}

export async function POST(request: NextRequest) {
  let requestBody: PaymentPayload;
  try {
    requestBody = await request.json();

    const { name, email, phone, amount, items, externalId, utmQuery } =
      requestBody;

    console.log('[create-payment] requestBody recebido:', JSON.stringify(requestBody, null, 2));

    const apiToken = serverRuntimeConfig.BUCKPAY_API_TOKEN;
    if (!apiToken) {
      console.error('[create-payment] BUCKPAY_API_TOKEN não configurado');
      return new NextResponse(
        JSON.stringify({ error: 'Configuração do servidor incompleta.' }),
        { status: 500 }
      );
    }

    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.warn('[create-payment] Valor inválido:', amount);
      return new NextResponse(
        JSON.stringify({ error: 'Valor do pagamento inválido.' }),
        { status: 400 }
      );
    }
    const amountInCents = Math.round(parsedAmount * 100);

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[create-payment] Itens inválidos:', items);
      return new NextResponse(
        JSON.stringify({ error: 'Itens do pedido inválidos.' }),
        { status: 400 }
      );
    }

    const finalCpf = (requestBody.cpf || gerarCPFValido()).replace(/\D/g, '');
    const utmParams = utmQuery || {};
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

    const payloadForBuckPay = {
      external_id: externalId,
      payment_method: 'pix',
      amount: amountInCents,
      buyer: {
        name,
        email,
        document: finalCpf,
        phone: `55${phone.replace(/\D/g, '')}`,
        ip,
      },
      items: items.map((item: any) => ({
        id: item.id || `prod_${Date.now()}`,
        name: item.title,
        amount: Math.round(item.unitPrice * 100),
        quantity: item.quantity,
      })),
      tracking: {
        ref: utmParams['ref'] || null,
        src: utmParams['src'] || utmParams['utm_source'] || null,
        sck: utmParams['sck'] || null,
        utm_source: utmParams['utm_source'] || null,
        utm_medium: utmParams['utm_medium'] || null,
        utm_campaign: utmParams['utm_campaign'] || null,
        utm_id: utmParams['utm_id'] || null,
        utm_term: utmParams['utm_term'] || null,
        utm_content: utmParams['utm_content'] || null,
      },
    };

    console.log(
      '[create-payment] Payload enviado para BuckPay:',
      JSON.stringify(payloadForBuckPay, null, 2)
    );

    const buckpayResponse = await fetch(
      'https://api.realtechdev.com.br/v1/transactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
          'User-Agent': 'Buckpay API',
        },
        body: JSON.stringify(payloadForBuckPay),
      }
    );

    console.log(
      '[create-payment] HTTP status BuckPay:',
      buckpayResponse.status
    );

    const responseData = await buckpayResponse.json().catch((err) => {
      console.error(
        '[create-payment] Erro ao fazer parse do JSON da BuckPay:',
        err
      );
      throw err;
    });

    console.log(
      '[create-payment] Resposta bruta da BuckPay:',
      JSON.stringify(responseData, null, 2)
    );

    if (!buckpayResponse.ok) {
      console.error(
        '[create-payment] BuckPay respondeu erro:',
        JSON.stringify(responseData, null, 2)
      );
      return new NextResponse(
        JSON.stringify({
          error: responseData.error?.message || 'Falha na BuckPay.',
          details: responseData.error?.detail,
        }),
        { status: buckpayResponse.status }
      );
    }

    // normalmente é { data: { ... } }
    const buckpayData = responseData.data ?? responseData;

    console.log(
      '[create-payment] buckpayData parseado:',
      JSON.stringify(buckpayData, null, 2)
    );

    const pixData = buckpayData?.pix;

    if (!pixData || !pixData.code || !pixData.qrcode_base64) {
      console.error(
        '[create-payment] Dados de Pix ausentes ou incompletos em buckpayData:',
        JSON.stringify(buckpayData, null, 2)
      );

      return new NextResponse(
        JSON.stringify({
          error: 'BuckPay não retornou dados de Pix válidos.',
          raw: responseData,
        }),
        { status: 500 }
      );
    }

    console.log(
      '[create-payment] pixData encontrado:',
      JSON.stringify(pixData, null, 2)
    );

    if (buckpayData && buckpayData.id) {
      // 🔔 Notifica criação clean
      try {
        await notifyDiscordPaymentCreated({
          id: buckpayData.id,
          name,
          email,
          amount: amountInCents,
        });
      } catch (err) {
        console.error(
          `[create-payment] Erro ao enviar notificação Discord para pedido ${buckpayData.id}:`,
          err
        );
      }

      const utmifyPayload: UtmifyOrderPayload = {
        orderId: buckpayData.id,
        platform: 'RecargaJogo',
        paymentMethod: 'pix',
        status: 'waiting_payment',
        createdAt: formatToUtmifyDate(new Date()),
        approvedDate: null,
        refundedAt: null,
        customer: {
          name,
          email,
          phone: phone.replace(/\D/g, ''),
          document: finalCpf,
          country: 'BR',
          ip,
        },
        products: items.map((item: any) => ({
          id: item.id || `prod_${Date.now()}`,
          name: item.title,
          planId: null,
          planName: null,
          quantity: item.quantity,
          priceInCents: Math.round(item.unitPrice * 100),
        })),
        trackingParameters: {
          src: utmParams['src'] || utmParams['utm_source'] || null,
          sck: utmParams['sck'] || null,
          utm_source: utmParams['utm_source'] || null,
          utm_campaign: utmParams['utm_campaign'] || null,
          utm_medium: utmParams['utm_medium'] || null,
          utm_content: utmParams['utm_content'] || null,
          utm_term: utmParams['utm_term'] || null,
        },
        commission: {
          totalPriceInCents: amountInCents,
          gatewayFeeInCents: 0,
          userCommissionInCents: amountInCents,
          currency: 'BRL',
        },
        isTest: false,
      };

      try {
        await sendOrderToUtmify(utmifyPayload);
      } catch (utmifyError: any) {
        console.error(
          `Erro ao enviar pedido pendente ${buckpayData.id} para Utmify:`,
          utmifyError
        );
      }
    }

    const responseToFront = {
      id: buckpayData.id,
      status: buckpayData.status,
      payment_method: buckpayData.payment_method,
      pix: {
        code: pixData.code,
        qrcode_base64: pixData.qrcode_base64,
      },
      total_amount: buckpayData.total_amount,
      net_amount: buckpayData.net_amount,
      created_at: buckpayData.created_at,
    };

    console.log(
      '[create-payment] Resposta enviada para o front:',
      JSON.stringify(responseToFront, null, 2)
    );

    return new NextResponse(JSON.stringify(responseToFront), { status: 200 });
  } catch (error: any) {
    console.error('[create-payment POST] Erro fatal:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Erro interno do servidor.' }),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const externalId = searchParams.get('externalId');

  if (!externalId) {
    return new NextResponse(
      JSON.stringify({ error: 'externalId é obrigatório.' }),
      { status: 400 }
    );
  }

  try {
    const apiToken = serverRuntimeConfig.BUCKPAY_API_TOKEN;
    if (!apiToken) {
      console.error('[create-payment GET] BUCKPAY_API_TOKEN não configurado');
      return new NextResponse(
        JSON.stringify({ error: 'Configuração do servidor incompleta.' }),
        { status: 500 }
      );
    }

    const buckpayStatusResponse = await fetch(
      `https://api.realtechdev.com.br/v1/transactions/external_id/${externalId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Buckpay API',
        },
      }
    );

    console.log(
      '[create-payment GET] HTTP status BuckPay (status):',
      buckpayStatusResponse.status
    );

    if (buckpayStatusResponse.status === 404) {
      console.warn(
        '[create-payment GET] Transação não encontrada para externalId:',
        externalId
      );
      return new NextResponse(JSON.stringify({ status: 'PENDING' }), {
        status: 200,
      });
    }

    const statusData = await buckpayStatusResponse.json();

    console.log(
      '[create-payment GET] Resposta BuckPay (status):',
      JSON.stringify(statusData, null, 2)
    );

    if (!buckpayStatusResponse.ok) {
      return new NextResponse(
        JSON.stringify({
          error: statusData.error?.message || 'Falha ao consultar status.',
          details: statusData.error?.detail,
        }),
        { status: buckpayStatusResponse.status }
      );
    }

    const paymentStatus =
      statusData.data?.status?.toUpperCase() || 'UNKNOWN';

    return new NextResponse(JSON.stringify({ status: paymentStatus }), {
      status: 200,
    });
  } catch (error: any) {
    console.error('[create-payment GET] Erro interno:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Erro interno do servidor.' }),
      { status: 500 }
    );
  }
}
