// TypeForm response interfaces
export interface TypeFormField {
  id: string;
  type: string;
  ref: string;
}

export interface TypeFormAnswer {
  type: string;
  field: TypeFormField;
  [key: string]: any; // For different answer types (text, boolean, choices, etc.)
}

export interface TypeFormResponse {
  form_id: string;
  token: string;
  landed_at: string;
  submitted_at: string;
  definition: {
    id: string;
    title: string;
    fields: TypeFormField[];
  };
  answers: TypeFormAnswer[];
}

export interface TypeFormWebhookPayload {
  event_id: string;
  event_type: string;
  form_response: TypeFormResponse;
}

// Company data structure matching the database schema
export interface CompanyData {
  // Typeform data
  siret: string | null;
  nombre_employes: number | null;
  description_projet: string | null;
  chiffre_affaires: number | null;
  tresorerie: number | null;
  niveau_dette: number | null;
  nouveau_credit: boolean | null;
  montant_credit: number | null;
  montant_levee_fonds: number | null;
  types_projet: string[] | null;
  nature_innovation: string | null;
  montant_projet: string | null;
  subventions_recues: boolean | null;
  details_subventions: string | null;
  dirigeant_femme: boolean | null;
  femme_majoritaire: boolean | null;
  embauche_handicap: boolean | null;
  embauche_jeunes: boolean | null;
  embauche_seniors: boolean | null;
  delai_projet: string | null;
  impact_social: string | null;
  impact_environnemental: string | null;
  site_web: string | null;
  prenom: string | null;
  nom: string | null;
  telephone: string | null;
  email: string | null;

  // Metadata
  typeform_response_id?: string;
  typeform_submitted_at?: string;
}

// INSEE API enriched data - Will be added later
export interface INSEEData {
  denomination_complete: string | null;
  sigle: string | null;
  raison_sociale: string | null;
  adresse_complete: string | null;
  etablissement_siege: boolean | null;
  etat_administratif: string | null;
  forme_juridique: string | null;
  code_forme_juridique: string | null;
  date_creation: string | null; // ISO date string
  tranche_effectif: string | null;
  code_tranche_effectif: string | null;
  code_postal: string | null;
  commune: string | null;
  code_commune: string | null;
  departement: string | null;
  code_departement: string | null;
  region: string | null;
  code_region: string | null;
  code_ape: string | null;
  libelle_ape: string | null;
}
