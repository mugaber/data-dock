import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth`;

export async function sendInvitation(email: string, organizationName: string) {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: process.env.SENDGRID_INVITATION_TEMPLATE_ID!,
      dynamicTemplateData: {
        organizationName,
        signupUrl,
      },
    });
  } catch (error) {
    console.error("SendGrid error:", error);
    throw new Error("Failed to send invitation email");
  }
}
