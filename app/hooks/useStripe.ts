import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

interface CheckoutData {
    testeId: string;
}

export function useStripe() {
    const [stripe, setStripe] = useState<Stripe | null>(null);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_STRIPE_PUB_KEY) {
            console.error("NEXT_PUBLIC_STRIPE_PUB_KEY não está definida");
            return;
        }

        async function loadStripeAsync() {
            try {
                const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!);
                if (!stripeInstance) {
                    console.error("Falha ao carregar Stripe: stripeInstance é null");
                    return;
                }
                setStripe(stripeInstance);
            } catch (error) {
                console.error("Erro ao carregar Stripe:", error);
            }
        }

        loadStripeAsync();
    }, []);

    async function createPaymentStripeCheckout(checkoutData: CheckoutData) {
        if (!stripe) {
            throw new Error("Stripe não está inicializado");
        }

        try {
            const response = await fetch("/api/stripe/create-pay-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao criar sessão de pagamento");
            }

            await stripe.redirectToCheckout({ sessionId: data.sessionId });
        } catch (error) {
            console.error("Erro ao criar pagamento:", error);
            throw error;
        }
    }

    async function createSubscriptionStripeCheckout(checkoutData: CheckoutData) {
        if (!stripe) {
            throw new Error("Stripe não está inicializado");
        }

        try {
            const response = await fetch("/api/stripe/create-subscription-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao criar sessão de assinatura");
            }

            await stripe.redirectToCheckout({ sessionId: data.sessionId });
        } catch (error) {
            console.error("Erro ao criar assinatura:", error);
            throw error;
        }
    }

    async function handleCreateStripePortal() {
        try {
            const response = await fetch("/api/stripe/create-portal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao criar sessão do portal");
            }

            if (!data.url) {
                throw new Error("URL do portal não fornecida");
            }

            window.location.href = data.url;
        } catch (error) {
            console.error("Erro ao criar portal:", error);
            throw error;
        }
    }

    return {
        createPaymentStripeCheckout,
        createSubscriptionStripeCheckout,
        handleCreateStripePortal,
    };
}