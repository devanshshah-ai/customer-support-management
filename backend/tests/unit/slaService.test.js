const {
  SLA_HOURS,
  calculateSlaDeadline,
  getSlaStatus,
  getSlaHours,
} = require("../../src/services/slaService");

describe("SLA Service", () => {
  describe("SLA_HOURS", () => {
    test("should contain correct SLA hours for each severity", () => {
      expect(SLA_HOURS).toEqual({
        Critical: 4,
        High: 8,
        Medium: 24,
        Low: 48,
      });
    });
  });

  describe("calculateSlaDeadline", () => {
    const createdAt = new Date("2026-08-27T10:00:00.000Z");

    test("should calculate Critical SLA as 4 hours", () => {
      const deadline = calculateSlaDeadline(
        "Critical",
        createdAt
      );

      expect(deadline).toEqual(
        new Date("2026-08-27T14:00:00.000Z")
      );
    });

    test("should calculate High SLA as 8 hours", () => {
      const deadline = calculateSlaDeadline(
        "High",
        createdAt
      );

      expect(deadline).toEqual(
        new Date("2026-08-27T18:00:00.000Z")
      );
    });

    test("should calculate Medium SLA as 24 hours", () => {
      const deadline = calculateSlaDeadline(
        "Medium",
        createdAt
      );

      expect(deadline).toEqual(
        new Date("2026-08-28T10:00:00.000Z")
      );
    });

    test("should calculate Low SLA as 48 hours", () => {
      const deadline = calculateSlaDeadline(
        "Low",
        createdAt
      );

      expect(deadline).toEqual(
        new Date("2026-08-29T10:00:00.000Z")
      );
    });

    test("should throw an error for invalid severity", () => {
      expect(() => {
        calculateSlaDeadline(
          "Invalid",
          createdAt
        );
      }).toThrow("Invalid severity: Invalid");
    });
  });

  describe("getSlaHours", () => {
    test("should return 4 hours for Critical", () => {
      expect(getSlaHours("Critical")).toBe(4);
    });

    test("should return 8 hours for High", () => {
      expect(getSlaHours("High")).toBe(8);
    });

    test("should return 24 hours for Medium", () => {
      expect(getSlaHours("Medium")).toBe(24);
    });

    test("should return 48 hours for Low", () => {
      expect(getSlaHours("Low")).toBe(48);
    });

    test("should return null for invalid severity", () => {
      expect(getSlaHours("Invalid")).toBeNull();
    });
  });

  describe("getSlaStatus", () => {
    test("should return RESOLVED_WITHIN_SLA when resolved before deadline", () => {
      const createdAt = new Date(
        "2026-08-27T10:00:00.000Z"
      );

      const slaDeadline = new Date(
        "2026-08-27T18:00:00.000Z"
      );

      const resolutionDate = new Date(
        "2026-08-27T16:00:00.000Z"
      );

      expect(
        getSlaStatus(
          slaDeadline,
          "Resolved",
          createdAt,
          resolutionDate
        )
      ).toBe("RESOLVED_WITHIN_SLA");
    });

    test("should return RESOLVED_AFTER_SLA when resolved after deadline", () => {
      const createdAt = new Date(
        "2026-08-27T10:00:00.000Z"
      );

      const slaDeadline = new Date(
        "2026-08-27T18:00:00.000Z"
      );

      const resolutionDate = new Date(
        "2026-08-27T20:00:00.000Z"
      );

      expect(
        getSlaStatus(
          slaDeadline,
          "Resolved",
          createdAt,
          resolutionDate
        )
      ).toBe("RESOLVED_AFTER_SLA");
    });

    test("should return RESOLVED_WITHIN_SLA when resolved without resolution date", () => {
      const createdAt = new Date(
        "2026-08-27T10:00:00.000Z"
      );

      const slaDeadline = new Date(
        "2026-08-27T18:00:00.000Z"
      );

      expect(
        getSlaStatus(
          slaDeadline,
          "Resolved",
          createdAt
        )
      ).toBe("RESOLVED_WITHIN_SLA");
    });

    test("should return APPROACHING when less than 25% SLA time remains", () => {
      const createdAt = new Date(
        Date.now() - 7 * 60 * 60 * 1000
      );

      const slaDeadline = new Date(
        Date.now() + 1 * 60 * 60 * 1000
      );

      expect(
        getSlaStatus(
          slaDeadline,
          "Open",
          createdAt
        )
      ).toBe("APPROACHING");
    });

    test("should return BREACHED when current time is after deadline", () => {
      const createdAt = new Date(
        Date.now() - 10 * 60 * 60 * 1000
      );

      const slaDeadline = new Date(
        Date.now() - 1 * 60 * 60 * 1000
      );

      expect(
        getSlaStatus(
          slaDeadline,
          "Open",
          createdAt
        )
      ).toBe("BREACHED");
    });

    test("should return WITHIN_SLA when sufficient SLA time remains", () => {
      const createdAt = new Date(
        Date.now() - 2 * 60 * 60 * 1000
      );

      const slaDeadline = new Date(
        Date.now() + 6 * 60 * 60 * 1000
      );

      expect(
        getSlaStatus(
          slaDeadline,
          "Open",
          createdAt
        )
      ).toBe("WITHIN_SLA");
    });
  });
});