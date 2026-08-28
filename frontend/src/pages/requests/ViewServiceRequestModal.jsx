import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  ClipboardList,
  User,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  LockKeyhole,
  Globe2,
  Sparkles,
} from "lucide-react";

import api from "../../services/api";
import aiService from "../../features/ai/aiService";

import "./ViewServiceRequestModal.css";

const ViewServiceRequestModal = ({
  request,
  onClose,
}) => {
  const [requestData, setRequestData] =
    useState(request);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageType, setMessageType] = useState("customer");
  const [messageText, setMessageText] = useState("");
  const [messageSaving, setMessageSaving] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiResponseLoading, setAiResponseLoading] = useState(false);
  const [aiResponseError, setAiResponseError] = useState("");

  const requestId =
    request?._id || request?.id;

  useEffect(() => {
    const loadRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessagesLoading(true);
        setError("");
        setMessageError("");

        const [requestResponse, messageResponse] = await Promise.all([
          api.get(`/requests/${requestId}`),
          api.get(`/requests/${requestId}/messages`, {
            params: { page: 1, limit: 100 },
          }),
        ]);

        setRequestData(
          requestResponse.data?.data?.request || request
        );
        setMessages(
          messageResponse.data?.data?.messages || []
        );
      } catch (err) {
        console.error("Failed to fetch service request:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load request details."
        );
      } finally {
        setLoading(false);
        setMessagesLoading(false);
      }
    };

    loadRequest();
  }, [requestId, request]);

  const handleAddMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || !requestId) {
      return;
    }

    try {
      setMessageSaving(true);
      setMessageError("");

      const response = await api.post(
        `/requests/${requestId}/messages`,
        {
          message: trimmedMessage,
          type: messageType,
        }
      );

      const createdMessage = response.data?.data?.message;
      if (createdMessage) {
        setMessages((current) => [...current, createdMessage]);
      }
      setMessageText("");
    } catch (err) {
      console.error("Failed to add request message:", err);
      setMessageError(
        err.response?.data?.message ||
          "Failed to add communication."
      );
    } finally {
      setMessageSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!requestId) return;

    try {
      setAiSummaryLoading(true);
      setAiSummaryError("");

      const response = await aiService.generateSummary(requestId);
      setAiSummary(response?.data?.summary || null);
    } catch (err) {
      console.error("Failed to generate AI summary:", err);
      setAiSummaryError(
        err.response?.data?.message ||
          "Failed to generate AI summary."
      );
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleSuggestResponse = async () => {
    if (!requestId) return;

    try {
      setAiResponseLoading(true);
      setAiResponseError("");

      const response = await aiService.suggestResponse(requestId);
      setAiResponse(response?.data?.suggestion || "");
    } catch (err) {
      console.error("Failed to generate AI response:", err);
      setAiResponseError(
        err.response?.data?.message ||
          "Failed to generate AI response suggestion."
      );
    } finally {
      setAiResponseLoading(false);
    }
  };

  const handleUseAiResponse = () => {
    if (!aiResponse.trim()) return;
    setMessageType("customer");
    setMessageText(aiResponse.trim());
    setMessageError("");
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  };

  const getSeverityClass = (value) => {
    switch (value) {
      case "Critical":
        return "view-request-severity-critical";

      case "High":
        return "view-request-severity-high";

      case "Medium":
        return "view-request-severity-medium";

      case "Low":
        return "view-request-severity-low";

      default:
        return "";
    }
  };

  const getStatusClass = (value) => {
    switch (value) {
      case "Open":
        return "view-request-status-open";

      case "Under Investigation":
        return "view-request-status-investigation";

      case "Waiting for Customer":
        return "view-request-status-waiting";

      case "Resolved":
        return "view-request-status-resolved";

      case "Closed":
        return "view-request-status-closed";

      default:
        return "";
    }
  };

  const getSlaPresentation = (value) => {
    const values = {
      WITHIN_SLA: ["Within SLA", "within"],
      APPROACHING: ["SLA Approaching", "approaching"],
      BREACHED: ["SLA Breached", "breached"],
      RESOLVED_WITHIN_SLA: ["Resolved Within SLA", "resolved"],
      RESOLVED_AFTER_SLA: ["Resolved After SLA", "breached"],
    };
    return values[value] || ["Unknown", "within"];
  };

  const [slaLabel, slaTone] = getSlaPresentation(
    requestData?.slaStatus
  );

  return (
    <div
      className="view-request-overlay"
      onMouseDown={onClose}
    >
      <div
        className="view-request-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="view-request-header">
          <div className="view-request-title">
            <div className="view-request-icon">
              <ClipboardList size={19} />
            </div>

            <div>
              <h2>
                {requestData?.requestNumber ||
                  "Service Request"}
              </h2>

              <p>
                Service request details
              </p>
            </div>
          </div>

          <button
            type="button"
            className="view-request-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        {loading ? (
          <div className="view-request-loading">
            <Loader2
              size={28}
              className="view-request-spinner"
            />

            <span>
              Loading request details...
            </span>
          </div>
        ) : error ? (
          <div className="view-request-error">
            {error}
          </div>
        ) : (
          <div className="view-request-content">
            <div className="view-request-summary">
              <div>
                <span className="view-request-label">
                  Status
                </span>

                <span
                  className={`view-request-badge ${getStatusClass(
                    requestData?.status
                  )}`}
                >
                  {requestData?.status || "-"}
                </span>
              </div>

              <div>
                <span className="view-request-label">
                  Severity
                </span>

                <span
                  className={`view-request-badge ${getSeverityClass(
                    requestData?.severity
                  )}`}
                >
                  {requestData?.severity || "-"}
                </span>
              </div>

              <div>
                <span className="view-request-label">
                  Category
                </span>

                <strong>
                  {requestData?.category || "-"}
                </strong>
              </div>
            </div>

            <section className="view-request-section">
              <h3>Request Information</h3>

              <div className="view-request-info-grid">
                <div>
                  <span>
                    <ClipboardList size={14} />
                    Request Number
                  </span>

                  <strong>
                    {requestData?.requestNumber ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    <Calendar size={14} />
                    Created Date
                  </span>

                  <strong>
                    {formatDateTime(
                      requestData?.createdAt
                    )}
                  </strong>
                </div>

                <div className="view-request-info-full">
                  <span>
                    Subject
                  </span>

                  <strong>
                    {requestData?.subject ||
                      "-"}
                  </strong>
                </div>

                <div className="view-request-info-full">
                  <span>
                    Description
                  </span>

                  <p>
                    {requestData?.description ||
                      "No description provided."}
                  </p>
                </div>
              </div>
            </section>

            <section className="view-request-section">
              <h3>Customer</h3>

              <div className="view-request-person-card">
                <div className="view-request-person-icon">
                  <User size={17} />
                </div>

                <div>
                  <strong>
                    {requestData?.customer?.name ||
                      "-"}
                  </strong>

                  <span>
                    {requestData?.customer?.email ||
                      "-"}
                  </span>

                  <span>
                    {requestData?.customer?.phone ||
                      "-"}
                  </span>
                </div>
              </div>
            </section>

            <section className="view-request-section">
              <h3>Assignment</h3>

              <div className="view-request-assignment-grid">
                <div>
                  <span>
                    <Building2 size={14} />
                    Support Team
                  </span>

                  <strong>
                    {requestData?.assignedTeam
                      ?.name ||
                      "Unassigned"}
                  </strong>
                </div>

                <div>
                  <span>
                    <User size={14} />
                    Support Agent
                  </span>

                  <strong>
                    {requestData?.assignedAgent
                      ?.name ||
                      "Unassigned"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="view-request-section">
              <h3>Resolution</h3>

              <div className="view-request-info-grid">
                <div className="view-request-info-full">
                  <span>
                    Resolution Note
                  </span>

                  <p>
                    {requestData?.resolutionNote ||
                      "No resolution note has been added yet."}
                  </p>
                </div>
              </div>
            </section>

            <section className="view-request-section view-request-ai-section">
              <div className="view-request-ai-heading">
                <div>
                  <Sparkles size={18} />
                  <div>
                    <h3>AI Case Summary</h3>
                    <p>Generate a concise summary from the request and conversation history.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={aiSummaryLoading}
                >
                  {aiSummaryLoading ? (
                    <Loader2 size={14} className="view-request-spinner" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {aiSummary ? "Regenerate" : "Generate Summary"}
                </button>
              </div>

              {aiSummaryError && (
                <div className="view-request-ai-error">
                  {aiSummaryError}
                </div>
              )}

              {aiSummary && (
                <div className="view-request-ai-summary">
                  <div className="full">
                    <span>Customer Problem</span>
                    <p>{aiSummary.customerProblem}</p>
                  </div>

                  <div>
                    <span>Important Details</span>
                    {aiSummary.importantDetails?.length ? (
                      <ul>
                        {aiSummary.importantDetails.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No additional details identified.</p>
                    )}
                  </div>

                  <div>
                    <span>Actions Already Taken</span>
                    {aiSummary.actionsTaken?.length ? (
                      <ul>
                        {aiSummary.actionsTaken.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No actions recorded yet.</p>
                    )}
                  </div>

                  <div>
                    <span>Current Status</span>
                    <p>{aiSummary.currentStatus}</p>
                  </div>

                  <div>
                    <span>Recommended Next Action</span>
                    <p>{aiSummary.recommendedNextAction}</p>
                  </div>
                </div>
              )}
            </section>

            <section className="view-request-section">
              <div className="view-request-conversation-heading">
                <div>
                  <h3>Conversation History</h3>
                  <p>Customer-facing responses and private internal notes.</p>
                </div>
                <MessageSquare size={18} />
              </div>

              <div className="view-request-messages">
                {messagesLoading ? (
                  <div className="view-request-message-empty">
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="view-request-message-empty">
                    No communication has been recorded yet.
                  </div>
                ) : (
                  messages.map((item) => (
                    <article
                      className={`view-request-message ${
                        item.type === "internal" ? "internal" : "customer"
                      }`}
                      key={item._id || item.id}
                    >
                      <div className="view-request-message-meta">
                        <div>
                          {item.type === "internal" ? (
                            <LockKeyhole size={13} />
                          ) : (
                            <Globe2 size={13} />
                          )}
                          <strong>
                            {item.type === "internal"
                              ? "Internal Note"
                              : "Customer-facing Response"}
                          </strong>
                        </div>
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>

                      <p>{item.message}</p>

                      <span className="view-request-message-author">
                        Added by {item.author?.name || "Support User"}
                      </span>
                    </article>
                  ))
                )}
              </div>

              <form
                className="view-request-message-form"
                onSubmit={handleAddMessage}
              >
                <div className="view-request-message-type">
                  <button
                    type="button"
                    className={messageType === "customer" ? "active" : ""}
                    onClick={() => setMessageType("customer")}
                    disabled={messageSaving}
                  >
                    <Globe2 size={14} /> Customer Response
                  </button>
                  <button
                    type="button"
                    className={messageType === "internal" ? "active internal" : ""}
                    onClick={() => setMessageType("internal")}
                    disabled={messageSaving}
                  >
                    <LockKeyhole size={14} /> Internal Note
                  </button>
                </div>

                <div className="view-request-ai-response-tool">
                  <div className="view-request-ai-response-actions">
                    <div>
                      <Sparkles size={14} />
                      <span>AI Response Suggestion</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSuggestResponse}
                      disabled={aiResponseLoading}
                    >
                      {aiResponseLoading ? "Generating..." : aiResponse ? "Regenerate" : "Generate Draft"}
                    </button>
                  </div>

                  {aiResponseError && (
                    <div className="view-request-ai-error">
                      {aiResponseError}
                    </div>
                  )}

                  {aiResponse && (
                    <div className="view-request-ai-response-editor">
                      <textarea
                        rows="5"
                        value={aiResponse}
                        onChange={(event) => setAiResponse(event.target.value)}
                        aria-label="Editable AI response suggestion"
                      />
                      <div>
                        <span>Review and edit this draft before using it.</span>
                        <button
                          type="button"
                          onClick={handleUseAiResponse}
                          disabled={!aiResponse.trim()}
                        >
                          Use in Customer Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <textarea
                  rows="4"
                  value={messageText}
                  onChange={(event) => {
                    setMessageText(event.target.value);
                    setMessageError("");
                  }}
                  placeholder={
                    messageType === "internal"
                      ? "Add a private note for the support team..."
                      : "Write a response that can be shared with the customer..."
                  }
                  maxLength={5000}
                  disabled={messageSaving}
                />

                {messageError && (
                  <div className="view-request-message-error">
                    {messageError}
                  </div>
                )}

                <div className="view-request-message-submit-row">
                  <span>{messageText.length}/5000</span>
                  <button
                    type="submit"
                    disabled={!messageText.trim() || messageSaving}
                  >
                    {messageSaving ? (
                      <Loader2 size={15} className="view-request-spinner" />
                    ) : (
                      <Send size={15} />
                    )}
                    {messageSaving ? "Adding..." : "Add Communication"}
                  </button>
                </div>
              </form>
            </section>

            <section className="view-request-section">
              <h3>SLA</h3>

              <div className="view-request-sla">
                <div className={`view-request-sla-status ${slaTone}`}>
                  <Clock size={16} />
                  <span>SLA Status</span>
                  <strong>{slaLabel}</strong>
                </div>

                <div>
                  <Clock size={16} />

                  <span>
                    SLA Deadline
                  </span>

                  <strong>
                    {formatDateTime(
                      requestData?.slaDeadline
                    )}
                  </strong>
                </div>

                <div>
                  <Calendar size={16} />

                  <span>
                    Resolution Date
                  </span>

                  <strong>
                    {formatDateTime(
                      requestData?.resolutionDate
                    )}
                  </strong>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="view-request-footer">
          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewServiceRequestModal;