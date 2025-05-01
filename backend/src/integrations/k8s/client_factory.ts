import k8s from "@kubernetes/client-node";
import gitlab from "../gitlab/client";

async function k8sClientFactory(projectId: string): Promise<k8s.KubeConfig | null> {
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

export default k8sClientFactory;
