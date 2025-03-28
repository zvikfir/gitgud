class Project {
  id: number;
  externalId: number;
  webhookId: number;
  name: string;
  description: string;
  pathWithNamespace: string;
  webUrl: string;
  tags: string[];
  createdAt: Date;
  lifecycleId: number;
  languages: string[];
  stacks: string[];
  runtimes: string[];
  owners: string[];
  policies: any;
}

export { Project };