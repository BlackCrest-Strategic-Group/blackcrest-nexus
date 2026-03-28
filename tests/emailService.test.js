/**
 * Unit tests for backend/services/emailService.js — sendDailyDigest
 *
 * Uses Jest's unstable_mockModule to mock the ESM dependencies so we can
 * control what the DB returns and what nodemailer does without needing a
 * live MongoDB or SMTP server.
 */

import { jest } from "@jest/globals";

// ---------------------------------------------------------------------------
// Mock nodemailer
// ---------------------------------------------------------------------------
const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-msg-id" });
jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn(() => ({ sendMail: mockSendMail }))
  }
}));

// ---------------------------------------------------------------------------
// Mock EmailPreference model
// ---------------------------------------------------------------------------
const mockFindOnePref = jest.fn();
const mockFindOneAndUpdatePref = jest.fn().mockResolvedValue({});
jest.unstable_mockModule("../backend/models/EmailPreference.js", () => ({
  default: {
    findOne: mockFindOnePref,
    findOneAndUpdate: mockFindOneAndUpdatePref
  }
}));

// ---------------------------------------------------------------------------
// Mock Opportunity model
// ---------------------------------------------------------------------------
const mockOpportunityFind = jest.fn();
jest.unstable_mockModule("../backend/models/Opportunity.js", () => ({
  default: {
    find: jest.fn(() => ({
      sort: jest.fn(() => ({
        limit: mockOpportunityFind
      }))
    }))
  }
}));

// Load the module under test AFTER mocks are set up
const { sendDailyDigest } = await import("../backend/services/emailService.js");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeUser(overrides = {}) {
  return {
    _id: "user123",
    email: "test@example.com",
    name: "Test User",
    naicsCodes: [],
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("sendDailyDigest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GMAIL_USER = "test@gmail.com";
    process.env.GMAIL_PASSWORD = "secret";
  });

  afterEach(() => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_PASSWORD;
    delete process.env.EMAIL_FROM;
  });

  test("throws when user object is missing required fields", async () => {
    await expect(sendDailyDigest(null)).rejects.toThrow(
      "sendDailyDigest: invalid user object (must have _id and email)"
    );
    await expect(sendDailyDigest({ _id: "abc" })).rejects.toThrow(
      "sendDailyDigest: invalid user object (must have _id and email)"
    );
    await expect(sendDailyDigest({ email: "a@b.com" })).rejects.toThrow(
      "sendDailyDigest: invalid user object (must have _id and email)"
    );
  });

  test("sends an email and returns messageId", async () => {
    mockFindOnePref.mockResolvedValue({ naicsFilter: [], minBidScore: 0 });
    mockOpportunityFind.mockResolvedValue([]);

    const result = await sendDailyDigest(makeUser());

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ messageId: "test-msg-id" });
  });

  test("includes user name in the digest HTML", async () => {
    mockFindOnePref.mockResolvedValue({ naicsFilter: [], minBidScore: 0 });
    mockOpportunityFind.mockResolvedValue([]);

    await sendDailyDigest(makeUser({ name: "Alice" }));

    const htmlArg = mockSendMail.mock.calls[0][0].html;
    expect(htmlArg).toContain("Alice");
  });

  test("falls back to user.email when name is missing", async () => {
    mockFindOnePref.mockResolvedValue(null);
    mockOpportunityFind.mockResolvedValue([]);

    const user = makeUser({ name: undefined });
    await sendDailyDigest(user);

    const htmlArg = mockSendMail.mock.calls[0][0].html;
    expect(htmlArg).toContain(user.email);
  });

  test("combines naicsFilter from prefs with naicsCodes from user profile", async () => {
    mockFindOnePref.mockResolvedValue({ naicsFilter: ["541511"], minBidScore: 0 });
    mockOpportunityFind.mockResolvedValue([]);

    const user = makeUser({ naicsCodes: ["236220"] });
    await sendDailyDigest(user);

    // The $or clause should contain the union of both sets
    const Opportunity = (await import("../backend/models/Opportunity.js")).default;
    const findCall = Opportunity.find.mock.calls[0][0];
    const naicsInOr = findCall.$or.find((c) => c.naicsCode)?.$or ??
      findCall.$or.find((c) => c.naicsCode)?.naicsCode?.$in;
    // Check both codes appear somewhere in the query
    const queryStr = JSON.stringify(findCall);
    expect(queryStr).toContain("541511");
    expect(queryStr).toContain("236220");
  });

  test("updates lastSentAt after sending", async () => {
    mockFindOnePref.mockResolvedValue({ naicsFilter: [], minBidScore: 0 });
    mockOpportunityFind.mockResolvedValue([]);

    await sendDailyDigest(makeUser());

    expect(mockFindOneAndUpdatePref).toHaveBeenCalledWith(
      { user: "user123" },
      { lastSentAt: expect.any(Date) },
      { upsert: true }
    );
  });

  test("throws when email transport is not configured", async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_PASSWORD;
    delete process.env.SENDGRID_API_KEY;

    await expect(sendDailyDigest(makeUser())).rejects.toThrow(
      "Email not configured"
    );
  });
});
