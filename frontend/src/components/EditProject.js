import React from "react";
import { useParams } from "react-router-dom";
import ProjectForm from "../components/ProjectForm";

const EditProject = () => {
  const { projectId } = useParams(); // Assuming you're using react-router for routing

  return (
    <ProjectForm projectId={projectId} />
  );
};

export default EditProject;
