const mongoose = require("mongoose");

const ServiceRequest = require("../models/ServiceRequest");
const Message = require("../models/Message");
const { assertRequestAccess } = require("./requestAccessService");
const { createAuditLog } = require("./auditLogService");

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_MESSAGES = 60;
const MAX_CONTEXT_CHARS = 30000;

const getRequestContext = async (requestId, actor) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    const error = new Error("Invalid service request ID");
    error.statusCode = 400;
    throw error;
  }

  const request = await ServiceRequest.findById(requestId)
    .populate("customer", "name company customerType accountStatus")
    .populate("assignedTeam", "name")
    .populate("assignedAgent", "name email role")
    .lean();

  if (!request) {
    const error = new Error("Service request not found");
    error.statusCode = 404;
    throw error;
  }

  assertRequestAccess(request, actor);

  const messages = await Message.find({ request: requestId })
    .populate("author", "name role")
    .sort({ createdAt: 1 })
    .limit(MAX_MESSAGES)
    .lean();

  return { request, messages };
};

const createContextText = ({ request, messages }) => {
  const context = {
    request: {
      requestNumber: request.requestNumber,
      customerName: request.customer?.name,
      company: request.customer?.company,
      subject: request.subject,
      description: request.description,
      category: request.category,
      severity: request.severity,
      status: request.status,
      assignedTeam: request.assignedTeam?.name,
      assignedAgent: request.assignedAgent?.name,
      createdAt: request.createdAt,
      resolutionDate: request.resolutionDate,
      slaDeadline: request.slaDeadline,
    },
    conversation: messages.map((item) => ({
      type: item.type,
      author: item.author?.name || "Support User",
      timestamp: item.createdAt,
      message: item.message,
    })),
  };

  return JSON.stringify(context).slice(0, MAX_CONTEXT_CHARS);
};

const callGeminiStructured = async ({ prompt, responseSchema }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "AI service is not configured. Add GEMINI_API_KEY to the backend environment."
    );
    error.statusCode = 503;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          input: prompt,
          store: false,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: responseSchema,
          },
        }),
      }
    );

    let payload = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const providerMessage =
        payload?.error?.message ||
        payload?.message ||
        `Gemini API returned HTTP ${response.status}`;

      console.error("Gemini API request failed", {
        status: response.status,
        message: providerMessage,
      });

      const error = new Error("AI provider request failed");
      error.statusCode = 502;
      error.details = {
        providerStatus: response.status,
        providerMessage,
      };
      throw error;
    }

    const modelOutputSteps = Array.isArray(payload?.steps)
      ? payload.steps.filter((step) => step?.type === "model_output")
      : [];

    const text = modelOutputSteps
      .flatMap((step) => (Array.isArray(step.content) ? step.content : []))
      .filter((item) => item?.type === "text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("")
      .trim();

    if (!text) {
      const error = new Error("AI provider returned an empty response");
      error.statusCode = 502;
      throw error;
    }

    try {
      return JSON.parse(text);
    } catch {
      const error = new Error("AI provider returned an invalid response");
      error.statusCode = 502;
      throw error;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("AI request timed out");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
const generateRequestSummary = async (requestId, actor) => {
  const context = await getRequestContext(requestId, actor);
  const contextText = createContextText(context);

  const summary = await callGeminiStructured({
    prompt: `You are assisting a US customer support team. Summarize the following service request using only the supplied facts. Do not invent actions, causes, promises, or customer statements. Keep each field concise.\n\nReturn:\n- customerProblem: a short description of the core problem\n- importantDetails: key facts as a list\n- actionsTaken: actions already recorded as a list; return an empty list if none\n- currentStatus: current situation based on the request and conversation\n- recommendedNextAction: one practical next action for the support team\n\nService request context:\n${contextText}`,
    responseSchema: {
      type: "object",
      properties: {
        customerProblem: { type: "string" },
        importantDetails: {
          type: "array",
          items: { type: "string" },
        },
        actionsTaken: {
          type: "array",
          items: { type: "string" },
        },
        currentStatus: { type: "string" },
        recommendedNextAction: { type: "string" },
      },
      required: [
        "customerProblem",
        "importantDetails",
        "actionsTaken",
        "currentStatus",
        "recommendedNextAction",
      ],
    },
  });

  await createAuditLog({
    user: actor?.userId || null,
    action: "OTHER",
    entityType: "ServiceRequest",
    entityId: requestId,
    description: `AI summary generated for service request ${context.request.requestNumber}`,
  });

  return summary;
};

const generateResponseSuggestion = async (requestId, actor) => {
  const context = await getRequestContext(requestId, actor);
  const contextText = createContextText(context);

  const result = await callGeminiStructured({
    prompt: `You are drafting a professional customer support response for a US-based service company. Use only the supplied service request and conversation facts. Do not invent completed actions, timelines, refunds, guarantees, root causes, or promises. Be empathetic, concise, clear about the current state, and explain the next reasonable step. Do not include an agent name or signature because the support agent will edit the draft before sending.\n\nService request context:\n${contextText}`,
    responseSchema: {
      type: "object",
      properties: {
        response: { type: "string" },
      },
      required: ["response"],
    },
  });

  await createAuditLog({
    user: actor?.userId || null,
    action: "OTHER",
    entityType: "ServiceRequest",
    entityId: requestId,
    description: `AI response suggestion generated for service request ${context.request.requestNumber}`,
  });

  return result.response;
};

const analyzeNewRequest = async ({ subject, description }) => {
  return callGeminiStructured({
    prompt: `Classify the following customer support issue for a US-based service company. Choose exactly one category and one severity from the allowed values. Severity should reflect operational/customer impact, not emotional wording. Return a short factual reason.\n\nAllowed categories: Technical Issue, Billing, Account, Product Information, Delivery, Complaint.\nAllowed severities: Critical, High, Medium, Low.\n\nSeverity guidance:\n- Critical: service outage, severe business impact, security/safety-like urgency, or no viable workaround\n- High: major functionality blocked or significant customer impact\n- Medium: normal support issue with limited workaround or moderate impact\n- Low: informational/minor issue with little immediate impact\n\nSubject: ${subject}\nDescription: ${description}`,
    responseSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
            "Technical Issue",
            "Billing",
            "Account",
            "Product Information",
            "Delivery",
            "Complaint",
          ],
        },
        severity: {
          type: "string",
          enum: ["Critical", "High", "Medium", "Low"],
        },
        reason: { type: "string" },
      },
      required: ["category", "severity", "reason"],
    },
  });
};

module.exports = {
  callGeminiStructured,
  getRequestContext,
  createContextText,
  generateRequestSummary,
  generateResponseSuggestion,
  analyzeNewRequest,
};
