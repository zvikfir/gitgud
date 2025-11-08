load('ext://helm_resource', 'helm_resource', 'helm_repo')
load('ext://uibutton', 'cmd_button', 'location', 'text_input')

def extract_value_from_env(key):
    value = str(local('cat .env | grep -e ^' + key + '= | cut -d"=" -f2')).strip('\n\'')
    os.environ[key] = value
    return value

namespace = 'gitgud'
ngrok_domain = extract_value_from_env('GITGUD_NGROK_DOMAIN')
gitlab_client_id = extract_value_from_env('GITGUD_GITLAB_CLIENT_ID')
gitlab_client_secret = extract_value_from_env('GITGUD_GITLAB_CLIENT_SECRET')
gitlab_uri = extract_value_from_env('GITGUD_GITLAB_URI')
gitlab_access_token = extract_value_from_env('GITGUD_GITLAB_ACCESS_TOKEN')
openai_api_token = extract_value_from_env('GITGUD_OPENAI_API_KEY')
pg_url = extract_value_from_env('GITGUD_PG_URL')
kafka_broker = extract_value_from_env('GITGUD_KAFKA_BROKER')
kafka_username = extract_value_from_env('GITGUD_KAFKA_USERNAME')
kafka_password = extract_value_from_env('GITGUD_KAFKA_PASSWORD')

postgres_user = 'admin'
postgres_password = 'admin'
postgres_db_name = 'gitgud'



docker_compose('docker-compose.yaml')

cmd_button(
    'DB Reset, Migration and Seed',
    argv=[
        'sh', '-c',
        '''
    PGPASSWORD=''' + postgres_password + ''' psql -h localhost -U ''' + postgres_user + ''' -d ''' + postgres_db_name + ''' -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    PGPASSWORD=''' + postgres_password + ''' psql -h localhost -U ''' + postgres_user + ''' -d ''' + postgres_db_name + ''' -c "DROP SCHEMA IF EXISTS drizzle CASCADE;"
    cd backend && NODE_CONFIG_ENV=development npm run migration:migrate && npm run migration:seed
    '''
    ],
    text='DB Reset, Migration and Seed',
    location=location.NAV,
    requires_confirmation=True
)

def update_backend_tilt_yaml(values):
    for key, value in values.items():
        local("touch backend/config/tilt.yaml && yq e '" + key + " = \"" + str(value) + "\"' -i backend/config/tilt.yaml")

def create_backend():
  backend_tilt_yaml_values = {
    '.gitgud.host': "http://localhost:3001",
    '.gitlab.client_id': gitlab_client_id,
    '.gitlab.client_secret': gitlab_client_secret,
    '.gitlab.uri': gitlab_uri,
    '.gitlab.access_token': gitlab_access_token,
    '.postgres.url': "postgresql://" + postgres_user + ":" + postgres_password + "@postgresql:5432/" + postgres_db_name,
    '.openai.api_key': openai_api_token
  }

  update_backend_tilt_yaml(backend_tilt_yaml_values)

  local_resource(
    'backend',
    cmd='cd backend && npm install && npm run migration:migrate && npm run db:seed:generate && npm run migration:seed',
    deps=['backend/'],
    ignore=['backend/node_modules', 'backend/package-lock.json', 'backend/migrations/seed.ts', 'backend/src/data/seed-data.json'],
    resource_deps=['kafka', 'postgres'],
    serve_cmd='cd backend && NODE_CONFIG_ENV=tilt npm run dev',
    links=['http://localhost:3001']
  )

def create_frontend():
  local_resource(
    'frontend',
    cmd='cd frontend && npm install',
    deps=['frontend/'],
    ignore=['frontend/node_modules', 'frontend/package-lock.json'],
    serve_cmd='cd frontend && BROWSER=none npm start',
    links=['http://localhost:3000']
  )


create_backend()
create_frontend()