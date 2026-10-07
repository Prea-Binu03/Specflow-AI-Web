import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProjectHistory() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userId =
    storedUser?._id ||
    storedUser?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!userId) {
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/projects/user/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || "Unable to load projects"
          );
          return;
        }

        setProjects(
          Array.isArray(data) ? data : []
        );

      } catch (error) {
        console.error(
          "Project History Error:",
          error
        );
      }
    };

    fetchProjects();
  }, [userId]);

  return (
    <div className="project-history">

      <div className="history-title">
        PROJECT HISTORY
      </div>

      {projects.length === 0 ? (

        <div className="history-empty">
          <div className="history-empty-icon">
            ＋
          </div>

          <p>No projects yet</p>

          <span>
            Your generated projects
            <br />
            will appear here.
          </span>
        </div>

      ) : (

        <div className="history-list">

          {projects.slice(0, 5).map((project) => (

            <button
              key={project._id}
              type="button"
              className="history-project"
              onClick={() =>
                navigate(
                  `/project/${project._id}`
                )
              }
            >

              <span className="history-project-icon">
                ✦
              </span>

              <span className="history-project-name">
                {project.projectName}
              </span>

            </button>

          ))}

        </div>

      )}

    </div>
  );
}

export default ProjectHistory;