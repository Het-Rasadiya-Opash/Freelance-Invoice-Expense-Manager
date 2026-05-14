import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

import apiRequest from "../../utils/apiRequest";
import CreateProject from "./CreateProject";
import GetAllProjects from "./GetAllProjects";

const Project = () => {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await apiRequest.get("/projects");
      setProjects(res.data.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 3,
        }}
      >
        {/* <Typography variant="h5" sx={{ fontWeight: 800, color: "#333" }}>
          Projects
        </Typography> */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{
            backgroundColor: "#14a800",
            color: "#ffffff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#108a00",
            },
          }}
        >
          Create Project
        </Button>
      </Box>

      <CreateProject
        open={open}
        handleClose={handleClose}
        projectToEdit={selectedProject}
        onRefresh={fetchProjects}
      />
      <GetAllProjects
        projects={projects}
        onEdit={handleEdit}
        onRefresh={fetchProjects}
      />
    </div>
  );
};

export default Project;
