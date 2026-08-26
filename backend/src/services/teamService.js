const mongoose = require("mongoose");

const Team = require("../models/Team");
const User = require("../models/User");
const { ROLES } = require("../constants/auth");

const sanitizeTeam = (team) => {
  return {
    id: team._id,
    name: team.name,
    description: team.description,
    members: team.members,
    isActive: team.isActive,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
};

const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

const validateAgentIds = async (memberIds) => {
  if (!memberIds || memberIds.length === 0) {
    return [];
  }

  const uniqueMemberIds = [...new Set(memberIds)];

  uniqueMemberIds.forEach((id) => {
    validateObjectId(id, "member ID");
  });

  const users = await User.find({
    _id: { $in: uniqueMemberIds },
  }).select("_id role isActive");

  if (users.length !== uniqueMemberIds.length) {
    const error = new Error("One or more members were not found");
    error.statusCode = 404;
    throw error;
  }

  const nonAgents = users.filter(
    (user) => user.role !== ROLES.AGENT
  );

  if (nonAgents.length > 0) {
    const error = new Error(
      "Only support agents can be added to a team"
    );
    error.statusCode = 400;
    throw error;
  }

  const inactiveAgents = users.filter(
    (user) => !user.isActive
  );

  if (inactiveAgents.length > 0) {
    const error = new Error(
      "Inactive agents cannot be added to a team"
    );
    error.statusCode = 400;
    throw error;
  }

  return uniqueMemberIds;
};

const createTeam = async ({
  name,
  description = "",
  members = [],
  isActive = true,
}) => {
  const normalizedName = name.trim();

  const existingTeam = await Team.findOne({
    name: {
      $regex: `^${normalizedName}$`,
      $options: "i",
    },
  });

  if (existingTeam) {
    const error = new Error(
      "A team with this name already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  const validatedMembers = await validateAgentIds(members);

  const team = await Team.create({
    name: normalizedName,
    description: description.trim(),
    members: validatedMembers,
    isActive,
  });

  await team.populate({
    path: "members",
    select: "name email role isActive",
  });

  return sanitizeTeam(team);
};

const getTeams = async ({
  page = 1,
  limit = 10,
  search = "",
  isActive,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * pageLimit;

  const query = {};

  if (search && search.trim()) {
    query.$or = [
      {
        name: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        description: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  if (typeof isActive === "boolean") {
    query.isActive = isActive;
  }

  const allowedSortFields = [
    "name",
    "createdAt",
    "updatedAt",
    "isActive",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const safeSortOrder = sortOrder === "asc" ? 1 : -1;

  const [teams, totalTeams] = await Promise.all([
    Team.find(query)
      .populate({
        path: "members",
        select: "name email role isActive",
      })
      .sort({
        [safeSortBy]: safeSortOrder,
      })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    Team.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalTeams / pageLimit);

  return {
    teams: teams.map(sanitizeTeam),
    pagination: {
      currentPage,
      pageLimit,
      totalTeams,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getTeamById = async (teamId) => {
  validateObjectId(teamId, "team ID");

  const team = await Team.findById(teamId)
    .populate({
      path: "members",
      select: "name email role isActive",
    })
    .lean();

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeTeam(team);
};

const updateTeam = async (teamId, updates) => {
  validateObjectId(teamId, "team ID");

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  if (updates.name !== undefined) {
    const normalizedName = updates.name.trim();

    const duplicateTeam = await Team.findOne({
      name: {
        $regex: `^${normalizedName}$`,
        $options: "i",
      },
      _id: {
        $ne: teamId,
      },
    });

    if (duplicateTeam) {
      const error = new Error(
        "A team with this name already exists"
      );
      error.statusCode = 409;
      throw error;
    }

    team.name = normalizedName;
  }

  if (updates.description !== undefined) {
    team.description = updates.description.trim();
  }

  if (updates.isActive !== undefined) {
    team.isActive = updates.isActive;
  }

  await team.save();

  await team.populate({
    path: "members",
    select: "name email role isActive",
  });

  return sanitizeTeam(team);
};

const updateTeamStatus = async (teamId, isActive) => {
  validateObjectId(teamId, "team ID");

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  team.isActive = isActive;

  await team.save();

  await team.populate({
    path: "members",
    select: "name email role isActive",
  });

  return sanitizeTeam(team);
};

const deleteTeam = async (teamId) => {
  validateObjectId(teamId, "team ID");

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  await Team.findByIdAndDelete(teamId);

  return {
    id: team._id,
  };
};

const addMember = async (teamId, userId) => {
  validateObjectId(teamId, "team ID");
  validateObjectId(userId, "user ID");

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(userId).select(
    "_id name email role isActive"
  );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== ROLES.AGENT) {
    const error = new Error(
      "Only support agents can be added to a team"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error(
      "Inactive agents cannot be added to a team"
    );
    error.statusCode = 400;
    throw error;
  }

  const alreadyMember = team.members.some(
    (memberId) => memberId.toString() === userId
  );

  if (alreadyMember) {
    const error = new Error(
      "User is already a member of this team"
    );
    error.statusCode = 409;
    throw error;
  }

  team.members.push(userId);

  await team.save();

  await team.populate({
    path: "members",
    select: "name email role isActive",
  });

  return sanitizeTeam(team);
};

const removeMember = async (teamId, userId) => {
  validateObjectId(teamId, "team ID");
  validateObjectId(userId, "user ID");

  const team = await Team.findById(teamId);

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  const memberIndex = team.members.findIndex(
    (memberId) => memberId.toString() === userId
  );

  if (memberIndex === -1) {
    const error = new Error(
      "User is not a member of this team"
    );
    error.statusCode = 404;
    throw error;
  }

  team.members.splice(memberIndex, 1);

  await team.save();

  await team.populate({
    path: "members",
    select: "name email role isActive",
  });

  return sanitizeTeam(team);
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  updateTeamStatus,
  deleteTeam,
  addMember,
  removeMember,
};