import { NextResponse } from "next/server";
import { enrichCompanyWithINSEEData } from "../../../services/insee/insee-enrichment-service";
import { supabase } from "../../../db/db";

export async function POST(request: Request) {
  try {
    // Récupérer le corps de la requête
    const body = await request.json();
    const { id, siret } = body;

    if (!id && !siret) {
      return NextResponse.json(
        { error: "Missing required parameters: id or siret" },
        { status: 400 }
      );
    }

    // Si l'ID est fourni mais pas le SIRET, récupérer le SIRET depuis la base
    let companyId = id;
    let companySiret = siret;

    if (id && !siret) {
      const { data, error } = await supabase
        .from("companies")
        .select("siret")
        .eq("id", id)
        .single();

      if (error || !data?.siret) {
        return NextResponse.json(
          { error: "Company not found or SIRET not available" },
          { status: 404 }
        );
      }

      companySiret = data.siret;
    }

    // Si le SIRET est fourni mais pas l'ID, récupérer l'ID depuis la base
    if (siret && !id) {
      const { data, error } = await supabase
        .from("companies")
        .select("id")
        .eq("siret", siret)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data?.id) {
        return NextResponse.json(
          { error: "Company not found with this SIRET" },
          { status: 404 }
        );
      }

      companyId = data.id;
    }

    // Déclencher l'enrichissement INSEE
    const enrichedData = await enrichCompanyWithINSEEData(
      companyId,
      companySiret
    );

    if (!enrichedData) {
      return NextResponse.json(
        { error: "Failed to enrich company with INSEE data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Company successfully enriched with INSEE data",
      id: companyId,
    });
  } catch (error) {
    console.error("Error processing enrichment request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
