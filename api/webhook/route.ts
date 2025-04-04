import { NextResponse } from "next/server";
import {
  checkCompanyExists,
  insertCompany,
  processTypeFormPayload,
} from "../../actions/db/companies-actions";
import { TypeFormWebhookPayload } from "../../types/company-types";
import { z } from "zod";

// Define the schema for validating the webhook payload
const typeformWebhookSchema = z.object({
  event_id: z.string(),
  event_type: z.string(),
  form_response: z.object({
    form_id: z.string(),
    token: z.string(),
    landed_at: z.string(),
    submitted_at: z.string(),
    definition: z.object({
      id: z.string(),
      title: z.string(),
      fields: z.array(
        z.object({
          id: z.string(),
          ref: z.string(),
          type: z.string(),
        })
      ),
    }),
    answers: z.array(
      z
        .object({
          type: z.string(),
          field: z.object({
            id: z.string(),
            type: z.string(),
            ref: z.string(),
          }),
        })
        .passthrough()
    ),
  }),
});

export async function POST(request: Request) {
  try {
    // Get the payload from the request
    const payload = await request.json();

    // Validate the request payload against our schema
    const validationResult = typeformWebhookSchema.safeParse(payload);

    if (!validationResult.success) {
      console.error("Invalid webhook payload:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const validPayload = validationResult.data as TypeFormWebhookPayload;

    // Only process form_response events
    if (validPayload.event_type !== "form_response") {
      return NextResponse.json(
        { message: "Event type not processed" },
        { status: 200 }
      );
    }

    // Process the TypeForm payload to extract company data
    const companyData = processTypeFormPayload(validPayload);

    // Check if the company already exists by SIRET (if provided)
    let companyExists = false;
    if (companyData.siret) {
      companyExists = await checkCompanyExists(companyData.siret);
    }

    if (companyExists) {
      return NextResponse.json(
        { message: "Company already exists" },
        { status: 200 }
      );
    }

    // Insert the new company record
    const insertedCompany = await insertCompany(companyData);

    return NextResponse.json(
      {
        message: "Company data processed successfully",
        id: insertedCompany?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTION requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
