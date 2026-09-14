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

export async function POST(request: Request) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";

    const body: ProcessSalePayload = await request.json();
    const { channel, paymentMethod, customerNotes, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se proporcionaron prendas para registrar la venta" },
        { status: 400 }
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

          // Col Q: Fecha de Venta, Col R: Precio Final de Venta, Col S: Canal de Venta
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'Inventario Central'!Q${sheetRow}:S${sheetRow}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[today, item.finalPrice, `${channel}${customerNotes ? " (" + customerNotes + ")" : ""}`]],
            },
          });

          // Col V: Visible en Web -> 'FALSO'
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'Inventario Central'!V${sheetRow}`,
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
    });
  } catch (error: any) {
    console.error("[API Sales POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al procesar la venta" },
      { status: 500 }
    );
  }
}
