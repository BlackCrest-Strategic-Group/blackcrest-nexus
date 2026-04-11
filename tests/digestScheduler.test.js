/**
 * Unit tests for backend/services/digestScheduler.js
 *
 * Mocks the DB models and emailService so no real I/O is required.
 */

import { jest } from "@jest/globals";

// ---------------------------------------------------------------------------
// Mock node-cron
// ---------------------------------------------------------------------------
const mockSchedule = jest.fn();
jest.unstable_mockModule("node-cron", () => ({
  default: {
    validate: jest.fn(() => true),
    schedule: mockSchedule
  }
}));

// ---------------------------------------------------------------------------
// Mock EmailPreference model
// ---------------------------------------------------------------------------
const mockEmailPrefFind = jest.fn();
jest.unstable_mockModule("../backend/models/EmailPreference.js", () => ({
  default: {
    find: jest.fn(() => ({ lean: mockEmailPrefFind }))
  }
}));

// ---------------------------------------------------------------------------
// Mock User model
// ---------------------------------------------------------------------------
const mockUserFind = jest.fn();
jest.unstable_mockModule("../backend/models/User.js", () => ({
  default: {
    find: jest.fn(() => ({ lean: mockUserFind }))
  }
}));

// ---------------------------------------------------------------------------
// Mock emailService
// ---------------------------------------------------------------------------
const mockSendDailyDigest = jest.fn();
jest.unstable_mockModule("../backend/services/emailService.js", () => ({
  sendDailyDigest: mockSendDailyDigest
}));

// Load module under test AFTER all mocks are registered
const { startDigestScheduler, runDailyDigest } = await import(
  "../backend/services/digestScheduler.js"
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("startDigestScheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.DIGEST_CRON_SCHEDULE;
    delete process.env.DIGEST_TIMEZONE;
  });

  test("schedules the job with default cron and timezone when env vars are absent", () => {
    startDigestScheduler();

    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const [schedule, , opts] = mockSchedule.mock.calls[0];
    expect(schedule).toBe("0 7 * * *");
    expect(opts.timezone).toBe("America/New_York");
  });

  test("uses DIGEST_CRON_SCHEDULE and DIGEST_TIMEZONE from env", () => {
    process.env.DIGEST_CRON_SCHEDULE = "0 8 * * 1-5";
    process.env.DIGEST_TIMEZONE = "America/Chicago";

    startDigestScheduler();

    const [schedule, , opts] = mockSchedule.mock.calls[0];
    expect(schedule).toBe("0 8 * * 1-5");
    expect(opts.timezone).toBe("America/Chicago");
  });

  test("does NOT schedule if cron expression is invalid", async () => {
    const cron = (await import("node-cron")).default;
    cron.validate.mockReturnValueOnce(false);

    process.env.DIGEST_CRON_SCHEDULE = "NOT_VALID";
    startDigestScheduler();

    expect(mockSchedule).not.toHaveBeenCalled();
  });
});

describe("runDailyDigest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does nothing when there are no enabled preferences", async () => {
    mockEmailPrefFind.mockResolvedValue([]);

    await runDailyDigest();

    expect(mockSendDailyDigest).not.toHaveBeenCalled();
  });

  test("sends digest to each active user", async () => {
    const prefs = [{ user: "u1" }, { user: "u2" }];
    mockEmailPrefFind.mockResolvedValue(prefs);

    const users = [
      { _id: "u1", email: "a@example.com" },
      { _id: "u2", email: "b@example.com" }
    ];
    mockUserFind.mockResolvedValue(users);
    mockSendDailyDigest.mockResolvedValue({ messageId: "ok" });

    await runDailyDigest();

    expect(mockSendDailyDigest).toHaveBeenCalledTimes(2);
    expect(mockSendDailyDigest).toHaveBeenCalledWith(users[0]);
    expect(mockSendDailyDigest).toHaveBeenCalledWith(users[1]);
  });

  test("continues processing remaining users even if one send fails", async () => {
    mockEmailPrefFind.mockResolvedValue([{ user: "u1" }, { user: "u2" }]);
    mockUserFind.mockResolvedValue([
      { _id: "u1", email: "fail@example.com" },
      { _id: "u2", email: "ok@example.com" }
    ]);

    mockSendDailyDigest
      .mockRejectedValueOnce(new Error("SMTP error"))
      .mockResolvedValueOnce({ messageId: "ok" });

    // Should NOT throw even though one user's send fails
    await expect(runDailyDigest()).resolves.not.toThrow();

    expect(mockSendDailyDigest).toHaveBeenCalledTimes(2);
  });

  test("handles fatal DB error gracefully without throwing", async () => {
    mockEmailPrefFind.mockRejectedValue(new Error("DB connection lost"));

    await expect(runDailyDigest()).resolves.not.toThrow();
  });

  test("only sends digest to active users — inactive users are excluded at DB query level", async () => {
    // Two prefs exist, but the User.find query filters by isActive:true and returns only one user
    mockEmailPrefFind.mockResolvedValue([{ user: "u1" }, { user: "u2" }]);
    // Simulate DB returning only the active user
    mockUserFind.mockResolvedValue([{ _id: "u1", email: "active@example.com" }]);
    mockSendDailyDigest.mockResolvedValue({ messageId: "ok" });

    await runDailyDigest();

    // Only the one active user's digest should be sent
    expect(mockSendDailyDigest).toHaveBeenCalledTimes(1);
    expect(mockSendDailyDigest).toHaveBeenCalledWith({ _id: "u1", email: "active@example.com" });

    // Verify the User.find call included isActive:true in its filter
    const User = (await import("../backend/models/User.js")).default;
    const findCall = User.find.mock.calls[User.find.mock.calls.length - 1][0];
    expect(findCall).toMatchObject({ isActive: true });
  });
});
