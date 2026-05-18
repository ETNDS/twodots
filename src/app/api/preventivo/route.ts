import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { SITE } from "@/config/constants";

export async function POST(req: NextRequest) {
  const { nome, email, telefono, messaggio, pezzi } = await req.json();

  if (!nome || !email || !messaggio) {
    return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASS,
    },
  });

  const pezziHtml = pezzi
    ? `<p><strong>Numero pezzi stimato:</strong> ${pezzi}</p>`
    : "";

  const telefonoHtml = telefono
    ? `<p><strong>Telefono:</strong> ${telefono}</p>`
    : "";

  try {
    // Mail a 2dots
    await transporter.sendMail({
      from: `"Two Dots" <${process.env.EMAIL_HOST_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `[PREVENTIVO] Richiesta da ${nome}`,
      html: `
        <p style="background:#f0eef8;padding:8px 12px;border-radius:6px;display:inline-block;font-weight:600;">
          ⚡ Richiesta preventivo
        </p>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${telefonoHtml}
        ${pezziHtml}
        <p><strong>Messaggio:</strong></p>
        <p>${messaggio}</p>
      `,
    });

    // Conferma a chi ha scritto
    await transporter.sendMail({
      from: `"Two Dots" <${process.env.EMAIL_HOST_USER}>`,
      to: email,
      subject: `Abbiamo ricevuto la tua richiesta di preventivo`,
      html: `
        <p>Ciao ${nome},</p>
        <p>abbiamo ricevuto la tua richiesta di preventivo. Ti risponderemo il prima possibile.</p>
        <br/>
        <p>Ecco un riepilogo di quello che ci hai scritto:</p>
        <p><em>${messaggio}</em></p>
        <br/>
        <p>— Two Dots</p>
        <p><a href="${SITE.url}">${SITE.url}</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore invio email" }, { status: 500 });
  }
}
