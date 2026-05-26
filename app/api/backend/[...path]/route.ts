import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ApiEndpoint } from "@/types/backend";
import { executePipeline } from "@/lib/pipeline-executor";
import { createFirestoreDelegate } from "@/lib/pipeline-delegates";
import type { UserFirebaseConfig } from "@/types/editor";

/**
 * Dynamic catch-all API route that serves mock data
 * from the project's endpoint definitions.
 *
 * URL format: /api/backend/{path}
 * Required header: x-project-id
 *
 * Matches the incoming method + path against the project's
 * apiEndpoints array. If the endpoint has a Logic Pipeline enabled,
 * executes the pipeline steps. Otherwise returns the configured mock response.
 *
 * When the project has a `firebaseConfig`, the pipeline delegate
 * uses the USER's Firebase for auth & database operations.
 */
async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const projectId = request.headers.get("x-project-id");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing x-project-id header" },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const requestPath = "/" + resolvedParams.path.join("/");
    const method = request.method.toUpperCase();

    // Fetch the project from Firestore
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const projectData = projectSnap.data();
    const endpoints: ApiEndpoint[] = projectData.apiEndpoints || [];
    const userFirebaseConfig: UserFirebaseConfig | undefined = projectData.firebaseConfig;

    // Find matching endpoint
    const endpoint = endpoints.find(
      (ep) =>
        ep.path === requestPath &&
        ep.method === method &&
        ep.isEnabled
    );

    if (!endpoint) {
      return NextResponse.json(
        {
          error: "Endpoint not found",
          detail: `No enabled ${method} endpoint found for path: ${requestPath}`,
          availableEndpoints: endpoints
            .filter((ep) => ep.isEnabled)
            .map((ep) => `${ep.method} ${ep.path}`),
        },
        { status: 404 }
      );
    }

    // -- Pipeline Mode -------------------------------------------------
    if (endpoint.usePipeline && endpoint.pipeline && endpoint.pipeline.length > 0) {
      let body: Record<string, any> = {};
      try {
        body = await request.json();
      } catch {
        // No body or invalid JSON
      }

      const query: Record<string, any> = {};
      request.nextUrl.searchParams.forEach((v, k) => { query[k] = v; });

      const headers: Record<string, string> = {};
      request.headers.forEach((v, k) => { headers[k] = v; });

      // Create delegate - uses user's Firebase when config is available
      const delegate = createFirestoreDelegate(projectId, userFirebaseConfig);

      const result = await executePipeline(endpoint.pipeline, {
        body,
        query,
        headers,
      }, delegate, endpoint.nodeEdges || []);

      return NextResponse.json(result.body, {
        status: result.status,
        headers: {
          "X-Layr-Endpoint": endpoint.name,
          "X-Layr-Data-Source": userFirebaseConfig ? "user-firebase" : "pipeline",
          "X-Layr-Pipeline-Trace": JSON.stringify(result.trace),
        },
      });
    }

    // -- Mock Mode (default) -------------------------------------------
    const statusCode = endpoint.statusCode || 200;
    const mockData = endpoint.mockResponse;

    // For write methods (POST/PUT/PATCH), echo back the received body
    let responseData: any;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      let receivedBody = null;
      try {
        receivedBody = await request.json();
      } catch {
        // No body or invalid JSON
      }
      responseData = mockData ?? {
        success: true,
        message: "Data received",
        received: receivedBody,
      };
    } else {
      responseData = mockData ?? { message: "OK" };
    }

    return NextResponse.json(responseData, {
      status: statusCode,
      headers: {
        "X-Layr-Endpoint": endpoint.name,
        "X-Layr-Data-Source": endpoint.dataSource,
      },
    });
  } catch (error) {
    console.error("Backend API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
