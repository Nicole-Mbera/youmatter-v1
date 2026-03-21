
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";
import client from "@/lib/db";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'therapist') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!stripe) {
            return NextResponse.json({ error: "Stripe configuration missing" }, { status: 503 });
        }

        // 1. Get Therapist Profile
        const therapistRes = await client.execute({
            sql: "SELECT * FROM therapists WHERE user_id = ?",
            args: [user.userId],
        });
        const therapist = therapistRes.rows[0] as any;

        if (!therapist) {
            return NextResponse.json({ error: "Therapist profile not found" }, { status: 404 });
        }

        let accountId = therapist.stripe_account_id;

        // 2. Create Stripe Account if doesn't exist
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                country: "US", // Defaulting to US for now, could be dynamic
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            // Save to DB
            await client.execute({
                sql: "UPDATE therapists SET stripe_account_id = ? WHERE id = ?",
                args: [accountId, therapist.id],
            });
        }

        // 3. Create Account Link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${request.headers.get("origin")}/therapist`, // Redirect back to dashboard on failure/reauth
            return_url: `${request.headers.get("origin")}/api/stripe/return?account_id=${accountId}`, // Handler for success
            type: "account_onboarding",
        });

        return NextResponse.json({
            url: accountLink.url,
            account_id: accountId
        });

    } catch (error: any) {
        console.error("Stripe Onboarding Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create onboarding link" },
            { status: 500 }
        );
    }
}
