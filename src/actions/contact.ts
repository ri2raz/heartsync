"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { sendAdminEmail } from "@/lib/email";
import { str, type FormState } from "@/lib/form";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Please provide a valid email address"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export async function submitContactMessage(_prev: FormState, form: FormData): Promise<FormState> {
  const raw = {
    name: str(form, "name"),
    email: str(form, "email"),
    subject: str(form, "subject"),
    message: str(form, "message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form input." };
  }

  const { name, email, subject, message } = parsed.data;

  try {
    const contactRecord = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "UNREAD",
      },
    });

    // Notify admin at riturajverma2009@gmail.com
    await sendAdminEmail({
      type: "contact",
      title: `New Contact Inquiry: ${subject}`,
      senderName: name,
      senderEmail: email,
      subject,
      details: message,
      metadata: {
        "Inquiry ID": contactRecord.id,
        "Received At": contactRecord.createdAt.toISOString(),
      },
    });

    revalidatePath("/admin");
    return { success: "Thank you for reaching out! Your message has been sent to the team and we will reply to your email." };
  } catch (error) {
    console.error("[HeartSync] Contact submission error:", error);
    return { error: "Could not send message at this time. Please try again or email us directly." };
  }
}
