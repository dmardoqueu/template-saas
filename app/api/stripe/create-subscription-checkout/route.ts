import { auth } from "@/app/lib/auth";
import stripe from "@/app/lib/stripe";
import { getOrCreateCustomer } from "@/app/server/stripe/get-customer-id";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Valida o corpo da requisição
        const { testeId } = await req.json();
        if (!testeId) {
            return NextResponse.json(
                { error: "testeId is required" },
                { status: 400 }
            );
        }

        // Valida a variável de ambiente
        const price = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
        if (!price) {
            return NextResponse.json(
                { error: "Price not found: STRIPE_SUBSCRIPTION_PRICE_ID is missing" },
                { status: 500 }
            );
        }

        // Verifica autenticação
        const authSession = await auth();
        const userId = authSession?.user?.id;
        const userEmail = authSession?.user?.email;

        if (!userId || !userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Obtém ou cria o customerId
        const customerId = await getOrCreateCustomer(userId, userEmail);
        if (!customerId) {
            return NextResponse.json(
                { error: "Failed to retrieve or create customer" },
                { status: 500 }
            );
        }

        // Cria os metadados
        const metadata = {
            testeId,
            price
        };

        // Define URLs de sucesso e cancelamento
        const origin = req.headers.get("origin") || "http://localhost:3000";
        const success_url = `${origin}/success`;
        const cancel_url = `${origin}/`;

        // Cria a sessão de checkout
        const checkoutSession = await stripe.checkout.sessions.create({
            line_items: [{ price, quantity: 1 }],
            mode: "subscription",
            payment_method_types: ["card"],
            success_url,
            cancel_url,
            metadata,
            customer: customerId,
        });

        if (!checkoutSession.url) {
            return NextResponse.json(
                { error: "Session URL not found" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { sessionId: checkoutSession.id },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao criar sessão de checkout:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}