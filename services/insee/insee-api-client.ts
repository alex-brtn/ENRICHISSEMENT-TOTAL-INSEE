import { INSEEData } from "../../types/company-types";
import {
  DEPARTMENT_NAMES,
  DEPARTMENT_TO_REGION,
  APE_CODES,
  EMPLOYEE_COUNT_TO_TRANCHE,
  LEGAL_FORMS,
} from "./insee-constants";

// Clé API INSEE
const INSEE_API_KEY = "0d471f12-6b07-45e9-871f-126b07d5e95b";
const INSEE_API_BASE_URL = "https://api.insee.fr/api-sirene/3.11";

/**
 * Suggère une forme juridique en se basant sur le nom/dénomination de l'entreprise
 */
function suggestLegalForm(
  denomination: string | null
): { code: string; name: string } | null {
  if (!denomination) return null;

  denomination = denomination.toUpperCase();

  // Reconnaissance des formes juridiques courantes à partir du nom
  if (
    denomination.includes("SARL") ||
    denomination.includes("SOCIETE A RESPONSABILITE LIMITEE")
  ) {
    return {
      code: "5499",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5499"
      ].name,
    };
  }

  if (denomination.includes("EURL")) {
    return {
      code: "5498",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5498"
      ].name,
    };
  }

  if (denomination.includes("SAS")) {
    return {
      code: "5710",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5710"
      ].name,
    };
  }

  if (denomination.includes("SASU")) {
    return {
      code: "5720",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5720"
      ].name,
    };
  }

  if (
    denomination.includes("SA ") ||
    denomination.includes("SOCIETE ANONYME")
  ) {
    return {
      code: "5370",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5370"
      ].name,
    };
  }

  if (
    denomination.includes("SCI") ||
    denomination.includes("SOCIETE CIVILE IMMOBILIERE")
  ) {
    return {
      code: "5532",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5532"
      ].name,
    };
  }

  if (denomination.includes("SNC")) {
    return {
      code: "5410",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5410"
      ].name,
    };
  }

  if (denomination.includes("SCOP")) {
    return {
      code: "6318",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "6318"
      ].name,
    };
  }

  if (
    denomination.includes("ASSOCIATION") ||
    denomination.includes("ASSOC") ||
    denomination.includes("ASS.")
  ) {
    return {
      code: "9210",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "9210"
      ].name,
    };
  }

  if (denomination.includes("FONDATION")) {
    return {
      code: "9103",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "9103"
      ].name,
    };
  }

  // Par défaut pour les sociétés sans indication claire, on suggère SAS qui est la forme la plus courante
  if (denomination.includes("SOCIETE") || denomination.includes("COMPANY")) {
    return {
      code: "5710",
      name: (LEGAL_FORMS as Record<string, { name: string; group: string }>)[
        "5710"
      ].name,
    };
  }

  return null;
}

/**
 * Récupère les informations d'une entreprise à partir de son SIRET
 * via l'API INSEE
 */
export async function fetchCompanyBySIRET(
  siret: string,
  employeeCount?: number | null
): Promise<INSEEData | null> {
  try {
    console.log(`[INSEE] Fetching INSEE data for SIRET: ${siret}`);

    // Vérifier que le SIRET est au bon format
    if (!siret || siret.length !== 14) {
      console.error(`[INSEE] Invalid SIRET format: "${siret}"`);
      return null;
    }

    // Formater la requête pour l'API INSEE
    const url = `${INSEE_API_BASE_URL}/siret/${siret}`;
    console.log(`[INSEE] API URL: ${url}`);
    console.log(`[INSEE] Using API Key: ${INSEE_API_KEY.substring(0, 8)}...`);

    // Faire la requête à l'API INSEE
    console.log(`[INSEE] Sending request to INSEE API...`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-INSEE-Api-Key-Integration": INSEE_API_KEY,
      },
    });

    console.log(
      `[INSEE] Response status: ${response.status} ${response.statusText}`
    );

    // Si la réponse n'est pas un succès, afficher plus d'informations
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[INSEE] API error: ${response.status} ${response.statusText}`
      );
      console.error(`[INSEE] Response body: ${errorText}`);
      return null;
    }

    // Convertir la réponse en JSON
    const data = await response.json();
    console.log("[INSEE] Response received successfully");
    console.log(
      `[INSEE] Raw response data keys: ${Object.keys(data).join(", ")}`
    );

    // Vérifier si on a bien un établissement
    if (!data.etablissement) {
      console.error("[INSEE] Missing 'etablissement' in response data");
      console.error(`[INSEE] Response data: ${JSON.stringify(data)}`);
      return null;
    }

    // Extraire les informations pertinentes de la réponse
    const etablissement = data.etablissement || {};
    const uniteLegale = etablissement.uniteLegale || {};
    const adresseEtablissement = etablissement.adresseEtablissement || {};

    console.log(
      `[INSEE] Extracted data: uniteLegale keys: ${Object.keys(
        uniteLegale
      ).join(", ")}`
    );
    console.log(
      `[INSEE] Extracted data: adresseEtablissement keys: ${Object.keys(
        adresseEtablissement
      ).join(", ")}`
    );

    // Formatter l'adresse complète
    const adresse = [
      adresseEtablissement.numeroVoieEtablissement,
      adresseEtablissement.typeVoieEtablissement,
      adresseEtablissement.libelleVoieEtablissement,
      adresseEtablissement.complementAdresseEtablissement,
    ]
      .filter(Boolean)
      .join(" ");

    const codePostalCommune = [
      adresseEtablissement.codePostalEtablissement,
      adresseEtablissement.libelleCommuneEtablissement,
    ]
      .filter(Boolean)
      .join(" ");

    const adresse_complete = [adresse, codePostalCommune]
      .filter(Boolean)
      .join(", ");

    console.log(`[INSEE] Formatted address: ${adresse_complete}`);

    // Récupérer le code département à partir du code commune
    const codeDepartement =
      adresseEtablissement.codeCommuneEtablissement?.substring(0, 2) || null;

    // Récupérer les informations du département
    const departementName = codeDepartement
      ? (DEPARTMENT_NAMES as Record<string, string>)[codeDepartement] || null
      : null;

    // Récupérer les informations de la région
    const regionInfo = codeDepartement
      ? (
          DEPARTMENT_TO_REGION as Record<string, { name: string; code: string }>
        )[codeDepartement] || null
      : null;

    // Récupérer le libellé APE
    const codeAPE = uniteLegale.activitePrincipaleUniteLegale || null;
    const libelleAPE = codeAPE
      ? (APE_CODES as Record<string, string>)[codeAPE] || null
      : null;

    // Déterminer la tranche d'effectifs à partir du nombre d'employés si fourni
    let trancheEffectif = null;
    let codeTrancheEffectif = null;

    // D'abord tenter d'utiliser la réponse INSEE
    if (uniteLegale.trancheEffectifsUniteLegale) {
      trancheEffectif = uniteLegale.trancheEffectifsUniteLegale.libelle || null;
      codeTrancheEffectif =
        uniteLegale.trancheEffectifsUniteLegale.code || null;
    }
    // Si non disponible et que le nombre d'employés est fourni, calculer la tranche
    else if (employeeCount !== undefined && employeeCount !== null) {
      const tranche = EMPLOYEE_COUNT_TO_TRANCHE.find(
        (t) => employeeCount >= t.min && employeeCount <= t.max
      );

      if (tranche) {
        trancheEffectif = tranche.label;
        codeTrancheEffectif = tranche.code;
        console.log(
          `[INSEE] Calculated employee tranche from count ${employeeCount}: ${trancheEffectif} (${codeTrancheEffectif})`
        );
      }
    }

    // Déterminer la forme juridique (depuis INSEE ou suggestion)
    let formeJuridique =
      uniteLegale.categorieJuridiqueUniteLegale?.libelle || null;
    let codeFormeJuridique =
      uniteLegale.categorieJuridiqueUniteLegale?.code || null;

    // Si la forme juridique n'est pas disponible depuis l'API INSEE, essayer de la déduire
    if (!formeJuridique || !codeFormeJuridique) {
      console.log(
        "[INSEE] Legal form not available from INSEE API, trying to suggest one"
      );

      const denomination = uniteLegale.denominationUniteLegale || null;
      const suggestedForm = suggestLegalForm(denomination);

      if (suggestedForm) {
        formeJuridique = suggestedForm.name;
        codeFormeJuridique = suggestedForm.code;
        console.log(
          `[INSEE] Suggested legal form: ${formeJuridique} (${codeFormeJuridique})`
        );
      } else {
        // Si pas de suggestion possible, utiliser SAS comme valeur par défaut pour les entreprises
        formeJuridique = (
          LEGAL_FORMS as Record<string, { name: string; group: string }>
        )["5710"].name;
        codeFormeJuridique = "5710";
        console.log(
          `[INSEE] Using default legal form: ${formeJuridique} (${codeFormeJuridique})`
        );
      }
    }

    // Création de l'objet de retour avec tous les champs renseignés
    const inseeData = {
      denomination_complete: uniteLegale.denominationUniteLegale || null,
      sigle: uniteLegale.sigleUniteLegale || null,
      raison_sociale:
        uniteLegale.denominationUsuelle1UniteLegale ||
        uniteLegale.denominationUniteLegale ||
        null,
      adresse_complete: adresse_complete || null,
      etablissement_siege: etablissement.etablissementSiege || null,
      etat_administratif: uniteLegale.etatAdministratifUniteLegale || null,
      forme_juridique: formeJuridique,
      code_forme_juridique: codeFormeJuridique,
      date_creation: uniteLegale.dateCreationUniteLegale || null,
      tranche_effectif: trancheEffectif,
      code_tranche_effectif: codeTrancheEffectif,
      code_postal: adresseEtablissement.codePostalEtablissement || null,
      commune: adresseEtablissement.libelleCommuneEtablissement || null,
      code_commune: adresseEtablissement.codeCommuneEtablissement || null,
      departement: departementName,
      code_departement: codeDepartement,
      region: regionInfo?.name || null,
      code_region: regionInfo?.code || null,
      code_ape: codeAPE,
      libelle_ape: libelleAPE,
    };

    console.log(`[INSEE] Returning data: ${JSON.stringify(inseeData)}`);
    return inseeData;
  } catch (error) {
    console.error(`[INSEE] Error fetching INSEE data:`, error);
    return null;
  }
}
