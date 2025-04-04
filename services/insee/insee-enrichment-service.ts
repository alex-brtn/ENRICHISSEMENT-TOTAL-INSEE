import { supabase } from "../../db/db";
import { fetchCompanyBySIRET } from "./insee-api-client";

/**
 * Met à jour les données INSEE pour une entreprise
 * en utilisant l'API INSEE
 */
export async function enrichCompanyWithINSEEData(id: string, siret: string) {
  try {
    console.log(
      `[INSEE-ENRICH] 🔄 Enriching company ${id} with INSEE data for SIRET: ${siret}`
    );

    if (!siret) {
      console.error(
        `[INSEE-ENRICH] ❌ No SIRET provided, skipping INSEE enrichment`
      );
      return null;
    }

    // Récupérer le nombre d'employés pour calculer la tranche d'effectifs
    let employeeCount = null;
    try {
      const { data: companyData, error: fetchError } = await supabase
        .from("companies")
        .select("nombre_employes")
        .eq("id", id)
        .single();

      if (!fetchError && companyData) {
        employeeCount = companyData.nombre_employes;
        console.log(
          `[INSEE-ENRICH] 📊 Retrieved employee count for tranche calculation: ${employeeCount}`
        );
      }
    } catch (countError) {
      console.error(
        `[INSEE-ENRICH] ⚠️ Error retrieving employee count: ${countError}`
      );
      // Continue anyway, we can enrich without employee count
    }

    // Récupérer les données depuis l'API INSEE avec le nombre d'employés
    console.log(`[INSEE-ENRICH] 🔄 Fetching INSEE data...`);
    const inseeData = await fetchCompanyBySIRET(siret, employeeCount);

    if (!inseeData) {
      console.error(
        `[INSEE-ENRICH] ❌ Failed to fetch INSEE data for SIRET: ${siret}`
      );
      return null;
    }

    console.log(
      `[INSEE-ENRICH] ✅ INSEE data fetched successfully for SIRET: ${siret}`
    );
    console.log(`[INSEE-ENRICH] 📊 INSEE data: ${JSON.stringify(inseeData)}`);

    // Mettre à jour l'entreprise dans Supabase
    console.log(`[INSEE-ENRICH] 🔄 Updating company in database...`);
    const { error, data } = await supabase
      .from("companies")
      .update({
        denomination_complete: inseeData.denomination_complete,
        sigle: inseeData.sigle,
        raison_sociale: inseeData.raison_sociale,
        adresse_complete: inseeData.adresse_complete,
        etablissement_siege: inseeData.etablissement_siege,
        etat_administratif: inseeData.etat_administratif,
        forme_juridique: inseeData.forme_juridique,
        code_forme_juridique: inseeData.code_forme_juridique,
        date_creation: inseeData.date_creation,
        tranche_effectif: inseeData.tranche_effectif,
        code_tranche_effectif: inseeData.code_tranche_effectif,
        code_postal: inseeData.code_postal,
        commune: inseeData.commune,
        code_commune: inseeData.code_commune,
        departement: inseeData.departement,
        code_departement: inseeData.code_departement,
        region: inseeData.region,
        code_region: inseeData.code_region,
        code_ape: inseeData.code_ape,
        libelle_ape: inseeData.libelle_ape,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        `[INSEE-ENRICH] ❌ Error updating company with INSEE data: ${error.message}`
      );
      console.error(`[INSEE-ENRICH] Error details: ${JSON.stringify(error)}`);
      return null;
    }

    console.log(
      `[INSEE-ENRICH] ✅ Company ${id} successfully enriched with INSEE data`
    );
    console.log(
      `[INSEE-ENRICH] 📊 Updated company data: ${JSON.stringify(data)}`
    );
    return data;
  } catch (error) {
    console.error(
      `[INSEE-ENRICH] ❌ Error in enrichCompanyWithINSEEData:`,
      error
    );
    return null;
  }
}
