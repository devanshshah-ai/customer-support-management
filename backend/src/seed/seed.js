const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Team = require("../models/Team");
const Customer = require("../models/Customer");
const ServiceRequest = require("../models/ServiceRequest");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const Counter = require("../models/Counter");

const MONGODB_URI = process.env.MONGODB_URI;

const PASSWORD = "Password@123";

const SLA_HOURS = {
  Critical: 4,
  High: 8,
  Medium: 24,
  Low: 48,
};

const calculateSlaDeadline = (severity, createdAt) => {
  const deadline = new Date(createdAt);

  deadline.setHours(
    deadline.getHours() + SLA_HOURS[severity]
  );

  return deadline;
};

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected.");

    /*
     * ==========================================
     * CLEAR EXISTING DATA
     * ==========================================
     */

    console.log("Clearing existing data...");

    await Message.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Counter.deleteMany({});
    await Team.deleteMany({});
    await Customer.deleteMany({});
    await User.deleteMany({});

    console.log("Existing data cleared.");

    /*
     * ==========================================
     * USERS
     * ==========================================
     */

    console.log("Creating users...");

    const hashedPassword = await bcrypt.hash(
      PASSWORD,
      12
    );

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },

      {
        name: "Manager User",
        email: "manager@example.com",
        password: hashedPassword,
        role: "manager",
        isActive: true,
      },

      {
        name: "Rahul Sharma",
        email: "rahul.agent@example.com",
        password: hashedPassword,
        role: "agent",
        isActive: true,
      },

      {
        name: "Priya Mehta",
        email: "priya.agent@example.com",
        password: hashedPassword,
        role: "agent",
        isActive: true,
      },

      {
        name: "Amit Verma",
        email: "amit.agent@example.com",
        password: hashedPassword,
        role: "agent",
        isActive: true,
      },

      {
        name: "Sneha Patel",
        email: "sneha.agent@example.com",
        password: hashedPassword,
        role: "agent",
        isActive: true,
      },

      {
        name: "Inactive Agent",
        email: "inactive.agent@example.com",
        password: hashedPassword,
        role: "agent",
        isActive: false,
      },
    ]);

    const admin = users.find(
      (user) => user.email === "admin@example.com"
    );

    const manager = users.find(
      (user) => user.email === "manager@example.com"
    );

    const rahul = users.find(
      (user) => user.email === "rahul.agent@example.com"
    );

    const priya = users.find(
      (user) => user.email === "priya.agent@example.com"
    );

    const amit = users.find(
      (user) => user.email === "amit.agent@example.com"
    );

    const sneha = users.find(
      (user) => user.email === "sneha.agent@example.com"
    );

    console.log(`${users.length} users created.`);

    /*
     * ==========================================
     * TEAMS
     * ==========================================
     */

    console.log("Creating teams...");

    const teams = await Team.insertMany([
      {
        name: "Technical Support",
        description:
          "Handles technical issues and product-related problems.",
        members: [
          rahul._id,
          priya._id,
        ],
        isActive: true,
      },

      {
        name: "Customer Success",
        description:
          "Handles customer account and general support requests.",
        members: [
          amit._id,
          sneha._id,
        ],
        isActive: true,
      },

      {
        name: "Billing Support",
        description:
          "Handles billing, payment and subscription issues.",
        members: [
          priya._id,
          amit._id,
        ],
        isActive: true,
      },

      {
        name: "Enterprise Support",
        description:
          "Dedicated support team for enterprise customers.",
        members: [
          rahul._id,
          sneha._id,
        ],
        isActive: true,
      },

      {
        name: "Inactive Team",
        description:
          "Example inactive team for testing filters.",
        members: [],
        isActive: false,
      },
    ]);

    const technicalTeam = teams.find(
      (team) => team.name === "Technical Support"
    );

    const customerSuccessTeam = teams.find(
      (team) => team.name === "Customer Success"
    );

    const billingTeam = teams.find(
      (team) => team.name === "Billing Support"
    );

    const enterpriseTeam = teams.find(
      (team) => team.name === "Enterprise Support"
    );

    console.log(`${teams.length} teams created.`);

    /*
     * ==========================================
     * CUSTOMERS
     * ==========================================
     */

    console.log("Creating customers...");

    const customers = await Customer.insertMany([
      {
        name: "Acme Corporation",
        email: "contact@acme.com",
        phone: "+91 9876543210",
        company: "Acme Corporation",
        location: "Mumbai, Maharashtra",
        customerType: "enterprise",
        accountStatus: "active",
      },

      {
        name: "Rohan Kapoor",
        email: "rohan.kapoor@example.com",
        phone: "+91 9876543211",
        company: "",
        location: "Delhi, India",
        customerType: "individual",
        accountStatus: "active",
      },

      {
        name: "TechNova Solutions",
        email: "support@technova.com",
        phone: "+91 9876543212",
        company: "TechNova Solutions",
        location: "Bangalore, Karnataka",
        customerType: "business",
        accountStatus: "active",
      },

      {
        name: "Neha Singh",
        email: "neha.singh@example.com",
        phone: "+91 9876543213",
        company: "",
        location: "Pune, Maharashtra",
        customerType: "individual",
        accountStatus: "active",
      },

      {
        name: "Global Retail Ltd",
        email: "help@globalretail.com",
        phone: "+91 9876543214",
        company: "Global Retail Ltd",
        location: "Hyderabad, Telangana",
        customerType: "business",
        accountStatus: "active",
      },

      {
        name: "Arjun Malhotra",
        email: "arjun.malhotra@example.com",
        phone: "+91 9876543215",
        company: "",
        location: "Chandigarh, India",
        customerType: "individual",
        accountStatus: "inactive",
      },

      {
        name: "FinServe Enterprises",
        email: "support@finserve.com",
        phone: "+91 9876543216",
        company: "FinServe Enterprises",
        location: "Gurgaon, Haryana",
        customerType: "enterprise",
        accountStatus: "active",
      },

      {
        name: "Kavya Iyer",
        email: "kavya.iyer@example.com",
        phone: "+91 9876543217",
        company: "",
        location: "Chennai, Tamil Nadu",
        customerType: "individual",
        accountStatus: "suspended",
      },
    ]);

    const acme = customers.find(
      (customer) =>
        customer.email === "contact@acme.com"
    );

    const rohan = customers.find(
      (customer) =>
        customer.email === "rohan.kapoor@example.com"
    );

    const technova = customers.find(
      (customer) =>
        customer.email === "support@technova.com"
    );

    const neha = customers.find(
      (customer) =>
        customer.email === "neha.singh@example.com"
    );

    const globalRetail = customers.find(
      (customer) =>
        customer.email === "help@globalretail.com"
    );

    const arjun = customers.find(
      (customer) =>
        customer.email === "arjun.malhotra@example.com"
    );

    const finserve = customers.find(
      (customer) =>
        customer.email === "support@finserve.com"
    );

    const kavya = customers.find(
      (customer) =>
        customer.email === "kavya.iyer@example.com"
    );

    console.log(
      `${customers.length} customers created.`
    );

    /*
     * ==========================================
     * SERVICE REQUESTS
     * ==========================================
     */

    console.log("Creating service requests...");

    const createRequest = ({
      number,
      customer,
      subject,
      description,
      category,
      severity,
      assignedTeam,
      assignedAgent,
      status,
      hoursAgo,
      resolutionHoursAgo = null,
      resolutionNote = "",
      slaHoursOverride = null,
    }) => {
      const createdAt = new Date();

      createdAt.setHours(
        createdAt.getHours() - hoursAgo
      );

      const slaHours =
        slaHoursOverride ||
        SLA_HOURS[severity];

      const slaDeadline = new Date(createdAt);

      slaDeadline.setHours(
        slaDeadline.getHours() + slaHours
      );

      let resolutionDate = null;

      if (resolutionHoursAgo !== null) {
        resolutionDate = new Date();

        resolutionDate.setHours(
          resolutionDate.getHours() -
            resolutionHoursAgo
        );
      }

      const finalResolutionNote =
        resolutionNote ||
        (status === "Resolved" || status === "Closed"
          ? `Resolved after investigation and verification. The outcome for "${subject}" was confirmed and communicated to the customer.`
          : "");

      return {
        requestNumber: number,
        customer: customer._id,
        subject,
        description,
        category,
        severity,
        assignedTeam: assignedTeam
          ? assignedTeam._id
          : null,
        assignedAgent: assignedAgent
          ? assignedAgent._id
          : null,
        status,
        resolutionDate,
        resolutionNote: finalResolutionNote,
        slaDeadline,
        createdAt,
      };
    };

    const requests = [
      /*
       * OPEN
       */

      createRequest({
        number: "SR-10001",
        customer: acme,
        subject:
          "Production server is unavailable",
        description:
          "Our production application is currently unavailable and customers cannot access the platform.",
        category: "Technical Issue",
        severity: "Critical",
        assignedTeam: technicalTeam,
        assignedAgent: rahul,
        status: "Open",
        hoursAgo: 2,
      }),

      /*
       * OPEN / HIGH
       */

      createRequest({
        number: "SR-10002",
        customer: rohan,
        subject:
          "Unable to access customer dashboard",
        description:
          "The dashboard keeps loading and never displays the customer information.",
        category: "Technical Issue",
        severity: "High",
        assignedTeam: technicalTeam,
        assignedAgent: priya,
        status: "Open",
        hoursAgo: 6,
      }),

      /*
       * UNDER INVESTIGATION
       */

      createRequest({
        number: "SR-10003",
        customer: technova,
        subject:
          "API integration returning errors",
        description:
          "Our API integration started returning 500 errors after the latest deployment.",
        category: "Technical Issue",
        severity: "High",
        assignedTeam: technicalTeam,
        assignedAgent: rahul,
        status: "Under Investigation",
        hoursAgo: 5,
      }),

      /*
       * WAITING FOR CUSTOMER
       */

      createRequest({
        number: "SR-10004",
        customer: neha,
        subject:
          "Payment verification required",
        description:
          "Payment was completed but additional verification information is required.",
        category: "Billing",
        severity: "Medium",
        assignedTeam: billingTeam,
        assignedAgent: amit,
        status: "Waiting for Customer",
        hoursAgo: 12,
      }),

      /*
       * RESOLVED WITHIN SLA
       */

      createRequest({
        number: "SR-10005",
        customer: globalRetail,
        subject:
          "Subscription upgrade issue",
        description:
          "Customer was unable to upgrade the subscription plan.",
        category: "Account",
        severity: "Medium",
        assignedTeam: customerSuccessTeam,
        assignedAgent: sneha,
        status: "Resolved",
        hoursAgo: 30,
        resolutionHoursAgo: 10,
      }),

      /*
       * RESOLVED AFTER SLA
       */

      createRequest({
        number: "SR-10006",
        customer: finserve,
        subject:
          "Critical transaction processing failure",
        description:
          "Critical transactions failed during processing and required immediate investigation.",
        category: "Technical Issue",
        severity: "Critical",
        assignedTeam: enterpriseTeam,
        assignedAgent: rahul,
        status: "Resolved",
        hoursAgo: 12,
        resolutionHoursAgo: 2,
      }),

      /*
       * CLOSED
       */

      createRequest({
        number: "SR-10007",
        customer: acme,
        subject:
          "Product information request",
        description:
          "Customer requested information regarding available product features.",
        category: "Product Information",
        severity: "Low",
        assignedTeam: customerSuccessTeam,
        assignedAgent: sneha,
        status: "Closed",
        hoursAgo: 72,
        resolutionHoursAgo: 50,
      }),

      /*
       * DELIVERY
       */

      createRequest({
        number: "SR-10008",
        customer: arjun,
        subject:
          "Delivery status not updated",
        description:
          "The delivery status has not changed for several days.",
        category: "Delivery",
        severity: "Medium",
        assignedTeam: customerSuccessTeam,
        assignedAgent: amit,
        status: "Open",
        hoursAgo: 20,
      }),

      /*
       * COMPLAINT
       */

      createRequest({
        number: "SR-10009",
        customer: kavya,
        subject:
          "Complaint regarding service quality",
        description:
          "Customer reported repeated service quality problems.",
        category: "Complaint",
        severity: "High",
        assignedTeam: enterpriseTeam,
        assignedAgent: sneha,
        status: "Under Investigation",
        hoursAgo: 7,
      }),

      /*
       * BILLING
       */

      createRequest({
        number: "SR-10010",
        customer: technova,
        subject:
          "Incorrect invoice amount",
        description:
          "The latest invoice contains an incorrect amount.",
        category: "Billing",
        severity: "Medium",
        assignedTeam: billingTeam,
        assignedAgent: priya,
        status: "Open",
        hoursAgo: 10,
      }),

      /*
       * ACCOUNT
       */

      createRequest({
        number: "SR-10011",
        customer: rohan,
        subject:
          "Unable to update account details",
        description:
          "Customer cannot update their account information.",
        category: "Account",
        severity: "Low",
        assignedTeam: customerSuccessTeam,
        assignedAgent: amit,
        status: "Waiting for Customer",
        hoursAgo: 25,
      }),

      /*
       * PRODUCT INFORMATION
       */

      createRequest({
        number: "SR-10012",
        customer: finserve,
        subject:
          "Question about enterprise features",
        description:
          "Customer requested information about enterprise-level features.",
        category: "Product Information",
        severity: "Low",
        assignedTeam: enterpriseTeam,
        assignedAgent: rahul,
        status: "Resolved",
        hoursAgo: 60,
        resolutionHoursAgo: 45,
      }),

      /*
       * AN UNASSIGNED REQUEST
       */

      createRequest({
        number: "SR-10013",
        customer: neha,
        subject:
          "General support request",
        description:
          "Customer submitted a general support request that has not yet been assigned.",
        category: "Complaint",
        severity: "Medium",
        assignedTeam: null,
        assignedAgent: null,
        status: "Open",
        hoursAgo: 3,
      }),

      /*
       * SLA BREACHED
       */

      createRequest({
        number: "SR-10014",
        customer: acme,
        subject:
          "Long running technical issue",
        description:
          "This request intentionally has an expired SLA for dashboard testing.",
        category: "Technical Issue",
        severity: "High",
        assignedTeam: technicalTeam,
        assignedAgent: priya,
        status: "Under Investigation",
        hoursAgo: 30,
      }),

      /*
       * CRITICAL SLA BREACH
       */

      createRequest({
        number: "SR-10015",
        customer: finserve,
        subject:
          "Critical service interruption",
        description:
          "This critical request intentionally exceeds the SLA deadline.",
        category: "Technical Issue",
        severity: "Critical",
        assignedTeam: enterpriseTeam,
        assignedAgent: rahul,
        status: "Open",
        hoursAgo: 10,
      }),

      createRequest({
        number: "SR-10016",
        customer: globalRetail,
        subject: "Refund not reflected on statement",
        description:
          "The approved refund has not appeared on the latest account statement.",
        category: "Billing",
        severity: "High",
        assignedTeam: billingTeam,
        assignedAgent: priya,
        status: "Under Investigation",
        hoursAgo: 4,
      }),

      createRequest({
        number: "SR-10017",
        customer: acme,
        subject: "SSO configuration assistance",
        description:
          "The enterprise customer needs help completing SSO configuration.",
        category: "Account",
        severity: "Medium",
        assignedTeam: enterpriseTeam,
        assignedAgent: rahul,
        status: "Waiting for Customer",
        hoursAgo: 18,
      }),

      createRequest({
        number: "SR-10018",
        customer: rohan,
        subject: "Mobile app feature availability",
        description:
          "Customer would like information about recently released mobile features.",
        category: "Product Information",
        severity: "Low",
        assignedTeam: customerSuccessTeam,
        assignedAgent: sneha,
        status: "Resolved",
        hoursAgo: 48,
        resolutionHoursAgo: 40,
      }),

      createRequest({
        number: "SR-10019",
        customer: technova,
        subject: "Webhook events delayed",
        description:
          "Webhook deliveries are arriving several minutes late during peak traffic.",
        category: "Technical Issue",
        severity: "Medium",
        assignedTeam: technicalTeam,
        assignedAgent: priya,
        status: "Open",
        hoursAgo: 3,
      }),

      createRequest({
        number: "SR-10020",
        customer: neha,
        subject: "Package delivered to wrong location",
        description:
          "The package status shows delivered but the customer did not receive it.",
        category: "Delivery",
        severity: "High",
        assignedTeam: customerSuccessTeam,
        assignedAgent: amit,
        status: "Under Investigation",
        hoursAgo: 5,
      }),

      createRequest({
        number: "SR-10021",
        customer: finserve,
        subject: "Monthly invoice export question",
        description:
          "Finance team needs help exporting monthly invoices for reconciliation.",
        category: "Billing",
        severity: "Low",
        assignedTeam: billingTeam,
        assignedAgent: amit,
        status: "Resolved",
        hoursAgo: 36,
        resolutionHoursAgo: 28,
      }),

      createRequest({
        number: "SR-10022",
        customer: kavya,
        subject: "Repeated login verification prompts",
        description:
          "Customer receives verification prompts on every login from a trusted device.",
        category: "Account",
        severity: "Medium",
        assignedTeam: customerSuccessTeam,
        assignedAgent: sneha,
        status: "Open",
        hoursAgo: 8,
      }),

      createRequest({
        number: "SR-10023",
        customer: globalRetail,
        subject: "Escalation about delayed response",
        description:
          "Enterprise customer requested escalation after a delayed support response.",
        category: "Complaint",
        severity: "High",
        assignedTeam: enterpriseTeam,
        assignedAgent: rahul,
        status: "Under Investigation",
        hoursAgo: 6,
      }),

      createRequest({
        number: "SR-10024",
        customer: acme,
        subject: "Delivery tracking API documentation",
        description:
          "Customer needs clarification on delivery tracking API response fields.",
        category: "Product Information",
        severity: "Low",
        assignedTeam: technicalTeam,
        assignedAgent: priya,
        status: "Closed",
        hoursAgo: 80,
        resolutionHoursAgo: 68,
      }),
    ];

    const savedRequests = await ServiceRequest.insertMany(requests);

    console.log(
      `${requests.length} service requests created.`
    );

    await Counter.create({
      _id: "serviceRequest",
      sequence: 10024,
    });

    const requestByNumber = Object.fromEntries(
      savedRequests.map((request) => [
        request.requestNumber,
        request,
      ])
    );

    /*
     * ==========================================
     * CONVERSATION HISTORY
     * ==========================================
     */

    const messages = await Message.insertMany([
      {
        request: requestByNumber["SR-10001"]._id,
        author: rahul._id,
        type: "customer",
        message:
          "We are investigating the production outage as a critical priority. Initial checks point to the application gateway.",
        createdAt: new Date(Date.now() - 75 * 60 * 1000),
      },
      {
        request: requestByNumber["SR-10001"]._id,
        author: rahul._id,
        type: "internal",
        message:
          "Escalated to infrastructure team. Keep the customer updated every 30 minutes.",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        request: requestByNumber["SR-10002"]._id,
        author: priya._id,
        type: "customer",
        message:
          "Thanks for the details. Could you confirm whether the issue occurs in an incognito browser as well?",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        request: requestByNumber["SR-10003"]._id,
        author: rahul._id,
        type: "internal",
        message:
          "The errors began after deployment v2.8. Comparing gateway logs with the previous release.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        request: requestByNumber["SR-10016"]._id,
        author: priya._id,
        type: "customer",
        message:
          "We have located the refund transaction and are checking the settlement timeline with billing.",
        createdAt: new Date(Date.now() - 90 * 60 * 1000),
      },
      {
        request: requestByNumber["SR-10020"]._id,
        author: amit._id,
        type: "customer",
        message:
          "We have opened a delivery trace and will update you as soon as the courier confirms the hand-off location.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ]);

    /*
     * ==========================================
     * NOTIFICATIONS
     * ==========================================
     */

    const notifications = await Notification.insertMany([
      {
        recipient: admin._id,
        type: "SLA_BREACHED",
        title: "SLA breach requires attention",
        message: "SR-10015 has exceeded its critical SLA target.",
        serviceRequest: requestByNumber["SR-10015"]._id,
        isRead: false,
      },
      {
        recipient: admin._id,
        type: "CRITICAL_REQUEST",
        title: "Critical request active",
        message: "SR-10001 is a critical production outage.",
        serviceRequest: requestByNumber["SR-10001"]._id,
        isRead: false,
      },
      {
        recipient: admin._id,
        type: "GENERAL",
        title: "Weekly support overview ready",
        message: "Dashboard metrics are ready for your weekly support review.",
        isRead: true,
        readAt: new Date(),
      },
      {
        recipient: manager._id,
        type: "SLA_BREACHED",
        title: "High priority SLA breach",
        message: "SR-10014 is still under investigation after its SLA deadline.",
        serviceRequest: requestByNumber["SR-10014"]._id,
        isRead: false,
      },
      {
        recipient: manager._id,
        type: "GENERAL",
        title: "Workload review",
        message: "Several agents have active high-priority requests to review.",
        isRead: false,
      },
      {
        recipient: rahul._id,
        type: "CRITICAL_REQUEST",
        title: "Critical request assigned",
        message: "SR-10015 requires immediate attention.",
        serviceRequest: requestByNumber["SR-10015"]._id,
        isRead: false,
      },
      {
        recipient: rahul._id,
        type: "REQUEST_ASSIGNED",
        title: "New request assigned",
        message: "SR-10023 has been assigned to you.",
        serviceRequest: requestByNumber["SR-10023"]._id,
        isRead: false,
      },
      {
        recipient: priya._id,
        type: "REQUEST_ASSIGNED",
        title: "New billing request assigned",
        message: "SR-10016 has been assigned to you.",
        serviceRequest: requestByNumber["SR-10016"]._id,
        isRead: false,
      },
      {
        recipient: priya._id,
        type: "REQUEST_ASSIGNED",
        title: "Technical request assigned",
        message: "SR-10019 has been assigned to you.",
        serviceRequest: requestByNumber["SR-10019"]._id,
        isRead: false,
      },
      {
        recipient: priya._id,
        type: "STATUS_CHANGED",
        title: "Request status updated",
        message: "SR-10024 has been closed.",
        serviceRequest: requestByNumber["SR-10024"]._id,
        isRead: true,
        readAt: new Date(),
      },
      {
        recipient: amit._id,
        type: "REQUEST_ASSIGNED",
        title: "Delivery issue assigned",
        message: "SR-10020 has been assigned to you.",
        serviceRequest: requestByNumber["SR-10020"]._id,
        isRead: false,
      },
      {
        recipient: sneha._id,
        type: "REQUEST_ASSIGNED",
        title: "Account request assigned",
        message: "SR-10022 has been assigned to you.",
        serviceRequest: requestByNumber["SR-10022"]._id,
        isRead: false,
      },
    ]);

    /*
     * ==========================================
     * AUDIT TRAIL
     * ==========================================
     */

    const auditLogs = await AuditLog.insertMany([
      {
        user: admin._id,
        action: "CREATE",
        entityType: "ServiceRequest",
        entityId: requestByNumber["SR-10001"]._id,
        description: "Seeded critical production support request.",
      },
      {
        user: manager._id,
        action: "ASSIGN",
        entityType: "ServiceRequest",
        entityId: requestByNumber["SR-10016"]._id,
        description: "Assigned refund investigation to Priya Mehta.",
      },
      {
        user: rahul._id,
        action: "NOTE_ADDED",
        entityType: "Message",
        entityId: messages[1]._id,
        description: "Added internal escalation note to SR-10001.",
      },
      {
        user: priya._id,
        action: "MESSAGE_ADDED",
        entityType: "Message",
        entityId: messages[2]._id,
        description: "Sent customer-facing response on SR-10002.",
      },
    ]);

    console.log(`${messages.length} messages created.`);
    console.log(`${notifications.length} notifications created.`);
    console.log(`${auditLogs.length} audit logs created.`);

    /*
     * ==========================================
     * SUMMARY
     * ==========================================
     */

    console.log("");
    console.log(
      "=========================================="
    );
    console.log("DATABASE SEED COMPLETED");
    console.log(
      "=========================================="
    );

    console.log("");
    console.log("LOGIN CREDENTIALS");
    console.log("------------------------------");

    console.log(
      "Admin   : admin@example.com"
    );

    console.log(
      "Manager : manager@example.com"
    );

    console.log(
      "Agent   : rahul.agent@example.com"
    );

    console.log(
      "Password: Password@123"
    );

    console.log("");
    console.log("DATA CREATED");
    console.log("------------------------------");
    console.log(`Users            : ${users.length}`);
    console.log(`Teams            : ${teams.length}`);
    console.log(`Customers        : ${customers.length}`);
    console.log(
      `Service Requests : ${requests.length}`
    );
    console.log(`Messages         : ${messages.length}`);
    console.log(`Notifications    : ${notifications.length}`);
    console.log(`Audit Logs       : ${auditLogs.length}`);

    console.log("");
    console.log(
      "MongoDB seed finished successfully."
    );
  } catch (error) {
    console.error("");
    console.error(
      "=========================================="
    );
    console.error("SEED FAILED");
    console.error(
      "=========================================="
    );

    console.error(error);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  }
};

seed();