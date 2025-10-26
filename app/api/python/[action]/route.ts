// app/api/python/[action]/route.ts
import { NextResponse } from "next/server";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;
console.log(PYTHON_API_BASE);

/**
 * app/api/python/[action]/route.ts : PS: le dossier s'appele litéralement "[action]"
 * Proxy POST vers l'API Python
 * L'URL dynamique permet de gérer plusieurs actions (build_model, fit_model, etc.)
 */
export async function POST(
  req: Request,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = await params;
    const body = await req.json();

    const pythonEndpoint = `${PYTHON_API_BASE}/${action}`;

    // Appel à l'API Python
    const res = await fetch(pythonEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Parse JSON de la réponse
    let data: any;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json(
        { error: "La réponse Python n'est pas un JSON valide" },
        { status: 502 }
      );
    }

    // Gestion des erreurs HTTP
    if (!res.ok) {
      const message = data?.message ?? `Erreur Python API (${res.status})`;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    // Réponse réussie
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erreur lors de l'appel à l'API Python:", err);
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'appel à l'API Python" },
      { status: 500 }
    );
  }
}
