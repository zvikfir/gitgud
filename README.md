# GitGud 🚀

<p align="center">
  <img src="frontend/src/assets/logo.svg" alt="GitGud Logo" width="200" height="200" />
</p>


**Trust, but verify**

GitGud is an open-source DevOps compliance and best practices enforcement platform designed to streamline, automate, and scale DevOps adoption across your organization.

---

## 🌟 Introduction

GitGud transforms fragmented DevOps practices into unified, automated, and transparent workflows. It ensures your teams consistently follow best practices, enhancing real-time compliance, visibility, and collaboration across your entire development organization.

---

## 🎯 Motivation

Traditional DevOps approaches often face:

- **Siloed DevOps Practices:** Best practices are fragmented and inconsistently documented.
- **Lack of Visibility & Coverage:** Difficulty tracking adherence to standards across teams.
- **Slow & Manual Scaling:** Inefficient onboarding of teams to standardized practices.

GitGud addresses these challenges by offering real-time, automated, and scalable compliance enforcement directly integrated with your Git workflows.

---

## 📚 Features

### 🌀 Git-Driven Workflows

GitGud seamlessly integrates with GitLab webhooks to trigger policy execution based on Git operations, ensuring continuous adherence to best practices.

### 📊 Real-Time Visualization & Analytics

Track policy execution results and compliance status across all projects in real-time. Get immediate visibility and actionable insights into your organization's DevOps health.

### 📜 Policy as Code

Define policies as structured, version-controlled JavaScript handler scripts. Policies include:

- **Metadata:** Clearly documented goals and categorization.
- **Criteria:** Context-aware execution based on events, branch types, project lifecycles, file paths, repository types, programming languages, and more.
- **Compliance Mapping:** Leverage Large Language Models (LLMs) to automatically suggest relevant tags and align with industry standards such as ISO and SOC2.

### 🚧 Extensible & Customizable

Policy scripts receive rich contextual data, including information from:

- GitLab events
- Project details
- Integrated services and utilities

This ensures maximum adaptability and customization for your organization's unique needs.

---

## 🎬 GitGud in Action

See GitGud's capabilities through these visual demonstrations:

### Policy Management & Enforcement

Watch how GitGud policies are structured and enforced:

<p align="center">
  <img src="docs/gitgud-policies.gif" alt="GitGud Policies" width="800" />
</p>

### Project Onboarding & Management

See how easy it is to onboard and manage projects:

<p align="center">
  <img src="docs/gitgud-project-onboarding.gif" alt="Project Onboarding" width="800" />
  <img src="docs/gitgud-projects.gif" alt="Projects Management" width="800" />
</p>

### Policy Anatomy

Explore the comprehensive structure of GitGud policies:

<p align="center">
  <img src="docs/gitgud-policy-anatomy-policy-details.gif" alt="Policy Details" width="800" />
  <img src="docs/gitgud-policy-anatomy-policy-criteria.gif" alt="Policy Criteria" width="800" />
  <img src="docs/gitgud-policy-anatomy-handler-script.gif" alt="Handler Script" width="800" />
</p>

### Developer Experience

See how GitGud improves the developer workflow:

<p align="center">
  <img src="docs/gitgud-for-developers.gif" alt="GitGud for Developers" width="800" />
</p>

### Software Stack Support

GitGud works with a variety of software stacks:

<p align="center">
  <img src="docs/gitgud-software-stacks.gif" alt="Software Stacks Support" width="800" />
</p>

### Complete Workflow

View the entire GitGud workflow in action:

<p align="center">
  <img src="docs/gitgud-workflow.gif" alt="GitGud Workflow" width="800" />
</p>

---

## 🚀 How It Works

1. **Git Event Triggers:** GitLab webhook events trigger GitGud workflows.
2. **Policy Execution:** JavaScript handler scripts evaluate compliance based on event context and defined criteria.
3. **Real-Time Feedback:** Execution results are stored, analyzed, and displayed in an intuitive dashboard.
4. **Continuous Improvement:** Teams receive immediate feedback, encouraging consistent best practices adoption and quick remediation of compliance gaps.

<p align="center">
    <img src="docs/gitgud-how-it-works.gif" alt="How GitGud Works" width="800" />
</p>

---

## 🛠 Tech Stack

- **JavaScript:** Core scripting for policy definition.
- **Node.js:** Backend runtime for handling GitLab webhooks and policy execution.
- **PostgreSQL:** Persistent storage for analytics and execution results.
- **GitLab:** Integration with GitLab webhooks for seamless event-driven policy enforcement.
- **AI/LLM Integration:** Automated compliance tagging and standards alignment through intelligent models.

---

## 🔥 Quickstart Guide

### Requirements

- A local k8s cluster using [Docker Desktop](https://www.docker.com/products/docker-desktop/) (enable via Settings -> Kubernetes in versions > 28.x.x), [kind](https://kind.sigs.k8s.io), or [kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/).
- [Tilt](https://tilt.dev) for setting a dev environment on a local k8s cluster.
- [ngrok](https://www.google.com/search?client=safari&rls=en&q=ngrok&ie=UTF-8&oe=UTF-8) for ssh tunneling to allow TLS communication to GitLab.
  1. Go to the Ngrok website and download the version suitable for your operating system.
  2. Follow the instructions on creating a free new static domain.
  3. Update your .env file in the project's root with your GITGUD_NGROK_DOMAIN.
  4. Install an ingress controller on your local k8s cluster using: `helm upgrade --install --namespace kube-system nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx`

### Installation

```bash
# for ssh
git clone git@github.com:zvikfir/gitgud.git

# for https
git clone https://github.com/zvikfir/gitgud.git

cd gitgud

# npm install packages
(cd backend && npm i)
(cd frontend && npm i)

# configure env vars
cp .env.example .env

# manually set values appropriately


# run the system using tilt. By default, all services are deployed in k8s. Frontend and backend are run locally for faster SDLC.
tilt up

# after postgres is up and running run migrations from another terminal:
npm run migration:migrate
npm run migration:seed

```

## 💬 Contributing

We welcome contributions from the community! Feel free to open issues, submit pull requests, or provide feedback.

* Fork the repository.
* Create your feature branch (git checkout -b feature/my-feature).
* Commit your changes (git commit -m 'Add some feature').
* Push to your branch (git push origin feature/my-feature).
* Create a pull request.


## 🙌 Join Us!

Become part of a community committed to improving DevOps practices everywhere. Your contributions help make GitGud even better!


## 📄 License

GitGud is open-source software licensed under the Apache 2 License.


## 🧑‍💻 Maintainers
* <a href="https://github.com/itayw">Itay Weinberger</a> - Original project founder and maintainer
* <a href="https://github.com/zvikfir">Kfir Zvi</a>

🌐 Happy coding and keep improving!