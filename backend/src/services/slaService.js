const SLA_HOURS = {
  Critical: 4,
  High: 8,
  Medium: 24,
  Low: 48,
};

const calculateSlaDeadline = (
  severity,
  createdAt = new Date()
) => {
  const hours = SLA_HOURS[severity];

  if (!hours) {
    throw new Error(`Invalid severity: ${severity}`);
  }

  const deadline = new Date(createdAt);

  deadline.setHours(deadline.getHours() + hours);

  return deadline;
};

const getSlaStatus = (
  slaDeadline,
  status,
  createdAt,
  resolutionDate = null
) => {
  const deadline = new Date(slaDeadline);

  // Resolved/closed requests are evaluated using their
  // actual resolution time.
  if (status === "Resolved" || status === "Closed") {
    if (!resolutionDate) {
      return "RESOLVED_WITHIN_SLA";
    }

    return new Date(resolutionDate) <= deadline
      ? "RESOLVED_WITHIN_SLA"
      : "RESOLVED_AFTER_SLA";
  }

  const now = new Date();

  if (now > deadline) {
    return "BREACHED";
  }

  const totalDuration =
    deadline.getTime() -
    new Date(createdAt).getTime();

  const remainingDuration =
    deadline.getTime() - now.getTime();

  const remainingPercentage =
    totalDuration > 0
      ? (remainingDuration / totalDuration) * 100
      : 0;

  if (remainingPercentage <= 25) {
    return "APPROACHING";
  }

  return "WITHIN_SLA";
};

const getSlaHours = (severity) => {
  return SLA_HOURS[severity] || null;
};

module.exports = {
  SLA_HOURS,
  calculateSlaDeadline,
  getSlaStatus,
  getSlaHours,
};