import mpClient from "@/app/lib/mercado-pago";
import { error } from "console";
import { Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { testeId, userEmail } = await req.json()

    try {
        const preference = new Preference(mpClient)

        const createdPreference = await preference.create({
            body: {
                external_reference: testeId,
                metadata: {
                    testeId,
                    userEmail
                }, ...(userEmail && { payer: { email: userEmail } }),
                items: [
                    {
                        id: "",
                        description: "",
                        title: "",
                        quantity: 1,
                        unit_price: 1,
                        currency_id: "BRL",
                        category_id: "services"
                    }
                ],
                payment_methods: {
                    installments: 12,
                },
                auto_return: "approved",
                back_urls: {
                    failure: `${req.headers.get("origin")}/api/mercado-pago/pending`,
                    pending: `${req.headers.get("origin")}/api/mercado-pago/pending`,
                    success: `${req.headers.get("origin")}/api/mercado-pago/pending`,
                }
            }
        })

        if (!createdPreference.id) {
            return NextResponse.json(
                { error:  "Erro ao criar checkout com Mercado Pago"},
                { status: 500 }
            )
        }

        return NextResponse.json({
            preferenceId: createdPreference.id,
            initPoint: createdPreference.init_point
        })

    } catch(error) {
        console.error(error)
        return NextResponse.json(
            { error: "Erro ao criar checkout com Mercado Pago" },
            { status: 500 }
        )
    }
}