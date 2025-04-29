import "server-only"

import Stripe from "stripe"

export async function handleStripePayment(
    event: Stripe.CheckoutSessionCompletedEvent
) {
    if (event.data.object.payment_status === "paid") {
        console.log(
            "Pagamento realizado com sucesso. Enviar um email liberar acesso"
        )
    }
}