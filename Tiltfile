load('ext://helm_resource', 'helm_resource', 'helm_repo')
load('ext://uibutton', 'cmd_button', 'location', 'text_input')

# Add config for frontend mode
config.define_string("frontend_mode", args=False, usage="Mode for frontend deployment (k8s/local)")
config.define_string("backend_mode", args=False, usage="Mode for backend deployment (k8s/local)")
config.define_string('pgadmin_enbaled', args=False, usage="Enable pgadmin deployment (true/false)")
cfg = config.parse()
frontend_mode = cfg.get('frontend_mode', 'local')
backend_mode = cfg.get('backend_mode', 'local')

pgadmin_enabled = cfg.get('pgadmin_enabled', 'false')

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
redis_url = extract_value_from_env('GITGUD_REDIS_URL')
pg_url = extract_value_from_env('GITGUD_PG_URL')
kafka_broker = extract_value_from_env('GITGUD_KAFKA_BROKER')
kafka_username = extract_value_from_env('GITGUD_KAFKA_USERNAME')
kafka_password = extract_value_from_env('GITGUD_KAFKA_PASSWORD')
react_app_base_url = extract_value_from_env('REACT_APP_BASE_URL')

postgres_user = 'admin'
postgres_password = 'admin'
postgres_db_name = 'gitgud'

# helm_repo('bitnami', 'https://charts.bitnami.com/bitnami', labels=['helm'])
helm_repo('kafbat', 'https://ui.charts.kafbat.io', labels=['helm'])
helm_repo('runix', 'https://helm.runix.net/', labels=['helm'])

# update tilt.yaml for backend service
# def update_backend_tilt_yaml(values):
#     for key, value in values.items():
#         local("yq e '" + key + " = \"" + str(value) + "\"' -i backend/config/tilt.yaml")

backend_tilt_yaml_values = {
    '.gitgud.host': "https://" + ngrok_domain,
    '.gitlab.client_id': gitlab_client_id,
    '.gitlab.client_secret': gitlab_client_secret,
    '.gitlab.uri': gitlab_uri,
    '.gitlab.access_token': gitlab_access_token,
    '.postgres.url': "postgresql://" + postgres_user + ":" + postgres_password + "@postgresql:5432/" + postgres_db_name,
    '.openai.api_key': openai_api_token
}

#update_backend_tilt_yaml(backend_tilt_yaml_values)

k8s_yaml(blob('''
apiVersion: v1
kind: Namespace
metadata:
    name: ''' + namespace + '''
'''))

helm_values = [
    '--set=controller.replicaCount=1',
    '--set=extraConfigYaml.auto\\.create\\.topics\\.enable=true',
    '--set=extraConfigYaml.default\\.replication\\.factor=1',
    '--set=extraConfigYaml.offsets\\.topic\\.replication\\.factor=1',
    '--set=extraConfigYaml.transaction\\.state\\.log\\.replication\\.factor=1',
    '--set=listeners.client.protocol=PLAINTEXT',
    '--set=listeners.controller.protocol=PLAINTEXT',
]
helm_resource('kafka', 'oci://registry-1.docker.io/bitnamicharts/kafka', namespace=namespace, flags=helm_values, port_forwards=['9092:9092'], labels=['services'])
helm_values = [
    '--set=yamlApplicationConfig.kafka.clusters[0].name=local',
    '--set=yamlApplicationConfig.kafka.clusters[0].bootstrapServers=kafka:9092'
]
helm_resource('kafka-ui', 'kafbat/kafka-ui', namespace=namespace,resource_deps=['kafbat'], flags=helm_values, port_forwards=['8080:8080'], labels=['services'])
helm_values = [
    '--set=architecture=standalone',
    '--set=auth.enabled=false'
]
helm_resource('redis', 'oci://registry-1.docker.io/bitnamicharts/redis', namespace=namespace, flags=helm_values, port_forwards=['6379:6379'], labels=['services'])

helm_values = [
    '--set=architecture=standalone',
    '--set=auth.username=' + postgres_user,
    '--set=auth.password=' + postgres_password,
    '--set=auth.database=' + postgres_db_name,    
]
helm_resource('postgresql', 'oci://registry-1.docker.io/bitnamicharts/postgresql', namespace=namespace, flags=helm_values, port_forwards=['5432:5432'], labels=['services'])

if pgadmin_enabled == 'true':
  helm_values = [
      '--set=architecture=standalone',
      '--set=env.email=gitgud@gitgud.com',
      '--set=env.password=gitgud',
      '--set=enhanced_cookie_protection=False'
  ]
  helm_resource('pgadmin4', 'runix/pgadmin4', namespace=namespace, resource_deps=['postgresql'], flags=helm_values, port_forwards=['9090:80'], labels=['services'])

if backend_mode == 'k8s':
    docker_build(
        'backend',
        './backend',
        dockerfile='./backend/Dockerfile',
        entrypoint='npm run dev',
        # only='./backend',

        live_update=[
            sync('./backend', '/opt/gitgud/backend'),
            run(
                'cd /opt/gitgud/backend && npm install',
                trigger=['./backend/package.json']
            ),
        ]
    )

    chart_directory = './backend/helm'
    helm_values = [
        '--set=image.repository=gitgud',
        '--set=debug=true',
        '--set=extraEnv[0].name=NODE_CONFIG_ENV',
        '--set=extraEnv[0].value=tilt',
        '--set=extraEnv[1].name=GITGUD_NGROK_DOMAIN',
        '--set=extraEnv[1].value=' + ngrok_domain,
        '--set=extraEnv[2].name=GITGUD_GITLAB_CLIENT_ID',
        '--set=extraEnv[2].value=' + gitlab_client_id,
        '--set=extraEnv[3].name=GITGUD_GITLAB_CLIENT_SECRET',
        '--set=extraEnv[3].value=' + gitlab_client_secret,
        '--set=extraEnv[4].name=GITGUD_GITLAB_ACCESS_TOKEN',
        '--set=extraEnv[4].value=' + gitlab_access_token,
        '--set=extraEnv[5].name=GITGUD_GITLAB_URI',
        '--set=extraEnv[5].value=' + gitlab_uri,
        '--set=extraEnv[6].name=GITGUD_PG_URI',
        '--set=extraEnv[6].value=postgresql://' + postgres_user + ':' + postgres_password + '@postgresql:5432/' + postgres_db_name,
        '--set=extraEnv[6].name=OPENAI_API_KEY',
        '--set=extraEnv[6].value=' + openai_api_token,
        '--set=ingress.hosts[0].host=' + ngrok_domain,
        '--set=ingress.hosts[0].paths[0].path=/api',
        '--set=ingress.hosts[0].paths[0].pathType=Prefix',
        '--set=ingress.hosts[1].host=' + ngrok_domain,
        '--set=ingress.hosts[1].paths[0].path=/gitlab',
        '--set=ingress.hosts[1].paths[0].pathType=Prefix'
    ]
    helm_resource('backend', chart_directory, namespace=namespace, flags=helm_values, image_deps=["backend"], image_keys=[('image.repository', 'image.tag')], labels="gitgud", deps=["policies", "backend", "kafka", "redis"], port_forwards=["3001:3000", "9229:9229"], links=[ngrok_domain])
    print('K8S backend deployment done')
else:
    # Create service for external access
    k8s_yaml (blob("""
apiVersion: v1
kind: Service
metadata:
  name: backend-external-service
spec:
  type: ExternalName
  externalName: host.docker.internal
"""))

    # Create ingress for local backend
    k8s_yaml (blob("""
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-external-ingress
  annotations:
    kubernetes.io/ingress.class: nginx

spec:
  rules:
    - host: """ + ngrok_domain + """
      http:
        paths:
          - path: /gitlab
            pathType: Prefix
            backend:
              service:
                name: backend-external-service
                port:
                  number: 3001  
    - host: """ + ngrok_domain + """
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-external-service
                port:
                  number: 3001
"""))
    local_resource(
        'backend',
        serve_cmd='cd backend && npm run dev',
        #deps=['backend/src'],
        labels="gitgud", 
        links=[ngrok_domain]
    )
    print('Local backend deployment done')

# Frontend handling based on mode
if frontend_mode == 'k8s':
    docker_build(
        'frontend',
        './frontend',
        dockerfile='./frontend/Dockerfile',
        entrypoint='node --max-old-space-size=4096 ./node_modules/.bin/react-scripts start',
        live_update=[
            sync('./frontend', '/opt/gitgud/frontend'),
            run(
                'cd /opt/gitgud/frontend && npm install',
                trigger=['./frontend/package.json', './frontend/package-lock.json']
            ),
        ],
        ignore=[
            './frontend/node_modules',
            './frontend/build',
            '*.test.js',
            '*.test.ts',
            '*.test.tsx'
        ]
    )

    chart_directory = './frontend/helm'
    helm_values = [
        '--set=image.repository=gitgud',
        '--set=debug=true',
        '--set=ingress.hosts[0].host=' + ngrok_domain,
        '--set=ingress.hosts[0].paths[0].path=/',
        '--set=ingress.hosts[0].paths[0].pathType=Prefix'
    ]

    helm_resource('frontend', chart_directory, namespace=namespace, flags=helm_values, image_deps=["frontend"], image_keys=[('image.repository', 'image.tag')], labels="gitgud", deps=["frontend"], port_forwards=["3000:3000"], links=[ngrok_domain])
    print('K8S frontend deployment done')

#
else:
    # Create service for external access
    k8s_yaml (blob("""
apiVersion: v1
kind: Service
metadata:
  name: frontend-external-service
spec:
  type: ExternalName
  externalName: host.docker.internal
"""))

    # Create ingress for local frontend
    k8s_yaml (blob("""
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-external-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: """ + ngrok_domain + """
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-external-service
                port:
                  number: 3000
"""))
    local_resource(
        'frontend',
        serve_cmd='cd frontend && npm start',
        #deps=['frontend/src'],
        labels="gitgud", 
        links=[ngrok_domain]
    )
    print('Local frontend deployment done')

local_resource('ngrok', serve_cmd='ngrok http 80 --log stdout --log-level debug --domain=' + ngrok_domain)


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