import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_to_prevent_init_crash");

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Server Configuration Error: Resend API Key is missing from .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { client_name, client_email, project_scope, percent, tasks_left, tunnel_url } = body;

    if (!client_email) {
      return NextResponse.json({ error: "Missing client email destination address." }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "ClientSprint <onboarding@resend.dev>",
      to: [client_email],
      subject: `Action Required: Onboarding Portal for ${project_scope}`,
      html: `
        <div style="background-color: #06060f; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1e1e2f; border-radius: 24px;">
          <div style="margin-bottom: 32px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #a855f7; background-color: rgba(168,85,247,0.1); padding: 6px 12px; border-radius: 9999px; border: 1px solid rgba(168,85,247,0.2);">Secure Access Tunnel</span>
          </div>
          <h2 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 8px 0;">Hello ${client_name},</h2>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">This is an onboarding sync reminder regarding your upcoming <strong>${project_scope}</strong> workflow.</p>
          <div style="background-color: #0c0c14; border: 1px solid #27272a; padding: 24px; border-radius: 16px; margin-bottom: 32px;">
            <p style="margin: 0 0 6px 0; font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: 900; letter-spacing: 1.5px;">Current Progress Matrix</p>
            <div style="font-size: 36px; font-weight: 900; color: #a855f7; margin-bottom: 8px;">${percent}% Complete</div>
            <p style="margin: 0; font-size: 13px; color: #e2e8f0;">We require <span style="color: #f59e0b;">${tasks_left} pending item(s)</span> to authorize setup.</p>
          </div>
          <div style="text-align: center;">
            <a href="${tunnel_url}" target="_blank" style="display: inline-block; background: #ffffff; color: #06060f; padding: 14px 28px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">Launch Portal</a>
          </div>
        </div>
      `,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 422 });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}