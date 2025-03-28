// Sample TV shows and corresponding heroes
const tvShows = {
    "Breaking Bad": ["Walter White", "Jesse Pinkman", "Saul Goodman", "Gus Fring"],
    "Game of Thrones": ["Jon Snow", "Daenerys Targaryen", "Arya Stark", "Tyrion Lannister"],
    "Stranger Things": ["Eleven", "Mike Wheeler", "Dustin Henderson", "Lucas Sinclair"],
    "The Mandalorian": ["Din Djarin", "Grogu", "Cara Dune", "Greef Karga"],
    "Friends": ["Ross Geller", "Rachel Green", "Monica Geller", "Chandler Bing"],
    "The Office": ["Michael Scott", "Dwight Schrute", "Jim Halpert", "Pam Beesly"],
    "Sherlock": ["Sherlock Holmes", "Dr. Watson", "Mycroft Holmes", "Irene Adler"],
    "Standalone": ["Independent Hero 1", "Independent Hero 2", "Independent Hero 3"]
};

// Lifecycle stages
const lifecycleStages = ["incubating", "operational", "end-of-life"];

// Function to determine lifecycle stage based on number of contributors
function determineLifecycleStage(contributors) {
    if (contributors <= 4) {
        return "incubating";
    } else if (contributors >= 5 && contributors <= 12) {
        return "operational";
    } else {
        return "end-of-life";
    }
}

// Function to generate a unique ID (simple incrementing ID)
let projectId = 1;
function generateProjectId() {
    return projectId++;
}

// Function to generate random project data
function generateProject(hero, stackName) {
    const contributors = Math.floor(Math.random() * 16) + 1;
    const languages = getRandomLanguages();
    const lifecycleStage = determineLifecycleStage(contributors);
    const commitCount = Math.floor(Math.random() * 10000) * contributors;

    return {
        id: generateProjectId(),
        name: hero,
        stack_name: stackName,
        languages: languages,
        contributors: contributors,
        lifecycle_stage: lifecycleStage,
        commit_count: commitCount
    };
}

// Function to generate a random set of languages
function getRandomLanguages() {
    const languages = ["Python", "JavaScript", "Rust", "Java", "C#", "Go", "Ruby"];
    const selectedLanguages = [];
    const count = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < count; i++) {
        const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
        if (!selectedLanguages.includes(randomLanguage)) {
            selectedLanguages.push(randomLanguage);
        }
    }

    return selectedLanguages;
}

// Generate a flat array of projects
let projects = [];
Object.keys(tvShows).forEach(show => {
    const heroes = tvShows[show];
    heroes.forEach(hero => {
        projects.push(generateProject(hero, show));
    });
});

// Write to JSON file
console.log(JSON.stringify(projects, null, 2));
