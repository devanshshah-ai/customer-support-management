const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  updateTeamStatus,
  deleteTeam,
  addMember,
  removeMember,
} = require("../services/teamService");

const {
  createTeamSchema,
  updateTeamSchema,
  updateTeamStatusSchema,
  addTeamMemberSchema,
} = require("../validators/teamValidator");

const create = async (req, res, next) => {
  try {
    const validationResult = createTeamSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const team = await createTeam(validationResult.data);

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      search,
      isActive,
      sortBy,
      sortOrder,
    } = req.query;

    let parsedIsActive;

    if (isActive !== undefined) {
      if (isActive === "true") {
        parsedIsActive = true;
      } else if (isActive === "false") {
        parsedIsActive = false;
      } else {
        const error = new Error(
          "isActive must be true or false"
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const result = await getTeams({
      page,
      limit,
      search,
      isActive: parsedIsActive,
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      message: "Teams retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const team = await getTeamById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Team retrieved successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const validationResult = updateTeamSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const team = await updateTeam(
      req.params.id,
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const validationResult =
      updateTeamStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const team = await updateTeamStatus(
      req.params.id,
      validationResult.data.isActive
    );

    return res.status(200).json({
      success: true,
      message: "Team status updated successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteTeam(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const addTeamMember = async (req, res, next) => {
  try {
    const validationResult =
      addTeamMemberSchema.safeParse(req.body);

    if (!validationResult.success) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validationResult.error.flatten();

      throw error;
    }

    const team = await addMember(
      req.params.id,
      validationResult.data.userId
    );

    return res.status(200).json({
      success: true,
      message: "Agent added to team successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeTeamMember = async (req, res, next) => {
  try {
    const team = await removeMember(
      req.params.id,
      req.params.userId
    );

    return res.status(200).json({
      success: true,
      message: "Agent removed from team successfully",
      data: {
        team,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  remove,
  addTeamMember,
  removeTeamMember,
};