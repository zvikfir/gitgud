#!/bin/sh

cat <<EOF > /usr/share/nginx/html/env-config.js
window.REACT_APP_BASE_URL="${REACT_APP_BASE_URL}";
window.REACT_APP_API_SERVER="${REACT_APP_API_SERVER}";
window.PUBLIC_URL="${PUBLIC_URL}";
EOF
