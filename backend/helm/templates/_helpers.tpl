{{/*
Expand the name of the chart.
*/}}
{{- define "gitgud.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "gitgud.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" $name .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create chart labels.
*/}}
{{- define "gitgud.labels" -}}
helm.sh/chart: {{ include "gitgud.chart" . }}
app.kubernetes.io/name: {{ include "gitgud.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Create chart selector labels.
*/}}
{{- define "gitgud.selectorLabels" -}}
app.kubernetes.io/name: {{ include "gitgud.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Get the Chart version.
*/}}
{{- define "gitgud.chart" -}}
{{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}
