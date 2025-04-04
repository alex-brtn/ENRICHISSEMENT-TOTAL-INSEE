import { NextResponse } from "next/server";
import {
  checkCompanyExists,
  insertCompany,
  processTypeFormPayload,
} from "../../../actions/db/companies-actions";
import { TypeFormWebhookPayload } from "../../../types/company-types";
import { z } from "zod";
import { enrichCompanyWithINSEEData } from "../../../services/insee/insee-enrichment-service";

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
    console.log("⭐ Webhook endpoint called");

    // Get the payload from the request
    const payload = await request.json();
    console.log(
      "📥 Webhook payload received:",
      JSON.stringify(payload).substring(0, 200) + "..."
    );

    // Validate the request payload against our schema
    const validationResult = typeformWebhookSchema.safeParse(payload);

    if (!validationResult.success) {
      console.error("❌ Invalid webhook payload:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    console.log("✅ Payload validation successful");
    const validPayload = validationResult.data as TypeFormWebhookPayload;

    // Only process form_response events
    if (validPayload.event_type !== "form_response") {
      console.log("⏭️ Event type not processed:", validPayload.event_type);
      return NextResponse.json(
        { message: "Event type not processed" },
        { status: 200 }
      );
    }

    // Process the TypeForm payload to extract company data
    console.log("🔄 Processing TypeForm payload to extract company data");
    const companyData = processTypeFormPayload(validPayload);
    console.log(
      "📊 Company data extracted:",
      JSON.stringify(companyData).substring(0, 200) + "..."
    );

    // Insert the new company record
    console.log("💾 Inserting new company record");
    const insertedCompany = await insertCompany(companyData);

    if (!insertedCompany) {
      console.error("❌ Failed to insert company data");
      return NextResponse.json(
        { error: "Failed to insert company data" },
        { status: 500 }
      );
    }

    console.log(`✅ Company inserted with ID: ${insertedCompany.id}`);

    // Enrichir directement avec les données INSEE de manière synchrone
    if (insertedCompany.siret) {
      console.log(
        `🔄 Enriching company ${insertedCompany.id} with INSEE data for SIRET ${insertedCompany.siret}`
      );

      try {
        const enrichedCompany = await enrichCompanyWithINSEEData(
          insertedCompany.id,
          insertedCompany.siret
        );

        if (enrichedCompany) {
          console.log(`✅ Company successfully enriched with INSEE data`);
          return NextResponse.json(
            {
              message: "Company data processed and enriched successfully",
              id: insertedCompany.id,
              enriched: true,
              company: enrichedCompany,
            },
            { status: 200 }
          );
        } else {
          console.warn(`⚠️ Company insertion OK but INSEE enrichment failed`);
          return NextResponse.json(
            {
              message: "Company data processed but not enriched",
              id: insertedCompany.id,
              enriched: false,
            },
            { status: 200 }
          );
        }
      } catch (enrichError) {
        console.error(`❌ Error during INSEE enrichment:`, enrichError);
        return NextResponse.json(
          {
            message: "Company data processed but enrichment failed",
            id: insertedCompany.id,
            enriched: false,
            error:
              enrichError instanceof Error
                ? enrichError.message
                : String(enrichError),
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Company data processed successfully (no SIRET provided)",
        id: insertedCompany.id,
        enriched: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTION requests for CORS preflight
export async function OPTIONS() {
  console.log("OPTIONS request received");
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
