const k8s = require("@kubernetes/client-node");
const gitlab = require("../gitlab/client");

async function k8sClientFactory(projectId) {
  console.log("Fetching k8s kubeconfig for project " + projectId);

  try {
    const { data: variables } = await gitlab.get(
      `/api/v4/projects/${projectId}/variables`
    );

    const kubeConfig = variables.find((v) => v.key === "KUBECONFIG");

    if (kubeConfig === undefined) {
      throw new Error("KUBECONFIG variable not found for project " + projectId);
    }

    console.log(
      "KUBECONFIG variable for project " + projectId + ": " + kubeConfig.value
    );

    const kc = new k8s.KubeConfig();
    kc.loadFromString(kubeConfig.value);

    return kc;
  } catch (err) {
    console.log("Error fetching k8s kubeconfig for project " + projectId);
    //console.log(err);
    return null;
  }
}

module.exports = k8sClientFactory;
