/**
 * Transactional email — the messages the platform sends itself: an application
 * landing, an agency registering, a scout being invited.
 *
 * Authentication email is not sent from here. Verification codes, sign-in codes
 * and password resets come from Neon Auth's own sender, direct from the hosted
 * auth service, which is why the whole auth flow works with no key set.
 *
 * The sender is fixed, and deliberately not derived from SITE_URL: it names the
 * domain verified in Resend, which is the same whether this runs on localhost
 * or in production. Mail from `hello@localhost` would simply be rejected.
 */
export const MAIL_FROM =
    process.env.MAIL_FROM || "scouting <hello@scouting.agency>"

interface Attachment {
    filename: string
    content: Buffer
}

interface Mail {
    to: string
    subject: string
    html: string
    attachments?: Attachment[]
}

/**
 * Sends one message, or logs it when no key is configured — so development and
 * tests never depend on an outbound provider.
 *
 * Returns whether it actually went out. Delivery is never the point of the
 * request that triggered it: callers report their own success or failure, and
 * a bounced notification must not fail an application that was already saved.
 */
export async function sendEmail(mail: Mail): Promise<boolean> {
    const key = process.env.RESEND_API_KEY

    if (!key) {
        console.log(`=== email (not sent, no RESEND_API_KEY) ===`)
        console.log(`to: ${mail.to}\nsubject: ${mail.subject}`)
        return false
    }

    try {
        const { Resend } = await import("resend")
        const resend = new Resend(key)

        const { error } = await resend.emails.send({
            from: MAIL_FROM,
            to: mail.to,
            subject: mail.subject,
            html: mail.html,
            attachments: mail.attachments,
        })

        if (error) {
            console.error("Email send failed:", error)
            return false
        }

        return true
    } catch (error) {
        console.error("Email send threw:", error)
        return false
    }
}
