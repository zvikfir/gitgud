import { kpis, policies, badges, lifecycles, userTypes, runtimes } from './schema';

export const seed = {
    kpis: [
  {
    "name": "Security",
    "description": "Security-related measurements"
  },
  {
    "name": "Quality",
    "description": "Code quality measurements"
  },
  {
    "name": "Performance",
    "description": "Performance metrics"
  }
],
    policies: [
  {
    "name": "HTTPS Only",
    "uuid": "https-only",
    "description": "Ensures HTTPS is used",
    "version": "1.0",
    "criteria": {},
    "enabled": true,
    "draft": false,
    "scriptJs": "return true;",
    "ordinal": 100
  }
],
    badges: [
  {
    "name": "Security Champion",
    "description": "All security policies passed",
    "kpiId": 1
  },
  {
    "name": "Quality Master",
    "description": "All quality policies passed",
    "kpiId": 2
  }
],
    lifecycles: [
  {
    "name": "Production",
    "description": "Production applications"
  },
  {
    "name": "Development",
    "description": "Applications in development"
  }
],
    userTypes: [
  {
    "type": "Admin"
  },
  {
    "type": "User"
  }
],
    runtimes: [
  {
    "name": "Node.js",
    "description": "JavaScript runtime"
  },
  {
    "name": "Python",
    "description": "Python runtime"
  },
  {
    "name": "Java",
    "description": "Java runtime"
  }
]
};