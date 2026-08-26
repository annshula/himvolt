import { NextRequest, NextResponse } from "next/server";

import { getAdminToken } from "@/lib/shopify/admin-token";
import { graphqlRequest } from "@/lib/shopify/client";
import { adminEndpoint, isAdminConfigured } from "@/lib/shopify/config";
import { getValidSession } from "@/lib/shopify/customer-account";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 5;

const STAGED_UPLOADS_CREATE = /* GraphQL */ `
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters { name value }
      }
      userErrors { field message }
    }
  }
`;

const FILE_CREATE = /* GraphQL */ `
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files { id fileStatus }
      userErrors { field message }
    }
  }
`;

const CUSTOMER_EVIDENCE_QUERY = /* GraphQL */ `
  query CustomerEvidence($id: ID!) {
    customer(id: $id) {
      metafield(namespace: "custom", key: "return_evidence") { value }
    }
  }
`;

const CUSTOMER_UPDATE = /* GraphQL */ `
  mutation SetReturnEvidence($input: CustomerInput!) {
    customerUpdate(input: $input) {
      userErrors { field message }
    }
  }
`;

type StagedTarget = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

/**
 * Uploads one file to Shopify (staged upload → fileCreate) and returns its
 * File GID. `filename` is deliberately omitted from the fileCreate call —
 * Shopify's extension-match validation rejects it even when the name is
 * correct, for VIDEO resources whose staged resourceUrl has no path segment
 * to compare against (an `external_video_id` query param, not a real GCS
 * path). Omitting it lets Shopify infer the name from the original
 * stagedUploadsCreate call instead, which works for both resource types.
 */
async function uploadOne(
  file: File,
  resource: "IMAGE" | "VIDEO",
  token: string,
): Promise<string> {
  const staged = await graphqlRequest<{
    stagedUploadsCreate: {
      stagedTargets: StagedTarget[];
      userErrors: { field: string[] | null; message: string }[];
    };
  }>({
    endpoint: adminEndpoint(),
    query: STAGED_UPLOADS_CREATE,
    variables: {
      input: [
        {
          resource,
          filename: file.name,
          mimeType: file.type,
          fileSize: String(file.size),
          httpMethod: "POST",
        },
      ],
    },
    headers: { "X-Shopify-Access-Token": token },
    retries: 1,
  });

  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target) {
    throw new Error(
      staged.stagedUploadsCreate.userErrors[0]?.message ??
        "Could not start the upload.",
    );
  }

  const body = new FormData();
  for (const p of target.parameters) body.append(p.name, p.value);
  body.append("file", file);
  const uploadRes = await fetch(target.url, { method: "POST", body });
  if (!uploadRes.ok) {
    throw new Error(`Upload to storage failed (HTTP ${uploadRes.status}).`);
  }

  const created = await graphqlRequest<{
    fileCreate: {
      files: { id: string; fileStatus: string }[];
      userErrors: { field: string[] | null; message: string }[];
    };
  }>({
    endpoint: adminEndpoint(),
    query: FILE_CREATE,
    variables: {
      files: [{ originalSource: target.resourceUrl, contentType: resource }],
    },
    headers: { "X-Shopify-Access-Token": token },
    retries: 1,
  });

  const createdFile = created.fileCreate.files[0];
  if (!createdFile) {
    throw new Error(
      created.fileCreate.userErrors[0]?.message ?? "The file wasn't created.",
    );
  }
  return createdFile.id;
}

/**
 * POST /api/account/return-evidence — a signed-in shopper attaches photos or
 * a video to a return. Shopify's own return mutation has no attachment
 * field, so evidence lands on the *customer* record instead (custom.
 * return_evidence, a list.file_reference metafield) — the one place
 * write_customers already lets this app write. Support reviews it from the
 * customer's Shopify Admin page; the return's own customerNote (see
 * ReturnRequestForm) carries which order/item it's about.
 */
export async function POST(request: NextRequest) {
  const session = await getValidSession();
  if (!session?.customerId) {
    return NextResponse.json(
      { ok: false, error: "Sign in to attach evidence." },
      { status: 401 },
    );
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Uploads aren't configured yet." },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);
  const files =
    form?.getAll("files").filter((f): f is File => f instanceof File) ?? [];

  if (files.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Attach at least one photo or video." },
      { status: 400 },
    );
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { ok: false, error: `Attach up to ${MAX_FILES} files at a time.` },
      { status: 400 },
    );
  }
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `${file.name} is larger than 25MB.` },
        { status: 400 },
      );
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { ok: false, error: `${file.name} isn't a photo or video.` },
        { status: 400 },
      );
    }
  }

  const token = await getAdminToken();
  const newFileGids: string[] = [];
  try {
    for (const file of files) {
      const resource = file.type.startsWith("image/") ? "IMAGE" : "VIDEO";
      newFileGids.push(await uploadOne(file, resource, token));
    }
  } catch (error) {
    console.error("[return-evidence] upload failed:", error);
    return NextResponse.json(
      { ok: false, error: "Upload failed — try again." },
      { status: 502 },
    );
  }

  try {
    const existing = await graphqlRequest<{
      customer: { metafield: { value: string } | null } | null;
    }>({
      endpoint: adminEndpoint(),
      query: CUSTOMER_EVIDENCE_QUERY,
      variables: { id: session.customerId },
      headers: { "X-Shopify-Access-Token": token },
    });
    const existingIds: string[] = existing.customer?.metafield?.value
      ? JSON.parse(existing.customer.metafield.value)
      : [];

    await graphqlRequest({
      endpoint: adminEndpoint(),
      query: CUSTOMER_UPDATE,
      variables: {
        input: {
          id: session.customerId,
          metafields: [
            {
              namespace: "custom",
              key: "return_evidence",
              type: "list.file_reference",
              value: JSON.stringify([...existingIds, ...newFileGids]),
            },
          ],
        },
      },
      headers: { "X-Shopify-Access-Token": token },
      retries: 1,
    });
  } catch (error) {
    console.error(
      "[return-evidence] uploaded but failed to attach to customer record:",
      error,
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "Uploaded, but couldn't save it to your account — email us instead.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, count: newFileGids.length });
}
