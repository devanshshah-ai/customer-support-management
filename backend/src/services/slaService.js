const SLA_HOURS = {
  Critical: 4,
  High: 8,
  Medium: 24,
  Low: 48,
};

const calculateSlaDeadline = (severity, createdAt = new Date()) => {
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
  const now = new Date();

  if (status === "Resolved" || status === "Closed") {
    const resolvedAt = resolutionDate
      ? new Date(resolutionDate)
      : now;

    return resolvedAt <= new Date(slaDeadline)
      ? "RESOLVED_WITHIN_SLA"
      : "RESOLVED_AFTER_SLA";
  }

  const deadline = new Date(slaDeadline);

  if (now > deadline) {
    return "BREACHED";
  }

  const remainingTime =
    deadline.getTime() - now.getTime();

  const totalTime =
    deadline.getTime() -
    new Date(createdAt).getTime();

  const remainingPercentage =
    (remainingTime / totalTime) * 100;

  if (remainingPercentage <= 25) {
    return "APPROACHING";
  }

  return "WITHIN_SLA";
};

const getSlaHours = (severity) => {
  return SLA_HOURS[severity] || null;
};

module.exports = {
  calculateSlaDeadline,
  getSlaStatus,
  getSlaHours,
  SLA_HOURS,
};