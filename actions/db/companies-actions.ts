import { supabase } from "../../db/db";
import { CompanyData, TypeFormWebhookPayload } from "../../types/company-types";

/**
 * Processes a TypeForm webhook payload and extracts company data
 */
export const processTypeFormPayload = (
  payload: TypeFormWebhookPayload
): CompanyData => {
  console.log("Processing TypeForm payload");
  const { form_response } = payload;
  const { answers, token, submitted_at } = form_response;

  // Initialize an empty company data object
  const companyData: CompanyData = {
    siret: null,
    nombre_employes: null,
    description_projet: null,
    chiffre_affaires: null,
    tresorerie: null,
    niveau_dette: null,
    nouveau_credit: null,
    montant_credit: null,
    montant_levee_fonds: null,
    types_projet: null,
    nature_innovation: null,
    montant_projet: null,
    subventions_recues: null,
    details_subventions: null,
    dirigeant_femme: null,
    femme_majoritaire: null,
    embauche_handicap: null,
    embauche_jeunes: null,
    embauche_seniors: null,
    delai_projet: null,
    impact_social: null,
    impact_environnemental: null,
    site_web: null,
    prenom: null,
    nom: null,
    telephone: null,
    email: null,
    typeform_response_id: token,
    typeform_submitted_at: submitted_at,
  };

  console.log(`Processing ${answers.length} answers`);
  // Process each answer and map it to the company data structure
  for (const answer of answers) {
    const { field, type } = answer;
    const ref = field.ref;

    // Map each field reference to the corresponding company data field
    switch (ref) {
      case "b685a36a-007f-499f-a41c-52b31fdfad23":
        companyData.siret = answer.text;
        console.log(`Mapped siret: ${answer.text}`);
        break;
      case "322cbef8-70d7-404a-b074-abca79c502df":
        companyData.nombre_employes = answer.text
          ? parseInt(answer.text, 10)
          : null;
        console.log(`Mapped nombre_employes: ${answer.text}`);
        break;
      case "0970c8a7-d73a-4a25-8de3-d9536ec8f8bd":
        companyData.description_projet = answer.text;
        console.log(
          `Mapped description_projet: ${answer.text?.substring(0, 20)}...`
        );
        break;
      case "2110cecf-101a-4e87-914b-d7916ed0c3e7":
        companyData.chiffre_affaires = answer.text
          ? parseFloat(answer.text)
          : null;
        console.log(`Mapped chiffre_affaires: ${answer.text}`);
        break;
      case "e5972a6b-0443-4351-a0c1-31f045395ee7":
        companyData.tresorerie = answer.text ? parseFloat(answer.text) : null;
        console.log(`Mapped tresorerie: ${answer.text}`);
        break;
      case "60fc2c79-df98-4a2c-a2d8-bbf58f4e3233":
        companyData.niveau_dette = answer.text ? parseFloat(answer.text) : null;
        console.log(`Mapped niveau_dette: ${answer.text}`);
        break;
      case "7e93a6d5-d5a9-4534-805f-c2fcd69e0b35":
        companyData.nouveau_credit = answer.boolean;
        console.log(`Mapped nouveau_credit: ${answer.boolean}`);
        break;
      case "9d720fc0-fe21-4a22-8858-ae7cd8f82064":
        companyData.montant_credit = answer.text
          ? parseFloat(answer.text)
          : null;
        console.log(`Mapped montant_credit: ${answer.text}`);
        break;
      case "16a40cb9-5e92-4779-abff-e7fbc48d8819":
        companyData.montant_levee_fonds = answer.text
          ? parseFloat(answer.text)
          : null;
        console.log(`Mapped montant_levee_fonds: ${answer.text}`);
        break;
      case "9742385a-511c-47a8-aeeb-105359b9263c":
        companyData.types_projet = answer.choices?.labels || null;
        console.log(
          `Mapped types_projet: ${JSON.stringify(answer.choices?.labels)}`
        );
        break;
      case "d46c281a-8e69-478b-ab0a-c88d56a07d6c":
        companyData.nature_innovation = answer.choice?.label || null;
        console.log(`Mapped nature_innovation: ${answer.choice?.label}`);
        break;
      case "fe98e8dd-3607-4c01-82b2-c00e73dee0af":
        companyData.montant_projet = answer.choice?.label || null;
        console.log(`Mapped montant_projet: ${answer.choice?.label}`);
        break;
      case "a776199c-12a9-4be4-bfc1-648dad658ac1":
        companyData.subventions_recues = answer.boolean;
        console.log(`Mapped subventions_recues: ${answer.boolean}`);
        break;
      case "d35524dd-2d6d-485b-8240-de422137c9a0":
        companyData.details_subventions = answer.text;
        console.log(`Mapped details_subventions: ${answer.text}`);
        break;
      case "028f8a56-c580-4306-b571-60ceb7802572":
        companyData.dirigeant_femme = answer.boolean;
        console.log(`Mapped dirigeant_femme: ${answer.boolean}`);
        break;
      case "62838151-a516-461f-a6a5-274884307edf":
        companyData.femme_majoritaire = answer.boolean;
        console.log(`Mapped femme_majoritaire: ${answer.boolean}`);
        break;
      case "6acb4458-ddc3-44b2-bb4f-c706c66c3294":
        companyData.embauche_handicap = answer.boolean;
        console.log(`Mapped embauche_handicap: ${answer.boolean}`);
        break;
      case "469cdd03-d44a-476d-9375-1d1e57bf26af":
        companyData.embauche_jeunes = answer.boolean;
        console.log(`Mapped embauche_jeunes: ${answer.boolean}`);
        break;
      case "4c8cc15e-e078-46af-b8a9-b7f30552c156":
        companyData.embauche_seniors = answer.boolean;
        console.log(`Mapped embauche_seniors: ${answer.boolean}`);
        break;
      case "124e3860-f9ec-4b71-9dac-5aef80744f06":
        companyData.delai_projet = answer.choice?.label || null;
        console.log(`Mapped delai_projet: ${answer.choice?.label}`);
        break;
      case "3c115d4e-ae9c-4e18-86fe-e83b940c5bc8":
        companyData.impact_social = answer.text;
        console.log(`Mapped impact_social: ${answer.text}`);
        break;
      case "85ea5eee-b71f-4cf7-8af6-ec86e0391679":
        companyData.impact_environnemental = answer.text;
        console.log(`Mapped impact_environnemental: ${answer.text}`);
        break;
      case "75304101-1b0b-475f-87e3-03b2b91bd160":
        companyData.site_web = answer.url;
        console.log(`Mapped site_web: ${answer.url}`);
        break;
      case "a9a11c61-18df-456a-b639-c22750997db0":
        companyData.prenom = answer.text;
        console.log(`Mapped prenom: ${answer.text}`);
        break;
      case "989d953f-9dd0-4ec0-a5f5-cf3627f7aaf5":
        companyData.nom = answer.text;
        console.log(`Mapped nom: ${answer.text}`);
        break;
      case "e404c3fd-1694-4426-a7fe-8439b006b58b":
        companyData.telephone = answer.phone_number;
        console.log(`Mapped telephone: ${answer.phone_number}`);
        break;
      case "dd350bca-58cd-451d-bbe6-4d4ac69ff862":
        companyData.email = answer.email;
        console.log(`Mapped email: ${answer.email}`);
        break;
      default:
        // Field reference not recognized
        console.warn(`Unrecognized field reference: ${ref}`);
    }
  }

  console.log("Finished processing TypeForm payload");
  return companyData;
};

/**
 * Inserts a new company record into the database
 * L'enrichissement INSEE est maintenant géré dans la route webhook directement
 */
export const insertCompany = async (companyData: CompanyData) => {
  console.log("Inserting company data into database");
  try {
    const { error, data } = await supabase
      .from("companies")
      .insert(companyData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting company data:", error);
      throw error;
    }

    console.log("Company data inserted successfully", data?.id);
    return data;
  } catch (error) {
    console.error("Error in insertCompany function:", error);
    throw error;
  }
};

/**
 * Checks if a company with the given SIRET already exists
 */
export const checkCompanyExists = async (siret: string) => {
  console.log(`Checking if company with SIRET ${siret} exists`);
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id")
      .eq("siret", siret)
      .maybeSingle();

    if (error) {
      console.error("Error checking company existence:", error);
      throw error;
    }

    const exists = !!data;
    console.log(`Company exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error("Error in checkCompanyExists function:", error);
    throw error;
  }
};
