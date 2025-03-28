const fs = require("fs");
const axios = require("axios");

// Assuming the projects.json file contains the generated projects from the previous step
const projects = JSON.parse(fs.readFileSync("projects.json", "utf-8"));

// Array of developers
const developers = [
  "Ethan Sharp",
  "Maya Palmer",
  "Lucas Fisher",
  "Sophia Reed",
  "Noah Blake",
  "Olivia Harper",
  "Liam Cross",
  "Isabella Quinn",
  "Jackson Hayes",
  "Emily Brooks",
  "Aiden Fox",
  "Ava Bennett",
  "Elijah Stone",
  "Lily Carter",
  "James Turner",
  "Grace Mitchell",
  "Alexander Lee",
  "Chloe Grant",
  "Samuel Knight",
  "Ella Cooper",
  "Henry Wolfe",
  "Amelia Hayes",
  "William Parker",
  "Mia Hughes",
  "Daniel Pierce",
  "Scarlett Morgan",
  "Benjamin Cole",
  "Victoria Hayes",
  "Jacob Webb",
  "Zoe Marshall",
];

// Function to select a random project
function getRandomProject() {
  const randomIndex = Math.floor(Math.random() * projects.length);
  return projects[randomIndex];
}

// Function to select random developers based on the number of contributors
function getRandomDevelopers(contributorCount) {
  const selectedDevelopers = [];
  const availableDevelopers = [...developers]; // Clone the array to avoid modifying the original

  for (let i = 0; i < contributorCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableDevelopers.length);
    selectedDevelopers.push(availableDevelopers.splice(randomIndex, 1)[0]);
  }

  return selectedDevelopers;
}

// Function to generate a sample JSON structure for a project
function generateSampleJson() {
  const project = getRandomProject();
  const selectedDevelopers = getRandomDevelopers(project.contributors);

  const sampleJson = {
    fake: true,
    object_kind: "push",
    event_name: "push",
    ref: "refs/heads/main",
    user_id: 1,
    user_name: "Administrator",
    user_username: "root",
    user_email: "",
    user_avatar:
      "https://secure.gravatar.com/avatar/3e01639b2553bab1d9a8ffa988ff939f688b98948ec32df950ead8f2d0b47d19?s=80&d=identicon",
    project_id: project.id,
    project: {
      id: project.id,
      name: project.name,
      description: `${project.name} project for ${project.stack_name} stack`,
      web_url: `https://gitlab.example.com/${project.stack_name}/${project.name}`,
      avatar_url: null,
      git_ssh_url: `git@gitlab.example.com:${project.stack_name}/${project.name}.git`,
      git_http_url: `https://gitlab.example.com/${project.stack_name}/${project.name}.git`,
      namespace: project.stack_name,
      visibility_level: 0,
      path_with_namespace: `${project.stack_name}/${project.name}`,
      default_branch: "main",
      ci_config_path: null,
      homepage: `https://gitlab.example.com/${project.stack_name}/${project.name}`,
      url: `git@gitlab.example.com:${project.stack_name}/${project.name}.git`,
      ssh_url: `git@gitlab.example.com:${project.stack_name}/${project.name}.git`,
      http_url: `https://gitlab.example.com/${project.stack_name}/${project.name}.git`,
      members: selectedDevelopers.map((developer) => ({
        id: Math.floor(Math.random() * 1000),
        name: developer,
        username: developer.toLowerCase().replace(" ", "_"),
        state: "active",
        avatar_url: `https://secure.gravatar.com/avatar/${Math.floor(
          Math.random() * 1000
        )}?s=80&d=identicon`,
      })),
    },
  };

  return sampleJson;
}

// Function to send a POST request to the specified webhook URL
async function postToWebhook(data, url) {
  try {
    const response = await axios.post(url, data, {
      headers: {
        "x-gitlab-event-uuid": Math.random().toString(36).substring(7), // Generate a random UUID
      },
    });
    console.log(`Event posted successfully: ${response.status}`);
  } catch (error) {
    console.error(`Error posting event: ${error.message}`);
  }
}

// Function to generate and send events
async function generateAndSendEvents(numberOfEvents, webhookUrl) {
  for (let i = 0; i < numberOfEvents; i++) {
    const eventJson = generateSampleJson();
    await postToWebhook(eventJson, webhookUrl);
  }
}

// Number of events to generate and the webhook URL
const numberOfEvents = 100; // Set this to the desired number of events
const webhookUrl = "https://climbing-yearly-teal.ngrok-free.app/gitlab/webhook"; // Replace with the actual URL

// Run the function to generate and send events
generateAndSendEvents(numberOfEvents, webhookUrl);
