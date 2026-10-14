import { NextResponse } from "next/server";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/googleSheets";

export interface SaleItemPayload {
  sku: string;
  finalPrice: number;
}

export interface ProcessSalePayload {
  channel: "Instagram" | "Físico / Showroom" | "WhatsApp" | "Bazar / Pop-up";
  paymentMethod: "Efectivo" | "Transferencia SPEI" | "Tarjeta / Terminal" | "Mercado Pago";
  customerNotes?: string;
  items: SaleItemPayload[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";

    const body: ProcessSalePayload = await request.json();
    const { channel, paymentMethod, customerNotes, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se proporcionaron prendas para registrar la venta" },
        { status: 400, headers: corsHeaders }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const skusSold = items.map((i) => i.sku);

    if (spreadsheetId && clientEmail) {
      const sheets = getGoogleSheetsClient();

      let response;
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "'Inventario Central'!A2:A",
        });
      } catch (err) {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "A2:A",
        });
      }

      const rows = response.data.values || [];

      for (const item of items) {
        const rowIndex = rows.findIndex((r: string[]) => r[0] === item.sku);
        if (rowIndex !== -1) {
          const sheetRow = rowIndex + 2;

          // Col I: Estado -> 'Vendido'
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'Inventario Central'!I${sheetRow}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [["Vendido"]] },
          });

          // Read header row to dynamically determine sale and visibility column positions
          const headerRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "'Inventario Central'!A1:Z1",
          });
          const headers = (headerRes.data.values?.[0] || []).map((h: string) => (h || '').toLowerCase().trim());
          const isLegacy = headers.some((h: string) => h.includes('sunday'));

          const saleRange = isLegacy
            ? `'Inventario Central'!Q${sheetRow}:S${sheetRow}`
            : `'Inventario Central'!M${sheetRow}:O${sheetRow}`;
          const visibleRange = isLegacy
            ? `'Inventario Central'!V${sheetRow}`
            : `'Inventario Central'!R${sheetRow}`;

          // Fecha de Venta, Precio Final de Venta (se mantiene al vender), Canal de Venta
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: saleRange,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[today, item.finalPrice, `${channel}${customerNotes ? " (" + customerNotes + ")" : ""}`]],
            },
          });

          // Visible en Web -> 'FALSO'
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: visibleRange,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [["FALSO"]] },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Venta registrada con éxito para ${items.length} prenda(s).`,
      soldSkus: skusSold,
      channel,
      paymentMethod,
      date: today,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("[API Sales POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al procesar la venta" },
      { status: 500, headers: corsHeaders }
    );
  }
}
