const SavedQueryController = require("../controllers/SavedQueryController");
const ProjectController = require("../controllers/ProjectController");
const TeamController = require("../controllers/TeamController");
const verifyToken = require("../modules/verifyToken");
const accessControl = require("../modules/accessControl");

module.exports = (app) => {
  const savedQueryController = new SavedQueryController();
  const projectController = new ProjectController();
  const teamController = new TeamController();

  /*
  ** Route to get all the saved queries in a project
  */
  app.get("/project/:project_id/savedQuery", verifyToken, (req, res) => {
    return projectController.findById(req.params.project_id)
      .then((project) => {
        return teamController.getTeamRole(project.team_id, req.user.id);
      })
      .then((teamRole) => {
        const permission = accessControl.can(teamRole.role).readAny("savedQuery");
        if (!permission.granted) {
          throw new Error(401);
        }
        return savedQueryController.findByProject(req.params.project_id, req.query.type);
      })
      .then((savedQueries) => {
        return res.status(200).send(savedQueries);
      })
      .catch((error) => {
        if (error.message === "401") {
          return res.status(401).send({ error: "Not authorized" });
        }

        return res.status(400).send(error);
      });
  });
  // --------------------------------------------------------

  /*
  ** Route to create a new savedQuery
  */
  app.post("/project/:project_id/savedQuery", verifyToken, (req, res) => {
    return projectController.findById(req.params.project_id)
      .then((project) => {
        return teamController.getTeamRole(project.team_id, req.user.id);
      })
      .then((teamRole) => {
        const permission = accessControl.can(teamRole.role).createAny("savedQuery");
        if (!permission.granted) {
          throw new Error(401);
        }

        const newSavedQuery = req.body;
        newSavedQuery.project_id = req.params.project_id;
        newSavedQuery.user_id = req.user.id;

        return savedQueryController.create(newSavedQuery);
      })
      .then((savedQuery) => {
        return res.status(200).send(savedQuery);
      })
      .catch((error) => {
        if (error.message === "401") {
          return res.status(401).send({ error: "Not authorized" });
        }

        return res.status(400).send(error);
      });
  });
  // --------------------------------------------------------

  /*
  ** Route to update a savedQuery
  */
  app.put("/project/:project_id/savedQuery/:id", verifyToken, (req, res) => {
    return projectController.findById(req.params.project_id)
      .then((project) => {
        return teamController.getTeamRole(project.team_id, req.user.id);
      })
      .then((teamRole) => {
        const permission = accessControl.can(teamRole.role).updateAny("savedQuery");
        if (!permission.granted) {
          throw new Error(401);
        }

        const newSavedQuery = req.body;
        newSavedQuery.project_id = req.params.project_id;
        newSavedQuery.user_id = req.user.id;

        return savedQueryController.update(req.params.id, newSavedQuery);
      })
      .then((savedQuery) => {
        return res.status(200).send(savedQuery);
      })
      .catch((error) => {
        if (error.message === "401") {
          return res.status(401).send({ error: "Not authorized" });
        }
        return res.status(400).send(error);
      });
  });
  // --------------------------------------------------------

  /*
  ** Remove a savedQuery
  */
  app.delete("/project/:project_id/savedQuery/:id", verifyToken, (req, res) => {
    return projectController.findById(req.params.project_id)
      .then((project) => {
        return teamController.getTeamRole(project.team_id, req.user.id);
      })
      .then((teamRole) => {
        const permission = accessControl.can(teamRole.role).updateAny("savedQuery");
        if (!permission.granted) {
          throw new Error(401);
        }

        return savedQueryController.remove(req.params.id);
      })
      .then((resp) => {
        return res.status(200).send(resp);
      })
      .catch((error) => {
        if (error.message === "401") {
          return res.status(401).send({ error: "Not authorized" });
        }

        return res.status(400).send(error);
      });
  });
  // --------------------------------------------------------

  return (req, res, next) => {
    next();
  };
};
