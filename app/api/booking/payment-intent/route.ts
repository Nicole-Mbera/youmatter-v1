import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";
import client from "@/lib/db";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const id = body.therapistId || body.therapist_id;

        if (!id) {
            return NextResponse.json({ error: "Therapist ID is required" }, { status: 400 });
        }

        if (!stripe) {
            console.error("Stripe is not initialized");
            return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 });
        }

        // Fetch therapist details
        const therapistResult = await client.execute({
            sql: "SELECT * FROM therapists WHERE id = ?",
            args: [id],
        });

        const therapist = therapistResult.rows[0] as any;

        if (!therapist) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        // Calculate amount and fee (consultation_fee in dollars, convert to cents)
        const feeDollars = therapist.consultation_fee || 80;
        const amount = Math.round(feeDollars * 100); // Convert to cents

        // Platform fee calculation (e.g., 30%)
        const platformFeePercent = 0.3;
        const applicationFeeAmount = Math.round(amount * platformFeePercent);

        const paymentIntentConfig: Stripe.PaymentIntentCreateParams = {
            amount: amount,
            currency: "usd",
            metadata: {
                therapist_id: id.toString(),
                patient_user_id: user.userId.toString(),
                purpose: "session_booking",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        };

        // If therapist has a connected Stripe account, route the funds
        if (therapist.stripe_account_id) {
            paymentIntentConfig.transfer_data = {
                destination: therapist.stripe_account_id,
            };
            paymentIntentConfig.application_fee_amount = applicationFeeAmount;
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
            amount: amount,
        });

    } catch (error: any) {
        console.error("Payment intent creation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create payment intent" },
            { status: 500 }
        );
    }
}
