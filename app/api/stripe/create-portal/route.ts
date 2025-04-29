import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/firebase";
import stripe from "@/app/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

// Se você estiver usando Firebase v9 (modular SDK), descomente:
// import { collection, doc, getDoc } from "firebase/firestore";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Verifica autenticação
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Consulta o Firestore
        // Para Firebase v8 ou compatibilidade:
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        // Para Firebase v9 (modular SDK), descomente:
        // const userRef = doc(collection(db, "users"), userId);
        // const userDoc = await getDoc(userRef);

        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userData = userDoc.data();
        if (!userData) {
            return NextResponse.json({ error: "User data not found" }, { status: 404 });
        }

        const customerId = userData.stripeCustomerId;
        if (!customerId) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Define o return_url
        const origin = req.headers.get("origin") || "http://localhost:3000";
        const return_url = `${origin}/dashboard`;

        // Cria a sessão do portal
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url,
        });

        if (!portalSession.url) {
            return NextResponse.json(
                { error: "Portal session URL not found" },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: portalSession.url }, { status: 200 });
    } catch (error) {
        console.error("Erro ao criar sessão do portal:", error);
        return NextResponse.json(
            { error: "Failed to create portal session" },
            { status: 500 }
        );
    }
}