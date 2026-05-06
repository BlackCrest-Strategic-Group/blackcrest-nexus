/**
 * Role Dashboard Routes  –  /api/dashboard
 * Returns aggregated KPIs tailored to each govcon role:
 *   capture | procurement | ops | exec
 */

import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import Opportunity from "../models/Opportunity.js";
import Workflow from "../models/Workflow.js";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";

const router = express.Router();

// ── GET /api/dashboard/capture ────────────────────────────────────
router.get("/capture", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [saved, workflows, recentSaved] = await Promise.all([
      Opportunity.countDocuments({ savedBy: userId }),
      Workflow.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
        type: "capture",
        status: "active"
      }),
      Opportunity.find({ savedBy: userId })
        .sort({ postedDate: -1 })
        .limit(5)
        .select("title agency responseDeadLine bidScore recommendation naicsCode")
    ]);

    // Win probability distribution (based on bid scores)
    const scoreDistribution = await Opportunity.aggregate([
      { $match: { savedBy: userId, bidScore: { $ne: null } } },
      {
        $bucket: {
          groupBy: "$bidScore",
          boundaries: [0, 40, 60, 75, 101],
          default: "no_score",
          output: { count: { $sum: 1 }, label: { $first: "$recommendation" } }
        }
      }
    ]);

    res.json({
      success: true,
      role: "capture",
      kpis: {
        savedOpportunities: saved,
        activeWorkflows: workflows,
        pipelineValue: saved * 250000
      },
      scoreDistribution,
      recentOpportunities: recentSaved
    });
  } catch (err) {
    console.error("Capture dashboard error:", err.message);
    res.status(500).json({ success: false, error: "Failed to load capture dashboard." });
  }
});

// ── GET /api/dashboard/procurement ───────────────────────────────
router.get("/procurement", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [activeWorkflows, suppliers, pendingTasks] = await Promise.all([
      Workflow.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
        type: "procurement",
        status: "active"
      }),
      Supplier.countDocuments({ status: "active" }),
      Workflow.aggregate([
        {
          $match: {
            $or: [{ owner: userId }, { members: userId }],
            status: "active"
          }
        },
        { $unwind: "$tasks" },
        {
          $match: {
            $or: [
              { "tasks.assignedTo": userId },
              { "tasks.status": { $in: ["pending", "in_progress"] } }
            ]
          }
        },
        { $count: "total" }
      ])
    ]);

    const supplierSummary = await Supplier.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, avgScore: { $avg: "$overallScore" } } }
    ]);

    const sourcingWorkflowStages = [
      { name: "Draft", count: 3 },
      { name: "Supplier Outreach", count: 4 },
      { name: "Quotes Received", count: 5 },
      { name: "Evaluation", count: 2 },
      { name: "Awarded", count: 2 },
      { name: "Closed", count: 6 }
    ];

    res.json({
      success: true,
      role: "procurement",
      kpis: {
        activeWorkflows,
        activeSuppliers: suppliers,
        pendingTasks: pendingTasks[0]?.total ?? 0
      },
      supplierSummary,
      sourcingAnalytics: {
        savingsIdentified: "$482,000",
        cycleTime: "34 days",
        activeProjects: 14,
        supplierParticipation: "78%"
      },
      sourcingEventForm: {
        title: "FY26 Tactical Comms Equipment Sourcing",
        category: "Communications Hardware",
        estimatedValue: "$1,850,000",
        dueDate: "2026-06-18",
        supplierTargets: "8 qualified suppliers (small business + SDVOSB mix)",
        attachments: "SOW_v4.pdf, Compliance_Matrix.xlsx"
      },
      sourcingWorkflowStages,
      sourcingEvents: [
        { id: "SE-1042", title: "Secure Router Refresh", category: "Network Infrastructure", dueDate: "2026-05-29", stage: "Evaluation" },
        { id: "SE-1043", title: "Field Sensor Kit Rebid", category: "IoT Devices", dueDate: "2026-06-04", stage: "Supplier Outreach" },
        { id: "SE-1044", title: "Command Center Video Wall", category: "AV Systems", dueDate: "2026-06-12", stage: "Quotes Received" }
      ],
      rfqManagement: [
        { id: "RFQ-4408", title: "Encrypted Handheld Radios", dueDate: "2026-05-20", suppliersInvited: 9, responsesReceived: 7 },
        { id: "RFQ-4415", title: "Satellite Uplink Services", dueDate: "2026-05-24", suppliersInvited: 6, responsesReceived: 4 },
        { id: "RFQ-4421", title: "Ruggedized Laptop Fleet", dueDate: "2026-05-28", suppliersInvited: 10, responsesReceived: 8 }
      ],
      quoteAnalysis: [
        { id: "Q-991", supplier: "Aegis Dynamics", quoteValue: "$612,000", varianceVsTarget: "-4.8%", confidence: "High" },
        { id: "Q-992", supplier: "Frontier Signal Works", quoteValue: "$648,500", varianceVsTarget: "+1.0%", confidence: "Medium" },
        { id: "Q-993", supplier: "NorthBridge Defense Tech", quoteValue: "$605,750", varianceVsTarget: "-5.7%", confidence: "High" }
      ],
      supplierComparison: [
        { supplier: "Aegis Dynamics", leadTime: "21 days", quoteValue: "$612,000", riskScore: 28, certifications: "ISO 9001, AS9100", region: "Mid-Atlantic", performanceScore: 92 },
        { supplier: "Frontier Signal Works", leadTime: "27 days", quoteValue: "$648,500", riskScore: 36, certifications: "ISO 9001, CMMC L2", region: "Southeast", performanceScore: 87 },
        { supplier: "NorthBridge Defense Tech", leadTime: "19 days", quoteValue: "$605,750", riskScore: 24, certifications: "AS9100, ITAR", region: "Midwest", performanceScore: 94 }
      ],
      sourcingRecommendations: [
        "Advance NorthBridge Defense Tech to final negotiations based on best value and lowest risk profile.",
        "Keep Aegis Dynamics as competitive fallback and request alternate pricing on maintenance options.",
        "Escalate Frontier Signal Works for regional redundancy coverage despite higher quote value."
      ]
    });
  } catch (err) {
    console.error("Procurement dashboard error:", err.message);
    res.status(500).json({ success: false, error: "Failed to load procurement dashboard." });
  }
});

// ── GET /api/dashboard/ops ────────────────────────────────────────
router.get("/ops", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [total, active, completed, paused] = await Promise.all([
      Workflow.countDocuments({ $or: [{ owner: userId }, { members: userId }] }),
      Workflow.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
        status: "active"
      }),
      Workflow.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
        status: "completed"
      }),
      Workflow.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
        status: "paused"
      })
    ]);

    // Task completion rate
    const taskStats = await Workflow.aggregate([
      { $match: { $or: [{ owner: userId }, { members: userId }], status: "active" } },
      { $unwind: { path: "$tasks", preserveNullAndEmpty: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$tasks.status", "completed"] }, 1, 0] }
          }
        }
      }
    ]);

    const taskData = taskStats[0] || { total: 0, completed: 0 };
    const completionRate =
      taskData.total > 0 ? Math.round((taskData.completed / taskData.total) * 100) : 0;

    res.json({
      success: true,
      role: "ops",
      kpis: {
        totalWorkflows: total,
        activeWorkflows: active,
        completedWorkflows: completed,
        pausedWorkflows: paused,
        taskCompletionRate: completionRate
      },
      taskStats: taskData
    });
  } catch (err) {
    console.error("Ops dashboard error:", err.message);
    res.status(500).json({ success: false, error: "Failed to load ops dashboard." });
  }
});

// ── GET /api/dashboard/exec ───────────────────────────────────────
router.get("/exec", authenticateToken, async (req, res) => {
  try {
    const [totalUsers, totalOpps, totalSuppliers, workflowSummary] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Opportunity.countDocuments(),
      Supplier.countDocuments(),
      Workflow.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    const supplierScore = await Supplier.aggregate([
      { $match: { overallScore: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$overallScore" }, count: { $sum: 1 } } }
    ]);

    // Opportunities by agency (top 5)
    const topAgencies = await Opportunity.aggregate([
      { $group: { _id: "$agency", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      role: "exec",
      kpis: {
        totalUsers,
        totalOpportunities: totalOpps,
        totalSuppliers,
        avgSupplierScore: Math.round(supplierScore[0]?.avg ?? 0)
      },
      workflowSummary,
      topAgencies
    });
  } catch (err) {
    console.error("Exec dashboard error:", err.message);
    res.status(500).json({ success: false, error: "Failed to load exec dashboard." });
  }
});

export default router;
